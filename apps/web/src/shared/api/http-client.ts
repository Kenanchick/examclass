import axios from "axios";
import { useAuthModalStore } from "@/features/auth/modal/model/use-auth-modal-store";
import { clearAccessToken, getAccessToken } from "@/shared/model/auth-session";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

export const apiClient = axios.create({
  baseURL,
  timeout: 10_000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      typeof window !== "undefined" &&
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      const hadAccessToken = Boolean(getAccessToken());

      clearAccessToken();

      if (hadAccessToken) {
        useAuthModalStore.getState().openLogin({
          notice:
            "Сессия завершилась. Войдите ещё раз — теперь вход сохранится на 7 дней.",
          returnTo: `${window.location.pathname}${window.location.search}`,
        });
      }
    }

    return Promise.reject(error);
  },
);
