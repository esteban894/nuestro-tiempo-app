import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
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
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: IoniconsName;
  rightIcon?: IoniconsName;
  iconSize?: number;
  isLoading?: boolean;
  fullWidth?: boolean;
}

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
  const colors = useThemeColors();
  const styles = createStyles(colors);

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

  const onColor =
    variant === "outline" || variant === "ghost"
      ? colors.PRIMARY[800]
      : variant === "danger"
        ? colors.ON_ERROR
        : colors.WHITE;
  const iconColor = onColor;

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...rest}>
      {isLoading ? (
        <ActivityIndicator color={onColor} size="small" />
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    base: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 30,
      borderWidth: 0,
    },

    primary: {
      backgroundColor: colors.PRIMARY[600],
    },
    secondary: {
      backgroundColor: colors.SECONDARY[600],
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: colors.PRIMARY[800],
    },
    ghost: {
      backgroundColor: "transparent",
    },
    danger: {
      backgroundColor: colors.ERROR[500],
    },

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

    disabled: {
      opacity: 0.5,
    },
    fullWidth: {
      width: "100%",
    },

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

    text: {
      fontWeight: "600",
      textAlign: "center",
    },
    text_primary: {
      color: colors.WHITE,
    },
    text_secondary: {
      color: colors.WHITE,
    },
    text_outline: {
      color: colors.PRIMARY[800],
    },
    text_ghost: {
      color: colors.PRIMARY[800],
    },
    text_danger: {
      color: colors.ON_ERROR,
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
