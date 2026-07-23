import { StudentTaskPage } from "@/_pages/student/task/ui/student-task-page";

type TaskRouteProps = {
  params: Promise<{
    publicId: string;
  }>;
};

export default async function TaskRoute({ params }: TaskRouteProps) {
  const { publicId } = await params;

  return <StudentTaskPage publicId={publicId} />;
}
