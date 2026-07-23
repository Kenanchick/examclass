"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useSubjectTopicsQuery } from "@/entities/topic/api/use-subject-topics-query";
import { formatTaskCount } from "@/entities/topic/lib/format-task-count";
import type { Topic, TopicWithChildren } from "@/entities/topic/model/topic";
import { RequestState } from "@/shared/ui/request-state/request-state";

type TaskBankSidebarProps = {
  subjectCode: string;
  activeTopicId: string;
};

function TopicOrderBadge({ order }: { order: number }) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#80afe4] bg-gradient-to-br from-[#d8ecff] via-[#acd4ff] to-[#78afe0] text-sm font-extrabold text-[#063d73] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_3px_0_#5d91c9]">
      {order}
    </span>
  );
}

function CountPill({ count, className = "" }: { count: number; className?: string }) {
  return (
    <span
      className={`shrink-0 whitespace-nowrap rounded-full bg-panel px-2.5 py-1 text-xs font-bold text-muted ${className}`}
    >
      {formatTaskCount(count)}
    </span>
  );
}

function TopicChevron({ isOpen }: { isOpen: boolean }) {
  return (
    <ChevronDown
      className={`size-4 shrink-0 text-brand transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        isOpen ? "rotate-180" : ""
      }`}
    />
  );
}

function CollapsiblePanel({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

type SubtopicRowProps = {
  subtopic: Topic & { taskCount: number };
  isActive: boolean;
};

function SubtopicRow({ subtopic, isActive }: SubtopicRowProps) {
  const isClickable = subtopic.taskCount > 0;

  if (!isClickable) {
    return (
      <span className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-muted">
        <span className="size-1.5 shrink-0 rounded-full bg-line" />
        <span className="min-w-0 flex-1 break-words">{subtopic.name}</span>
        <CountPill className="bg-panel px-2 py-0.5" count={subtopic.taskCount} />
      </span>
    );
  }

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition ${
        isActive ? "bg-brand/10 text-brand" : "text-ink hover:bg-panel"
      }`}
      href={`/bank/${subtopic.id}`}
    >
      <span
        className={`size-1.5 shrink-0 rounded-full ${isActive ? "bg-brand" : "bg-brand/50"}`}
      />
      <span className="min-w-0 flex-1 break-words">{subtopic.name}</span>
      <CountPill className="bg-panel px-2 py-0.5" count={subtopic.taskCount} />
    </Link>
  );
}

type TopicRowProps = {
  topic: TopicWithChildren;
  activeTopicId: string;
  isOpen: boolean;
  onToggle: () => void;
};

function TopicRow({ topic, activeTopicId, isOpen, onToggle }: TopicRowProps) {
  const hasSubtopics = topic.children.length > 0;
  const isActive = topic.id === activeTopicId;

  if (!hasSubtopics) {
    return (
      <Link
        aria-current={isActive ? "page" : undefined}
        className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-[15px] font-medium transition ${
          isActive
            ? "border-brand bg-brand/10 text-brand"
            : "border-transparent text-ink hover:bg-panel"
        }`}
        href={`/bank/${topic.id}`}
      >
        <TopicOrderBadge order={topic.sortOrder} />
        <span className="min-w-0 flex-1 break-words">{topic.name}</span>
        <CountPill count={topic.taskCount} />
      </Link>
    );
  }

  const hasChildActive = topic.children.some(
    (child) => child.id === activeTopicId,
  );

  return (
    <div>
      <button
        aria-expanded={isOpen}
        className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-[15px] font-semibold transition ${
          hasChildActive
            ? "border-brand/30 bg-brand/5 text-ink"
            : "border-transparent text-ink hover:bg-panel"
        }`}
        onClick={onToggle}
        type="button"
      >
        <TopicOrderBadge order={topic.sortOrder} />
        <span className="min-w-0 flex-1 break-words">{topic.name}</span>
        <CountPill count={topic.taskCount} />
        <TopicChevron isOpen={isOpen} />
      </button>

      <CollapsiblePanel isOpen={isOpen}>
        <div className="mt-1 flex flex-col gap-0.5 pl-4">
          {topic.children.map((subtopic) => (
            <SubtopicRow
              isActive={subtopic.id === activeTopicId}
              key={subtopic.id}
              subtopic={subtopic}
            />
          ))}
        </div>
      </CollapsiblePanel>
    </div>
  );
}

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
      className="flex max-h-[min(75vh,48rem)] w-full flex-col overflow-hidden rounded-3xl border border-line bg-white p-3.5 shadow-[0_16px_35px_rgba(15,43,76,0.06)]"
    >
      <p className="shrink-0 px-3 pb-2 pt-2 text-xs font-bold uppercase tracking-wider text-muted">
        {subjectData.name}
      </p>

      <div className="scrollbar-thin -mr-1 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {subjectData.topics.map((topic) => (
          <TopicRow
            activeTopicId={activeTopicId}
            isOpen={openedTopicId === topic.id}
            key={topic.id}
            onToggle={() =>
              setOpenedTopicId((current) =>
                current === topic.id ? null : topic.id,
              )
            }
            topic={topic}
          />
        ))}
      </div>
    </nav>
  );
}
