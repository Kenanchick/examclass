"use client";

import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Pin,
  PinOff,
  Plus,
  Sparkles,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import type {
  CreateTeacherRouteModuleInput,
  TeacherRouteModule,
} from "@/entities/learning-route/model/teacher-route";

const typeLabels: Record<TeacherRouteModule["type"], string> = {
  REQUIRED: "Обязательный",
  RECOMMENDED: "Рекомендуемый",
  PARALLEL: "Параллельный",
  CONTROL: "Контроль",
  REVIEW: "Повторение",
  EXTRA_DIAGNOSTIC: "Уточнить уровень",
  TEACHER_ASSIGNED: "Назначено преподавателем",
};

const statusStyles: Record<TeacherRouteModule["status"], string> = {
  AVAILABLE: "bg-[#e8f5ee] text-success",
  BLOCKED: "bg-[#fff2e1] text-[#9a5a08]",
  COMPLETED: "bg-brand/10 text-brand",
};

type ModuleAction = {
  action: string;
  direction?: "UP" | "DOWN";
  enabled?: boolean;
  title: string;
};

type TeacherRouteModuleListProps = {
  modules: TeacherRouteModule[];
  selectedSkillCode: string | null;
  showHidden: boolean;
  isCreating: boolean;
  onAddCustom: (data: CreateTeacherRouteModuleInput) => void;
  onModuleAction: (module: TeacherRouteModule, action: ModuleAction) => void;
  onSelectSkill: (skillCode: string) => void;
  onToggleHidden: () => void;
};

const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest} мин`;
  if (rest === 0) return `${hours} ч`;
  return `${hours} ч ${rest} мин`;
};

export function TeacherRouteModuleList({
  modules,
  selectedSkillCode,
  showHidden,
  isCreating,
  onAddCustom,
  onModuleAction,
  onSelectSkill,
  onToggleHidden,
}: TeacherRouteModuleListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("90");
  const [reason, setReason] = useState("");
  const visibleModules = showHidden
    ? modules
    : modules.filter((module) => !module.isHidden);

  const submitCustom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const estimatedMinutes = Number(minutes);
    if (
      title.trim().length < 3 ||
      reason.trim().length < 3 ||
      !Number.isFinite(estimatedMinutes)
    ) {
      return;
    }

    onAddCustom({
      title: title.trim(),
      estimatedMinutes,
      reason: reason.trim(),
    });
    setTitle("");
    setReason("");
    setMinutes("90");
    setIsAdding(false);
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_16px_40px_rgba(15,43,76,0.05)]">
      <div className="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <h2 className="text-2xl font-bold tracking-[-0.04em] text-ink">
            Учебный маршрут
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Порядок учитывает базу, цель, нагрузку и подтверждённые результаты.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {modules.some((module) => module.isHidden) && (
            <button
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-line px-3 text-sm font-bold text-muted transition hover:bg-panel hover:text-ink"
              onClick={onToggleHidden}
              type="button"
            >
              {showHidden ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
              {showHidden ? "Скрыть черновики" : "Показать скрытые"}
            </button>
          )}
          <button
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white transition hover:-translate-y-0.5"
            onClick={() => setIsAdding((value) => !value)}
            type="button"
          >
            <Plus className="size-4" />
            Своя тема
          </button>
        </div>
      </div>

      {isAdding && (
        <form
          className="grid gap-3 border-b border-line bg-panel/45 p-5 sm:grid-cols-[minmax(0,1fr)_120px] sm:p-7"
          onSubmit={submitCustom}
        >
          <input
            className="h-12 rounded-xl border border-line bg-white px-4 text-sm font-medium outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Название собственной темы"
            value={title}
          />
          <input
            className="h-12 rounded-xl border border-line bg-white px-4 text-sm font-medium outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
            min={15}
            onChange={(event) => setMinutes(event.target.value)}
            step={15}
            type="number"
            value={minutes}
          />
          <textarea
            className="min-h-20 resize-none rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 sm:col-span-2"
            onChange={(event) => setReason(event.target.value)}
            placeholder="Почему тема добавляется в маршрут"
            value={reason}
          />
          <button
            className="min-h-11 cursor-pointer rounded-xl bg-brand px-4 text-sm font-bold text-white disabled:opacity-50 sm:col-start-2"
            disabled={isCreating}
            type="submit"
          >
            {isCreating ? "Добавляем…" : "Добавить"}
          </button>
        </form>
      )}

      <div>
        {visibleModules.map((module, index) => (
          <article
            className={`relative grid gap-4 border-b border-line px-5 py-6 last:border-b-0 sm:grid-cols-[52px_minmax(0,1fr)] sm:px-7 ${
              module.isHidden ? "bg-panel/40 opacity-65" : ""
            }`}
            key={module.moduleKey}
          >
            <div className="relative hidden sm:block">
              {index < visibleModules.length - 1 && (
                <span className="absolute left-1/2 top-11 h-[calc(100%+1.5rem)] w-px -translate-x-1/2 bg-line" />
              )}
              <span className="relative z-10 grid size-11 place-items-center rounded-2xl bg-[#eaf4ff] text-sm font-extrabold text-brand">
                {module.position}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-brand/8 px-2.5 py-1 text-xs font-bold text-brand">
                      {typeLabels[module.type]}
                    </span>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${statusStyles[module.status]}`}
                    >
                      {module.status === "AVAILABLE"
                        ? "Доступен"
                        : module.status === "BLOCKED"
                          ? "Заблокирован"
                          : "Завершён"}
                    </span>
                    {module.isPinned && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-brand">
                        <Pin className="size-3.5" /> Закреплён
                      </span>
                    )}
                    {!module.autoUpdateEnabled && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#875207]">
                        <Lock className="size-3.5" /> Автоматика выключена
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-xl font-bold tracking-[-0.035em] text-ink sm:text-2xl">
                    {module.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {module.reasons[0] ??
                      module.completionCriteria.description ??
                      "Модуль добавлен в маршрут"}
                  </p>
                  {module.blockedBySkillCodes.length > 0 && (
                    <p className="mt-2 text-sm font-semibold text-[#935506]">
                      Сначала нужно закрыть обязательную базу ·{" "}
                      {module.blockedBySkillCodes.length}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1">
                  <span className="mr-2 text-sm font-semibold text-muted">
                    {formatMinutes(module.estimatedMinutes)}
                  </span>
                  <button
                    aria-label="Переместить выше"
                    className="grid size-9 cursor-pointer place-items-center rounded-xl text-muted transition hover:bg-panel hover:text-ink"
                    onClick={() =>
                      onModuleAction(module, {
                        action: "MOVE_MODULE",
                        direction: "UP",
                        title: "Переместить модуль выше",
                      })
                    }
                    type="button"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    aria-label="Переместить ниже"
                    className="grid size-9 cursor-pointer place-items-center rounded-xl text-muted transition hover:bg-panel hover:text-ink"
                    onClick={() =>
                      onModuleAction(module, {
                        action: "MOVE_MODULE",
                        direction: "DOWN",
                        title: "Переместить модуль ниже",
                      })
                    }
                    type="button"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <button
                    aria-label={
                      module.isPinned ? "Открепить модуль" : "Закрепить модуль"
                    }
                    className="grid size-9 cursor-pointer place-items-center rounded-xl text-muted transition hover:bg-panel hover:text-ink"
                    onClick={() =>
                      onModuleAction(module, {
                        action: module.isPinned ? "UNPIN_MODULE" : "PIN_MODULE",
                        title: module.isPinned
                          ? "Открепить модуль"
                          : "Закрепить модуль",
                      })
                    }
                    type="button"
                  >
                    {module.isPinned ? (
                      <PinOff className="size-4" />
                    ) : (
                      <Pin className="size-4" />
                    )}
                  </button>
                  <button
                    aria-label={
                      module.autoUpdateEnabled
                        ? "Отключить автоматику"
                        : "Включить автоматику"
                    }
                    className="grid size-9 cursor-pointer place-items-center rounded-xl text-muted transition hover:bg-panel hover:text-ink"
                    onClick={() =>
                      onModuleAction(module, {
                        action: "SET_MODULE_AUTOMATION",
                        enabled: !module.autoUpdateEnabled,
                        title: module.autoUpdateEnabled
                          ? "Зафиксировать модуль"
                          : "Вернуть автоматическое обновление",
                      })
                    }
                    type="button"
                  >
                    {module.autoUpdateEnabled ? (
                      <LockOpen className="size-4" />
                    ) : (
                      <Lock className="size-4" />
                    )}
                  </button>
                  <button
                    aria-label={module.isHidden ? "Показать" : "Скрыть"}
                    className="grid size-9 cursor-pointer place-items-center rounded-xl text-muted transition hover:bg-panel hover:text-ink"
                    onClick={() =>
                      onModuleAction(module, {
                        action: module.isHidden ? "SHOW_MODULE" : "HIDE_MODULE",
                        title: module.isHidden
                          ? "Вернуть модуль в маршрут"
                          : "Временно скрыть модуль",
                      })
                    }
                    type="button"
                  >
                    {module.isHidden ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {module.teacherComment && (
                <p className="mt-4 border-l-2 border-brand/30 pl-3 text-sm italic leading-6 text-muted">
                  {module.teacherComment}
                </p>
              )}

              {module.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {module.skills.map((skill) => (
                    <button
                      className={`cursor-pointer rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                        selectedSkillCode === skill.code
                          ? "border-brand bg-brand text-white"
                          : "border-line bg-white text-ink hover:border-brand/40 hover:bg-[#f7fbff]"
                      }`}
                      key={skill.code}
                      onClick={() => onSelectSkill(skill.code)}
                      type="button"
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}

        {visibleModules.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Sparkles className="mx-auto size-8 text-brand" />
            <p className="mt-3 text-lg font-bold text-ink">
              Все модули временно скрыты
            </p>
            <button
              className="mt-3 cursor-pointer text-sm font-bold text-brand"
              onClick={onToggleHidden}
              type="button"
            >
              Показать скрытые
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
