import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

interface SegmentedOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  /** Opciones a mostrar como segmentos. */
  options: SegmentedOption[];
  /** Valor actualmente seleccionado. */
  value: string;
  /** Se dispara con el nuevo valor al tocar un segmento. */
  onChange: (value: string) => void;
  /** Estilos del contenedor. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Control segmentado (pills) para alternar entre opciones mutuamente excluyentes.
 *
 * @example
 * <SegmentedControl
 *   options={[
 *     { label: "Crear", value: "create" },
 *     { label: "Unirse", value: "join" },
 *   ]}
 *   value={mode}
 *   onChange={setMode}
 * />
 */
export const SegmentedControl = ({ options, value, onChange, style }: SegmentedControlProps) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={[styles.container, style]}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.segment, isActive && styles.segmentActive]}
            activeOpacity={0.7}
            onPress={() => onChange(option.value)}>
            <Text style={[styles.label, isActive && styles.labelActive]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: colors.NEUTRAL[500],
      borderRadius: 30,
      padding: 4,
    },
    segment: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      borderRadius: 26,
    },
    segmentActive: {
      backgroundColor: colors.PRIMARY[500],
    },
    label: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.NEUTRAL[800],
    },
    labelActive: {
      color: "#fff",
    },
  });
