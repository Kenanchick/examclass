"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, ListTree } from "lucide-react";
import {
  useFavoriteMutations,
  useFavoritesQuery,
} from "@/entities/favorite/api/use-favorites-query";
import { TaskCard } from "@/entities/task/ui/task-card";
import { useTopicTasksQuery } from "@/entities/topic/api/use-topic-tasks-query";
import { formatTaskCount } from "@/entities/topic/lib/format-task-count";
import { RequestState } from "@/shared/ui/request-state/request-state";
import { StudentLayout } from "@/widgets/student-layout/ui/student-layout";
import { TaskBankSidebar } from "@/widgets/task-bank-sidebar/ui/task-bank-sidebar";

type StudentTopicTasksPageProps = {
  topicId: string;
};

export function StudentTopicTasksPage({ topicId }: StudentTopicTasksPageProps) {
  const router = useRouter();
  const topicTasksQuery = useTopicTasksQuery(topicId);
  const [hasAccessToken, setHasAccessToken] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const favoritesQuery = useFavoritesQuery(hasAccessToken);
  const { addMutation, removeMutation } = useFavoriteMutations();
  const data = topicTasksQuery.data;
  const isTopicMissing =
    axios.isAxiosError(topicTasksQuery.error) &&
    topicTasksQuery.error.response?.status === 404;

  useEffect(() => {
    setHasAccessToken(Boolean(window.localStorage.getItem("accessToken")));
  }, []);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [topicId]);

  if (topicTasksQuery.isPending) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1320px]">
            <RequestState variant="loading" />
          </div>
        </main>
      </StudentLayout>
    );
  }

  if (topicTasksQuery.isError || !data) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1320px]">
            <RequestState
              backHref="/dashboard"
              backLabel="К банку задач"
              description={
                isTopicMissing
                  ? "Возможно, тема ещё не опубликована или ссылка устарела."
                  : "Не получилось получить задания с сервера. Попробуйте загрузить страницу ещё раз."
              }
              onRetry={
                isTopicMissing
                  ? undefined
                  : () => void topicTasksQuery.refetch()
              }
              title={
                isTopicMissing
                  ? "Такой темы не нашлось"
                  : "Не удалось загрузить задания"
              }
              variant={isTopicMissing ? "not-found" : "error"}
            />
          </div>
        </main>
      </StudentLayout>
    );
  }

  const { topic, tasks } = data;
  const topicTitle = topic.parent?.name ?? topic.name;
  const isFavoritePending = addMutation.isPending || removeMutation.isPending;

  const handleToggleFavorite = (publicId: string, isFavorite: boolean) => {
    if (!hasAccessToken) {
      router.push("/login");
      return;
    }

    if (isFavorite) {
      removeMutation.mutate(publicId);
      return;
    }

    addMutation.mutate(publicId);
  };

  return (
    <StudentLayout>
      <main className="min-w-0 p-4 sm:p-7 lg:p-8">
        <div className="mx-auto max-w-[1320px]">
          <Link
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-muted transition hover:text-brand"
            href="/dashboard"
          >
            <ArrowLeft className="size-4" />
            Банк задач
          </Link>

          <div className="mt-5 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <div className="hidden xl:block xl:self-start xl:sticky xl:top-8">
              <TaskBankSidebar
                activeTopicId={topic.id}
                subjectCode={topic.subject.code}
              />
            </div>

            <div className="min-w-0">
              <div className="mb-4 xl:hidden">
                <button
                  aria-expanded={isMobileNavOpen}
                  className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-left text-sm font-bold text-ink transition hover:bg-panel"
                  onClick={() => setIsMobileNavOpen((isOpen) => !isOpen)}
                  type="button"
                >
                  <ListTree className="size-5 text-brand" />
                  <span className="flex-1">Все темы · {topic.subject.name}</span>
                </button>

                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    isMobileNavOpen
                      ? "mt-3 grid-rows-[1fr] opacity-100"
                      : "mt-0 grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <TaskBankSidebar
                      activeTopicId={topic.id}
                      subjectCode={topic.subject.code}
                    />
                  </div>
                </div>
              </div>

              <section className="relative overflow-hidden rounded-3xl border border-[#c6ddf5] bg-[#eef6ff] px-7 py-8 sm:px-9">
                <div className="relative z-10 max-w-2xl">
                  <p className="text-sm font-semibold text-brand">
                    {topic.subject.name} · ЕГЭ
                  </p>
                  <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-ink sm:text-[2.7rem]">
                    {topicTitle}
                  </h1>
                  <p className="mt-2 text-[15px] text-muted">
                    {topic.name} · {formatTaskCount(tasks.length)}
                  </p>
                </div>
                <Image
                  alt="Медвежонок готовится к задаче"
                  className="absolute -bottom-12 right-2 hidden h-auto w-44 lg:block"
                  height={1448}
                  src="/bear.png"
                  width={1086}
                />
              </section>

              {tasks.length === 0 ? (
                <div className="mt-6">
                  <RequestState
                    description="В этой теме пока нет опубликованных задач. Загляните позже или выберите другую тему слева."
                    title="Задачи скоро появятся"
                    variant="empty"
                  />
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-6">
                  {tasks.map((task, index) => {
                    const isFavorite = Boolean(
                      favoritesQuery.data?.some(
                        (favorite) => favorite.publicId === task.publicId,
                      ),
                    );

                    return (
                      <TaskCard
                        isFavorite={isFavorite}
                        isFavoritePending={isFavoritePending}
                        key={task.publicId}
                        onToggleFavorite={() =>
                          handleToggleFavorite(task.publicId, isFavorite)
                        }
                        task={task}
                        taskNumber={index + 1}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}
