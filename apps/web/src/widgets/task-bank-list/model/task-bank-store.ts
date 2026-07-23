import { create } from "zustand";

type TaskBankState = {
  openedTopicId: string | null;
  selectedSubjectCode: string | null;
  setOpenedTopicId: (topicId: string | null) => void;
  setSelectedSubjectCode: (subjectCode: string) => void;
};

export const useTaskBankStore = create<TaskBankState>((set) => ({
  openedTopicId: null,
  selectedSubjectCode: null,
  setOpenedTopicId: (topicId) => set({ openedTopicId: topicId }),
  setSelectedSubjectCode: (subjectCode) =>
    set({
      selectedSubjectCode: subjectCode,
      openedTopicId: null,
    }),
}));
