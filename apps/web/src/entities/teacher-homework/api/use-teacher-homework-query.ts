import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  addTeacherStudent,
  createTeacherHomeworkAssignment,
  getTeacherHomeworkStudents,
  getTeacherHomeworkTasks,
} from "./teacher-homework-api";
import type { TeacherHomeworkTasksParams } from "../model/teacher-homework";

export const teacherHomeworkQueryKey = ["teacher-homework"] as const;

const teacherHomeworkTasksPageSize = 24;

type TeacherHomeworkTasksFilters = Pick<
  TeacherHomeworkTasksParams,
  "search" | "subjectCode" | "topicId"
>;

export function useTeacherHomeworkTasksQuery(
  filters: TeacherHomeworkTasksFilters,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: [...teacherHomeworkQueryKey, "tasks", filters],
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getTeacherHomeworkTasks({
        ...filters,
        page: pageParam,
        pageSize: teacherHomeworkTasksPageSize,
      }),
    getNextPageParam: (lastPage) => {
      const loadedTasks = lastPage.page * lastPage.pageSize;

      return loadedTasks < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });
}

export function useTeacherHomeworkStudentsQuery(enabled = true) {
  return useQuery({
    queryKey: [...teacherHomeworkQueryKey, "students"],
    enabled,
    queryFn: getTeacherHomeworkStudents,
  });
}

export function useAddTeacherStudentMutation() {
  return useMutation({
    mutationFn: addTeacherStudent,
  });
}

export function useCreateTeacherHomeworkAssignmentMutation() {
  return useMutation({
    mutationFn: createTeacherHomeworkAssignment,
  });
}
