import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useRef, useState } from "react";
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { ExpandedImageModal } from "./ExpandedImageModal";
import { PaginationDots } from "./PaginationDots";

const { width } = Dimensions.get("window");

interface Props {
  data: string[];
  renderArrows?: boolean;
  renderOverlay?: (item: string, index: number) => ReactNode;
}

export function ImageCarousel({ data, renderArrows = false, renderOverlay }: Props) {
  const ref = useRef<ICarouselInstance>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const progress = useSharedValue(0);
  const colors = useThemeColors();
  const styles = createStyles(colors);

  if (data.length === 0) {
    return (
      <View style={styles.wrapper}>
        <View style={[styles.carouselContainer, styles.emptyContainer]}>
          <Ionicons name="images-outline" size={32} color={colors.NEUTRAL[600]} />
          <Text style={styles.emptyText}>No hay imágenes</Text>
        </View>
      </View>
    );
  }

  const isSingleImage = data.length === 1;

  const handleExpandedIndexChange = (index: number) => {
    setExpandedIndex(index);
    ref.current?.scrollTo({ index, animated: false });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.carouselContainer}>
        <Carousel
          ref={ref}
          width={width - 40}
          height={400}
          data={data}
          scrollAnimationDuration={500}
          autoPlay={!isSingleImage && expandedIndex === null}
          autoPlayInterval={2000}
          loop
          enabled={!isSingleImage}
          onProgressChange={progress}
          renderItem={({ item, index }) => (
            <View style={styles.itemWrapper}>
              <Pressable onPress={() => setExpandedIndex(index)}>
                <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
              </Pressable>
              {renderOverlay?.(item, index)}
            </View>
          )}
        />

        {renderArrows && (
          <>
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
          </>
        )}
      </View>

      <View style={styles.pagination}>
        <PaginationDots
          total={data.length}
          progress={progress}
          onDotPress={(index) => ref.current?.scrollTo({ index, animated: true })}
        />
      </View>

      <ExpandedImageModal
        data={data}
        index={expandedIndex}
        onClose={() => setExpandedIndex(null)}
        onIndexChange={handleExpandedIndexChange}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
      backgroundColor: colors.NEUTRAL[500],
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    emptyText: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.NEUTRAL[600],
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
  });
