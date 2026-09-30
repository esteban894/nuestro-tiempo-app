import { ThemeColors } from "@/constants/colors";
import type { FileUploadState } from "@/features/images";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

export type UploadItem = FileUploadState & { uri?: string };

interface AlbumUploadStatusProps {
  items: UploadItem[] | undefined;
}

export const AlbumUploadStatus = ({ items }: AlbumUploadStatusProps) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  if (!items || items.length === 0) return null;

  const done = items.filter((item) => item.status === "done").length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ActivityIndicator color={colors.PRIMARY[500]} />
        <Text style={styles.label}>
          {t("albums.uploadProgress", { done, total: items.length })}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((item, index) => (
          <UploadThumbnail key={index} item={item} styles={styles} colors={colors} />
        ))}
      </ScrollView>
    </View>
  );
};

function UploadThumbnail({
  item,
  styles,
  colors,
}: {
  item: UploadItem;
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
}) {
  const { t } = useTranslation();
  const failed = item.status === "failed";
  // Indeterminate (unknown size) progress renders as a half bar rather than an empty one.
  const fraction = item.status === "done" ? 1 : (item.progress ?? 0.5);

  return (
    <View
      style={styles.thumb}
      accessibilityLabel={failed ? t("albums.uploadItemFailedA11y") : undefined}>
      {item.uri ? (
        <Image source={{ uri: item.uri }} style={styles.thumbImage} contentFit="cover" />
      ) : null}
      {item.status === "pending" && <View style={styles.dim} />}
      {failed ? (
        <View style={styles.failedOverlay}>
          <Ionicons name="alert-circle" size={18} color={colors.ERROR[500]} />
        </View>
      ) : (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(fraction * 100)}%` }]} />
        </View>
      )}
    </View>
  );
}

const THUMB_SIZE = 40;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 24,
      left: 20,
      right: 92,
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colors.NEUTRAL[200],
      shadowColor: colors.SHADOW,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 3,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.NEUTRAL[800],
    },
    row: {
      gap: 6,
    },
    thumb: {
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: 8,
      overflow: "hidden",
      backgroundColor: colors.NEUTRAL[500],
    },
    thumbImage: {
      ...StyleSheet.absoluteFillObject,
    },
    dim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.OVERLAY,
    },
    failedOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.OVERLAY,
    },
    track: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 4,
      backgroundColor: colors.OVERLAY,
    },
    fill: {
      height: "100%",
      backgroundColor: colors.PRIMARY[500],
    },
  });
