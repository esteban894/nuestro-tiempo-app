import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CalendarEvent } from "../../api/calendar.api";
import { CATEGORY_COLOR } from "../../utils/categoryColors";
import { getMonthGrid, getWeekdayShortNames, isToday, toDateKey } from "../../utils/dateGrid";
import { expandEventsInRange } from "../../utils/recurrence";

const MAX_DOTS = 3;

interface MonthGridViewProps {
  month: Date;
  events: CalendarEvent[];
  selectedDate: string;
  onSelectDay: (dateKey: string) => void;
}

export const MonthGridView = ({ month, events, selectedDate, onSelectDay }: MonthGridViewProps) => {
  const { i18n } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const grid = useMemo(() => getMonthGrid(month), [month]);
  const weekdayNames = useMemo(() => getWeekdayShortNames(i18n.language), [i18n.language]);
  const monthIndex = month.getMonth();

  const weeks = Array.from({ length: grid.length / 7 }, (_, i) => grid.slice(i * 7, i * 7 + 7));

  const eventsByDay = useMemo(() => {
    const rangeStart = grid[0];
    const rangeEnd = new Date(grid[grid.length - 1]);
    rangeEnd.setHours(23, 59, 59, 999);
    const occurrences = expandEventsInRange(events, rangeStart, rangeEnd);

    const map = new Map<string, typeof occurrences>();
    for (const event of occurrences) {
      const key = toDateKey(new Date(event.startAt));
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [events, grid]);

  return (
    <View style={styles.container}>
      <View style={styles.weekRow}>
        {weekdayNames.map((name, index) => (
          <Text key={index} style={styles.weekday}>
            {name}
          </Text>
        ))}
      </View>
      {weeks.map((week) => (
        <View key={toDateKey(week[0])} style={styles.weekCells}>
          {week.map((day) => {
            const key = toDateKey(day);
            const inMonth = day.getMonth() === monthIndex;
            const today = isToday(day);
            const selected = key === selectedDate;
            const dayEvents = eventsByDay.get(key) ?? [];

            return (
              <TouchableOpacity
                key={key}
                style={styles.cell}
                activeOpacity={0.7}
                onPress={() => onSelectDay(key)}>
                <View
                  style={[
                    styles.dayWrap,
                    today && styles.todayWrap,
                    selected && !today && styles.selectedWrap,
                  ]}>
                  <Text
                    style={[
                      styles.dayNum,
                      !inMonth && styles.dayNumFaded,
                      (today || selected) && styles.dayNumOnFill,
                    ]}>
                    {day.getDate()}
                  </Text>
                </View>
                <View style={styles.dotRow}>
                  {dayEvents.slice(0, MAX_DOTS).map((event) => (
                    <View
                      key={event.occurrenceId}
                      style={[styles.eventDot, { backgroundColor: CATEGORY_COLOR[event.category] }]}
                    />
                  ))}
                  {dayEvents.length > MAX_DOTS ? (
                    <Text style={styles.more}>+{dayEvents.length - MAX_DOTS}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      paddingVertical: 8,
    },
    weekRow: {
      flexDirection: "row",
      marginBottom: 6,
    },
    weekday: {
      flex: 1,
      textAlign: "center",
      color: colors.NEUTRAL[600],
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
    },
    weekCells: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    cell: {
      flex: 1,
      aspectRatio: 0.82,
      alignItems: "center",
      paddingTop: 4,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: colors.NEUTRAL[500],
    },
    dayWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    todayWrap: {
      backgroundColor: colors.PRIMARY[500],
    },
    selectedWrap: {
      backgroundColor: colors.SECONDARY[500],
    },
    dayNum: {
      color: colors.NEUTRAL[800],
      fontSize: 14,
    },
    dayNumFaded: {
      color: colors.NEUTRAL[600],
    },
    dayNumOnFill: {
      color: colors.WHITE,
      fontWeight: "700",
    },
    dotRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      marginTop: 4,
      minHeight: 8,
    },
    eventDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    more: {
      color: colors.NEUTRAL[600],
      fontSize: 8,
      marginLeft: 1,
    },
  });
