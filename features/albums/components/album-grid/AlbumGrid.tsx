import { colors } from "@/constants/colors";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet } from "react-native";
import { Album } from "../../api/album.api";
import { AlbumCard } from "../album-card/AlbumCard";

interface AlbumGridProps {
  albums: Album[];
  onAlbumPress?: (album: Album) => void;
  onEndReached?: () => void;
  isFetchingNextPage?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const AlbumGrid = ({
  albums,
  onAlbumPress,
  onEndReached,
  isFetchingNextPage,
  refreshing,
  onRefresh,
}: AlbumGridProps) => {
  return (
    <FlatList
      data={albums}
      keyExtractor={(item) => item.id}
      numColumns={2}
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
        <AlbumCard album={item} index={index} onPress={onAlbumPress} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
  },
  footer: {
    marginVertical: 20,
  },
});
