import { LoginForm } from "@/features/auth";
import { Card } from "@/features/common";
import { useThemeColors } from "@/features/theme";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const colors = useThemeColors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.NEUTRAL[200] }}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={40}>
        <Card cardStyles={{ margin: 30, marginVertical: "auto" }}>
          <LoginForm />
        </Card>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
