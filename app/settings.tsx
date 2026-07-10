import { ThemeSelector } from "@/features/settings";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <ThemeSelector />
    </SafeAreaView>
  );
}
