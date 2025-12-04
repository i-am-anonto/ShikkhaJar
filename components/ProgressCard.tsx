import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ProgressCardProps {
  title: string;
  value: number;
  label: string;
  color: string;
}

export function ProgressCard({ title, value, label, color }: ProgressCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: color + "15" }]}>
      <View style={styles.content}>
        <ThemedText type="small" style={[styles.title, { color }]}>
          {title}
        </ThemedText>
        <View style={styles.valueRow}>
          <ThemedText type="h1" style={[styles.value, { color }]}>
            {value}
          </ThemedText>
          <ThemedText type="body" style={[styles.label, { color }]}>
            {label}
          </ThemedText>
        </View>
      </View>
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <View style={[styles.iconInner, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.sm,
  },
  value: {
    fontSize: 48,
    fontWeight: "700",
  },
  label: {
    opacity: 0.8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});
