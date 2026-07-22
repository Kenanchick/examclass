"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { studentNavigation } from "@/widgets/student-sidebar/model/navigation";

type StudentMobileMenuProps = {
  onClose: () => void;
};

export function StudentMobileMenu({ onClose }: StudentMobileMenuProps) {
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
        className="absolute inset-0 bg-ink/20 backdrop-blur-[1px]"
        onClick={onClose}
        type="button"
      />

      <aside className="relative z-10 flex h-full w-[min(86vw,340px)] flex-col bg-white shadow-2xl">
        <div className="flex h-20 items-center justify-between border-b border-line px-5">
          <p className="text-lg font-bold tracking-[-0.05em] text-ink">
            Exam<span className="text-brand">Class</span>
          </p>

          <button
            className="grid size-10 place-items-center rounded-xl text-muted transition hover:bg-panel hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X className="size-6" />
          </button>
        </div>

        <nav className="space-y-2 p-4">
          {studentNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-[15px] font-medium transition ${
                  item.active
                    ? "bg-brand/10 text-brand"
                    : "text-ink hover:bg-panel"
                }`}
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
