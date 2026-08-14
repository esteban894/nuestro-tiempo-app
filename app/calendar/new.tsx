import { EventForm, useCreateEventMutation } from "@/features/calendar";
import { getErrorMessage } from "@/features/common";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function NewEventScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutation = useCreateEventMutation();

  return (
    <EventForm
      submitLabel={t("calendar.form.createSubmit")}
      onSubmit={(payload) =>
        mutation.mutate(payload, {
          onSuccess: (event) => router.replace({ pathname: "/calendar/[id]", params: { id: event.id } }),
        })
      }
      isSubmitting={mutation.isPending}
      error={getErrorMessage(mutation.error, t) ?? null}
    />
  );
}
