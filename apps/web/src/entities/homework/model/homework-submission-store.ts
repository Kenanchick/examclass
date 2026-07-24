import { create } from "zustand";

type PendingHomeworkFile = {
  name: string;
  sizeBytes: number;
};

type HomeworkSubmissionStore = {
  pendingFiles: Record<string, Record<string, PendingHomeworkFile>>;
  setPendingFile: (
    assignmentPublicId: string,
    taskPublicId: string,
    file: File,
  ) => void;
  clearPendingFile: (assignmentPublicId: string, taskPublicId: string) => void;
  clearAssignment: (assignmentPublicId: string) => void;
};

export const useHomeworkSubmissionStore = create<HomeworkSubmissionStore>(
  (set) => ({
    pendingFiles: {},
    setPendingFile: (assignmentPublicId, taskPublicId, file) =>
      set((state) => ({
        pendingFiles: {
          ...state.pendingFiles,
          [assignmentPublicId]: {
            ...state.pendingFiles[assignmentPublicId],
            [taskPublicId]: {
              name: file.name,
              sizeBytes: file.size,
            },
          },
        },
      })),
    clearPendingFile: (assignmentPublicId, taskPublicId) =>
      set((state) => {
        const assignmentFiles = { ...state.pendingFiles[assignmentPublicId] };

        delete assignmentFiles[taskPublicId];

        return {
          pendingFiles: {
            ...state.pendingFiles,
            [assignmentPublicId]: assignmentFiles,
          },
        };
      }),
    clearAssignment: (assignmentPublicId) =>
      set((state) => {
        const pendingFiles = { ...state.pendingFiles };

        delete pendingFiles[assignmentPublicId];

        return { pendingFiles };
      }),
  }),
);
