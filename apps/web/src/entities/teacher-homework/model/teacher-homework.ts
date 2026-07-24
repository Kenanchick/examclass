export type TeacherHomeworkTask = {
  publicId: string;
  statement: string;
  difficulty: number;
  topic: {
    name: string;
    parent?: {
      name: string;
    } | null;
    subject: {
      name: string;
    };
  };
};

export type TeacherHomeworkStudent = {
  id: string;
  name: string;
  email: string;
  classroom: {
    id: string;
    title: string;
  };
};

export type TeacherHomeworkTasksPage = {
  tasks: TeacherHomeworkTask[];
  page: number;
  pageSize: number;
  total: number;
};

export type TeacherHomeworkTasksParams = {
  search?: string;
  subjectCode?: string;
  topicId?: string;
  page?: number;
  pageSize?: number;
};

export type CreateTeacherHomeworkAssignmentInput = {
  title: string;
  description?: string;
  deadline: string;
  taskPublicIds: string[];
  studentIds: string[];
};
