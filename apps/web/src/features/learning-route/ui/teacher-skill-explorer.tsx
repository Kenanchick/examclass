"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import type {
  TeacherProfileSkill,
  TeacherSkillDetail,
} from "@/entities/learning-route/model/teacher-route";
import {
  TeacherSkillDetailPanel,
  type SkillActionRequest,
} from "./teacher-skill-detail";

type TeacherSkillExplorerProps = {
  detail: TeacherSkillDetail | undefined;
  detailIsError: boolean;
  detailIsPending: boolean;
  search: string;
  selectedSkillCode: string | null;
  skills: TeacherProfileSkill[];
  statusFilter: string;
  onAction: (request: SkillActionRequest) => void;
  onCloseDetail: () => void;
  onRetryDetail: () => void;
  onSearchChange: (value: string) => void;
  onSelectSkill: (skillCode: string) => void;
  onStatusFilterChange: (value: string) => void;
};

const statusFilters = [
  ["ALL", "Все статусы"],
  ["WEAK", "Слабые"],
  ["INSUFFICIENT_DATA", "Мало данных"],
  ["LEARNING", "Изучаются"],
  ["NEEDS_REINFORCEMENT", "Закрепить"],
  ["MASTERED", "Освоены"],
  ["NEEDS_REVIEW", "Повторить"],
] as const;

export function TeacherSkillExplorer({
  detail,
  detailIsError,
  detailIsPending,
  search,
  selectedSkillCode,
  skills,
  statusFilter,
  onAction,
  onCloseDetail,
  onRetryDetail,
  onSearchChange,
  onSelectSkill,
  onStatusFilterChange,
}: TeacherSkillExplorerProps) {
  const normalizedSearch = search.trim().toLocaleLowerCase("ru");
  const filteredSkills = skills.filter((skill) => {
    const matchesStatus =
      statusFilter === "ALL" || skill.effectiveStatus === statusFilter;
    const haystack = [
      skill.skill.code,
      skill.skill.name,
      skill.skill.parent?.name,
      skill.skill.parent?.parent?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("ru");

    return matchesStatus && haystack.includes(normalizedSearch);
  });

  return (
    <aside className="sticky top-4 overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_16px_40px_rgba(15,43,76,0.05)]">
      {selectedSkillCode ? (
        <TeacherSkillDetailPanel
          detail={detail}
          isError={detailIsError}
          isPending={detailIsPending}
          onAction={onAction}
          onClose={onCloseDetail}
          onRetry={onRetryDetail}
        />
      ) : (
        <>
          <div className="border-b border-line p-5 sm:p-6">
            <h2 className="text-2xl font-bold tracking-[-0.04em] text-ink">
              Профиль знаний
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Системная оценка и педагогические отметки показаны отдельно.
            </p>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                className="h-12 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/10"
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Навык или код"
                value={search}
              />
            </div>
            <div className="relative mt-2">
              <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <select
                className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-line bg-white pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                onChange={(event) => onStatusFilterChange(event.target.value)}
                value={statusFilter}
              >
                {statusFilters.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="max-h-[66vh] overflow-y-auto scrollbar-thin">
            {filteredSkills.map((skill) => (
              <button
                className="block w-full cursor-pointer border-b border-line px-5 py-4 text-left transition last:border-b-0 hover:bg-[#f7fbff] sm:px-6"
                key={skill.skill.code}
                onClick={() => onSelectSkill(skill.skill.code)}
                type="button"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">
                      {skill.skill.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted">
                      {skill.skill.parent?.name ?? skill.skill.code}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-brand/8 px-2 py-1 text-xs font-bold text-brand">
                    {Math.round(skill.mastery * 100)}%
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-panel">
                  <span
                    className="block h-full rounded-full bg-brand"
                    style={{ width: `${Math.round(skill.mastery * 100)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-muted">
                    {skill.statusLabel}
                  </span>
                  <span className="text-muted">
                    уверенность {Math.round(skill.confidence * 100)}%
                  </span>
                </div>
                {skill.teacherControl &&
                  skill.teacherControl.instructionStatus !== "NOT_STARTED" && (
                    <p className="mt-2 text-xs font-bold text-success">
                      {skill.teacherControl.instructionStatus === "TAUGHT"
                        ? "Пройдено с преподавателем — ждём практику"
                        : "Закреплено с преподавателем — ждём контроль"}
                    </p>
                  )}
              </button>
            ))}

            {filteredSkills.length === 0 && (
              <div className="px-6 py-14 text-center text-sm leading-6 text-muted">
                По выбранным условиям навыков не найдено.
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
