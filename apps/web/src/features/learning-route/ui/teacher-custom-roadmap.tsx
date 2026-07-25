"use client";

import {
  ArrowDown,
  ArrowUp,
  Clock3,
  EyeOff,
  Pin,
  Sparkles,
  X,
} from "lucide-react";
import type {
  TeacherModuleActionInput,
  TeacherRoadmap,
} from "@/entities/learning-route/model/teacher-route";

type TeacherCustomModuleDetailProps = {
  module: TeacherRoadmap["customNodes"][number];
  editMode: boolean;
  onClose: () => void;
  onAction: (action: {
    moduleKey: string;
    title: string;
    data: Omit<TeacherModuleActionInput, "reason">;
  }) => void;
};

export function TeacherCustomModuleDetail({
  module,
  editMode,
  onClose,
  onAction,
}: TeacherCustomModuleDetailProps) {
  return (
    <>
      <button
        aria-label="Закрыть дополнительную тему"
        className="fixed inset-0 z-[65] cursor-default bg-[#102840]/15 backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />
      <aside className="roadmap-detail-panel fixed inset-x-3 bottom-3 z-[66] max-h-[82vh] overflow-y-auto rounded-[1.75rem] border border-line bg-white p-6 shadow-[0_28px_80px_rgba(12,37,61,0.24)] sm:inset-y-4 sm:left-auto sm:right-4 sm:max-h-none sm:w-[500px]">
        <div className="flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#ffe8b5] text-sm font-extrabold text-[#aa6200]">
            ДОП
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#aa6200]">
              Тема преподавателя
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink">
              {module.title}
            </h2>
          </div>
          <button
            aria-label="Закрыть"
            className="grid size-10 cursor-pointer place-items-center rounded-xl text-muted transition hover:bg-panel hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="mt-6 text-base leading-7 text-muted">
          {module.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-xl bg-panel px-3 py-2 text-sm font-semibold text-muted">
            <Clock3 className="size-4 text-[#aa6200]" />
            {module.estimatedMinutes} минут
          </span>
          <span className="inline-flex items-center gap-2 rounded-xl bg-[#fff1cf] px-3 py-2 text-sm font-semibold text-[#aa6200]">
            <Sparkles className="size-4" />
            Дополнительный маршрут
          </span>
        </div>

        {editMode && (
          <div className="mt-7 border-t border-line pt-5">
            <h3 className="font-bold text-ink">Управление карточкой</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                {
                  title: "Переместить раньше",
                  icon: ArrowUp,
                  data: { action: "MOVE_MODULE", direction: "UP" as const },
                },
                {
                  title: "Переместить позже",
                  icon: ArrowDown,
                  data: { action: "MOVE_MODULE", direction: "DOWN" as const },
                },
                {
                  title: module.isPinned ? "Открепить" : "Закрепить",
                  icon: Pin,
                  data: {
                    action: module.isPinned ? "UNPIN_MODULE" : "PIN_MODULE",
                  },
                },
                {
                  title: "Скрыть",
                  icon: EyeOff,
                  data: { action: "HIDE_MODULE" },
                },
              ].map(({ title, icon: Icon, data }) => (
                <button
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-panel px-3 text-sm font-bold text-muted transition hover:text-brand"
                  key={title}
                  onClick={() =>
                    onAction({
                      moduleKey: module.moduleKey,
                      title,
                      data,
                    })
                  }
                  type="button"
                >
                  <Icon className="size-4" />
                  {title}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
