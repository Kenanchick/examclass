"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { GraduationCap, ShieldCheck, X } from "lucide-react";
import { LoginForm } from "@/features/auth/login/ui/login-form";
import { RegisterForm } from "@/features/auth/register/ui/register-form";
import { useAuthModalStore } from "../model/use-auth-modal-store";

function getAuthModeFromQuery() {
  if (typeof window === "undefined") {
    return null;
  }

  const mode = new URLSearchParams(window.location.search).get("auth");

  return mode === "login" || mode === "register" ? mode : null;
}

export function AuthModalProvider() {
  const pathname = usePathname();
  const router = useRouter();
  const mode = useAuthModalStore((state) => state.mode);
  const notice = useAuthModalStore((state) => state.notice);
  const returnTo = useAuthModalStore((state) => state.returnTo);
  const close = useAuthModalStore((state) => state.close);
  const open = useAuthModalStore((state) => state.open);
  const switchMode = useAuthModalStore((state) => state.switchMode);

  useEffect(() => {
    const queryMode = getAuthModeFromQuery();

    if (!queryMode) {
      return;
    }

    open(queryMode);
    const url = new URL(window.location.href);

    url.searchParams.delete("auth");
    window.history.replaceState(window.history.state, "", url);
  }, [open, pathname]);

  useEffect(() => {
    if (!mode) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, mode]);

  if (!mode) {
    return null;
  }

  const handleAuthenticated = () => {
    close();
    router.replace(returnTo);
    router.refresh();
  };

  const isLogin = mode === "login";

  return (
    <div
      aria-labelledby="auth-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-[70] grid place-items-center bg-[#071a2f]/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
      role="dialog"
    >
      <div className="grid max-h-[calc(100dvh-2rem)] w-full max-w-[50rem] overflow-y-auto rounded-[2rem] border border-white/70 bg-white shadow-[0_32px_92px_rgba(7,32,61,0.32)] md:grid-cols-[15.5rem_minmax(0,1fr)] md:overflow-hidden">
        <aside className="relative hidden min-h-full overflow-hidden bg-[#e9f3ff] px-6 py-8 md:flex md:flex-col">
          <div className="absolute -right-14 -top-12 size-40 rounded-full border-[22px] border-white/55" />
          <div className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand">
            <GraduationCap className="size-4" />
            ExamClass
          </div>
          <div className="relative mt-7">
            <p className="text-2xl font-bold leading-tight tracking-[-0.045em] text-ink">
              {isLogin ? "Рады видеть снова" : "Начинаем учиться"}
            </p>
            <p className="mt-3 text-sm leading-5 text-muted">
              {isLogin
                ? "Продолжайте подготовку именно с того места, где остановились."
                : "Создайте аккаунт — и соберите свой путь к экзамену."}
            </p>
          </div>
          <div className="relative mt-auto pt-6">
            <Image
              alt="Талисманы ExamClass"
              className="mx-auto h-auto w-[11.5rem] object-contain drop-shadow-[0_16px_22px_rgba(26,92,149,0.18)]"
              height={1446}
              priority
              src="/auth-journey.png"
              width={1086}
            />
          </div>
        </aside>

        <section className="relative px-6 py-7 sm:px-9 sm:py-8">
          <button
            aria-label="Закрыть окно авторизации"
            className="absolute right-4 top-4 grid size-10 cursor-pointer place-items-center rounded-xl text-muted transition hover:bg-panel hover:text-ink focus:outline-none focus:ring-4 focus:ring-brand/10"
            onClick={close}
            type="button"
          >
            <X className="size-5" />
          </button>

          <div className="pr-12">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand">
              <ShieldCheck className="size-5" />
              Безопасный вход
            </div>
            <h1
              className="mt-3 text-3xl font-bold tracking-[-0.05em] text-ink sm:text-[2rem]"
              id="auth-modal-title"
            >
              {isLogin ? "Войдите в аккаунт" : "Создайте аккаунт"}
            </h1>
            <p className="mt-2 text-sm leading-5 text-muted">
              {isLogin
                ? "Все домашние задания, ответы и комментарии будут под рукой."
                : "Это займёт минуту. Ученика можно сменить на преподавателя в личном кабинете."}
            </p>
          </div>

          {isLogin ? (
            <LoginForm
              notice={notice}
              onAuthenticated={handleAuthenticated}
              onSwitchMode={switchMode}
            />
          ) : (
            <RegisterForm
              onAuthenticated={handleAuthenticated}
              onSwitchMode={switchMode}
            />
          )}
        </section>
      </div>
    </div>
  );
}
