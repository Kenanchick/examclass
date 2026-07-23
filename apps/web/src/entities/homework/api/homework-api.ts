import { apiClient } from "@/shared/api/http-client";
import type {
  HomeworkAssignment,
  HomeworkAssignmentDetails,
} from "../model/homework";

export async function getHomework() {
  const response = await apiClient.get<HomeworkAssignment[]>("/homework");

  return response.data;
}

export async function getHomeworkAssignment(publicId: string) {
  const response = await apiClient.get<HomeworkAssignmentDetails>(
    `/homework/${encodeURIComponent(publicId)}`,
  );

  return response.data;
}
