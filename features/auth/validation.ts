import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: "Ingresa tu correo electrónico." })
    .pipe(z.email({ error: "Correo electrónico inválido." })),
  password: z.string().min(1, { error: "Ingresa tu contraseña." }),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, { error: "Ingresa tu nombre." }),
    email: z
      .string()
      .trim()
      .min(1, { error: "Ingresa tu correo electrónico." })
      .pipe(z.email({ error: "Correo electrónico inválido." })),
    password: z.string().min(1, { error: "Ingresa una contraseña." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Las contraseñas no coinciden.",
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
