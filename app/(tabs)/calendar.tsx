import { ThemeColors } from "@/constants/colors";
import { useAuthStore } from "@/features/auth";
import {
  CalendarEvent,
  CalendarView,
  CalendarViewMode,
  EventList,
  expandEventsInRange,
  fromDateKey,
  MemberFilter,
  MemberFilterValue,
  MEMBER_FILTER_ALL,
  toDateKey,
  useEventsQuery,
  ViewSwitcher,
} from "@/features/calendar";
import { Skeleton, Title } from "@/features/common";
import { NoCoupleBanner, useCoupleQuery } from "@/features/couple";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";

export default function CalendarScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const router = useRouter();
  const currentUserId = useAuthStore((state) => state.user?.id);

  const { data: couple, isLoading: isLoadingCouple } = useCoupleQuery();
  const {
    data: events,
    isLoading: isLoadingEvents,
    refetch: refetchEvents,
  } = useEventsQuery();

  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [memberFilter, setMemberFilter] = useState<MemberFilterValue>(MEMBER_FILTER_ALL);
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchEvents();
    setIsRefreshing(false);
  };

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (memberFilter === MEMBER_FILTER_ALL) return events;
    return events.filter((event) => event.createdBy === memberFilter);
  }, [events, memberFilter]);

  const eventsForSelectedDay = useMemo(() => {
    const dayStart = fromDateKey(selectedDate);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    return expandEventsInRange(filteredEvents, dayStart, dayEnd);
  }, [filteredEvents, selectedDate]);

  const handlePressEvent = (event: CalendarEvent) => {
    router.push({ pathname: "/calendar/[id]", params: { id: event.id } });
  };

  if (isLoadingCouple) {
    return (
      <View style={[styles.container, styles.contentContainer]}>
        <Skeleton width="100%" height={40} borderRadius={20} style={styles.skeletonGap} />
        <Skeleton width="100%" height={320} borderRadius={20} style={styles.skeletonGap} />
        <Skeleton width="100%" height={80} borderRadius={16} />
      </View>
    );
  }

  if (!couple || !couple.user2) {
    return (
      <View style={[styles.container, styles.contentContainer, styles.emptyContainer]}>
        <NoCoupleBanner />
      </View>
    );
  }

  const partner = couple.user1.id === currentUserId ? couple.user2 : couple.user1;
  const me = couple.user1.id === currentUserId ? couple.user1 : couple.user2;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.PRIMARY[500]}
          colors={[colors.PRIMARY[500]]}
        />
      }>
      <View style={styles.headerRow}>
        <Title title={t("calendar.screenTitle")} variant="h2" />
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/calendar/new")}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t("calendar.newEventA11y")}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      <ViewSwitcher value={viewMode} onChange={setViewMode} />
      <View style={styles.gap} />

      <MemberFilter
        value={memberFilter}
        onChange={setMemberFilter}
        meId={me.id}
        partnerId={partner.id}
        partnerLabel={partner.name}
      />
      <View style={styles.gap} />

      {isLoadingEvents ? (
        <Skeleton width="100%" height={320} borderRadius={20} />
      ) : (
        <CalendarView
          mode={viewMode}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onPressEvent={handlePressEvent}
          events={filteredEvents}
        />
      )}

      <View style={styles.gap} />

      <EventList
        events={eventsForSelectedDay}
        currentUserId={currentUserId}
        onPressEvent={handlePressEvent}
      />
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.NEUTRAL[200],
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    emptyContainer: {
      justifyContent: "center",
      flexGrow: 1,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.PRIMARY[500],
    },
    gap: {
      height: 16,
    },
    skeletonGap: {
      marginBottom: 16,
    },
  });
