"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useSubjectsQuery } from "@/entities/subject/api/use-subjects-query";
import { useSubjectTopicsQuery } from "@/entities/topic/api/use-subject-topics-query";
import { useTaskBankStore } from "./model/task-bank-store";

export function TaskBankList() {
  const selectedSubjectCode = useTaskBankStore(
    (state) => state.selectedSubjectCode,
  );
  const openedTopicId = useTaskBankStore((state) => state.openedTopicId);
  const setSelectedSubjectCode = useTaskBankStore(
    (state) => state.setSelectedSubjectCode,
  );
  const setOpenedTopicId = useTaskBankStore((state) => state.setOpenedTopicId);
  const subjectsQuery = useSubjectsQuery();
  const topicsQuery = useSubjectTopicsQuery(selectedSubjectCode);
  const subjects = useMemo(
    () => subjectsQuery.data ?? [],
    [subjectsQuery.data],
  );
  const subjectData = topicsQuery.data;
  const isLoading =
    subjectsQuery.isPending ||
    (Boolean(selectedSubjectCode) && topicsQuery.isPending);
  const hasError = subjectsQuery.isError || topicsQuery.isError;

  useEffect(() => {
    const firstSubject = subjects[0];

    if (!selectedSubjectCode && firstSubject) {
      setSelectedSubjectCode(firstSubject.code);
    }
  }, [selectedSubjectCode, setSelectedSubjectCode, subjects]);

  return (
    <section className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
      <div className="absolute right-0 top-0 hidden h-56 w-56 items-center justify-center lg:flex">
        <Image
          alt="Помощник ExamClass"
          className="h-auto w-40"
          height={2000}
          src="/cat.png"
          width={2000}
        />
      </div>

      <div className="relative z-10 lg:pr-52">
        <h1 className="text-3xl font-bold tracking-[-0.05em] text-ink sm:text-4xl">
          Открытый банк задач
        </h1>

        <p className="mt-2 text-base text-muted sm:text-lg">
          {subjectData?.name ?? "Профильная математика"} · ЕГЭ
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          {subjects.map((subject) => {
            const isActive = subject.code === selectedSubjectCode;

            return (
              <button
                aria-pressed={isActive}
                className={`rounded-xl border px-5 py-3 text-[15px] font-semibold transition ${
                  isActive
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-line bg-white text-ink hover:bg-panel"
                }`}
                key={subject.id}
                onClick={() => setSelectedSubjectCode(subject.code)}
                type="button"
              >
                {subject.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mt-10">
        {isLoading && <p className="text-[15px] text-muted">Загружаем темы…</p>}

        {hasError && (
          <p className="text-[15px] text-danger" role="alert">
            Не удалось загрузить банк задач
          </p>
        )}

        {!isLoading && !hasError && subjects.length === 0 && (
          <p className="text-[15px] text-muted">Предметы пока не добавлены</p>
        )}

        {subjectData && !hasError && (
          <div className="grid gap-3 md:grid-cols-2 md:gap-x-6">
            {subjectData.topics.map((topic) => {
              const hasSubtopics = topic.children.length > 0;
              const isOpen = openedTopicId === topic.id;

              return (
                <div
                  key={topic.id}
                  onMouseEnter={() => {
                    if (hasSubtopics) {
                      setOpenedTopicId(topic.id);
                    }
                  }}
                  onMouseLeave={() => {
                    if (hasSubtopics) {
                      setOpenedTopicId(null);
                    }
                  }}
                >
                  <button
                    aria-expanded={hasSubtopics ? isOpen : undefined}
                    className="group flex min-h-16 w-full items-center gap-4 rounded-xl border border-line px-4 text-left transition hover:border-brand/40 hover:bg-panel"
                    onClick={() => {
                      if (hasSubtopics) {
                        setOpenedTopicId(isOpen ? null : topic.id);
                      }
                    }}
                    type="button"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-[14px] border border-[#80afe4] bg-gradient-to-br from-[#d8ecff] via-[#acd4ff] to-[#78afe0] text-sm font-extrabold text-[#063d73] shadow-[inset_0_2px_0_rgba(255,255,255,0.8),inset_0_-2px_0_rgba(38,100,166,0.16),0_4px_0_#5d91c9,0_7px_0_rgba(31,79,129,0.14)]">
                      {topic.sortOrder}
                    </span>

                    <span className="flex-1 text-[15px] font-medium text-ink">
                      {topic.name}
                    </span>

                    {hasSubtopics ? (
                      <ChevronDown
                        className={`size-5 text-brand transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    ) : (
                      <ArrowRight className="size-5 text-brand transition-transform group-hover:translate-x-1" />
                    )}
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="mt-2 rounded-xl border border-brand/15 bg-brand/5 p-2">
                        {topic.children.map((subtopic) => (
                          <button
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink transition hover:bg-white"
                            key={subtopic.id}
                            type="button"
                          >
                            <span className="size-1.5 rounded-full bg-brand" />
                            <span className="flex-1">{subtopic.name}</span>
                            <ArrowRight className="size-4 text-brand" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
