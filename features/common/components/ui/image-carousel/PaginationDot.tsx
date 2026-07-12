import { useThemeColors } from "@/features/theme";
import { StyleSheet } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

interface Props {
  index: number;
  progress: SharedValue<number>;
  total: number;
  maxVisible?: number;
}

export function PaginationDot({ index, progress, total, maxVisible = 5 }: Props) {
  const colors = useThemeColors();
  const inactiveColor = colors.NEUTRAL[600];
  const activeColor = colors.NEUTRAL[800];

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [index - 1, index, index + 1];

    const dotWidth = interpolate(progress.value, inputRange, [8, 16, 8], Extrapolation.CLAMP);
    const backgroundColor = interpolateColor(progress.value, inputRange, [
      inactiveColor,
      activeColor,
      inactiveColor,
    ]);

    let scale = 1;
    let opacity = 1;

    if (total > maxVisible) {
      const half = Math.floor(maxVisible / 2);
      const center = Math.min(Math.max(progress.value, half), total - 1 - half);
      const distance = Math.abs(index - center);

      scale = interpolate(distance, [half - 1, half, half + 1], [1, 0.6, 0.3], Extrapolation.CLAMP);
      opacity = interpolate(distance, [half, half + 1], [1, 0], Extrapolation.CLAMP);
    }

    return { width: dotWidth, backgroundColor, opacity, transform: [{ scale }] };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
});
