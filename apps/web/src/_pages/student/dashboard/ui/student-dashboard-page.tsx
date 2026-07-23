import { StudentLayout } from "@/widgets/student-layout/ui/student-layout";
import { TaskBankList } from "@/widgets/task-bank-list/task-bank-list";

export function StudentDashboardPage() {
  return (
    <StudentLayout>
      <main className="p-4 sm:p-7 lg:p-8">
        <div className="rounded-2xl border border-line bg-white p-8">
          <TaskBankList />
        </div>
      </main>
    </StudentLayout>
  );
}
