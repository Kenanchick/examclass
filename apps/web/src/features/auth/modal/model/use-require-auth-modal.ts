"use client";

import { useEffect } from "react";
import { useAccessToken } from "@/shared/model/use-access-token";
import { useAuthModalActions } from "./use-auth-modal-actions";

export function useRequireAuthModal() {
  const hasAccessToken = useAccessToken();
  const { openLogin } = useAuthModalActions();

  useEffect(() => {
    if (hasAccessToken === false) {
      openLogin();
    }
  }, [hasAccessToken, openLogin]);

  return { hasAccessToken, openLogin };
}
