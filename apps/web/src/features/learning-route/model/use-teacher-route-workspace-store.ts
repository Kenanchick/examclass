import { create } from "zustand";

type TeacherRouteWorkspaceState = {
  activeStudentId: string | null;
  selectedSkillCode: string | null;
  skillSearch: string;
  statusFilter: string;
  showHiddenModules: boolean;
  activateStudent: (studentId: string) => void;
  selectSkill: (skillCode: string | null) => void;
  setSkillSearch: (value: string) => void;
  setStatusFilter: (value: string) => void;
  toggleHiddenModules: () => void;
};

export const useTeacherRouteWorkspaceStore = create<TeacherRouteWorkspaceState>(
  (set) => ({
    activeStudentId: null,
    selectedSkillCode: null,
    skillSearch: "",
    statusFilter: "ALL",
    showHiddenModules: false,
    activateStudent: (studentId) =>
      set((state) =>
        state.activeStudentId === studentId
          ? state
          : {
              activeStudentId: studentId,
              selectedSkillCode: null,
              skillSearch: "",
              statusFilter: "ALL",
              showHiddenModules: false,
            },
      ),
    selectSkill: (selectedSkillCode) => set({ selectedSkillCode }),
    setSkillSearch: (skillSearch) => set({ skillSearch }),
    setStatusFilter: (statusFilter) => set({ statusFilter }),
    toggleHiddenModules: () =>
      set((state) => ({ showHiddenModules: !state.showHiddenModules })),
  }),
);
