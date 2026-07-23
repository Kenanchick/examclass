import { useQuery } from "@tanstack/react-query";
import { getActiveSubjects } from "./subject-api";

export const subjectsQueryKey = ["subjects"] as const;

export function useSubjectsQuery() {
  return useQuery({
    queryKey: subjectsQueryKey,
    queryFn: getActiveSubjects,
  });
}
