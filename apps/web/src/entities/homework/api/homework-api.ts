import { apiClient } from "@/shared/api/http-client";
import type { HomeworkAssignment } from "../model/homework";

export async function getHomework() {
  const response = await apiClient.get<HomeworkAssignment[]>("/homework");

  return response.data;
}
