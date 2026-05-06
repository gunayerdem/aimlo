import { z } from "zod";

/**
 * Server-side validation schemas. Mirrored on the client only as
 * inline `required` / `pattern` hints — the server is the source of
 * truth.
 */

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Kullanıcı adı en az 3 karakter olmalı")
  .max(20, "Kullanıcı adı en fazla 20 karakter")
  .regex(/^[a-zA-Z0-9_]+$/, "Sadece harf, rakam ve _ kullanabilirsin");

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Geçersiz e-posta formatı")
  .max(254, "E-posta çok uzun");

const nameSchema = z
  .string()
  .trim()
  .min(1, "Boş olamaz")
  .max(40, "Çok uzun");

const passwordSchema = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalı")
  .max(72, "Şifre en fazla 72 karakter"); // bcrypt hard cap

export const registerSchema = z
  .object({
    email: emailSchema,
    username: usernameSchema,
    firstName: nameSchema,
    lastName: nameSchema,
    password: passwordSchema,
    passwordConfirm: z.string(),
    kvkk: z.literal("on", {
      errorMap: () => ({ message: "Devam etmek için KVKK onayı gerekli" }),
    }),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Şifreler eşleşmiyor",
    path: ["passwordConfirm"],
  });

export const verifySchema = z.object({
  email: emailSchema,
  code: z.string().min(6, "6 hane gir").max(8, "Çok uzun"),
});

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "E-posta veya kullanıcı adı gerekli")
    .max(254),
  password: z.string().min(1, "Şifre gerekli").max(72),
});

export const forgotSchema = z.object({
  email: emailSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotInput = z.infer<typeof forgotSchema>;
