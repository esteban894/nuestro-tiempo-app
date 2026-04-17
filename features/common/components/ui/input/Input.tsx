import { colors } from "@/constants/colors";
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

/**
 * Componente de Input reutilizable con soporte para label, iconos, contraseñas y validación.
 *
 * @example
 * // Input básico
 * <Input placeholder="Ingresa tu nombre" />
 *
 * @example
 * // Input con label e ícono
 * <Input
 *   label="Email"
 *   placeholder="ejemplo@mail.com"
 *   leftIcon="mail-outline"
 * />
 *
 * @example
 * // Input de contraseña con toggle
 * <Input
 *   label="Contraseña"
 *   isPassword
 *   leftIcon="lock-closed-outline"
 * />
 *
 * @example
 * // Input con error
 * <Input
 *   label="Email"
 *   error="Email inválido"
 *   leftIcon="mail-outline"
 * />
 */
export const Input = ({
  label,
  error,
  leftIcon,
  iconSize = 24,
  iconColor,
  isPassword = false,
  focusColor = colors.SECONDARY[500],
  defaultColor = "transparent",
  errorColor = colors.ERROR[500],
  style,
  ...rest
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const currentColor = error ? errorColor : isFocused ? focusColor : defaultColor;
  const currentIconColor = iconColor || currentColor;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && <Text style={[styles.label, { color: currentColor }]}>{label}</Text>}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          { borderColor: currentColor },
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}>
        {/* Left Icon */}
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={iconSize}
            color={currentIconColor}
            style={styles.leftIcon}
          />
        )}

        {/* TextInput */}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#999"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !isPasswordVisible}
          {...rest}
        />

        {/* Password Toggle */}
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

      {/* Error Message */}
      {error && <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: "#fff",
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
    color: "#000",
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
