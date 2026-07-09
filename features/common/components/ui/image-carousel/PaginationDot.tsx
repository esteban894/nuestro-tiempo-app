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
}

export function PaginationDot({ index, progress }: Props) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [index - 1, index, index + 1];

    const dotWidth = interpolate(progress.value, inputRange, [8, 16, 8], Extrapolation.CLAMP);
    const backgroundColor = interpolateColor(progress.value, inputRange, [
      "#cbd5e1",
      "#111827",
      "#cbd5e1",
    ]);

    return { width: dotWidth, backgroundColor };
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
