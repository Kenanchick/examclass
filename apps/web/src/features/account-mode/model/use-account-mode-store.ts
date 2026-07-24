import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AccountMode = "student" | "teacher";

type AccountModeState = {
  mode: AccountMode;
  accountId: string | null;
  setMode: (mode: AccountMode) => void;
  synchronizeAccount: (accountId: string, canTeach: boolean) => void;
  reset: () => void;
};

export const useAccountModeStore = create<AccountModeState>()(
  persist(
    (set) => ({
      mode: "student",
      accountId: null,
      setMode: (mode) => set({ mode }),
      synchronizeAccount: (accountId, canTeach) =>
        set((state) => {
          if (state.accountId !== accountId) {
            return { accountId, mode: "student" };
          }

          if (!canTeach && state.mode === "teacher") {
            return { mode: "student" };
          }

          return state;
        }),
      reset: () => set({ accountId: null, mode: "student" }),
    }),
    {
      name: "examclass-account-mode",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ accountId, mode }) => ({ accountId, mode }),
    },
  ),
);
