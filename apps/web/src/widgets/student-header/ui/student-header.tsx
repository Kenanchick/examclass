"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  ChevronDown,
  Menu,
  Search,
  UserRound,
} from "lucide-react";

import { StudentMobileMenu } from "@/widgets/student-sidebar/ui/student-navigation-mobile";

export function StudentHeader() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const publicId = searchValue.trim();

    if (publicId) {
      router.push(`/tasks/${publicId.toUpperCase()}`);
    }
  };

  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-24 max-w-[1600px] items-center justify-between gap-6 px-5 sm:px-8">
          <div className="flex items-center gap-2">
            <button
              className="grid size-10 cursor-pointer place-items-center rounded-xl text-muted transition hover:bg-panel hover:text-ink lg:hidden"
              onClick={() => setIsMenuOpen(true)}
              type="button"
            >
              <Menu className="size-6" />
            </button>
            <Link
              className="flex items-center gap-3 text-2xl font-bold tracking-[-0.05em] text-ink"
              href="/dashboard"
            >
              <BookOpen className="size-9 text-brand" strokeWidth={1.7} />

              <span>
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
              className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Поиск по темам и задачам"
              type="search"
              value={searchValue}
            />
          </form>

          <div className="flex items-center gap-3">
            <button
              aria-label="Уведомления"
              className="grid size-10 cursor-pointer place-items-center rounded-full text-muted transition hover:bg-panel hover:text-ink"
              type="button"
            >
              <Bell className="size-6" strokeWidth={1.8} />
            </button>

            <button
              className="flex cursor-pointer items-center gap-2 rounded-xl px-1 py-1 text-sm font-semibold text-ink transition hover:bg-panel"
              type="button"
            >
              <span className="grid size-10 place-items-center rounded-full bg-panel text-brand">
                <UserRound className="size-5" fill="currentColor" />
              </span>
              <span className="hidden sm:inline">Кенан</span>
              <ChevronDown className="hidden size-4 sm:block" />
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && <StudentMobileMenu onClose={() => setIsMenuOpen(false)} />}
    </>
  );
}
