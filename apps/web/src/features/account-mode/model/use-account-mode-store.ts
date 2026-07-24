import { create } from "zustand";

export type AccountMode = "student" | "teacher";

type AccountModeState = {
  mode: AccountMode;
  setMode: (mode: AccountMode) => void;
};

export const useAccountModeStore = create<AccountModeState>((set) => ({
  mode: "student",
  setMode: (mode) => set({ mode }),
}));
