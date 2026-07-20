import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ReactNode, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ExpandedImageModal } from "../image-carousel/ExpandedImageModal";

const GAP_PERCENT = 4;

/**
 * Shape shared by every image-displaying list in the app. Identity lives in `id`
 * (stable across refetches) rather than `url` (which, even with the API's deterministic
 * S3 signing, is still a distinct string per resource) — this is what lets FlatList/
 * Carousel keys and expo-image's `recyclingKey` avoid remounting on every refetch.
 */
export interface MediaItem {
  id: string;
  url: string;
}

interface Props {
  data: MediaItem[];
  numColumns?: number;
  renderOverlay?: (item: MediaItem, index: number) => ReactNode;
  renderExpandedOverlay?: (item: MediaItem, index: number) => ReactNode;
  onEndReached?: () => void;
  isFetchingNextPage?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onImageError?: (item: MediaItem) => void;
}

export function ImageGrid({
  data,
  numColumns = 2,
  renderOverlay,
  renderExpandedOverlay,
  onEndReached,
  isFetchingNextPage,
  refreshing,
  onRefresh,
  onImageError,
}: Props) {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const tileWidth = `${(100 - (numColumns - 1) * GAP_PERCENT) / numColumns}%` as `${number}%`;

  useEffect(() => {
    if (expandedIndex !== null && expandedIndex >= data.length) {
      setExpandedIndex(data.length > 0 ? data.length - 1 : null);
    }
  }, [data.length, expandedIndex]);

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={32} color={colors.NEUTRAL[600]} />
        <Text style={styles.emptyText}>No hay imágenes</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={!!refreshing}
              onRefresh={onRefresh}
              tintColor={colors.PRIMARY[500]}
              colors={[colors.PRIMARY[500]]}
            />
          ) : undefined
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.footer} color={colors.PRIMARY[500]} />
          ) : null
        }
        renderItem={({ item, index }) => (
          <View style={[styles.tile, { width: tileWidth }]}>
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

      <ExpandedImageModal
        data={data}
        index={expandedIndex}
        onClose={() => setExpandedIndex(null)}
        onIndexChange={setExpandedIndex}
        renderOverlay={renderExpandedOverlay ?? renderOverlay}
        onImageError={onImageError}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
    },
    emptyContainer: {
      height: 200,
      marginHorizontal: 20,
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
    content: {
      paddingHorizontal: 20,
      paddingBottom: 100,
    },
    row: {
      justifyContent: "space-between",
    },
    tile: {
      marginBottom: 16,
      position: "relative",
    },
    image: {
      width: "100%",
      aspectRatio: 1,
      borderRadius: 12,
    },
    footer: {
      marginVertical: 20,
    },
  });
