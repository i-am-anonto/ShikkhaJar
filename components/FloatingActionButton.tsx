import React from "react";
import { StyleSheet, Pressable, Platform, View, Text, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";

import { Spacing, Shadows, BorderRadius, Typography } from "@/constants/theme";

const { width: screenWidth } = Dimensions.get("window");

interface FloatingActionButtonProps {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  color: string;
  label?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingActionButton({ icon, onPress, color, label }: FloatingActionButtonProps) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  if (label) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.extendedContainer,
          {
            backgroundColor: color,
            bottom: tabBarHeight + Spacing.xl,
            ...Shadows.large,
          },
          animatedStyle,
        ]}
      >
        <View style={styles.extendedContent}>
          <Feather name={icon} size={22} color="#FFFFFF" />
          <Text style={styles.label}>{label}</Text>
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: color,
          bottom: tabBarHeight + Spacing.xl,
          ...Shadows.large,
        },
        animatedStyle,
      ]}
    >
      <Feather name={icon} size={24} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: Spacing.xl,
    width: Spacing.fabSize,
    height: Spacing.fabSize,
    borderRadius: Spacing.fabSize / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  extendedContainer: {
    position: "absolute",
    right: Spacing.xl,
    width: screenWidth - (Spacing.xl * 2),
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  extendedContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  label: {
    color: "#FFFFFF",
    fontSize: Typography.body.fontSize,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
