import { INITIAL_DIAGNOSTIC_POLICY } from './diagnostic-policy';

export type AdaptiveHypothesis = {
  key: string;
  type:
    | 'SKILL_GAP'
    | 'PREREQUISITE_GAP'
    | 'COMPUTATION_ERROR'
    | 'MISREAD_CONDITION'
    | 'TIME_PRESSURE'
    | 'CARELESSNESS'
    | 'UNSTUDIED'
    | 'POSSIBLE_GUESS';
  skillCode: string | null;
  confidence: number;
  priority: number;
};

export type AdaptiveCandidate = {
  id: string;
  kind: 'ADAPTIVE_TASK' | 'THEORY_SHORT' | 'THEORY_CHOICE';
  targetSkillCode: string;
  hypothesisType: AdaptiveHypothesis['type'];
  difficulty: number;
  estimatedSeconds: number;
  importance: number;
};

export type AdaptiveSelectionContext = {
  answeredCandidateIds: string[];
  questionsBySkill: Record<string, number>;
  selectedTotal: number;
  selectedTheory: number;
};

const hypothesisTypeWeight: Record<AdaptiveHypothesis['type'], number> = {
  PREREQUISITE_GAP: 1.25,
  SKILL_GAP: 1.1,
  POSSIBLE_GUESS: 1,
  UNSTUDIED: 0.8,
  COMPUTATION_ERROR: 0.75,
  MISREAD_CONDITION: 0.7,
  CARELESSNESS: 0.55,
  TIME_PRESSURE: 0,
};

export const selectNextAdaptiveCandidate = (
  hypotheses: AdaptiveHypothesis[],
  candidates: AdaptiveCandidate[],
  context: AdaptiveSelectionContext,
) => {
  if (
    context.selectedTotal >= INITIAL_DIAGNOSTIC_POLICY.adaptiveMaximumQuestions
  ) {
    return null;
  }

  const answered = new Set(context.answeredCandidateIds);
  const ranked = candidates
    .filter((candidate) => !answered.has(candidate.id))
    .filter(
      (candidate) =>
        (context.questionsBySkill[candidate.targetSkillCode] ?? 0) <
        INITIAL_DIAGNOSTIC_POLICY.maximumQuestionsPerSkill,
    )
    .filter(
      (candidate) =>
        candidate.kind === 'ADAPTIVE_TASK' ||
        context.selectedTheory <
          INITIAL_DIAGNOSTIC_POLICY.theoryMaximumQuestions,
    )
    .flatMap((candidate) =>
      hypotheses
        .filter(
          (hypothesis) =>
            hypothesis.skillCode === candidate.targetSkillCode &&
            (hypothesis.type === candidate.hypothesisType ||
              candidate.hypothesisType === 'SKILL_GAP'),
        )
        .map((hypothesis) => {
          const uncertainty = 1 - Math.abs(hypothesis.confidence - 0.5);
          const typeWeight = hypothesisTypeWeight[hypothesis.type];
          const timeCost = Math.max(45, candidate.estimatedSeconds) / 60;
          const difficultyFit =
            1 - Math.min(0.5, Math.abs(candidate.difficulty - 2) * 0.1);
          const score =
            (hypothesis.priority *
              uncertainty *
              typeWeight *
              candidate.importance *
              difficultyFit) /
            timeCost;

          return {
            candidate,
            hypothesisKey: hypothesis.key,
            score,
          };
        }),
    )
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.candidate.estimatedSeconds - right.candidate.estimatedSeconds ||
        left.candidate.id.localeCompare(right.candidate.id),
    );

  return ranked[0] ?? null;
};
