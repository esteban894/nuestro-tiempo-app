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

/**
 * The expanded photo's favorite control: the heart-plus-bubbles cluster, plus a one-shot
 * gold heart "bloom" that scales up and fades over the photo when *marking* it as a
 * favorite (not when un-favoriting — that shouldn't feel like a celebration). Lives
 * entirely inside the overlay slot `ExpandedImageModal` already renders per photo, so no
 * changes are needed to the carousel/zoom machinery itself.
 */
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
