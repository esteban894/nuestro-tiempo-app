import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Album } from "../../api/album.api";

interface AlbumCardProps {
  album: Album;
  index: number;
  onPress?: (album: Album) => void;
}

export const AlbumCard = ({ album, index, onPress }: AlbumCardProps) => {
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
          <Ionicons name="image-outline" size={40} color={colors.NEUTRAL[600]} />
        </View>
      )}
      <Text style={styles.caption} numberOfLines={1}>
        {album.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "48%",
    marginBottom: 24,
    backgroundColor: colors.NEUTRAL[200],
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 1,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.NEUTRAL[500],
  },
  caption: {
    marginTop: 10,
    fontFamily: "PlaywriteAUQLD_400Regular",
    fontSize: 15,
    color: colors.NEUTRAL[800],
    textAlign: "center",
  },
});
