import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from "react-native-reanimated";
import { CalendarEvent } from "../../api/calendar.api";
import {
  addDays,
  addMonths,
  fromDateKey,
  getWeekDays,
  startOfWeek,
  toDateKey,
} from "../../utils/dateGrid";
import { CalendarViewMode } from "../view-switcher/ViewSwitcher";
import { DayTimelineView } from "./DayTimelineView";
import { MonthGridView } from "./MonthGridView";
import { WeekTimelineView } from "./WeekTimelineView";

const SWIPE_DISTANCE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 500;
const SLIDE_DURATION = 220;

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

  const previousModeRef = useRef(mode);
  const previousDateRef = useRef(selectedDate);
  const isModeChange = previousModeRef.current !== mode;
  const direction = fromDateKey(selectedDate) >= fromDateKey(previousDateRef.current) ? 1 : -1;
  previousModeRef.current = mode;
  previousDateRef.current = selectedDate;

  const entering = isModeChange
    ? undefined
    : (direction > 0 ? SlideInRight : SlideInLeft).duration(SLIDE_DURATION);
  const exiting = isModeChange
    ? undefined
    : (direction > 0 ? SlideOutLeft : SlideOutRight).duration(SLIDE_DURATION);
  const periodKey =
    mode === "month"
      ? `${anchor.getFullYear()}-${anchor.getMonth()}`
      : mode === "week"
        ? toDateKey(startOfWeek(anchor))
        : selectedDate;

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .onEnd((event) => {
      const isSwipe =
        Math.abs(event.translationX) > SWIPE_DISTANCE_THRESHOLD ||
        Math.abs(event.velocityX) > SWIPE_VELOCITY_THRESHOLD;
      if (!isSwipe) return;
      runOnJS(shift)(event.translationX > 0 ? -1 : 1);
    });

  return (
    <GestureHandlerRootView style={styles.container}>
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

      <GestureDetector gesture={swipeGesture} touchAction="pan-y">
        <View style={styles.slideClip}>
          {mode === "month" && (
            <Animated.View key={periodKey} entering={entering} exiting={exiting}>
              <MonthGridView
                month={anchor}
                events={events}
                selectedDate={selectedDate}
                onSelectDay={onSelectDate}
              />
            </Animated.View>
          )}
          {mode === "week" && (
            <Animated.View key={periodKey} entering={entering} exiting={exiting}>
              <WeekTimelineView
                weekAnchor={anchor}
                events={events}
                selectedDate={selectedDate}
                onSelectDay={onSelectDate}
              />
            </Animated.View>
          )}
          {mode === "day" && (
            <Animated.View key={periodKey} entering={entering} exiting={exiting}>
              <DayTimelineView day={anchor} events={events} onPressEvent={onPressEvent} />
            </Animated.View>
          )}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
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
    slideClip: {
      overflow: "hidden",
    },
  });
