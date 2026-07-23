export type Topic = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
};

export type TopicWithChildren = Topic & {
  children: Topic[];
};

export type SubjectTopics = {
  id: string;
  code: string;
  name: string;
  topics: TopicWithChildren[];
};
