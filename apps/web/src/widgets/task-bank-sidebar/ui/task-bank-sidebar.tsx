"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useSubjectTopicsQuery } from "@/entities/topic/api/use-subject-topics-query";
import { formatTaskCount } from "@/entities/topic/lib/format-task-count";
import { RequestState } from "@/shared/ui/request-state/request-state";

type TaskBankSidebarProps = {
  subjectCode: string;
  activeTopicId: string;
};

export function TaskBankSidebar({
  subjectCode,
  activeTopicId,
}: TaskBankSidebarProps) {
  const topicsQuery = useSubjectTopicsQuery(subjectCode);
  const [openedTopicId, setOpenedTopicId] = useState<string | null>(null);
  const subjectData = topicsQuery.data;

  useEffect(() => {
    if (!subjectData) {
      return;
    }

    const activeGroup = subjectData.topics.find(
      (topic) =>
        topic.id === activeTopicId ||
        topic.children.some((child) => child.id === activeTopicId),
    );

    if (activeGroup) {
      setOpenedTopicId(activeGroup.id);
    }
  }, [subjectData, activeTopicId]);

  if (topicsQuery.isPending) {
    return <RequestState variant="loading" />;
  }

  if (topicsQuery.isError || !subjectData) {
    return (
      <RequestState
        description="Не получилось загрузить список тем. Попробуйте ещё раз."
        onRetry={() => void topicsQuery.refetch()}
        title="Темы недоступны"
        variant="error"
      />
    );
  }

  return (
    <nav
      aria-label="Навигация по темам банка задач"
      className="rounded-3xl border border-line bg-white p-3 shadow-[0_16px_35px_rgba(15,43,76,0.06)]"
    >
      <p className="px-3 pb-2 pt-2 text-xs font-bold uppercase tracking-wider text-muted">
        {subjectData.name}
      </p>

      <div className="flex flex-col gap-1">
        {subjectData.topics.map((topic) => {
          const hasSubtopics = topic.children.length > 0;
          const isOpen = openedTopicId === topic.id;
          const isActive = topic.id === activeTopicId;
          const hasChildActive = topic.children.some(
            (child) => child.id === activeTopicId,
          );

          const badge = (
            <span className="grid size-8 shrink-0 place-items-center rounded-[11px] border border-[#80afe4] bg-gradient-to-br from-[#d8ecff] via-[#acd4ff] to-[#78afe0] text-xs font-extrabold text-[#063d73] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_3px_0_#5d91c9]">
              {topic.sortOrder}
            </span>
          );

          if (!hasSubtopics) {
            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                  isActive
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-transparent text-ink hover:bg-panel"
                }`}
                href={`/bank/${topic.id}`}
                key={topic.id}
              >
                {badge}
                <span className="flex-1">{topic.name}</span>
                <span className="shrink-0 rounded-full bg-panel px-2.5 py-1 text-xs font-bold text-muted">
                  {formatTaskCount(topic.taskCount)}
                </span>
              </Link>
            );
          }

          return (
            <div key={topic.id}>
              <button
                aria-expanded={isOpen}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition ${
                  hasChildActive
                    ? "border-brand/30 bg-brand/5 text-ink"
                    : "border-transparent text-ink hover:bg-panel"
                }`}
                onClick={() =>
                  setOpenedTopicId((current) =>
                    current === topic.id ? null : topic.id,
                  )
                }
                type="button"
              >
                {badge}
                <span className="flex-1">{topic.name}</span>
                <span className="shrink-0 rounded-full bg-panel px-2.5 py-1 text-xs font-bold text-muted">
                  {formatTaskCount(topic.taskCount)}
                </span>
                <ChevronDown
                  className={`size-4 shrink-0 text-brand transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="mt-1 flex flex-col gap-0.5 pl-4">
                    {topic.children.map((subtopic) => {
                      const isSubtopicActive = subtopic.id === activeTopicId;
                      const isClickable = subtopic.taskCount > 0;

                      if (!isClickable) {
                        return (
                          <span
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted"
                            key={subtopic.id}
                          >
                            <span className="size-1.5 rounded-full bg-line" />
                            <span className="flex-1">{subtopic.name}</span>
                            <span className="shrink-0 rounded-full bg-panel px-2 py-0.5 text-xs font-bold text-muted">
                              {formatTaskCount(subtopic.taskCount)}
                            </span>
                          </span>
                        );
                      }

                      return (
                        <Link
                          aria-current={isSubtopicActive ? "page" : undefined}
                          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                            isSubtopicActive
                              ? "bg-brand/10 text-brand"
                              : "text-ink hover:bg-panel"
                          }`}
                          href={`/bank/${subtopic.id}`}
                          key={subtopic.id}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              isSubtopicActive ? "bg-brand" : "bg-brand/50"
                            }`}
                          />
                          <span className="flex-1">{subtopic.name}</span>
                          <span className="shrink-0 rounded-full bg-panel px-2 py-0.5 text-xs font-bold text-muted">
                            {formatTaskCount(subtopic.taskCount)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
