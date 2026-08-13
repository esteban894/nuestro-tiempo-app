import { ThemeColors } from "@/constants/colors";
import { Button, Card, getErrorMessage, Input, Title } from "@/features/common";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { joinCouple } from "../../api/couple.api";
import { coupleKeys } from "../../api/queryKeys";
import { INVITE_CODE_LENGTH, INVITE_CODE_REGEX } from "../../utils/generateInviteCode";

export const JoinCoupleCard = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [code, setCode] = useState("");
  const [formatError, setFormatError] = useState<string | undefined>();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: joinCouple,
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: coupleKeys.me() });
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
      setFormatError(t("couple.join.codeFormatError"));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    mutation.reset();
    mutation.mutate({ code });
  };

  return (
    <Card cardStyles={styles.card}>
      <Ionicons name="people-circle" size={44} color={colors.SECONDARY[500]} />
      <Title title={t("couple.join.title")} variant="h3" align="center" style={styles.title} />

      {mutation.isSuccess ? (
        <View style={styles.successSection}>
          <Ionicons name="checkmark-circle" size={56} color={colors.PRIMARY[500]} />
          <Text style={styles.successText}>{t("couple.join.success", { code })}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.helper}>{t("couple.join.helper")}</Text>
          <View style={styles.codeInputWrapper}>
            <Input
              value={code}
              onChangeText={handleChange}
              placeholder={t("couple.join.codePlaceholder")}
              leftIcon="key-outline"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={INVITE_CODE_LENGTH}
              error={formatError ?? getErrorMessage(mutation.error, t)}
              style={styles.codeInput}
            />
          </View>
          <Button
            title={t("couple.join.submit")}
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
