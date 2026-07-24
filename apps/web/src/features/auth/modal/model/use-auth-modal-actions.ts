"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuthModalStore } from "./use-auth-modal-store";

function getCurrentPath(pathname: string) {
  if (typeof window === "undefined") {
    return pathname;
  }

  return `${pathname}${window.location.search}`;
}

export function useAuthModalActions() {
  const pathname = usePathname();
  const openLoginInStore = useAuthModalStore((state) => state.openLogin);
  const openRegisterInStore = useAuthModalStore((state) => state.openRegister);

  const openLogin = useCallback(
    (notice?: string) => {
      openLoginInStore({
        returnTo: getCurrentPath(pathname),
        notice,
      });
    },
    [openLoginInStore, pathname],
  );

  const openRegister = useCallback(() => {
    openRegisterInStore({ returnTo: getCurrentPath(pathname) });
  }, [openRegisterInStore, pathname]);

  return { openLogin, openRegister };
}
