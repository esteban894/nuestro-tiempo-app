import { ThemeColors } from "@/constants/colors";
import { Button, getErrorMessage, Input, Title } from "@/features/common";
import { useThemeColors } from "@/features/theme";
import { useMutation } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TextInput } from "react-native";
import { login } from "../../api/auth.api";
import { useAuthStore } from "../../store/authStore";
import { validateLoginForm, type LoginErrors } from "../../validation";

export const LoginForm = () => {
  const { t } = useTranslation();
  const setSession = useAuthStore((state) => state.setSession);
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ user, access_token, refresh_token }) =>
      setSession(user, { access_token, refresh_token }),
    meta: { suppressErrorToast: true },
  });

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
  };

  const handleSubmit = () => {
    const validationErrors = validateLoginForm({ email, password });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    mutation.reset();
    mutation.mutate({ email, password });
  };

  return (
    <>
      <Title title={t("auth.login.title")} variant="h1" align="center" />
      <Title
        title={t("auth.login.subtitle")}
        variant="subtitle"
        align="center"
        style={{ marginBottom: 20 }}
      />
      <Input
        label={t("auth.login.emailLabel")}
        placeholder={t("auth.login.emailPlaceholder")}
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
        label={t("auth.login.passwordLabel")}
        placeholder={t("auth.login.passwordPlaceholder")}
        isPassword
        leftIcon="lock-closed-outline"
        returnKeyType="done"
        value={password}
        onChangeText={handlePasswordChange}
        onSubmitEditing={handleSubmit}
        error={errors.password ? t(errors.password) : getErrorMessage(mutation.error, t)}
      />

      <Button
        title={t("auth.login.submit")}
        onPress={handleSubmit}
        isLoading={mutation.isPending}
        style={{ marginBottom: 20 }}
      />

      <Text style={styles.hasAccount}>{t("auth.login.noAccount")}</Text>
      <Link href="/(auth)/register" style={styles.link} replace>
        {t("auth.login.goToRegister")}
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
