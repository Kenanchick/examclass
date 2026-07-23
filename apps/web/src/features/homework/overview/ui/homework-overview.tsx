import { CalendarClock, CheckCheck, ClipboardList } from "lucide-react";
import type { HomeworkFilter } from "@/features/homework/filter/model/use-homework-filter-store";

const filters: Array<{ value: HomeworkFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "upcoming", label: "Предстоит" },
  { value: "overdue", label: "Срок прошёл" },
];

type HomeworkOverviewProps = {
  activeFilter: HomeworkFilter;
  filterCounts: Record<HomeworkFilter, number>;
  taskCount: number;
  onFilterChange: (filter: HomeworkFilter) => void;
};

export function HomeworkOverview({
  activeFilter,
  filterCounts,
  taskCount,
  onFilterChange,
}: HomeworkOverviewProps) {
  return (
    <>
      <section
        aria-label="Сводка домашних заданий"
        className="grid border-b border-line bg-white sm:grid-cols-3"
      >
        <div className="flex items-center gap-4 px-6 py-5 sm:px-8">
          <CalendarClock className="size-6 text-brand" />
          <div>
            <p className="text-2xl font-bold text-ink">
              {filterCounts.upcoming}
            </p>
            <p className="text-sm text-muted">ближайших сроков</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border-t border-line px-6 py-5 sm:border-l sm:border-t-0 sm:px-8">
          <ClipboardList className="size-6 text-brand" />
          <div>
            <p className="text-2xl font-bold text-ink">{taskCount}</p>
            <p className="text-sm text-muted">заданий всего</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border-t border-line px-6 py-5 sm:border-l sm:border-t-0 sm:px-8">
          <CheckCheck className="size-6 text-success" />
          <div>
            <p className="text-2xl font-bold text-ink">
              {filterCounts.overdue}
            </p>
            <p className="text-sm text-muted">с истёкшим сроком</p>
          </div>
        </div>
      </section>

      <div className="bg-white px-6 sm:px-8 lg:px-10">
        <nav
          aria-label="Фильтр домашних заданий"
          className="flex gap-7 overflow-x-auto border-b border-line pt-5"
        >
          {filters.map((item) => (
            <button
              aria-pressed={activeFilter === item.value}
              className={`relative shrink-0 cursor-pointer pb-4 text-sm font-bold transition ${
                activeFilter === item.value
                  ? "text-brand after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-brand"
                  : "text-muted hover:text-ink"
              }`}
              key={item.value}
              onClick={() => onFilterChange(item.value)}
              type="button"
            >
              {item.label} · {filterCounts[item.value]}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
