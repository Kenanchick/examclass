"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpen,
  Check,
  GraduationCap,
  Hash,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  teacherHomeworkQueryKey,
  useAddTeacherStudentMutation,
  useTeacherHomeworkStudentsQuery,
} from "@/entities/teacher-homework/api/use-teacher-homework-query";
import type { TeacherHomeworkStudent } from "@/entities/teacher-homework/model/teacher-homework";
import { useRequireAuthModal } from "@/features/auth/modal/model/use-require-auth-modal";
import { getApiErrorMessage } from "@/shared/lib/get-api-error-message";
import { RequestState } from "@/shared/ui/request-state/request-state";
import { StudentLayout } from "@/widgets/student-layout/ui/student-layout";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function StudentCard({ student }: { student: TeacherHomeworkStudent }) {
  return (
    <article className="group rounded-[1.5rem] border border-line bg-white p-5 shadow-[0_10px_30px_rgba(15,43,76,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,43,76,0.1)]">
      <div className="flex items-center gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#d9edff] to-[#8fc5f6] text-lg font-extrabold text-brand shadow-[inset_0_-3px_0_rgba(19,66,112,0.15)]">
          {getInitials(student.name)}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold tracking-[-0.025em] text-ink">
            {student.name}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 truncate text-sm font-semibold text-brand">
            <BookOpen className="size-4 shrink-0" />
            {student.classroom.subject}
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-sm text-muted">
        <GraduationCap className="size-4 shrink-0 text-brand" />
        <span className="truncate">{student.classroom.title}</span>
      </div>
    </article>
  );
}

export function TeacherStudentsPage() {
  const queryClient = useQueryClient();
  const { hasAccessToken, openLogin } = useRequireAuthModal();
  const studentsQuery = useTeacherHomeworkStudentsQuery(
    hasAccessToken === true,
  );
  const addStudentMutation = useAddTeacherStudentMutation();
  const [studentId, setStudentId] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const students = studentsQuery.data ?? [];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedStudentId = studentId.trim();

    if (!normalizedStudentId) {
      setSubmitSuccess(null);
      setSubmitError("Введите ID ученика из его личного кабинета.");
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(null);
    addStudentMutation.mutate(
      { studentId: normalizedStudentId },
      {
        onSuccess: () => {
          setStudentId("");
          setSubmitSuccess("Ученик добавлен. Теперь ему можно назначать ДЗ.");
          void queryClient.invalidateQueries({
            queryKey: [...teacherHomeworkQueryKey, "students"],
          });
        },
        onError: (error) => {
          setSubmitError(
            getApiErrorMessage(
              error,
              "Не удалось добавить ученика. Проверьте ID и попробуйте ещё раз.",
            ),
          );
        },
      },
    );
  };

  if (hasAccessToken === false) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1500px]">
            <RequestState
              description="Войдите в аккаунт преподавателя, чтобы видеть учеников и добавлять новых."
              onRetry={openLogin}
              retryLabel="Войти"
              title="Список учеников доступен после входа"
              variant="empty"
            />
          </div>
        </main>
      </StudentLayout>
    );
  }

  if (hasAccessToken === null || studentsQuery.isPending) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1500px]">
            <RequestState
              description="Загружаем список учеников и их классы."
              title="Открываем список учеников…"
              variant="loading"
            />
          </div>
        </main>
      </StudentLayout>
    );
  }

  if (studentsQuery.isError) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1500px]">
            <RequestState
              description="Раздел доступен преподавателю. Проверьте режим кабинета и попробуйте ещё раз."
              onRetry={() => void studentsQuery.refetch()}
              title="Не получилось загрузить учеников"
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
        <div className="mx-auto max-w-[1500px] space-y-6">
          <header className="relative overflow-hidden rounded-[2rem] border border-[#c6ddf5] bg-[#eef6ff] px-6 py-8 sm:px-10 sm:py-10">
            <div className="absolute -right-20 -top-24 size-80 rounded-full border-[34px] border-white/65" />
            <div className="absolute -bottom-24 right-48 size-64 rounded-full bg-[#dceeff]/80" />
            <div className="relative z-10 max-w-3xl">
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.13em] text-brand">
                <UsersRound className="size-4" /> Кабинет преподавателя
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-[-0.055em] text-ink sm:text-5xl">
                Ученики
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted sm:text-lg">
                Добавляйте учеников по ID из их профиля — после этого они сразу
                появятся в списке получателей домашнего задания.
              </p>
            </div>
          </header>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-[2rem] border border-line bg-white p-5 shadow-[0_16px_35px_rgba(15,43,76,0.05)] sm:p-7">
              <div className="flex flex-col gap-2 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-[-0.04em] text-ink">
                    Ваши ученики
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
                    Здесь только самое важное: имя, предмет и класс.
                  </p>
                </div>
                {students.length > 0 && (
                  <p className="text-sm font-semibold text-muted">
                    {students.length}{" "}
                    {students.length === 1
                      ? "ученик"
                      : students.length < 5
                        ? "ученика"
                        : "учеников"}
                  </p>
                )}
              </div>

              {students.length > 0 ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {students.map((student) => (
                    <StudentCard key={student.id} student={student} />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl px-6 py-12 text-center">
                  <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#eef6ff] text-brand">
                    <GraduationCap className="size-7" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-ink">
                    Пока нет учеников
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                    Попросите ученика открыть профиль, скопировать свой ID и
                    передать его вам.
                  </p>
                </div>
              )}
            </section>

            <aside className="rounded-[2rem] border border-line bg-white p-5 shadow-[0_16px_35px_rgba(15,43,76,0.05)] sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eaf4ff] text-brand">
                  <UserRoundPlus className="size-5" />
                </span>
                <div>
                  <h2 className="text-xl font-bold tracking-[-0.03em] text-ink">
                    Добавить ученика
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Ученик найдёт ID в личном кабинете и передаст его вам.
                  </p>
                </div>
              </div>

              <form className="mt-6" onSubmit={handleSubmit}>
                <label
                  className="text-sm font-bold text-ink"
                  htmlFor="student-id"
                >
                  ID ученика
                </label>
                <div className="relative mt-2">
                  <Hash className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
                  <input
                    className="h-14 w-full rounded-2xl border border-line bg-white pl-11 pr-4 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10"
                    id="student-id"
                    onChange={(event) => setStudentId(event.target.value)}
                    placeholder="Например, cm…"
                    value={studentId}
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Добавление привяжет ученика к вашему активному классу.
                </p>

                {submitError && (
                  <p
                    className="mt-4 flex items-start gap-2 text-sm font-medium text-danger"
                    role="alert"
                  >
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <span>{submitError}</span>
                  </p>
                )}
                {submitSuccess && (
                  <p
                    className="mt-4 flex items-start gap-2 text-sm font-medium text-success"
                    role="status"
                  >
                    <Check className="mt-0.5 size-4 shrink-0" />
                    <span>{submitSuccess}</span>
                  </p>
                )}

                <button
                  className="mt-5 inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand px-5 text-base font-bold text-white shadow-[0_10px_24px_rgba(19,66,112,0.18)] transition hover:-translate-y-0.5 hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={addStudentMutation.isPending}
                  type="submit"
                >
                  <UserRoundPlus className="size-5" />
                  {addStudentMutation.isPending
                    ? "Добавляем…"
                    : "Добавить ученика"}
                </button>
              </form>
            </aside>
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}
