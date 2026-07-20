import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Carousel from "react-native-reanimated-carousel";
import { MediaItem } from "../image-grid/ImageGrid";
import { ZoomableImage } from "./ZoomableImage";

const { width, height } = Dimensions.get("window");

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
  const isSingleImage = data.length <= 1;

  return (
    <Modal
      visible={index !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
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
            renderItem={({ item, index: itemIndex }) => (
              <View style={styles.itemWrapper}>
                <ZoomableImage
                  key={item.id}
                  uri={item.url}
                  recyclingKey={item.id}
                  onZoomChange={setIsZoomed}
                  onError={() => onImageError?.(item)}
                />
                {renderOverlay?.(item, itemIndex)}
              </View>
            )}
          />
        )}

        <Pressable style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="white" />
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.9)",
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
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});
