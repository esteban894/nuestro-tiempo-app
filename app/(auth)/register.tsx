import { RegisterForm } from "@/features/auth";
import { Card } from "@/features/common";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Card cardStyles={{ margin: 30, marginVertical: "auto" }}>
        <RegisterForm />
      </Card>
    </SafeAreaView>
  );
}
