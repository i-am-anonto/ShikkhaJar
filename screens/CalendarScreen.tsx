import React, { useState, useMemo } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { CalendarGrid } from "@/components/CalendarGrid";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { DayOfWeek } from "@/constants/types";
import { Spacing, BorderRadius, AttendanceColors } from "@/constants/theme";
import { formatDate } from "@/utils/storage";

export default function CalendarScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { segments, attendance } = useData();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const allClassDays = useMemo(() => {
    const days = new Set<DayOfWeek>();
    segments.forEach((s) => {
      s.classDays.forEach((d) => days.add(d));
    });
    return Array.from(days);
  }, [segments]);

  const filteredAttendance = useMemo(() => {
    if (selectedSegment) {
      return attendance.filter((a) => a.segmentId === selectedSegment);
    }
    return attendance;
  }, [attendance, selectedSegment]);

  const handleDatePress = (date: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const attendanceColor = user?.settings.attendanceColor || AttendanceColors.present;

  const monthStats = useMemo(() => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const monthAttendance = filteredAttendance.filter((a) => {
      const date = new Date(a.date);
      return date >= startOfMonth && date <= endOfMonth;
    });

    return {
      present: monthAttendance.filter((a) => a.status === "present" || a.status === "makeup").length,
      missed: monthAttendance.filter((a) => a.status === "missed").length,
      rescheduled: monthAttendance.filter((a) => a.status === "rescheduled").length,
    };
  }, [currentMonth, filteredAttendance]);

  return (
    <ScreenScrollView>
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <ThemedText type="h2" style={styles.title}>
          {t("calendar")}
        </ThemedText>
      </Animated.View>

      {segments.length > 1 ? (
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.segmentFilter}>
          <Pressable
            onPress={() => setSelectedSegment(null)}
            style={[
              styles.filterChip,
              {
                backgroundColor: !selectedSegment ? theme.primary : theme.backgroundDefault,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{ color: !selectedSegment ? "#FFFFFF" : theme.text, fontWeight: "600" }}
            >
              All
            </ThemedText>
          </Pressable>
          {segments.map((segment) => (
            <Pressable
              key={segment.id}
              onPress={() => setSelectedSegment(segment.id)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedSegment === segment.id ? theme.primary : theme.backgroundDefault,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: selectedSegment === segment.id ? "#FFFFFF" : theme.text,
                  fontWeight: "600",
                }}
              >
                {segment.subject}
              </ThemedText>
            </Pressable>
          ))}
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: attendanceColor + "15" }]}>
          <ThemedText type="h3" style={{ color: attendanceColor }}>
            {monthStats.present}
          </ThemedText>
          <ThemedText type="small" style={{ color: attendanceColor }}>
            {t("present")}
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: AttendanceColors.missed + "15" }]}>
          <ThemedText type="h3" style={{ color: AttendanceColors.missed }}>
            {monthStats.missed}
          </ThemedText>
          <ThemedText type="small" style={{ color: AttendanceColors.missed }}>
            {t("missed")}
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: AttendanceColors.rescheduled + "15" }]}>
          <ThemedText type="h3" style={{ color: AttendanceColors.rescheduled }}>
            {monthStats.rescheduled}
          </ThemedText>
          <ThemedText type="small" style={{ color: AttendanceColors.rescheduled }}>
            {t("rescheduled")}
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <CalendarGrid
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          attendance={filteredAttendance}
          classDays={allClassDays}
          onDatePress={handleDatePress}
          attendanceColor={attendanceColor}
        />
      </Animated.View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: Spacing.xl,
  },
  segmentFilter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
});
