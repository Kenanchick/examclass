"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Goal,
  GraduationCap,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import { useFavoritesQuery } from "@/entities/favorite/api/use-favorites-query";
import { useSubjectsQuery } from "@/entities/subject/api/use-subjects-query";
import { useCurrentUserQuery } from "@/entities/user/api/use-current-user-query";
import { RequestState } from "@/shared/ui/request-state/request-state";
import { StudentLayout } from "@/widgets/student-layout/ui/student-layout";

const dailyGoalOptions = [3, 5, 10] as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function StudentProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [hasAccessToken, setHasAccessToken] = useState(false);
  const [dailyGoal, setDailyGoal] = useState<number>(5);
  const currentUserQuery = useCurrentUserQuery(hasAccessToken);
  const favoritesQuery = useFavoritesQuery(hasAccessToken);
  const subjectsQuery = useSubjectsQuery();
  const currentUser = currentUserQuery.data;

  useEffect(() => {
    const hasToken = Boolean(window.localStorage.getItem("accessToken"));

    setHasAccessToken(hasToken);
    setIsAuthReady(true);

    if (!hasToken) {
      router.replace("/login");
    }

    const savedGoal = Number(
      window.localStorage.getItem("examclass-daily-goal"),
    );

    if (dailyGoalOptions.includes(savedGoal as 3 | 5 | 10)) {
      setDailyGoal(savedGoal);
    }
  }, [router]);

  const handleDailyGoalChange = (goal: number) => {
    setDailyGoal(goal);
    window.localStorage.setItem("examclass-daily-goal", String(goal));
  };

  const handleLogout = () => {
    window.localStorage.removeItem("accessToken");
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  };

  const formattedCreatedAt = currentUser
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(currentUser.createdAt))
    : "—";

  if (!isAuthReady || (hasAccessToken && currentUserQuery.isPending)) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1280px]">
            <RequestState
              description="Собираем данные аккаунта и настройки подготовки."
              title="Открываем личный кабинет…"
              variant="loading"
            />
          </div>
        </main>
      </StudentLayout>
    );
  }

  if (hasAccessToken && currentUserQuery.isError) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1280px]">
            <RequestState
              description="Не удалось получить данные аккаунта. Проверьте соединение и попробуйте ещё раз."
              onRetry={() => void currentUserQuery.refetch()}
              title="Профиль временно недоступен"
              variant="error"
            />
          </div>
        </main>
      </StudentLayout>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <StudentLayout>
      <main className="min-w-0 p-4 sm:p-7 lg:p-8">
        <div className="mx-auto max-w-[1280px] space-y-6">
          <section className="relative overflow-hidden rounded-[2rem] border border-[#c6ddf5] bg-gradient-to-br from-[#eef6ff] via-white to-[#f5f9ff] p-6 sm:p-8 lg:p-10">
            <div className="absolute -right-24 -top-24 size-72 rounded-full bg-brand/5" />
            <div className="absolute -bottom-28 right-32 size-56 rounded-full bg-[#dceeff]/70" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="grid size-24 shrink-0 place-items-center rounded-[1.75rem] bg-brand text-3xl font-extrabold text-white shadow-[0_12px_30px_rgba(19,66,112,0.22)] sm:size-28 sm:text-4xl">
                  {getInitials(currentUser.name)}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-bold text-brand shadow-sm">
                      <GraduationCap className="size-4" />
                      Ученик
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3.5 py-2 text-sm font-bold text-success">
                      <span className="size-2 rounded-full bg-success" />
                      Аккаунт активен
                    </span>
                  </div>

                  <h1 className="mt-4 text-4xl font-bold tracking-[-0.055em] text-ink sm:text-5xl">
                    {currentUser.name}
                  </h1>
                  <p className="mt-2 flex items-center gap-2 text-base text-muted sm:text-lg">
                    <Mail className="size-5" />
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <Link
                className="inline-flex min-h-14 items-center justify-center gap-3 self-start rounded-2xl bg-brand px-6 text-base font-bold text-white shadow-[0_10px_24px_rgba(19,66,112,0.18)] transition hover:-translate-y-0.5 hover:bg-brand/90 lg:self-center"
                href="/dashboard"
              >
                Продолжить подготовку
                <ArrowRight className="size-5" />
              </Link>
            </div>
          </section>

          <section
            aria-label="Краткая статистика"
            className="grid gap-4 md:grid-cols-3"
          >
            <article className="rounded-3xl border border-line bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-500">
                  <Star className="size-6 fill-current" />
                </span>
                <Link
                  aria-label="Открыть избранное"
                  className="grid size-10 place-items-center rounded-xl text-muted transition hover:bg-panel hover:text-ink"
                  href="/favorites"
                >
                  <ChevronRight className="size-5" />
                </Link>
              </div>
              <p className="mt-5 text-3xl font-bold tracking-[-0.04em] text-ink">
                {favoritesQuery.isPending
                  ? "—"
                  : (favoritesQuery.data?.length ?? 0)}
              </p>
              <p className="mt-1 text-base font-medium text-muted">
                задач в избранном
              </p>
            </article>

            <article className="rounded-3xl border border-line bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand">
                  <BookOpen className="size-6" />
                </span>
                <span className="rounded-full bg-panel px-3 py-1.5 text-sm font-bold text-muted">
                  ЕГЭ
                </span>
              </div>
              <p className="mt-5 text-3xl font-bold tracking-[-0.04em] text-ink">
                {subjectsQuery.isPending
                  ? "—"
                  : (subjectsQuery.data?.length ?? 0)}
              </p>
              <p className="mt-1 text-base font-medium text-muted">
                предмета для подготовки
              </p>
            </article>

            <article className="rounded-3xl border border-line bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-success">
                  <Goal className="size-6" />
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-success">
                  <Check className="size-4" />
                  Сохранено
                </span>
              </div>
              <p className="mt-5 text-3xl font-bold tracking-[-0.04em] text-ink">
                {dailyGoal}
              </p>
              <p className="mt-1 text-base font-medium text-muted">
                задач — цель на день
              </p>
            </article>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[2rem] border border-line bg-white p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
                  <Sparkles className="size-6" />
                </span>
                <div>
                  <h2 className="text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
                    Мой ритм подготовки
                  </h2>
                  <p className="mt-2 max-w-xl text-base leading-7 text-muted">
                    Выберите комфортную дневную цель. Она сохранится на этом
                    устройстве и поможет держать понятный темп.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {dailyGoalOptions.map((goal) => {
                  const isSelected = dailyGoal === goal;

                  return (
                    <button
                      aria-pressed={isSelected}
                      className={`min-h-24 cursor-pointer rounded-2xl border-2 p-4 text-left transition ${
                        isSelected
                          ? "border-brand bg-brand/5 shadow-[0_8px_22px_rgba(19,66,112,0.08)]"
                          : "border-line bg-white hover:border-brand/35 hover:bg-panel/60"
                      }`}
                      key={goal}
                      onClick={() => handleDailyGoalChange(goal)}
                      type="button"
                    >
                      <span className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-ink">
                          {goal}
                        </span>
                        {isSelected && (
                          <span className="grid size-7 place-items-center rounded-full bg-brand text-white">
                            <Check className="size-4" />
                          </span>
                        )}
                      </span>
                      <span className="mt-2 block text-sm font-medium text-muted">
                        задач в день
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-panel px-5 py-4 text-base text-muted">
                <Clock3 className="size-5 shrink-0 text-brand" />
                Даже 20–30 минут ежедневно дают устойчивый результат.
              </div>
            </section>

            <section className="rounded-[2rem] border border-line bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
                Данные аккаунта
              </h2>

              <dl className="mt-6 space-y-3">
                <div className="flex items-center gap-4 rounded-2xl bg-panel/70 p-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-sm">
                    <UserRound className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-sm font-medium text-muted">Статус</dt>
                    <dd className="mt-0.5 text-base font-bold text-ink">
                      Ученик ExamClass
                    </dd>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-panel/70 p-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-sm">
                    <CalendarDays className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-sm font-medium text-muted">
                      Дата регистрации
                    </dt>
                    <dd className="mt-0.5 text-base font-bold text-ink">
                      {formattedCreatedAt}
                    </dd>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-panel/70 p-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-success shadow-sm">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-sm font-medium text-muted">
                      Безопасность
                    </dt>
                    <dd className="mt-0.5 text-base font-bold text-ink">
                      Текущий сеанс активен
                    </dd>
                  </div>
                </div>
              </dl>

              <button
                className="mt-5 flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-danger/25 bg-danger/5 px-5 text-base font-bold text-danger transition hover:border-danger/40 hover:bg-danger/10"
                onClick={handleLogout}
                type="button"
              >
                <LogOut className="size-5" />
                Выйти из аккаунта
              </button>
            </section>
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}
