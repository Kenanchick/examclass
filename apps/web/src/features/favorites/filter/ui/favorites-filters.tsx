"use client";

import { ChevronDown, Search, X } from "lucide-react";
import type { useFavoritesFilter } from "../model/use-favorites-filter";

type FavoritesFiltersProps = {
  filter: ReturnType<typeof useFavoritesFilter>;
};

const pillClassName = (isActive: boolean) =>
  `cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-bold transition ${
    isActive
      ? "border-brand bg-brand/10 text-brand"
      : "border-line bg-white text-muted hover:border-brand/40 hover:text-ink"
  }`;

export function FavoritesFilters({ filter }: FavoritesFiltersProps) {
  const {
    query,
    setQuery,
    taskNumber,
    selectTaskNumber,
    subtopicId,
    setSubtopicId,
    numbers,
    subtopics,
    filteredTasks,
    isFiltering,
    reset,
  } = filter;

  return (
    <section
      aria-label="Фильтры избранного"
      className="rounded-3xl border border-line bg-white p-5 sm:p-6"
    >
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input
            aria-label="Поиск по условию задачи"
            className="w-full rounded-xl border border-line bg-white py-3 pl-12 pr-4 text-[15px] text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/10"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по условию задачи…"
            type="search"
            value={query}
          />
        </div>

        {taskNumber !== null && subtopics.length > 0 && (
          <div className="relative lg:w-96">
            <select
              aria-label="Подтема"
              className="w-full cursor-pointer appearance-none rounded-xl border border-line bg-white py-3 pl-4 pr-10 text-[15px] font-medium text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
              onChange={(event) => setSubtopicId(event.target.value || null)}
              value={subtopicId ?? ""}
            >
              <option value="">Все подтемы</option>
              {subtopics.map((subtopic) => (
                <option key={subtopic.id} value={subtopic.id}>
                  {subtopic.name} · {subtopic.count}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          aria-pressed={taskNumber === null}
          className={pillClassName(taskNumber === null)}
          onClick={() => selectTaskNumber(null)}
          type="button"
        >
          Все
        </button>
        {numbers.map((number) => (
          <button
            aria-pressed={taskNumber === number}
            className={pillClassName(taskNumber === number)}
            key={number}
            onClick={() =>
              selectTaskNumber(taskNumber === number ? null : number)
            }
            type="button"
          >
            {number}
          </button>
        ))}

        {isFiltering && (
          <button
            className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-muted transition hover:text-brand"
            onClick={reset}
            type="button"
          >
            <X className="size-4" />
            Сбросить
          </button>
        )}
      </div>

      {isFiltering && (
        <p className="mt-3 text-sm text-muted">
          Найдено: {filteredTasks.length}
        </p>
      )}
    </section>
  );
}
