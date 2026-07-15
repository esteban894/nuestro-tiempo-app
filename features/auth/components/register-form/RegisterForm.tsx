import { ThemeColors } from "@/constants/colors";
import { Button, Input, Title } from "@/features/common";
import { useThemeColors } from "@/features/theme";
import { useMutation } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, TextInput } from "react-native";
import { register } from "../../api/auth.api";
import { useAuthStore } from "../../store/authStore";
import { validateRegisterForm, type RegisterErrors } from "../../validation";

export const RegisterForm = () => {
  const setSession = useAuthStore((state) => state.setSession);
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const password2Ref = useRef<TextInput>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<RegisterErrors>({});

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: ({ user, access_token, refresh_token }) =>
      setSession(user, { access_token, refresh_token }),
    meta: { suppressErrorToast: true },
  });

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleNameChange = (value: string) => {
    setName(value);
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
  };

  const handleSubmit = () => {
    const validationErrors = validateRegisterForm({ name, email, password, confirmPassword });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    mutation.reset();
    mutation.mutate({ name, email, password });
  };

  return (
    <>
      <Title title="Crear Cuenta" variant="h1" align="center" />
      <Title
        title="Comienza tu viaje con nosotros"
        variant="subtitle"
        align="center"
        style={{ marginBottom: 20 }}
      />
      <Input
        label="Nombre"
        placeholder="John Doe"
        leftIcon="person-outline"
        returnKeyType="next"
        value={name}
        onChangeText={handleNameChange}
        onSubmitEditing={() => emailRef.current?.focus()}
        error={errors.name}
      />
      <Input
        ref={emailRef}
        label="Correo electrónico"
        placeholder="john.doe@example.com"
        leftIcon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="next"
        value={email}
        onChangeText={handleEmailChange}
        onSubmitEditing={() => passwordRef.current?.focus()}
        error={errors.email}
      />
      <Input
        ref={passwordRef}
        label="Contraseña"
        placeholder="********"
        isPassword
        leftIcon="lock-closed-outline"
        returnKeyType="done"
        value={password}
        onChangeText={handlePasswordChange}
        onSubmitEditing={() => password2Ref.current?.focus()}
        error={errors.password}
      />
      <Input
        ref={password2Ref}
        label="Confirmar Contraseña"
        placeholder="********"
        isPassword
        leftIcon="lock-closed-outline"
        returnKeyType="done"
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        onSubmitEditing={handleSubmit}
        error={
          errors.confirmPassword ??
          (passwordMismatch ? "Las contraseñas no coinciden." : mutation.error?.message)
        }
      />

      <Button
        title="Crear Cuenta"
        onPress={handleSubmit}
        isLoading={mutation.isPending}
        style={{ marginBottom: 20 }}
      />

      <Text style={styles.hasAccount}>¿Ya tienes una cuenta?</Text>
      <Link href="/(auth)/login" style={styles.link} replace>
        Inicia sesión aquí
      </Link>
    </>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.NEUTRAL[200],
      padding: 20,
      borderRadius: 20,
      margin: 30,
      marginVertical: "auto",
    },
    hasAccount: {
      textAlign: "center",
      color: colors.NEUTRAL[800],
    },
    link: {
      textAlign: "center",
      fontWeight: "bold",
      color: colors.PRIMARY[500],
    },
  });
