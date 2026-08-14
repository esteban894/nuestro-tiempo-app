import { ThemeColors } from "@/constants/colors";
import { EventForm, useEventQuery, useUpdateEventMutation } from "@/features/calendar";
import { getErrorMessage, Skeleton } from "@/features/common";
import { useThemeColors } from "@/features/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

export default function EditEventScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const { data: event, isLoading, isError } = useEventQuery(id);
  const mutation = useUpdateEventMutation(id);

  if (isLoading) {
    return (
      <View style={styles.content}>
        <Skeleton width="100%" height={48} borderRadius={25} style={styles.gap} />
        <Skeleton width="100%" height={48} borderRadius={25} style={styles.gap} />
        <Skeleton width="100%" height={48} borderRadius={25} />
      </View>
    );
  }

  if (isError || !event) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>{t("calendar.notFound")}</Text>
      </View>
    );
  }

  return (
    <EventForm
      submitLabel={t("calendar.form.editSubmit")}
      initialValues={{
        ...event,
        description: event.description ?? undefined,
        location: event.location ?? undefined,
        endAt: event.endAt ?? undefined,
        reminderMinutesBefore: event.reminderMinutesBefore,
      }}
      onSubmit={(payload) =>
        mutation.mutate(payload, { onSuccess: () => router.back() })
      }
      isSubmitting={mutation.isPending}
      error={getErrorMessage(mutation.error, t) ?? null}
    />
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    content: { padding: 20 },
    gap: { marginBottom: 16 },
    notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
    notFoundText: { fontSize: 16, color: colors.NEUTRAL[800] },
  });
