import React, { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { CalendarGrid } from "@/components/CalendarGrid";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { HistoryStackParamList } from "@/navigation/HistoryStackNavigator";
import { Spacing, BorderRadius, AttendanceColors } from "@/constants/theme";

type Props = NativeStackScreenProps<HistoryStackParamList, "SessionDetail">;

export default function SessionDetailScreen({ route }: Props) {
  const { sessionId } = route.params;
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { sessions, segments } = useData();

  const session = useMemo(
    () => sessions.find((s) => s.id === sessionId),
    [sessions, sessionId]
  );

  const segment = useMemo(
    () => (session ? segments.find((s) => s.id === session.segmentId) : null),
    [session, segments]
  );

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (session && session.attendanceRecords.length > 0) {
      const firstRecord = session.attendanceRecords[0];
      return new Date(firstRecord.date + "T00:00:00");
    }
    return new Date();
  });

  if (!session || !segment) {
    return (
      <ScreenScrollView>
        <ThemedText type="body">{t("errorOccurred")}</ThemedText>
      </ScreenScrollView>
    );
  }

  const attendanceColor = user?.settings.attendanceColor || AttendanceColors.present;

  return (
    <ScreenScrollView>
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={[styles.headerCard, { backgroundColor: theme.primary + "15" }]}>
          <ThemedText type="h3" style={{ color: theme.primary }}>
            {segment.subject}
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.primary, opacity: 0.8 }}>
            {segment.partnerName}
          </ThemedText>
          <ThemedText type="h4" style={[styles.monthYear, { color: theme.primary }]}>
            {session.month} {session.year}
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: AttendanceColors.present + "15" }]}>
          <Feather name="check-circle" size={24} color={AttendanceColors.present} />
          <ThemedText type="h3" style={{ color: AttendanceColors.present }}>
            {session.classesTaken}
          </ThemedText>
          <ThemedText type="small" style={{ color: AttendanceColors.present }}>
            {t("classesTaken")}
          </ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: AttendanceColors.missed + "15" }]}>
          <Feather name="x-circle" size={24} color={AttendanceColors.missed} />
          <ThemedText type="h3" style={{ color: AttendanceColors.missed }}>
            {session.classesMissed}
          </ThemedText>
          <ThemedText type="small" style={{ color: AttendanceColors.missed }}>
            {t("classesMissed")}
          </ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: AttendanceColors.rescheduled + "15" }]}>
          <Feather name="refresh-cw" size={24} color={AttendanceColors.rescheduled} />
          <ThemedText type="h3" style={{ color: AttendanceColors.rescheduled }}>
            {session.classesRescheduled}
          </ThemedText>
          <ThemedText type="small" style={{ color: AttendanceColors.rescheduled }}>
            {t("classesRescheduled")}
          </ThemedText>
        </View>

        <View style={[styles.statCard, { backgroundColor: AttendanceColors.paid + "15" }]}>
          <Feather name="credit-card" size={24} color={AttendanceColors.paid} />
          <ThemedText type="h3" style={{ color: AttendanceColors.paid }}>
            ৳{session.amountPaid}
          </ThemedText>
          <ThemedText type="small" style={{ color: AttendanceColors.paid }}>
            {t("amountPaid")}
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.calendarSection}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          {t("calendar")}
        </ThemedText>
        <CalendarGrid
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          attendance={session.attendanceRecords}
          classDays={segment.classDays}
          onDatePress={() => {}}
          attendanceColor={attendanceColor}
        />
      </Animated.View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  monthYear: {
    marginTop: Spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: "47%",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  calendarSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
});
