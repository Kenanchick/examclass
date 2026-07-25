import { create } from "zustand";

type TeacherRouteWorkspaceState = {
  activeStudentId: string | null;
  selectedExamNumber: number | null;
  selectedSkillCode: string | null;
  editMode: boolean;
  skillSearch: string;
  statusFilter: string;
  showHiddenModules: boolean;
  activateStudent: (studentId: string) => void;
  selectExamNumber: (examNumber: number | null) => void;
  selectSkill: (skillCode: string | null) => void;
  toggleEditMode: () => void;
  setSkillSearch: (value: string) => void;
  setStatusFilter: (value: string) => void;
  toggleHiddenModules: () => void;
};

export const useTeacherRouteWorkspaceStore = create<TeacherRouteWorkspaceState>(
  (set) => ({
    activeStudentId: null,
    selectedExamNumber: null,
    selectedSkillCode: null,
    editMode: false,
    skillSearch: "",
    statusFilter: "ALL",
    showHiddenModules: false,
    activateStudent: (studentId) =>
      set((state) =>
        state.activeStudentId === studentId
          ? state
          : {
              activeStudentId: studentId,
              selectedExamNumber: null,
              selectedSkillCode: null,
              editMode: false,
              skillSearch: "",
              statusFilter: "ALL",
              showHiddenModules: false,
            },
      ),
    selectExamNumber: (selectedExamNumber) => set({ selectedExamNumber }),
    selectSkill: (selectedSkillCode) => set({ selectedSkillCode }),
    toggleEditMode: () => set((state) => ({ editMode: !state.editMode })),
    setSkillSearch: (skillSearch) => set({ skillSearch }),
    setStatusFilter: (statusFilter) => set({ statusFilter }),
    toggleHiddenModules: () =>
      set((state) => ({ showHiddenModules: !state.showHiddenModules })),
  }),
);
