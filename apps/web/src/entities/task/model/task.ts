export type Task = {
  publicId: string;
  examPart: "FIRST" | "SECOND";
  statement: string;
  correctAnswer: string | null;
  referenceSolution: string | null;
  difficulty: number;
  source: string | null;
  topic: {
    id: string;
    slug: string;
    name: string;
    sortOrder: number;
    parent: {
      name: string;
      sortOrder: number;
    } | null;
    subject: {
      code: string;
      name: string;
    };
  };
};

export function getTaskExamNumber(task: Task) {
  return task.topic.parent?.sortOrder ?? task.topic.sortOrder;
}
