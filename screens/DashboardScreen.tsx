import React, { useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  Share,
  FlatList,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { SegmentCard } from "@/components/SegmentCard";
import { ProgressCard } from "@/components/ProgressCard";
import { CollaborationBanner } from "@/components/CollaborationBanner";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { formatDate } from "@/utils/storage";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { segments, attendance, unreadCount, getSegmentProgress } = useData();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t("goodMorning");
    if (hour < 17) return t("goodAfternoon");
    return t("goodEvening");
  }, [t]);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyAttendance = attendance.filter(
      (a) =>
        new Date(a.date) >= startOfMonth &&
        (a.status === "present" || a.status === "makeup")
    );
    return monthlyAttendance.length;
  }, [attendance]);

  const hasUnconnectedSegments = useMemo(() => {
    return segments.some((s) => !s.isCollaborated);
  }, [segments]);

  const handleNotifications = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("Notifications");
  }, [navigation]);

  const handleAddSegment = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.navigate("AddSegment");
  }, [navigation]);

  const handleShareApp = useCallback(async () => {
    try {
      await Share.share({
        message: t("language") === "bn"
          ? "ShikkhaJar অ্যাপ দিয়ে টিউশন ট্র্যাক করুন! https://shikkhajar.app"
          : "Track tutoring with ShikkhaJar! https://shikkhajar.app",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  }, [t]);

  const handleSegmentPress = useCallback((segmentId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("SegmentDetail", { segmentId });
  }, [navigation]);

  const renderHeader = () => (
    <View style={styles.headerActions}>
      <Pressable
        onPress={handleNotifications}
        style={({ pressed }) => [
          styles.notificationButton,
          { 
            backgroundColor: theme.backgroundDefault,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Feather name="bell" size={22} color={theme.text} />
        {unreadCount > 0 ? (
          <View style={[styles.notificationBadge, { backgroundColor: theme.error }]}>
            <ThemedText style={styles.notificationBadgeText}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </ThemedText>
          </View>
        ) : null}
      </Pressable>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="calendar" size={48} color={theme.textSecondary} />
      </View>
      <ThemedText type="h4" style={styles.emptyTitle}>
        {t("noSegments")}
      </ThemedText>
      <ThemedText type="body" style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        {t("addFirstSegment")}
      </ThemedText>
    </View>
  );

  return (
    <ScreenScrollView>
      {renderHeader()}

      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <ThemedText type="body" style={[styles.greeting, { color: theme.textSecondary }]}>
          {greeting}
        </ThemedText>
        <ThemedText type="h1" style={styles.userName}>
          {user?.name}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <ProgressCard
          title={t("thisMonth")}
          value={monthlyStats}
          label={t("sessions")}
          color={theme.primary}
        />
      </Animated.View>

      {hasUnconnectedSegments ? (
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <CollaborationBanner
            role={user?.role || "parent"}
            onInvite={handleShareApp}
          />
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.sectionHeader}>
        <ThemedText type="h3">
          {user?.role === "tutor" ? t("studentSegments") : t("tutorSegments")}
        </ThemedText>
      </Animated.View>

      {segments.length === 0 ? (
        renderEmptyState()
      ) : (
        segments.map((segment, index) => (
          <Animated.View
            key={segment.id}
            entering={FadeInDown.delay(500 + index * 100).duration(400)}
          >
            <SegmentCard
              segment={segment}
              progress={getSegmentProgress(segment.id)}
              onPress={() => handleSegmentPress(segment.id)}
              attendanceColor={user?.settings.attendanceColor || "#4CAF50"}
            />
          </Animated.View>
        ))
      )}

      <View style={{ height: Spacing["5xl"] }} />

      <FloatingActionButton
        icon="plus"
        onPress={handleAddSegment}
        color={theme.primary}
      />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: Spacing.lg,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  greeting: {
    marginBottom: Spacing.xs,
  },
  userName: {
    marginBottom: Spacing["2xl"],
  },
  sectionHeader: {
    marginTop: Spacing["2xl"],
    marginBottom: Spacing.lg,
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
});
