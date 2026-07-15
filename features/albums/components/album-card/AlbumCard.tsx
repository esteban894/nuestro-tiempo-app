import { ThemeColors } from "@/constants/colors";
import { useThemeColors } from "@/features/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Album } from "../../api/album.api";

interface AlbumCardProps {
  album: Album;
  index: number;
  onPress?: (album: Album) => void;
}

export const AlbumCard = ({ album, index, onPress }: AlbumCardProps) => {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const tilt = index % 2 === 0 ? "-2deg" : "2deg";

  return (
    <TouchableOpacity
      style={[styles.card, { transform: [{ rotate: tilt }] }]}
      activeOpacity={0.85}
      onPress={() => onPress?.(album)}>
      {album.coverImage ? (
        <Image source={{ uri: album.coverImage }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Ionicons name="images-outline" size={40} color={colors.NEUTRAL[600]} />
        </View>
      )}
      {album.name && (
        <View style={styles.captionWrapper}>
          <Text style={styles.caption} numberOfLines={1}>
            {album.name}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      width: "48%",
      marginBottom: 24,
      backgroundColor: colors.NEUTRAL[200],
      borderRadius: 20,
      padding: 10,
      elevation: 4,
      shadowColor: colors.SHADOW,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    image: {
      width: "100%",
      aspectRatio: 1,
      borderRadius: 10,
    },
    placeholder: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.NEUTRAL[500],
    },
    captionWrapper: {
      position: "absolute",
      bottom: 10,
      left: 0,
      right: 0,
      paddingHorizontal: 10,
      alignItems: "center",
    },
    caption: {
      maxWidth: "100%",
      fontFamily: "ElmsSans_400Regular",
      fontSize: 15,
      color: "#fff",
      backgroundColor: "rgba(0,0,0,0.20)",
      borderRadius: 20,
      textAlign: "center",
      paddingHorizontal: 5,
    },
  });
