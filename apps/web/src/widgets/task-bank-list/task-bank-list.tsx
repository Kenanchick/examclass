import Image from "next/image";
import { ArrowRight } from "lucide-react";

const subjects = ["Математика", "Русский", "Физика", "Информатика"];

const topics = [
  { number: 1, title: "Планиметрия" },
  { number: 2, title: "Векторы" },
  { number: 3, title: "Стереометрия" },
  { number: 4, title: "Начала теории вероятностей" },
  { number: 5, title: "Вероятности сложных событий" },
  { number: 6, title: "Простейшие уравнения" },
  { number: 7, title: "Вычисления и преобразования" },
  { number: 8, title: "Производная и первообразная" },
  { number: 9, title: "Задачи с прикладным содержанием" },
  { number: 10, title: "Текстовые задачи" },
  { number: 11, title: "Графики функций" },
  { number: 12, title: "Наибольшее и наименьшее значение функций" },
  { number: 13, title: "Уравнения" },
  { number: 14, title: "Стереометрическая задача" },
  { number: 15, title: "Неравенства" },
  { number: 16, title: "Финансовая математика" },
  { number: 17, title: "Планиметрическая задача" },
  { number: 18, title: "Задача с параметром" },
  { number: 19, title: "Числа и их свойства" },
];

export function TaskBankList() {
  return (
    <section className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
      <div className="absolute right-0 top-0 hidden h-56 w-56 items-center justify-center  lg:flex">
        <Image
          alt="Помощник ExamClass"
          className="h-auto w-40"
          height={2000}
          src="/cat.png"
          width={2000}
        />
      </div>

      <div className="relative z-10 lg:pr-52">
        <h1 className="text-3xl font-bold tracking-[-0.05em] text-ink sm:text-4xl">
          Открытый банк задач
        </h1>

        <p className="mt-2 text-base text-muted sm:text-lg">
          Профильная математика · ЕГЭ
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          {subjects.map((subject) => {
            const isActive = subject === "Математика";

            return (
              <button
                aria-pressed={isActive}
                className={`rounded-xl border px-5 py-3 text-[15px] font-semibold transition ${
                  isActive
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-line bg-white text-ink hover:bg-panel"
                }`}
                key={subject}
                type="button"
              >
                {subject}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mt-10 grid gap-3 md:grid-cols-2 md:gap-x-6">
        {topics.map((topic) => (
          <button
            className="group flex min-h-16 items-center gap-4 rounded-xl border border-line px-4 text-left transition hover:border-brand/40 hover:bg-panel"
            key={topic.number}
            type="button"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-[14px] border border-[#80afe4] bg-gradient-to-br from-[#d8ecff] via-[#acd4ff] to-[#78afe0] text-sm font-extrabold text-[#063d73] shadow-[inset_0_2px_0_rgba(255,255,255,0.8),inset_0_-2px_0_rgba(38,100,166,0.16),0_4px_0_#5d91c9,0_7px_0_rgba(31,79,129,0.14)]">
              {topic.number}
            </span>

            <span className="flex-1 text-[15px] font-medium text-ink">
              {topic.title}
            </span>

            <ArrowRight className="size-5 text-brand transition-transform group-hover:translate-x-1" />
          </button>
        ))}
      </div>
    </section>
  );
}
