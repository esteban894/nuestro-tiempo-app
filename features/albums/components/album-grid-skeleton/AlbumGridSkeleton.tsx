import { Skeleton } from "@/features/common";
import { StyleSheet, View } from "react-native";

const CARD_COUNT = 6;

export const AlbumGridSkeleton = () => {
  return (
    <View style={styles.grid}>
      {Array.from({ length: CARD_COUNT }).map((_, index) => (
        <Skeleton
          key={index}
          width="48%"
          height={undefined}
          borderRadius={20}
          style={[styles.card, { transform: [{ rotate: index % 2 === 0 ? "-2deg" : "2deg" }] }]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 20,
  },
  card: {
    aspectRatio: 1,
    marginBottom: 24,
  },
});
