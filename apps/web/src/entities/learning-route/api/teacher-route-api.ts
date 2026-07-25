import { apiClient } from "@/shared/api/http-client";
import type {
  CreateTeacherRouteModuleInput,
  TeacherKnowledgeProfile,
  TeacherLearningRoute,
  TeacherModuleActionInput,
  TeacherRouteHistoryItem,
  TeacherSkillActionInput,
  TeacherSkillDetail,
} from "../model/teacher-route";

const routePath = (studentId: string) =>
  `/teacher/learning-routes/students/${studentId}`;

export async function getTeacherLearningRoute(studentId: string) {
  const response = await apiClient.get<TeacherLearningRoute>(
    routePath(studentId),
  );
  return response.data;
}

export async function getTeacherKnowledgeProfile(studentId: string) {
  const response = await apiClient.get<TeacherKnowledgeProfile>(
    `/teacher/diagnostics/students/${studentId}/profile`,
  );
  return response.data;
}

export async function getTeacherSkillDetail(
  studentId: string,
  skillCode: string,
) {
  const response = await apiClient.get<TeacherSkillDetail>(
    `${routePath(studentId)}/skills/${encodeURIComponent(skillCode)}`,
  );
  return response.data;
}

export async function getTeacherRouteHistory(studentId: string) {
  const response = await apiClient.get<TeacherRouteHistoryItem[]>(
    `${routePath(studentId)}/history`,
  );
  return response.data;
}

export async function applyTeacherSkillAction({
  studentId,
  skillCode,
  data,
}: {
  studentId: string;
  skillCode: string;
  data: TeacherSkillActionInput;
}) {
  const response = await apiClient.post(
    `${routePath(studentId)}/skills/${encodeURIComponent(skillCode)}/actions`,
    data,
  );
  return response.data;
}

export async function applyTeacherModuleAction({
  studentId,
  moduleKey,
  data,
}: {
  studentId: string;
  moduleKey: string;
  data: TeacherModuleActionInput;
}) {
  const response = await apiClient.post(
    `${routePath(studentId)}/modules/${encodeURIComponent(moduleKey)}/actions`,
    data,
  );
  return response.data;
}

export async function createTeacherRouteModule({
  studentId,
  data,
}: {
  studentId: string;
  data: CreateTeacherRouteModuleInput;
}) {
  const response = await apiClient.post(
    `${routePath(studentId)}/modules`,
    data,
  );
  return response.data;
}

export async function updateTeacherWeeklyLoad({
  studentId,
  weeklyMinutes,
  reason,
}: {
  studentId: string;
  weeklyMinutes: number;
  reason: string;
}) {
  const response = await apiClient.patch<TeacherLearningRoute>(
    `${routePath(studentId)}/goal`,
    { weeklyMinutes, reason },
  );
  return response.data;
}
