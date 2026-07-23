import type { ReactNode } from "react";
import { StudentHeader } from "@/widgets/student-header/ui/student-header";
import { StudentSidebar } from "@/widgets/student-sidebar/ui/student-sidebar";

type StudentLayoutProps = {
  children: ReactNode;
};

export function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <div className="min-h-dvh bg-page">
      <StudentHeader />

      <div className="grid min-h-[calc(100dvh-6rem)] lg:grid-cols-[92px_1fr]">
        <StudentSidebar />
        {children}
      </div>
    </div>
  );
}
