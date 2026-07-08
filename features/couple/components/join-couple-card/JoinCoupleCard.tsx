import { colors } from "@/constants/colors";
import { Button, Card, Input, Title } from "@/features/common";
import { useCoupleStore } from "@/features/couple";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { joinCouple } from "../../api/couple.api";
import { INVITE_CODE_LENGTH, INVITE_CODE_REGEX } from "../../utils/generateInviteCode";

export const JoinCoupleCard = () => {
  const [code, setCode] = useState("");
  const [formatError, setFormatError] = useState<string | undefined>();

  const fetchCouple = useCoupleStore((state) => state.fetchCouple);

  const mutation = useMutation({
    mutationFn: joinCouple,
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      fetchCouple();
    },
    onError: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  });

  const handleChange = (value: string) => {
    setCode(value.toUpperCase());
    if (formatError) setFormatError(undefined);
    if (mutation.error) mutation.reset();
  };

  const handleJoin = () => {
    if (!INVITE_CODE_REGEX.test(code)) {
      setFormatError("El código debe tener 8 dígitos hexadecimales.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    mutation.reset();
    mutation.mutate({ code });
  };

  return (
    <Card cardStyles={styles.card}>
      <Ionicons name="people-circle" size={44} color={colors.SECONDARY[500]} />
      <Title title="Unirse a una pareja" variant="h3" align="center" style={styles.title} />

      {mutation.isSuccess ? (
        <View style={styles.successSection}>
          <Ionicons name="checkmark-circle" size={56} color={colors.PRIMARY[500]} />
          <Text style={styles.successText}>¡Te uniste a la pareja con el código {code}!</Text>
        </View>
      ) : (
        <>
          <Text style={styles.helper}>Ingresa el código que te compartió tu pareja:</Text>
          <View style={styles.codeInputWrapper}>
            <Input
              value={code}
              onChangeText={handleChange}
              placeholder="A1B2C3D4"
              leftIcon="key-outline"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={INVITE_CODE_LENGTH}
              error={formatError ?? mutation.error?.message}
              style={styles.codeInput}
            />
          </View>
          <Button
            title="Unirse"
            leftIcon="heart"
            fullWidth
            isLoading={mutation.isPending}
            disabled={code.length === 0 || mutation.isPending}
            onPress={handleJoin}
          />
        </>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
  },
  title: {
    marginTop: 8,
    marginBottom: 16,
    color: colors.SECONDARY[800],
  },
  helper: {
    fontSize: 14,
    color: colors.NEUTRAL[800],
    textAlign: "center",
    marginBottom: 12,
  },
  codeInputWrapper: {
    width: "100%",
  },
  codeInput: {
    letterSpacing: 4,
    fontWeight: "600",
  },
  successSection: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  successText: {
    fontSize: 16,
    color: colors.NEUTRAL[800],
    textAlign: "center",
  },
});
