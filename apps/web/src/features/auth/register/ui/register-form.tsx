"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  registerFormSchema,
  type UserRegisterForm,
} from "../model/register.schema";

import axios from "axios";
import { useState } from "react";
import { register as registerUser } from "@/shared/api/auth";

type ApiErrorResponse = {
  message?: string | string[];
};

export function RegisterForm() {
  const {
    register: registerField,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<UserRegisterForm>({
    resolver: zodResolver(registerFormSchema),
    mode: "onBlur",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function onSubmit(data: UserRegisterForm) {
    setSubmitError(null);

    try {
      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      window.localStorage.setItem("accessToken", response.accessToken);
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const message = error.response?.data.message;
        const errorMessage = Array.isArray(message) ? message[0] : message;

        if (error.response?.status === 409) {
          setError("email", {
            type: "server",
            message: errorMessage ?? "Этот email уже занят",
          });
          return;
        }

        setSubmitError(errorMessage ?? "Не удалось создать аккаунт");
        return;
      }

      setSubmitError("Не удалось создать аккаунт");
    }
  }

  return (
    <form
      className="mt-9 space-y-5"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink">Имя</span>
        <input
          autoComplete="name"
          className="h-12 w-full rounded-lg border border-line bg-white px-4 text-[15px] text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10"
          {...registerField("name")}
          placeholder="Как к вам обращаться"
          type="text"
        />
        {errors.name && (
          <p className="mt-1.5 text-xs text-danger">{errors.name.message}</p>
        )}
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink">Email</span>
        <input
          autoComplete="email"
          className="h-12 w-full rounded-lg border border-line bg-white px-4 text-[15px] text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10"
          {...registerField("email")}
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
          autoComplete="new-password"
          className="h-12 w-full rounded-lg border border-line bg-white px-4 text-[15px] text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10"
          {...registerField("password")}
          placeholder="Придумайте пароль"
          type="password"
        />
        {errors.password && (
          <p className="mt-1.5 text-xs text-danger">
            {errors.password.message}
          </p>
        )}
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink">
          Подтверждение пароля
        </span>
        <input
          autoComplete="new-password"
          className="h-12 w-full rounded-lg border border-line bg-white px-4 text-[15px] text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10"
          {...registerField("confirmPassword")}
          placeholder="Повторите пароль"
          type="password"
        />
        {errors.confirmPassword && (
          <p className="mt-1.5 text-xs text-danger">
            {errors.confirmPassword.message}
          </p>
        )}
      </label>

      <label className="flex cursor-pointer items-start gap-3 pt-1 text-sm leading-5 text-muted">
        <input
          className="mt-0.5 size-5 rounded border-line accent-brand"
          name="terms"
          type="checkbox"
        />
        <span>
          Я согласен с условиями использования и политикой конфиденциальности
        </span>
      </label>

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
        {isSubmitting ? "Создаём аккаунт…" : "Создать аккаунт"}
      </button>

      <p className="pt-1 text-center text-sm text-muted">
        Уже есть аккаунт?{" "}
        <span className="font-semibold text-brand">Войти</span>
      </p>
    </form>
  );
}
