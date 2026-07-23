"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  studentNavigation,
  type StudentNavigationItem,
} from "../model/navigation";

const EASE_POP = "ease-[cubic-bezier(0.34,1.56,0.64,1)]";
const EASE_SMOOTH = "ease-[cubic-bezier(0.22,1,0.36,1)]";

type NavLinkProps = {
  item: StudentNavigationItem;
  isActive: boolean;
  className: string;
  children: ReactNode;
  tabIndex?: number;
};

function NavLink({ item, isActive, className, children, tabIndex }: NavLinkProps) {
  return item.href ? (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={className}
      href={item.href}
      tabIndex={tabIndex}
    >
      {children}
    </Link>
  ) : (
    <button className={className} tabIndex={tabIndex} type="button">
      {children}
    </button>
  );
}

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="group/rail relative z-30 hidden min-h-full border-r border-line bg-white lg:block">
      <nav
        aria-label="Основная навигация"
        className="flex flex-col items-center gap-1.5 px-4 py-6"
      >
        {studentNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === pathname;

          return (
            <NavLink
              className={`grid size-13 shrink-0 place-items-center rounded-2xl transition-colors duration-300 ${EASE_SMOOTH} ${
                isActive ? "bg-brand/10 text-brand" : "text-muted hover:bg-panel hover:text-ink"
              }`}
              isActive={isActive}
              item={item}
              key={item.label}
            >
              <Icon aria-label={item.label} className="size-6" strokeWidth={1.8} />
            </NavLink>
          );
        })}
      </nav>

      <div
        className={`pointer-events-none absolute left-3 top-4 z-30 w-[276px] origin-top-left scale-[0.95] rounded-3xl border border-line bg-white p-3 opacity-0 shadow-[0_28px_60px_-18px_rgba(15,43,76,0.28)] transition-[opacity,transform] duration-[380ms] ${EASE_POP} group-hover/rail:pointer-events-auto group-hover/rail:scale-100 group-hover/rail:opacity-100 motion-reduce:transition-none`}
      >
        <nav aria-hidden="true" className="flex flex-col gap-1">
          {studentNavigation.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.href === pathname;

            return (
              <NavLink
                className={`flex items-center gap-4 overflow-hidden rounded-2xl px-4 py-3.5 text-left text-[15px] font-medium transition-colors duration-200 ${
                  isActive ? "bg-brand/10 text-brand" : "text-ink hover:bg-panel"
                }`}
                isActive={isActive}
                item={item}
                key={item.label}
                tabIndex={-1}
              >
                <Icon className="size-6 shrink-0" strokeWidth={1.8} />
                <span
                  className={`translate-x-1.5 whitespace-nowrap opacity-0 transition-[opacity,transform] duration-300 ${EASE_SMOOTH} group-hover/rail:translate-x-0 group-hover/rail:opacity-100 motion-reduce:transition-none`}
                  style={{ transitionDelay: `${index * 22}ms` }}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div
          className={`mt-2 origin-bottom border-t border-line pt-3 opacity-0 transition-opacity duration-300 ${EASE_SMOOTH} group-hover/rail:opacity-100`}
          style={{ transitionDelay: `${studentNavigation.length * 22}ms` }}
        >
          <Image
            alt="Помощник ExamClass"
            className="mx-auto h-auto w-full max-w-[150px]"
            height={1446}
            src="/header-rabbit.png"
            width={1086}
          />
        </div>
      </div>
    </aside>
  );
}
