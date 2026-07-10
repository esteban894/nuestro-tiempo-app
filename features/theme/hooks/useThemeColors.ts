import { darkColors, lightColors, ThemeColors } from "@/constants/colors";
import { useThemeStore } from "../store/themeStore";

export function useThemeColors(): ThemeColors {
  const resolvedScheme = useThemeStore((state) => state.resolvedScheme);
  return resolvedScheme === "dark" ? darkColors : lightColors;
}
