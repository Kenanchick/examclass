"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { studentNavigation } from "../model/navigation";

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-full border-r border-line bg-white lg:flex lg:flex-col">
      <nav className="space-y-2 p-5">
        {studentNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === pathname;
          const className = `flex w-full cursor-pointer items-center gap-4 rounded-xl px-4 py-4 text-left text-[15px] font-medium transition ${isActive ? "bg-brand/10 text-brand" : "text-ink hover:bg-panel"}`;

          return item.href ? (
            <Link className={className} href={item.href} key={item.label}>
              <Icon className="size-6" strokeWidth={1.8} />
              {item.label}
            </Link>
          ) : (
            <button className={className} key={item.label} type="button">
              <Icon className="size-6" strokeWidth={1.8} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto p-6">
        <Image
          alt="Помощник ExamClass"
          className="mx-auto h-auto w-full max-w-[220px]"
          height={1446}
          src="/header-rabbit.png"
          width={1086}
        />
      </div>
    </aside>
  );
}
