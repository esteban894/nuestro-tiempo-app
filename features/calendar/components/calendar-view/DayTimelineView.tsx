import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CalendarEvent } from "../../api/calendar.api";
import { CATEGORY_COLOR } from "../../utils/categoryColors";
import { formatHourLabel, minutesFromMidnight, toDateKey } from "../../utils/dateGrid";
import { expandEventsInRange } from "../../utils/recurrence";

const HOUR_HEIGHT = 60;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const TIME_COL_WIDTH = 52;
const DEFAULT_DURATION_MINUTES = 60;

interface DayTimelineViewProps {
  day: Date;
  events: CalendarEvent[];
  onPressEvent: (event: CalendarEvent) => void;
}

export const DayTimelineView = ({ day, events, onPressEvent }: DayTimelineViewProps) => {
  const { i18n } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const key = toDateKey(day);

  const dayOccurrences = useMemo(() => {
    const rangeStart = new Date(day);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(day);
    rangeEnd.setHours(23, 59, 59, 999);
    return expandEventsInRange(events, rangeStart, rangeEnd);
  }, [events, day]);

  const allDayEvents = useMemo(
    () => dayOccurrences.filter((event) => event.allDay && toDateKey(new Date(event.startAt)) === key),
    [dayOccurrences, key],
  );

  const timedEvents = useMemo(
    () =>
      dayOccurrences
        .filter((event) => !event.allDay && toDateKey(new Date(event.startAt)) === key)
        .sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [dayOccurrences, key],
  );

  return (
    <View style={styles.container}>
      {allDayEvents.length > 0 && (
        <View style={styles.allDayRow}>
          {allDayEvents.map((event) => (
            <TouchableOpacity
              key={event.occurrenceId}
              style={[styles.allDayChip, { backgroundColor: CATEGORY_COLOR[event.category] }]}
              activeOpacity={0.7}
              onPress={() => onPressEvent(event)}>
              <Text numberOfLines={1} style={styles.allDayChipText}>
                {event.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView
        style={styles.hourScroll}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled>
        <View style={styles.grid}>
          <View>
            {HOURS.map((hour) => (
              <View key={hour} style={styles.hourRow}>
                <View style={{ width: TIME_COL_WIDTH }}>
                  <Text style={styles.timeLabel}>{formatHourLabel(hour, i18n.language)}</Text>
                </View>
                <View style={styles.hourLine} />
              </View>
            ))}
          </View>

          <View style={[styles.eventsLayer, { left: TIME_COL_WIDTH }]} pointerEvents="box-none">
            {timedEvents.map((event) => {
              const start = new Date(event.startAt);
              const end = event.endAt ? new Date(event.endAt) : null;
              const startMinutes = minutesFromMidnight(start);
              const endMinutes = end
                ? minutesFromMidnight(end)
                : startMinutes + DEFAULT_DURATION_MINUTES;
              const top = (startMinutes / 60) * HOUR_HEIGHT;
              const height = Math.max(22, ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT - 3);
              const color = CATEGORY_COLOR[event.category];
              const timeRange = end
                ? `${start.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" })}`
                : start.toLocaleTimeString(i18n.language, { hour: "2-digit", minute: "2-digit" });

              return (
                <TouchableOpacity
                  key={event.occurrenceId}
                  activeOpacity={0.8}
                  onPress={() => onPressEvent(event)}
                  style={[
                    styles.event,
                    { top, height, backgroundColor: `${color}40`, borderLeftColor: color },
                  ]}>
                  <Text numberOfLines={1} style={styles.eventTitle}>
                    {event.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.eventTime}>
                    {timeRange}
                    {event.location ? ` · ${event.location}` : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    allDayRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      paddingBottom: 10,
      marginBottom: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.NEUTRAL[500],
    },
    allDayChip: {
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      maxWidth: 160,
    },
    allDayChipText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.NEUTRAL[800],
    },
    hourScroll: {
      height: 480,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    grid: {
      position: "relative",
    },
    hourRow: {
      flexDirection: "row",
      height: HOUR_HEIGHT,
    },
    timeLabel: {
      color: colors.NEUTRAL[600],
      fontSize: 10,
      textAlign: "right",
      paddingRight: 8,
      marginTop: -6,
    },
    hourLine: {
      flex: 1,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: colors.NEUTRAL[500],
    },
    eventsLayer: {
      position: "absolute",
      top: 0,
      right: 4,
    },
    event: {
      position: "absolute",
      left: 0,
      right: 0,
      borderRadius: 8,
      borderLeftWidth: 3,
      paddingHorizontal: 8,
      paddingVertical: 4,
      overflow: "hidden",
    },
    eventTitle: {
      color: colors.NEUTRAL[800],
      fontSize: 12,
      fontWeight: "700",
    },
    eventTime: {
      color: colors.NEUTRAL[600],
      fontSize: 10,
      marginTop: 1,
    },
  });
