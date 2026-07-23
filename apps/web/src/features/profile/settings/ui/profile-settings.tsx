"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Save,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { currentUserQueryKey } from "@/entities/user/api/use-current-user-query";
import {
  type ApiErrorResponse,
  type User,
  updateCurrentUser,
  updatePassword,
} from "@/shared/api/auth";
import {
  profileDetailsSchema,
  profilePasswordSchema,
  type ProfileDetailsValues,
  type ProfilePasswordValues,
} from "../model/profile-settings.schema";

type ProfileSettingsProps = {
  user: User;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data.message;

    return (Array.isArray(message) ? message[0] : message) ?? fallback;
  }

  return fallback;
}

const fieldClassName =
  "mt-2 h-14 w-full rounded-2xl border border-line bg-white px-4 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10";

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const queryClient = useQueryClient();
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const profileForm = useForm<ProfileDetailsValues>({
    resolver: zodResolver(profileDetailsSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
    mode: "onBlur",
  });
  const passwordForm = useForm<ProfilePasswordValues>({
    resolver: zodResolver(profilePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    profileForm.reset({ name: user.name, email: user.email });
  }, [profileForm, user.email, user.name]);

  const profileMutation = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(currentUserQueryKey, updatedUser);
      profileForm.reset({
        name: updatedUser.name,
        email: updatedUser.email,
      });
      setProfileError(null);
      setProfileSuccess("Данные профиля сохранены");
    },
    onError: (error) => {
      const message = getErrorMessage(
        error,
        "Не удалось сохранить данные профиля",
      );

      setProfileSuccess(null);
      setProfileError(message);

      if (axios.isAxiosError(error) && error.response?.status === 409) {
        profileForm.setError("email", { type: "server", message });
      }
    },
  });

  const passwordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: (response) => {
      passwordForm.reset();
      setPasswordError(null);
      setPasswordSuccess(response.message);
    },
    onError: (error) => {
      setPasswordSuccess(null);
      setPasswordError(getErrorMessage(error, "Не удалось изменить пароль"));
    },
  });

  const handleProfileSubmit = profileForm.handleSubmit((values) => {
    setProfileSuccess(null);
    setProfileError(null);
    profileMutation.mutate(values);
  });

  const handlePasswordSubmit = passwordForm.handleSubmit((values) => {
    setPasswordSuccess(null);
    setPasswordError(null);
    passwordMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-line bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
            <UserRound className="size-6" />
          </span>
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
              Личные данные
            </h2>
            <p className="mt-2 text-base leading-7 text-muted">
              Имя сразу обновится в шапке. Новый email понадобится для
              следующего входа.
            </p>
          </div>
        </div>

        <form
          className="mt-7 space-y-5"
          noValidate
          onSubmit={handleProfileSubmit}
        >
          <label className="block">
            <span className="flex items-center gap-2 text-base font-bold text-ink">
              <UserRound className="size-5 text-brand" />
              Имя
            </span>
            <input
              autoComplete="name"
              className={fieldClassName}
              placeholder="Как к вам обращаться"
              type="text"
              {...profileForm.register("name")}
            />
            {profileForm.formState.errors.name && (
              <p className="mt-2 text-sm text-danger">
                {profileForm.formState.errors.name.message}
              </p>
            )}
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-base font-bold text-ink">
              <Mail className="size-5 text-brand" />
              Email
            </span>
            <input
              autoComplete="email"
              className={fieldClassName}
              placeholder="you@example.com"
              type="email"
              {...profileForm.register("email")}
            />
            {profileForm.formState.errors.email && (
              <p className="mt-2 text-sm text-danger">
                {profileForm.formState.errors.email.message}
              </p>
            )}
          </label>

          {profileSuccess && (
            <p
              className="flex items-center gap-2 rounded-2xl bg-success/10 px-4 py-3 text-sm font-semibold text-success"
              role="status"
            >
              <Check className="size-5" />
              {profileSuccess}
            </p>
          )}

          {profileError && (
            <p
              className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
              role="alert"
            >
              {profileError}
            </p>
          )}

          <button
            className="flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-brand px-5 text-base font-bold text-white transition hover:bg-brand/90 disabled:cursor-wait disabled:opacity-70"
            disabled={profileMutation.isPending}
            type="submit"
          >
            <Save className="size-5" />
            {profileMutation.isPending ? "Сохраняем…" : "Сохранить изменения"}
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-line bg-white p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
              <LockKeyhole className="size-6" />
            </span>
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
                Сменить пароль
              </h2>
              <p className="mt-2 text-base leading-7 text-muted">
                Подтвердите текущий пароль и задайте новый.
              </p>
            </div>
          </div>

          <button
            aria-label={showPasswords ? "Скрыть пароли" : "Показать пароли"}
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl bg-panel text-muted transition hover:text-ink"
            onClick={() => setShowPasswords((isVisible) => !isVisible)}
            type="button"
          >
            {showPasswords ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </div>

        <form
          className="mt-7 space-y-5"
          noValidate
          onSubmit={handlePasswordSubmit}
        >
          <label className="block">
            <span className="text-base font-bold text-ink">Текущий пароль</span>
            <input
              autoComplete="current-password"
              className={fieldClassName}
              placeholder="Введите текущий пароль"
              type={showPasswords ? "text" : "password"}
              {...passwordForm.register("currentPassword")}
            />
            {passwordForm.formState.errors.currentPassword && (
              <p className="mt-2 text-sm text-danger">
                {passwordForm.formState.errors.currentPassword.message}
              </p>
            )}
          </label>

          <label className="block">
            <span className="text-base font-bold text-ink">Новый пароль</span>
            <input
              autoComplete="new-password"
              className={fieldClassName}
              placeholder="Минимум 8 символов"
              type={showPasswords ? "text" : "password"}
              {...passwordForm.register("newPassword")}
            />
            {passwordForm.formState.errors.newPassword && (
              <p className="mt-2 text-sm text-danger">
                {passwordForm.formState.errors.newPassword.message}
              </p>
            )}
          </label>

          <label className="block">
            <span className="text-base font-bold text-ink">
              Повторите новый пароль
            </span>
            <input
              autoComplete="new-password"
              className={fieldClassName}
              placeholder="Введите новый пароль ещё раз"
              type={showPasswords ? "text" : "password"}
              {...passwordForm.register("confirmPassword")}
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="mt-2 text-sm text-danger">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </label>

          <p className="rounded-2xl bg-panel px-4 py-3 text-sm leading-6 text-muted">
            Минимум 8 символов, одна заглавная буква и одна цифра.
          </p>

          {passwordSuccess && (
            <p
              className="flex items-center gap-2 rounded-2xl bg-success/10 px-4 py-3 text-sm font-semibold text-success"
              role="status"
            >
              <Check className="size-5" />
              {passwordSuccess}
            </p>
          )}

          {passwordError && (
            <p
              className="rounded-2xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
              role="alert"
            >
              {passwordError}
            </p>
          )}

          <button
            className="flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-brand/30 bg-brand/5 px-5 text-base font-bold text-brand transition hover:bg-brand/10 disabled:cursor-wait disabled:opacity-70"
            disabled={passwordMutation.isPending}
            type="submit"
          >
            <LockKeyhole className="size-5" />
            {passwordMutation.isPending ? "Обновляем…" : "Обновить пароль"}
          </button>
        </form>
      </section>
    </div>
  );
}
