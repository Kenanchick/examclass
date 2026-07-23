import { useQuery } from "@tanstack/react-query";
import { getSubjectTopics } from "./topic-api";

export function useSubjectTopicsQuery(subjectCode: string | null) {
  return useQuery({
    queryKey: ["subjects", subjectCode, "topics"],
    queryFn: () => {
      if (!subjectCode) {
        throw new Error("Subject code is required");
      }

      return getSubjectTopics(subjectCode);
    },
    enabled: Boolean(subjectCode),
  });
}
