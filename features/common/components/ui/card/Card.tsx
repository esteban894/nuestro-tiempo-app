import { colors } from "@/constants/colors";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface Props {
  cardStyles?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const Card = ({ children, cardStyles }: Props) => {
  return <View style={[styles.card, cardStyles]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.NEUTRAL[200],
    padding: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#fa0000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
