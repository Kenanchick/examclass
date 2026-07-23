import { StudentHomeworkAssignmentPage } from "@/_pages/student/homework/ui/student-homework-assignment-page";

type HomeworkAssignmentRouteProps = {
  params: Promise<{
    publicId: string;
  }>;
};

export default async function HomeworkAssignmentRoute({
  params,
}: HomeworkAssignmentRouteProps) {
  const { publicId } = await params;

  return <StudentHomeworkAssignmentPage publicId={publicId} />;
}
