import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode, useRef, useState } from "react";
import { Dimensions, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

const { width, height } = Dimensions.get("window");

interface Props {
  data: string[];
  renderOverlay?: (item: string, index: number) => ReactNode;
}

export function ImageCarousel({ data, renderOverlay }: Props) {
  const ref = useRef<ICarouselInstance>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const progress = useSharedValue(0);

  if (data.length === 0) {
    return (
      <View style={styles.wrapper}>
        <View style={[styles.carouselContainer, styles.emptyContainer]}>
          <Ionicons name="images-outline" size={32} color="#9ca3af" />
          <Text style={styles.emptyText}>No hay imágenes</Text>
        </View>
      </View>
    );
  }

  const isSingleImage = data.length === 1;

  return (
    <View style={styles.wrapper}>
      <View style={styles.carouselContainer}>
        <Carousel
          ref={ref}
          width={width - 40}
          height={400}
          data={data}
          scrollAnimationDuration={800}
          enabled={!isSingleImage}
          onProgressChange={progress}
          renderItem={({ item, index }) => (
            <View style={styles.itemWrapper}>
              <Pressable onPress={() => setExpandedImage(item)}>
                <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
              </Pressable>
              {renderOverlay?.(item, index)}
            </View>
          )}
        />

        <Pressable
          disabled={isSingleImage}
          style={[
            styles.arrowButton,
            styles.leftButton,
            isSingleImage && styles.arrowButtonDisabled,
          ]}
          onPress={() => ref.current?.prev()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </Pressable>

        <Pressable
          disabled={isSingleImage}
          style={[
            styles.arrowButton,
            styles.rightButton,
            isSingleImage && styles.arrowButtonDisabled,
          ]}
          onPress={() => ref.current?.next()}>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </Pressable>
      </View>

      <View style={styles.pagination}>
        {data.map((_, index) => (
          <Pressable key={index} onPress={() => ref.current?.scrollTo({ index, animated: true })}>
            <PaginationDot index={index} progress={progress} />
          </Pressable>
        ))}
      </View>

      <Modal
        visible={expandedImage !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setExpandedImage(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setExpandedImage(null)} />

          {expandedImage && (
            <Image
              source={{ uri: expandedImage }}
              style={styles.expandedImage}
              resizeMode="contain"
            />
          )}

          <Pressable style={styles.closeButton} onPress={() => setExpandedImage(null)}>
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

interface PaginationDotProps {
  index: number;
  progress: SharedValue<number>;
}

function PaginationDot({ index, progress }: PaginationDotProps) {
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
  wrapper: {
    alignItems: "center",
  },
  carouselContainer: {
    position: "relative",
  },
  emptyContainer: {
    width: width - 40,
    height: 400,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#9ca3af",
  },
  itemWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  arrowButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  arrowButtonDisabled: {
    opacity: 0.4,
  },
  leftButton: {
    left: 10,
  },
  rightButton: {
    right: 10,
  },
  pagination: {
    flexDirection: "row",
    marginTop: 14,
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  expandedImage: {
    width,
    height,
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
