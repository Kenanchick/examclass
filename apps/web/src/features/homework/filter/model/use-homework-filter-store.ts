import { create } from "zustand";

export type HomeworkFilter = "all" | "upcoming" | "overdue";

type HomeworkFilterState = {
  filter: HomeworkFilter;
  setFilter: (filter: HomeworkFilter) => void;
};

export const useHomeworkFilterStore = create<HomeworkFilterState>((set) => ({
  filter: "all",
  setFilter: (filter) => set({ filter }),
}));
