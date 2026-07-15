export type ThemeColors = {
  PRIMARY: { 200: string; 500: string; 800: string };
  SECONDARY: { 200: string; 500: string; 800: string };
  NEUTRAL: { 200: string; 500: string; 600: string; 800: string };
  ERROR: { 500: string };
  /** Sombra temeada: marrón cálido en light, negro en dark (una sombra clara brillaría mal sobre fondo oscuro). */
  SHADOW: string;
};

export const lightColors: ThemeColors = {
  PRIMARY: {
    200: "#EFE1C6",
    500: "#A9824A",
    800: "#6E5228",
  },
  SECONDARY: {
    200: "#CBD2BE",
    500: "#7E8A66",
    800: "#55603F",
  },
  NEUTRAL: {
    200: "#FDF7F5",
    500: "#F0E7E0",
    600: "#B7ADA3",
    800: "#241D18",
  },
  ERROR: {
    500: "#D32F2F",
  },
  SHADOW: "#6E5228",
};

export const darkColors: ThemeColors = {
  PRIMARY: {
    200: "#4A3B22",
    500: "#A9824A",
    800: "#D9B36C",
  },
  SECONDARY: {
    200: "#2E3626",
    500: "#7E8A66",
    800: "#AEBB8E",
  },
  NEUTRAL: {
    200: "#161717",
    500: "#242627",
    600: "#8A8F8F",
    800: "#F4F4F2",
  },
  ERROR: {
    500: "#FF6B6B",
  },
  SHADOW: "#000000",
};
