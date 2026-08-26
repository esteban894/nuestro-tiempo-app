export type ThemeColors = {
  PRIMARY: { 200: string; 500: string; 600: string; 800: string };
  SECONDARY: { 200: string; 500: string; 600: string; 800: string };
  NEUTRAL: { 200: string; 500: string; 600: string; 700: string; 800: string };
  ERROR: { 500: string };
  ON_ERROR: string;
  WHITE: string;
  SHADOW: string;
  /** Scrim behind icon-button chrome floating over photos — intentionally identical in both themes. */
  OVERLAY: string;
  /** Fullscreen image-viewer backdrop — intentionally identical in both themes. */
  OVERLAY_STRONG: string;
};

export const lightColors: ThemeColors = {
  PRIMARY: {
    200: "#EFE1C6",
    500: "#A9824A",
    600: "#8C6A3A",
    800: "#6E5228",
  },
  SECONDARY: {
    200: "#CBD2BE",
    500: "#7E8A66",
    600: "#656E52",
    800: "#55603F",
  },
  NEUTRAL: {
    200: "#FDF7F5",
    500: "#F0E7E0",
    600: "#B7ADA3",
    700: "#6E5F51",
    800: "#241D18",
  },
  ERROR: {
    500: "#D32F2F",
  },
  ON_ERROR: "#FFFFFF",
  WHITE: "#FFFFFF",
  SHADOW: "#6E5228",
  OVERLAY: "rgba(0,0,0,0.45)",
  OVERLAY_STRONG: "rgba(0,0,0,0.9)",
};

export const darkColors: ThemeColors = {
  PRIMARY: {
    200: "#4A3B22",
    500: "#A9824A",
    600: "#8C6A3A",
    800: "#D9B36C",
  },
  SECONDARY: {
    200: "#2E3626",
    500: "#7E8A66",
    600: "#656E52",
    800: "#AEBB8E",
  },
  NEUTRAL: {
    200: "#161717",
    500: "#242627",
    600: "#8A8F8F",
    700: "#9C958D",
    800: "#F4F4F2",
  },
  ERROR: {
    500: "#FF6B6B",
  },
  ON_ERROR: "#161717",
  WHITE: "#FFFFFF",
  SHADOW: "#000000",
  OVERLAY: "rgba(0,0,0,0.45)",
  OVERLAY_STRONG: "rgba(0,0,0,0.9)",
};
