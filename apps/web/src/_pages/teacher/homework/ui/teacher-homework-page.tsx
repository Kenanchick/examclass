"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ClipboardCheck, FilePlus2 } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useCreateTeacherHomeworkAssignmentMutation,
  useTeacherHomeworkStudentsQuery,
  useTeacherHomeworkTasksQuery,
} from "@/entities/teacher-homework/api/use-teacher-homework-query";
import { toggleSelection } from "@/entities/teacher-homework/lib/selection";
import type { TeacherHomeworkTask } from "@/entities/teacher-homework/model/teacher-homework";
import {
  teacherHomeworkAssignmentSchema,
  type TeacherHomeworkAssignmentFormValues,
} from "@/entities/teacher-homework/model/teacher-homework.schema";
import { TeacherHomeworkAssignmentForm } from "@/entities/teacher-homework/ui/teacher-homework-assignment-form";
import { TeacherHomeworkTaskSelector } from "@/entities/teacher-homework/ui/teacher-homework-task-selector";
import type { ApiErrorResponse } from "@/shared/api/auth";
import { RequestState } from "@/shared/ui/request-state/request-state";
import { StudentLayout } from "@/widgets/student-layout/ui/student-layout";

const emptyTasks: TeacherHomeworkTask[] = [];

const defaultFormValues: TeacherHomeworkAssignmentFormValues = {
  title: "",
  description: "",
  deadline: "",
  taskPublicIds: [],
  studentIds: [],
};

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data.message;

    return (Array.isArray(message) ? message[0] : message) ?? fallback;
  }

  return fallback;
}

export function TeacherHomeworkPage() {
  const queryClient = useQueryClient();
  const [taskSearch, setTaskSearch] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const deferredTaskSearch = useDeferredValue(taskSearch.trim());
  const tasksQuery = useTeacherHomeworkTasksQuery(deferredTaskSearch);
  const studentsQuery = useTeacherHomeworkStudentsQuery();
  const createAssignmentMutation = useCreateTeacherHomeworkAssignmentMutation();
  const assignmentForm = useForm<TeacherHomeworkAssignmentFormValues>({
    resolver: zodResolver(teacherHomeworkAssignmentSchema),
    defaultValues: defaultFormValues,
    mode: "onChange",
  });

  const taskPages = tasksQuery.data?.pages ?? [];
  const tasks = taskPages.flatMap((page) => page.tasks);
  const totalTasks = taskPages[0]?.total ?? 0;
  const students = studentsQuery.data ?? [];
  const isInitialLoading = tasksQuery.isPending || studentsQuery.isPending;
  const hasInitialError =
    (tasksQuery.isError && !tasksQuery.data) ||
    (studentsQuery.isError && !studentsQuery.data);

  const updateTaskSelection = (taskPublicIds: string[]) => {
    assignmentForm.setValue("taskPublicIds", taskPublicIds, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleCreateAssignment = (
    values: TeacherHomeworkAssignmentFormValues,
  ) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    createAssignmentMutation.mutate(
      {
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        deadline: new Date(values.deadline).toISOString(),
        taskPublicIds: values.taskPublicIds,
        studentIds: values.studentIds,
      },
      {
        onSuccess: () => {
          assignmentForm.reset(defaultFormValues);
          setSubmitSuccess(
            "Домашнее задание назначено. Оно уже появилось у выбранных учеников.",
          );
          void queryClient.invalidateQueries({ queryKey: ["homework"] });
        },
        onError: (error) => {
          setSubmitError(
            getErrorMessage(
              error,
              "Не удалось назначить домашнее задание. Попробуйте ещё раз.",
            ),
          );
        },
      },
    );
  };

  if (isInitialLoading) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1480px]">
            <RequestState
              description="Загружаем банк задач и список учеников."
              title="Готовим выдачу домашнего задания…"
              variant="loading"
            />
          </div>
        </main>
      </StudentLayout>
    );
  }

  if (hasInitialError) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1480px]">
            <RequestState
              description="Не удалось получить задачи или список учеников. Проверьте подключение и попробуйте ещё раз."
              onRetry={() => {
                void tasksQuery.refetch();
                void studentsQuery.refetch();
              }}
              title="Не получилось открыть выдачу домашнего задания"
              variant="error"
            />
          </div>
        </main>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <main className="min-w-0 p-4 sm:p-7 lg:p-8">
        <div className="mx-auto max-w-[1480px]">
          <header className="relative overflow-hidden rounded-[2rem] border border-[#c6ddf5] bg-[#eef6ff] px-6 py-8 sm:px-9 sm:py-10">
            <div className="absolute -right-16 -top-20 size-72 rounded-full border-[34px] border-white/60" />
            <div className="relative z-10 max-w-3xl">
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.13em] text-brand">
                <ClipboardCheck className="size-4" />
                Кабинет преподавателя
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-[-0.055em] text-ink sm:text-5xl">
                Выдать домашнее задание
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted sm:text-lg">
                Соберите подходящие задачи, добавьте срок и выберите учеников —
                всё на одной понятной странице.
              </p>
            </div>
          </header>

          <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(350px,0.85fr)]">
            <TeacherHomeworkTaskSelector
              errorMessage={
                assignmentForm.formState.errors.taskPublicIds?.message ??
                (tasksQuery.isError
                  ? "Не удалось подгрузить следующую страницу задач."
                  : undefined)
              }
              hasNextPage={Boolean(tasksQuery.hasNextPage)}
              isLoadingNextPage={tasksQuery.isFetchingNextPage}
              isSearching={
                taskSearch.trim() !== deferredTaskSearch ||
                (tasksQuery.isFetching && !tasksQuery.isFetchingNextPage)
              }
              onClearSelection={() => updateTaskSelection([])}
              onLoadNextPage={() => void tasksQuery.fetchNextPage()}
              onSearchChange={setTaskSearch}
              onToggleTask={(taskPublicId) =>
                updateTaskSelection(
                  toggleSelection(
                    assignmentForm.getValues("taskPublicIds"),
                    taskPublicId,
                  ),
                )
              }
              search={taskSearch}
              selectedTaskIds={assignmentForm.watch("taskPublicIds")}
              tasks={tasks.length > 0 ? tasks : emptyTasks}
              totalTasks={totalTasks}
            />

            <div className="xl:sticky xl:top-6">
              <TeacherHomeworkAssignmentForm
                form={assignmentForm}
                isSubmitting={createAssignmentMutation.isPending}
                onSubmit={handleCreateAssignment}
                students={students}
                submitError={submitError}
                submitSuccess={submitSuccess}
              />
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-white px-5 py-4 text-sm leading-6 text-muted">
            <FilePlus2 className="mt-0.5 size-5 shrink-0 text-brand" />
            <p>
              Задание можно выдать нескольким ученикам сразу. У каждого из них
              оно появится в личном кабинете с выбранным сроком.
            </p>
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}
