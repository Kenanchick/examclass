"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  UserRound,
} from "lucide-react";
import { useCurrentUserQuery } from "@/entities/user/api/use-current-user-query";
import { useAccessToken } from "@/shared/model/use-access-token";
import { StudentMobileMenu } from "@/widgets/student-sidebar/ui/student-navigation-mobile";

function getInitials(name?: string) {
  if (!name) {
    return "У";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function StudentHeader() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const hasAccessToken = useAccessToken();
  const [searchValue, setSearchValue] = useState("");
  const currentUserQuery = useCurrentUserQuery(hasAccessToken === true);
  const currentUser = currentUserQuery.data;
  const shortName = currentUser?.name.split(" ")[0] ?? "Профиль";

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileMenuOpen]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const publicId = searchValue.trim();

    if (publicId) {
      router.push(`/tasks/${publicId.toUpperCase()}`);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("accessToken");
    queryClient.clear();
    setIsProfileMenuOpen(false);
    router.replace("/login");
    router.refresh();
  };

  return (
    <>
      <header className="relative z-40 border-b border-line bg-white">
        <div className="mx-auto flex h-24 max-w-[1600px] items-center justify-between gap-6 px-5 sm:px-8">
          <div className="flex items-center gap-2">
            <button
              aria-label="Открыть меню"
              className="grid size-11 cursor-pointer place-items-center rounded-xl text-muted transition hover:bg-panel hover:text-ink lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              type="button"
            >
              <Menu className="size-6" />
            </button>
            <Link
              className="flex items-center gap-3 text-2xl font-bold tracking-[-0.05em] text-ink"
              href="/dashboard"
            >
              <BookOpen className="size-9 text-brand" strokeWidth={1.7} />

              <span className="hidden sm:inline">
                Exam<span className="text-brand">Class</span>
              </span>
            </Link>
          </div>

          <form
            className="hidden w-full max-w-[490px] items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 md:flex"
            onSubmit={handleSearchSubmit}
          >
            <Search className="size-5 text-muted" />
            <input
              aria-label="Поиск по темам и задачам"
              className="w-full bg-transparent text-base text-ink outline-none placeholder:text-muted"
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Поиск по темам и задачам"
              type="search"
              value={searchValue}
            />
          </form>

          <div className="flex items-center gap-3">
            <button
              aria-label="Уведомления"
              className="grid size-11 cursor-pointer place-items-center rounded-full text-muted transition hover:bg-panel hover:text-ink"
              type="button"
            >
              <Bell className="size-6" strokeWidth={1.8} />
            </button>

            <div className="relative" ref={profileMenuRef}>
              <button
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
                className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl px-2.5 py-2 text-base font-semibold text-ink transition sm:px-3 ${
                  isProfileMenuOpen ? "bg-panel" : "hover:bg-panel"
                }`}
                onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
                type="button"
              >
                <span className="grid size-11 place-items-center rounded-full bg-brand text-sm font-bold text-white shadow-sm">
                  {getInitials(currentUser?.name)}
                </span>
                <span className="hidden sm:inline">{shortName}</span>
                <ChevronDown
                  className={`hidden size-5 transition-transform duration-200 sm:block ${
                    isProfileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                aria-hidden={!isProfileMenuOpen}
                className={`absolute right-0 top-[calc(100%+0.75rem)] w-[min(21rem,calc(100vw-2.5rem))] origin-top-right rounded-3xl border border-line bg-white p-3 shadow-[0_24px_64px_rgba(11,42,73,0.16)] transition duration-200 ${
                  isProfileMenuOpen
                    ? "visible translate-y-0 scale-100 opacity-100"
                    : "invisible -translate-y-2 scale-[0.98] opacity-0"
                }`}
                role="menu"
              >
                <div className="mb-2 rounded-2xl bg-panel px-4 py-4">
                  <p className="truncate text-lg font-bold text-ink">
                    {currentUser?.name ?? "Личный кабинет"}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted">
                    {currentUser?.email ?? "Данные профиля"}
                  </p>
                </div>

                <Link
                  className="flex min-h-14 items-center gap-3 rounded-2xl px-4 text-base font-semibold text-ink transition hover:bg-panel"
                  href="/profile"
                  onClick={() => setIsProfileMenuOpen(false)}
                  role="menuitem"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
                    <UserRound className="size-5" />
                  </span>
                  <span className="flex-1">Профиль</span>
                  <ChevronRight className="size-5 text-muted" />
                </Link>

                <button
                  className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl px-4 text-left text-base font-semibold text-danger transition hover:bg-danger/5"
                  onClick={handleLogout}
                  role="menuitem"
                  type="button"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-danger/10">
                    <LogOut className="size-5" />
                  </span>
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <StudentMobileMenu onClose={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  );
}
