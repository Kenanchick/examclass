"use client";

import { CalendarClock, CheckCircle2, X } from "lucide-react";
import type { TeacherSkillDetail } from "@/entities/learning-route/model/teacher-route";

export type SkillActionRequest = {
  action: string;
  title: string;
  status?: string;
  comment?: string;
  enabled?: boolean;
};

type TeacherSkillDetailProps = {
  detail: TeacherSkillDetail | undefined;
  isError: boolean;
  isPending: boolean;
  onAction: (request: SkillActionRequest) => void;
  onClose: () => void;
  onRetry: () => void;
};

function Metric({
  label,
  value,
}: {
  label: string;
  value: number | null | undefined;
}) {
  const percent = Math.round((value ?? 0) * 100);

  return (
    <div className="rounded-2xl bg-panel/65 p-4">
      <div className="flex items-center justify-between gap-3 text-sm font-semibold text-muted">
        <span>{label}</span>
        <span className="font-bold text-ink">{percent}%</span>
      </div>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white">
        <span
          className="block h-full rounded-full bg-brand transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

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

  return (
    <div className="max-h-[78vh] overflow-y-auto p-5 scrollbar-thin sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.13em] text-brand">
            Навык
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

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Metric label="Владение" value={detail.systemState?.mastery} />
        <Metric label="Уверенность" value={detail.systemState?.confidence} />
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <button
          className="inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#eaf6ef] px-4 text-sm font-bold text-[#287651] transition hover:-translate-y-0.5 hover:bg-[#dff1e7]"
          onClick={() =>
            onAction({
              action: "MARK_REINFORCED",
              title: "Отметить навык закреплённым",
            })
          }
          type="button"
        >
          <CheckCircle2 className="size-5" />
          Закреплено
        </button>
        <button
          className="inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#fff3df] px-4 text-sm font-bold text-[#9a5a08] transition hover:-translate-y-0.5 hover:bg-[#ffebcb]"
          onClick={() =>
            onAction({
              action: "SCHEDULE_REVIEW",
              title: "Поставить навык на повторение",
            })
          }
          type="button"
        >
          <CalendarClock className="size-5" />
          На повторение
        </button>
      </div>
    </div>
  );
}
