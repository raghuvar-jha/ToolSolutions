/**
 * Account schemas (spec 010), shared by the signup page and, later, login.
 */
import { z } from "zod";

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Enter your full name (at least 2 characters)")
  .max(80, "Name can be at most 80 characters");

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address")
  .pipe(z.email("Enter a valid email address").max(120, "Email is too long"));

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password can be at most 128 characters")
  .regex(/[A-Za-z]/, "Password must include at least one letter")
  .regex(/\d/, "Password must include at least one number");

export const signupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type SignupInput = z.input<typeof signupSchema>;
export type SignupField = keyof SignupInput;

/** Login only checks that both fields are filled in; the signup rules apply when the password is set. */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password").max(128, "Password can be at most 128 characters"),
});

export type LoginInput = z.input<typeof loginSchema>;
export type LoginField = keyof LoginInput;
