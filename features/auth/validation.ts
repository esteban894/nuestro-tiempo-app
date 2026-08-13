import { z } from "zod";

// Schema messages are i18n keys, not display text — consumers resolve them via t() at
// render time (see LoginForm/RegisterForm), since Zod validation runs outside any
// particular language's rendering context.
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: "auth.validation.emailRequired" })
    .pipe(z.email({ error: "auth.validation.emailInvalid" })),
  password: z.string().min(1, { error: "auth.validation.passwordRequired" }),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, { error: "auth.validation.nameRequired" }),
    email: z
      .string()
      .trim()
      .min(1, { error: "auth.validation.emailRequired" })
      .pipe(z.email({ error: "auth.validation.emailInvalid" })),
    password: z.string().min(1, { error: "auth.validation.passwordRequiredRegister" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "auth.validation.passwordMismatch",
    path: ["confirmPassword"],
  });

export type LoginErrors = { email?: string; password?: string };
export type RegisterErrors = LoginErrors & { name?: string; confirmPassword?: string };

function fieldErrors<T extends Record<string, string | undefined>>(error: z.ZodError): T {
  const result = {} as Record<string, string>;
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in result)) {
      result[key] = issue.message;
    }
  }
  return result as T;
}

export function validateLoginForm(values: { email: string; password: string }): LoginErrors {
  const result = loginSchema.safeParse(values);
  return result.success ? {} : fieldErrors<LoginErrors>(result.error);
}

export function validateRegisterForm(values: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): RegisterErrors {
  const result = registerSchema.safeParse(values);
  return result.success ? {} : fieldErrors<RegisterErrors>(result.error);
}
