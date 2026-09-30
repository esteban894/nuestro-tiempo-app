import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { MediaItem } from "../image-grid/ImageGrid";
import { ZoomableImage } from "./ZoomableImage";

const { width, height } = Dimensions.get("window");

const CHROME_FADE_MS = 200;

interface Props {
  data: MediaItem[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  renderOverlay?: (item: MediaItem, index: number) => ReactNode;
  onImageError?: (item: MediaItem) => void;
}

export function ExpandedImageModal({
  data,
  index,
  onClose,
  onIndexChange,
  renderOverlay,
  onImageError,
}: Props) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const chromeOpacity = useSharedValue(1);
  const isSingleImage = data.length <= 1;
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const currentItem = index !== null ? data[index] : undefined;

  const showChrome = (visible: boolean) => {
    setChromeVisible(visible);
    chromeOpacity.value = withTiming(visible ? 1 : 0, { duration: CHROME_FADE_MS });
  };

  const chromeStyle = useAnimatedStyle(() => ({ opacity: chromeOpacity.value }));

  return (
    <Modal
      visible={index !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onShow={() => showChrome(true)}
      onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        {index !== null && (
          <Carousel
            width={width}
            height={height}
            data={data}
            defaultIndex={index}
            autoPlay={false}
            loop={!isSingleImage}
            enabled={!isSingleImage && !isZoomed}
            onSnapToItem={onIndexChange}
            renderItem={({ item }) => (
              <View style={styles.itemWrapper}>
                <ZoomableImage
                  key={item.id}
                  uri={item.url}
                  recyclingKey={item.id}
                  onZoomChange={setIsZoomed}
                  onError={() => onImageError?.(item)}
                  onSingleTap={() => showChrome(!chromeVisible)}
                />
              </View>
            )}
          />
        )}

        {/* Controls live outside the carousel so they stay put while swiping;
            a single tap on the image fades them in and out. */}
        <Animated.View
          style={[StyleSheet.absoluteFill, chromeStyle]}
          pointerEvents={chromeVisible ? "box-none" : "none"}>
          {index !== null && currentItem && renderOverlay?.(currentItem, index)}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color={colors.WHITE} />
          </Pressable>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.OVERLAY_STRONG,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    itemWrapper: {
      width: "100%",
      height: "100%",
      position: "relative",
    },
    closeButton: {
      position: "absolute",
      top: 50,
      right: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.OVERLAY,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
  });
