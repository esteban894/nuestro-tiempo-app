import { AlbumFab, AlbumGrid } from "@/features/albums";
import { Title } from "@/features/common";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function AlbumsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Title title="Nuestros Álbumes" variant="h2" style={styles.title} />
      <AlbumGrid
        onAlbumPress={(album) =>
          router.push({ pathname: "/album/[id]", params: { id: album.id } })
        }
      />
      <AlbumFab style={styles.fab} onPress={() => router.push("/album/new")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  title: { paddingHorizontal: 20, paddingTop: 20, color: "#212121" },
  fab: { position: "absolute", bottom: 24, right: 20 },
});
