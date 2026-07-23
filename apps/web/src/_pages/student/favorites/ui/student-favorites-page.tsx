"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { useFavoritesQuery } from "@/entities/favorite/api/use-favorites-query";
import { RequestState } from "@/shared/ui/request-state/request-state";
import { StudentLayout } from "@/widgets/student-layout/ui/student-layout";

export function StudentFavoritesPage() {
  const [hasAccessToken, setHasAccessToken] = useState(false);
  const favoritesQuery = useFavoritesQuery(hasAccessToken);

  useEffect(() => {
    setHasAccessToken(Boolean(window.localStorage.getItem("accessToken")));
  }, []);

  return (
    <StudentLayout>
      <main className="min-w-0 p-4 sm:p-7 lg:p-8">
        <div className="mx-auto max-w-[1320px]">
          <section className="relative overflow-hidden rounded-3xl border border-[#c6ddf5] bg-[#eef6ff] px-6 py-7 sm:px-8">
            <div className="relative z-10 max-w-xl">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
                <Star className="size-4 fill-current" />
                Ваш список
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-ink sm:text-4xl">
                Избранные задачи
              </h1>
              <p className="mt-3 text-[15px] leading-6 text-muted sm:text-base">
                Сохраняйте интересные задания, чтобы вернуться к ним в удобный
                момент.
              </p>
            </div>
            <Image
              alt="Лисёнок ищет задачу"
              className="absolute -bottom-12 right-3 hidden h-auto w-44 lg:block"
              height={1448}
              src="/fox.png"
              width={1086}
            />
          </section>

          {!hasAccessToken && (
            <div className="mt-6 rounded-3xl border border-line bg-white p-7 text-center">
              <p className="text-lg font-semibold text-ink">
                Войдите, чтобы сохранять задачи
              </p>
              <Link
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white"
                href="/login"
              >
                Войти
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}

          {hasAccessToken && favoritesQuery.isPending && (
            <div className="mt-6">
              <RequestState
                description="Собираем сохранённые задания в ваш личный список."
                title="Загружаем избранное…"
                variant="loading"
              />
            </div>
          )}

          {hasAccessToken && favoritesQuery.isError && (
            <div className="mt-6">
              <RequestState
                description="Сохранённые задачи временно недоступны. Попробуйте загрузить их ещё раз."
                onRetry={() => void favoritesQuery.refetch()}
                title="Не удалось загрузить избранное"
                variant="error"
              />
            </div>
          )}

          {favoritesQuery.data && favoritesQuery.data.length === 0 && (
            <div className="relative mt-6 overflow-hidden rounded-3xl border border-line bg-white p-7 sm:p-8">
              <p className="text-xl font-bold text-ink">Здесь пока пусто</p>
              <p className="mt-2 max-w-lg text-[15px] leading-6 text-muted">
                Откройте любую задачу и нажмите на звёздочку — она сразу
                появится в этом списке.
              </p>
              <Image
                alt="Котик ждёт выбранную задачу"
                className="absolute -bottom-12 right-2 hidden h-auto w-36 md:block"
                height={1448}
                src="/thinking-cat.png"
                width={1086}
              />
            </div>
          )}

          {favoritesQuery.data && favoritesQuery.data.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {favoritesQuery.data.map((task) => {
                const taskNumber =
                  task.topic.parent?.sortOrder ?? task.topic.sortOrder;

                return (
                  <Link
                    className="group cursor-pointer rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-[0_12px_24px_rgba(15,43,76,0.08)]"
                    href={`/tasks/${task.publicId}`}
                    key={task.publicId}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="rounded-lg bg-brand/10 px-2.5 py-1.5 text-sm font-bold text-brand">
                        Задача {taskNumber}
                      </span>
                      <Star className="size-5 fill-amber-400 text-amber-400" />
                    </div>
                    <p className="mt-4 text-[15px] font-semibold leading-6 text-ink">
                      {task.statement}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand">
                      Открыть задачу
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </StudentLayout>
  );
}
