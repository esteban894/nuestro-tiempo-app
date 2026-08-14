import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { CalendarEvent } from "../../api/calendar.api";
import { EventItem } from "../event-item/EventItem";

interface EventListProps {
  events: CalendarEvent[];
  currentUserId?: string;
  onPressEvent: (event: CalendarEvent) => void;
  emptyLabel?: string;
}

export const EventList = ({
  events,
  currentUserId,
  onPressEvent,
  emptyLabel,
}: EventListProps) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  if (events.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyLabel ?? t("calendar.eventList.empty")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {events.map((event) => (
        <EventItem
          key={event.id}
          event={event}
          isMine={event.createdBy === currentUserId}
          onPress={() => onPressEvent(event)}
        />
      ))}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      gap: 10,
    },
    empty: {
      paddingVertical: 24,
      alignItems: "center",
    },
    emptyText: {
      fontSize: 14,
      color: colors.NEUTRAL[600],
    },
  });
