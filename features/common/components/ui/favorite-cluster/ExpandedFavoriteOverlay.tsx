import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { FavoriteCluster, FavoriterBubble } from "./FavoriteCluster";

interface Props {
  favoritedByMe: boolean;
  favoriters: FavoriterBubble[];
  onToggle: () => void;
  style?: StyleProp<ViewStyle>;
}

const BLOOM_SIZE = 120;

export function ExpandedFavoriteOverlay({ favoritedByMe, favoriters, onToggle, style }: Props) {
  const colors = useThemeColors();
  const reducedMotion = useReducedMotion();
  const bloomOpacity = useSharedValue(0);
  const bloomScale = useSharedValue(0.6);

  const bloomStyle = useAnimatedStyle(() => ({
    opacity: bloomOpacity.value,
    transform: [{ scale: bloomScale.value }],
  }));

  const handleToggle = () => {
    const willFavorite = !favoritedByMe;
    onToggle();
    if (!willFavorite || reducedMotion) return;
    bloomOpacity.value = 1;
    bloomScale.value = 0.6;
    bloomOpacity.value = withTiming(0, { duration: 450 });
    bloomScale.value = withTiming(1.2, { duration: 450 });
  };

  return (
    <>
      <FavoriteCluster
        favoritedByMe={favoritedByMe}
        favoriters={favoriters}
        onToggle={handleToggle}
        size="large"
        style={style}
      />
      <Animated.View pointerEvents="none" style={[styles.bloomContainer, bloomStyle]}>
        <Ionicons name="heart" size={BLOOM_SIZE} color={colors.PRIMARY[500]} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  bloomContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
