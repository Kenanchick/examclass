import {
  DAY_MS,
  getFactors,
  getPriority,
  isMastered,
  isPrerequisiteReady,
  LEARNING_ROUTE_ALGORITHM_VERSION,
  round,
} from './route-policy';
import { getReachBySkill, orderRouteModules } from './route-graph';
import {
  averageFactors,
  getCompletionCriteria,
  getModuleTitle,
  getModuleType,
  getPlannedMinutes,
  getReason,
  getTargets,
  moduleIsCompleted,
  type RouteCandidate,
} from './route-module-policy';
import type {
  BuildLearningRouteInput,
  LearningRoutePlan,
  PlannedRouteModule,
  RouteDependency,
  RouteSkill,
  RouteTeacherAssignment,
} from './route-types';

export const buildLearningRoute = (
  input: BuildLearningRouteInput,
): LearningRoutePlan => {
  const asOf = input.asOf ?? new Date();
  if (input.goal.examDate <= asOf || input.goal.weeklyMinutes <= 0) {
    throw new Error(
      'Для маршрута нужны будущая дата экзамена и доступное время',
    );
  }

  const skillByCode = new Map(input.skills.map((skill) => [skill.code, skill]));
  const dependenciesBySkill = new Map<string, RouteDependency[]>();
  for (const dependency of input.dependencies) {
    dependenciesBySkill.set(dependency.skillCode, [
      ...(dependenciesBySkill.get(dependency.skillCode) ?? []),
      dependency,
    ]);
  }

  const assignmentsBySkill = new Map<string, RouteTeacherAssignment[]>();
  for (const assignment of input.teacherAssignments ?? []) {
    assignmentsBySkill.set(assignment.skillCode, [
      ...(assignmentsBySkill.get(assignment.skillCode) ?? []),
      assignment,
    ]);
  }

  const weeksUntilExam = Math.max(
    1 / 7,
    (input.goal.examDate.getTime() - asOf.getTime()) / (7 * DAY_MS),
  );
  const horizonWeeks = Math.max(1, Math.min(6, Math.ceil(weeksUntilExam)));
  const availableMinutes = Math.round(input.goal.weeklyMinutes * horizonWeeks);
  const reachBySkill = getReachBySkill(
    input.skills.map((skill) => skill.code),
    input.dependencies,
  );
  const scored = new Map(
    input.skills.map((skill) => {
      const factors = getFactors({
        skill,
        targetScore: input.goal.targetScore,
        weeksUntilExam,
        prerequisiteReach: reachBySkill.get(skill.code) ?? 0,
        teacherAssigned: assignmentsBySkill.has(skill.code),
      });

      return [skill.code, { skill, factors, priority: getPriority(factors) }];
    }),
  );
  const eligible = [...scored.values()]
    .filter(
      ({ skill }) =>
        assignmentsBySkill.has(skill.code) ||
        skill.state.needsReview ||
        !isMastered(skill.state),
    )
    .sort(
      (left, right) =>
        right.priority - left.priority ||
        left.skill.code.localeCompare(right.skill.code),
    );
  const seedLimit =
    input.goal.targetScore >= 90 ? 10 : input.goal.targetScore >= 70 ? 8 : 6;
  const seeds = [
    ...eligible.filter(({ skill }) => assignmentsBySkill.has(skill.code)),
    ...eligible.filter(({ skill }) => !assignmentsBySkill.has(skill.code)),
  ].filter(
    (candidate, index, candidates) =>
      candidates.findIndex(
        (current) => current.skill.code === candidate.skill.code,
      ) === index,
  );
  const selectedSeeds = seeds.slice(
    0,
    Math.max(seedLimit, assignmentsBySkill.size),
  );
  const included = new Set<string>();
  const forcedPrerequisites = new Set<string>();
  const recommendedSupport = new Set<string>();

  const includeRequiredClosure = (code: string, forced = false) => {
    if (forced) {
      forcedPrerequisites.add(code);
    }
    if (included.has(code)) {
      return;
    }

    included.add(code);
    for (const dependency of dependenciesBySkill.get(code) ?? []) {
      if (dependency.type !== 'REQUIRED') {
        continue;
      }
      const prerequisite = skillByCode.get(dependency.prerequisiteCode);
      if (prerequisite && !isPrerequisiteReady(prerequisite.state)) {
        includeRequiredClosure(prerequisite.code, true);
      }
    }
  };

  selectedSeeds.forEach(({ skill }) => includeRequiredClosure(skill.code));

  if (weeksUntilExam > 4) {
    const recommendedCandidates = selectedSeeds
      .flatMap(({ skill }) =>
        (dependenciesBySkill.get(skill.code) ?? []).filter(
          (dependency) => dependency.type === 'RECOMMENDED',
        ),
      )
      .map((dependency) => skillByCode.get(dependency.prerequisiteCode))
      .filter((skill): skill is RouteSkill =>
        Boolean(skill && !isPrerequisiteReady(skill.state)),
      )
      .sort(
        (left, right) =>
          (scored.get(right.code)?.priority ?? 0) -
          (scored.get(left.code)?.priority ?? 0),
      )
      .slice(0, 2);

    for (const skill of recommendedCandidates) {
      recommendedSupport.add(skill.code);
      includeRequiredClosure(skill.code);
    }
  }

  const candidates: RouteCandidate[] = [...included].flatMap((code) => {
    const scoredSkill = scored.get(code);
    if (!scoredSkill) {
      return [];
    }

    const teacherAssignments = assignmentsBySkill.get(code) ?? [];
    const teacherAssignmentIds = teacherAssignments.map(
      (assignment) => assignment.assignmentId,
    );
    const type = getModuleType({
      skill: scoredSkill.skill,
      forcedPrerequisite: forcedPrerequisites.has(code),
      teacherAssigned: teacherAssignmentIds.length > 0,
      controlScheduled: teacherAssignments.some(
        (assignment) => assignment.kind === 'CONTROL',
      ),
      targetScore: input.goal.targetScore,
    });
    const targets = getTargets(scoredSkill.skill, type);

    return [
      {
        skill: scoredSkill.skill,
        skillId: scoredSkill.skill.id,
        skillCode: scoredSkill.skill.code,
        skillName: scoredSkill.skill.name,
        priority: scoredSkill.priority,
        plannedMinutes: getPlannedMinutes(scoredSkill.skill, type),
        targetMastery: targets.mastery,
        targetConfidence: targets.confidence,
        targetStability: targets.stability,
        reason: getReason(
          scoredSkill.skill,
          type,
          forcedPrerequisites.has(code),
        ),
        type,
        factors: scoredSkill.factors,
        moduleKey: `${scoredSkill.skill.moduleCode}:${type}`,
        teacherAssignmentIds,
      },
    ];
  });
  const grouped = new Map<string, RouteCandidate[]>();
  for (const candidate of candidates) {
    grouped.set(candidate.moduleKey, [
      ...(grouped.get(candidate.moduleKey) ?? []),
      candidate,
    ]);
  }
  const prerequisiteIsReady = (code: string) => {
    const prerequisite = skillByCode.get(code);

    return prerequisite ? isPrerequisiteReady(prerequisite.state) : false;
  };

  const modules = [...grouped.entries()].map<PlannedRouteModule>(
    ([moduleKey, skills]) => {
      const type = skills[0].type;
      const skillCodes = new Set(skills.map((skill) => skill.skillCode));
      const blockedBySkillCodes = [
        ...new Set(
          skills.flatMap(({ skill }) =>
            (dependenciesBySkill.get(skill.code) ?? [])
              .filter(
                (dependency) =>
                  dependency.type === 'REQUIRED' &&
                  !skillCodes.has(dependency.prerequisiteCode) &&
                  !prerequisiteIsReady(dependency.prerequisiteCode),
              )
              .map((dependency) => dependency.prerequisiteCode),
          ),
        ),
      ];
      const recommendedBeforeCodes = [
        ...new Set(
          skills.flatMap(({ skill }) =>
            (dependenciesBySkill.get(skill.code) ?? [])
              .filter(
                (dependency) =>
                  dependency.type === 'RECOMMENDED' &&
                  !prerequisiteIsReady(dependency.prerequisiteCode),
              )
              .map((dependency) => dependency.prerequisiteCode),
          ),
        ),
      ];
      const complete = moduleIsCompleted(type, skills);
      const reasons = [
        ...new Set([
          ...skills.map((skill) => skill.reason),
          ...(blockedBySkillCodes.length
            ? [
                `Сначала нужно закрыть обязательную базу: ${blockedBySkillCodes.join(', ')}`,
              ]
            : []),
          ...(recommendedBeforeCodes.length
            ? [
                `Полезно предварительно повторить: ${recommendedBeforeCodes.join(', ')}`,
              ]
            : []),
          ...(skills.some((skill) => recommendedSupport.has(skill.skillCode))
            ? ['Модуль добавлен как рекомендуемая опора']
            : []),
        ]),
      ];

      return {
        moduleId: skills[0].skill.moduleId,
        moduleKey,
        title: getModuleTitle(type, skills[0].skill.moduleName),
        topicName: skills[0].skill.topicName,
        type,
        status: complete
          ? 'COMPLETED'
          : blockedBySkillCodes.length
            ? 'BLOCKED'
            : 'AVAILABLE',
        position: 0,
        priority: round(Math.max(...skills.map((skill) => skill.priority))),
        estimatedMinutes: skills.reduce(
          (sum, skill) => sum + skill.plannedMinutes,
          0,
        ),
        blockedBySkillCodes,
        recommendedBeforeCodes,
        teacherAssignmentIds: [
          ...new Set(skills.flatMap((skill) => skill.teacherAssignmentIds)),
        ],
        factors: averageFactors(skills),
        completionCriteria: getCompletionCriteria(type, skills),
        reasons,
        skills: [...skills]
          .sort(
            (left, right) =>
              right.priority - left.priority ||
              left.skillCode.localeCompare(right.skillCode),
          )
          .map((skill) => ({
            skillId: skill.skillId,
            skillCode: skill.skillCode,
            skillName: skill.skillName,
            priority: skill.priority,
            plannedMinutes: skill.plannedMinutes,
            targetMastery: skill.targetMastery,
            targetConfidence: skill.targetConfidence,
            targetStability: skill.targetStability,
            reason: skill.reason,
            type: skill.type,
            factors: skill.factors,
          })),
      };
    },
  );
  const moduleKeyBySkill = new Map(
    candidates.map((candidate) => [candidate.skillCode, candidate.moduleKey]),
  );
  const ordered = orderRouteModules(modules, moduleKeyBySkill);
  const firstAvailableStudy = ordered.find(
    (module) =>
      module.status === 'AVAILABLE' &&
      (module.type === 'REQUIRED' || module.type === 'RECOMMENDED'),
  );
  if (firstAvailableStudy && input.goal.weeklyMinutes >= 180) {
    const parallel = ordered.find(
      (module) =>
        module.type === 'RECOMMENDED' &&
        module.status === 'AVAILABLE' &&
        module.moduleKey !== firstAvailableStudy.moduleKey &&
        module.priority >= firstAvailableStudy.priority * 0.65 &&
        module.blockedBySkillCodes.length === 0,
    );
    if (parallel) {
      parallel.type = 'PARALLEL';
      parallel.reasons.push(
        'Модуль не зависит от основного блока и может изучаться параллельно',
      );
    }
  }

  const maximumModules = Math.min(
    12,
    Math.max(6, Math.round(input.goal.weeklyMinutes / 90) + 4),
  );
  const planned: PlannedRouteModule[] = [];
  let usedMinutes = 0;

  for (const module of ordered) {
    const mustKeep =
      module.type === 'TEACHER_ASSIGNED' ||
      planned.length < 4 ||
      usedMinutes < availableMinutes;
    if (
      (!mustKeep && planned.length >= 4) ||
      planned.length >= maximumModules
    ) {
      continue;
    }

    planned.push(module);
    usedMinutes += module.estimatedMinutes;
  }
  planned.forEach((module, index) => {
    module.position = index + 1;
  });

  return {
    algorithmVersion: LEARNING_ROUTE_ALGORITHM_VERSION,
    generatedAt: asOf,
    horizonEndAt: new Date(
      Math.min(
        input.goal.examDate.getTime(),
        asOf.getTime() + horizonWeeks * 7 * DAY_MS,
      ),
    ),
    availableMinutes,
    totalPlannedMinutes: planned.reduce(
      (sum, module) => sum + module.estimatedMinutes,
      0,
    ),
    modules: planned,
    explanation: {
      targetScore: input.goal.targetScore,
      weeksUntilExam: round(weeksUntilExam),
      horizonWeeks,
      consideredSkills: input.skills.length,
      selectedSkills: new Set(
        planned.flatMap((module) =>
          module.skills.map((skill) => skill.skillCode),
        ),
      ).size,
      selectedModules: planned.length,
      policy: [
        'Обязательные неосвоенные предпосылки ставятся раньше зависимых навыков',
        'При низкой уверенности назначается уточнение уровня, а не изучение',
        'Цель, экзаменационный вклад и доступное время ограничивают горизонт',
        'Активные назначения преподавателя сохраняют наивысший приоритет',
        'Просроченное повторение и нестабильный навык получают отдельные модули',
      ],
    },
  };
};
