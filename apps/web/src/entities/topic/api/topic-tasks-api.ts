import { apiClient } from "@/shared/api/http-client";
import type { TopicTasksResponse } from "../model/topic";

export async function getTopicTasks(topicId: string) {
  const response = await apiClient.get<TopicTasksResponse>(
    `/topics/${encodeURIComponent(topicId)}/tasks`,
  );

  return response.data;
}
