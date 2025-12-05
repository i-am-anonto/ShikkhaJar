import React from "react";
import { View, StyleSheet, Pressable, Modal, Platform } from "react-native";
import Animated, { FadeIn, FadeOut, withTiming, Easing } from "react-native-reanimated";
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
        entering={FadeIn.duration(250)}
        exiting={FadeOut.duration(200)}
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
              <View style={styles.rescheduleInfoContainer}>
                <View style={[styles.pendingBadge, { 
                  backgroundColor: record.rescheduleInfo.status === "pending" 
                    ? AttendanceColors.rescheduled + "20" 
                    : record.rescheduleInfo.status === "accepted" 
                    ? "#4CAF5020" 
                    : "#f4433620" 
                }]}>
                  <Feather 
                    name={record.rescheduleInfo.status === "pending" ? "clock" : record.rescheduleInfo.status === "accepted" ? "check-circle" : "x-circle"} 
                    size={16} 
                    color={record.rescheduleInfo.status === "pending" 
                      ? AttendanceColors.rescheduled 
                      : record.rescheduleInfo.status === "accepted" 
                      ? "#4CAF50" 
                      : "#f44336"} 
                  />
                  <ThemedText type="small" style={{ 
                    color: record.rescheduleInfo.status === "pending" 
                      ? AttendanceColors.rescheduled 
                      : record.rescheduleInfo.status === "accepted" 
                      ? "#4CAF50" 
                      : "#f44336",
                    fontWeight: "600" 
                  }}>
                    {record.rescheduleInfo.status === "pending" ? t("pending") : record.rescheduleInfo.status === "accepted" ? t("approved") : t("rejected")}
                  </ThemedText>
                </View>

                <View style={[styles.infoRow, { backgroundColor: theme.backgroundDefault }]}>
                  <Feather name="calendar" size={16} color={theme.textSecondary} />
                  <View style={styles.infoContent}>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>{t("proposedDate")}</ThemedText>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>
                      {new Date(record.rescheduleInfo.proposedDate + "T00:00:00").toLocaleDateString("en-US", { 
                        weekday: "short", 
                        month: "short", 
                        day: "numeric" 
                      })}
                    </ThemedText>
                  </View>
                </View>

                <View style={[styles.infoRow, { backgroundColor: theme.backgroundDefault }]}>
                  <Feather name="clock" size={16} color={theme.textSecondary} />
                  <View style={styles.infoContent}>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>{t("proposedTime")}</ThemedText>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>
                      {record.rescheduleInfo.proposedTime}
                    </ThemedText>
                  </View>
                </View>

                <View style={[styles.infoRow, { backgroundColor: theme.backgroundDefault }]}>
                  <Feather name="message-circle" size={16} color={theme.textSecondary} />
                  <View style={styles.infoContent}>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>{t("reason")}</ThemedText>
                    <ThemedText type="body" style={{ fontStyle: "italic" }}>
                      {record.rescheduleInfo.reason}
                    </ThemedText>
                  </View>
                </View>

                {record.rescheduleInfo.counterProposal ? (
                  <View style={[styles.counterProposal, { backgroundColor: theme.warning + "15", borderColor: theme.warning + "30" }]}>
                    <ThemedText type="small" style={{ color: theme.warning, fontWeight: "600", marginBottom: Spacing.xs }}>
                      Counter Proposal
                    </ThemedText>
                    <ThemedText type="body">
                      {new Date(record.rescheduleInfo.counterProposal.date + "T00:00:00").toLocaleDateString("en-US", { 
                        weekday: "short", 
                        month: "short", 
                        day: "numeric" 
                      })} at {record.rescheduleInfo.counterProposal.time}
                    </ThemedText>
                  </View>
                ) : null}
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
  rescheduleInfoContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignSelf: "center",
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  counterProposal: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
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
