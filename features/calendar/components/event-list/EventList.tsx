import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { CalendarEvent } from "../../api/calendar.api";
import { fromDateKey } from "../../utils/dateGrid";
import { EventDayGroup } from "../../utils/groupEventsByDay";
import { EventItem } from "../event-item/EventItem";

interface EventListProps {
  groups: EventDayGroup[];
  currentUserId?: string;
  onPressEvent: (event: CalendarEvent) => void;
  /** Day ("YYYY-MM-DD") whose header and events are emphasized. */
  highlightedDateKey?: string;
  showDayHeaders?: boolean;
  emptyLabel?: string;
}

export const EventList = ({
  groups,
  currentUserId,
  onPressEvent,
  highlightedDateKey,
  showDayHeaders = true,
  emptyLabel,
}: EventListProps) => {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  if (groups.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyLabel ?? t("calendar.eventList.empty.day")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {groups.map((group) => {
        const highlighted = group.dateKey === highlightedDateKey;
        return (
          <View key={group.dateKey} style={styles.group}>
            {showDayHeaders && (
              <Text style={[styles.dayHeader, highlighted && styles.dayHeaderHighlighted]}>
                {fromDateKey(group.dateKey).toLocaleDateString(i18n.language, {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                })}
              </Text>
            )}
            {group.events.map((event) => (
              <EventItem
                key={event.occurrenceId}
                event={event}
                isMine={event.createdBy === currentUserId}
                highlighted={highlighted}
                onPress={() => onPressEvent(event)}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      gap: 16,
    },
    group: {
      gap: 10,
    },
    dayHeader: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.NEUTRAL[600],
      textTransform: "capitalize",
    },
    dayHeaderHighlighted: {
      color: colors.PRIMARY[500],
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
