"use client";

import { CheckCircle2, RotateCcw, X } from "lucide-react";
import type { TeacherSkillDetail } from "@/entities/learning-route/model/teacher-route";

export type SkillActionRequest = {
  action: string;
  title: string;
  status?: string;
  comment?: string;
  enabled?: boolean;
  immediate?: boolean;
};

type TeacherSkillDetailProps = {
  detail: TeacherSkillDetail | undefined;
  isError: boolean;
  isPending: boolean;
  onAction: (request: SkillActionRequest) => void;
  onClose: () => void;
  onRetry: () => void;
};

export function TeacherSkillDetailPanel({
  detail,
  isError,
  isPending,
  onAction,
  onClose,
  onRetry,
}: TeacherSkillDetailProps) {
  if (isPending) {
    return (
      <div className="grid min-h-80 place-items-center p-8 text-center text-sm font-semibold text-muted">
        Загружаем навык…
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="grid min-h-80 place-items-center p-8 text-center">
        <div>
          <p className="font-bold text-ink">Не удалось открыть навык</p>
          <button
            className="mt-3 cursor-pointer text-sm font-bold text-brand"
            onClick={onRetry}
            type="button"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  const isPassed = ["MASTERED", "TEACHER_CONFIRMED"].includes(
    detail.effectiveStatus,
  );

  return (
    <div className="max-h-[78vh] overflow-y-auto p-5 scrollbar-thin sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.13em] text-brand">
            Подтема
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            {detail.name}
          </h3>
          {detail.description && (
            <p className="mt-2 text-sm leading-6 text-muted">
              {detail.description}
            </p>
          )}
        </div>
        <button
          aria-label="Закрыть навык"
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl text-muted transition hover:bg-panel hover:text-ink"
          onClick={onClose}
          type="button"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="mt-7">
        {isPassed ? (
          <button
            className="inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#eaf6ef] px-4 text-sm font-bold text-[#287651] transition hover:-translate-y-0.5 hover:bg-[#d8efe2]"
            onClick={() =>
              onAction({
                action: "CHANGE_SKILL_STATUS",
                title: "Вернуть подтему в состояние «Не пройдено»",
                status: "UNSTUDIED",
                immediate: true,
              })
            }
            type="button"
          >
            <RotateCcw className="size-5" />
            Вернуть в не пройдено
          </button>
        ) : (
          <button
            className="inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand/90"
            onClick={() =>
              onAction({
                action: "CHANGE_SKILL_STATUS",
                title: "Отметить подтему пройденной",
                status: "MASTERED",
                immediate: true,
              })
            }
            type="button"
          >
            <CheckCircle2 className="size-5" />
            Подтема пройдена
          </button>
        )}
      </div>
    </div>
  );
}
