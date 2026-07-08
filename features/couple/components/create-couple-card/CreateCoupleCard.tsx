import { colors } from "@/constants/colors";
import { Button, Card, Title } from "@/features/common";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { generateInviteCode } from "../../utils/generateInviteCode";

const formatDate = (date: Date) =>
  date.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });

export const CreateCoupleCard = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    // En Android el picker es un modal que hay que cerrar manualmente.
    if (Platform.OS !== "ios") setShowPicker(false);
    if (event.type === "set" && selected) setStartDate(selected);
  };

  const handleCreate = () => {
    if (!startDate) return;
    setCode(generateInviteCode());
    setCopied(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCopy = async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopied(true);
    Haptics.selectionAsync();
  };

  return (
    <Card cardStyles={styles.card}>
      <Ionicons name="heart-circle" size={44} color={colors.PRIMARY[500]} />
      <Title title="Crear pareja" variant="h3" align="center" style={styles.title} />

      {code ? (
        <View style={styles.codeSection}>
          <Text style={styles.helper}>Comparte este código con tu pareja:</Text>
          <Text style={styles.code}>{code}</Text>
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

          <Button
            title="Crear vínculo"
            leftIcon="link"
            fullWidth
            disabled={!startDate}
            onPress={handleCreate}
            style={styles.createButton}
          />
        </>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    minHeight: 50,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: "#000",
  },
  datePlaceholder: {
    color: "#999",
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
    marginBottom: 20,
  },
});
