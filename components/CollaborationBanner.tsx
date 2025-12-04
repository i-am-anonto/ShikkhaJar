import React from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/context/LanguageContext";
import { UserRole } from "@/constants/types";
import { Spacing, BorderRadius } from "@/constants/theme";

interface CollaborationBannerProps {
  role: UserRole;
  onInvite: () => void;
  onDismiss?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CollaborationBanner({ role, onInvite, onDismiss }: CollaborationBannerProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onInvite();
  };

  const inviteText = role === "tutor" ? t("inviteStudent") : t("inviteTutor");

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.secondary + "15" }, animatedStyle]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.secondary + "20" }]}>
          <Feather name="users" size={20} color={theme.secondary} />
        </View>
        <View style={styles.textContainer}>
          <ThemedText type="body" style={[styles.title, { color: theme.secondary }]}>
            {inviteText}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.secondary, opacity: 0.8 }}>
            {t("collaborationBenefit")}
          </ThemedText>
        </View>
      </View>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => {
          scale.value = withSpring(0.95);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        style={[styles.inviteButton, { backgroundColor: theme.secondary }]}
      >
        <Feather name="share-2" size={16} color="#FFFFFF" />
        <ThemedText type="small" style={styles.inviteText}>
          {t("shareApp")}
        </ThemedText>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
    marginBottom: 2,
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  inviteText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
