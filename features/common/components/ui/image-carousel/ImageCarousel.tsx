import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Dimensions, Image, Pressable, StyleSheet, View } from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

interface Props {
  data: string[];
}

export function ImageCarousel({ data }: Props) {
  const ref = useRef<ICarouselInstance>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.wrapper}>
      <View style={styles.carouselContainer}>
        <Carousel
          ref={ref}
          width={width - 40}
          height={400}
          data={data}
          scrollAnimationDuration={800}
          onSnapToItem={(index) => setActiveIndex(index)}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
          )}
        />

        <Pressable
          style={[styles.arrowButton, styles.leftButton]}
          onPress={() => ref.current?.prev()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </Pressable>

        <Pressable
          style={[styles.arrowButton, styles.rightButton]}
          onPress={() => ref.current?.next()}>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </Pressable>
      </View>

      <View style={styles.pagination}>
        {data.map((_, index) => {
          const isActive = index === activeIndex;

          return (
            <Pressable
              key={index}
              onPress={() => ref.current?.scrollTo({ index, animated: true })}
              style={[styles.dot, isActive && styles.activeDot]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  carouselContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  arrowButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  leftButton: {
    left: 10,
  },
  rightButton: {
    right: 10,
  },
  pagination: {
    flexDirection: "row",
    marginTop: 14,
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#cbd5e1",
  },
  activeDot: {
    width: 16,
    backgroundColor: "#111827",
  },
});
