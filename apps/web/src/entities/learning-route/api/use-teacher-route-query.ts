import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TeacherRoadmap } from "../model/teacher-route";
import {
  applyTeacherModuleAction,
  applyTeacherSkillAction,
  applyTeacherSubtopicStatus,
  deleteTeacherNodeReview,
  getTeacherKnowledgeProfile,
  getTeacherLearningRoute,
  getTeacherRoadmap,
  getTeacherRouteHistory,
  getTeacherSkillDetail,
  scheduleTeacherNodeReview,
  updateTeacherRoadmapOrder,
  updateTeacherWeeklyLoad,
} from "./teacher-route-api";

export const teacherRouteQueryKey = ["teacher-learning-route"] as const;

export function useTeacherLearningRouteQuery(
  studentId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...teacherRouteQueryKey, studentId, "route"],
    queryFn: () => getTeacherLearningRoute(studentId),
    enabled: enabled && Boolean(studentId),
  });
}

export function useTeacherRoadmapQuery(studentId: string, enabled = true) {
  return useQuery({
    queryKey: [...teacherRouteQueryKey, studentId, "map"],
    queryFn: () => getTeacherRoadmap(studentId),
    enabled: enabled && Boolean(studentId),
  });
}

export function useTeacherRoadmapOrderMutation(studentId: string) {
  const queryClient = useQueryClient();
  const mapQueryKey = [...teacherRouteQueryKey, studentId, "map"] as const;
  return useMutation({
    mutationFn: updateTeacherRoadmapOrder,
    onMutate: async ({ data }) => {
      await queryClient.cancelQueries({ queryKey: mapQueryKey });
      const previous = queryClient.getQueryData<TeacherRoadmap>(mapQueryKey);
      const orderIndex = new Map(
        data.examNumbers.map((examNumber, index) => [examNumber, index]),
      );

      queryClient.setQueryData<TeacherRoadmap>(mapQueryKey, (current) =>
        current
          ? {
              ...current,
              route: { ...current.route, examOrder: data.examNumbers },
              nodes: [...current.nodes].sort(
                (left, right) =>
                  (orderIndex.get(left.examNumber) ?? left.examNumber) -
                  (orderIndex.get(right.examNumber) ?? right.examNumber),
              ),
              connections: data.examNumbers.slice(0, -1).map((from, index) => ({
                from,
                to: data.examNumbers[index + 1]!,
                kind: "TEACHER_SEQUENCE" as const,
              })),
            }
          : current,
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(mapQueryKey, context.previous);
      }
    },
  });
}

export function useTeacherKnowledgeProfileQuery(
  studentId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [...teacherRouteQueryKey, studentId, "profile"],
    queryFn: () => getTeacherKnowledgeProfile(studentId),
    enabled: enabled && Boolean(studentId),
  });
}

export function useTeacherSkillDetailQuery(
  studentId: string,
  skillCode: string | null,
) {
  return useQuery({
    queryKey: [...teacherRouteQueryKey, studentId, "skill", skillCode],
    queryFn: () => getTeacherSkillDetail(studentId, skillCode!),
    enabled: Boolean(studentId && skillCode),
  });
}

export function useTeacherRouteHistoryQuery(studentId: string, enabled = true) {
  return useQuery({
    queryKey: [...teacherRouteQueryKey, studentId, "history"],
    queryFn: () => getTeacherRouteHistory(studentId),
    enabled: enabled && Boolean(studentId),
  });
}

function useInvalidateTeacherRoute(studentId: string) {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      queryKey: [...teacherRouteQueryKey, studentId],
    });
}

export function useTeacherSkillActionMutation(studentId: string) {
  const invalidate = useInvalidateTeacherRoute(studentId);
  return useMutation({
    mutationFn: applyTeacherSkillAction,
    onSuccess: invalidate,
  });
}

export function useTeacherSubtopicStatusMutation(studentId: string) {
  const invalidate = useInvalidateTeacherRoute(studentId);
  return useMutation({
    mutationFn: applyTeacherSubtopicStatus,
    onSuccess: invalidate,
  });
}

export function useTeacherNodeReviewMutation(studentId: string) {
  const invalidate = useInvalidateTeacherRoute(studentId);
  return useMutation({
    mutationFn: scheduleTeacherNodeReview,
    onSuccess: invalidate,
  });
}

export function useDeleteTeacherNodeReviewMutation(studentId: string) {
  const invalidate = useInvalidateTeacherRoute(studentId);
  return useMutation({
    mutationFn: deleteTeacherNodeReview,
    onSuccess: invalidate,
  });
}

export function useTeacherModuleActionMutation(studentId: string) {
  const invalidate = useInvalidateTeacherRoute(studentId);
  return useMutation({
    mutationFn: applyTeacherModuleAction,
    onSuccess: invalidate,
  });
}

export function useUpdateTeacherWeeklyLoadMutation(studentId: string) {
  const invalidate = useInvalidateTeacherRoute(studentId);
  return useMutation({
    mutationFn: updateTeacherWeeklyLoad,
    onSuccess: invalidate,
  });
}
