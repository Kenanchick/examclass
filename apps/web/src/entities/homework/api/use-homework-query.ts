import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteHomeworkSubmissionAttachment,
  getHomework,
  getHomeworkAssignment,
  submitHomeworkAssignment,
  uploadHomeworkSubmissionAttachment,
} from "./homework-api";

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

export function useHomeworkSubmissionMutations(assignmentPublicId: string) {
  const queryClient = useQueryClient();
  const invalidateHomework = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: homeworkQueryKey }),
      queryClient.invalidateQueries({
        queryKey: [...homeworkQueryKey, assignmentPublicId],
      }),
    ]);

  const uploadAttachmentMutation = useMutation({
    mutationFn: ({
      file,
      taskPublicId,
    }: {
      file: File;
      taskPublicId: string;
    }) =>
      uploadHomeworkSubmissionAttachment(
        assignmentPublicId,
        taskPublicId,
        file,
      ),
    onSuccess: invalidateHomework,
  });
  const deleteAttachmentMutation = useMutation({
    mutationFn: (taskPublicId: string) =>
      deleteHomeworkSubmissionAttachment(assignmentPublicId, taskPublicId),
    onSuccess: invalidateHomework,
  });
  const submitMutation = useMutation({
    mutationFn: () => submitHomeworkAssignment(assignmentPublicId),
    onSuccess: invalidateHomework,
  });

  return {
    deleteAttachmentMutation,
    submitMutation,
    uploadAttachmentMutation,
  };
}
