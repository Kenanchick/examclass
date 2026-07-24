import { z } from "zod";

export const teacherHomeworkAssignmentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Введите название — минимум 3 символа")
    .max(120, "Название должно быть короче 120 символов"),
  description: z
    .string()
    .trim()
    .max(1_500, "Комментарий должен быть короче 1 500 символов"),
  deadline: z
    .string()
    .min(1, "Укажите дату и время дедлайна")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Укажите корректную дату и время",
    ),
  taskPublicIds: z
    .array(z.string())
    .min(1, "Выберите хотя бы одну задачу"),
  studentIds: z
    .array(z.string())
    .min(1, "Выберите хотя бы одного ученика"),
});

export type TeacherHomeworkAssignmentFormValues = z.infer<
  typeof teacherHomeworkAssignmentSchema
>;
