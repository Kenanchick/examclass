export type Topic = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
};

export type TopicTask = {
  publicId: string;
};

export type TopicWithChildren = Topic & {
  taskCount: number;
  tasks: TopicTask[];
  children: Array<Topic & { taskCount: number; tasks: TopicTask[] }>;
};

export type SubjectTopics = {
  id: string;
  code: string;
  name: string;
  totalTaskCount: number;
  topics: TopicWithChildren[];
};
