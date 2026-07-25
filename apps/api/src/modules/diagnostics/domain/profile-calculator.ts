import { INITIAL_DIAGNOSTIC_POLICY } from './diagnostic-policy';

export type ProfileEvidence = {
  skillCode: string;
  source:
    | 'FULL_EXAM'
    | 'ADAPTIVE_TASK'
    | 'THEORY_QUESTION'
    | 'MANUAL_REVIEW'
    | 'SELF_REPORT';
  score: number;
  weight: number;
  independenceKey: string;
  occurredAt: Date;
};

export type CalculatedSkillState = {
  skillCode: string;
  mastery: number;
  confidence: number;
  evidenceWeight: number;
  evidenceCount: number;
  distinctEvidenceCount: number;
  status: 'UNKNOWN' | 'UNSTUDIED' | 'GAP' | 'DEVELOPING' | 'MASTERED';
  lastEvidenceAt: Date | null;
};

const round = (value: number) => Math.round(value * 10_000) / 10_000;

export const calculateInitialProfile = (
  skillCodes: string[],
  evidence: ProfileEvidence[],
): CalculatedSkillState[] => {
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
    const evidenceWeight = measuredEvidence.reduce(
      (sum, item) => sum + item.weight,
      0,
    );
    const alpha =
      1 +
      measuredEvidence.reduce((sum, item) => sum + item.weight * item.score, 0);
    const beta =
      1 +
      measuredEvidence.reduce(
        (sum, item) => sum + item.weight * (1 - item.score),
        0,
      );
    const distinctEvidenceCount = new Set(
      measuredEvidence.map((item) => item.independenceKey),
    ).size;
    const sourceCount = new Set(measuredEvidence.map((item) => item.source))
      .size;
    const evidenceSaturation = 1 - Math.exp(-evidenceWeight / 1.5);
    const distinctFactor = Math.min(1, 0.45 + distinctEvidenceCount * 0.2);
    const sourceDiversityFactor = Math.min(1, 0.7 + sourceCount * 0.15);
    const mastery = alpha / (alpha + beta);
    const confidence =
      measuredEvidence.length === 0
        ? 0
        : evidenceSaturation * distinctFactor * sourceDiversityFactor;
    let status: CalculatedSkillState['status'] = 'UNKNOWN';

    if (measuredEvidence.length === 0 && selfReportedUnstudied) {
      status = 'UNSTUDIED';
    } else if (
      distinctEvidenceCount <
        INITIAL_DIAGNOSTIC_POLICY.minimumIndependentEvidence ||
      confidence < INITIAL_DIAGNOSTIC_POLICY.conclusionConfidenceThreshold
    ) {
      status = 'UNKNOWN';
    } else if (mastery < INITIAL_DIAGNOSTIC_POLICY.gapMasteryThreshold) {
      status = 'GAP';
    } else if (
      mastery >= INITIAL_DIAGNOSTIC_POLICY.masteredMasteryThreshold &&
      confidence >= INITIAL_DIAGNOSTIC_POLICY.masteredConfidenceThreshold &&
      distinctEvidenceCount >=
        INITIAL_DIAGNOSTIC_POLICY.masteredIndependentEvidence
    ) {
      status = 'MASTERED';
    } else {
      status = 'DEVELOPING';
    }

    return {
      skillCode,
      mastery: round(mastery),
      confidence: round(confidence),
      evidenceWeight: round(evidenceWeight),
      evidenceCount: measuredEvidence.length,
      distinctEvidenceCount,
      status,
      lastEvidenceAt:
        measuredEvidence
          .map((item) => item.occurredAt)
          .sort((left, right) => right.getTime() - left.getTime())[0] ?? null,
    };
  });
};
