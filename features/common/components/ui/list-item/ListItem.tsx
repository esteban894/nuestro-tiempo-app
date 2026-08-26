import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

interface ListItemProps {
  leftIcon: IoniconsName;
  label: string;
  rightIcon?: IoniconsName;
  onPress?: () => void;
}

export const ListItem = ({ leftIcon, label, rightIcon = "chevron-forward", onPress }: ListItemProps) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const content = (
    <>
      <View style={styles.iconWrapper}>
        <Ionicons name={leftIcon} size={22} color={colors.PRIMARY[500]} />
      </View>
      <Text style={styles.label}>{label}</Text>
      {onPress && <Ionicons name={rightIcon} size={20} color={colors.NEUTRAL[600]} />}
    </>
  );

  if (!onPress) {
    return <View style={styles.container}>{content}</View>;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      {content}
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.NEUTRAL[200],
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 16,
      elevation: 2,
      shadowColor: colors.SHADOW,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.NEUTRAL[500],
      marginRight: 14,
    },
    label: {
      flex: 1,
      fontSize: 16,
      fontWeight: "500",
      color: colors.NEUTRAL[800],
    },
  });
