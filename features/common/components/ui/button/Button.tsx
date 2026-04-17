import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps extends TouchableOpacityProps {
  /** Texto del botón (alternativa a children) */
  title?: string;
  /** Variante visual del botón */
  variant?: ButtonVariant;
  /** Tamaño del botón */
  size?: ButtonSize;
  /** Ícono a la izquierda del texto */
  leftIcon?: IoniconsName;
  /** Ícono a la derecha del texto */
  rightIcon?: IoniconsName;
  /** Tamaño de los íconos */
  iconSize?: number;
  /** Estado de carga (muestra spinner) */
  isLoading?: boolean;
  /** Ancho completo */
  fullWidth?: boolean;
}

/**
 * Componente de botón reutilizable con soporte para variantes, tamaños, íconos y estados.
 *
 * @example
 * // Botón básico
 * <Button title="Aceptar" onPress={handlePress} />
 *
 * @example
 * // Botón con variante y tamaño
 * <Button
 *   title="Eliminar"
 *   variant="danger"
 *   size="large"
 *   onPress={handleDelete}
 * />
 *
 * @example
 * // Botón con íconos
 * <Button
 *   title="Guardar"
 *   leftIcon="save-outline"
 *   variant="primary"
 * />
 *
 * @example
 * // Botón en estado de carga
 * <Button
 *   title="Enviando..."
 *   isLoading
 *   disabled
 * />
 */
export const Button = ({
  title,
  children,
  variant = "primary",
  size = "medium",
  leftIcon,
  rightIcon,
  iconSize,
  isLoading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) => {
  const containerStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
  ];

  const textStyle = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    disabled && styles.textDisabled,
  ];

  const currentIconSize = iconSize || (size === "small" ? 16 : size === "large" ? 24 : 20);

  const iconColor = variant === "outline" || variant === "ghost" ? "#D32F2F" : "#fff";

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...rest}>
      {isLoading ? (
        <ActivityIndicator
          color={variant === "outline" || variant === "ghost" ? "#D32F2F" : "#fff"}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={currentIconSize}
              color={iconColor}
              style={styles.leftIcon}
            />
          )}

          <Text style={textStyle}>{title || children}</Text>

          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={currentIconSize}
              color={iconColor}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    borderWidth: 0,
  },

  // Variantes
  primary: {
    backgroundColor: "#D32F2F",
  },
  secondary: {
    backgroundColor: "#757575",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#D32F2F",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: "#f44336",
  },

  // Tamaños
  size_small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  size_medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  size_large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 56,
  },

  // Estados
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: "100%",
  },

  // Contenido
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },

  // Textos
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  text_primary: {
    color: "#fff",
  },
  text_secondary: {
    color: "#fff",
  },
  text_outline: {
    color: "#D32F2F",
  },
  text_ghost: {
    color: "#D32F2F",
  },
  text_danger: {
    color: "#fff",
  },
  textSize_small: {
    fontSize: 14,
  },
  textSize_medium: {
    fontSize: 16,
  },
  textSize_large: {
    fontSize: 18,
  },
  textDisabled: {
    opacity: 1,
  },
});
