import { colors } from "@/constants/colors";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "../card/Card";

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
    const updateCounter = () => {
      const now = new Date();
      const diff = now.getTime() - initialDate.getTime();

      if (diff > 0) {
        setTimeDiff({
          years: Math.floor(diff / (1000 * 60 * 60 * 24 * 365)),
          months: Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30)),
          days: Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      } else {
        setTimeDiff({
          years: 0,
          months: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      }
    };

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

const styles = StyleSheet.create({
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
    shadowColor: colors.PRIMARY[500],
  },
  number: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    color: colors.PRIMARY[500],
  },
  label: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    fontWeight: "400",
    color: "#666",
  },
});
