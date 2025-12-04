import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

interface CelebrationAnimationProps {
  color: string;
}

const PARTICLE_COUNT = 30;

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

function Particle({ particle }: { particle: Particle }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    const randomX = (Math.random() - 0.5) * 200;
    const randomY = -(100 + Math.random() * 200);

    scale.value = withDelay(
      particle.delay,
      withSequence(
        withSpring(1, { damping: 10, stiffness: 100 }),
        withDelay(500, withTiming(0, { duration: 500 }))
      )
    );

    translateY.value = withDelay(
      particle.delay,
      withTiming(randomY, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );

    translateX.value = withDelay(
      particle.delay,
      withTiming(randomX, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );

    rotation.value = withDelay(
      particle.delay,
      withTiming(Math.random() * 720 - 360, { duration: 1000 })
    );

    opacity.value = withDelay(
      particle.delay + 700,
      withTiming(0, { duration: 300 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          borderRadius: particle.size / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

export function CelebrationAnimation({ color }: CelebrationAnimationProps) {
  const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: width / 2 - 5,
    y: height / 2 - 5,
    size: 8 + Math.random() * 8,
    color: i % 3 === 0 ? color : i % 3 === 1 ? "#FFD700" : "#FFFFFF",
    delay: Math.random() * 200,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <Particle key={particle.id} particle={particle} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  particle: {
    position: "absolute",
  },
});
