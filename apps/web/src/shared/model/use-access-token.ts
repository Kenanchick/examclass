"use client";

import { useEffect, useState } from "react";

export function useAccessToken() {
  const [hasAccessToken, setHasAccessToken] = useState<boolean | null>(null);

  useEffect(() => {
    setHasAccessToken(Boolean(window.localStorage.getItem("accessToken")));
  }, []);

  return hasAccessToken;
}
