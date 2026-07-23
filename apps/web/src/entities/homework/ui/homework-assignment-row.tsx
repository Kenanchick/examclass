"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { CalendarDays, ChevronRight, Clock3, UserRound } from "lucide-react";
import { toDateKey } from "@/shared/lib/date";
import type { HomeworkAssignment } from "../model/homework";
import { getDeadlineMeta } from "../lib/homework-deadline";

type HomeworkAssignmentRowProps = {
  assignment: HomeworkAssignment;
};

export function HomeworkAssignmentRow({
  assignment,
}: HomeworkAssignmentRowProps) {
  const router = useRouter();
  const deadline = getDeadlineMeta(assignment.deadline);
  const calendarHref = `/profile?date=${toDateKey(deadline.date)}#calendar`;
  const homeworkHref = `/homework/${assignment.publicId}`;

  const openHomework = () => router.push(homeworkHref);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openHomework();
    }
  };

  return (
    <article
      className="group relative -mx-6 grid cursor-pointer gap-5 border-t border-line px-6 py-7 outline-none transition duration-200 hover:z-10 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(15,43,76,0.08)] focus-visible:z-10 focus-visible:-translate-y-1 focus-visible:shadow-[0_12px_24px_rgba(15,43,76,0.08)] sm:-mx-8 sm:px-8 md:grid-cols-[92px_minmax(0,1fr)] lg:-mx-10 lg:grid-cols-[92px_minmax(0,1fr)_240px] lg:gap-8 lg:px-10 lg:py-8"
      onClick={openHomework}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
    >
      <div
        className={`flex h-fit items-baseline gap-2 md:block ${
          deadline.isOverdue ? "text-muted" : "text-brand"
        }`}
      >
        <span className="text-4xl font-bold tracking-[-0.07em]">
          {deadline.day}
        </span>
        <span className="text-sm font-bold uppercase tracking-[0.12em] md:mt-1 md:block">
          {deadline.month}
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-brand">
          {assignment.classroom.subject.name}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-[1.75rem]">
          {assignment.title}
        </h2>
        {assignment.description && (
          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-muted">
            {assignment.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-muted">
          <span className="inline-flex items-center gap-2">
            <UserRound className="size-4 text-brand" />
            Преподаватель: {assignment.teacher.name}
          </span>
          <span>{assignment.taskCount} заданий</span>
          <span>{assignment.classroom.title}</span>
        </div>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand transition group-hover:gap-3">
          Открыть задания <ChevronRight className="size-4" />
        </span>
      </div>

      <div className="border-t border-line pt-5 md:col-start-2 lg:col-start-auto lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
        <p
          className={`inline-flex items-center gap-2 text-sm font-bold ${
            deadline.isOverdue ? "text-danger" : "text-brand"
          }`}
        >
          <Clock3 className="size-4" />
          {deadline.relativeLabel}
        </p>
        <p className="mt-2 text-base font-bold capitalize text-ink">
          {deadline.fullDate}
        </p>
        <p className="mt-1 text-sm text-muted">до {deadline.time}</p>
        <Link
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand transition hover:text-brand/75"
          href={calendarHref}
          onClick={(event) => event.stopPropagation()}
        >
          <CalendarDays className="size-4" />В календаре
        </Link>
      </div>
    </article>
  );
}
