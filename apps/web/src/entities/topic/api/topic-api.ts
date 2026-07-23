import { apiClient } from "@/shared/api/http-client";
import type { SubjectTopics } from "../model/topic";

export async function getSubjectTopics(subjectCode: string) {
  const response = await apiClient.get<SubjectTopics>(
    `/subjects/${encodeURIComponent(subjectCode)}/topics`,
  );

  return response.data;
}
