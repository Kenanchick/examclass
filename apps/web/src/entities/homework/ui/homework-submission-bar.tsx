"use client";

import { CheckCircle2, Clock3, LoaderCircle, Send } from "lucide-react";
import type { HomeworkSubmissionStatus } from "../model/homework";

type HomeworkSubmissionBarProps = {
  attachedFilesCount: number;
  errorMessage: string | null;
  isFilesPending: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  requiredFilesCount: number;
  status: HomeworkSubmissionStatus | null;
  successMessage: string | null;
};

export function HomeworkSubmissionBar({
  attachedFilesCount,
  errorMessage,
  isFilesPending,
  isSubmitting,
  onSubmit,
  requiredFilesCount,
  status,
  successMessage,
}: HomeworkSubmissionBarProps) {
  const isSubmitted = status === "SUBMITTED" || status === "REVIEWED";
  const hasAllFiles = attachedFilesCount >= requiredFilesCount;

  return (
    <section className="rounded-3xl border border-line bg-white p-5 shadow-[0_16px_35px_rgba(15,43,76,0.06)] sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xl font-bold tracking-[-0.03em] text-ink">
            {isSubmitted ? "Работа отправлена" : "Готово к отправке?"}
          </p>
          <p className="mt-1.5 text-sm leading-6 text-muted">
            {isSubmitted
              ? "Преподаватель получил работу и сможет проверить прикреплённые решения."
              : requiredFilesCount > 0
                ? `Файлы для второй части: ${attachedFilesCount} из ${requiredFilesCount}`
                : "В этой работе нет задач второй части с файлами."}
          </p>
        </div>

        {isSubmitted ? (
          <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-success/10 px-5 py-3.5 text-sm font-bold text-success">
            <CheckCircle2 className="size-5" />
            Отправлено преподавателю
          </span>
        ) : (
          <button
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-6 py-4 text-base font-bold text-white shadow-[0_12px_24px_rgba(11,69,116,0.18)] transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-55"
            disabled={!hasAllFiles || isFilesPending || isSubmitting}
            onClick={onSubmit}
            type="button"
          >
            {isSubmitting ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <Send className="size-5" />
            )}
            Отправить на проверку
          </button>
        )}
      </div>

      {!isSubmitted && requiredFilesCount > 0 && !hasAllFiles && (
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-muted">
          <Clock3 className="size-4 text-brand" />
          Прикрепите файл к каждой задаче второй части, чтобы отправить работу.
        </p>
      )}

      {errorMessage && (
        <p className="mt-4 text-sm font-medium text-danger" role="alert">
          {errorMessage}
        </p>
      )}
      {successMessage && !isSubmitted && (
        <p className="mt-4 text-sm font-medium text-success" role="status">
          {successMessage}
        </p>
      )}
    </section>
  );
}
