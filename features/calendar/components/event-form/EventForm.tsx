import { ThemeColors } from "@/constants/colors";
import { Button, Checkbox, Input, SegmentedControl } from "@/features/common";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { ComponentProps, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  CalendarEventCategory,
  CalendarEventPayload,
  CalendarEventRecurrence,
  CalendarEventType,
} from "../../api/calendar.api";
import { CATEGORIES_BY_TYPE } from "../../utils/categoriesByType";
import { EventErrors, validateEventForm } from "../../validation";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

const CATEGORY_ICONS: Record<CalendarEventCategory, IoniconsName> = {
  date_plan: "cafe",
  anniversary: "heart",
  birthday: "gift",
  milestone: "flag",
  memory: "images",
  other: "calendar-outline",
};

const CATEGORY_ORDER: CalendarEventCategory[] = [
  "date_plan",
  "anniversary",
  "birthday",
  "milestone",
  "memory",
  "other",
];

const formatDate = (date: Date, locale: string) =>
  date.toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" });

const formatTime = (date: Date, locale: string) =>
  date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

function mergeDate(base: Date | null, date: Date) {
  const next = new Date(date);
  if (base) next.setHours(base.getHours(), base.getMinutes(), 0, 0);
  return next;
}

function mergeTime(base: Date | null, time: Date) {
  const next = base ? new Date(base) : new Date();
  next.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return next;
}

export interface EventFormInitialValues {
  type?: CalendarEventType;
  category?: CalendarEventCategory;
  title?: string;
  description?: string;
  location?: string;
  startAt?: string;
  endAt?: string;
  allDay?: boolean;
  recurrence?: CalendarEventRecurrence;
  reminderMinutesBefore?: number | null;
}

interface EventFormProps {
  initialValues?: EventFormInitialValues;
  onSubmit: (payload: CalendarEventPayload) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  error?: string | null;
}

export const EventForm = ({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  error,
}: EventFormProps) => {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const TYPE_OPTIONS = [
    { label: t("calendar.form.typeAppointment"), value: "appointment" },
    { label: t("calendar.form.typeImportantDate"), value: "important_date" },
  ];

  const RECURRENCE_OPTIONS = [
    { label: t("calendar.form.recurrenceNone"), value: "none" },
    { label: t("calendar.form.recurrenceYearly"), value: "yearly" },
    { label: t("calendar.form.recurrenceMonthly"), value: "monthly" },
  ];

  const REMINDER_OPTIONS = [
    { label: t("calendar.form.reminder15"), value: "15" },
    { label: t("calendar.form.reminder60"), value: "60" },
    { label: t("calendar.form.reminder1440"), value: "1440" },
  ];

  const CATEGORY_LABELS: Record<CalendarEventCategory, string> = {
    date_plan: t("calendar.form.category.datePlan"),
    anniversary: t("calendar.form.category.anniversary"),
    birthday: t("calendar.form.category.birthday"),
    milestone: t("calendar.form.category.milestone"),
    memory: t("calendar.form.category.memory"),
    other: t("calendar.form.category.other"),
  };

  const [type, setType] = useState<CalendarEventType>(initialValues?.type ?? "appointment");
  const [category, setCategory] = useState<CalendarEventCategory>(
    initialValues?.category ?? "date_plan",
  );
  const allowedCategories = CATEGORIES_BY_TYPE[type];

  const handleTypeChange = (value: CalendarEventType) => {
    setType(value);
    if (!CATEGORIES_BY_TYPE[value].includes(category)) {
      setCategory(CATEGORIES_BY_TYPE[value][0]);
    }
  };
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [allDay, setAllDay] = useState(initialValues?.allDay ?? false);
  const [startAt, setStartAt] = useState<Date | null>(
    initialValues?.startAt ? new Date(initialValues.startAt) : null,
  );
  const [hasEnd, setHasEnd] = useState(!!initialValues?.endAt);
  const [endAt, setEndAt] = useState<Date | null>(
    initialValues?.endAt ? new Date(initialValues.endAt) : null,
  );
  const [recurrence, setRecurrence] = useState<CalendarEventRecurrence>(
    initialValues?.recurrence ?? "none",
  );
  const [reminderEnabled, setReminderEnabled] = useState(
    initialValues?.reminderMinutesBefore != null,
  );
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(
    String(initialValues?.reminderMinutesBefore ?? 60),
  );
  const [errors, setErrors] = useState<EventErrors>({});

  const [picker, setPicker] = useState<"startDate" | "startTime" | "endDate" | "endTime" | null>(
    null,
  );

  const closePickerIfAndroid = () => {
    if (Platform.OS !== "ios") setPicker(null);
  };

  const handlePickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    closePickerIfAndroid();
    if (event.type !== "set" || !selected) return;

    if (picker === "startDate") setStartAt((prev) => mergeDate(prev, selected));
    if (picker === "startTime") setStartAt((prev) => mergeTime(prev, selected));
    if (picker === "endDate") setEndAt((prev) => mergeDate(prev, selected));
    if (picker === "endTime") setEndAt((prev) => mergeTime(prev, selected));
  };

  const handleSubmit = () => {
    const values = {
      type,
      category,
      title,
      description,
      location,
      startAt: startAt ?? undefined,
      endAt: hasEnd ? (endAt ?? undefined) : undefined,
      allDay,
      recurrence,
      reminderMinutesBefore: reminderEnabled ? Number(reminderMinutesBefore) : undefined,
    };

    const validationErrors = validateEventForm(values as never);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0 || !startAt) return;

    onSubmit({
      type,
      category,
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      startAt: startAt.toISOString(),
      endAt: hasEnd && endAt ? endAt.toISOString() : undefined,
      allDay,
      recurrence,
      reminderMinutesBefore: reminderEnabled ? Number(reminderMinutesBefore) : undefined,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SegmentedControl
        options={TYPE_OPTIONS}
        value={type}
        onChange={(value) => handleTypeChange(value as CalendarEventType)}
        style={styles.field}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.field}>
        {CATEGORY_ORDER.filter((value) => allowedCategories.includes(value)).map((value) => {
          const isActive = value === category;
          return (
            <TouchableOpacity
              key={value}
              style={[styles.chip, isActive && styles.chipActive]}
              activeOpacity={0.7}
              onPress={() => setCategory(value)}>
              <Ionicons
                name={CATEGORY_ICONS[value]}
                size={16}
                color={isActive ? "#fff" : colors.NEUTRAL[800]}
              />
              <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                {CATEGORY_LABELS[value]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Input
        label={t("calendar.form.titleLabel")}
        placeholder={t("calendar.form.titlePlaceholder")}
        value={title}
        onChangeText={setTitle}
        error={errors.title ? t(errors.title) : undefined}
      />

      <Input
        label={t("calendar.form.descriptionLabel")}
        placeholder={t("calendar.form.descriptionPlaceholder")}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Input
        label={t("calendar.form.locationLabel")}
        placeholder={t("calendar.form.locationPlaceholder")}
        leftIcon="location-outline"
        value={location}
        onChangeText={setLocation}
      />

      <Checkbox
        checked={allDay}
        onChange={setAllDay}
        label={t("calendar.form.allDay")}
        style={styles.checkbox}
      />

      <Text style={styles.label}>{t("calendar.form.startLabel")}</Text>
      <View style={styles.dateRow}>
        <TouchableOpacity
          style={[styles.dateField, styles.dateFieldFlex]}
          activeOpacity={0.7}
          onPress={() => setPicker("startDate")}>
          <Ionicons name="calendar-outline" size={18} color={colors.SECONDARY[500]} />
          <Text style={[styles.dateText, !startAt && styles.datePlaceholder]} numberOfLines={1}>
            {startAt ? formatDate(startAt, i18n.language) : t("calendar.form.selectDate")}
          </Text>
        </TouchableOpacity>
        {!allDay && (
          <TouchableOpacity
            style={[styles.dateField, styles.timeField]}
            activeOpacity={0.7}
            onPress={() => setPicker("startTime")}>
            <Text style={[styles.dateText, !startAt && styles.datePlaceholder]}>
              {startAt ? formatTime(startAt, i18n.language) : "--:--"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {errors.startAt && <Text style={styles.errorText}>{t(errors.startAt)}</Text>}

      <Checkbox
        checked={hasEnd}
        onChange={setHasEnd}
        label={t("calendar.form.addEnd")}
        style={styles.checkbox}
      />

      {hasEnd && (
        <>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={[styles.dateField, styles.dateFieldFlex]}
              activeOpacity={0.7}
              onPress={() => setPicker("endDate")}>
              <Ionicons name="calendar-outline" size={18} color={colors.SECONDARY[500]} />
              <Text style={[styles.dateText, !endAt && styles.datePlaceholder]} numberOfLines={1}>
                {endAt ? formatDate(endAt, i18n.language) : t("calendar.form.selectDate")}
              </Text>
            </TouchableOpacity>
            {!allDay && (
              <TouchableOpacity
                style={[styles.dateField, styles.timeField]}
                activeOpacity={0.7}
                onPress={() => setPicker("endTime")}>
                <Text style={[styles.dateText, !endAt && styles.datePlaceholder]}>
                  {endAt ? formatTime(endAt, i18n.language) : "--:--"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {errors.endAt && <Text style={styles.errorText}>{t(errors.endAt)}</Text>}
        </>
      )}

      {picker && (
        <DateTimePicker
          value={(picker === "startDate" || picker === "startTime" ? startAt : endAt) ?? new Date()}
          mode={picker === "startDate" || picker === "endDate" ? "date" : "time"}
          onChange={handlePickerChange}
        />
      )}

      <Text style={styles.label}>{t("calendar.form.recurrenceLabel")}</Text>
      <SegmentedControl
        options={RECURRENCE_OPTIONS}
        value={recurrence}
        onChange={(value) => setRecurrence(value as CalendarEventRecurrence)}
        style={styles.field}
      />

      <Checkbox
        checked={reminderEnabled}
        onChange={setReminderEnabled}
        label={t("calendar.form.reminder")}
        style={styles.checkbox}
      />

      {reminderEnabled && (
        <SegmentedControl
          options={REMINDER_OPTIONS}
          value={reminderMinutesBefore}
          onChange={setReminderMinutesBefore}
          style={styles.field}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Button
        title={submitLabel ?? t("calendar.form.defaultSubmit")}
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        disabled={isSubmitting}
        onPress={handleSubmit}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 20,
    },
    field: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.NEUTRAL[800],
      marginBottom: 8,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.NEUTRAL[500],
      marginRight: 8,
    },
    chipActive: {
      backgroundColor: colors.PRIMARY[500],
    },
    chipLabel: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.NEUTRAL[800],
    },
    chipLabelActive: {
      color: "#fff",
    },
    checkbox: {
      marginBottom: 20,
    },
    dateRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 4,
    },
    dateField: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1.5,
      borderColor: colors.SECONDARY[200],
      borderRadius: 25,
      backgroundColor: colors.NEUTRAL[500],
      paddingHorizontal: 16,
      minHeight: 50,
    },
    dateFieldFlex: {
      flex: 1,
    },
    timeField: {
      width: 110,
      justifyContent: "center",
      paddingHorizontal: 12,
    },
    dateText: {
      fontSize: 15,
      color: colors.NEUTRAL[800],
      flexShrink: 1,
    },
    datePlaceholder: {
      color: colors.NEUTRAL[600],
    },
    errorText: {
      fontSize: 12,
      color: colors.ERROR[500],
      marginBottom: 16,
    },
    submitButton: {
      marginTop: 4,
    },
  });
