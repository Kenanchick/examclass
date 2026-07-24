import axios from "axios";
import type { ApiErrorResponse } from "@/shared/api/auth";

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data.message;

    return (Array.isArray(message) ? message[0] : message) ?? fallback;
  }

  return fallback;
}
