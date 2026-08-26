import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

interface AlbumFabProps {
  icon?: IoniconsName;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const AlbumFab = ({ icon = "add", onPress = () => {}, style }: AlbumFabProps) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity style={[styles.fab, style]} activeOpacity={0.8} onPress={onPress}>
      <Ionicons name={icon} size={28} color={colors.WHITE} />
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.PRIMARY[500],
      alignItems: "center",
      justifyContent: "center",
      elevation: 6,
      shadowColor: colors.SHADOW,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
    },
  });
