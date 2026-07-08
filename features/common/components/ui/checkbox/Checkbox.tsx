import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Checkbox controlado con soporte para label.
 *
 * @example
 * <Checkbox checked={isPrivate} onChange={setIsPrivate} label="Álbum privado" />
 */
export const Checkbox = ({ checked, onChange, label, disabled, style }: CheckboxProps) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={0.7}
      disabled={disabled}
      onPress={() => onChange(!checked)}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.NEUTRAL[600],
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: {
    backgroundColor: colors.PRIMARY[500],
    borderColor: colors.PRIMARY[500],
  },
  label: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.NEUTRAL[800],
  },
});
