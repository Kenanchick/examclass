import { useQuery } from "@tanstack/react-query";
import { getHomework } from "./homework-api";

export const homeworkQueryKey = ["homework"] as const;

export function useHomeworkQuery(enabled: boolean) {
  return useQuery({
    queryKey: homeworkQueryKey,
    queryFn: getHomework,
    enabled,
  });
}
