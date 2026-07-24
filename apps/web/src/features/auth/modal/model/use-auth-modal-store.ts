import { create } from "zustand";

export type AuthModalMode = "login" | "register";

type AuthModalOptions = {
  notice?: string | null;
  returnTo?: string;
};

type AuthModalState = {
  mode: AuthModalMode | null;
  notice: string | null;
  returnTo: string;
  close: () => void;
  open: (mode: AuthModalMode, options?: AuthModalOptions) => void;
  openLogin: (options?: AuthModalOptions) => void;
  openRegister: (options?: AuthModalOptions) => void;
  switchMode: () => void;
};

function normalizeReturnTo(returnTo?: string) {
  if (
    returnTo &&
    returnTo.startsWith("/") &&
    !returnTo.startsWith("//") &&
    !returnTo.startsWith("/login") &&
    !returnTo.startsWith("/register")
  ) {
    return returnTo;
  }

  return "/dashboard";
}

function normalizeNotice(notice?: string | null) {
  return typeof notice === "string" ? notice : null;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  mode: null,
  notice: null,
  returnTo: "/dashboard",
  close: () => set({ mode: null, notice: null }),
  open: (mode, options) =>
    set({
      mode,
      notice: normalizeNotice(options?.notice),
      returnTo: normalizeReturnTo(options?.returnTo),
    }),
  openLogin: (options) =>
    set({
      mode: "login",
      notice: normalizeNotice(options?.notice),
      returnTo: normalizeReturnTo(options?.returnTo),
    }),
  openRegister: (options) =>
    set({
      mode: "register",
      notice: normalizeNotice(options?.notice),
      returnTo: normalizeReturnTo(options?.returnTo),
    }),
  switchMode: () =>
    set((state) => ({
      mode: state.mode === "login" ? "register" : "login",
      notice: null,
    })),
}));
