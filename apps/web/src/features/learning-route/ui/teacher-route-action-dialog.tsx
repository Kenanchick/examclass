"use client";

import { AlertCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

type TeacherRouteActionDialogProps = {
  description: string;
  error?: string | null;
  isPending: boolean;
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export function TeacherRouteActionDialog({
  description,
  error,
  isPending,
  isOpen,
  title,
  onClose,
  onConfirm,
}: TeacherRouteActionDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-[#0b2239]/35 p-4 backdrop-blur-[3px]"
      role="dialog"
    >
      <button
        aria-label="Закрыть"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <section className="relative w-full max-w-lg rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_28px_90px_rgba(10,35,60,0.28)] sm:p-7">
        <button
          aria-label="Закрыть"
          className="absolute right-5 top-5 grid size-10 cursor-pointer place-items-center rounded-xl text-muted transition hover:bg-panel hover:text-ink"
          onClick={onClose}
          type="button"
        >
          <X className="size-5" />
        </button>
        <p className="pr-10 text-2xl font-bold tracking-[-0.04em] text-ink">
          {title}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>

        <label
          className="mt-6 block text-sm font-bold text-ink"
          htmlFor="reason"
        >
          Причина решения
        </label>
        <textarea
          autoFocus
          className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-line bg-white px-4 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/10"
          id="reason"
          maxLength={500}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Например: разобрали тему на занятии, нужна проверка самостоятельности"
          value={reason}
        />
        <div className="mt-1 text-right text-xs text-muted">
          {reason.length}/500
        </div>

        {error && (
          <p className="mt-3 flex gap-2 text-sm font-medium text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="min-h-12 cursor-pointer rounded-2xl border border-line px-5 text-sm font-bold text-ink transition hover:bg-panel"
            disabled={isPending}
            onClick={onClose}
            type="button"
          >
            Отмена
          </button>
          <button
            className="min-h-12 cursor-pointer rounded-2xl bg-brand px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(19,66,112,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending || reason.trim().length < 3}
            onClick={() => onConfirm(reason.trim())}
            type="button"
          >
            {isPending ? "Сохраняем…" : "Подтвердить"}
          </button>
        </div>
      </section>
    </div>
  );
}
