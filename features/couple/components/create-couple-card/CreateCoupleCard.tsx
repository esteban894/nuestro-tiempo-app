import { ThemeColors } from "@/constants/colors";
import { Button, Card, Title } from "@/features/common";
import { useThemeColors } from "@/features/theme";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { createCouple } from "../../api/couple.api";
import { coupleKeys } from "../../api/queryKeys";

const formatDate = (date: Date) =>
  date.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });

const formatDateTime = (date: Date) =>
  date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const CreateCoupleCard = () => {
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
    // En Android el picker es un modal que hay que cerrar manualmente.
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
      <Title title="Crear pareja" variant="h3" align="center" style={styles.title} />

      {mutation.data ? (
        <View style={styles.codeSection}>
          <Text style={styles.helper}>Comparte este código con tu pareja:</Text>
          <Text style={styles.code}>{mutation.data.code}</Text>
          <Text style={styles.expiresAt}>
            Válido hasta {formatDateTime(new Date(mutation.data.expiresAt))}
          </Text>
          <Text style={styles.waitingHint}>Esperando a que tu pareja se una…</Text>
          <Button
            title={copied ? "¡Copiado!" : "Copiar código"}
            leftIcon={copied ? "checkmark" : "copy-outline"}
            variant={copied ? "outline" : "primary"}
            fullWidth
            onPress={handleCopy}
          />
        </View>
      ) : (
        <>
          <Text style={styles.helper}>¿Cuándo empezó su historia juntos?</Text>
          <TouchableOpacity
            style={styles.dateField}
            activeOpacity={0.7}
            onPress={() => setShowPicker(true)}>
            <Ionicons name="calendar-outline" size={20} color={colors.SECONDARY[500]} />
            <Text style={[styles.dateText, !startDate && styles.datePlaceholder]}>
              {startDate ? formatDate(startDate) : "Selecciona una fecha"}
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

          {mutation.error && <Text style={styles.errorText}>{mutation.error.message}</Text>}

          <Button
            title="Crear vínculo"
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
      color: colors.SECONDARY[500],
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
