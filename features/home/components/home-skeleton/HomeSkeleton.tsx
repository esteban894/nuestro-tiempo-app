import { Skeleton } from "@/features/common";
import { Dimensions, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");
const CAROUSEL_WIDTH = width - 40;

/** Placeholder del dashboard de inicio (carrusel, iniciales y contadores) mientras carga la pareja. */
export const HomeSkeleton = () => {
  return (
    <View style={styles.container}>
      <Skeleton width={CAROUSEL_WIDTH} height={400} borderRadius={16} />
      <View style={styles.dots}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} width={8} height={8} borderRadius={4} />
        ))}
      </View>

      <Skeleton width={140} height={40} borderRadius={12} style={styles.title} />

      <View style={styles.bigRow}>
        <Skeleton width="48%" height={92} borderRadius={16} />
        <Skeleton width="48%" height={92} borderRadius={16} />
      </View>
      <Skeleton width={120} height={20} borderRadius={6} style={styles.tick} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  title: {
    marginVertical: 20,
  },
  bigRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  tick: {
    marginTop: 16,
  },
});
