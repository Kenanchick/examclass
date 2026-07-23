import { apiClient } from "@/shared/api/http-client";
import type { Task } from "../model/task";

export async function getTask(publicId: string) {
  const response = await apiClient.get<Task>(
    `/tasks/${encodeURIComponent(publicId)}`,
  );

  return response.data;
}
