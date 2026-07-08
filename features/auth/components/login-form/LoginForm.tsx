import { colors } from "@/constants/colors";
import { Button, Input, Title } from "@/features/common";
import { useMutation } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, TextInput } from "react-native";
import { login } from "../../api/auth.api";
import { useAuthStore } from "../../store/authStore";

export const LoginForm = () => {
  const setSession = useAuthStore((state) => state.setSession);

  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ user, access_token, refresh_token }) =>
      setSession(user, { access_token, refresh_token }),
  });

  const errorMessage = mutation.error?.message;

  const handleSubmit = () => {
    mutation.reset();
    mutation.mutate({ email, password });
  };

  return (
    <>
      <Title title="Iniciar Sesión" variant="h1" align="center" />
      <Title
        title="Vuelve a tu rincón especial"
        variant="subtitle"
        align="center"
        style={{ marginBottom: 20 }}
      />
      <Input
        label="Correo electrónico"
        placeholder="john.doe@example.com"
        leftIcon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="next"
        value={email}
        onChangeText={setEmail}
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <Input
        ref={passwordRef}
        label="Contraseña"
        placeholder="********"
        isPassword
        leftIcon="lock-closed-outline"
        returnKeyType="done"
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={handleSubmit}
        error={errorMessage}
      />

      <Button
        title="Iniciar Sesión"
        onPress={handleSubmit}
        isLoading={mutation.isPending}
        style={{ marginBottom: 20 }}
      />

      <Text style={styles.hasAccount}>¿Aún no tienes una cuenta?</Text>
      <Link href="/(auth)/register" style={styles.link} replace>
        Empieza tu viaje aquí
      </Link>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.NEUTRAL[200],
    padding: 20,
    borderRadius: 20,
    margin: 30,
    marginVertical: "auto",
  },
  hasAccount: {
    textAlign: "center",
  },
  link: {
    textAlign: "center",
    fontWeight: "bold",
    color: colors.PRIMARY[500],
  },
});
