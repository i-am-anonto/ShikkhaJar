import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { Spacing, BorderRadius } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_BN = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { analytics, attendance, segments } = useData();

  const dayNames = language === "en" ? DAY_NAMES : DAY_NAMES_BN;

  const chartData = useMemo(() => {
    if (!analytics) return { weekly: [], monthly: [] };

    const maxWeekly = Math.max(...analytics.weeklyTrend, 1);
    const maxMonthly = Math.max(...analytics.monthlyTrend, 1);

    return {
      weekly: analytics.weeklyTrend.map((val) => val / maxWeekly),
      monthly: analytics.monthlyTrend.map((val) => val / maxMonthly),
    };
  }, [analytics]);

  if (!analytics) {
    return (
      <ScreenScrollView>
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <ThemedText type="h2" style={styles.title}>
            {t("analytics")}
          </ThemedText>
        </Animated.View>

        <View style={styles.emptyState}>
          <View style={[styles.emptyIconContainer, { backgroundColor: theme.backgroundDefault }]}>
            <Feather name="bar-chart-2" size={48} color={theme.textSecondary} />
          </View>
          <ThemedText type="h4" style={styles.emptyTitle}>
            {t("noHistory")}
          </ThemedText>
          <ThemedText type="body" style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            {t("markAttendance")}
          </ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView>
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <ThemedText type="h2" style={styles.title}>
          {t("analytics")}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: theme.primary + "20" }]}>
            <Feather name="check-circle" size={24} color={theme.primary} />
          </View>
          <ThemedText type="h2" style={styles.statValue}>
            {analytics.totalSessions}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {t("totalSessions")}
          </ThemedText>
        </Card>

        <Card style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: theme.success + "20" }]}>
            <Feather name="trending-up" size={24} color={theme.success} />
          </View>
          <ThemedText type="h2" style={styles.statValue}>
            {analytics.completionRate}%
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {t("completionRate")}
          </ThemedText>
        </Card>

        <Card style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: theme.secondary + "20" }]}>
            <Feather name="calendar" size={24} color={theme.secondary} />
          </View>
          <ThemedText type="h2" style={styles.statValue}>
            {analytics.avgSessionsPerWeek}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {t("avgSessionsPerWeek")}
          </ThemedText>
        </Card>

        <Card style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: theme.warning + "20" }]}>
            <Feather name="star" size={24} color={theme.warning} />
          </View>
          <ThemedText type="h2" style={styles.statValue}>
            {dayNames[analytics.mostActiveDay]}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {t("mostActiveDay")}
          </ThemedText>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <Card style={styles.chartCard}>
          <ThemedText type="h4" style={styles.chartTitle}>
            {t("attendanceTrends")} - {language === "en" ? "Weekly" : "সাপ্তাহিক"}
          </ThemedText>
          <View style={styles.chartContainer}>
            {chartData.weekly.map((value, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.max(value * 100, 5)}%`,
                        backgroundColor: theme.primary,
                      },
                    ]}
                  />
                </View>
                <ThemedText type="small" style={styles.barLabel}>
                  W{index + 1}
                </ThemedText>
              </View>
            ))}
          </View>
          <View style={styles.chartLegend}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {language === "en" ? "Last 4 weeks" : "গত ৪ সপ্তাহ"}
            </ThemedText>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <Card style={styles.chartCard}>
          <ThemedText type="h4" style={styles.chartTitle}>
            {t("attendanceTrends")} - {language === "en" ? "Monthly" : "মাসিক"}
          </ThemedText>
          <View style={styles.chartContainer}>
            {chartData.monthly.map((value, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.max(value * 100, 5)}%`,
                        backgroundColor: theme.secondary,
                      },
                    ]}
                  />
                </View>
                <ThemedText type="small" style={styles.barLabel}>
                  M{index + 1}
                </ThemedText>
              </View>
            ))}
          </View>
          <View style={styles.chartLegend}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {language === "en" ? "Last 6 months" : "গত ৬ মাস"}
            </ThemedText>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(400)}>
        <Card style={styles.summaryCard}>
          <ThemedText type="h4" style={styles.summaryTitle}>
            {language === "en" ? "Quick Summary" : "সারসংক্ষেপ"}
          </ThemedText>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Feather name="users" size={20} color={theme.primary} />
              <View style={styles.summaryItemText}>
                <ThemedText type="h4">{segments.length}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {language === "en" ? "Active Segments" : "সক্রিয় সেগমেন্ট"}
                </ThemedText>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <Feather name="clock" size={20} color={theme.secondary} />
              <View style={styles.summaryItemText}>
                <ThemedText type="h4">{attendance.length}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {language === "en" ? "Total Records" : "মোট রেকর্ড"}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={[styles.progressContainer, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.progressHeader}>
              <ThemedText type="body">
                {language === "en" ? "Overall Progress" : "সামগ্রিক অগ্রগতি"}
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.primary, fontWeight: "700" }}>
                {analytics.completionRate}%
              </ThemedText>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${analytics.completionRate}%`,
                    backgroundColor: analytics.completionRate >= 80 
                      ? theme.success 
                      : analytics.completionRate >= 60 
                        ? theme.primary 
                        : theme.warning,
                  },
                ]}
              />
            </View>
          </View>
        </Card>
      </Animated.View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: Spacing.xl,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: (SCREEN_WIDTH - Spacing.xl * 2 - Spacing.md) / 2,
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  statValue: {
    marginBottom: Spacing.xs,
  },
  chartCard: {
    marginBottom: Spacing.xl,
  },
  chartTitle: {
    marginBottom: Spacing.lg,
  },
  chartContainer: {
    flexDirection: "row",
    height: 120,
    alignItems: "flex-end",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: BorderRadius.sm,
    minHeight: 6,
  },
  barLabel: {
    marginTop: Spacing.sm,
  },
  chartLegend: {
    alignItems: "center",
    marginTop: Spacing.md,
  },
  summaryCard: {
    marginBottom: Spacing.xl,
  },
  summaryTitle: {
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.xl,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  summaryItemText: {
    gap: 2,
  },
  progressContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
});
