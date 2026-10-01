import { ThemeColors } from "@/constants/colors";
import { Card } from "@/features/common";
import { getElapsedTime } from "@/features/common/components/ui/counter-cards/getElapsedTime";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useUpcomingEventsQuery } from "../../hooks/useUpcomingEventsQuery";

function formatCountdown(occurrenceAt: string, now: Date, t: TFunction) {
  const { years, months, days, hours, minutes } = getElapsedTime(now, new Date(occurrenceAt));

  if (years > 0) return t("calendar.countdown.years", { count: years });
  if (months > 0) return t("calendar.countdown.months", { count: months });
  if (days > 0) return t("calendar.countdown.days", { count: days });
  if (hours > 0) return t("calendar.countdown.hours", { count: hours });
  if (minutes > 0) return t("calendar.countdown.minutes", { count: minutes });
  return t("calendar.countdown.soon");
}

export const NextEventCard = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const router = useRouter();
  const { data: events } = useUpcomingEventsQuery(1);
  const nextEvent = events?.[0];

  // Re-render periodically so the countdown label keeps advancing while the
  // screen stays mounted, instead of freezing at whatever it read on mount.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!nextEvent) return null;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/calendar")}>
      <Card cardStyles={styles.card}>
        <Ionicons name="calendar" size={28} color={colors.PRIMARY[500]} />
        <Text style={styles.title} numberOfLines={1}>
          {nextEvent.title}
        </Text>
        <Text style={styles.countdown}>{formatCountdown(nextEvent.nextOccurrence, now, t)}</Text>
      </Card>
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 16,
    },
    title: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
      color: colors.NEUTRAL[800],
    },
    countdown: {
      fontSize: 13,
      color: colors.SECONDARY[800],
      fontWeight: "500",
    },
  });
