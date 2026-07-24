"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, CalendarDays, ClipboardCheck } from "lucide-react";
import {
  useFavoriteMutations,
  useFavoritesQuery,
} from "@/entities/favorite/api/use-favorites-query";
import {
  useHomeworkAssignmentQuery,
  useHomeworkSubmissionMutations,
} from "@/entities/homework/api/use-homework-query";
import { getDeadlineMeta } from "@/entities/homework/lib/homework-deadline";
import { useHomeworkSubmissionStore } from "@/entities/homework/model/homework-submission-store";
import { HomeworkSubmissionBar } from "@/entities/homework/ui/homework-submission-bar";
import { HomeworkTaskResponseField } from "@/entities/homework/ui/homework-task-response-field";
import { TaskCard } from "@/entities/task/ui/task-card";
import type { ApiErrorResponse } from "@/shared/api/auth";
import { useAccessToken } from "@/shared/model/use-access-token";
import { RequestState } from "@/shared/ui/request-state/request-state";
import { StudentLayout } from "@/widgets/student-layout/ui/student-layout";

type StudentHomeworkAssignmentPageProps = {
  publicId: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data.message;

    return (Array.isArray(message) ? message[0] : message) ?? fallback;
  }

  return fallback;
}

export function StudentHomeworkAssignmentPage({
  publicId,
}: StudentHomeworkAssignmentPageProps) {
  const router = useRouter();
  const hasAccessToken = useAccessToken();
  const assignmentQuery = useHomeworkAssignmentQuery(
    publicId,
    hasAccessToken === true,
  );
  const favoritesQuery = useFavoritesQuery(hasAccessToken === true);
  const { addMutation, removeMutation } = useFavoriteMutations();
  const { deleteAttachmentMutation, submitMutation, uploadAttachmentMutation } =
    useHomeworkSubmissionMutations(publicId);
  const clearAssignment = useHomeworkSubmissionStore(
    (state) => state.clearAssignment,
  );
  const clearPendingFile = useHomeworkSubmissionStore(
    (state) => state.clearPendingFile,
  );
  const setPendingFile = useHomeworkSubmissionStore(
    (state) => state.setPendingFile,
  );
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(
    null,
  );
  const assignment = assignmentQuery.data;
  const isMissing =
    axios.isAxiosError(assignmentQuery.error) &&
    assignmentQuery.error.response?.status === 404;

  useEffect(() => {
    if (hasAccessToken === false) {
      router.replace("/login");
    }
  }, [hasAccessToken, router]);

  useEffect(
    () => () => {
      clearAssignment(publicId);
    },
    [clearAssignment, publicId],
  );

  if (hasAccessToken !== true || assignmentQuery.isPending) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1320px]">
            <RequestState
              description="Собираем задания, которые назначил преподаватель."
              title="Открываем домашнее задание…"
              variant="loading"
            />
          </div>
        </main>
      </StudentLayout>
    );
  }

  if (assignmentQuery.isError || !assignment) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1320px]">
            <RequestState
              backHref="/homework"
              backLabel="К домашним заданиям"
              description={
                isMissing
                  ? "Возможно, срок задания истёк или ссылка больше не актуальна."
                  : "Не получилось получить задания с сервера. Попробуйте загрузить страницу ещё раз."
              }
              onRetry={
                isMissing ? undefined : () => void assignmentQuery.refetch()
              }
              title={
                isMissing
                  ? "Домашнее задание не найдено"
                  : "Не удалось загрузить домашнее задание"
              }
              variant={isMissing ? "not-found" : "error"}
            />
          </div>
        </main>
      </StudentLayout>
    );
  }

  const deadline = getDeadlineMeta(assignment.deadline);
  const isFavoritePending = addMutation.isPending || removeMutation.isPending;
  const isSubmissionLocked =
    assignment.submission?.status === "SUBMITTED" ||
    assignment.submission?.status === "REVIEWED";
  const isSubmissionBusy =
    uploadAttachmentMutation.isPending || deleteAttachmentMutation.isPending;
  const secondPartTasks = assignment.tasks.filter(
    (task) => task.examPart === "SECOND",
  );
  const attachmentByTaskPublicId = new Map(
    assignment.submission?.attachments.map((attachment) => [
      attachment.taskPublicId,
      attachment,
    ]),
  );
  const attachedFilesCount = secondPartTasks.filter((task) =>
    attachmentByTaskPublicId.has(task.publicId),
  ).length;

  const handleFavorite = (taskPublicId: string) => {
    const isFavorite = favoritesQuery.data?.some(
      (task) => task.publicId === taskPublicId,
    );

    if (isFavorite) {
      removeMutation.mutate(taskPublicId);
      return;
    }

    addMutation.mutate(taskPublicId);
  };

  const handleUpload = (taskPublicId: string, file: File) => {
    setSubmissionError(null);
    setSubmissionSuccess(null);
    setPendingFile(publicId, taskPublicId, file);

    uploadAttachmentMutation.mutate(
      { file, taskPublicId },
      {
        onError: (error) => {
          setSubmissionError(
            getErrorMessage(
              error,
              "Не удалось прикрепить файл. Попробуйте ещё раз.",
            ),
          );
        },
        onSettled: () => {
          clearPendingFile(publicId, taskPublicId);
        },
      },
    );
  };

  const handleDelete = (taskPublicId: string) => {
    setSubmissionError(null);
    setSubmissionSuccess(null);

    deleteAttachmentMutation.mutate(taskPublicId, {
      onError: (error) => {
        setSubmissionError(
          getErrorMessage(
            error,
            "Не удалось удалить файл. Попробуйте ещё раз.",
          ),
        );
      },
    });
  };

  const handleSubmit = () => {
    setSubmissionError(null);
    setSubmissionSuccess(null);

    submitMutation.mutate(undefined, {
      onSuccess: (submission) => {
        setSubmissionSuccess(
          submission.isLate
            ? "Работа отправлена преподавателю с отметкой о просрочке."
            : "Работа отправлена преподавателю на проверку.",
        );
      },
      onError: (error) => {
        setSubmissionError(
          getErrorMessage(
            error,
            "Не удалось отправить работу. Проверьте файлы и попробуйте ещё раз.",
          ),
        );
      },
    });
  };

  return (
    <StudentLayout>
      <main className="min-w-0 p-4 sm:p-7 lg:p-8">
        <div className="mx-auto max-w-[1320px]">
          <Link
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-muted transition hover:text-brand"
            href="/homework"
          >
            <ArrowLeft className="size-4" />
            Домашние задания
          </Link>

          <section className="relative mt-5 overflow-hidden rounded-3xl border border-[#c6ddf5] bg-[#eef6ff] px-7 py-8 sm:px-9">
            <div className="relative z-10 max-w-3xl">
              <p className="text-sm font-semibold text-brand">
                {assignment.classroom.subject.name}
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-ink sm:text-[2.7rem]">
                {assignment.title}
              </h1>
              {assignment.description && (
                <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted sm:text-base">
                  {assignment.description}
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-muted">
                <span className="inline-flex items-center gap-2">
                  <ClipboardCheck className="size-4 text-brand" />
                  {assignment.taskCount} заданий
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-4 text-brand" />
                  До {deadline.fullDate}, {deadline.time}
                </span>
              </div>
            </div>
            <Image
              alt="Медвежонок с домашним заданием"
              className="absolute -bottom-12 right-2 hidden h-auto w-44 lg:block"
              height={1448}
              src="/homework-bear.png"
              width={1086}
            />
          </section>

          <section
            aria-label="Задания домашней работы"
            className="mt-6 space-y-6"
          >
            {assignment.tasks.map((task, index) => {
              const isFavorite = favoritesQuery.data?.some(
                (favorite) => favorite.publicId === task.publicId,
              );

              return (
                <TaskCard
                  isFavorite={Boolean(isFavorite)}
                  isFavoritePending={isFavoritePending}
                  key={task.publicId}
                  onToggleFavorite={() => handleFavorite(task.publicId)}
                  responseSlot={
                    task.examPart === "SECOND" ? (
                      <HomeworkTaskResponseField
                        assignmentPublicId={publicId}
                        attachment={attachmentByTaskPublicId.get(task.publicId)}
                        isBusy={isSubmissionBusy}
                        isLocked={isSubmissionLocked}
                        onDelete={() => handleDelete(task.publicId)}
                        onUpload={(file) => handleUpload(task.publicId, file)}
                        taskPublicId={task.publicId}
                      />
                    ) : undefined
                  }
                  showReferenceSolution={false}
                  task={task}
                  taskNumber={index + 1}
                />
              );
            })}
          </section>

          <div className="mt-6">
            <HomeworkSubmissionBar
              attachedFilesCount={attachedFilesCount}
              errorMessage={submissionError}
              isFilesPending={isSubmissionBusy}
              isSubmitting={submitMutation.isPending}
              onSubmit={handleSubmit}
              requiredFilesCount={secondPartTasks.length}
              status={assignment.submission?.status ?? null}
              successMessage={submissionSuccess}
            />
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}
