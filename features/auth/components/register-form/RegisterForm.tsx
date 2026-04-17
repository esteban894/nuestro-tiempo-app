import { colors } from "@/constants/colors";
import { Button, Input, Title } from "@/features/common";
import { Link, useRouter } from "expo-router";
import { useRef } from "react";
import { StyleSheet, Text, TextInput } from "react-native";

export const RegisterForm = () => {
  const router = useRouter();

  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const password2Ref = useRef<TextInput>(null);

  const handleSubmit = () => {
    console.log("handle submit");
    router.navigate("/");
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
        ref={nameRef}
        label="Nombre"
        placeholder="John Doe"
        leftIcon="person-outline"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
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
        onSubmitEditing={() => password2Ref.current?.focus()}
      />
      <Input
        ref={password2Ref}
        label="Confirmar Contraseña"
        placeholder="********"
        isPassword
        leftIcon="lock-closed-outline"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <Button title="Crear Cuenta" onPress={handleSubmit} style={{ marginBottom: 20 }} />

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
