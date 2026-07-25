export type ReconciledHypothesisStatus = 'OPEN' | 'CONFIRMED' | 'REJECTED';

export type ReconciliationEvidence = {
  assessmentItemId: string | null;
  score: number;
  weight: number;
  independenceKey: string;
  source: string;
};

export const reconcileHypothesisStatus = ({
  type,
  sourceItemId,
  evidence,
}: {
  type: string;
  sourceItemId: string | null;
  evidence: ReconciliationEvidence[];
}): ReconciledHypothesisStatus => {
  const independentCount = new Set(evidence.map((item) => item.independenceKey))
    .size;
  const negativeCount = evidence.filter(
    (item) => item.score < 0.5 && item.weight >= 0.3,
  ).length;
  const positiveSourceCount = new Set(
    evidence
      .filter((item) => item.score >= 0.8 && item.weight >= 0.3)
      .map((item) => item.source),
  ).size;
  const followUpEvidence = evidence.filter(
    (item) => item.assessmentItemId !== sourceItemId,
  );
  const positiveFollowUp = followUpEvidence.some(
    (item) => item.score >= 0.8 && item.weight >= 0.3,
  );
  const negativeFollowUp = followUpEvidence.some(
    (item) => item.score < 0.5 && item.weight >= 0.3,
  );

  if (type === 'POSSIBLE_GUESS') {
    if (positiveFollowUp) {
      return 'REJECTED';
    }

    if (negativeFollowUp) {
      return 'CONFIRMED';
    }

    return 'OPEN';
  }

  if (type === 'TIME_PRESSURE') {
    if (positiveFollowUp) {
      return 'CONFIRMED';
    }

    if (negativeFollowUp) {
      return 'REJECTED';
    }

    return 'OPEN';
  }

  if (negativeCount >= 2 && independentCount >= 2) {
    return 'CONFIRMED';
  }

  if (positiveSourceCount >= 2 && independentCount >= 2) {
    return 'REJECTED';
  }

  return 'OPEN';
};
