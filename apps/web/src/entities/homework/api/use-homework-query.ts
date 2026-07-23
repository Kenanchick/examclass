import { useQuery } from "@tanstack/react-query";
import { getHomework, getHomeworkAssignment } from "./homework-api";

export const homeworkQueryKey = ["homework"] as const;

export function useHomeworkQuery(enabled: boolean) {
  return useQuery({
    queryKey: homeworkQueryKey,
    queryFn: getHomework,
    enabled,
  });
}

export function useHomeworkAssignmentQuery(publicId: string, enabled: boolean) {
  return useQuery({
    queryKey: [...homeworkQueryKey, publicId],
    queryFn: () => getHomeworkAssignment(publicId),
    enabled: enabled && Boolean(publicId),
  });
}
