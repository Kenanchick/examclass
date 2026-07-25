import { TeacherTrajectoryPage } from "@/_pages/teacher/trajectory/ui/teacher-trajectory-page";

type TeacherTrajectoryRouteProps = {
  params: Promise<{
    studentId: string;
  }>;
};

export default async function TeacherTrajectoryRoute({
  params,
}: TeacherTrajectoryRouteProps) {
  const { studentId } = await params;

  return <TeacherTrajectoryPage studentId={studentId} />;
}
