"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { formatTaskCount } from "@/entities/topic/lib/format-task-count";
import type { TopicWithChildren } from "@/entities/topic/model/topic";
import styles from "./teacher-homework-topic-picker.module.css";

export type TeacherHomeworkTopicPickerProps = {
  subjectName: string;
  topics: TopicWithChildren[];
  onSelectTopic: (id: string) => void;
};

function TopicOrderBadge({ order }: { order: number }) {
  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[#80afe4] bg-gradient-to-br from-[#d8ecff] via-[#acd4ff] to-[#78afe0] text-base font-extrabold text-[#063d73] shadow-[inset_0_2px_0_rgba(255,255,255,0.8),inset_0_-2px_0_rgba(38,100,166,0.16),0_5px_0_#5d91c9,0_8px_0_rgba(31,79,129,0.14)]">
      {order}
    </span>
  );
}

function TopicCount({ count }: { count: number }) {
  return (
    <span className="shrink-0 whitespace-nowrap rounded-full bg-panel px-3 py-1.5 text-[13px] font-bold text-muted">
      {formatTaskCount(count)}
    </span>
  );
}

type TopicCardProps = {
  topic: TopicWithChildren;
  isOpen: boolean;
  onOpen: () => void;
  onSelect: () => void;
};

function TopicCard({ topic, isOpen, onOpen, onSelect }: TopicCardProps) {
  const hasChildren = topic.children.length > 0;

  return (
    <button
      aria-expanded={isOpen}
      className={`group flex min-h-[6.5rem] w-full cursor-pointer items-center gap-5 rounded-2xl border px-5 py-4 text-left transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:min-h-[7.25rem] sm:px-6 sm:py-5 ${
        isOpen
          ? "border-brand bg-brand/[0.055] shadow-[0_12px_28px_rgba(15,71,120,0.09)]"
          : "border-line bg-white hover:border-brand/40 hover:shadow-[0_10px_24px_rgba(15,43,76,0.06)]"
      }`}
      onClick={onSelect}
      onFocus={onOpen}
      onMouseEnter={onOpen}
      type="button"
    >
      <TopicOrderBadge order={topic.sortOrder} />

      <span className="min-w-0 flex-1 text-[17px] font-semibold leading-6 text-ink sm:text-lg">
        {topic.name}
      </span>

      <TopicCount count={topic.taskCount} />
      {hasChildren ? (
        <ChevronDown
          aria-hidden="true"
          className={`size-5 shrink-0 text-brand transition-transform duration-200 ${
            isOpen ? "rotate-180" : "group-hover:translate-y-0.5"
          }`}
        />
      ) : (
        <ChevronRight
          aria-hidden="true"
          className="size-5 shrink-0 text-brand transition-transform duration-200 group-hover:translate-x-1"
        />
      )}
    </button>
  );
}

type TopicRowProps = Pick<TeacherHomeworkTopicPickerProps, "onSelectTopic"> & {
  topics: TopicWithChildren[];
};

function TopicRow({ topics, onSelectTopic }: TopicRowProps) {
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const expandedTopic = topics.find((topic) => topic.id === expandedTopicId);

  return (
    <div
      className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-x-5 md:gap-y-4"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setExpandedTopicId(null);
        }
      }}
      onMouseLeave={() => setExpandedTopicId(null)}
    >
      {topics.map((topic) => (
        <TopicCard
          isOpen={topic.id === expandedTopicId && topic.children.length > 0}
          key={topic.id}
          onOpen={() => setExpandedTopicId(topic.id)}
          onSelect={() => onSelectTopic(topic.id)}
          topic={topic}
        />
      ))}

      {expandedTopic && expandedTopic.children.length > 0 && (
        <div
          className={`${styles.subtopics} md:col-span-2`}
          key={expandedTopic.id}
        >
          <div className={styles.content}>
            <div className="rounded-2xl border border-line bg-page/75 p-3">
              <p className="px-2 pb-2 text-xs font-bold uppercase tracking-[0.1em] text-muted">
                Подтемы «{expandedTopic.name}»
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {expandedTopic.children.map((child, index) => (
                  <button
                    className={`${styles.subtopic} flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 text-left text-sm font-semibold leading-5 text-ink transition-colors hover:bg-brand/5 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
                    key={child.id}
                    onClick={() => onSelectTopic(child.id)}
                    style={{ animationDelay: `${70 + index * 35}ms` }}
                    type="button"
                  >
                    <span className="min-w-0 flex-1">{child.name}</span>
                    <TopicCount count={child.taskCount} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function splitIntoRows(topics: TopicWithChildren[]) {
  return Array.from({ length: Math.ceil(topics.length / 2) }, (_, index) =>
    topics.slice(index * 2, index * 2 + 2),
  );
}

export function TeacherHomeworkTopicPicker({
  subjectName,
  topics,
  onSelectTopic,
}: TeacherHomeworkTopicPickerProps) {
  if (topics.length === 0) {
    return (
      <section aria-label={`Темы предмета: ${subjectName}`}>
        <div className="rounded-2xl border border-dashed border-line bg-page px-5 py-10 text-center">
          <p className="text-lg font-bold text-ink">Тем пока нет</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            В банке задач для предмета «{subjectName}» пока не добавлены темы.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label={`Темы предмета: ${subjectName}`}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand">
          {subjectName}
        </p>
        <p className="text-sm text-muted">
          Наведите на тему, чтобы увидеть все подтемы
        </p>
      </div>

      <div className="space-y-4">
        {splitIntoRows(topics).map((topicRow) => (
          <TopicRow
            key={topicRow.map((topic) => topic.id).join("-")}
            onSelectTopic={onSelectTopic}
            topics={topicRow}
          />
        ))}
      </div>
    </section>
  );
}
