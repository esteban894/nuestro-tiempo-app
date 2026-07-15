import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "../card/Card";
import { getElapsedTime } from "./getElapsedTime";

interface Props {
  initDate: string;
}

const counterLabels = {
  years: { singular: "Año", plural: "Años" },
  months: { singular: "Mes", plural: "Meses" },
  days: { singular: "Día", plural: "Días" },
  hours: { singular: "Hora", plural: "Horas" },
  minutes: { singular: "Minuto", plural: "Minutos" },
  seconds: { singular: "Segundo", plural: "Segundos" },
};

export const CounterCards = ({ initDate }: Props) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const initialDate = useMemo(() => new Date(initDate), [initDate]);

  const [timeDiff, setTimeDiff] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCounter = () => setTimeDiff(getElapsedTime(initialDate, new Date()));

    updateCounter();

    const interval = setInterval(updateCounter, 1000);

    return () => clearInterval(interval);
  }, [initialDate]);

  return (
    <View style={styles.container}>
      {Object.entries(timeDiff).map(([key, value]) => {
        if (key === "years" && value === 0) return null;
        const label = counterLabels[key as keyof typeof counterLabels];
        return (
          <Card key={key} cardStyles={styles.card}>
            <Text style={styles.number}>{String(value).padStart(2, "0")}</Text>
            <Text style={styles.label}>{value !== 1 ? label.plural : label.singular}</Text>
          </Card>
        );
      })}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      gap: 15,
      flexWrap: "wrap",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    card: {
      flex: 1,
      alignItems: "center",
      minWidth: "45%",
      height: 100,
      backgroundColor: colors.NEUTRAL[500],
      shadowColor: colors.PRIMARY[500],
    },
    number: {
      fontSize: 24,
      fontFamily: "ElmsSans_700Bold",
      fontWeight: "700",
      color: colors.PRIMARY[500],
    },
    label: {
      fontSize: 16,
      fontFamily: "ElmsSans_400Regular",
      fontWeight: "400",
      color: colors.NEUTRAL[600],
    },
  });
