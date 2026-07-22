import Image from "next/image";

import { LoginForm } from "@/features/auth/login/ui/login-form";

export function LoginPage() {
  return (
    <main className="min-h-dvh bg-page p-3 sm:p-5">
      <section className="mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-[1440px] overflow-hidden rounded-2xl border border-line bg-white lg:min-h-[calc(100dvh-2.5rem)] lg:grid-cols-[0.78fr_1.22fr]">
        <aside className="hidden flex-col justify-between bg-panel px-10 py-11 lg:flex xl:px-16">
          <p className="text-2xl font-bold tracking-[-0.05em] text-ink">
            Exam<span className="text-brand">Class</span>
          </p>

          <Image
            alt="Путь к результату в обучении"
            className="mx-auto h-auto w-full max-w-[360px]"
            height={1446}
            priority
            src="/auth-journey.png"
            width={1086}
          />

          <div className="max-w-xs">
            <h2 className="text-2xl font-bold tracking-[-0.04em] text-ink">
              Готовность к ЕГЭ, шаг за шагом
            </h2>
            <p className="mt-2 text-[15px] leading-6 text-muted">
              Банк задач, разборы и домашние задания от преподавателя — в одном
              месте.
            </p>
          </div>
        </aside>

        <div className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-[550px]">
            <p className="text-xl font-bold tracking-[-0.05em] text-ink lg:hidden">
              Exam<span className="text-brand">Class</span>
            </p>
            <h1 className="mt-7 text-3xl font-bold tracking-[-0.045em] text-ink sm:text-[32px] sm:leading-9">
              С возвращением
            </h1>
            <p className="mt-2 text-[15px] leading-6 text-muted">
              Продолжите подготовку там, где остановились.
            </p>
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
