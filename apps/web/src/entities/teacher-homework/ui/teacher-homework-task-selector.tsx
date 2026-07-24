"use client";

import { Check, LoaderCircle, Search, X } from "lucide-react";
import { MathText } from "@/shared/ui/math-text";
import type { TeacherHomeworkTask } from "../model/teacher-homework";

type TeacherHomeworkTaskSelectorProps = {
  tasks: TeacherHomeworkTask[];
  totalTasks: number;
  selectedTaskIds: string[];
  search: string;
  isSearching: boolean;
  hasNextPage: boolean;
  isLoadingNextPage: boolean;
  onSearchChange: (value: string) => void;
  onToggleTask: (publicId: string) => void;
  onClearSelection: () => void;
  onLoadNextPage: () => void;
  errorMessage?: string;
};

function getTopicLabel(task: TeacherHomeworkTask) {
  return [
    task.topic.subject.name,
    task.topic.parent?.name,
    task.topic.name,
  ]
    .filter(Boolean)
    .join(" · ");
}

function Difficulty({ difficulty }: { difficulty: number }) {
  const level = Math.min(Math.max(difficulty, 1), 3);

  return (
    <span
      aria-label={`Сложность: ${level} из 3`}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted"
    >
      <span className="flex gap-1" aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
          <span
            className={`size-2 rounded-full ${
              index < level ? "bg-brand" : "bg-line"
            }`}
            key={index}
          />
        ))}
      </span>
      Сложность {level}/3
    </span>
  );
}

export function TeacherHomeworkTaskSelector({
  tasks,
  totalTasks,
  selectedTaskIds,
  search,
  isSearching,
  hasNextPage,
  isLoadingNextPage,
  onSearchChange,
  onToggleTask,
  onClearSelection,
  onLoadNextPage,
  errorMessage,
}: TeacherHomeworkTaskSelectorProps) {
  const selectedTaskIdSet = new Set(selectedTaskIds);
  const selectedLabel =
    selectedTaskIds.length === 1
      ? "Выбрана 1 задача"
      : `Выбрано задач: ${selectedTaskIds.length}`;

  return (
    <section
      aria-labelledby="teacher-homework-tasks-title"
      className="rounded-[2rem] border border-line bg-white p-5 shadow-[0_16px_35px_rgba(15,43,76,0.05)] sm:p-7"
    >
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-base font-bold text-white">
            1
          </span>
          <div>
            <h2
              className="text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl"
              id="teacher-homework-tasks-title"
            >
              Выберите задачи
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
              В домашнее задание попадут только отмеченные задачи. Перед
              отправкой можно спокойно проверить формулировку и тему.
            </p>
          </div>
        </div>

        {selectedTaskIds.length > 0 && (
          <div className="flex shrink-0 items-center gap-3 rounded-xl bg-brand/7 px-3 py-2 text-sm font-bold text-brand">
            <span aria-live="polite">{selectedLabel}</span>
            <button
              className="grid size-7 cursor-pointer place-items-center rounded-lg text-brand transition hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              onClick={onClearSelection}
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
              <span className="sr-only">Очистить выбор задач</span>
            </button>
          </div>
        )}
      </div>

      <label className="relative mt-5 block">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted"
        />
        <input
          className="h-13 w-full rounded-2xl border border-line bg-page pl-12 pr-4 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Поиск по формулировке, теме или ID задачи"
          type="search"
          value={search}
        />
        <span className="sr-only">Поиск задач</span>
      </label>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted">
        <span>
          {totalTasks > 0
            ? `В банке задач: ${totalTasks}`
            : "Подходящих задач не найдено"}
        </span>
        {isSearching && (
          <span className="inline-flex items-center gap-2 font-medium text-brand">
            <LoaderCircle className="size-4 animate-spin" />
            Ищем…
          </span>
        )}
      </div>

      {tasks.length > 0 ? (
        <div className="mt-5 space-y-3">
          {tasks.map((task) => {
            const isSelected = selectedTaskIdSet.has(task.publicId);

            return (
              <label
                className={`group relative block cursor-pointer rounded-2xl border p-4 transition focus-within:ring-4 focus-within:ring-brand/10 sm:p-5 ${
                  isSelected
                    ? "border-brand/45 bg-brand/[0.045]"
                    : "border-line bg-white hover:border-brand/30"
                }`}
                key={task.publicId}
              >
                <input
                  checked={isSelected}
                  className="peer sr-only"
                  onChange={() => onToggleTask(task.publicId)}
                  type="checkbox"
                />
                <span
                  aria-hidden="true"
                  className={`absolute right-4 top-4 grid size-6 place-items-center rounded-lg border transition sm:right-5 sm:top-5 ${
                    isSelected
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-white text-transparent group-hover:border-brand/40"
                  }`}
                >
                  <Check className="size-4" strokeWidth={3} />
                </span>

                <div className="pr-9">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="rounded-lg bg-panel px-2.5 py-1 text-xs font-bold tracking-wide text-brand">
                      {task.publicId}
                    </span>
                    <Difficulty difficulty={task.difficulty} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-brand">
                    {getTopicLabel(task)}
                  </p>
                  <MathText
                    className="mt-2 text-[15px] leading-7 text-ink [&_p:last-child]:mb-0"
                    content={task.statement}
                  />
                </div>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-line bg-page px-5 py-10 text-center">
          <p className="text-lg font-bold text-ink">Задачи не найдены</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Попробуйте изменить запрос или очистить поиск.
          </p>
        </div>
      )}

      {hasNextPage && (
        <button
          className="mt-5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-brand/25 bg-white px-5 text-sm font-bold text-brand transition hover:bg-brand/5 disabled:cursor-wait disabled:opacity-65"
          disabled={isLoadingNextPage}
          onClick={onLoadNextPage}
          type="button"
        >
          {isLoadingNextPage && <LoaderCircle className="size-4 animate-spin" />}
          {isLoadingNextPage ? "Загружаем задачи…" : "Показать ещё"}
        </button>
      )}

      {errorMessage && (
        <p className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
          {errorMessage}
        </p>
      )}
    </section>
  );
}
