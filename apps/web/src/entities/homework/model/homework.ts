export type HomeworkTask = {
  publicId: string;
};

export type HomeworkSubmissionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "RETURNED"
  | "REVIEWED";

export type HomeworkSubmissionAttachment = {
  publicId: string;
  taskPublicId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

export type HomeworkSubmission = {
  publicId: string;
  status: HomeworkSubmissionStatus;
  submittedAt: string | null;
  attachments: HomeworkSubmissionAttachment[];
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
  submission: Pick<HomeworkSubmission, "status" | "submittedAt"> | null;
};

export type HomeworkAssignmentDetails = Omit<HomeworkAssignment, "tasks"> & {
  tasks: Task[];
  submission: HomeworkSubmission | null;
};
import type { Task } from "@/entities/task/model/task";
