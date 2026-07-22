import { StudentHeader } from "@/widgets/student-header/ui/student-header";
import { StudentSidebar } from "@/widgets/student-sidebar/ui/student-sidebar";
import { TaskBankList } from "@/widgets/task-bank-list/task-bank-list";

export function StudentDashboardPage() {
  return (
    <div className="min-h-dvh bg-page">
      <StudentHeader />

      <div className="grid min-h-[calc(100dvh-6rem)] lg:grid-cols-[290px_1fr]">
        <StudentSidebar />

        <main className="p-4 sm:p-7 lg:p-8">
          <div className="rounded-2xl border border-line bg-white p-8">
            <TaskBankList />
          </div>
        </main>
      </div>
    </div>
  );
}
