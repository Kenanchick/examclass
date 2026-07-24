"use client";

import { useEffect, useState } from "react";
import {
  authSessionChangeEvent,
  getAccessToken,
} from "@/shared/model/auth-session";

export function useAccessToken() {
  const [hasAccessToken, setHasAccessToken] = useState<boolean | null>(null);

  useEffect(() => {
    const synchronize = () => {
      setHasAccessToken(Boolean(getAccessToken()));
    };

    synchronize();
    window.addEventListener(authSessionChangeEvent, synchronize);
    window.addEventListener("storage", synchronize);

    return () => {
      window.removeEventListener(authSessionChangeEvent, synchronize);
      window.removeEventListener("storage", synchronize);
    };
  }, []);

  return hasAccessToken;
}
