import { z } from "zod";

export const registerFormSchema = z
  .object({
    name: z
      .string()
      .min(3, "Имя пользователя должно быть не менее 3 символов")
      .max(20, "Имя пользователя должно быть не более 20 символов")
      .regex(
        /^[a-zA-Z0-9а-яА-ЯёЁ]+$/,
        "Имя должно состоять только из букв и цифр, без спецсимволов и подчёркиваний",
      ),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Некорректный формат email")
      .max(320, "Email должен быть не более 320 символов"),

    password: z
      .string()
      .min(8, "Пароль должен быть не менее 8 символов")
      .max(128, "Пароль должен быть не более 128 символов")
      .regex(/[A-Z]/, "Пароль должен содержать хотя бы одну заглавную букву")
      .regex(/[0-9]/, "Пароль должен содержать хотя бы одну цифру"),

    confirmPassword: z.string().min(1, "Подтвердите пароль"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type UserRegisterForm = z.infer<typeof registerFormSchema>;
