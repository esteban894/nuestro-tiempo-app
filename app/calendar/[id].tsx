import { ThemeColors } from "@/constants/colors";
import { useAuthStore } from "@/features/auth";
import {
  formatAllDayDate,
  useConfirmEventMutation,
  useDeleteEventMutation,
  useEventQuery,
  useRejectEventMutation,
} from "@/features/calendar";
import { Button, Card, OverflowMenu, Skeleton, Title } from "@/features/common";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function EventDetailScreen() {
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const currentUserId = useAuthStore((state) => state.user?.id);

  const { data: event, isLoading, isError } = useEventQuery(id);
  const deleteMutation = useDeleteEventMutation();
  const confirmMutation = useConfirmEventMutation();
  const rejectMutation = useRejectEventMutation();

  const RECURRENCE_LABEL: Record<string, string> = {
    none: t("calendar.detail.recurrence.none"),
    yearly: t("calendar.detail.recurrence.yearly"),
    monthly: t("calendar.detail.recurrence.monthly"),
  };

  const handleEdit = () => router.push({ pathname: "/calendar/[id]/edit", params: { id } });

  const handleDelete = () => {
    Alert.alert(t("calendar.detail.deleteConfirm.title"), t("calendar.detail.deleteConfirm.message"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => deleteMutation.mutate(id, { onSuccess: () => router.back() }),
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.content}>
        <Skeleton width="100%" height={120} borderRadius={20} />
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

  const start = new Date(event.startAt);
  const end = event.endAt ? new Date(event.endAt) : null;

  const isProposal = event.type === "appointment";
  // proposedBy (not createdBy) is who's waiting — a re-proposal after a reject
  // reassigns it to whoever edited the event, flipping the roles.
  const isProposer = event.proposedBy === currentUserId;
  const awaitingResponse = isProposal && event.status === "proposed";

  return (
    <View style={styles.content}>
      <Stack.Screen
        options={{
          headerTitle: event.title,
          headerRight: () => (
            <OverflowMenu
              options={[
                { label: t("calendar.detail.editMenu"), icon: "create-outline", onPress: handleEdit },
                {
                  label: t("calendar.detail.deleteMenu"),
                  icon: "trash-outline",
                  destructive: true,
                  disabled: deleteMutation.isPending,
                  onPress: handleDelete,
                },
              ]}
            />
          ),
        }}
      />

      <Card>
        <Title title={event.title} variant="h3" style={styles.title} />

        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={18} color={colors.SECONDARY[500]} />
          <Text style={styles.rowText}>
            {event.allDay
              ? formatAllDayDate(event, i18n.language)
              : start.toLocaleString(i18n.language, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            {end &&
              ` — ${end.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" })}`}
          </Text>
        </View>

        {event.location && (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={18} color={colors.SECONDARY[500]} />
            <Text style={styles.rowText}>{event.location}</Text>
          </View>
        )}

        <View style={styles.row}>
          <Ionicons name="repeat-outline" size={18} color={colors.SECONDARY[500]} />
          <Text style={styles.rowText}>{RECURRENCE_LABEL[event.recurrence]}</Text>
        </View>

        {event.reminderMinutesBefore != null && (
          <View style={styles.row}>
            <Ionicons name="notifications-outline" size={18} color={colors.SECONDARY[500]} />
            <Text style={styles.rowText}>{t("calendar.detail.reminderActive")}</Text>
          </View>
        )}

        {event.description && <Text style={styles.description}>{event.description}</Text>}

        {isProposal && awaitingResponse && !isProposer && (
          <View style={styles.proposalActions}>
            <Button
              title={t("calendar.detail.proposal.confirmButton")}
              variant="primary"
              size="small"
              style={styles.proposalButton}
              isLoading={confirmMutation.isPending}
              disabled={confirmMutation.isPending || rejectMutation.isPending}
              onPress={() => confirmMutation.mutate(id)}
            />
            <Button
              title={t("calendar.detail.proposal.counterProposeButton")}
              variant="outline"
              size="small"
              style={styles.proposalButton}
              disabled={confirmMutation.isPending || rejectMutation.isPending}
              onPress={handleEdit}
            />
            <Button
              title={t("calendar.detail.proposal.rejectButton")}
              variant="danger"
              size="small"
              style={styles.proposalButton}
              isLoading={rejectMutation.isPending}
              disabled={confirmMutation.isPending || rejectMutation.isPending}
              onPress={() => rejectMutation.mutate(id)}
            />
          </View>
        )}

        {isProposal && awaitingResponse && isProposer && (
          <View style={[styles.statusBanner, { backgroundColor: colors.SECONDARY[200] }]}>
            <Ionicons name="time-outline" size={18} color={colors.SECONDARY[500]} />
            <View style={styles.statusBannerText}>
              <Text style={styles.statusBannerTitle}>{t("calendar.detail.proposal.pendingTitle")}</Text>
              <Text style={styles.rowText}>{t("calendar.detail.proposal.pendingSubtitle")}</Text>
            </View>
          </View>
        )}

        {isProposal && event.status === "confirmed" && event.respondedBy && (
          <View style={[styles.statusBanner, { backgroundColor: colors.PRIMARY[200] }]}>
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.PRIMARY[500]} />
            <Text style={styles.statusBannerTitle}>
              {t("calendar.detail.proposal.confirmedBadge")}
            </Text>
          </View>
        )}

        {isProposal && event.status === "rejected" && (
          <View style={[styles.statusBanner, { backgroundColor: colors.NEUTRAL[500] }]}>
            <Ionicons name="close-circle-outline" size={18} color={colors.ERROR[500]} />
            <Text style={[styles.statusBannerTitle, { color: colors.ERROR[500] }]}>
              {t("calendar.detail.proposal.rejectedBadge")}
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    content: { flex: 1, padding: 20, backgroundColor: colors.NEUTRAL[200] },
    title: { marginBottom: 16 },
    row: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
    rowText: { fontSize: 15, color: colors.NEUTRAL[800] },
    description: { fontSize: 14, color: colors.NEUTRAL[800], marginTop: 8, lineHeight: 20 },
    notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
    notFoundText: { fontSize: 16, color: colors.NEUTRAL[800] },
    proposalActions: { flexDirection: "row", gap: 10, marginTop: 16 },
    proposalButton: { flex: 1 },
    statusBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 14,
      padding: 12,
      marginTop: 16,
    },
    statusBannerText: { flex: 1 },
    statusBannerTitle: { fontSize: 14, fontWeight: "600", color: colors.NEUTRAL[800] },
  });
