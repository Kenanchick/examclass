"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clipboard,
  Lightbulb,
  NotebookPen,
  Star,
} from "lucide-react";
import {
  useFavoriteMutations,
  useFavoritesQuery,
} from "@/entities/favorite/api/use-favorites-query";
import { useTaskQuery } from "@/entities/task/api/use-task-query";
import { StudentLayout } from "@/widgets/student-layout/ui/student-layout";

type StudentTaskPageProps = {
  publicId: string;
};

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replaceAll(" ", "")
    .replaceAll("−", "-")
    .replaceAll(",", ".");
}

function DifficultyDots({ difficulty }: { difficulty: number }) {
  const difficultyLevel = Math.min(Math.max(difficulty, 1), 3);
  const colors = ["bg-success", "bg-amber-400", "bg-danger"];

  return (
    <div
      aria-label={`Сложность: ${difficultyLevel} из 3`}
      className="flex gap-2"
    >
      {Array.from({ length: 3 }, (_, index) => {
        const isActive = index === difficultyLevel - 1;

        return (
          <span
            className={`size-3 rounded-full ${
              isActive
                ? `${colors[index]} ${
                    difficultyLevel === 1
                      ? "animate-[twinkle_2.6s_ease-in-out_infinite]"
                      : ""
                  }`
                : "bg-line"
            }`}
            key={index}
            style={
              difficultyLevel === 1 && isActive
                ? { animationDelay: `${index * 180}ms` }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}

export function StudentTaskPage({ publicId }: StudentTaskPageProps) {
  const router = useRouter();
  const taskQuery = useTaskQuery(publicId);
  const [answer, setAnswer] = useState("");
  const [answerState, setAnswerState] = useState<
    "correct" | "incorrect" | null
  >(null);
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [hasAccessToken, setHasAccessToken] = useState(false);
  const favoritesQuery = useFavoritesQuery(hasAccessToken);
  const { addMutation, removeMutation } = useFavoriteMutations();
  const task = taskQuery.data;

  useEffect(() => {
    setHasAccessToken(Boolean(window.localStorage.getItem("accessToken")));
  }, []);

  const handleCheckAnswer = () => {
    if (!task?.correctAnswer) {
      return;
    }

    setAnswerState(
      normalizeAnswer(answer) === normalizeAnswer(task.correctAnswer)
        ? "correct"
        : "incorrect",
    );
  };

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(publicId);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1800);
  };

  if (taskQuery.isPending) {
    return (
      <StudentLayout>
        <main className="grid place-items-center p-8 text-muted">
          Загружаем задачу…
        </main>
      </StudentLayout>
    );
  }

  if (!task) {
    return (
      <StudentLayout>
        <main className="grid place-items-center p-8">
          <div className="rounded-2xl border border-line bg-white p-8 text-center">
            <p className="text-lg font-semibold text-ink">Задача не найдена</p>
            <Link
              className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-brand"
              href="/dashboard"
            >
              <ArrowLeft className="size-4" />
              Вернуться к банку задач
            </Link>
          </div>
        </main>
      </StudentLayout>
    );
  }

  const taskNumber = task.topic.parent?.sortOrder ?? task.topic.sortOrder;
  const taskTopic = task.topic.parent?.name ?? task.topic.name;
  const isFavorite = favoritesQuery.data?.some(
    (favorite) => favorite.publicId === task.publicId,
  );
  const isFavoritePending = addMutation.isPending || removeMutation.isPending;

  const handleFavorite = () => {
    if (!hasAccessToken) {
      router.push("/login");
      return;
    }

    if (isFavorite) {
      removeMutation.mutate(task.publicId);
      return;
    }

    addMutation.mutate(task.publicId);
  };

  return (
    <StudentLayout>
      <main className="min-w-0 p-4 sm:p-7 lg:p-8">
        <div className="mx-auto max-w-[1320px]">
          <Link
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-muted transition hover:text-brand"
            href="/dashboard"
          >
            <ArrowLeft className="size-4" />
            Банк задач
          </Link>

          <section className="relative mt-5 overflow-hidden rounded-3xl border border-[#c6ddf5] bg-[#eef6ff] px-7 py-8 sm:px-9">
            <div className="relative z-10 max-w-2xl">
              <p className="text-sm font-semibold text-brand">
                {task.topic.subject.name} · ЕГЭ
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-ink sm:text-[2.7rem]">
                {taskTopic}
              </h1>
              <p className="mt-2 text-[15px] text-muted">
                Задание {taskNumber} · {task.topic.name}
              </p>
            </div>
            <Image
              alt="Медвежонок готовится к задаче"
              className="absolute -bottom-12 right-2 hidden h-auto w-44 lg:block"
              height={1448}
              src="/bear.png"
              width={1086}
            />
          </section>

          <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_260px]">
            <article className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_16px_35px_rgba(15,43,76,0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-7 py-6 sm:px-9">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-brand/10 px-3 py-1.5 text-sm font-bold text-brand">
                    Задача {taskNumber}
                  </span>
                  <DifficultyDots difficulty={task.difficulty} />
                  <span className="text-sm font-medium text-muted">
                    Сложность
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    aria-label={
                      isFavorite
                        ? "Убрать из избранного"
                        : "Добавить в избранное"
                    }
                    aria-pressed={isFavorite}
                    className={`grid size-10 cursor-pointer place-items-center rounded-xl border transition ${
                      isFavorite
                        ? "border-amber-300 bg-amber-50 text-amber-500"
                        : "border-line bg-white text-muted hover:border-amber-300 hover:text-amber-500"
                    } disabled:cursor-wait disabled:opacity-60`}
                    disabled={isFavoritePending}
                    onClick={handleFavorite}
                    type="button"
                  >
                    <Star
                      className={`size-5 ${isFavorite ? "fill-current" : ""}`}
                    />
                  </button>
                  <button
                    aria-label="Скопировать ID задачи"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-bold text-brand transition hover:border-brand/35 hover:bg-panel"
                    onClick={handleCopyId}
                    type="button"
                  >
                    {isCopied ? (
                      <Check className="size-4" />
                    ) : (
                      <Clipboard className="size-4" />
                    )}
                    {isCopied ? "Скопировано" : task.publicId}
                  </button>
                </div>
              </div>

              <div className="px-7 py-8 sm:px-9 sm:py-10">
                <p className="max-w-4xl text-xl leading-9 text-ink sm:text-[1.35rem]">
                  {task.statement}
                </p>

                <div className="mt-9 rounded-2xl border border-line bg-panel/60 p-4 sm:p-5">
                  <label
                    className="block text-base font-bold text-ink"
                    htmlFor="answer"
                  >
                    Ваш ответ
                  </label>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <input
                      className="min-w-0 flex-1 rounded-xl border border-line bg-white px-4 py-3.5 text-[17px] text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/10"
                      id="answer"
                      onChange={(event) => {
                        setAnswer(event.target.value);
                        setAnswerState(null);
                      }}
                      placeholder="Введите ответ"
                      value={answer}
                    />
                    <button
                      className="cursor-pointer rounded-xl bg-brand px-6 py-3.5 text-base font-bold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!answer.trim()}
                      onClick={handleCheckAnswer}
                      type="button"
                    >
                      Проверить
                    </button>
                  </div>

                  {answerState && (
                    <p
                      className={`mt-3 text-sm font-semibold ${
                        answerState === "correct"
                          ? "text-success"
                          : "text-danger"
                      }`}
                      role="status"
                    >
                      {answerState === "correct"
                        ? "Верно! Отличная работа."
                        : "Пока не совпало. Попробуйте ещё раз или откройте решение."}
                    </p>
                  )}
                </div>

                <button
                  aria-expanded={isSolutionOpen}
                  className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand/25 bg-brand/5 px-4 py-3.5 text-base font-bold text-brand transition hover:bg-brand/10"
                  onClick={() => setIsSolutionOpen((isOpen) => !isOpen)}
                  type="button"
                >
                  <Lightbulb className="size-5" />
                  {isSolutionOpen ? "Скрыть решение" : "Показать решение"}
                  <ChevronDown
                    className={`size-4 transition-transform duration-300 ${
                      isSolutionOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    isSolutionOpen
                      ? "mt-4 grid-rows-[1fr] opacity-100"
                      : "mt-0 grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="relative overflow-hidden rounded-2xl border border-[#c6ddf5] bg-[#eef6ff] p-5 pr-5 sm:p-6 sm:pr-40">
                      <div className="relative z-10">
                        <p className="inline-flex items-center gap-2 text-base font-bold text-brand">
                          <NotebookPen className="size-5" />
                          Разбор решения
                        </p>
                        <p className="mt-3 max-w-2xl text-base leading-7 text-ink">
                          {task.referenceSolution ?? "Решение скоро появится."}
                        </p>
                        {task.correctAnswer && (
                          <p className="mt-4 text-sm font-bold text-success">
                            Ответ: {task.correctAnswer}
                          </p>
                        )}
                      </div>
                      <Image
                        alt="Пингвин подсказывает решение"
                        className="absolute -bottom-8 right-2 hidden h-auto w-36 sm:block"
                        height={1448}
                        src="/penguin.png"
                        width={1086}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <aside className="hidden 2xl:flex 2xl:flex-col 2xl:gap-5">
              <div className="relative overflow-hidden rounded-3xl border border-line bg-white p-5">
                <p className="text-sm font-bold text-ink">
                  Геометрический настрой
                </p>
                <p className="mt-2 max-w-[145px] text-sm leading-6 text-muted">
                  Делайте небольшой чертёж даже в простых задачах.
                </p>
                <Image
                  alt="Ёжик изучает геометрию"
                  className="mt-3 h-auto w-36"
                  height={1448}
                  src="/hedgehog.png"
                  width={1086}
                />
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-[#c6ddf5] bg-[#eef6ff] p-5">
                <p className="text-sm font-bold text-ink">Проверка</p>
                <p className="mt-2 max-w-[145px] text-sm leading-6 text-muted">
                  Сверяйте единицы измерения и формат ответа.
                </p>
                <Image
                  alt="Лисёнок проверяет ответ"
                  className="mt-3 h-auto w-36"
                  height={1448}
                  src="/fox.png"
                  width={1086}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}
