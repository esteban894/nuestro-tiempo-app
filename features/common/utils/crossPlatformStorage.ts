import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/** expo-secure-store has no web implementation — localStorage is the web fallback
 *  for the non-sensitive UI preferences (theme, language) that use this helper. */
export async function getStoredValue(key: string): Promise<string | null> {
  if (Platform.OS === "web") return window.localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

export async function setStoredValue(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}
