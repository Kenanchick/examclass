import { apiClient } from "@/shared/api/http-client";
import type {
  CreateTeacherHomeworkAssignmentInput,
  TeacherHomeworkStudent,
  TeacherHomeworkTasksPage,
  TeacherHomeworkTasksParams,
} from "../model/teacher-homework";

const teacherHomeworkBasePath = "/teacher/homework";

export async function getTeacherHomeworkTasks(
  params: TeacherHomeworkTasksParams = {},
) {
  const response = await apiClient.get<TeacherHomeworkTasksPage>(
    `${teacherHomeworkBasePath}/tasks`,
    { params },
  );

  return response.data;
}

export async function getTeacherHomeworkStudents() {
  const response = await apiClient.get<TeacherHomeworkStudent[]>(
    `${teacherHomeworkBasePath}/students`,
  );

  return response.data;
}

export async function createTeacherHomeworkAssignment(
  data: CreateTeacherHomeworkAssignmentInput,
) {
  const response = await apiClient.post<unknown>(
    `${teacherHomeworkBasePath}/assignments`,
    data,
  );

  return response.data;
}
