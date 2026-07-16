import { ThemeColors } from "@/constants/colors";
import { Skeleton } from "@/features/common";
import { useThemeColors } from "@/features/theme";
import { StyleSheet, View } from "react-native";

const TILE_COUNT = 6;

/** Placeholder que replica el layout del álbum mientras se cargan sus datos. */
export const AlbumDetailSkeleton = () => {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Skeleton width={90} height={22} borderRadius={12} />
      </View>
      <View style={styles.grid}>
        {Array.from({ length: TILE_COUNT }).map((_, index) => (
          <Skeleton key={index} width="48%" height={undefined} borderRadius={12} style={styles.tile} />
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.NEUTRAL[200],
    },
    header: {
      marginVertical: 10,
      paddingHorizontal: 20,
      paddingTop: 20,
      alignItems: "center",
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    },
    tile: {
      aspectRatio: 1,
      marginBottom: 16,
    },
  });
