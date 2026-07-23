import { useQuery } from "@tanstack/react-query";
import { getTask } from "./task-api";

export function useTaskQuery(publicId: string) {
  return useQuery({
    queryKey: ["tasks", publicId],
    queryFn: () => getTask(publicId),
    enabled: Boolean(publicId),
  });
}
