"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Flag,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

export type ProfileCalendarEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  kind: "homework" | "deadline" | "event";
};

type ProfileCalendarProps = {
  events?: ProfileCalendarEvent[];
};

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const eventKinds = {
  homework: {
    label: "Домашнее задание",
    dotClassName: "bg-brand",
    icon: ClipboardCheck,
  },
  deadline: {
    label: "Дедлайн",
    dotClassName: "bg-danger",
    icon: Flag,
  },
  event: {
    label: "Событие",
    dotClassName: "bg-amber-400",
    icon: Sparkles,
  },
} as const;

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isSameDate(first: Date, second: Date) {
  return toDateKey(first) === toDateKey(second);
}

export function ProfileCalendar({ events = [] }: ProfileCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const days = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const result: Array<Date | null> = Array.from(
      { length: firstWeekDay },
      () => null,
    );

    for (let day = 1; day <= daysInMonth; day += 1) {
      result.push(new Date(year, month, day));
    }

    while (result.length < 42) {
      result.push(null);
    }

    return result;
  }, [visibleMonth]);
  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, ProfileCalendarEvent[]>>(
      (accumulator, event) => {
        const dateEvents = accumulator[event.date] ?? [];

        dateEvents.push(event);
        accumulator[event.date] = dateEvents;
        return accumulator;
      },
      {},
    );
  }, [events]);
  const selectedDateKey = toDateKey(selectedDate);
  const selectedEvents = eventsByDate[selectedDateKey] ?? [];
  const monthTitle = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);
  const selectedDateTitle = new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(selectedDate);

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + offset,
      1,
    );

    setVisibleMonth(nextMonth);
    setSelectedDate(nextMonth);
  };

  const showToday = () => {
    const currentDate = new Date();

    setVisibleMonth(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    );
    setSelectedDate(currentDate);
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-line bg-white">
      <div className="border-b border-line px-6 py-6 sm:px-8 sm:py-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
              <CalendarDays className="size-6" />
            </span>
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
                Календарь подготовки
              </h2>
              <p className="mt-2 max-w-xl text-base leading-7 text-muted">
                Здесь появятся дедлайны домашних заданий, занятия и важные
                события.
              </p>
            </div>
          </div>

          <button
            className="min-h-11 cursor-pointer rounded-xl border border-line px-4 text-sm font-bold text-brand transition hover:bg-brand/5"
            onClick={showToday}
            type="button"
          >
            Сегодня
          </button>
        </div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <button
              aria-label="Предыдущий месяц"
              className="grid size-12 cursor-pointer place-items-center rounded-2xl border border-line text-ink transition hover:border-brand/30 hover:bg-panel"
              onClick={() => changeMonth(-1)}
              type="button"
            >
              <ChevronLeft className="size-6" />
            </button>

            <h3 className="text-center text-xl font-bold capitalize text-ink sm:text-2xl">
              {monthTitle}
            </h3>

            <button
              aria-label="Следующий месяц"
              className="grid size-12 cursor-pointer place-items-center rounded-2xl border border-line text-ink transition hover:border-brand/30 hover:bg-panel"
              onClick={() => changeMonth(1)}
              type="button"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>

          <div className="mt-7 grid grid-cols-7 gap-1 sm:gap-2">
            {weekDays.map((day) => (
              <div
                className="pb-2 text-center text-sm font-bold text-muted"
                key={day}
              >
                {day}
              </div>
            ))}

            {days.map((date, index) => {
              if (!date) {
                return <div aria-hidden="true" key={`empty-${index}`} />;
              }

              const dateKey = toDateKey(date);
              const dayEvents = eventsByDate[dateKey] ?? [];
              const isSelected = isSameDate(date, selectedDate);
              const isToday = isSameDate(date, today);

              return (
                <button
                  aria-label={new Intl.DateTimeFormat("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(date)}
                  aria-pressed={isSelected}
                  className={`relative flex aspect-square min-h-12 cursor-pointer flex-col items-center justify-center rounded-2xl border text-base font-bold transition sm:min-h-16 ${
                    isSelected
                      ? "border-brand bg-brand text-white shadow-[0_8px_18px_rgba(19,66,112,0.2)]"
                      : isToday
                        ? "border-brand/35 bg-brand/5 text-brand"
                        : "border-transparent text-ink hover:border-line hover:bg-panel"
                  }`}
                  key={dateKey}
                  onClick={() => setSelectedDate(date)}
                  type="button"
                >
                  {date.getDate()}
                  {dayEvents.length > 0 && (
                    <span className="absolute bottom-2 flex gap-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <span
                          className={`size-1.5 rounded-full ${
                            isSelected
                              ? "bg-white"
                              : eventKinds[event.kind].dotClassName
                          }`}
                          key={event.id}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 border-t border-line pt-5">
            {Object.entries(eventKinds).map(([kind, config]) => (
              <span
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted"
                key={kind}
              >
                <span
                  className={`size-2.5 rounded-full ${config.dotClassName}`}
                />
                {config.label}
              </span>
            ))}
          </div>
        </div>

        <aside className="border-t border-line bg-panel/55 p-6 sm:p-8 xl:border-l xl:border-t-0">
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-brand">
            Выбранный день
          </p>
          <h3 className="mt-2 text-xl font-bold capitalize leading-7 text-ink">
            {selectedDateTitle}
          </h3>

          {selectedEvents.length > 0 ? (
            <div className="mt-6 space-y-3">
              {selectedEvents.map((event) => {
                const config = eventKinds[event.kind];
                const Icon = config.icon;

                return (
                  <article
                    className="rounded-2xl border border-line bg-white p-4"
                    key={event.id}
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <p className="text-base font-bold text-ink">
                          {event.title}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {event.time ?? config.label}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-brand/25 bg-white p-5">
              <span className="grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand">
                <Clock3 className="size-6" />
              </span>
              <p className="mt-4 text-lg font-bold text-ink">Событий нет</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Когда преподаватель назначит домашнее задание или занятие, оно
                появится здесь автоматически.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
