import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  applyTeacherModuleAction,
  applyTeacherSkillAction,
  createTeacherRouteModule,
  getTeacherKnowledgeProfile,
  getTeacherLearningRoute,
  getTeacherRouteHistory,
  getTeacherSkillDetail,
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

export function useTeacherModuleActionMutation(studentId: string) {
  const invalidate = useInvalidateTeacherRoute(studentId);
  return useMutation({
    mutationFn: applyTeacherModuleAction,
    onSuccess: invalidate,
  });
}

export function useCreateTeacherRouteModuleMutation(studentId: string) {
  const invalidate = useInvalidateTeacherRoute(studentId);
  return useMutation({
    mutationFn: createTeacherRouteModule,
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
