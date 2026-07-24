"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useAccountModeStore } from "@/features/account-mode/model/use-account-mode-store";
import { getStudentNavigation } from "@/widgets/student-sidebar/model/navigation";

type StudentMobileMenuProps = {
  onClose: () => void;
};

export function StudentMobileMenu({ onClose }: StudentMobileMenuProps) {
  const pathname = usePathname();
  const accountMode = useAccountModeStore((state) => state.mode);
  const navigation = getStudentNavigation(accountMode);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        className="absolute inset-0 cursor-pointer bg-ink/20 backdrop-blur-[1px]"
        onClick={onClose}
        type="button"
      />

      <aside className="relative z-10 flex h-full w-[min(86vw,340px)] flex-col bg-white shadow-2xl">
        <div className="flex h-20 items-center justify-between border-b border-line px-5">
          <p className="text-lg font-bold tracking-[-0.05em] text-ink">
            Exam<span className="text-brand">Class</span>
          </p>

          <button
            className="grid size-10 cursor-pointer place-items-center rounded-xl text-muted transition hover:bg-panel hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X className="size-6" />
          </button>
        </div>

        <nav className="space-y-2 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === pathname;
            const className = `flex w-full cursor-pointer items-center gap-4 rounded-xl px-4 py-3.5 text-left text-[15px] font-medium transition ${
              isActive ? "bg-brand/10 text-brand" : "text-ink hover:bg-panel"
            }`;

            return item.href ? (
              <Link
                className={className}
                href={item.href}
                key={item.label}
                onClick={onClose}
              >
                <Icon className="size-5" strokeWidth={1.8} />
                {item.label}
              </Link>
            ) : (
              <button
                className={className}
                key={item.label}
                onClick={onClose}
                type="button"
              >
                <Icon className="size-5" strokeWidth={1.8} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
