import React, { useCallback } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown, FadeOut, Layout } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { Notification, NotificationType } from "@/constants/types";
import { Spacing, BorderRadius, AttendanceColors } from "@/constants/theme";

const getNotificationIcon = (type: NotificationType): keyof typeof Feather.glyphMap => {
  switch (type) {
    case "attendance_marked":
      return "check-circle";
    case "attendance_reminder":
      return "bell";
    case "reschedule_request":
    case "reschedule_response":
      return "refresh-cw";
    case "payment_reminder":
    case "payment_received":
      return "dollar-sign";
    case "cycle_warning":
    case "cycle_complete":
      return "alert-circle";
    case "exam_reminder":
      return "star";
    case "collaboration_invite":
      return "users";
    default:
      return "bell";
  }
};

const getNotificationColor = (type: NotificationType, theme: any): string => {
  switch (type) {
    case "attendance_marked":
      return AttendanceColors.present;
    case "attendance_reminder":
      return theme.warning;
    case "reschedule_request":
    case "reschedule_response":
      return AttendanceColors.rescheduled;
    case "payment_reminder":
      return theme.warning;
    case "payment_received":
      return AttendanceColors.present;
    case "cycle_warning":
      return theme.warning;
    case "cycle_complete":
      return AttendanceColors.present;
    case "exam_reminder":
      return AttendanceColors.exam;
    case "collaboration_invite":
      return theme.secondary;
    default:
      return theme.primary;
  }
};

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  theme: any;
}

function NotificationItem({ notification, onPress, theme }: NotificationItemProps) {
  const icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.type, theme);

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
    >
      <Pressable
        onPress={() => onPress(notification)}
        style={({ pressed }) => [
          styles.notificationItem,
          {
            backgroundColor: notification.read
              ? theme.backgroundRoot
              : theme.backgroundDefault,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
          <Feather name={icon} size={20} color={color} />
        </View>
        <View style={styles.notificationContent}>
          <ThemedText type="body" style={[styles.notificationTitle, !notification.read && { fontWeight: "600" }]}>
            {notification.title}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {notification.message}
          </ThemedText>
          <ThemedText type="small" style={[styles.timeAgo, { color: theme.textSecondary }]}>
            {timeAgo(notification.createdAt)}
          </ThemedText>
        </View>
        {!notification.read ? (
          <View style={[styles.unreadDot, { backgroundColor: color }]} />
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { notifications, markNotificationRead, clearNotifications } = useData();

  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await markNotificationRead(notification.id);
    },
    [markNotificationRead]
  );

  const handleClearAll = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await clearNotifications();
  }, [clearNotifications]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="bell-off" size={48} color={theme.textSecondary} />
      </View>
      <ThemedText type="h4" style={styles.emptyTitle}>
        {t("noNotifications")}
      </ThemedText>
    </View>
  );

  return (
    <ScreenScrollView>
      <View style={styles.header}>
        <ThemedText type="h2">{t("notifications")}</ThemedText>
        {notifications.length > 0 ? (
          <Pressable
            onPress={handleClearAll}
            style={({ pressed }) => [
              styles.clearButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <ThemedText type="small" style={{ color: theme.error }}>
              Clear All
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      {notifications.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.list}>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onPress={handleNotificationPress}
              theme={theme}
            />
          ))}
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  clearButton: {
    padding: Spacing.sm,
  },
  list: {
    gap: Spacing.sm,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    marginBottom: 2,
  },
  timeAgo: {
    marginTop: Spacing.xs,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: Spacing.sm,
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
