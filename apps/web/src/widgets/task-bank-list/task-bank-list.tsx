"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ArrowRight, BookOpen, ChevronDown } from "lucide-react";
import { useSubjectsQuery } from "@/entities/subject/api/use-subjects-query";
import { useSubjectTopicsQuery } from "@/entities/topic/api/use-subject-topics-query";
import { formatTaskCount } from "@/entities/topic/lib/format-task-count";
import { RequestState } from "@/shared/ui/request-state/request-state";
import { useTaskBankStore } from "./model/task-bank-store";

type SubjectComingSoonProps = {
  subjectName: string;
};

function SubjectComingSoon({ subjectName }: SubjectComingSoonProps) {
  return (
    <div className="flex flex-col items-start gap-5 rounded-2xl border-2 border-dashed border-[#c6ddf5] bg-[#eef6ff] p-6 sm:flex-row sm:items-center sm:p-8">
      <span className="grid size-14 shrink-0 rotate-[-3deg] place-items-center rounded-[1.15rem] bg-[#d9ebff] text-brand shadow-[0_4px_0_#9fc8ee]">
        <BookOpen className="size-7" strokeWidth={2.2} />
      </span>

      <div>
        <p className="text-sm font-semibold text-brand">Скоро</p>
        <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-ink">
          Банк задач по предмету «{subjectName}» в разработке
        </h2>
        <p className="mt-2 max-w-xl text-[15px] leading-6 text-muted">
          Мы готовим темы, задачи и разборы. Пока продолжайте подготовку по
          профильной математике.
        </p>
      </div>
    </div>
  );
}

export function TaskBankList() {
  const router = useRouter();
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
  const selectedSubject = subjects.find(
    (subject) => subject.code === selectedSubjectCode,
  );
  const subjectData = topicsQuery.data;
  const isLoading =
    subjectsQuery.isPending ||
    (Boolean(selectedSubjectCode) && topicsQuery.isPending);
  const hasError = subjectsQuery.isError || topicsQuery.isError;

  const handleRetry = () => {
    void subjectsQuery.refetch();

    if (selectedSubjectCode) {
      void topicsQuery.refetch();
    }
  };

  useEffect(() => {
    const firstSubject = subjects[0];

    if (!selectedSubjectCode && firstSubject) {
      setSelectedSubjectCode(firstSubject.code);
    }
  }, [selectedSubjectCode, setSelectedSubjectCode, subjects]);

  return (
    <section className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
      <div className="absolute right-0 top-0 hidden h-56 items-center gap-4 lg:flex">
        {subjectData && (
          <p className="text-base font-medium text-muted">
            {formatTaskCount(subjectData.totalTaskCount)}
          </p>
        )}
        <Image
          alt={
            subjectData?.topics.length === 0
              ? "Задумчивый помощник ExamClass"
              : "Помощник ExamClass"
          }
          className={
            subjectData?.topics.length === 0 ? "h-auto w-36" : "h-auto w-40"
          }
          height={2000}
          src={
            subjectData?.topics.length === 0 ? "/thinking-cat.png" : "/cat.png"
          }
          width={2000}
        />
      </div>

      <div className="relative z-10 lg:pr-52">
        <h1 className="text-3xl font-bold tracking-[-0.05em] text-ink sm:text-4xl">
          Открытый банк задач
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-base text-muted sm:text-lg">
            {selectedSubject?.name ?? "Профильная математика"} · ЕГЭ
          </p>

          {subjectData && (
            <span className="text-base font-medium text-muted lg:hidden">
              {formatTaskCount(subjectData.totalTaskCount)}
            </span>
          )}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          {subjects.map((subject) => {
            const isActive = subject.code === selectedSubjectCode;

            return (
              <button
                aria-pressed={isActive}
                className={`cursor-pointer rounded-xl border px-5 py-3 text-[15px] font-semibold transition ${
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
        {isLoading && <RequestState variant="loading" />}

        {hasError && (
          <RequestState
            description="Темы и задания временно недоступны. Попробуйте получить их ещё раз."
            onRetry={handleRetry}
            title="Не удалось загрузить банк задач"
            variant="error"
          />
        )}

        {!isLoading && !hasError && subjects.length === 0 && (
          <RequestState
            description="Скоро здесь появятся предметы, темы и задачи для подготовки к ЕГЭ."
            title="Банк задач пока пуст"
            variant="empty"
          />
        )}

        {subjectData && !hasError && subjectData.topics.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 md:gap-x-6">
            {subjectData.topics.map((topic) => {
              const hasSubtopics = topic.children.length > 0;
              const isOpen = openedTopicId === topic.id;
              const hasTasks = topic.taskCount > 0;

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
                    className="group flex min-h-16 w-full cursor-pointer items-center gap-4 rounded-xl border border-line px-4 text-left transition hover:border-brand/40 hover:bg-panel"
                    onClick={() => {
                      if (hasSubtopics) {
                        setOpenedTopicId(isOpen ? null : topic.id);
                      } else if (hasTasks) {
                        router.push(`/bank/${topic.id}`);
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

                    <span className="shrink-0 rounded-full bg-panel px-2.5 py-1 text-xs font-bold text-muted transition group-hover:bg-white">
                      {formatTaskCount(topic.taskCount)}
                    </span>

                    {hasSubtopics ? (
                      <ChevronDown
                        className={`size-5 text-brand transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    ) : hasTasks ? (
                      <ArrowRight className="size-5 text-brand transition-transform group-hover:translate-x-1" />
                    ) : null}
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="mt-2 rounded-xl border border-brand/15 bg-brand/5 p-2">
                        {topic.children.map((subtopic) => {
                          const subtopicHasTasks = subtopic.taskCount > 0;

                          return (
                            <button
                              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                                subtopicHasTasks
                                  ? "cursor-pointer text-ink hover:bg-white"
                                  : "cursor-default text-muted"
                              }`}
                              key={subtopic.id}
                              onClick={() => {
                                if (subtopicHasTasks) {
                                  router.push(`/bank/${subtopic.id}`);
                                }
                              }}
                              type="button"
                            >
                              <span className="size-1.5 rounded-full bg-brand" />
                              <span className="flex-1">{subtopic.name}</span>
                              <span className="shrink-0 rounded-full border border-brand/10 bg-white px-2.5 py-1 text-xs font-bold text-muted">
                                {formatTaskCount(subtopic.taskCount)}
                              </span>
                              {subtopicHasTasks && (
                                <ArrowRight className="size-4 text-brand" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {subjectData && !hasError && subjectData.topics.length === 0 && (
          <SubjectComingSoon subjectName={subjectData.name} />
        )}
      </div>
    </section>
  );
}
