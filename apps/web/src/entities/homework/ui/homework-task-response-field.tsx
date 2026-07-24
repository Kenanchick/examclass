"use client";

import {
  CheckCircle2,
  FileText,
  LoaderCircle,
  Paperclip,
  Trash2,
  UploadCloud,
} from "lucide-react";
import type { HomeworkSubmissionAttachment } from "../model/homework";
import { useHomeworkSubmissionStore } from "../model/homework-submission-store";

type HomeworkTaskResponseFieldProps = {
  assignmentPublicId: string;
  attachment?: HomeworkSubmissionAttachment;
  isBusy: boolean;
  isLocked: boolean;
  onDelete: () => void;
  onUpload: (file: File) => void;
  taskPublicId: string;
};

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} КБ`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export function HomeworkTaskResponseField({
  assignmentPublicId,
  attachment,
  isBusy,
  isLocked,
  onDelete,
  onUpload,
  taskPublicId,
}: HomeworkTaskResponseFieldProps) {
  const pendingFile = useHomeworkSubmissionStore(
    (state) => state.pendingFiles[assignmentPublicId]?.[taskPublicId],
  );
  const inputId = `homework-file-${assignmentPublicId}-${taskPublicId}`;
  const isUploading = Boolean(pendingFile && isBusy);

  return (
    <div className="mt-10 rounded-2xl border border-[#c6ddf5] bg-[#eef6ff]/70 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-lg font-bold text-ink">
            <Paperclip className="size-5 text-brand" />
            Развёрнутый ответ — файлом
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Прикрепите скан решения или PDF. После отправки его увидит
            преподаватель при проверке.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand shadow-sm">
          Вторая часть
        </span>
      </div>

      {attachment ? (
        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[#b8d7f3] bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-success/10 text-success">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink sm:text-base">
                {attachment.originalName}
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-muted">
                <CheckCircle2 className="size-4 text-success" />
                Файл прикреплён · {formatFileSize(attachment.sizeBytes)}
              </p>
            </div>
          </div>

          {!isLocked && (
            <div className="flex flex-wrap gap-2">
              <label
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand/25 bg-brand/5 px-4 py-2.5 text-sm font-bold text-brand transition hover:bg-brand/10 has-[:disabled]:cursor-wait has-[:disabled]:opacity-60"
                htmlFor={inputId}
              >
                {isUploading ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <UploadCloud className="size-4" />
                )}
                {isUploading ? "Загружаем…" : "Заменить"}
                <input
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={isBusy}
                  id={inputId}
                  onChange={(event) => {
                    const [file] = event.target.files ?? [];

                    if (file) {
                      onUpload(file);
                    }

                    event.currentTarget.value = "";
                  }}
                  type="file"
                />
              </label>
              <button
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-danger/20 bg-white px-4 py-2.5 text-sm font-bold text-danger transition hover:bg-danger/5 disabled:cursor-wait disabled:opacity-60"
                disabled={isBusy}
                onClick={onDelete}
                type="button"
              >
                <Trash2 className="size-4" />
                Удалить
              </button>
            </div>
          )}
        </div>
      ) : (
        <label
          className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-brand/35 bg-white px-5 py-8 text-center transition hover:border-brand hover:bg-brand/5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
          htmlFor={inputId}
        >
          {isUploading ? (
            <LoaderCircle className="size-7 animate-spin text-brand" />
          ) : (
            <UploadCloud className="size-7 text-brand" />
          )}
          <span className="mt-3 text-base font-bold text-brand">
            {isUploading ? "Загружаем файл…" : "Прикрепить файл с решением"}
          </span>
          <span className="mt-1 text-sm text-muted">
            {isUploading && pendingFile
              ? `${pendingFile.name} · ${formatFileSize(pendingFile.sizeBytes)}`
              : "PDF, JPG, PNG или WEBP — до 15 МБ"}
          </span>
          <input
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={isBusy || isLocked}
            id={inputId}
            onChange={(event) => {
              const [file] = event.target.files ?? [];

              if (file) {
                onUpload(file);
              }

              event.currentTarget.value = "";
            }}
            type="file"
          />
        </label>
      )}

      {isLocked && (
        <p className="mt-4 text-sm font-medium text-muted">
          Работа отправлена: изменить прикреплённый файл уже нельзя.
        </p>
      )}
    </div>
  );
}
