import type { CalendarEvent } from "@/shared/model/calendar-event";
import { toDateKey } from "@/shared/lib/date";
import type { HomeworkAssignment } from "../model/homework";
import { getDeadlineMeta } from "./homework-deadline";

export function toHomeworkCalendarEvents(
  homework: HomeworkAssignment[],
): CalendarEvent[] {
  return homework.map((assignment) => {
    const deadline = getDeadlineMeta(assignment.deadline);

    return {
      id: assignment.publicId,
      title: assignment.title,
      date: toDateKey(deadline.date),
      time: `до ${deadline.time}`,
      kind: "deadline",
    };
  });
}
