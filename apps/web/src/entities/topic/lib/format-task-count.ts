export function formatTaskCount(count: number) {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  const word =
    lastTwoDigits >= 11 && lastTwoDigits <= 14
      ? "задач"
      : lastDigit === 1
        ? "задача"
        : lastDigit >= 2 && lastDigit <= 4
          ? "задачи"
          : "задач";

  return `${count} ${word}`;
}
