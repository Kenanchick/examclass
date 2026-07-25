import { INITIAL_DIAGNOSTIC_POLICY } from './diagnostic-policy';

export type AnalysisSkillRole = 'PRIMARY' | 'SECONDARY' | 'PREREQUISITE';
export type AnalysisEvidenceSource =
  | 'FULL_EXAM'
  | 'ADAPTIVE_TASK'
  | 'THEORY_QUESTION'
  | 'MANUAL_REVIEW'
  | 'SELF_REPORT';
export type AnalysisHypothesisType =
  | 'SKILL_GAP'
  | 'PREREQUISITE_GAP'
  | 'COMPUTATION_ERROR'
  | 'MISREAD_CONDITION'
  | 'TIME_PRESSURE'
  | 'CARELESSNESS'
  | 'UNSTUDIED'
  | 'POSSIBLE_GUESS';
export type AnalysisReviewErrorType =
  | 'NONE'
  | 'COMPUTATION'
  | 'CONCEPTUAL'
  | 'MODELING'
  | 'LOGIC'
  | 'NOTATION'
  | 'INCOMPLETE'
  | 'MISREAD_CONDITION';

export type AttemptSkillLink = {
  skillCode: string;
  role: AnalysisSkillRole;
  weight: number;
};

export type AttemptAnalysisInput = {
  itemKey: string;
  source: AnalysisEvidenceSource;
  outcome:
    | 'CORRECT'
    | 'INCORRECT'
    | 'PARTIAL'
    | 'SKIPPED'
    | 'UNSTUDIED'
    | 'NOT_REACHED'
    | 'AWAITING_REVIEW';
  activeSeconds: number;
  expectedSeconds: number;
  remainingSessionSeconds: number;
  confidence?: number | null;
  answerChanges?: number;
  hasVisibleWork?: boolean;
  scoreRatio?: number | null;
  reviewErrorType?: AnalysisReviewErrorType | null;
  skillLinks: AttemptSkillLink[];
};

export type EvidenceDraft = {
  skillCode: string;
  source: AnalysisEvidenceSource;
  score: number;
  weight: number;
  independenceKey: string;
  reason: string;
};

export type HypothesisDraft = {
  key: string;
  skillCode: string | null;
  type: AnalysisHypothesisType;
  confidence: number;
  priority: number;
  rationale: string;
};

export type AttemptAnalysis = {
  evidence: EvidenceDraft[];
  hypotheses: HypothesisDraft[];
};

const roleWeight: Record<AnalysisSkillRole, number> = {
  PRIMARY: 1,
  SECONDARY: 0.65,
  PREREQUISITE: 0.45,
};

const bounded = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const skillHypothesis = (
  itemKey: string,
  link: AttemptSkillLink,
): HypothesisDraft => ({
  key: `${link.role === 'PREREQUISITE' ? 'prerequisite' : 'skill'}:${link.skillCode}`,
  skillCode: link.skillCode,
  type: link.role === 'PREREQUISITE' ? 'PREREQUISITE_GAP' : 'SKILL_GAP',
  confidence: link.role === 'PRIMARY' ? 0.62 : 0.5,
  priority: link.role === 'PREREQUISITE' ? 0.9 : 0.72,
  rationale:
    link.role === 'PREREQUISITE'
      ? `Ошибка в ${itemKey} может быть вызвана обязательной предпосылкой`
      : `Ошибка в ${itemKey} затрагивает проверяемый навык`,
});

export const analyzeAttempt = (
  input: AttemptAnalysisInput,
): AttemptAnalysis => {
  const evidence: EvidenceDraft[] = [];
  const hypotheses: HypothesisDraft[] = [];
  const expectedSeconds = Math.max(1, input.expectedSeconds);
  const timeRatio = input.activeSeconds / expectedSeconds;
  const primaryLinks = input.skillLinks.filter(
    (link) => link.role === 'PRIMARY',
  );

  if (input.outcome === 'NOT_REACHED') {
    hypotheses.push({
      key: 'global:time-pressure',
      skillCode: null,
      type: 'TIME_PRESSURE',
      confidence: input.remainingSessionSeconds <= 0 ? 0.9 : 0.55,
      priority: 0.9,
      rationale:
        'Задание не было достигнуто; это не считается доказательством незнания',
    });
    hypotheses.push(
      ...primaryLinks.map((link) => ({
        key: `time:${link.skillCode}`,
        skillCode: link.skillCode,
        type: 'TIME_PRESSURE' as const,
        confidence: 0.7,
        priority: 0.52,
        rationale:
          'Короткая проверка без общего таймера должна отделить нехватку времени от пробела в навыке',
      })),
    );

    return { evidence, hypotheses };
  }

  if (input.outcome === 'AWAITING_REVIEW') {
    return { evidence, hypotheses };
  }

  if (input.outcome === 'UNSTUDIED') {
    for (const link of input.skillLinks) {
      evidence.push({
        skillCode: link.skillCode,
        source: 'SELF_REPORT',
        score: 0,
        weight: 0.1,
        independenceKey: `${input.itemKey}:${link.skillCode}`,
        reason: 'Ученик явно отметил, что материал ещё не изучался',
      });
      hypotheses.push({
        key: `unstudied:${link.skillCode}`,
        skillCode: link.skillCode,
        type: 'UNSTUDIED',
        confidence: 0.95,
        priority: 0.8,
        rationale:
          'Явная самооценка ученика требует одного мягкого подтверждения',
      });
    }

    return { evidence, hypotheses };
  }

  const possibleGuess =
    input.outcome === 'CORRECT' &&
    timeRatio < INITIAL_DIAGNOSTIC_POLICY.possibleGuessTimeRatio &&
    (input.confidence ?? 3) <= 2 &&
    !input.hasVisibleWork;
  const rushedByTime =
    input.outcome !== 'CORRECT' &&
    timeRatio < INITIAL_DIAGNOSTIC_POLICY.rushedAttemptTimeRatio &&
    input.remainingSessionSeconds <= 0;
  const score =
    input.outcome === 'CORRECT'
      ? 1
      : input.outcome === 'PARTIAL'
        ? bounded(input.scoreRatio ?? 0.5)
        : 0;

  for (const link of input.skillLinks) {
    const baseWeight = bounded(link.weight) * roleWeight[link.role];
    const adjustedWeight = possibleGuess
      ? baseWeight * 0.35
      : rushedByTime
        ? baseWeight * 0.15
        : input.outcome === 'SKIPPED'
          ? baseWeight * 0.3
          : baseWeight;

    evidence.push({
      skillCode: link.skillCode,
      source: input.source,
      score,
      weight: adjustedWeight,
      independenceKey: `${input.itemKey}:${link.skillCode}`,
      reason: possibleGuess
        ? 'Правильный ответ имеет сниженный вес из-за признаков возможного угадывания'
        : rushedByTime
          ? 'Ошибка при исчерпанном времени имеет минимальный диагностический вес'
          : `Результат ${input.outcome.toLowerCase()} по связи ${link.role.toLowerCase()}`,
    });
  }

  if (possibleGuess) {
    for (const link of primaryLinks) {
      hypotheses.push({
        key: `guess:${link.skillCode}`,
        skillCode: link.skillCode,
        type: 'POSSIBLE_GUESS',
        confidence: 0.62,
        priority: 0.58,
        rationale:
          'Ответ верный, но дан существенно быстрее ожидаемого при низкой уверенности и без решения',
      });
    }
  }

  if (rushedByTime) {
    hypotheses.push({
      key: 'global:time-pressure',
      skillCode: null,
      type: 'TIME_PRESSURE',
      confidence: 0.82,
      priority: 0.88,
      rationale:
        'Ошибка произошла после исчерпания времени и не должна автоматически трактоваться как пробел',
    });
  } else if (
    input.outcome === 'INCORRECT' ||
    input.outcome === 'SKIPPED' ||
    input.outcome === 'PARTIAL'
  ) {
    hypotheses.push(
      ...input.skillLinks.map((link) => skillHypothesis(input.itemKey, link)),
    );
  }

  if (input.reviewErrorType === 'COMPUTATION') {
    hypotheses.push({
      key: `computation:${primaryLinks[0]?.skillCode ?? 'global'}`,
      skillCode: primaryLinks[0]?.skillCode ?? null,
      type: 'COMPUTATION_ERROR',
      confidence: 0.95,
      priority: 0.7,
      rationale:
        'Проверяющий подтвердил правильный способ и вычислительную ошибку',
    });
  }

  if (input.reviewErrorType === 'MISREAD_CONDITION') {
    hypotheses.push({
      key: `misread:${primaryLinks[0]?.skillCode ?? 'global'}`,
      skillCode: primaryLinks[0]?.skillCode ?? null,
      type: 'MISREAD_CONDITION',
      confidence: 0.95,
      priority: 0.7,
      rationale: 'Проверяющий подтвердил неверное чтение условия',
    });
  }

  if (
    input.outcome === 'INCORRECT' &&
    (input.answerChanges ?? 0) >= 3 &&
    timeRatio < 0.5
  ) {
    hypotheses.push({
      key: `carelessness:${primaryLinks[0]?.skillCode ?? 'global'}`,
      skillCode: primaryLinks[0]?.skillCode ?? null,
      type: 'CARELESSNESS',
      confidence: 0.45,
      priority: 0.4,
      rationale:
        'Несколько быстрых изменений ответа допускают невнимательность, но не подтверждают её',
    });
  }

  return { evidence, hypotheses };
};
