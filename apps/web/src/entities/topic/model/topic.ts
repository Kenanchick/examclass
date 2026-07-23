import type { Task } from "@/entities/task/model/task";

export type Topic = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
};

export type TopicWithChildren = Topic & {
  taskCount: number;
  children: Array<Topic & { taskCount: number }>;
};

export type SubjectTopics = {
  id: string;
  code: string;
  name: string;
  totalTaskCount: number;
  topics: TopicWithChildren[];
};

export type TopicTasksResponse = {
  topic: Task["topic"];
  tasks: Task[];
};
