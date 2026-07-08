import { CoupleConnect } from "@/features/couple";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CoupleScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <CoupleConnect />
    </SafeAreaView>
  );
}
