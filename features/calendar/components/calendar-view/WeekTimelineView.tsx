import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CalendarEvent } from "../../api/calendar.api";
import { CATEGORY_COLOR } from "../../utils/categoryColors";
import {
  formatHourLabel,
  getWeekDays,
  getWeekdayShortNames,
  isToday,
  minutesFromMidnight,
  toDateKey,
} from "../../utils/dateGrid";
import { eventDateKey } from "../../utils/eventZone";
import { expandEventsInRange } from "../../utils/recurrence";

const HOUR_HEIGHT = 52;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const TIME_COL_WIDTH = 40;
const DEFAULT_DURATION_MINUTES = 60;

interface WeekTimelineViewProps {
  weekAnchor: Date;
  events: CalendarEvent[];
  selectedDate: string;
  onSelectDay: (dateKey: string) => void;
}

export const WeekTimelineView = ({
  weekAnchor,
  events,
  selectedDate,
  onSelectDay,
}: WeekTimelineViewProps) => {
  const { i18n } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const days = useMemo(() => getWeekDays(weekAnchor), [weekAnchor]);
  const weekdayNames = useMemo(() => getWeekdayShortNames(i18n.language), [i18n.language]);

  const { timedByDay, allDayByDay } = useMemo(() => {
    const rangeStart = days[0];
    const rangeEnd = new Date(days[days.length - 1]);
    rangeEnd.setHours(23, 59, 59, 999);
    const occurrences = expandEventsInRange(events, rangeStart, rangeEnd);

    const timed = new Map<string, typeof occurrences>();
    const allDay = new Map<string, typeof occurrences>();
    for (const event of occurrences) {
      const key = eventDateKey(event);
      const bucket = event.allDay ? allDay : timed;
      const list = bucket.get(key) ?? [];
      list.push(event);
      bucket.set(key, list);
    }
    return { timedByDay: timed, allDayByDay: allDay };
  }, [events, days]);

  const hasAllDay = allDayByDay.size > 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ width: TIME_COL_WIDTH }} />
        {days.map((day) => {
          const key = toDateKey(day);
          const today = isToday(day);
          const selected = key === selectedDate;
          return (
            <TouchableOpacity
              key={key}
              style={styles.dayHeader}
              onPress={() => onSelectDay(key)}
              activeOpacity={0.7}>
              <Text style={styles.dayHeaderWeekday}>{weekdayNames[day.getDay()]}</Text>
              <View
                style={[
                  styles.dayHeaderNumWrap,
                  today && styles.dayHeaderFill,
                  selected && !today && styles.dayHeaderFillSelected,
                ]}>
                <Text
                  style={[styles.dayHeaderNum, (today || selected) && styles.dayHeaderNumOnFill]}>
                  {day.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {hasAllDay && (
        <View style={styles.allDayRow}>
          <View style={{ width: TIME_COL_WIDTH }} />
          {days.map((day) => {
            const key = toDateKey(day);
            const dayAllDayEvents = allDayByDay.get(key) ?? [];
            return (
              <View key={key} style={styles.allDayColumn}>
                {dayAllDayEvents.map((event) => (
                  <View
                    key={event.occurrenceId}
                    style={[styles.allDayChip, { backgroundColor: CATEGORY_COLOR[event.category] }]}>
                    <Text numberOfLines={1} style={styles.allDayChipText}>
                      {event.title}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      )}

      <ScrollView
        style={styles.hourScroll}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled>
        <View style={styles.gridRow}>
          <View style={{ width: TIME_COL_WIDTH }}>
            {HOURS.map((hour) => (
              <View key={hour} style={{ height: HOUR_HEIGHT }}>
                <Text style={styles.timeLabel}>{formatHourLabel(hour, i18n.language)}</Text>
              </View>
            ))}
          </View>

          {days.map((day) => {
            const key = toDateKey(day);
            const dayEvents = timedByDay.get(key) ?? [];
            return (
              <View key={key} style={styles.dayColumn}>
                {HOURS.map((hour) => (
                  <View key={hour} style={styles.hourCell} />
                ))}
                {dayEvents.map((event) => {
                  const start = new Date(event.startAt);
                  const end = event.endAt ? new Date(event.endAt) : null;
                  const startMinutes = minutesFromMidnight(start);
                  const endMinutes = end
                    ? minutesFromMidnight(end)
                    : startMinutes + DEFAULT_DURATION_MINUTES;
                  const top = (startMinutes / 60) * HOUR_HEIGHT;
                  const height = Math.max(14, ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT - 2);
                  const color = CATEGORY_COLOR[event.category];

                  return (
                    <View
                      key={event.occurrenceId}
                      style={[
                        styles.event,
                        { top, height, backgroundColor: `${color}55`, borderLeftColor: color },
                      ]}>
                      <Text numberOfLines={1} style={styles.eventText}>
                        {event.title}
                      </Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
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
    headerRow: {
      flexDirection: "row",
      paddingBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.NEUTRAL[500],
    },
    dayHeader: {
      flex: 1,
      alignItems: "center",
      gap: 2,
    },
    dayHeaderWeekday: {
      color: colors.NEUTRAL[600],
      fontSize: 10,
      fontWeight: "600",
      textTransform: "uppercase",
    },
    dayHeaderNumWrap: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    dayHeaderFill: {
      backgroundColor: colors.PRIMARY[500],
    },
    dayHeaderFillSelected: {
      backgroundColor: colors.SECONDARY[500],
    },
    dayHeaderNum: {
      color: colors.NEUTRAL[800],
      fontSize: 13,
      fontWeight: "600",
    },
    dayHeaderNumOnFill: {
      color: colors.WHITE,
    },
    allDayRow: {
      flexDirection: "row",
      paddingVertical: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.NEUTRAL[500],
    },
    allDayColumn: {
      flex: 1,
      gap: 2,
      paddingHorizontal: 2,
    },
    allDayChip: {
      borderRadius: 4,
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    allDayChipText: {
      fontSize: 9,
      fontWeight: "600",
      color: colors.NEUTRAL[800],
    },
    hourScroll: {
      height: 420,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    gridRow: {
      flexDirection: "row",
    },
    timeLabel: {
      color: colors.NEUTRAL[600],
      fontSize: 9,
      textAlign: "right",
      paddingRight: 6,
      marginTop: -5,
    },
    dayColumn: {
      flex: 1,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderColor: colors.NEUTRAL[500],
    },
    hourCell: {
      height: HOUR_HEIGHT,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.NEUTRAL[500],
    },
    event: {
      position: "absolute",
      left: 1,
      right: 1,
      borderRadius: 4,
      borderLeftWidth: 2,
      paddingHorizontal: 3,
      paddingVertical: 1,
      overflow: "hidden",
    },
    eventText: {
      color: colors.NEUTRAL[800],
      fontSize: 9,
      fontWeight: "600",
    },
  });
