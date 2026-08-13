import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "../card/Card";
import { getElapsedTime } from "./getElapsedTime";

interface Props {
  initDate: string;
}

const bigUnitLabels = {
  years: { singular: "Año", plural: "Años" },
  months: { singular: "Mes", plural: "Meses" },
  days: { singular: "Día", plural: "Días" },
};

const pad = (n: number) => String(n).padStart(2, "0");

export const CounterCards = ({ initDate }: Props) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const initialDate = useMemo(() => new Date(initDate), [initDate]);

  const [elapsed, setElapsed] = useState(() => getElapsedTime(initialDate, new Date()));

  useEffect(() => {
    const update = () => setElapsed(getElapsedTime(initialDate, new Date()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [initialDate]);

  const showYears = elapsed.years > 0;
  const showMonths = showYears || elapsed.months > 0;
  const bigUnits = [
    ...(showYears ? [{ key: "years", value: elapsed.years, label: bigUnitLabels.years }] : []),
    ...(showMonths ? [{ key: "months", value: elapsed.months, label: bigUnitLabels.months }] : []),
    { key: "days", value: elapsed.days, label: bigUnitLabels.days },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.bigRow}>
        {bigUnits.map(({ key, value, label }) => (
          <Card key={key} cardStyles={styles.bigCard}>
            <Text style={styles.bigNumber}>{value}</Text>
            <Text style={styles.bigLabel}>{value !== 1 ? label.plural : label.singular}</Text>
          </Card>
        ))}
      </View>

      <View style={styles.tickRow}>
        <Text style={styles.tick}>{pad(elapsed.hours)}</Text>
        <Text style={styles.tickSep}>:</Text>
        <Text style={styles.tick}>{pad(elapsed.minutes)}</Text>
        <Text style={styles.tickSep}>:</Text>
        <Text style={styles.tick}>{pad(elapsed.seconds)}</Text>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      gap: 16,
      alignItems: "center",
    },
    bigRow: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
    },
    bigCard: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 18,
      backgroundColor: colors.NEUTRAL[500],
    },
    bigNumber: {
      fontFamily: "ElmsSans_700Bold",
      fontSize: 36,
      color: colors.PRIMARY[500],
    },
    bigLabel: {
      fontFamily: "ElmsSans_400Regular",
      fontSize: 14,
      color: colors.NEUTRAL[600],
      marginTop: 2,
    },
    tickRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 6,
    },
    tick: {
      fontFamily: "ElmsSans_700Bold",
      fontSize: 16,
      letterSpacing: 1,
      color: colors.NEUTRAL[600],
    },
    tickSep: {
      fontSize: 16,
      color: colors.NEUTRAL[600],
    },
  });
