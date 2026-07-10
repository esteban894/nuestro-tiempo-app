import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

interface ListItemProps {
  /** Ícono a la izquierda. */
  leftIcon: IoniconsName;
  /** Texto de la fila. */
  label: string;
  /** Ícono a la derecha (por defecto un chevron). */
  rightIcon?: IoniconsName;
  /** Acción al tocar la fila. */
  onPress?: () => void;
}

/**
 * Fila de lista/menú reutilizable con ícono, texto y acción.
 *
 * @example
 * <ListItem leftIcon="people-outline" label="Vincular con tu pareja" onPress={goToCouple} />
 */
export const ListItem = ({
  leftIcon,
  label,
  rightIcon = "chevron-forward",
  onPress,
}: ListItemProps) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.iconWrapper}>
        <Ionicons name={leftIcon} size={22} color={colors.PRIMARY[500]} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Ionicons name={rightIcon} size={20} color={colors.NEUTRAL[600]} />
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
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
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
