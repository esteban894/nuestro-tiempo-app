import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { InitialBubble } from "../initial-bubble/InitialBubble";

export interface FavoriterBubble {
  name: string;
  tone: "me" | "partner";
}

interface Props {
  favoritedByMe: boolean;
  favoriters: FavoriterBubble[];
  onToggle: () => void;
  size?: "compact" | "large";
  style?: StyleProp<ViewStyle>;
}

const DIMENSIONS = {
  compact: { trigger: 32, heart: 18, bubble: 16 },
  large: { trigger: 44, heart: 24, bubble: 20 },
};

export function FavoriteCluster({
  favoritedByMe,
  favoriters,
  onToggle,
  size = "compact",
  style,
}: Props) {
  const colors = useThemeColors();
  const dims = DIMENSIONS[size];
  const scale = useSharedValue(1);

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withTiming(1.3, { duration: 120 }),
      withTiming(1, { duration: 140 }),
    );
    onToggle();
  };

  return (
    <View style={[styles.row, style]}>
      <Pressable
        style={[
          styles.trigger,
          { width: dims.trigger, height: dims.trigger, borderRadius: dims.trigger / 2 },
        ]}
        hitSlop={8}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={favoritedByMe ? "Quitar de favoritos" : "Marcar como favorita"}>
        <Animated.View style={animatedHeartStyle}>
          <Ionicons
            name={favoritedByMe ? "heart" : "heart-outline"}
            size={dims.heart}
            color={favoritedByMe ? colors.PRIMARY[500] : "#fff"}
          />
        </Animated.View>
      </Pressable>

      {favoriters.length > 0 && (
        <View style={styles.bubbles}>
          {favoriters.map((favoriter, index) => (
            <InitialBubble
              key={`${favoriter.tone}-${favoriter.name}`}
              name={favoriter.name}
              tone={favoriter.tone}
              size={dims.bubble}
              style={index > 0 ? styles.bubbleOverlap : undefined}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  trigger: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  bubbles: {
    flexDirection: "row",
    marginLeft: 4,
  },
  bubbleOverlap: {
    marginLeft: -6,
  },
});
