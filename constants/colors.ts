export type ThemeColors = {
  PRIMARY: { 200: string; 500: string; 800: string };
  SECONDARY: { 200: string; 500: string; 800: string };
  NEUTRAL: { 200: string; 500: string; 600: string; 800: string };
  ERROR: { 500: string };
};

export const lightColors: ThemeColors = {
  PRIMARY: {
    200: "#EFE1C6",
    500: "#A9824A",
    800: "#6E5228",
  },
  SECONDARY: {
    200: "#F48FB1",
    500: "#F06292",
    800: "#EC407A",
  },
  NEUTRAL: {
    200: "#FDF7F5",
    500: "#EEEEEE",
    600: "#BDBDBD",
    800: "#212121",
  },
  ERROR: {
    500: "#D32F2F",
  },
};

export const darkColors: ThemeColors = {
  PRIMARY: {
    200: "#4A3B22",
    500: "#A9824A",
    800: "#D9B36C",
  },
  SECONDARY: {
    200: "#F48FB1",
    500: "#F06292",
    800: "#EC407A",
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
};
