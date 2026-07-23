"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { UserRound } from "lucide-react";
import type { HomeworkAssignment } from "../model/homework";

type HomeworkAssignmentRowProps = {
  assignment: HomeworkAssignment;
};

export function HomeworkAssignmentRow({
  assignment,
}: HomeworkAssignmentRowProps) {
  const router = useRouter();
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
      className="relative -mx-6 cursor-pointer border-t border-line px-6 py-9 outline-none transition duration-200 hover:z-10 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(15,43,76,0.08)] focus-visible:z-10 focus-visible:-translate-y-1 focus-visible:shadow-[0_12px_24px_rgba(15,43,76,0.08)] sm:-mx-8 sm:px-8 sm:py-10 lg:-mx-10 lg:px-10"
      onClick={openHomework}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
    >
      <h2 className="text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl">
        {assignment.title}
      </h2>
      <p className="mt-5 inline-flex items-center gap-2 text-lg font-semibold text-muted sm:text-xl">
        <UserRound className="size-5 text-brand" />
        Преподаватель: {assignment.teacher.name}
      </p>
    </article>
  );
}
