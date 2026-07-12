import { Pressable, StyleSheet, View } from "react-native";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { PaginationDot } from "./PaginationDot";

const MAX_VISIBLE_DOTS = 5;
const DOT_SIZE = 8;
const DOT_GAP = 8;
const STEP = DOT_SIZE + DOT_GAP;
const HALF = Math.floor(MAX_VISIBLE_DOTS / 2);

interface Props {
  total: number;
  progress: SharedValue<number>;
  onDotPress: (index: number) => void;
}

export function PaginationDots({ total, progress, onDotPress }: Props) {
  const shouldRotate = total > MAX_VISIBLE_DOTS;

  const stripStyle = useAnimatedStyle(() => {
    if (!shouldRotate) return { transform: [{ translateX: 0 }] };

    const center = Math.min(Math.max(progress.value, HALF), total - 1 - HALF);
    return { transform: [{ translateX: -(center - HALF) * STEP }] };
  });

  return (
    <View style={[styles.viewport, shouldRotate && { width: MAX_VISIBLE_DOTS * STEP }]}>
      <Animated.View style={[styles.strip, stripStyle]}>
        {Array.from({ length: total }).map((_, index) => (
          <Pressable key={index} onPress={() => onDotPress(index)} style={styles.dotSlot}>
            <PaginationDot index={index} progress={progress} total={total} />
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    overflow: "hidden",
  },
  strip: {
    flexDirection: "row",
  },
  // Ancho fijo por punto (incluye el espaciado) para que el desplazamiento
  // animado de la tira (translateX) se calcule con un paso uniforme,
  // sin verse afectado por la animación de ancho del punto activo.
  dotSlot: {
    width: STEP,
    height: DOT_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
});
