"use client";

import {
  CalendarClock,
  Check,
  CircleCheckBig,
  LoaderCircle,
  MessageSquareText,
  Send,
} from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { TeacherHomeworkAssignmentFormValues } from "../model/teacher-homework.schema";
import type { TeacherHomeworkStudent } from "../model/teacher-homework";
import { TeacherHomeworkStudentSelector } from "./teacher-homework-student-selector";

type TeacherHomeworkAssignmentFormProps = {
  form: UseFormReturn<TeacherHomeworkAssignmentFormValues>;
  students: TeacherHomeworkStudent[];
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: string | null;
  onSubmit: (values: TeacherHomeworkAssignmentFormValues) => void;
};

const fieldClassName =
  "mt-2 w-full rounded-2xl border border-line bg-white px-4 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10";

function getAssignmentButtonLabel(taskCount: number, studentCount: number) {
  if (taskCount === 0 || studentCount === 0) {
    return "Назначить домашнее задание";
  }

  return `Назначить: ${taskCount} задач · ${studentCount} учеников`;
}

export function TeacherHomeworkAssignmentForm({
  form,
  students,
  isSubmitting,
  submitError,
  submitSuccess,
  onSubmit,
}: TeacherHomeworkAssignmentFormProps) {
  const selectedStudentIds = form.watch("studentIds");
  const selectedTaskIds = form.watch("taskPublicIds");

  const updateStudentSelection = (studentIds: string[]) => {
    form.setValue("studentIds", studentIds, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <section
      aria-labelledby="teacher-homework-details-title"
      className="rounded-[2rem] border border-line bg-white p-5 shadow-[0_16px_35px_rgba(15,43,76,0.05)] sm:p-7"
    >
      <div className="flex gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-base font-bold text-white">
          2
        </span>
        <div>
          <h2
            className="text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl"
            id="teacher-homework-details-title"
          >
            Настройте выдачу
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
            Дайте работе понятное название, выберите срок и учеников. Каждому
            придёт одинаковый набор задач.
          </p>
        </div>
      </div>

      <form
        className="mt-7 space-y-7"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(210px,0.7fr)]">
          <label className="block">
            <span className="text-base font-bold text-ink">Название</span>
            <input
              className={`${fieldClassName} h-13`}
              placeholder="Например, Повторение производной"
              type="text"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="mt-2 text-sm font-medium text-danger">
                {form.formState.errors.title.message}
              </p>
            )}
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-base font-bold text-ink">
              <CalendarClock className="size-5 text-brand" />
              Дедлайн
            </span>
            <input
              className={`${fieldClassName} h-13`}
              type="datetime-local"
              {...form.register("deadline")}
            />
            {form.formState.errors.deadline && (
              <p className="mt-2 text-sm font-medium text-danger">
                {form.formState.errors.deadline.message}
              </p>
            )}
          </label>
        </div>

        <label className="block">
          <span className="flex items-center gap-2 text-base font-bold text-ink">
            <MessageSquareText className="size-5 text-brand" />
            Комментарий для учеников
            <span className="font-medium text-muted">· необязательно</span>
          </span>
          <textarea
            className={`${fieldClassName} min-h-30 resize-y py-3.5 leading-6`}
            maxLength={1_500}
            placeholder="На что обратить внимание при решении?"
            rows={4}
            {...form.register("description")}
          />
          <div className="mt-2 flex justify-between gap-3 text-sm text-muted">
            <span>{form.formState.errors.description?.message}</span>
            <span>{form.watch("description").length}/1500</span>
          </div>
        </label>

        <TeacherHomeworkStudentSelector
          errorMessage={form.formState.errors.studentIds?.message}
          onSelectionChange={updateStudentSelection}
          selectedStudentIds={selectedStudentIds}
          students={students}
        />

        {submitSuccess && (
          <p
            className="flex items-start gap-2 rounded-2xl bg-success/10 px-4 py-3.5 text-sm font-semibold leading-6 text-success"
            role="status"
          >
            <CircleCheckBig className="mt-0.5 size-5 shrink-0" />
            {submitSuccess}
          </p>
        )}

        {submitError && (
          <p
            className="rounded-2xl bg-danger/10 px-4 py-3.5 text-sm font-semibold leading-6 text-danger"
            role="alert"
          >
            {submitError}
          </p>
        )}

        <button
          className="flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-brand px-5 text-base font-bold text-white transition hover:bg-brand/90 disabled:cursor-wait disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <Send className="size-5" />
          )}
          {isSubmitting
            ? "Назначаем задание…"
            : getAssignmentButtonLabel(
                selectedTaskIds.length,
                selectedStudentIds.length,
              )}
        </button>

        <p className="flex items-center justify-center gap-2 text-center text-xs leading-5 text-muted">
          <Check className="size-4 shrink-0 text-success" />
          После назначения задание появится у выбранных учеников в домашнем
          задании и календаре.
        </p>
      </form>
    </section>
  );
}
