import { useMemo, useState } from "react";
import type { Task } from "@/entities/task/model/task";
import { getTaskExamNumber } from "@/entities/task/model/task";

export type FavoriteSubtopic = {
  id: string;
  name: string;
  count: number;
};

const normalize = (value: string) =>
  value.toLowerCase().replaceAll("ё", "е").replace(/\s+/g, " ").trim();

export function useFavoritesFilter(tasks: Task[] | undefined) {
  const [query, setQuery] = useState("");
  const [taskNumber, setTaskNumber] = useState<number | null>(null);
  const [subtopicId, setSubtopicId] = useState<string | null>(null);

  const index = useMemo(() => {
    const statements = new Map<string, string>();
    const subtopicsByNumber = new Map<
      number,
      Map<string, { name: string; sortOrder: number; count: number }>
    >();

    for (const task of tasks ?? []) {
      statements.set(task.publicId, normalize(task.statement));

      const number = getTaskExamNumber(task);
      let bucket = subtopicsByNumber.get(number);

      if (!bucket) {
        bucket = new Map();
        subtopicsByNumber.set(number, bucket);
      }

      const subtopic = bucket.get(task.topic.id);

      if (subtopic) {
        subtopic.count += 1;
      } else {
        bucket.set(task.topic.id, {
          name: task.topic.name,
          sortOrder: task.topic.sortOrder,
          count: 1,
        });
      }
    }

    return { statements, subtopicsByNumber };
  }, [tasks]);

  const numbers = useMemo(
    () => [...index.subtopicsByNumber.keys()].sort((a, b) => a - b),
    [index],
  );

  const subtopics = useMemo<FavoriteSubtopic[]>(() => {
    const bucket =
      taskNumber === null ? undefined : index.subtopicsByNumber.get(taskNumber);

    if (!bucket) {
      return [];
    }

    return [...bucket.entries()]
      .sort(([, a], [, b]) => a.sortOrder - b.sortOrder)
      .map(([id, { name, count }]) => ({ id, name, count }));
  }, [index, taskNumber]);

  const filteredTasks = useMemo(() => {
    if (!tasks) {
      return [];
    }

    const needle = normalize(query);

    if (!needle && taskNumber === null && subtopicId === null) {
      return tasks;
    }

    return tasks.filter((task) => {
      if (taskNumber !== null && getTaskExamNumber(task) !== taskNumber) {
        return false;
      }

      if (subtopicId !== null && task.topic.id !== subtopicId) {
        return false;
      }

      if (needle && !index.statements.get(task.publicId)?.includes(needle)) {
        return false;
      }

      return true;
    });
  }, [tasks, query, taskNumber, subtopicId, index]);

  const selectTaskNumber = (number: number | null) => {
    setTaskNumber(number);
    setSubtopicId(null);
  };

  const reset = () => {
    setQuery("");
    setTaskNumber(null);
    setSubtopicId(null);
  };

  return {
    query,
    setQuery,
    taskNumber,
    selectTaskNumber,
    subtopicId,
    setSubtopicId,
    numbers,
    subtopics,
    filteredTasks,
    isFiltering:
      query.trim() !== "" || taskNumber !== null || subtopicId !== null,
    reset,
  };
}
