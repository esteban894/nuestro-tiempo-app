import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CalendarEvent, CalendarEventCategory } from "../../api/calendar.api";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

const CATEGORY_ICON: Record<CalendarEventCategory, IoniconsName> = {
  anniversary: "heart",
  birthday: "gift",
  date_plan: "cafe",
  milestone: "flag",
  memory: "images",
  other: "calendar-outline",
};

interface EventItemProps {
  event: CalendarEvent;
  isMine: boolean;
  onPress?: () => void;
}

export const EventItem = ({ event, isMine, onPress }: EventItemProps) => {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const start = new Date(event.startAt);
  const timeLabel = event.allDay
    ? t("calendar.eventItem.allDay")
    : start.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" });

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7} onPress={onPress}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.SECONDARY[200] }]}>
        <Ionicons name={CATEGORY_ICON[event.category]} size={20} color={colors.PRIMARY[500]} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {timeLabel}
          {event.location ? ` · ${event.location}` : ""}
        </Text>
      </View>
      {event.status === "proposed" && (
        <View style={[styles.statusPill, { backgroundColor: colors.SECONDARY[200] }]}>
          <Text style={[styles.statusPillText, { color: colors.SECONDARY[800] }]}>
            {t("calendar.eventItem.pendingBadge")}
          </Text>
        </View>
      )}
      {event.status === "rejected" && (
        <View style={[styles.statusPill, { backgroundColor: colors.NEUTRAL[500] }]}>
          <Text style={[styles.statusPillText, { color: colors.ERROR[500] }]}>
            {t("calendar.eventItem.rejectedBadge")}
          </Text>
        </View>
      )}
      <View
        style={[
          styles.creatorDot,
          { backgroundColor: isMine ? colors.PRIMARY[500] : colors.SECONDARY[500] },
        ]}
      />
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.NEUTRAL[200],
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 14,
      elevation: 1,
      shadowColor: colors.SHADOW,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    iconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    info: {
      flex: 1,
    },
    title: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.NEUTRAL[800],
    },
    subtitle: {
      fontSize: 13,
      color: colors.NEUTRAL[600],
      marginTop: 2,
    },
    creatorDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: 8,
    },
    statusPill: {
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginLeft: 8,
    },
    statusPillText: {
      fontSize: 11,
      fontWeight: "600",
    },
  });
