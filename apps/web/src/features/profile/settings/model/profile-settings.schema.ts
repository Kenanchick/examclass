import { z } from "zod";

export const profileDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Введите имя — минимум 2 символа")
    .max(60, "Имя должно быть короче 60 символов")
    .regex(
      /^[a-zA-Zа-яА-ЯёЁ][a-zA-Zа-яА-ЯёЁ '-]*$/,
      "Используйте буквы, пробел, дефис или апостроф",
    ),
  email: z
    .string()
    .trim()
    .email("Введите корректный email")
    .max(320, "Email слишком длинный"),
});

export const profilePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Введите текущий пароль"),
    newPassword: z
      .string()
      .min(8, "Минимум 8 символов")
      .max(128, "Максимум 128 символов")
      .regex(/[A-Z]/, "Добавьте хотя бы одну заглавную букву")
      .regex(/[0-9]/, "Добавьте хотя бы одну цифру"),
    confirmPassword: z.string().min(1, "Повторите новый пароль"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type ProfileDetailsValues = z.infer<typeof profileDetailsSchema>;
export type ProfilePasswordValues = z.infer<typeof profilePasswordSchema>;
