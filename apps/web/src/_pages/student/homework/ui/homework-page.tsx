"use client";

import { TeacherHomeworkPage } from "@/_pages/teacher/homework/ui/teacher-homework-page";
import { useAccountModeStore } from "@/features/account-mode/model/use-account-mode-store";
import { StudentHomeworkPage } from "./student-homework-page";

export function HomeworkPage() {
  const accountMode = useAccountModeStore((state) => state.mode);

  return accountMode === "teacher" ? (
    <TeacherHomeworkPage />
  ) : (
    <StudentHomeworkPage />
  );
}
