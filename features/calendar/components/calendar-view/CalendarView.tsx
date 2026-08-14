import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Calendar, CalendarProvider, LocaleConfig, Timeline, WeekCalendar } from "react-native-calendars";
import { CalendarEvent } from "../../api/calendar.api";
import { CalendarViewMode } from "../view-switcher/ViewSwitcher";

// LocaleConfig is re-exported from xdate — react-native-calendars reads month/day
// names for the grid and week views from here, keyed by language code.
LocaleConfig.locales.es = {
  monthNames: [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ],
  monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
};
LocaleConfig.locales.en = {
  monthNames: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

const CATEGORY_COLOR: Record<CalendarEvent["category"], string> = {
  anniversary: "#e6add8",
  birthday: "#f5c26b",
  date_plan: "#add8e6",
  milestone: "#d8e6ad",
  memory: "#c9b8f5",
  other: "#cfd8dc",
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimelineDateTime(date: Date) {
  return `${toDateKey(date)} ${date.toTimeString().slice(0, 8)}`;
}

interface CalendarViewProps {
  mode: CalendarViewMode;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  events: CalendarEvent[];
}

export const CalendarView = ({ mode, selectedDate, onSelectDate, events }: CalendarViewProps) => {
  const { i18n } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  useEffect(() => {
    LocaleConfig.defaultLocale = i18n.language;
  }, [i18n.language]);

  const theme = useMemo(
    () => ({
      backgroundColor: colors.NEUTRAL[200],
      calendarBackground: colors.NEUTRAL[200],
      textSectionTitleColor: colors.NEUTRAL[600],
      selectedDayBackgroundColor: colors.PRIMARY[500],
      selectedDayTextColor: "#fff",
      todayTextColor: colors.PRIMARY[500],
      dayTextColor: colors.NEUTRAL[800],
      textDisabledColor: colors.NEUTRAL[500],
      dotColor: colors.PRIMARY[500],
      selectedDotColor: "#fff",
      arrowColor: colors.PRIMARY[800],
      monthTextColor: colors.PRIMARY[800],
    }),
    [colors],
  );

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked: boolean; dotColor: string; selected?: boolean }> = {};
    for (const event of events) {
      const key = toDateKey(new Date(event.startAt));
      marks[key] = { marked: true, dotColor: colors.PRIMARY[500] };
    }
    marks[selectedDate] = { ...marks[selectedDate], marked: !!marks[selectedDate]?.marked, selected: true };
    return marks;
  }, [events, selectedDate, colors]);

  const timelineEvents = useMemo(
    () =>
      events
        .filter((event) => toDateKey(new Date(event.startAt)) === selectedDate)
        .map((event) => {
          const start = new Date(event.startAt);
          const end = event.endAt ? new Date(event.endAt) : new Date(start.getTime() + 60 * 60_000);
          return {
            id: event.id,
            start: toTimelineDateTime(start),
            end: toTimelineDateTime(end),
            title: event.title,
            color: CATEGORY_COLOR[event.category],
          };
        }),
    [events, selectedDate],
  );

  return (
    <View style={styles.container}>
      <CalendarProvider date={selectedDate} onDateChanged={onSelectDate} showTodayButton>
        {mode === "month" && (
          <Calendar
            current={selectedDate}
            markedDates={markedDates}
            onDayPress={(day) => onSelectDate(day.dateString)}
            theme={theme}
            firstDay={1}
          />
        )}
        {mode === "week" && (
          <WeekCalendar
            firstDay={1}
            markedDates={markedDates}
            onDayPress={(day) => onSelectDate(day.dateString)}
            theme={theme}
          />
        )}
        {mode === "day" && (
          <Timeline
            date={selectedDate}
            events={timelineEvents}
            start={6}
            end={23}
            format24h
            scrollToFirst
            showNowIndicator
            theme={theme}
          />
        )}
      </CalendarProvider>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.NEUTRAL[200],
      borderRadius: 20,
      overflow: "hidden",
    },
  });
