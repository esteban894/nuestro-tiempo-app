import { Skeleton } from "@/features/common";
import { StyleSheet, View } from "react-native";

/** Placeholder que replica el layout del formulario de álbum mientras se precargan sus datos. */
export const AlbumFormSkeleton = () => {
  return (
    <View style={styles.content}>
      <Skeleton width={160} height={160} borderRadius={16} style={styles.cover} />
      <Skeleton width={80} height={14} borderRadius={6} style={styles.label} />
      <Skeleton width="100%" height={48} borderRadius={12} style={styles.input} />
      <Skeleton width={160} height={22} borderRadius={6} style={styles.checkbox} />
      <Skeleton width="100%" height={52} borderRadius={12} />
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  cover: {
    alignSelf: "center",
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 24,
  },
  checkbox: {
    marginBottom: 24,
  },
});
