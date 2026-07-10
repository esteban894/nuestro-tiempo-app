import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface Props {
  cardStyles?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const Card = ({ children, cardStyles }: Props) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return <View style={[styles.card, cardStyles]}>{children}</View>;
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.NEUTRAL[200],
      padding: 20,
      borderRadius: 20,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
  });
