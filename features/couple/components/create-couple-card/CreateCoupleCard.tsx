import { ThemeColors } from "@/constants/colors";
import { Button, Card, getErrorMessage, Title } from "@/features/common";
import { useThemeColors } from "@/features/theme";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { createCouple } from "../../api/couple.api";
import { coupleKeys } from "../../api/queryKeys";

// The active i18n language ("es" | "en") doubles as a valid BCP 47 locale tag for
// toLocaleDateString/toLocaleString, so it's used directly rather than mapping to
// region-specific tags (es-ES, en-US) we don't otherwise need.
const formatDate = (date: Date, locale: string) =>
  date.toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" });

const formatDateTime = (date: Date, locale: string) =>
  date.toLocaleString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const CreateCoupleCard = () => {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createCouple,
    onSuccess: () => {
      setCopied(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: coupleKeys.me() });
    },
  });

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    // On Android the picker is a modal that has to be closed manually.
    if (Platform.OS !== "ios") setShowPicker(false);
    if (event.type === "set" && selected) setStartDate(selected);
  };

  const handleCreate = () => {
    if (!startDate) return;
    mutation.reset();
    mutation.mutate({ startDate: startDate.toISOString() });
  };

  const handleCopy = async () => {
    if (!mutation.data) return;
    await Clipboard.setStringAsync(mutation.data.code);
    setCopied(true);
    Haptics.selectionAsync();
  };

  return (
    <Card cardStyles={styles.card}>
      <Ionicons name="heart-circle" size={44} color={colors.PRIMARY[500]} />
      <Title title={t("couple.create.title")} variant="h3" align="center" style={styles.title} />

      {mutation.data ? (
        <View style={styles.codeSection}>
          <Text style={styles.helper}>{t("couple.create.shareHint")}</Text>
          <Text style={styles.code}>{mutation.data.code}</Text>
          <Text style={styles.expiresAt}>
            {t("couple.create.validUntil", {
              date: formatDateTime(new Date(mutation.data.expiresAt), i18n.language),
            })}
          </Text>
          <Text style={styles.waitingHint}>{t("couple.create.waitingHint")}</Text>
          <Button
            title={copied ? t("couple.create.copied") : t("couple.create.copy")}
            leftIcon={copied ? "checkmark" : "copy-outline"}
            variant={copied ? "outline" : "primary"}
            fullWidth
            onPress={handleCopy}
          />
        </View>
      ) : (
        <>
          <Text style={styles.helper}>{t("couple.create.whenStarted")}</Text>
          <TouchableOpacity
            style={styles.dateField}
            activeOpacity={0.7}
            onPress={() => setShowPicker(true)}>
            <Ionicons name="calendar-outline" size={20} color={colors.SECONDARY[500]} />
            <Text style={[styles.dateText, !startDate && styles.datePlaceholder]}>
              {startDate ? formatDate(startDate, i18n.language) : t("couple.create.selectDate")}
            </Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={startDate ?? new Date()}
              mode="date"
              maximumDate={new Date()}
              onChange={handleDateChange}
            />
          )}

          {mutation.error && (
            <Text style={styles.errorText}>{getErrorMessage(mutation.error, t)}</Text>
          )}

          <Button
            title={t("couple.create.submit")}
            leftIcon="link"
            fullWidth
            isLoading={mutation.isPending}
            disabled={!startDate || mutation.isPending}
            onPress={handleCreate}
            style={styles.createButton}
          />
        </>
      )}
    </Card>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      alignItems: "center",
    },
    title: {
      marginTop: 8,
      marginBottom: 16,
      color: colors.PRIMARY[800],
    },
    helper: {
      fontSize: 14,
      color: colors.NEUTRAL[800],
      textAlign: "center",
      marginBottom: 12,
    },
    dateField: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      width: "100%",
      borderWidth: 1.5,
      borderColor: colors.SECONDARY[200],
      borderRadius: 25,
      backgroundColor: colors.NEUTRAL[500],
      paddingHorizontal: 16,
      minHeight: 50,
      marginBottom: 20,
    },
    dateText: {
      fontSize: 16,
      color: colors.NEUTRAL[800],
    },
    datePlaceholder: {
      color: colors.NEUTRAL[600],
    },
    createButton: {
      marginTop: 4,
    },
    codeSection: {
      width: "100%",
      alignItems: "center",
    },
    code: {
      fontSize: 32,
      fontWeight: "700",
      letterSpacing: 6,
      color: colors.PRIMARY[500],
      marginBottom: 8,
    },
    expiresAt: {
      fontSize: 12,
      color: colors.NEUTRAL[600],
      marginBottom: 8,
    },
    waitingHint: {
      fontSize: 13,
      color: colors.SECONDARY[800],
      fontStyle: "italic",
      marginBottom: 20,
    },
    errorText: {
      fontSize: 12,
      color: colors.ERROR[500],
      textAlign: "center",
      marginBottom: 12,
    },
  });
