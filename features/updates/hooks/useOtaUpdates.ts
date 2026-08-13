import { i18n } from "@/features/i18n";
import * as Updates from "expo-updates";
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import Toast from "react-native-toast-message";
import { checkForOtaUpdate } from "../utils/checkForOtaUpdate";

export function useOtaUpdates() {
  const updateOfferedRef = useRef(false);

  useEffect(() => {
    async function check() {
      if (updateOfferedRef.current) return;

      const isReady = await checkForOtaUpdate();
      if (!isReady || updateOfferedRef.current) return;

      updateOfferedRef.current = true;
      Toast.show({
        type: "info",
        text1: i18n.t("updates.title"),
        text2: i18n.t("updates.message"),
        autoHide: false,
        onPress: () => {
          Updates.reloadAsync();
        },
      });
    }

    check();

    const subscription = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") check();
    });

    return () => subscription.remove();
  }, []);
}
