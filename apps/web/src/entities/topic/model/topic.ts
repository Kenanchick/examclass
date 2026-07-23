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
  children: Array<Topic & { tasks: TopicTask[] }>;
};

export type SubjectTopics = {
  id: string;
  code: string;
  name: string;
  topics: TopicWithChildren[];
};
