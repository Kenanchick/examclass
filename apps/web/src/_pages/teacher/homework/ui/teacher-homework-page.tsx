"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ClipboardCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSubjectsQuery } from "@/entities/subject/api/use-subjects-query";
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
import { TeacherHomeworkTopicPicker } from "@/entities/teacher-homework/ui/teacher-homework-topic-picker";
import { useSubjectTopicsQuery } from "@/entities/topic/api/use-subject-topics-query";
import type { ApiErrorResponse } from "@/shared/api/auth";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { RequestState } from "@/shared/ui/request-state/request-state";
import { SelectMenu } from "@/shared/ui/select-menu";
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
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string | null>(
    null,
  );
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [taskSearch, setTaskSearch] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const subjectsQuery = useSubjectsQuery();
  const studentsQuery = useTeacherHomeworkStudentsQuery();
  const createAssignmentMutation = useCreateTeacherHomeworkAssignmentMutation();
  const assignmentForm = useForm<TeacherHomeworkAssignmentFormValues>({
    resolver: zodResolver(teacherHomeworkAssignmentSchema),
    defaultValues: defaultFormValues,
    mode: "onChange",
  });

  const subjects = subjectsQuery.data ?? [];
  const activeSubjectCode = selectedSubjectCode ?? subjects[0]?.code ?? null;
  const activeSubject =
    subjects.find((subject) => subject.code === activeSubjectCode) ?? null;
  const topicsQuery = useSubjectTopicsQuery(activeSubjectCode);
  const selectedTopic = topicsQuery.data?.topics
    .flatMap((topic) => [topic, ...topic.children])
    .find((topic) => topic.id === selectedTopicId);
  const debouncedTaskSearch = useDebouncedValue(taskSearch.trim());
  const taskQueryFilters = useMemo(
    () => ({
      search: debouncedTaskSearch || undefined,
      subjectCode: activeSubjectCode ?? undefined,
      topicId: selectedTopicId ?? undefined,
    }),
    [activeSubjectCode, debouncedTaskSearch, selectedTopicId],
  );
  const tasksQuery = useTeacherHomeworkTasksQuery(
    taskQueryFilters,
    Boolean(selectedTopicId),
  );
  const taskPages = tasksQuery.data?.pages ?? [];
  const tasks = taskPages.flatMap((page) => page.tasks);
  const totalTasks = taskPages[0]?.total ?? 0;
  const students = studentsQuery.data ?? [];
  const isInitialLoading = subjectsQuery.isPending || studentsQuery.isPending;
  const hasInitialError =
    (subjectsQuery.isError && !subjectsQuery.data) ||
    (studentsQuery.isError && !studentsQuery.data);

  const updateTaskSelection = (taskPublicIds: string[]) => {
    assignmentForm.setValue("taskPublicIds", taskPublicIds, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const resetTaskSearch = () => {
    setTaskSearch("");
  };

  const handleSubjectChange = (subjectCode: string) => {
    setSelectedSubjectCode(subjectCode);
    setSelectedTopicId(null);
    resetTaskSearch();
  };

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopicId(topicId);
    resetTaskSearch();
  };

  const handleBackToTopics = () => {
    setSelectedTopicId(null);
    resetTaskSearch();
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
          <div className="mx-auto max-w-[1760px]">
            <RequestState
              description="Загружаем темы и список учеников."
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
          <div className="mx-auto max-w-[1760px]">
            <RequestState
              description="Не удалось получить темы или список учеников. Проверьте подключение и попробуйте ещё раз."
              onRetry={() => {
                void subjectsQuery.refetch();
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
        <div className="mx-auto max-w-[1760px]">
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
                Сначала выберите тему, затем отметьте задачи, добавьте срок и
                учеников — всё на одной понятной странице.
              </p>
            </div>
          </header>

          <div className="mt-6 grid items-start gap-6 2xl:grid-cols-[minmax(0,1.55fr)_minmax(390px,0.75fr)]">
            {selectedTopicId && selectedTopic ? (
              <TeacherHomeworkTaskSelector
                errorMessage={
                  assignmentForm.formState.errors.taskPublicIds?.message
                }
                hasNextPage={Boolean(tasksQuery.hasNextPage)}
                isLoading={tasksQuery.isPending}
                isLoadingNextPage={tasksQuery.isFetchingNextPage}
                isSearching={
                  taskSearch.trim() !== debouncedTaskSearch ||
                  (tasksQuery.isFetching && !tasksQuery.isFetchingNextPage)
                }
                onBackToTopics={handleBackToTopics}
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
                taskErrorMessage={
                  tasksQuery.isError
                    ? "Не удалось загрузить задачи этой темы."
                    : undefined
                }
                tasks={tasks.length > 0 ? tasks : emptyTasks}
                topicName={selectedTopic.name}
                totalTasks={totalTasks}
              />
            ) : (
              <section
                aria-labelledby="teacher-homework-topics-title"
                className="rounded-[2rem] border border-line bg-white p-5 shadow-[0_16px_35px_rgba(15,43,76,0.05)] sm:p-7"
              >
                <div className="border-b border-line pb-6">
                  <div className="flex gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-base font-bold text-white">
                      1
                    </span>
                    <div className="min-w-0">
                      <h2
                        className="text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl"
                        id="teacher-homework-topics-title"
                      >
                        Выберите тему
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
                        Откройте нужный раздел — внутри будут только его задачи,
                        а поиск по условию или ID поможет быстро найти нужную.
                      </p>
                    </div>
                  </div>

                  {subjects.length > 1 && (
                    <label className="mt-5 block max-w-sm">
                      <span className="text-sm font-bold text-ink">
                        Предмет
                      </span>
                      <SelectMenu
                        ariaLabel="Выберите предмет"
                        className="mt-2"
                        onChange={handleSubjectChange}
                        options={subjects.map((subject) => ({
                          value: subject.code,
                          label: subject.name,
                        }))}
                        value={activeSubjectCode ?? ""}
                      />
                    </label>
                  )}
                </div>

                <div className="mt-6">
                  {!activeSubject ? (
                    <div className="rounded-2xl border border-dashed border-line bg-page px-5 py-10 text-center">
                      <p className="text-lg font-bold text-ink">
                        Предметов пока нет
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        Добавьте предмет и темы в банк задач, чтобы начать
                        выдачу домашнего задания.
                      </p>
                    </div>
                  ) : topicsQuery.isPending ? (
                    <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-line bg-page px-5 text-sm font-semibold text-muted">
                      Загружаем темы…
                    </div>
                  ) : topicsQuery.isError ? (
                    <RequestState
                      description="Не удалось получить темы этого предмета."
                      onRetry={() => void topicsQuery.refetch()}
                      title="Не получилось загрузить темы"
                      variant="error"
                    />
                  ) : (
                    <TeacherHomeworkTopicPicker
                      onSelectTopic={handleTopicSelect}
                      subjectName={activeSubject.name}
                      topics={topicsQuery.data?.topics ?? []}
                    />
                  )}
                </div>
              </section>
            )}

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
        </div>
      </main>
    </StudentLayout>
  );
}
