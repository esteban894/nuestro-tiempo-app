import { FlatList, StyleSheet } from "react-native";
import { Album, mockAlbums } from "../../data/mockAlbums";
import { AlbumCard } from "../album-card/AlbumCard";

interface AlbumGridProps {
  albums?: Album[];
  onAlbumPress?: (album: Album) => void;
}

export const AlbumGrid = ({ albums = mockAlbums, onAlbumPress }: AlbumGridProps) => {
  return (
    <FlatList
      data={albums}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
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
});
