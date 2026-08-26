import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { ComponentProps, useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: IoniconsName;
  iconSize?: number;
  iconColor?: string;
  isPassword?: boolean;
  focusColor?: string;
  defaultColor?: string;
  errorColor?: string;
  ref?: React.Ref<TextInput>;
}

export const Input = ({
  label,
  error,
  leftIcon,
  iconSize = 24,
  iconColor,
  isPassword = false,
  focusColor,
  defaultColor = "transparent",
  errorColor,
  style,
  ...rest
}: InputProps) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const resolvedFocusColor = focusColor ?? colors.SECONDARY[500];
  const resolvedErrorColor = errorColor ?? colors.ERROR[500];
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const borderColor = error ? resolvedErrorColor : isFocused ? resolvedFocusColor : defaultColor;
  const currentColor = error
    ? resolvedErrorColor
    : isFocused
      ? resolvedFocusColor
      : colors.NEUTRAL[800];
  const currentIconColor = iconColor || currentColor;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: currentColor }]}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          { borderColor },
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={iconSize}
            color={currentIconColor}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.NEUTRAL[700]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !isPasswordVisible}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
              size={iconSize}
              color={currentIconColor}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={[styles.errorText, { color: resolvedErrorColor }]}>{error}</Text>}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderRadius: 25,
      backgroundColor: colors.NEUTRAL[500],
      paddingHorizontal: 12,
      minHeight: 50,
    },
    inputContainerFocused: {
      borderWidth: 2,
    },
    inputContainerError: {
      borderWidth: 2,
    },
    leftIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.NEUTRAL[800],
      paddingVertical: 12,
    },
    rightIcon: {
      marginLeft: 10,
      padding: 4,
    },
    errorText: {
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
  });
