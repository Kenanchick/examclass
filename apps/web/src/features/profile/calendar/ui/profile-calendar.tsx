"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { parseDateKey, toDateKey } from "@/shared/lib/date";
import type { CalendarEvent } from "@/shared/model/calendar-event";

type ProfileCalendarProps = {
  events?: CalendarEvent[];
};

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const eventKinds = {
  homework: {
    label: "Домашнее задание",
    dotClassName: "bg-brand",
  },
  deadline: {
    label: "Дедлайн",
    dotClassName: "bg-danger",
  },
  event: {
    label: "Событие",
    dotClassName: "bg-amber-400",
  },
} as const;

function isSameDate(first: Date, second: Date) {
  return toDateKey(first) === toDateKey(second);
}

function getTooltipPositionClass(dayIndex: number) {
  const column = dayIndex % weekDays.length;
  const row = Math.floor(dayIndex / weekDays.length);
  const verticalPosition =
    row >= 4
      ? "bottom-[calc(100%+0.6rem)] top-auto"
      : "top-[calc(100%+0.6rem)]";

  if (column <= 1) {
    return `${verticalPosition} left-0 translate-x-0`;
  }

  if (column >= 5) {
    return `${verticalPosition} left-auto right-0 translate-x-0`;
  }

  return `${verticalPosition} left-1/2 -translate-x-1/2`;
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
    return events.reduce<Record<string, CalendarEvent[]>>(
      (accumulator, event) => {
        const dateEvents = accumulator[event.date] ?? [];

        dateEvents.push(event);
        accumulator[event.date] = dateEvents;
        return accumulator;
      },
      {},
    );
  }, [events]);
  const monthTitle = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);
  useEffect(() => {
    const requestedDate = parseDateKey(
      new URLSearchParams(window.location.search).get("date"),
    );

    if (requestedDate) {
      setVisibleMonth(
        new Date(requestedDate.getFullYear(), requestedDate.getMonth(), 1),
      );
      setSelectedDate(requestedDate);
    }
  }, []);

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
    <section
      className="scroll-mt-6 overflow-hidden rounded-[2rem] border border-line bg-white"
      id="calendar"
    >
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
            const tooltipId = `calendar-events-${dateKey}`;

            return (
              <button
                aria-describedby={dayEvents.length > 0 ? tooltipId : undefined}
                aria-label={new Intl.DateTimeFormat("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(date)}
                aria-pressed={isSelected}
                className={`group relative flex aspect-square min-h-12 cursor-pointer flex-col items-center justify-center rounded-2xl border text-base font-bold transition sm:min-h-16 ${
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
                  <>
                    <span className="absolute bottom-2 flex gap-1.5">
                      {dayEvents.slice(0, 3).map((event) => (
                        <span
                          className={`size-2 rounded-full ${
                            isSelected
                              ? "bg-white"
                              : eventKinds[event.kind].dotClassName
                          }`}
                          key={event.id}
                        />
                      ))}
                    </span>
                    <span
                      className={`pointer-events-none absolute z-30 w-56 max-w-[calc(100vw-3rem)] rounded-2xl border border-line bg-white p-4 text-left text-ink opacity-0 shadow-[0_16px_32px_rgba(15,43,76,0.16)] transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 ${getTooltipPositionClass(index)}`}
                      id={tooltipId}
                      role="tooltip"
                    >
                      {dayEvents.slice(0, 3).map((event) => (
                        <span className="mb-3 block last:mb-0" key={event.id}>
                          <span className="text-xs font-bold text-brand">
                            {eventKinds[event.kind].label}
                          </span>
                          <span className="mt-1 block text-sm font-bold leading-5 text-ink">
                            {event.title}
                          </span>
                          {event.time && (
                            <span className="mt-1 block text-xs font-medium text-muted">
                              {event.time}
                            </span>
                          )}
                        </span>
                      ))}
                    </span>
                  </>
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
    </section>
  );
}
