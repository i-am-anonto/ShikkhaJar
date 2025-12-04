import React, { useState } from "react";
import { View, StyleSheet, Pressable, Switch, Platform } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Spacing, BorderRadius, AttendanceColors } from "@/constants/theme";

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

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const { user, updateSettings, updateUser } = useAuth();
  const { t, language, setLanguage } = useLanguage();

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

      <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.section}>
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
});
