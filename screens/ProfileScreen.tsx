import React, { useState } from "react";
import { View, StyleSheet, Pressable, Image, Alert, Platform } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { segments, sessions, attendance } = useData();

  const handleSettings = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("Settings");
  };

  const handleAnalytics = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("Analytics");
  };

  const handleReferral = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("Referral");
  };

  const handleLogout = () => {
    Alert.alert(t("logout"), t("logoutConfirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("logout"),
        style: "destructive",
        onPress: async () => {
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          await logout();
        },
      },
    ]);
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case "parent":
        return theme.primary;
      case "student":
        return theme.secondary;
      case "tutor":
        return "#9C27B0";
      default:
        return theme.primary;
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case "parent":
        return t("parent");
      case "student":
        return t("student");
      case "tutor":
        return t("tutor");
      default:
        return "";
    }
  };

  const totalSessions = sessions.reduce((sum, s) => sum + s.classesTaken, 0);
  const currentMonthSessions = attendance.filter((a) => {
    const date = new Date(a.date);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear() &&
      (a.status === "present" || a.status === "makeup")
    );
  }).length;

  return (
    <ScreenScrollView>
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
        <View style={styles.headerTop}>
          <ThemedText type="h2">{t("profile")}</ThemedText>
          <Pressable
            onPress={handleSettings}
            style={({ pressed }) => [
              styles.settingsButton,
              { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="settings" size={22} color={theme.text} />
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: theme.primary + "20" }]}>
          <ThemedText type="h1" style={{ color: theme.primary }}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </ThemedText>
        </View>
        <ThemedText type="h3" style={styles.userName}>
          {user?.name}
        </ThemedText>
        <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor() + "20" }]}>
          <ThemedText type="small" style={{ color: getRoleBadgeColor(), fontWeight: "600" }}>
            {getRoleLabel()}
          </ThemedText>
        </View>
        <ThemedText type="small" style={[styles.phone, { color: theme.textSecondary }]}>
          +880 {user?.phone}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h2" style={{ color: theme.primary }}>
            {segments.length}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {user?.role === "tutor" ? "Students" : "Tutors"}
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h2" style={{ color: theme.secondary }}>
            {currentMonthSessions}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {t("thisMonth")}
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h2" style={{ color: theme.warning }}>
            {totalSessions}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Total
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.menuSection}>
        <Pressable
          onPress={handleSettings}
          style={({ pressed }) => [
            styles.menuItem,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: theme.primary + "20" }]}>
              <Feather name="settings" size={18} color={theme.primary} />
            </View>
            <ThemedText type="body">{t("settings")}</ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          onPress={handleAnalytics}
          style={({ pressed }) => [
            styles.menuItem,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: theme.secondary + "20" }]}>
              <Feather name="bar-chart-2" size={18} color={theme.secondary} />
            </View>
            <ThemedText type="body">{t("analytics")}</ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          onPress={handleReferral}
          style={({ pressed }) => [
            styles.menuItem,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: theme.success + "20" }]}>
              <Feather name="gift" size={18} color={theme.success} />
            </View>
            <ThemedText type="body">{t("referralRewards")}</ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.menuItem,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: theme.warning + "20" }]}>
              <Feather name="globe" size={18} color={theme.warning} />
            </View>
            <ThemedText type="body">{t("language")}</ThemedText>
          </View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {user?.language === "bn" ? "বাংলা" : "English"}
          </ThemedText>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.logoutSection}>
        <Button
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: theme.error }]}
        >
          {t("logout")}
        </Button>
      </Animated.View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.xl,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  userName: {
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  phone: {
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  menuSection: {
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutSection: {
    marginTop: Spacing.xl,
  },
  logoutButton: {
    width: "100%",
  },
});
