import { ThemeColors } from "@/constants/colors";
import { AlbumFab, AlbumGrid, useAlbumsInfiniteQuery } from "@/features/albums";
import { Title } from "@/features/common";
import { useThemeColors } from "@/features/theme";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function AlbumsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isRefetching, refetch } =
    useAlbumsInfiniteQuery();

  const albums = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <View style={styles.container}>
      <Title title="Nuestros Álbumes" variant="h2" style={styles.title} />
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={colors.PRIMARY[500]} />
      ) : (
        <AlbumGrid
          albums={albums}
          onAlbumPress={(album) =>
            router.push({ pathname: "/album/[id]", params: { id: album.id } })
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          isFetchingNextPage={isFetchingNextPage}
          refreshing={isRefetching}
          onRefresh={() => refetch()}
        />
      )}
      <AlbumFab style={styles.fab} onPress={() => router.push("/album/new")} />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, position: "relative", backgroundColor: colors.NEUTRAL[200] },
    title: { paddingHorizontal: 20, paddingTop: 20 },
    loader: { marginTop: 40 },
    fab: { position: "absolute", bottom: 24, right: 20 },
  });
