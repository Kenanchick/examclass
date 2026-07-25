"use client";

import {
  ArrowDown,
  ArrowUp,
  Clock3,
  EyeOff,
  Pin,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type {
  CreateTeacherRouteModuleInput,
  TeacherModuleActionInput,
  TeacherRoadmap,
} from "@/entities/learning-route/model/teacher-route";

type TeacherCustomModuleDialogProps = {
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onCreate: (data: CreateTeacherRouteModuleInput) => void;
};

export function TeacherCustomModuleDialog({
  isOpen,
  isPending,
  onClose,
  onCreate,
}: TeacherCustomModuleDialogProps) {
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("90");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setMinutes("90");
      setReason("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const estimatedMinutes = Number(minutes);
    if (
      title.trim().length < 3 ||
      reason.trim().length < 3 ||
      !Number.isFinite(estimatedMinutes)
    ) {
      return;
    }
    onCreate({
      title: title.trim(),
      reason: reason.trim(),
      estimatedMinutes,
      comment: reason.trim(),
    });
  };

  return (
    <div
      aria-label="Добавить дополнительную тему"
      aria-modal="true"
      className="fixed inset-0 z-[70] grid place-items-center bg-[#102840]/25 p-4 backdrop-blur-[3px]"
      role="dialog"
    >
      <form
        className="roadmap-detail-panel w-full max-w-lg rounded-[1.8rem] border border-line bg-white p-6 shadow-[0_30px_90px_rgba(12,37,61,0.3)]"
        onSubmit={submit}
      >
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#f1edff] text-[#6651a3]">
            <Plus className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6651a3]">
              Дополнительная карточка
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink">
              Своя тема преподавателя
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

        <label className="mt-6 block text-sm font-bold text-ink">
          Название темы
          <input
            autoFocus
            className="mt-2 h-12 w-full rounded-xl border border-line px-4 font-medium outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Например, олимпиадная комбинаторика"
            value={title}
          />
        </label>
        <label className="mt-4 block text-sm font-bold text-ink">
          Зачем добавить в маршрут
          <textarea
            className="mt-2 min-h-24 w-full resize-none rounded-xl border border-line px-4 py-3 font-medium outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
            onChange={(event) => setReason(event.target.value)}
            placeholder="Что нужно пройти и почему это важно ученику"
            value={reason}
          />
        </label>
        <label className="mt-4 block text-sm font-bold text-ink">
          Примерное время, минут
          <input
            className="mt-2 h-12 w-full rounded-xl border border-line px-4 font-medium outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
            min={15}
            onChange={(event) => setMinutes(event.target.value)}
            step={15}
            type="number"
            value={minutes}
          />
        </label>
        <button
          className="mt-6 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand font-bold text-white transition hover:bg-brand/90 disabled:opacity-50"
          disabled={
            isPending || title.trim().length < 3 || reason.trim().length < 3
          }
          type="submit"
        >
          <Plus className="size-4" />
          {isPending ? "Добавляем…" : "Добавить карточку на карту"}
        </button>
      </form>
    </div>
  );
}

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
        className="fixed inset-0 z-40 cursor-default bg-[#102840]/15 backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />
      <aside className="roadmap-detail-panel fixed inset-x-3 bottom-3 z-50 max-h-[82vh] overflow-y-auto rounded-[1.75rem] border border-line bg-white p-6 shadow-[0_28px_80px_rgba(12,37,61,0.24)] sm:inset-y-4 sm:left-auto sm:right-4 sm:max-h-none sm:w-[500px]">
        <div className="flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#f1edff] text-sm font-extrabold text-[#6651a3]">
            ДОП
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6651a3]">
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
            <Clock3 className="size-4 text-[#6651a3]" />
            {module.estimatedMinutes} минут
          </span>
          <span className="inline-flex items-center gap-2 rounded-xl bg-[#f1edff] px-3 py-2 text-sm font-semibold text-[#6651a3]">
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
