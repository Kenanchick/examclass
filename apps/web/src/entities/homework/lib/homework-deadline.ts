const dayInMilliseconds = 24 * 60 * 60 * 1000;
const dayFormatter = new Intl.DateTimeFormat("ru-RU", { day: "2-digit" });
const monthFormatter = new Intl.DateTimeFormat("ru-RU", { month: "short" });
const fullDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});

function getDayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatRemainingDays(days: number) {
  const lastDigit = days % 10;
  const lastTwoDigits = days % 100;
  const word =
    lastTwoDigits >= 11 && lastTwoDigits <= 14
      ? "дней"
      : lastDigit === 1
        ? "день"
        : lastDigit >= 2 && lastDigit <= 4
          ? "дня"
          : "дней";

  return `${days} ${word}`;
}

export function getDeadlineMeta(deadline: string, now = new Date()) {
  const date = new Date(deadline);
  const daysLeft = Math.round(
    (getDayStart(date).getTime() - getDayStart(now).getTime()) /
      dayInMilliseconds,
  );
  const isOverdue = date.getTime() < now.getTime();
  const relativeLabel = isOverdue
    ? "Срок прошёл"
    : daysLeft === 0
      ? "Сегодня"
      : daysLeft === 1
        ? "Завтра"
        : `Ещё ${formatRemainingDays(daysLeft)}`;

  return {
    date,
    isOverdue,
    relativeLabel,
    day: dayFormatter.format(date),
    month: monthFormatter.format(date).replace(".", ""),
    fullDate: fullDateFormatter.format(date),
    time: timeFormatter.format(date),
  };
}
