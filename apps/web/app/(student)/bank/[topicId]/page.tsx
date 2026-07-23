import { StudentTopicTasksPage } from "@/_pages/student/topic-tasks/ui/student-topic-tasks-page";

type BankRouteProps = {
  params: Promise<{
    topicId: string;
  }>;
};

export default async function BankRoute({ params }: BankRouteProps) {
  const { topicId } = await params;

  return <StudentTopicTasksPage topicId={topicId} />;
}
