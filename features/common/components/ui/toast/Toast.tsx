import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { StyleSheet } from "react-native";
import ToastLib, { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";

export function AppToast() {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const toastConfig: ToastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={[styles.toast, { borderLeftColor: colors.PRIMARY[500] }]}
        contentContainerStyle={styles.content}
        text1Style={styles.text1}
        text2Style={styles.text2}
      />
    ),
    info: (props) => (
      <BaseToast
        {...props}
        style={[styles.toast, { borderLeftColor: colors.SECONDARY[500] }]}
        contentContainerStyle={styles.content}
        text1Style={styles.text1}
        text2Style={styles.text2}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        style={[styles.toast, { borderLeftColor: colors.ERROR[500] }]}
        contentContainerStyle={styles.content}
        text1Style={styles.text1}
        text2Style={styles.text2}
      />
    ),
  };

  return <ToastLib config={toastConfig} />;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    toast: {
      backgroundColor: colors.NEUTRAL[200],
      borderLeftWidth: 6,
      height: "auto",
      paddingVertical: 8,
    },
    content: {
      paddingHorizontal: 12,
    },
    text1: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.NEUTRAL[800],
    },
    text2: {
      fontSize: 13,
      color: colors.NEUTRAL[800],
    },
  });
