import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

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

const PILL_DURATION = 220;

type SegmentLayout = { x: number; y: number; width: number; height: number };

export const SegmentedControl = ({ options, value, onChange, style }: SegmentedControlProps) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [layouts, setLayouts] = useState<Record<string, SegmentLayout>>({});
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);
  const hasMeasured = useRef(false);

  const activeLayout = layouts[value];

  useEffect(() => {
    if (!activeLayout) return;
    if (hasMeasured.current) {
      translateX.value = withTiming(activeLayout.x, { duration: PILL_DURATION });
      translateY.value = withTiming(activeLayout.y, { duration: PILL_DURATION });
      width.value = withTiming(activeLayout.width, { duration: PILL_DURATION });
      height.value = withTiming(activeLayout.height, { duration: PILL_DURATION });
    } else {
      translateX.value = activeLayout.x;
      translateY.value = activeLayout.y;
      width.value = activeLayout.width;
      height.value = activeLayout.height;
      hasMeasured.current = true;
    }
  }, [activeLayout, translateX, translateY, width, height]);

  const pillStyle = useAnimatedStyle(() => ({
    width: width.value,
    height: height.value,
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  const handleSegmentLayout = (optionValue: string, event: LayoutChangeEvent) => {
    const { x, y, width: segmentWidth, height: segmentHeight } = event.nativeEvent.layout;
    setLayouts((prev) => {
      const existing = prev[optionValue];
      if (
        existing &&
        existing.x === x &&
        existing.y === y &&
        existing.width === segmentWidth &&
        existing.height === segmentHeight
      ) {
        return prev;
      }
      return { ...prev, [optionValue]: { x, y, width: segmentWidth, height: segmentHeight } };
    });
  };

  return (
    <View style={[styles.container, style]}>
      {activeLayout && <Animated.View style={[styles.pill, pillStyle]} />}
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={styles.segment}
            activeOpacity={0.7}
            onLayout={(event) => handleSegmentLayout(option.value, event)}
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
    pill: {
      position: "absolute",
      top: 0,
      left: 0,
      borderRadius: 26,
      backgroundColor: colors.PRIMARY[500],
    },
    segment: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      borderRadius: 26,
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
