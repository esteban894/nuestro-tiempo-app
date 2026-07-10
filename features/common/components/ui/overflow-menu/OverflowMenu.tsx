import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, useRef, useState } from "react";
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

interface Anchor {
  top: number;
  right: number;
}

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

  const handleOpen = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const windowWidth = Dimensions.get("window").width;
      setAnchor({ top: y + height + 6, right: windowWidth - x - width });
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
        <View style={[styles.menu, anchor && { top: anchor.top, right: anchor.right }]}>
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
        </View>
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
      minWidth: 200,
      backgroundColor: colors.NEUTRAL[200],
      borderRadius: 14,
      paddingVertical: 6,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3.84,
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
