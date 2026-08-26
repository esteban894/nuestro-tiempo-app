import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ReactNode, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { MediaItem } from "../image-grid/ImageGrid";
import { ExpandedImageModal } from "./ExpandedImageModal";
import { PaginationDots } from "./PaginationDots";

const { width } = Dimensions.get("window");

const REACH_END_BUFFER = 3;

interface Props {
  data: MediaItem[];
  renderArrows?: boolean;
  renderOverlay?: (item: MediaItem, index: number) => ReactNode;
  onImageError?: (item: MediaItem) => void;
  onReachEnd?: () => void;
}

export function ImageCarousel({
  data,
  renderArrows = false,
  renderOverlay,
  onImageError,
  onReachEnd,
}: Props) {
  const { t } = useTranslation();
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
          <Text style={styles.emptyText}>{t("common.emptyImages.description")}</Text>
        </View>
      </View>
    );
  }

  const isSingleImage = data.length === 1;

  const handleExpandedIndexChange = (index: number) => {
    setExpandedIndex(index);
    ref.current?.scrollTo({ index, animated: false });
  };

  const handleSnapToItem = (index: number) => {
    if (data.length - index <= REACH_END_BUFFER) onReachEnd?.();
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
          onSnapToItem={handleSnapToItem}
          renderItem={({ item, index }) => (
            <View style={styles.itemWrapper}>
              <Pressable onPress={() => setExpandedIndex(index)}>
                <Image
                  source={{ uri: item.url }}
                  style={styles.image}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  recyclingKey={item.id}
                  onError={() => onImageError?.(item)}
                />
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
              <Ionicons name="chevron-back" size={24} color={colors.WHITE} />
            </Pressable>

            <Pressable
              disabled={isSingleImage}
              style={[
                styles.arrowButton,
                styles.rightButton,
                isSingleImage && styles.arrowButtonDisabled,
              ]}
              onPress={() => ref.current?.next()}>
              <Ionicons name="chevron-forward" size={24} color={colors.WHITE} />
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
        onImageError={onImageError}
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
      borderRadius: 12,
      shadowColor: colors.SHADOW,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    arrowButton: {
      position: "absolute",
      top: "50%",
      transform: [{ translateY: -20 }],
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.OVERLAY,
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
