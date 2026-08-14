import { z } from "zod";
import { CATEGORIES_BY_TYPE } from "./utils/categoriesByType";

// Schema messages are i18n keys, not display text — consumers resolve them via t() at
// render time (see EventForm), since Zod validation runs outside any particular
// language's rendering context.
export const eventSchema = z
  .object({
    type: z.enum(["appointment", "important_date"]),
    category: z.enum(["anniversary", "birthday", "date_plan", "milestone", "memory", "other"]),
    title: z.string().trim().min(1, { error: "calendar.validation.titleRequired" }),
    description: z.string().trim().optional(),
    location: z.string().trim().optional(),
    startAt: z.date({ error: "calendar.validation.startRequired" }),
    endAt: z.date().optional(),
    allDay: z.boolean(),
    recurrence: z.enum(["none", "yearly", "monthly"]),
    reminderMinutesBefore: z.number().min(0).optional(),
  })
  .refine((data) => !data.endAt || data.endAt >= data.startAt, {
    error: "calendar.validation.endAfterStart",
    path: ["endAt"],
  })
  .refine((data) => CATEGORIES_BY_TYPE[data.type].includes(data.category), {
    error: "calendar.validation.categoryTypeMismatch",
    path: ["category"],
  });

export type EventFormValues = z.infer<typeof eventSchema>;
export type EventErrors = Partial<Record<keyof EventFormValues, string>>;

function fieldErrors(error: z.ZodError): EventErrors {
  const result: EventErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in result)) {
      result[key as keyof EventFormValues] = issue.message;
    }
  }
  return result;
}

export function validateEventForm(values: EventFormValues): EventErrors {
  const result = eventSchema.safeParse(values);
  return result.success ? {} : fieldErrors(result.error);
}
