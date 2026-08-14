import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CalendarEvent } from "../../api/calendar.api";
import { addDays, addMonths, fromDateKey, getWeekDays, toDateKey } from "../../utils/dateGrid";
import { CalendarViewMode } from "../view-switcher/ViewSwitcher";
import { DayTimelineView } from "./DayTimelineView";
import { MonthGridView } from "./MonthGridView";
import { WeekTimelineView } from "./WeekTimelineView";

interface CalendarViewProps {
  mode: CalendarViewMode;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onPressEvent: (event: CalendarEvent) => void;
  events: CalendarEvent[];
}

export const CalendarView = ({
  mode,
  selectedDate,
  onSelectDate,
  onPressEvent,
  events,
}: CalendarViewProps) => {
  const { i18n } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const anchor = fromDateKey(selectedDate);

  const shift = (direction: number) => {
    if (mode === "month") return onSelectDate(toDateKey(addMonths(anchor, direction)));
    if (mode === "week") return onSelectDate(toDateKey(addDays(anchor, direction * 7)));
    return onSelectDate(toDateKey(addDays(anchor, direction)));
  };

  const headerTitle = getHeaderTitle(mode, anchor, i18n.language);

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => shift(-1)} hitSlop={12} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.PRIMARY[800]} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onSelectDate(toDateKey(new Date()))}
          activeOpacity={0.7}
          style={styles.navTitleWrap}>
          <Text style={styles.navTitle} numberOfLines={1}>
            {headerTitle}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => shift(1)} hitSlop={12} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={20} color={colors.PRIMARY[800]} />
        </TouchableOpacity>
      </View>

      {mode === "month" && (
        <MonthGridView
          month={anchor}
          events={events}
          selectedDate={selectedDate}
          onSelectDay={onSelectDate}
        />
      )}
      {mode === "week" && (
        <WeekTimelineView
          weekAnchor={anchor}
          events={events}
          selectedDate={selectedDate}
          onSelectDay={onSelectDate}
        />
      )}
      {mode === "day" && (
        <DayTimelineView day={anchor} events={events} onPressEvent={onPressEvent} />
      )}
    </View>
  );
};

function getHeaderTitle(mode: CalendarViewMode, anchor: Date, locale: string): string {
  if (mode === "month") {
    return anchor.toLocaleDateString(locale, { month: "long", year: "numeric" });
  }

  if (mode === "day") {
    return anchor.toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" });
  }

  const days = getWeekDays(anchor);
  const first = days[0];
  const last = days[6];
  const sameMonth = first.getMonth() === last.getMonth();
  const firstLabel = first.toLocaleDateString(locale, {
    day: "numeric",
    month: sameMonth ? undefined : "short",
  });
  const lastLabel = last.toLocaleDateString(locale, { day: "numeric", month: "short" });
  return `${firstLabel} – ${lastLabel}`;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.NEUTRAL[200],
      borderRadius: 20,
      padding: 12,
    },
    navRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    navBtn: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    navTitleWrap: {
      flex: 1,
      alignItems: "center",
    },
    navTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.PRIMARY[800],
      textTransform: "capitalize",
    },
  });
