import { ThemeColors } from "@/constants/colors";
import { Button, getErrorMessage, Input, Title } from "@/features/common";
import { useThemeColors } from "@/features/theme";
import { useMutation } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TextInput } from "react-native";
import { register } from "../../api/auth.api";
import { useAuthStore } from "../../store/authStore";
import { validateRegisterForm, type RegisterErrors } from "../../validation";

export const RegisterForm = () => {
  const { t } = useTranslation();
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
      <Title title={t("auth.register.title")} variant="h1" align="center" />
      <Title
        title={t("auth.register.subtitle")}
        variant="subtitle"
        align="center"
        style={{ marginBottom: 20 }}
      />
      <Input
        label={t("auth.register.nameLabel")}
        placeholder={t("auth.register.namePlaceholder")}
        leftIcon="person-outline"
        returnKeyType="next"
        value={name}
        onChangeText={handleNameChange}
        onSubmitEditing={() => emailRef.current?.focus()}
        error={errors.name ? t(errors.name) : undefined}
      />
      <Input
        ref={emailRef}
        label={t("auth.register.emailLabel")}
        placeholder={t("auth.register.emailPlaceholder")}
        leftIcon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="next"
        value={email}
        onChangeText={handleEmailChange}
        onSubmitEditing={() => passwordRef.current?.focus()}
        error={errors.email ? t(errors.email) : undefined}
      />
      <Input
        ref={passwordRef}
        label={t("auth.register.passwordLabel")}
        placeholder={t("auth.register.passwordPlaceholder")}
        isPassword
        leftIcon="lock-closed-outline"
        returnKeyType="done"
        value={password}
        onChangeText={handlePasswordChange}
        onSubmitEditing={() => password2Ref.current?.focus()}
        error={errors.password ? t(errors.password) : undefined}
      />
      <Input
        ref={password2Ref}
        label={t("auth.register.confirmPasswordLabel")}
        placeholder={t("auth.register.passwordPlaceholder")}
        isPassword
        leftIcon="lock-closed-outline"
        returnKeyType="done"
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        onSubmitEditing={handleSubmit}
        error={
          errors.confirmPassword
            ? t(errors.confirmPassword)
            : passwordMismatch
              ? t("auth.validation.passwordMismatch")
              : getErrorMessage(mutation.error, t)
        }
      />

      <Button
        title={t("auth.register.submit")}
        onPress={handleSubmit}
        isLoading={mutation.isPending}
        style={{ marginBottom: 20 }}
      />

      <Text style={styles.hasAccount}>{t("auth.register.hasAccount")}</Text>
      <Link href="/(auth)/login" style={styles.link} replace>
        {t("auth.register.goToLogin")}
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
