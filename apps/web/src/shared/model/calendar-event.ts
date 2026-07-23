export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  kind: "homework" | "deadline" | "event";
};
