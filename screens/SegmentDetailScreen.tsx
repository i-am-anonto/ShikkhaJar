import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { CalendarGrid } from "@/components/CalendarGrid";
import { DayDetailSheet } from "@/components/DayDetailSheet";
import { CelebrationAnimation } from "@/components/CelebrationAnimation";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { Spacing, BorderRadius, AttendanceColors } from "@/constants/theme";
import { formatDate } from "@/utils/storage";
import { AttendanceStatus } from "@/constants/types";

type Props = NativeStackScreenProps<HomeStackParamList, "SegmentDetail">;

export default function SegmentDetailScreen({ route, navigation }: Props) {
  const { segmentId } = route.params;
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const {
    segments,
    attendance,
    getAttendanceForDate,
    getSegmentProgress,
    markAttendance,
    markPayment,
    requestReschedule,
  } = useData();

  const segment = useMemo(
    () => segments.find((s) => s.id === segmentId),
    [segments, segmentId]
  );

  const progress = useMemo(
    () => (segment ? getSegmentProgress(segmentId) : { taken: 0, target: 0, daysRemaining: 0 }),
    [segment, segmentId, getSegmentProgress]
  );

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const segmentAttendance = useMemo(
    () => attendance.filter((a) => a.segmentId === segmentId),
    [attendance, segmentId]
  );

  const selectedRecord = useMemo(
    () => (selectedDate ? getAttendanceForDate(segmentId, selectedDate) : undefined),
    [selectedDate, segmentId, getAttendanceForDate]
  );

  const handleDatePress = useCallback((date: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedDate(date);
  }, []);

  const handleMarkAttendance = useCallback(
    async (status: AttendanceStatus) => {
      if (!selectedDate) return;

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      await markAttendance(segmentId, selectedDate, status);

      if (status === "present") {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }

      setSelectedDate(null);
    },
    [selectedDate, segmentId, markAttendance]
  );

  const handleMarkPayment = useCallback(async () => {
    if (!segment) return;

    Alert.alert(
      t("markPaid"),
      `${t("confirm")} ৳${segment.monthlyFee}?`,
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("confirm"),
          onPress: async () => {
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            await markPayment(segmentId, segment.monthlyFee);
          },
        },
      ]
    );
  }, [segment, segmentId, markPayment, t]);

  const handleReschedule = useCallback(async () => {
    if (!selectedDate || !rescheduleReason.trim()) return;

    await requestReschedule(
      segmentId,
      selectedDate,
      rescheduleDate || formatDate(new Date()),
      "10:00",
      rescheduleReason
    );

    setShowRescheduleModal(false);
    setRescheduleReason("");
    setRescheduleDate("");
    setSelectedDate(null);
  }, [selectedDate, segmentId, rescheduleReason, rescheduleDate, requestReschedule]);

  if (!segment) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="body">{t("errorOccurred")}</ThemedText>
      </ThemedView>
    );
  }

  const attendanceColor = user?.settings.attendanceColor || AttendanceColors.present;

  return (
    <ScreenScrollView>
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={styles.header}>
          <View style={[styles.subjectBadge, { backgroundColor: attendanceColor + "20" }]}>
            <ThemedText type="body" style={{ color: attendanceColor, fontWeight: "600" }}>
              {segment.subject}
            </ThemedText>
          </View>
          {!segment.isCollaborated ? (
            <View style={[styles.soloBadge, { backgroundColor: theme.warning + "20" }]}>
              <Feather name="user" size={14} color={theme.warning} />
              <ThemedText type="small" style={{ color: theme.warning }}>Solo</ThemedText>
            </View>
          ) : null}
        </View>

        <ThemedText type="h2" style={styles.partnerName}>
          {segment.partnerName}
        </ThemedText>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText type="h3" style={{ color: attendanceColor }}>
              {progress.taken}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {t("classesTaken")}
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <ThemedText type="h3" style={{ color: theme.warning }}>
              {progress.target - progress.taken}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {t("pending")}
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <ThemedText type="h3" style={{ color: theme.text }}>
              ৳{segment.monthlyFee}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {t("monthlyFee")}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {progress.daysRemaining <= 2 && progress.daysRemaining > 0 ? (
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.warningBanner, { backgroundColor: theme.warning + "20" }]}
        >
          <Feather name="alert-circle" size={20} color={theme.warning} />
          <ThemedText type="body" style={{ color: theme.warning, flex: 1 }}>
            {progress.daysRemaining === 1 ? t("tomorrowCompletes") : t("preparePayment")}
          </ThemedText>
        </Animated.View>
      ) : null}

      {progress.daysRemaining === 0 ? (
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Button onPress={handleMarkPayment} style={{ backgroundColor: attendanceColor }}>
            {t("markPaid")} - ৳{segment.monthlyFee}
          </Button>
        </Animated.View>
      ) : null}

      {user?.role === "tutor" ? (
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <Pressable
            onPress={() => navigation.navigate("ExamResults", { segmentId })}
            style={[styles.examResultsButton, { backgroundColor: theme.secondary + "15" }]}
          >
            <Feather name="file-text" size={20} color={theme.secondary} />
            <ThemedText type="body" style={{ color: theme.secondary, fontWeight: "600" }}>
              {t("examResults")}
            </ThemedText>
            <Feather name="chevron-right" size={20} color={theme.secondary} />
          </Pressable>
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.calendarSection}>
        <CalendarGrid
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          attendance={segmentAttendance}
          classDays={segment.classDays}
          onDatePress={handleDatePress}
          attendanceColor={attendanceColor}
        />
      </Animated.View>

      <DayDetailSheet
        visible={selectedDate !== null}
        date={selectedDate || ""}
        record={selectedRecord}
        onClose={() => setSelectedDate(null)}
        onMarkPresent={() => handleMarkAttendance("present")}
        onMarkMissed={() => handleMarkAttendance("missed")}
        onReschedule={() => setShowRescheduleModal(true)}
        attendanceColor={attendanceColor}
      />

      <Modal
        visible={showRescheduleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRescheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="h3" style={styles.modalTitle}>
              {t("reschedule")}
            </ThemedText>

            <ThemedText type="small" style={[styles.inputLabel, { color: theme.textSecondary }]}>
              {t("reason")}
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: theme.backgroundDefault, color: theme.text },
              ]}
              value={rescheduleReason}
              onChangeText={setRescheduleReason}
              placeholder={t("enterReason")}
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowRescheduleModal(false)}
                style={[styles.modalButton, { backgroundColor: theme.backgroundDefault }]}
              >
                <ThemedText type="body">{t("cancel")}</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleReschedule}
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
              >
                <ThemedText type="body" style={{ color: "#FFFFFF" }}>
                  {t("proposeNewTime")}
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {showCelebration ? <CelebrationAnimation color={attendanceColor} /> : null}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  subjectBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  soloBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  partnerName: {
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  calendarSection: {
    marginTop: Spacing.lg,
  },
  examResultsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  modalTitle: {
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  inputLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    marginBottom: Spacing.lg,
  },
  textArea: {
    height: 100,
    paddingTop: Spacing.md,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
