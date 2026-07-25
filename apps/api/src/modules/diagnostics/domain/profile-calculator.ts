import {
  bounded,
  DAY_MS,
  getEvidenceFactors,
  getReviewIntervalDays,
  getSpeedScore,
  KNOWLEDGE_PROFILE_FORMULA_VERSION,
  round,
} from './profile-factors';
import type {
  CalculatedSkillState,
  KnowledgeProfileStatus,
  ProfileEvidence,
  SourceSummary,
} from './profile-types';

export type {
  CalculatedSkillState,
  KnowledgeProfileStatus,
  ProfileEvidence,
  ProfileEvidenceSource,
} from './profile-types';

export const calculateKnowledgeProfile = ({
  skillCodes,
  evidence,
  asOf = new Date(),
}: {
  skillCodes: string[];
  evidence: ProfileEvidence[];
  asOf?: Date;
}): CalculatedSkillState[] => {
  const bySkill = new Map<string, ProfileEvidence[]>();

  for (const item of evidence) {
    const current = bySkill.get(item.skillCode) ?? [];
    current.push(item);
    bySkill.set(item.skillCode, current);
  }

  return skillCodes.map((skillCode) => {
    const skillEvidence = bySkill.get(skillCode) ?? [];
    const measuredEvidence = skillEvidence.filter(
      (item) => item.source !== 'SELF_REPORT' && item.weight > 0,
    );
    const selfReportedUnstudied = skillEvidence.some(
      (item) => item.source === 'SELF_REPORT',
    );
    const allWeighted = skillEvidence.map((item) => {
      const factors = getEvidenceFactors(item, asOf);
      const effectiveWeight =
        item.weight *
        Object.values(factors).reduce((product, factor) => product * factor, 1);

      return {
        item,
        factors,
        effectiveWeight,
        speed: getSpeedScore(item),
      };
    });
    const weighted = allWeighted.filter(
      ({ item }) => item.source !== 'SELF_REPORT' && item.weight > 0,
    );
    const evidenceWeight = weighted.reduce(
      (sum, item) => sum + item.effectiveWeight,
      0,
    );
    const alpha =
      1 +
      weighted.reduce(
        (sum, item) => sum + item.effectiveWeight * bounded(item.item.score),
        0,
      );
    const beta =
      1 +
      weighted.reduce(
        (sum, item) =>
          sum + item.effectiveWeight * (1 - bounded(item.item.score)),
        0,
      );
    const mastery = alpha / (alpha + beta);
    const distinctEvidenceCount = new Set(
      measuredEvidence.map((item) => item.independenceKey),
    ).size;
    const sourceCount = new Set(measuredEvidence.map((item) => item.source))
      .size;
    const evidenceSaturation = 1 - Math.exp(-evidenceWeight / 2.4);
    const distinctFactor = Math.min(1, 0.35 + distinctEvidenceCount * 0.16);
    const sourceDiversityFactor = Math.min(1, 0.75 + sourceCount * 0.1);
    const teacherConfirmedAt =
      measuredEvidence
        .filter((item) => item.teacherConfirmed)
        .map((item) => item.occurredAt)
        .sort((left, right) => right.getTime() - left.getTime())[0] ?? null;
    const confidence = Math.min(
      1,
      evidenceSaturation * distinctFactor * sourceDiversityFactor +
        (teacherConfirmedAt ? 0.08 : 0),
    );
    const confirmingAttempts = new Set(
      weighted
        .filter(
          ({ item, effectiveWeight }) =>
            item.score >= 0.7 && effectiveWeight >= 0.25,
        )
        .map(({ item }) => item.independenceKey),
    ).size;
    const contradictingAttempts = new Set(
      weighted
        .filter(
          ({ item, effectiveWeight }) =>
            item.score < 0.4 && effectiveWeight >= 0.25,
        )
        .map(({ item }) => item.independenceKey),
    ).size;
    const observedWeight = weighted.reduce(
      (sum, item) => sum + item.effectiveWeight,
      0,
    );
    const observedMean =
      observedWeight > 0
        ? weighted.reduce(
            (sum, item) =>
              sum + item.effectiveWeight * bounded(item.item.score),
            0,
          ) / observedWeight
        : 0.5;
    const variance =
      observedWeight > 0
        ? weighted.reduce(
            (sum, item) =>
              sum +
              item.effectiveWeight *
                (bounded(item.item.score) - observedMean) ** 2,
            0,
          ) / observedWeight
        : 0;
    const stability =
      distinctEvidenceCount < 2
        ? null
        : bounded(
            (1 - Math.min(1, Math.sqrt(variance) / 0.5)) *
              Math.min(1, distinctEvidenceCount / 4),
          );
    const speedEvidence = weighted.filter(
      (
        item,
      ): item is typeof item & {
        speed: number;
      } => item.speed !== null,
    );
    const speedWeight = speedEvidence.reduce(
      (sum, item) => sum + item.effectiveWeight,
      0,
    );
    const speed =
      speedWeight > 0
        ? speedEvidence.reduce(
            (sum, item) => sum + item.speed * item.effectiveWeight,
            0,
          ) / speedWeight
        : null;
    const lastEvidenceAt =
      skillEvidence
        .map((item) => item.occurredAt)
        .sort((left, right) => right.getTime() - left.getTime())[0] ?? null;
    const lastVerifiedAt =
      measuredEvidence
        .map((item) => item.occurredAt)
        .sort((left, right) => right.getTime() - left.getTime())[0] ?? null;
    const reviewDueAt =
      lastVerifiedAt && mastery >= 0.6
        ? new Date(
            lastVerifiedAt.getTime() +
              getReviewIntervalDays(mastery, stability) * DAY_MS,
          )
        : null;
    const needsReview = Boolean(
      reviewDueAt && reviewDueAt.getTime() <= asOf.getTime(),
    );
    const contradictionAfterTeacherConfirmation = Boolean(
      teacherConfirmedAt &&
      measuredEvidence.some(
        (item) => item.occurredAt > teacherConfirmedAt && item.score < 0.4,
      ),
    );
    const recentTeacherConfirmation = Boolean(
      teacherConfirmedAt &&
      asOf.getTime() - teacherConfirmedAt.getTime() <= 45 * DAY_MS &&
      !contradictionAfterTeacherConfirmation,
    );
    const reasons: string[] = [];
    const status = getStatus({
      measuredCount: measuredEvidence.length,
      selfReportedUnstudied,
      distinctEvidenceCount,
      confidence,
      mastery,
      stability,
      needsReview,
      recentTeacherConfirmation,
      reasons,
    });
    const sourceSummary = createSourceSummary(allWeighted);
    const averageFactors = createAverageFactors(weighted);

    return {
      skillCode,
      mastery: round(mastery),
      confidence: round(confidence),
      speed: speed === null ? null : round(speed),
      stability: stability === null ? null : round(stability),
      evidenceWeight: round(evidenceWeight),
      evidenceCount: measuredEvidence.length,
      distinctEvidenceCount,
      confirmingAttempts,
      contradictingAttempts,
      status,
      lastEvidenceAt,
      lastVerifiedAt,
      reviewDueAt,
      needsReview,
      teacherConfirmedAt,
      sourceSummary,
      explanation: {
        formulaVersion: KNOWLEDGE_PROFILE_FORMULA_VERSION,
        prior: { alpha: 1, beta: 1 },
        effectiveWeight: round(evidenceWeight),
        averageFactors,
        roleSummary: measuredEvidence.reduce<Record<string, number>>(
          (summary, item) => {
            const role = item.skillRole ?? 'UNKNOWN';
            summary[role] = (summary[role] ?? 0) + 1;
            return summary;
          },
          {},
        ),
        thresholds: {
          minimumIndependentAttempts: 2,
          minimumConclusionConfidence: 0.45,
          weakBelow: 0.45,
          reinforcementBelow: 0.8,
          stableFrom: 0.7,
        },
        reasons,
      },
    };
  });
};

const getStatus = ({
  measuredCount,
  selfReportedUnstudied,
  distinctEvidenceCount,
  confidence,
  mastery,
  stability,
  needsReview,
  recentTeacherConfirmation,
  reasons,
}: {
  measuredCount: number;
  selfReportedUnstudied: boolean;
  distinctEvidenceCount: number;
  confidence: number;
  mastery: number;
  stability: number | null;
  needsReview: boolean;
  recentTeacherConfirmation: boolean;
  reasons: string[];
}): KnowledgeProfileStatus => {
  if (measuredCount === 0 && selfReportedUnstudied) {
    reasons.push('Есть только самооценка ученика «ещё не изучалось»');
    return 'UNSTUDIED';
  }

  if (distinctEvidenceCount < 2 || confidence < 0.45) {
    reasons.push('Нужно минимум две независимые попытки и уверенность 0,45');
    return 'INSUFFICIENT_DATA';
  }

  if (needsReview) {
    reasons.push('Истёк интервал повторения после последней проверки');
    return 'NEEDS_REVIEW';
  }

  if (recentTeacherConfirmation && mastery >= 0.65) {
    reasons.push('Результат недавно подтверждён преподавателем');
    return 'TEACHER_CONFIRMED';
  }

  if (mastery < 0.45) {
    reasons.push('Оценка владения ниже 0,45 при достаточных данных');
    return 'WEAK';
  }

  if (mastery < 0.65) {
    reasons.push('Навык находится в процессе изучения');
    return 'LEARNING';
  }

  if (mastery < 0.8 || stability === null || stability < 0.7) {
    reasons.push('Уровень или стабильность пока недостаточны для освоения');
    return 'NEEDS_REINFORCEMENT';
  }

  reasons.push('Высокий уровень подтверждён стабильными попытками');
  return 'MASTERED';
};

type WeightedEvidence = {
  item: ProfileEvidence;
  factors: ReturnType<typeof getEvidenceFactors>;
  effectiveWeight: number;
  speed: number | null;
};

const createSourceSummary = (weighted: WeightedEvidence[]) => {
  const summary = weighted.reduce<SourceSummary>((result, item) => {
    const current = result[item.item.source];
    const occurredAt = item.item.occurredAt.toISOString();

    result[item.item.source] = {
      attempts: (current?.attempts ?? 0) + 1,
      effectiveWeight: (current?.effectiveWeight ?? 0) + item.effectiveWeight,
      lastAt:
        !current || occurredAt > current.lastAt ? occurredAt : current.lastAt,
    };

    return result;
  }, {});

  for (const source of Object.values(summary)) {
    source.effectiveWeight = round(source.effectiveWeight);
  }

  return summary;
};

const createAverageFactors = (weighted: WeightedEvidence[]) => {
  const averages = Object.keys(weighted[0]?.factors ?? {}).reduce<
    Record<string, number>
  >((result, key) => {
    result[key] =
      weighted.length === 0
        ? 0
        : round(
            weighted.reduce(
              (sum, item) =>
                sum + item.factors[key as keyof typeof item.factors],
              0,
            ) / weighted.length,
          );

    return result;
  }, {});

  averages.baseSkillWeight =
    weighted.length === 0
      ? 0
      : round(
          weighted.reduce((sum, item) => sum + item.item.weight, 0) /
            weighted.length,
        );

  return averages;
};
