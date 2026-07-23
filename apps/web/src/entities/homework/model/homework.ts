export type HomeworkTask = {
  publicId: string;
};

export type HomeworkAssignment = {
  publicId: string;
  title: string;
  description: string | null;
  deadline: string;
  assignedAt: string;
  teacher: {
    name: string;
  };
  classroom: {
    title: string;
    subject: {
      name: string;
    };
  };
  taskCount: number;
  tasks: HomeworkTask[];
};
