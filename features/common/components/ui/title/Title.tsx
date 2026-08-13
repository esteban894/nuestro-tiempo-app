import { useThemeColors } from "@/features/theme";
import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";

type TitleVariant = "h1" | "h2" | "h3" | "h4" | "subtitle";

interface TitleProps extends TextProps {
  title?: string;
  variant?: TitleVariant;
  color?: string;
  weight?:
    | "normal"
    | "bold"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
  align?: "left" | "center" | "right" | "justify";
}

export const Title = ({
  title,
  children,
  variant = "h1",
  color,
  weight,
  align,
  style,
  ...rest
}: TitleProps) => {
  const themeColors = useThemeColors();
  const variantStyle = styles[variant];

  const customStyle = {
    color: color ?? themeColors.NEUTRAL[800],
    ...(weight && { fontWeight: weight }),
    ...(align && { textAlign: align }),
  };

  return (
    <Text style={[variantStyle, customStyle, style]} {...rest}>
      {title || children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontFamily: "ElmsSans_700Bold",
    fontSize: 32,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: "ElmsSans_700Bold",
    fontSize: 28,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: "ElmsSans_700Bold",
    fontSize: 24,
  },
  h4: {
    fontFamily: "ElmsSans_700Bold",
    fontSize: 20,
  },
  subtitle: {
    fontFamily: "ElmsSans_400Regular",
    fontSize: 16,
  },
});
