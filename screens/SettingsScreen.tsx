import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Switch, Platform, Alert } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { Spacing, BorderRadius, AttendanceColors } from "@/constants/theme";
import {
  registerForPushNotificationsAsync,
  scheduleSessionReminder,
  cancelAllReminders,
} from "@/utils/pushNotifications";

const COLOR_OPTIONS = [
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#FF9800",
  "#E91E63",
  "#00BCD4",
  "#795548",
  "#607D8B",
];

const REMINDER_OPTIONS = [15, 30, 60, 120];

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const { user, updateSettings, updateUser } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { segments } = useData();
  const [isSettingUpNotifications, setIsSettingUpNotifications] = useState(false);

  const handleToggleSound = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSettings({ soundEnabled: !user?.settings.soundEnabled });
  };

  const handleToggleHaptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSettings({ hapticEnabled: !user?.settings.hapticEnabled });
  };

  const handleColorSelect = (color: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    updateSettings({ attendanceColor: color });
  };

  const handleLanguageToggle = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setLanguage(language === "en" ? "bn" : "en");
  };

  const handleTogglePushNotifications = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (!user?.settings.pushNotificationsEnabled) {
      setIsSettingUpNotifications(true);
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await updateSettings({ pushNotificationsEnabled: true });
          await scheduleAllReminders();
        } else {
          if (Platform.OS !== "web") {
            Alert.alert(
              t("notifications"),
              t("notificationPermissionDenied")
            );
          }
        }
      } catch (error) {
        console.error("Error setting up notifications:", error);
      } finally {
        setIsSettingUpNotifications(false);
      }
    } else {
      await cancelAllReminders();
      await updateSettings({ pushNotificationsEnabled: false });
    }
  };

  const handleToggleSessionReminders = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newValue = !user?.settings.sessionReminders;
    await updateSettings({ sessionReminders: newValue });

    if (newValue && user?.settings.pushNotificationsEnabled) {
      await scheduleAllReminders();
    } else {
      await cancelAllReminders();
    }
  };

  const handleReminderTimeChange = async (minutes: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    await updateSettings({ reminderMinutesBefore: minutes });

    if (user?.settings.pushNotificationsEnabled && user?.settings.sessionReminders) {
      await scheduleAllReminders();
    }
  };

  const scheduleAllReminders = async () => {
    const minutesBefore = user?.settings.reminderMinutesBefore ?? 30;
    
    for (const segment of segments) {
      const title = t("sessionReminder");
      const body = `${segment.subject} ${t("with")} ${segment.partnerName} ${t("inMinutes").replace("{minutes}", String(minutesBefore))}`;
      await scheduleSessionReminder(segment, minutesBefore, title, body);
    }
  };

  return (
    <ScreenScrollView>
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <ThemedText type="h2" style={styles.title}>
          {t("settings")}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          {t("language")}
        </ThemedText>
        <View style={[styles.languageRow, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable
            onPress={() => setLanguage("en")}
            style={[
              styles.languageOption,
              language === "en" && { backgroundColor: theme.primary },
            ]}
          >
            <ThemedText
              type="body"
              style={{ color: language === "en" ? "#FFFFFF" : theme.text, fontWeight: "600" }}
            >
              English
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setLanguage("bn")}
            style={[
              styles.languageOption,
              language === "bn" && { backgroundColor: theme.primary },
            ]}
          >
            <ThemedText
              type="body"
              style={{ color: language === "bn" ? "#FFFFFF" : theme.text, fontWeight: "600" }}
            >
              বাংলা
            </ThemedText>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          {t("attendanceColor")}
        </ThemedText>
        <View style={styles.colorGrid}>
          {COLOR_OPTIONS.map((color) => (
            <Pressable
              key={color}
              onPress={() => handleColorSelect(color)}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                user?.settings.attendanceColor === color && styles.colorSelected,
              ]}
            >
              {user?.settings.attendanceColor === color ? (
                <Feather name="check" size={20} color="#FFFFFF" />
              ) : null}
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          {t("notifications")}
        </ThemedText>
        <View style={styles.toggleList}>
          <View style={[styles.toggleItem, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.toggleLeft}>
              <Feather name="bell" size={20} color={theme.primary} />
              <View>
                <ThemedText type="body">{t("pushNotifications")}</ThemedText>
                {Platform.OS === "web" ? (
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {t("availableOnMobile")}
                  </ThemedText>
                ) : null}
              </View>
            </View>
            <Switch
              value={user?.settings.pushNotificationsEnabled ?? false}
              onValueChange={handleTogglePushNotifications}
              disabled={Platform.OS === "web" || isSettingUpNotifications}
              trackColor={{ false: theme.border, true: theme.primary + "50" }}
              thumbColor={user?.settings.pushNotificationsEnabled ? theme.primary : theme.textSecondary}
            />
          </View>

          {user?.settings.pushNotificationsEnabled ? (
            <>
              <View style={[styles.toggleItem, { backgroundColor: theme.backgroundDefault }]}>
                <View style={styles.toggleLeft}>
                  <Feather name="clock" size={20} color={theme.secondary} />
                  <ThemedText type="body">{t("sessionReminders")}</ThemedText>
                </View>
                <Switch
                  value={user?.settings.sessionReminders ?? true}
                  onValueChange={handleToggleSessionReminders}
                  trackColor={{ false: theme.border, true: theme.secondary + "50" }}
                  thumbColor={user?.settings.sessionReminders ? theme.secondary : theme.textSecondary}
                />
              </View>

              {user?.settings.sessionReminders ? (
                <View style={[styles.reminderTimeCard, { backgroundColor: theme.backgroundDefault }]}>
                  <ThemedText type="body" style={styles.reminderLabel}>
                    {t("remindBefore")}
                  </ThemedText>
                  <View style={styles.reminderOptions}>
                    {REMINDER_OPTIONS.map((minutes) => (
                      <Pressable
                        key={minutes}
                        onPress={() => handleReminderTimeChange(minutes)}
                        style={[
                          styles.reminderOption,
                          user?.settings.reminderMinutesBefore === minutes && {
                            backgroundColor: theme.primary,
                          },
                          user?.settings.reminderMinutesBefore !== minutes && {
                            backgroundColor: theme.border + "50",
                          },
                        ]}
                      >
                        <ThemedText
                          type="small"
                          style={{
                            color: user?.settings.reminderMinutesBefore === minutes
                              ? "#FFFFFF"
                              : theme.text,
                            fontWeight: "600",
                          }}
                        >
                          {minutes < 60 ? `${minutes}m` : `${minutes / 60}h`}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          ) : null}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Feedback
        </ThemedText>
        <View style={styles.toggleList}>
          <View style={[styles.toggleItem, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.toggleLeft}>
              <Feather name="volume-2" size={20} color={theme.primary} />
              <ThemedText type="body">{t("soundEffects")}</ThemedText>
            </View>
            <Switch
              value={user?.settings.soundEnabled ?? true}
              onValueChange={handleToggleSound}
              trackColor={{ false: theme.border, true: theme.primary + "50" }}
              thumbColor={user?.settings.soundEnabled ? theme.primary : theme.textSecondary}
            />
          </View>

          <View style={[styles.toggleItem, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.toggleLeft}>
              <Feather name="smartphone" size={20} color={theme.primary} />
              <ThemedText type="body">{t("hapticFeedback")}</ThemedText>
            </View>
            <Switch
              value={user?.settings.hapticEnabled ?? true}
              onValueChange={handleToggleHaptic}
              trackColor={{ false: theme.border, true: theme.primary + "50" }}
              thumbColor={user?.settings.hapticEnabled ? theme.primary : theme.textSecondary}
            />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          App Info
        </ThemedText>
        <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.infoRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Version
            </ThemedText>
            <ThemedText type="body">1.0.0</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Build
            </ThemedText>
            <ThemedText type="body">2024.12.04</ThemedText>
          </View>
        </View>
      </Animated.View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: Spacing["2xl"],
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  languageRow: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  languageOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  toggleList: {
    gap: Spacing.sm,
  },
  toggleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  infoCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  reminderTimeCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  reminderLabel: {
    marginBottom: Spacing.md,
  },
  reminderOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  reminderOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
});
