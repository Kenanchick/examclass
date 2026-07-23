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

const EASE_SMOOTH = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const CLOUD_PATH_WIDE =
  "M955.0,170.0 C946.3,186.5 884.4,212.7 854.6,233.0 C824.9,253.3 829.8,281.1 776.6,291.6 C723.5,302.0 609.0,292.8 535.7,295.5 C462.4,298.3 396.0,315.3 336.6,308.1 C277.2,301.0 222.1,268.8 179.3,252.8 C136.6,236.8 102.6,225.8 80.3,212.0 C57.9,198.2 42.0,184.5 45.0,170.0 C48.0,155.5 80.6,142.3 98.1,125.0 C115.6,107.6 108.4,77.9 149.8,65.9 C191.2,54.0 288.2,61.0 346.6,53.2 C405.0,45.3 448.9,18.8 500.0,18.8 C551.1,18.8 595.0,45.3 653.4,53.2 C711.8,61.0 808.0,52.5 850.2,65.9 C892.4,79.4 889.3,116.8 906.8,134.1 C924.2,151.5 963.7,153.5 955.0,170.0 Z";

const CLOUD_PATH_TALL =
  "M620.0,358.0 C610.1,403.1 568.0,431.9 551.9,477.9 C535.8,523.8 553.3,611.1 523.2,633.6 C493.0,656.2 418.6,601.4 371.1,613.1 C323.7,624.7 273.6,712.8 238.7,703.6 C203.8,694.4 197.7,592.1 161.9,557.8 C126.1,523.4 47.7,531.0 24.0,497.7 C0.4,464.4 11.8,400.7 20.0,358.0 C28.2,315.3 58.7,286.3 73.3,241.6 C88.0,196.9 76.7,112.8 107.9,90.0 C139.1,67.3 213.5,118.4 260.5,105.0 C307.5,91.6 354.7,1.7 389.9,9.6 C425.0,17.5 434.6,119.5 471.5,152.5 C508.3,185.5 586.5,173.2 611.2,207.4 C636.0,241.7 629.9,312.9 620.0,358.0 Z";

type SubjectComingSoonProps = {
  subjectName: string;
};

function Cloud({
  path,
  viewBox,
  className = "",
}: {
  path: string;
  viewBox: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={`h-auto w-full text-[#eef6ff] ${className}`}
      viewBox={viewBox}
    >
      <path
        d={path}
        fill="currentColor"
        stroke="#c6ddf5"
        strokeWidth="2.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function SubjectComingSoon({ subjectName }: SubjectComingSoonProps) {
  return (
    <div className="relative mx-auto max-w-5xl">
      <Cloud
        className="sm:hidden"
        path={CLOUD_PATH_TALL}
        viewBox="0 0 640 720"
      />
      <Cloud
        className="hidden sm:block"
        path={CLOUD_PATH_WIDE}
        viewBox="0 0 1000 340"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-[14%] py-8 text-center sm:flex-row sm:items-center sm:gap-6 sm:px-[15%] sm:text-left">
        <span className="grid size-14 shrink-0 rotate-[-3deg] place-items-center rounded-[1.15rem] bg-[#d9ebff] text-brand shadow-[0_4px_0_#9fc8ee]">
          <BookOpen className="size-7" strokeWidth={2.2} />
        </span>

        <div>
          <p className="text-sm font-semibold text-brand">Скоро</p>
          <h2 className="mt-1 text-lg font-bold tracking-[-0.03em] text-ink sm:text-xl">
            Банк задач по предмету «{subjectName}» в разработке
          </h2>
          <p className="mt-2 max-w-xl text-[15px] leading-6 text-muted">
            Мы готовим темы, задачи и разборы. Пока продолжайте подготовку по
            профильной математике.
          </p>
        </div>
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
            subjectData?.topics.length === 0
              ? "h-auto w-44 -scale-x-100"
              : "h-auto w-40"
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
                    className={`group flex min-h-20 w-full cursor-pointer items-center gap-5 rounded-2xl border border-line px-5 text-left transition-colors duration-300 ${EASE_SMOOTH} hover:border-brand/40 hover:bg-panel`}
                    onClick={() => {
                      if (hasSubtopics) {
                        setOpenedTopicId(isOpen ? null : topic.id);
                      } else if (hasTasks) {
                        router.push(`/bank/${topic.id}`);
                      }
                    }}
                    type="button"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[#80afe4] bg-gradient-to-br from-[#d8ecff] via-[#acd4ff] to-[#78afe0] text-base font-extrabold text-[#063d73] shadow-[inset_0_2px_0_rgba(255,255,255,0.8),inset_0_-2px_0_rgba(38,100,166,0.16),0_5px_0_#5d91c9,0_8px_0_rgba(31,79,129,0.14)]">
                      {topic.sortOrder}
                    </span>

                    <span className="flex-1 text-[17px] font-medium text-ink">
                      {topic.name}
                    </span>

                    <span
                      className={`shrink-0 rounded-full bg-panel px-3 py-1.5 text-[13px] font-bold text-muted transition-colors duration-300 ${EASE_SMOOTH} group-hover:bg-white`}
                    >
                      {formatTaskCount(topic.taskCount)}
                    </span>

                    {hasSubtopics ? (
                      <ChevronDown
                        className={`size-6 text-brand transition-transform duration-500 ${EASE_SMOOTH} motion-reduce:transition-none ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    ) : hasTasks ? (
                      <ArrowRight
                        className={`size-6 text-brand transition-transform duration-300 ${EASE_SMOOTH} group-hover:translate-x-1.5`}
                      />
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
                              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[15px] font-medium transition-colors duration-300 ${EASE_SMOOTH} ${
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
                              <span className="size-2 rounded-full bg-brand" />
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
