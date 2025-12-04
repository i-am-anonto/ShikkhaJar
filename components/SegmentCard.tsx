import React, { useMemo } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { Segment, DayOfWeek } from "@/constants/types";
import { Spacing, BorderRadius, AttendanceColors } from "@/constants/theme";
import { formatDate } from "@/utils/storage";

interface SegmentCardProps {
  segment: Segment;
  progress: { taken: number; target: number; daysRemaining: number };
  onPress: () => void;
  attendanceColor: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

export function SegmentCard({ segment, progress, onPress, attendanceColor }: SegmentCardProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const progressPercent = useMemo(() => {
    if (progress.target === 0) return 0;
    return Math.min(100, (progress.taken / progress.target) * 100);
  }, [progress]);

  const statusColor = useMemo(() => {
    if (progress.daysRemaining <= 0) return AttendanceColors.paid;
    if (progress.daysRemaining <= 2) return AttendanceColors.rescheduled;
    return attendanceColor;
  }, [progress, attendanceColor]);

  const statusMessage = useMemo(() => {
    if (progress.daysRemaining === 0) return t("cycleCompleted");
    if (progress.daysRemaining === 1) return t("tomorrowCompletes");
    if (progress.daysRemaining === 2) return t("preparePayment");
    return `${progress.taken}/${progress.target} ${t("sessions")}`;
  }, [progress, t]);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        { backgroundColor: theme.cardBackground },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.subjectBadge, { backgroundColor: statusColor + "20" }]}>
            <ThemedText type="small" style={{ color: statusColor, fontWeight: "600" }}>
              {segment.subject}
            </ThemedText>
          </View>
          {!segment.isCollaborated ? (
            <View style={[styles.soloIndicator, { backgroundColor: theme.warning + "20" }]}>
              <Feather name="user" size={12} color={theme.warning} />
            </View>
          ) : null}
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </View>

      <ThemedText type="h4" style={styles.partnerName}>
        {segment.partnerName}
      </ThemedText>

      <View style={styles.daysRow}>
        {DAYS_SHORT.map((day, index) => {
          const isClassDay = segment.classDays.includes(index as DayOfWeek);
          return (
            <View
              key={index}
              style={[
                styles.dayIndicator,
                {
                  backgroundColor: isClassDay ? statusColor + "20" : "transparent",
                  borderColor: isClassDay ? statusColor : theme.border,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: isClassDay ? statusColor : theme.textSecondary,
                  fontWeight: isClassDay ? "600" : "400",
                }}
              >
                {day}
              </ThemedText>
            </View>
          );
        })}
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressTrack, { backgroundColor: theme.backgroundDefault }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: statusColor,
                width: `${progressPercent}%`,
              },
            ]}
          />
        </View>
        <ThemedText type="small" style={[styles.progressText, { color: statusColor }]}>
          {statusMessage}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  subjectBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  soloIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  partnerName: {
    marginBottom: Spacing.md,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  dayIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    gap: Spacing.xs,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    textAlign: "right",
  },
});
