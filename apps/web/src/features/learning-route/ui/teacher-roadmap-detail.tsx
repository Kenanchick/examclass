"use client";

import {
  ArrowDown,
  ArrowUp,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  EyeOff,
  Flag,
  LockKeyhole,
  Pin,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import type {
  TeacherModuleActionInput,
  TeacherRoadmapNode,
} from "@/entities/learning-route/model/teacher-route";

const statusLabels: Record<string, string> = {
  UNKNOWN: "Недостаточно данных",
  UNSTUDIED: "Ещё не изучалось",
  GAP: "Есть пробел",
  DEVELOPING: "Формируется",
  MASTERED: "Освоено",
  INSUFFICIENT_DATA: "Недостаточно данных",
  WEAK: "Слабый навык",
  LEARNING: "Изучается",
  NEEDS_REINFORCEMENT: "Требует закрепления",
  NEEDS_REVIEW: "Требует повторения",
  TEACHER_CONFIRMED: "Подтверждено преподавателем",
};

const sourceLabels: Record<string, string> = {
  FULL_EXAM: "Стартовый вариант",
  ADAPTIVE_TASK: "Уточняющая задача",
  THEORY_QUESTION: "Теоретический вопрос",
  MANUAL_REVIEW: "Проверка преподавателя",
  SELF_REPORT: "Самооценка",
  HOMEWORK: "Домашняя работа",
  CONTROL_WORK: "Контрольная работа",
  MOCK_EXAM: "Пробный экзамен",
  LESSON: "Занятие",
  TEACHER_CONFIRMATION: "Подтверждение преподавателя",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const percent = Math.round(value * 100);
  return (
    <div className="rounded-2xl bg-panel/70 p-3">
      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-muted">
        <span>{label}</span>
        <span className="font-bold text-ink">{percent}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
        <span
          className="block h-full rounded-full bg-brand transition-[width] duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

type ModuleAction = {
  moduleKey: string;
  moduleTitle: string;
  title: string;
  data: Omit<TeacherModuleActionInput, "reason">;
};

type TeacherRoadmapDetailProps = {
  node: TeacherRoadmapNode;
  editMode: boolean;
  onClose: () => void;
  onModuleAction: (action: ModuleAction) => void;
  onSkillOpen: (skillCode: string) => void;
};

export function TeacherRoadmapDetail({
  node,
  editMode,
  onClose,
  onModuleAction,
  onSkillOpen,
}: TeacherRoadmapDetailProps) {
  return (
    <>
      <button
        aria-label="Закрыть подробности"
        className="fixed inset-0 z-40 cursor-default bg-[#102840]/15 backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />
      <aside className="roadmap-detail-panel fixed inset-x-3 bottom-3 z-50 max-h-[82vh] overflow-y-auto rounded-[1.75rem] border border-line bg-white shadow-[0_28px_80px_rgba(12,37,61,0.24)] scrollbar-thin sm:inset-y-4 sm:left-auto sm:right-4 sm:max-h-none sm:w-[520px]">
        <div className="sticky top-0 z-10 border-b border-line bg-white/94 px-5 py-5 backdrop-blur sm:px-6">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand text-lg font-bold text-white">
              {node.examNumber}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand">
                Задание ЕГЭ · {node.examPart}
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-[-0.045em] text-ink">
                {node.title}
              </h2>
            </div>
            <button
              aria-label="Закрыть"
              className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl text-muted transition hover:bg-panel hover:text-ink"
              onClick={onClose}
              type="button"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Владение" value={node.mastery} />
            <Metric label="Уверенность системы" value={node.confidence} />
          </div>

          <section>
            <h3 className="flex items-center gap-2 font-bold text-ink">
              <Sparkles className="size-5 text-brand" />
              Почему этот узел здесь
            </h3>
            <div className="mt-3 space-y-2">
              {node.reasons.map((reason) => (
                <p
                  className="border-l-2 border-[#bdd6ea] pl-3 text-sm leading-6 text-muted"
                  key={reason}
                >
                  {reason}
                </p>
              ))}
            </div>
          </section>

          {node.prerequisites.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 font-bold text-ink">
                <LockKeyhole className="size-5 text-brand" />
                Необходимая база
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {node.prerequisites.map((item) => (
                  <span
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                      item.blocking
                        ? "border-[#e4bea8] bg-[#fff5ef] text-[#925130]"
                        : "border-line bg-panel/60 text-muted"
                    }`}
                    key={item.name}
                    title={item.rationale ?? undefined}
                  >
                    {item.name}
                    {item.examNumbers.length > 0
                      ? ` · № ${item.examNumbers.join(", ")}`
                      : ""}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-bold text-ink">
                <BookOpenCheck className="size-5 text-brand" />
                Подтемы и навыки
              </h3>
              <span className="text-xs font-semibold text-muted">
                {node.skillCount} навыков
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {node.subtopics.map((subtopic, index) => (
                <details
                  className="group rounded-2xl border border-line bg-white"
                  key={subtopic.name}
                  open={index === 0}
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-ink">{subtopic.name}</p>
                      {subtopic.topic && (
                        <p className="mt-0.5 text-xs text-muted">
                          {subtopic.topic}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-muted">
                      {subtopic.skills.length}
                    </span>
                    <ChevronRight className="size-4 text-muted transition group-open:rotate-90" />
                  </summary>
                  <div className="border-t border-line px-2 py-2">
                    {subtopic.skills.map((skill) => (
                      <button
                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-panel"
                        key={skill.code}
                        onClick={() => onSkillOpen(skill.code)}
                        type="button"
                      >
                        <span
                          className={`size-2.5 shrink-0 rounded-full ${
                            skill.mastery >= 0.8
                              ? "bg-[#3f9a70]"
                              : skill.confidence < 0.3
                                ? "bg-[#9b80af]"
                                : "bg-[#d29a32]"
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink">
                            {skill.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">
                            {statusLabels[skill.status] ?? "Требует проверки"} ·{" "}
                            {Math.round(skill.mastery * 100)}%
                          </span>
                        </span>
                        <ChevronRight className="size-4 text-muted" />
                      </button>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-line p-4">
            <h3 className="flex items-center gap-2 font-bold text-ink">
              <CheckCircle2 className="size-5 text-success" />
              Когда узел будет завершён
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              {node.completionCriteria.description}
            </p>
          </section>

          {node.unlocksExamNumbers.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 font-bold text-ink">
                <Flag className="size-5 text-brand" />
                Что откроется дальше
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {node.unlocksExamNumbers.map((examNumber) => (
                  <span
                    className="rounded-xl bg-[#eef6ff] px-3 py-2 text-xs font-bold text-brand"
                    key={examNumber}
                  >
                    Задание {examNumber}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="flex items-center gap-2 font-bold text-ink">
              <ShieldCheck className="size-5 text-brand" />
              Последние подтверждения
            </h3>
            <div className="mt-3 divide-y divide-line border-y border-line">
              {node.attempts.slice(0, 5).map((attempt) => (
                <div
                  className="grid grid-cols-[1fr_auto] gap-3 py-3 text-sm"
                  key={attempt.id}
                >
                  <div>
                    <p className="font-semibold text-ink">
                      {sourceLabels[attempt.source] ?? "Учебная попытка"}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted">
                      {attempt.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand">
                      {Math.round(attempt.score * 100)}%
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDate(attempt.occurredAt)}
                    </p>
                  </div>
                </div>
              ))}
              {node.attempts.length === 0 && (
                <div className="flex items-center gap-3 py-4 text-sm text-muted">
                  <CircleHelp className="size-5 text-brand" />
                  Независимых попыток пока недостаточно.
                </div>
              )}
            </div>
          </section>

          {node.plannedReviews.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 font-bold text-ink">
                <CalendarClock className="size-5 text-brand" />
                Запланировано
              </h3>
              <div className="mt-3 space-y-2">
                {node.plannedReviews.map((review) => (
                  <div
                    className="flex items-center gap-3 rounded-xl bg-panel/70 px-3 py-2.5 text-sm"
                    key={`${review.type}-${review.date}-${review.skillName}`}
                  >
                    <Clock3 className="size-4 shrink-0 text-brand" />
                    <span className="min-w-0 flex-1 font-semibold text-ink">
                      {review.type}: {review.skillName}
                    </span>
                    <span className="shrink-0 text-xs text-muted">
                      {formatDate(review.date)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {editMode && (
            <section className="rounded-2xl border border-[#bad2e7] bg-[#f6faff] p-4">
              <h3 className="font-bold text-ink">Режим преподавателя</h3>
              <p className="mt-1 text-sm leading-6 text-muted">
                Меняйте только связанные модули. Каждое решение сохранится с
                причиной, автором и временем.
              </p>
              <div className="mt-4 space-y-3">
                {node.routeModules.map((module) => (
                  <div
                    className="rounded-xl border border-line bg-white p-3"
                    key={module.moduleKey}
                  >
                    <p className="text-sm font-bold text-ink">{module.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        {
                          title: "Переместить раньше",
                          icon: ArrowUp,
                          data: {
                            action: "MOVE_MODULE",
                            direction: "UP" as const,
                          },
                        },
                        {
                          title: "Переместить позже",
                          icon: ArrowDown,
                          data: {
                            action: "MOVE_MODULE",
                            direction: "DOWN" as const,
                          },
                        },
                        {
                          title: module.isPinned
                            ? "Открепить модуль"
                            : "Закрепить модуль",
                          icon: Pin,
                          data: {
                            action: module.isPinned
                              ? "UNPIN_MODULE"
                              : "PIN_MODULE",
                          },
                        },
                        {
                          title: module.isHidden
                            ? "Вернуть модуль"
                            : "Временно скрыть",
                          icon: EyeOff,
                          data: {
                            action: module.isHidden
                              ? "SHOW_MODULE"
                              : "HIDE_MODULE",
                          },
                        },
                      ].map(({ title, icon: Icon, data }) => (
                        <button
                          className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg bg-panel px-2.5 text-xs font-bold text-muted transition hover:text-brand"
                          key={title}
                          onClick={() =>
                            onModuleAction({
                              moduleKey: module.moduleKey,
                              moduleTitle: module.title,
                              title,
                              data,
                            })
                          }
                          type="button"
                        >
                          <Icon className="size-3.5" />
                          {title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {node.routeModules.length === 0 && (
                  <p className="text-sm text-muted">
                    Этот узел пока не включён в ближайший персональный маршрут.
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}
