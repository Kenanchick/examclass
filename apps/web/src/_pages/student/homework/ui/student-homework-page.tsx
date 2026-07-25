"use client";

import Image from "next/image";
import { useHomeworkQuery } from "@/entities/homework/api/use-homework-query";
import type { HomeworkAssignment } from "@/entities/homework/model/homework";
import { HomeworkAssignmentRow } from "@/entities/homework/ui/homework-assignment-row";
import { useRequireAuthModal } from "@/features/auth/modal/model/use-require-auth-modal";
import { RequestState } from "@/shared/ui/request-state/request-state";
import { StudentLayout } from "@/widgets/student-layout/ui/student-layout";

const emptyHomework: HomeworkAssignment[] = [];

export function StudentHomeworkPage() {
  const { hasAccessToken, openLogin } = useRequireAuthModal();
  const homeworkQuery = useHomeworkQuery(hasAccessToken === true);
  const homework = homeworkQuery.data ?? emptyHomework;

  if (hasAccessToken === false) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1320px]">
            <RequestState
              description="Войдите в аккаунт, чтобы увидеть задания от преподавателя и их дедлайны."
              onRetry={openLogin}
              retryLabel="Войти"
              title="Домашние задания доступны после входа"
              variant="empty"
            />
          </div>
        </main>
      </StudentLayout>
    );
  }

  if (hasAccessToken === null || homeworkQuery.isPending) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1320px]">
            <RequestState
              description="Получаем задания и сверяем даты с календарём."
              title="Открываем домашние задания…"
              variant="loading"
            />
          </div>
        </main>
      </StudentLayout>
    );
  }

  if (homeworkQuery.isError) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1320px]">
            <RequestState
              description="Не удалось получить домашние задания. Попробуйте загрузить их ещё раз."
              onRetry={() => void homeworkQuery.refetch()}
              title="Домашние задания временно недоступны"
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
        <div className="mx-auto max-w-[1320px]">
          <header className="relative flex min-h-56 items-center overflow-hidden rounded-3xl border border-[#bdd7ef] bg-[#eef6ff] px-6 sm:px-10">
            <div className="absolute -right-16 -top-28 size-80 rounded-full border-[42px] border-white/65" />
            <Image
              alt="Медвежонок с домашним заданием"
              className="relative z-10 h-auto w-32 self-end sm:w-40 lg:ml-4 lg:w-48"
              height={1448}
              priority
              src="/homework-bear.png"
              width={1086}
            />
            <div className="relative z-10 ml-5 py-8 sm:ml-9">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">
                Учебный план
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-ink sm:text-5xl lg:text-6xl">
                Домашнее задание
              </h1>
              <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted sm:text-lg">
                Все задания от преподавателей и их сроки — в одном месте.
              </p>
            </div>
          </header>

          {homework.length > 0 ? (
            <div className="bg-white px-6 sm:px-8 lg:px-10">
              <section aria-label="Список домашних заданий">
                {homework.map((assignment) => (
                  <HomeworkAssignmentRow
                    assignment={assignment}
                    key={assignment.publicId}
                  />
                ))}
              </section>
            </div>
          ) : (
            <div className="mt-6">
              <RequestState
                description="Когда преподаватель назначит первое домашнее задание, оно сразу появится здесь и в календаре профиля."
                title="Домашних заданий пока нет"
                variant="empty"
              />
            </div>
          )}
        </div>
      </main>
    </StudentLayout>
  );
}
