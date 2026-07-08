import { colors } from "@/constants/colors";
import { Button, Input, Title } from "@/features/common";
import { useMutation } from "@tanstack/react-query";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, TextInput } from "react-native";
import { register } from "../../api/auth.api";
import { useAuthStore } from "../../store/authStore";

export const RegisterForm = () => {
  const setSession = useAuthStore((state) => state.setSession);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const password2Ref = useRef<TextInput>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: ({ user, access_token, refresh_token }) =>
      setSession(user, { access_token, refresh_token }),
  });

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = () => {
    if (passwordMismatch) return;
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
        onChangeText={setName}
        onSubmitEditing={() => emailRef.current?.focus()}
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
        onSubmitEditing={() => password2Ref.current?.focus()}
      />
      <Input
        ref={password2Ref}
        label="Confirmar Contraseña"
        placeholder="********"
        isPassword
        leftIcon="lock-closed-outline"
        returnKeyType="done"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        onSubmitEditing={handleSubmit}
        error={passwordMismatch ? "Las contraseñas no coinciden" : mutation.error?.message}
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
