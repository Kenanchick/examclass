"use client";

import {
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  X,
} from "lucide-react";
import type { TeacherRoadmapNode } from "@/entities/learning-route/model/teacher-route";

type TeacherRoadmapDetailProps = {
  node: TeacherRoadmapNode;
  onClose: () => void;
  onSubtopicStatusChange: (action: {
    code: string;
    name: string;
    status: "MASTERED" | "UNSTUDIED";
  }) => void;
  onReviewNode: () => void;
  onSkillOpen: (skillCode: string) => void;
};

export function TeacherRoadmapDetail({
  node,
  onClose,
  onSubtopicStatusChange,
  onReviewNode,
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
          {node.isPassed && (
            <button
              className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#e58910] px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#c96f08]"
              onClick={onReviewNode}
              type="button"
            >
              <CalendarClock className="size-5" />
              Отправить всё задание на повторение
            </button>
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
                    <span className="text-right text-xs font-semibold text-muted">
                      <span
                        className={`block font-bold ${
                          subtopic.isMastered
                            ? "text-[#287651]"
                            : "text-muted"
                        }`}
                      >
                        {subtopic.isMastered ? "Пройдено" : "Не пройдено"}
                      </span>
                      {subtopic.masteredSkills}/{subtopic.skills.length} навыков
                    </span>
                    <ChevronRight className="size-4 text-muted transition group-open:rotate-90" />
                  </summary>
                  <div className="border-t border-line px-2 py-2">
                    {subtopic.isMastered ? (
                      <button
                        className="mb-2 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#b9ddc9] bg-[#eaf6ef] px-3 text-sm font-bold text-[#287651] transition hover:bg-[#d8efe2]"
                        onClick={() =>
                          onSubtopicStatusChange({
                            code: subtopic.code,
                            name: subtopic.name,
                            status: "UNSTUDIED",
                          })
                        }
                        type="button"
                      >
                        <RotateCcw className="size-4" />
                        Вернуть подтему в не пройдено
                      </button>
                    ) : (
                      <button
                        className="mb-2 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-3 text-sm font-bold text-white transition hover:bg-brand/90"
                        onClick={() =>
                          onSubtopicStatusChange({
                            code: subtopic.code,
                            name: subtopic.name,
                            status: "MASTERED",
                          })
                        }
                        type="button"
                      >
                        <CheckCircle2 className="size-4" />
                        Отметить подтему пройденной
                      </button>
                    )}
                    {subtopic.skills.map((skill) => (
                      <button
                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-panel"
                        key={skill.code}
                        onClick={() => onSkillOpen(skill.code)}
                        type="button"
                      >
                        <span
                          className={`size-2.5 shrink-0 rounded-full ${
                            ["MASTERED", "TEACHER_CONFIRMED"].includes(
                              skill.status,
                            )
                              ? "bg-[#3f9a70]"
                              : "bg-[#a8b1ba]"
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink">
                            {skill.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">
                            {["MASTERED", "TEACHER_CONFIRMED"].includes(
                              skill.status,
                            )
                              ? "Пройдено"
                              : "Не пройдено"}
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

        </div>
      </aside>
    </>
  );
}
