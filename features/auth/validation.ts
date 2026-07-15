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

/** Collapses a ZodError into the first message per top-level field, matching the forms' error shape. */
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

/** Validación client-side de login (vacíos + formato de email); el servidor sigue siendo la fuente de verdad. */
export function validateLoginForm(values: { email: string; password: string }): LoginErrors {
  const result = loginSchema.safeParse(values);
  return result.success ? {} : fieldErrors<LoginErrors>(result.error);
}

/** Validación client-side de registro (vacíos, formato de email y coincidencia de contraseñas). */
export function validateRegisterForm(values: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): RegisterErrors {
  const result = registerSchema.safeParse(values);
  return result.success ? {} : fieldErrors<RegisterErrors>(result.error);
}
