"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import {
  useFavoriteMutations,
  useFavoritesQuery,
} from "@/entities/favorite/api/use-favorites-query";
import { useTaskQuery } from "@/entities/task/api/use-task-query";
import { getTaskExamNumber } from "@/entities/task/model/task";
import { TaskCard } from "@/entities/task/ui/task-card";
import { useAccessToken } from "@/shared/model/use-access-token";
import { RequestState } from "@/shared/ui/request-state/request-state";
import { StudentLayout } from "@/widgets/student-layout/ui/student-layout";

type StudentTaskPageProps = {
  publicId: string;
};

type StudyHintProps = {
  imageSrc: string;
  imageAlt: string;
  title: string;
  children: string;
  connectorOrigin: "head" | "magnifier";
  className?: string;
};

function StudyHint({
  imageSrc,
  imageAlt,
  title,
  children,
  connectorOrigin,
  className = "",
}: StudyHintProps) {
  const isMagnifierConnector = connectorOrigin === "magnifier";

  return (
    <div
      className={`relative grid grid-cols-[176px_minmax(0,1fr)] items-center gap-10 ${className}`}
    >
      <Image
        alt={imageAlt}
        className={`relative z-10 h-auto w-44 shrink-0 ${
          isMagnifierConnector ? "-scale-x-100" : ""
        }`}
        height={1448}
        src={imageSrc}
        width={1086}
      />

      <svg
        aria-hidden="true"
        className={`pointer-events-none absolute z-20 h-14 w-[76px] text-ink/80 ${
          isMagnifierConnector
            ? "left-[125px] top-[104px]"
            : "left-[132px] top-[66px]"
        }`}
        fill="none"
        viewBox="0 0 76 56"
      >
        <path
          d="M2 23C15 6 24 42 37 28C49 15 59 10 74 21"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </svg>

      <div className="relative z-10 min-w-0">
        <p className="text-lg font-bold leading-7 text-ink">{title}</p>
        <p className="mt-2 text-base leading-7 text-muted">{children}</p>
      </div>
    </div>
  );
}

export function StudentTaskPage({ publicId }: StudentTaskPageProps) {
  const router = useRouter();
  const taskQuery = useTaskQuery(publicId);
  const hasAccessToken = useAccessToken();
  const favoritesQuery = useFavoritesQuery(hasAccessToken === true);
  const { addMutation, removeMutation } = useFavoriteMutations();
  const task = taskQuery.data;
  const isTaskMissing =
    axios.isAxiosError(taskQuery.error) &&
    taskQuery.error.response?.status === 404;

  if (taskQuery.isPending) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1040px]">
            <RequestState variant="loading" />
          </div>
        </main>
      </StudentLayout>
    );
  }

  if (taskQuery.isError || !task) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1040px]">
            <RequestState
              backHref="/dashboard"
              backLabel="К банку задач"
              description={
                isTaskMissing
                  ? "Проверьте ID задачи: возможно, в нём есть опечатка или это задание пока недоступно."
                  : "Не получилось получить задание с сервера. Попробуйте загрузить страницу ещё раз."
              }
              onRetry={
                isTaskMissing ? undefined : () => void taskQuery.refetch()
              }
              title={
                isTaskMissing
                  ? "Такой задачи не нашлось"
                  : "Не удалось загрузить задачу"
              }
              variant={isTaskMissing ? "not-found" : "error"}
            />
          </div>
        </main>
      </StudentLayout>
    );
  }

  const taskNumber = getTaskExamNumber(task);
  const taskTopic = task.topic.parent?.name ?? task.topic.name;
  const isFavorite = favoritesQuery.data?.some(
    (favorite) => favorite.publicId === task.publicId,
  );
  const isFavoritePending = addMutation.isPending || removeMutation.isPending;

  const handleFavorite = () => {
    if (hasAccessToken !== true) {
      router.push("/login");
      return;
    }

    if (isFavorite) {
      removeMutation.mutate(task.publicId);
      return;
    }

    addMutation.mutate(task.publicId);
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

          <section className="relative mt-5 overflow-hidden rounded-3xl border border-[#c6ddf5] bg-[#eef6ff] px-7 py-8 sm:px-9">
            <div className="relative z-10 max-w-2xl">
              <p className="text-sm font-semibold text-brand">
                {task.topic.subject.name} · ЕГЭ
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-ink sm:text-[2.7rem]">
                {taskTopic}
              </h1>
              <p className="mt-2 text-[15px] text-muted">
                Задание {taskNumber} · {task.topic.name}
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

          <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_400px]">
            <TaskCard
              isFavorite={Boolean(isFavorite)}
              isFavoritePending={isFavoritePending}
              onToggleFavorite={handleFavorite}
              task={task}
              taskNumber={taskNumber}
            />

            <aside className="hidden 2xl:flex 2xl:flex-col 2xl:gap-6 2xl:py-2">
              <StudyHint
                connectorOrigin="head"
                imageAlt="Ёжик изучает геометрию"
                imageSrc="/hedgehog.png"
                title="Геометрический настрой"
              >
                Делайте небольшой чертёж даже в простых задачах.
              </StudyHint>

              <StudyHint
                className="mt-8"
                connectorOrigin="magnifier"
                imageAlt="Лисёнок проверяет ответ"
                imageSrc="/fox.png"
                title="Проверка"
              >
                Сверяйте единицы измерения и формат ответа.
              </StudyHint>
            </aside>
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}
