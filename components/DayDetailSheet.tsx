import React from "react";
import { View, StyleSheet, Pressable, Modal, Platform } from "react-native";
import Animated, { SlideInDown, SlideOutDown, FadeIn, FadeOut } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { AttendanceRecord } from "@/constants/types";
import { Spacing, BorderRadius, AttendanceColors } from "@/constants/theme";

interface DayDetailSheetProps {
  visible: boolean;
  date: string;
  record?: AttendanceRecord;
  onClose: () => void;
  onMarkPresent: () => void;
  onMarkMissed: () => void;
  onReschedule: () => void;
  attendanceColor: string;
}

export function DayDetailSheet({
  visible,
  date,
  record,
  onClose,
  onMarkPresent,
  onMarkMissed,
  onReschedule,
  attendanceColor,
}: DayDetailSheetProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  if (!visible) return null;

  const formattedDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  const getStatusBadge = () => {
    if (!record) return null;

    let color = attendanceColor;
    let label = t("present");
    let icon: keyof typeof Feather.glyphMap = "check-circle";

    switch (record.status) {
      case "missed":
        color = AttendanceColors.missed;
        label = t("missed");
        icon = "x-circle";
        break;
      case "rescheduled":
        color = AttendanceColors.rescheduled;
        label = t("rescheduled");
        icon = "refresh-cw";
        break;
      case "makeup":
        color = AttendanceColors.makeup;
        label = t("makeup");
        icon = "plus-circle";
        break;
      case "exam":
        color = AttendanceColors.exam;
        label = t("exam");
        icon = "star";
        break;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: color + "20" }]}>
        <Feather name={icon} size={18} color={color} />
        <ThemedText type="body" style={{ color, fontWeight: "600" }}>
          {label}
        </ThemedText>
      </View>
    );
  };

  const handleAction = (action: () => void) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    action();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={StyleSheet.absoluteFill}
        />
      </Pressable>
      <Animated.View
        entering={SlideInDown.springify().damping(20)}
        exiting={SlideOutDown.duration(200)}
        style={[styles.sheet, { backgroundColor: theme.backgroundRoot }]}
      >
        <View style={[styles.handle, { backgroundColor: theme.border }]} />

        <ThemedText type="h3" style={styles.date}>
          {formattedDate}
        </ThemedText>

        {record ? (
          <View style={styles.statusContainer}>
            {getStatusBadge()}
            {record.rescheduleInfo ? (
              <View style={styles.reasonContainer}>
                <ThemedText type="small" style={[styles.reasonLabel, { color: theme.textSecondary }]}>
                  {t("reason")}:
                </ThemedText>
                <ThemedText type="body" style={styles.reasonText}>
                  {record.rescheduleInfo.reason}
                </ThemedText>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.actions}>
            <Pressable
              onPress={() => handleAction(onMarkPresent)}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: attendanceColor, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name="check" size={24} color="#FFFFFF" />
              <ThemedText type="body" style={styles.actionText}>
                {t("markPresent")}
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => handleAction(onMarkMissed)}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: AttendanceColors.missed, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name="x" size={24} color="#FFFFFF" />
              <ThemedText type="body" style={styles.actionText}>
                {t("markMissed")}
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => handleAction(onReschedule)}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: AttendanceColors.rescheduled, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name="refresh-cw" size={24} color="#FFFFFF" />
              <ThemedText type="body" style={styles.actionText}>
                {t("reschedule")}
              </ThemedText>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing["4xl"],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.xl,
  },
  date: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  statusContainer: {
    alignItems: "center",
    gap: Spacing.lg,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  reasonContainer: {
    width: "100%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  reasonLabel: {
    marginBottom: Spacing.xs,
  },
  reasonText: {
    fontStyle: "italic",
  },
  actions: {
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
