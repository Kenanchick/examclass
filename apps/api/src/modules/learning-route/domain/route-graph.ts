import type {
  PlannedRouteModule,
  RouteDependency,
  RouteModuleType,
} from './route-types';

const moduleTypeRank: Record<RouteModuleType, number> = {
  TEACHER_ASSIGNED: 7,
  EXTRA_DIAGNOSTIC: 6,
  REVIEW: 5,
  CONTROL: 4,
  REQUIRED: 3,
  PARALLEL: 2,
  RECOMMENDED: 1,
};

export const getReachBySkill = (
  skillCodes: string[],
  dependencies: RouteDependency[],
) => {
  const required = new Map<string, string[]>();
  const recommended = new Map<string, string[]>();

  for (const dependency of dependencies) {
    const target = dependency.type === 'REQUIRED' ? required : recommended;
    target.set(dependency.prerequisiteCode, [
      ...(target.get(dependency.prerequisiteCode) ?? []),
      dependency.skillCode,
    ]);
  }

  const walk = (start: string, graph: Map<string, string[]>) => {
    const visited = new Set<string>();
    const queue = [...(graph.get(start) ?? [])];

    while (queue.length > 0) {
      const code = queue.shift()!;
      if (visited.has(code)) {
        continue;
      }
      visited.add(code);
      queue.push(...(graph.get(code) ?? []));
    }

    return visited.size;
  };

  return new Map(
    skillCodes.map((code) => [
      code,
      walk(code, required) + walk(code, recommended) * 0.5,
    ]),
  );
};

export const orderRouteModules = (
  modules: PlannedRouteModule[],
  moduleKeyBySkill: Map<string, string>,
) => {
  const byKey = new Map(modules.map((module) => [module.moduleKey, module]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const ordered: PlannedRouteModule[] = [];

  const visit = (module: PlannedRouteModule) => {
    if (visited.has(module.moduleKey) || visiting.has(module.moduleKey)) {
      return;
    }

    visiting.add(module.moduleKey);
    for (const code of module.blockedBySkillCodes) {
      const prerequisiteModule = byKey.get(moduleKeyBySkill.get(code) ?? '');
      if (prerequisiteModule) {
        visit(prerequisiteModule);
      }
    }
    visiting.delete(module.moduleKey);
    visited.add(module.moduleKey);
    ordered.push(module);
  };

  [...modules]
    .sort(
      (left, right) =>
        moduleTypeRank[right.type] - moduleTypeRank[left.type] ||
        right.priority - left.priority ||
        left.title.localeCompare(right.title, 'ru'),
    )
    .forEach(visit);

  return ordered;
};
