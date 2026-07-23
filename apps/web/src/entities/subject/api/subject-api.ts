import { apiClient } from "@/shared/api/http-client";
import type { Subject } from "../model/subject";

export async function getActiveSubjects() {
  const response = await apiClient.get<Subject[]>("/subjects");

  return response.data;
}
