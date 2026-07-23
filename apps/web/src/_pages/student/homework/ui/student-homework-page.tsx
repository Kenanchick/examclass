"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useHomeworkQuery } from "@/entities/homework/api/use-homework-query";
import { getDeadlineMeta } from "@/entities/homework/lib/homework-deadline";
import type { HomeworkAssignment } from "@/entities/homework/model/homework";
import { HomeworkAssignmentRow } from "@/entities/homework/ui/homework-assignment-row";
import {
  type HomeworkFilter,
  useHomeworkFilterStore,
} from "@/features/homework/filter/model/use-homework-filter-store";
import { HomeworkOverview } from "@/features/homework/overview/ui/homework-overview";
import { useAccessToken } from "@/shared/model/use-access-token";
import { RequestState } from "@/shared/ui/request-state/request-state";
import { StudentLayout } from "@/widgets/student-layout/ui/student-layout";

const emptyHomework: HomeworkAssignment[] = [];

export function StudentHomeworkPage() {
  const router = useRouter();
  const hasAccessToken = useAccessToken();
  const homeworkQuery = useHomeworkQuery(hasAccessToken === true);
  const filter = useHomeworkFilterStore((state) => state.filter);
  const setFilter = useHomeworkFilterStore((state) => state.setFilter);
  const homework = homeworkQuery.data ?? emptyHomework;
  const preparedHomework = useMemo(
    () =>
      homework.map((assignment) => ({
        assignment,
        isOverdue: getDeadlineMeta(assignment.deadline).isOverdue,
      })),
    [homework],
  );
  const upcomingCount = preparedHomework.filter(
    (item) => !item.isOverdue,
  ).length;
  const overdueCount = preparedHomework.length - upcomingCount;
  const taskCount = homework.reduce(
    (total, assignment) => total + assignment.taskCount,
    0,
  );
  const visibleHomework = preparedHomework.filter(({ isOverdue }) => {
    if (filter === "upcoming") return !isOverdue;
    if (filter === "overdue") return isOverdue;
    return true;
  });
  const filterCounts: Record<HomeworkFilter, number> = {
    all: homework.length,
    upcoming: upcomingCount,
    overdue: overdueCount,
  };

  useEffect(() => {
    if (hasAccessToken === false) {
      router.replace("/login");
    }
  }, [hasAccessToken, router]);

  if (hasAccessToken !== true || homeworkQuery.isPending) {
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
          <header className="relative flex min-h-56 items-center overflow-hidden border-b border-[#bdd7ef] bg-[#eef6ff] px-6 sm:px-10">
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
            <>
              <HomeworkOverview
                activeFilter={filter}
                filterCounts={filterCounts}
                onFilterChange={setFilter}
                taskCount={taskCount}
              />

              <div className="bg-white px-6 sm:px-8 lg:px-10">
                {visibleHomework.length > 0 ? (
                  <section aria-label="Список домашних заданий">
                    {visibleHomework.map(({ assignment }) => (
                      <HomeworkAssignmentRow
                        assignment={assignment}
                        key={assignment.publicId}
                      />
                    ))}
                  </section>
                ) : (
                  <div className="py-14 text-center">
                    <p className="text-xl font-bold text-ink">
                      В этом разделе пока пусто
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      Выберите другой фильтр, чтобы увидеть задания.
                    </p>
                  </div>
                )}
              </div>
            </>
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
