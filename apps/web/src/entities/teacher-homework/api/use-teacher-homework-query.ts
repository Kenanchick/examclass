import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  createTeacherHomeworkAssignment,
  getTeacherHomeworkStudents,
  getTeacherHomeworkTasks,
} from "./teacher-homework-api";

export const teacherHomeworkQueryKey = ["teacher-homework"] as const;

const teacherHomeworkTasksPageSize = 20;

export function useTeacherHomeworkTasksQuery(search: string) {
  return useInfiniteQuery({
    queryKey: [...teacherHomeworkQueryKey, "tasks", search],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getTeacherHomeworkTasks({
        search: search || undefined,
        page: pageParam,
        pageSize: teacherHomeworkTasksPageSize,
      }),
    getNextPageParam: (lastPage) => {
      const loadedTasks = lastPage.page * lastPage.pageSize;

      return loadedTasks < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });
}

export function useTeacherHomeworkStudentsQuery() {
  return useQuery({
    queryKey: [...teacherHomeworkQueryKey, "students"],
    queryFn: getTeacherHomeworkStudents,
  });
}

export function useCreateTeacherHomeworkAssignmentMutation() {
  return useMutation({
    mutationFn: createTeacherHomeworkAssignment,
  });
}
