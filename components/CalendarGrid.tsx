import React, { useMemo } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { AttendanceRecord, DayOfWeek } from "@/constants/types";
import { Spacing, BorderRadius, AttendanceColors } from "@/constants/theme";
import { formatDate } from "@/utils/storage";

interface CalendarGridProps {
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
  attendance: AttendanceRecord[];
  classDays: DayOfWeek[];
  onDatePress: (date: string) => void;
  attendanceColor: string;
}

const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CalendarGrid({
  currentMonth,
  onMonthChange,
  attendance,
  classDays,
  onDatePress,
  attendanceColor,
}: CalendarGridProps) {
  const { theme } = useTheme();
  const { t, language } = useLanguage();

  const monthNames = useMemo(() => {
    if (language === "bn") {
      return [
        t("january"), t("february"), t("march"), t("april"),
        t("may"), t("june"), t("july"), t("august"),
        t("september"), t("october"), t("november"), t("december"),
      ];
    }
    return [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
  }, [language, t]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [currentMonth]);

  const getAttendanceForDay = (day: number) => {
    const date = formatDate(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    );
    return attendance.find((a) => a.date === date);
  };

  const isClassDay = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return classDays.includes(date.getDay() as DayOfWeek);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isPast = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handlePrevMonth = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    onMonthChange(newMonth);
  };

  const handleNextMonth = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    onMonthChange(newMonth);
  };

  const renderDayCell = (day: number | null, index: number) => {
    if (day === null) {
      return <View key={index} style={styles.dayCell} />;
    }

    const record = getAttendanceForDay(day);
    const isScheduled = isClassDay(day);
    const today = isToday(day);
    const past = isPast(day);
    const dateStr = formatDate(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    );

    let backgroundColor = "transparent";
    let borderColor = "transparent";
    let textColor = theme.text;
    let icon: keyof typeof Feather.glyphMap | null = null;
    let iconColor = "#FFFFFF";

    if (record) {
      switch (record.status) {
        case "present":
          backgroundColor = attendanceColor;
          textColor = "#FFFFFF";
          icon = "check";
          break;
        case "missed":
          backgroundColor = AttendanceColors.missed;
          textColor = "#FFFFFF";
          icon = "x";
          break;
        case "rescheduled":
          backgroundColor = AttendanceColors.rescheduled;
          textColor = "#FFFFFF";
          icon = "refresh-cw";
          break;
        case "makeup":
          backgroundColor = AttendanceColors.makeup;
          textColor = "#FFFFFF";
          icon = "plus";
          break;
        case "exam":
          backgroundColor = AttendanceColors.exam;
          textColor = "#FFFFFF";
          icon = "star";
          break;
      }
    } else if (isScheduled) {
      if (past) {
        borderColor = theme.error + "50";
        textColor = theme.error;
      } else if (today) {
        borderColor = attendanceColor;
        backgroundColor = attendanceColor + "20";
      } else {
        borderColor = theme.border;
      }
    }

    return (
      <Pressable
        key={index}
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          onDatePress(dateStr);
        }}
        style={({ pressed }) => [
          styles.dayCell,
          {
            backgroundColor,
            borderColor,
            borderWidth: borderColor !== "transparent" ? 2 : 0,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        {icon ? (
          <Feather name={icon} size={16} color={iconColor} />
        ) : (
          <ThemedText
            type="body"
            style={[
              styles.dayText,
              { color: textColor },
              today && !record && { fontWeight: "700" },
            ]}
          >
            {day}
          </ThemedText>
        )}
      </Pressable>
    );
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={handlePrevMonth}
          style={({ pressed }) => [
            styles.navButton,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="chevron-left" size={20} color={theme.text} />
        </Pressable>

        <ThemedText type="h4">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </ThemedText>

        <Pressable
          onPress={handleNextMonth}
          style={({ pressed }) => [
            styles.navButton,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="chevron-right" size={20} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.weekHeader}>
        {DAYS_OF_WEEK.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <ThemedText type="small" style={[styles.weekDayText, { color: theme.textSecondary }]}>
              {day}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {calendarDays.map((day, index) => renderDayCell(day, index))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: attendanceColor }]} />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Present
          </ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: AttendanceColors.missed }]} />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Missed
          </ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: AttendanceColors.rescheduled }]} />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Rescheduled
          </ThemedText>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  weekDayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  weekDayText: {
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Spacing.calendarDaySize / 2,
    marginVertical: 2,
  },
  dayText: {
    fontSize: 14,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.lg,
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
