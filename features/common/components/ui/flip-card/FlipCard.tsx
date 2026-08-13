import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";

interface FlipCardProps {
  isFlipped: boolean;
  front: ReactNode;
  back: ReactNode;
  style?: StyleProp<ViewStyle>;
  duration?: number;
}

export const FlipCard = ({ isFlipped, front, back, style, duration = 500 }: FlipCardProps) => {
  const rotation = useDerivedValue(() => withTiming(isFlipped ? 180 : 0, { duration }));

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotation.value}deg` }],
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotation.value + 180}deg` }],
    opacity: interpolate(rotation.value, [0, 90, 180], [0, 0, 1]),
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.face, frontStyle]} pointerEvents={isFlipped ? "none" : "auto"}>
        {front}
      </Animated.View>
      <Animated.View
        style={[styles.face, styles.back, backStyle]}
        pointerEvents={isFlipped ? "auto" : "none"}>
        {back}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  face: {
    width: "100%",
    backfaceVisibility: "hidden",
  },
  back: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
