import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

interface Props {
  /** Name to derive the initial from (first character, uppercased). */
  name: string;
  /** `me` renders gold (brand primary), `partner` renders sage (brand secondary) — the
   * app's two existing accent colors double as a "which of us" legend with no extra key. */
  tone: "me" | "partner";
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function InitialBubble({ name, tone, size = 18, style }: Props) {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const background = tone === "me" ? colors.PRIMARY[500] : colors.SECONDARY[500];

  return (
    <View
      style={[
        styles.bubble,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: background },
        style,
      ]}>
      <Text style={[styles.label, { fontSize: size * 0.55 }]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    bubble: {
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: colors.NEUTRAL[200],
    },
    label: {
      fontWeight: "700",
      color: "#fff",
    },
  });
