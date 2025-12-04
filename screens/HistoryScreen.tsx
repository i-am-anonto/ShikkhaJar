import React from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { HistoryStackParamList } from "@/navigation/HistoryStackNavigator";
import { SessionSummary } from "@/constants/types";
import { Spacing, BorderRadius, AttendanceColors } from "@/constants/theme";

export default function HistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HistoryStackParamList>>();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { sessions, segments } = useData();

  const handleSessionPress = (sessionId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("SessionDetail", { sessionId });
  };

  const getSegmentInfo = (segmentId: string) => {
    return segments.find((s) => s.id === segmentId);
  };

  const renderSessionCard = (session: SessionSummary, index: number) => {
    const segment = getSegmentInfo(session.segmentId);
    if (!segment) return null;

    return (
      <Animated.View
        key={session.id}
        entering={FadeInDown.delay(100 + index * 100).duration(400)}
      >
        <Pressable
          onPress={() => handleSessionPress(session.id)}
          style={({ pressed }) => [
            styles.sessionCard,
            { backgroundColor: theme.cardBackground, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={styles.sessionHeader}>
            <View>
              <ThemedText type="h4">{segment.subject}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {segment.partnerName}
              </ThemedText>
            </View>
            <View style={styles.sessionDate}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {session.month}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {session.year}
              </ThemedText>
            </View>
          </View>

          <View style={styles.sessionStats}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: AttendanceColors.present }]} />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {session.classesTaken} {t("classesTaken")}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: AttendanceColors.missed }]} />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {session.classesMissed} {t("classesMissed")}
              </ThemedText>
            </View>
          </View>

          <View style={styles.sessionFooter}>
            <View style={[styles.paidBadge, { backgroundColor: AttendanceColors.paid + "20" }]}>
              <Feather name="check" size={14} color={AttendanceColors.paid} />
              <ThemedText type="small" style={{ color: AttendanceColors.paid, fontWeight: "600" }}>
                ৳{session.amountPaid} {t("paid")}
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="clock" size={48} color={theme.textSecondary} />
      </View>
      <ThemedText type="h4" style={styles.emptyTitle}>
        {t("noHistory")}
      </ThemedText>
    </View>
  );

  return (
    <ScreenScrollView>
      <Animated.View entering={FadeInDown.duration(400)}>
        <ThemedText type="h2" style={styles.title}>
          {t("sessionHistory")}
        </ThemedText>
      </Animated.View>

      {sessions.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.list}>
          {sessions.map((session, index) => renderSessionCard(session, index))}
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: Spacing.xl,
  },
  list: {
    gap: Spacing.md,
  },
  sessionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  sessionDate: {
    alignItems: "flex-end",
  },
  sessionStats: {
    flexDirection: "row",
    gap: Spacing.xl,
    marginBottom: Spacing.md,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sessionFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
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
    textAlign: "center",
  },
});
