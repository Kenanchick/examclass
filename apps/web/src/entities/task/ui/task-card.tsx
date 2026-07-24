"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";
import {
  BookMarked,
  Check,
  ChevronDown,
  Clipboard,
  Lightbulb,
  NotebookPen,
  Star,
} from "lucide-react";
import { MathText } from "@/shared/ui/math-text";
import type { Task } from "../model/task";

type TaskCardProps = {
  task: Task;
  taskNumber: number;
  isFavorite: boolean;
  isFavoritePending: boolean;
  onToggleFavorite: () => void;
  responseSlot?: ReactNode;
  showReferenceSolution?: boolean;
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
  const glowClasses = [
    "difficulty-dot--easy",
    "difficulty-dot--medium",
    "difficulty-dot--hard",
  ];

  return (
    <div
      aria-label={`Сложность: ${difficultyLevel} из 3`}
      className="flex gap-2"
    >
      {Array.from({ length: 3 }, (_, index) => {
        const isActive = index < difficultyLevel;
        const activeColor = colors[difficultyLevel - 1];
        const activeGlowClass = glowClasses[difficultyLevel - 1];

        return (
          <span
            className={`size-3 rounded-full ${
              isActive
                ? `${activeColor} ${activeGlowClass} animate-[twinkle_2.6s_ease-in-out_infinite]`
                : "bg-line"
            }`}
            key={index}
            style={
              isActive ? { animationDelay: `${index * 180}ms` } : undefined
            }
          />
        );
      })}
    </div>
  );
}

export function TaskCard({
  task,
  taskNumber,
  isFavorite,
  isFavoritePending,
  onToggleFavorite,
  responseSlot,
  showReferenceSolution = true,
}: TaskCardProps) {
  const [answer, setAnswer] = useState("");
  const [answerState, setAnswerState] = useState<
    "correct" | "incorrect" | null
  >(null);
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCheckAnswer = () => {
    if (!task.correctAnswer) {
      return;
    }

    setAnswerState(
      normalizeAnswer(answer) === normalizeAnswer(task.correctAnswer)
        ? "correct"
        : "incorrect",
    );
  };

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(task.publicId);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1800);
  };

  const answerFieldId = `answer-${task.publicId}`;

  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_16px_35px_rgba(15,43,76,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-8 py-7 sm:px-11">
        <div className="flex items-center gap-3.5">
          <span className="rounded-xl bg-brand/10 px-4 py-2 text-base font-bold text-brand">
            Задача {taskNumber}
          </span>
          <DifficultyDots difficulty={task.difficulty} />
          <span className="text-[15px] font-medium text-muted">Сложность</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            aria-label={
              isFavorite ? "Убрать из избранного" : "Добавить в избранное"
            }
            aria-pressed={isFavorite}
            className={`grid size-12 cursor-pointer place-items-center rounded-xl border transition ${
              isFavorite
                ? "border-amber-300 bg-amber-50 text-amber-500"
                : "border-line bg-white text-muted hover:border-amber-300 hover:text-amber-500"
            } disabled:cursor-wait disabled:opacity-60`}
            disabled={isFavoritePending}
            onClick={onToggleFavorite}
            type="button"
          >
            <Star className={`size-5.5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
          <button
            aria-label="Скопировать ID задачи"
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] font-bold text-brand transition hover:border-brand/35 hover:bg-panel"
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

      <div className="px-8 py-9 sm:px-11 sm:py-12">
        <MathText
          className="max-w-5xl text-[1.35rem] leading-10 text-ink sm:text-[1.5rem]"
          content={task.statement}
        />

        {task.source && (
          <p className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted">
            <BookMarked className="size-4 shrink-0" />
            Источник: {task.source}
          </p>
        )}

        {responseSlot ?? (
          <div className="mt-10 rounded-2xl border border-line bg-panel/60 p-5 sm:p-7">
            <label
              className="block text-lg font-bold text-ink"
              htmlFor={answerFieldId}
            >
              Ваш ответ
            </label>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                className="min-w-0 flex-1 rounded-xl border border-line bg-white px-5 py-4 text-lg text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/10"
                id={answerFieldId}
                onChange={(event) => {
                  setAnswer(event.target.value);
                  setAnswerState(null);
                }}
                placeholder="Введите ответ"
                value={answer}
              />
              <button
                className="cursor-pointer rounded-xl bg-brand px-7 py-4 text-lg font-bold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
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
                  answerState === "correct" ? "text-success" : "text-danger"
                }`}
                role="status"
              >
                {answerState === "correct"
                  ? "Верно! Отличная работа."
                  : "Пока не совпало. Попробуйте ещё раз или откройте решение."}
              </p>
            )}
          </div>
        )}

        {showReferenceSolution && (
          <>
            <button
              aria-expanded={isSolutionOpen}
              className="mt-6 inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-brand/25 bg-brand/5 px-5 py-4 text-lg font-bold text-brand transition hover:bg-brand/10"
              onClick={() => setIsSolutionOpen((isOpen) => !isOpen)}
              type="button"
            >
              <Lightbulb className="size-5.5" />
              {isSolutionOpen ? "Скрыть решение" : "Показать решение"}
              <ChevronDown
                className={`size-5 transition-transform duration-300 ${
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
                <div className="relative overflow-hidden rounded-2xl border border-[#c6ddf5] bg-[#eef6ff] p-6 pr-6 sm:p-8 sm:pr-44">
                  <div className="relative z-10">
                    <p className="inline-flex items-center gap-2 text-lg font-bold text-brand">
                      <NotebookPen className="size-5.5" />
                      Разбор решения
                    </p>
                    <MathText
                      className="mt-3 max-w-3xl text-[17px] leading-8 text-ink"
                      content={
                        task.referenceSolution ?? "Решение скоро появится."
                      }
                    />
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
          </>
        )}
      </div>
    </article>
  );
}
