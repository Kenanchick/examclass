"use client";

import { useEffect, useState } from "react";

/**
 * Delays a frequently changing value before it is used in a request.
 * It keeps inputs responsive without sending a request for every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(timeoutId);
  }, [delay, value]);

  return debouncedValue;
}
