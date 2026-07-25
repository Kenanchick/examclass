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
  const queryClient = useQueryClient();
  const mapQueryKey = [...teacherRouteQueryKey, studentId, "map"] as const;

  return useMutation({
    mutationFn: applyTeacherSubtopicStatus,
    onMutate: async ({ subtopicCode, data }) => {
      await queryClient.cancelQueries({ queryKey: mapQueryKey });
      const previous = queryClient.getQueryData<TeacherRoadmap>(mapQueryKey);
      const isMastered = data.status === "MASTERED";

      queryClient.setQueryData<TeacherRoadmap>(mapQueryKey, (current) => {
        if (!current) return current;

        return {
          ...current,
          nodes: current.nodes.map((node) => {
            if (
              !node.subtopics.some((subtopic) => subtopic.code === subtopicCode)
            ) {
              return node;
            }

            const subtopics = node.subtopics.map((subtopic) =>
              subtopic.code === subtopicCode
                ? {
                    ...subtopic,
                    mastery: isMastered ? 1 : 0,
                    masteredSkills: isMastered ? subtopic.skills.length : 0,
                    isMastered,
                    skills: subtopic.skills.map((skill) => ({
                      ...skill,
                      mastery: isMastered ? 1 : 0,
                      status: data.status,
                    })),
                  }
                : subtopic,
            );
            const skills = subtopics.flatMap((subtopic) => subtopic.skills);
            const mastery =
              skills.reduce((total, skill) => total + skill.mastery, 0) /
              Math.max(1, skills.length);
            const isPassed = skills.every((skill) =>
              ["MASTERED", "TEACHER_CONFIRMED"].includes(skill.status),
            );

            return {
              ...node,
              subtopics,
              mastery,
              isPassed,
              status: isPassed
                ? "MASTERED"
                : node.status === "MASTERED"
                  ? "AVAILABLE"
                  : node.status,
            };
          }),
        };
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(mapQueryKey, context.previous);
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [...teacherRouteQueryKey, studentId],
      }),
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
