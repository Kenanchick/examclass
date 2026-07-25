"use client";

import {
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  RotateCcw,
  X,
} from "lucide-react";
import type { TeacherRoadmapNode } from "@/entities/learning-route/model/teacher-route";

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

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

function Metric({ label, value }: { label: string; value: number }) {
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

type TeacherRoadmapDetailProps = {
  node: TeacherRoadmapNode;
  onClose: () => void;
  onSubtopicStatusChange: (action: {
    code: string;
    name: string;
    status: "MASTERED" | "LEARNING";
  }) => void;
  onSkillOpen: (skillCode: string) => void;
};

export function TeacherRoadmapDetail({
  node,
  onClose,
  onSubtopicStatusChange,
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
                    <span className="text-right text-xs font-semibold text-muted">
                      <span className="block font-bold text-ink">
                        {Math.round(subtopic.mastery * 100)}%
                      </span>
                      {subtopic.masteredSkills}/{subtopic.skills.length} навыков
                    </span>
                    <ChevronRight className="size-4 text-muted transition group-open:rotate-90" />
                  </summary>
                  <div className="border-t border-line px-2 py-2">
                    <button
                      className={`mb-2 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition ${
                        subtopic.isMastered
                          ? "bg-[#edf8f2] text-success hover:bg-[#e2f3ea]"
                          : "bg-brand text-white hover:bg-brand/90"
                      }`}
                      onClick={() =>
                        onSubtopicStatusChange({
                          code: subtopic.code,
                          name: subtopic.name,
                          status: subtopic.isMastered ? "LEARNING" : "MASTERED",
                        })
                      }
                      type="button"
                    >
                      {subtopic.isMastered ? (
                        <RotateCcw className="size-4" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      {subtopic.isMastered
                        ? "Вернуть подтему в изучение"
                        : "Отметить всю подтему освоенной"}
                    </button>
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
        </div>
      </aside>
    </>
  );
}
