import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

export interface OverflowMenuOption {
  label: string;
  icon?: IoniconsName;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface OverflowMenuProps {
  options: OverflowMenuOption[];
  triggerIcon?: IoniconsName;
  triggerColor?: string;
  triggerStyle?: StyleProp<ViewStyle>;
}

type AnchorSide = "left" | "right";

interface Anchor {
  top: number;
  side: AnchorSide;
  offset: number;
  maxWidth: number;
}

const EDGE_MARGIN = 12;
const MENU_MIN_WIDTH = 160;
const MENU_MAX_WIDTH_CAP = 240;

export const OverflowMenu = ({
  options,
  triggerIcon = "ellipsis-vertical",
  triggerColor,
  triggerStyle,
}: OverflowMenuProps) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const resolvedTriggerColor = triggerColor ?? colors.NEUTRAL[800];
  const triggerRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(anchor ? 1 : 0, { duration: 160 });
  }, [anchor, progress]);

  const animatedMenuStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.9 + progress.value * 0.1 }],
  }));

  const handleOpen = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const windowWidth = Dimensions.get("window").width;
      const maxWidth = Math.min(MENU_MAX_WIDTH_CAP, windowWidth - EDGE_MARGIN * 2);
      const top = y + height + 6;
      const triggerCenterX = x + width / 2;
      const side: AnchorSide = triggerCenterX >= windowWidth / 2 ? "right" : "left";

      const maxOffset = Math.max(EDGE_MARGIN, windowWidth - maxWidth - EDGE_MARGIN);
      const rawOffset = side === "right" ? windowWidth - (x + width) : x;
      const offset = Math.min(Math.max(rawOffset, EDGE_MARGIN), maxOffset);

      setAnchor({ top, side, offset, maxWidth });
    });
  };

  const handleSelect = (option: OverflowMenuOption) => {
    if (option.disabled) return;
    setAnchor(null);
    option.onPress();
  };

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        style={[styles.trigger, triggerStyle]}
        activeOpacity={0.7}
        onPress={handleOpen}>
        <Ionicons name={triggerIcon} size={20} color={resolvedTriggerColor} />
      </TouchableOpacity>

      <Modal
        visible={anchor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setAnchor(null)}>
        <Pressable style={styles.backdrop} onPress={() => setAnchor(null)} />
        <Animated.View
          style={[
            styles.menu,
            anchor && {
              top: anchor.top,
              maxWidth: anchor.maxWidth,
              ...(anchor.side === "right" ? { right: anchor.offset } : { left: anchor.offset }),
              transformOrigin: anchor.side === "right" ? "100% 0%" : "0% 0%",
            },
            animatedMenuStyle,
          ]}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.label}
              style={[styles.row, option.disabled && styles.rowDisabled]}
              activeOpacity={0.7}
              disabled={option.disabled}
              onPress={() => handleSelect(option)}>
              {option.icon && (
                <Ionicons
                  name={option.icon}
                  size={18}
                  color={option.destructive ? colors.ERROR[500] : colors.NEUTRAL[800]}
                  style={styles.rowIcon}
                />
              )}
              <Text style={[styles.rowLabel, option.destructive && styles.rowLabelDestructive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Modal>
    </>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    trigger: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    menu: {
      position: "absolute",
      minWidth: MENU_MIN_WIDTH,
      backgroundColor: colors.NEUTRAL[200],
      borderRadius: 14,
      paddingVertical: 6,
      elevation: 3,
      shadowColor: colors.SHADOW,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.14,
      shadowRadius: 12,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    rowDisabled: {
      opacity: 0.4,
    },
    rowIcon: {
      marginRight: 10,
    },
    rowLabel: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.NEUTRAL[800],
    },
    rowLabelDestructive: {
      color: colors.ERROR[500],
    },
  });
