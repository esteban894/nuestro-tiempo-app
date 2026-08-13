import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

interface SegmentedOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
}

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
