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

/**
 * Componente de título reutilizable con soporte para diferentes variantes y estilos.
 *
 * @example
 * // Uso básico
 * <Title title="Hola Mundo" />
 *
 * @example
 * // Con variante
 * <Title variant="h2" title="Subtítulo" />
 *
 * @example
 * // Con props personalizadas
 * <Title variant="h3" color="#D32F2F" align="center">
 *   Texto personalizado
 * </Title>
 *
 * @example
 * // Con todas las props de Text
 * <Title variant="h4" numberOfLines={2} ellipsizeMode="tail">
 *   Texto muy largo que será truncado...
 * </Title>
 */
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
    fontSize: 32,
    fontWeight: "bold",
  },
  h2: {
    fontSize: 28,
    fontWeight: "bold",
  },
  h3: {
    fontSize: 24,
    fontWeight: "600",
  },
  h4: {
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
  },
});
