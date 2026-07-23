"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginFormSchema, type LoginFormValues } from "../model/login.schema";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type ApiErrorResponse, login as loginUser } from "@/shared/api/auth";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    mode: "onBlur",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  useEffect(() => {
    const notice = window.sessionStorage.getItem("authNotice");

    if (notice) {
      setSessionNotice(notice);
      window.sessionStorage.removeItem("authNotice");
    }
  }, []);

  async function onSubmit(data: LoginFormValues) {
    setSubmitError(null);

    try {
      const response = await loginUser(data);

      window.localStorage.setItem("accessToken", response.accessToken);
      setSessionNotice(null);
      router.replace("/dashboard");
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const message = error.response?.data.message;
        const errorMessage = Array.isArray(message) ? message[0] : message;

        if (error.response?.status === 401) {
          setError("password", {
            type: "server",
            message: errorMessage ?? "Неверный email или пароль",
          });
          return;
        }

        setSubmitError(errorMessage ?? "Не удалось войти в аккаунт");
        return;
      }

      setSubmitError("Не удалось войти в аккаунт");
    }
  }

  return (
    <form
      className="mt-9 space-y-5"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink">Email</span>
        <input
          autoComplete="email"
          className="h-12 w-full rounded-lg border border-line bg-white px-4 text-[15px] text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10"
          {...register("email")}
          placeholder="you@example.com"
          type="email"
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>
        )}
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink">
          Пароль
        </span>
        <input
          autoComplete="current-password"
          className="h-12 w-full rounded-lg border border-line bg-white px-4 text-[15px] text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10"
          {...register("password")}
          placeholder="Введите пароль"
          type="password"
        />
        {errors.password && (
          <p className="mt-1.5 text-xs text-danger">
            {errors.password.message}
          </p>
        )}
      </label>

      {sessionNotice && (
        <p
          className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm leading-5 text-brand"
          role="status"
        >
          {sessionNotice}
        </p>
      )}

      {submitError && (
        <p className="text-sm text-danger" role="alert">
          {submitError}
        </p>
      )}

      <button
        className="mt-2 h-12 w-full rounded-[10px] bg-brand px-5 text-[15px] font-semibold text-white transition hover:bg-brand/90 focus:outline-none focus:ring-4 focus:ring-brand/20 active:translate-y-px"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Вход..." : "Войти"}
      </button>

      <p className="pt-1 text-center text-sm text-muted">
        Нет аккаунта?{" "}
        <Link href="/register" className="font-semibold text-brand">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}
