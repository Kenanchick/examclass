"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ArrowRight,
  CalendarDays,
  GraduationCap,
  Mail,
  UserRound,
} from "lucide-react";
import { useHomeworkQuery } from "@/entities/homework/api/use-homework-query";
import { toHomeworkCalendarEvents } from "@/entities/homework/lib/to-homework-calendar-events";
import { useCurrentUserQuery } from "@/entities/user/api/use-current-user-query";
import { ProfileCalendar } from "@/features/profile/calendar/ui/profile-calendar";
import { ProfileSettings } from "@/features/profile/settings/ui/profile-settings";
import { useAccountModeStore } from "@/features/account-mode/model/use-account-mode-store";
import { useAccessToken } from "@/shared/model/use-access-token";
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

export function StudentProfilePage() {
  const router = useRouter();
  const accountMode = useAccountModeStore((state) => state.mode);
  const setAccountMode = useAccountModeStore((state) => state.setMode);
  const hasAccessToken = useAccessToken();
  const currentUserQuery = useCurrentUserQuery(hasAccessToken === true);
  const homeworkQuery = useHomeworkQuery(hasAccessToken === true);
  const currentUser = currentUserQuery.data;
  const calendarEvents = toHomeworkCalendarEvents(homeworkQuery.data ?? []);

  useEffect(() => {
    if (hasAccessToken === false) {
      router.replace("/login");
    }
  }, [hasAccessToken, router]);

  const formattedCreatedAt = currentUser
    ? new Intl.DateTimeFormat("ru-RU", {
        month: "long",
        year: "numeric",
      }).format(new Date(currentUser.createdAt))
    : "";

  if (
    hasAccessToken === null ||
    (hasAccessToken && currentUserQuery.isPending)
  ) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1320px]">
            <RequestState
              description="Собираем данные аккаунта и календарь подготовки."
              title="Открываем личный кабинет…"
              variant="loading"
            />
          </div>
        </main>
      </StudentLayout>
    );
  }

  if (hasAccessToken === true && currentUserQuery.isError) {
    return (
      <StudentLayout>
        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <div className="mx-auto max-w-[1320px]">
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
        <div className="mx-auto max-w-[1320px] space-y-6">
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
                    <div
                      aria-label="Режим кабинета"
                      className="inline-flex rounded-full bg-white p-1 shadow-sm"
                      role="group"
                    >
                      <button
                        aria-pressed={accountMode === "student"}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold transition ${
                          accountMode === "student"
                            ? "bg-brand text-white shadow-sm"
                            : "text-muted hover:text-brand"
                        }`}
                        onClick={() => setAccountMode("student")}
                        type="button"
                      >
                        <GraduationCap className="size-4" />
                        Ученик
                      </button>
                      <button
                        aria-pressed={accountMode === "teacher"}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold transition ${
                          accountMode === "teacher"
                            ? "bg-brand text-white shadow-sm"
                            : "text-muted hover:text-brand"
                        }`}
                        onClick={() => setAccountMode("teacher")}
                        type="button"
                      >
                        <UserRound className="size-4" />
                        Преподаватель
                      </button>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3.5 py-2 text-sm font-bold text-success">
                      <span className="size-2 rounded-full bg-success" />
                      Аккаунт активен
                    </span>
                  </div>

                  <h1 className="mt-4 text-4xl font-bold tracking-[-0.055em] text-ink sm:text-5xl">
                    {currentUser.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-base text-muted sm:text-lg">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="size-5" />
                      {currentUser.email}
                    </span>
                    <span className="inline-flex items-center gap-2 capitalize">
                      <CalendarDays className="size-5" />С нами с{" "}
                      {formattedCreatedAt}
                    </span>
                  </div>
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

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.65fr)]">
            <ProfileCalendar events={calendarEvents} />
            <ProfileSettings user={currentUser} />
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}
