import { colors } from "@/constants/colors";
import { Button, Input, Title } from "@/features/common";
import { Link, useRouter } from "expo-router";
import { useRef } from "react";
import { StyleSheet, Text, TextInput } from "react-native";

export const LoginForm = () => {
  const router = useRouter();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleSubmit = () => {
    console.log("handle submit");
    router.navigate("/");
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
        ref={emailRef}
        label="Correo electrónico"
        placeholder="john.doe@example.com"
        leftIcon="mail-outline"
        keyboardType="email-address"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <Input
        ref={passwordRef}
        label="Contraseña"
        placeholder="********"
        isPassword
        leftIcon="lock-closed-outline"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <Button title="Iniciar Sesión" onPress={handleSubmit} style={{ marginBottom: 20 }} />

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
