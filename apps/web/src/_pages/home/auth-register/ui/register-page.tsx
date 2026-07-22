import Image from "next/image";
import { RegisterForm } from "@/features/auth/register/ui/register-form";

export function RegisterPage() {
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
              Твои первые шаги к подготовке
            </h2>
            <p className="mt-2 text-[15px] leading-6 text-muted">
              Создайте аккаунт и начните решать реальные задачи из ЕГЭ.
            </p>
          </div>
        </aside>

        <div className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-[550px]">
            <p className="text-xl font-bold tracking-[-0.05em] text-ink lg:hidden">
              Exam<span className="text-brand">Class</span>
            </p>
            <h1 className="mt-7 text-3xl font-bold tracking-[-0.045em] text-ink sm:text-[32px] sm:leading-9">
              Создать аккаунт
            </h1>
            <p className="mt-2 text-[15px] leading-6 text-muted">
              Доступ к банку задач и персональному плану подготовки.
            </p>
            <RegisterForm />
          </div>
        </div>
      </section>
    </main>
  );
}
