import { apiClient } from "@/shared/api/http-client";
import type {
  HomeworkAssignment,
  HomeworkAssignmentDetails,
  HomeworkSubmissionAttachment,
  HomeworkSubmissionStatus,
} from "../model/homework";

export async function getHomework() {
  const response = await apiClient.get<HomeworkAssignment[]>("/homework");

  return response.data;
}

export async function getHomeworkAssignment(publicId: string) {
  const response = await apiClient.get<HomeworkAssignmentDetails>(
    `/homework/${encodeURIComponent(publicId)}`,
  );

  return response.data;
}

export async function uploadHomeworkSubmissionAttachment(
  assignmentPublicId: string,
  taskPublicId: string,
  file: File,
) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await apiClient.post<HomeworkSubmissionAttachment>(
    `/homework/${encodeURIComponent(assignmentPublicId)}/submission/tasks/${encodeURIComponent(taskPublicId)}/attachment`,
    formData,
  );

  return response.data;
}

export async function deleteHomeworkSubmissionAttachment(
  assignmentPublicId: string,
  taskPublicId: string,
) {
  await apiClient.delete(
    `/homework/${encodeURIComponent(assignmentPublicId)}/submission/tasks/${encodeURIComponent(taskPublicId)}/attachment`,
  );
}

export type SubmitHomeworkResponse = {
  publicId: string;
  status: HomeworkSubmissionStatus;
  submittedAt: string | null;
  isLate: boolean;
};

export async function submitHomeworkAssignment(assignmentPublicId: string) {
  const response = await apiClient.post<SubmitHomeworkResponse>(
    `/homework/${encodeURIComponent(assignmentPublicId)}/submission/submit`,
  );

  return response.data;
}
