import { useQuery } from "@tanstack/react-query";
import { getTopicTasks } from "./topic-tasks-api";

export function useTopicTasksQuery(topicId: string) {
  return useQuery({
    queryKey: ["topics", topicId, "tasks"],
    queryFn: () => getTopicTasks(topicId),
    enabled: Boolean(topicId),
  });
}
