import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Dimensions,
  Image,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/constants/types";
import { Language, translations } from "@/constants/translations";
import { Spacing, BorderRadius, Typography, AttendanceColors } from "@/constants/theme";

const { width } = Dimensions.get("window");

type OnboardingStep = "welcome" | "phone" | "name" | "role" | "language";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface RoleCardProps {
  role: UserRole;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  selected: boolean;
  onPress: () => void;
  theme: any;
}

function RoleCard({ role, title, description, icon, selected, onPress, theme }: RoleCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.roleCard,
        {
          backgroundColor: selected ? theme.primary : theme.backgroundDefault,
          borderColor: selected ? theme.primary : theme.border,
        },
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.roleIconContainer,
          { backgroundColor: selected ? "rgba(255,255,255,0.2)" : theme.backgroundSecondary },
        ]}
      >
        <Feather
          name={icon}
          size={28}
          color={selected ? "#FFFFFF" : theme.primary}
        />
      </View>
      <ThemedText
        type="h4"
        style={[styles.roleTitle, { color: selected ? "#FFFFFF" : theme.text }]}
      >
        {title}
      </ThemedText>
      <ThemedText
        type="small"
        style={[styles.roleDesc, { color: selected ? "rgba(255,255,255,0.8)" : theme.textSecondary }]}
      >
        {description}
      </ThemedText>
    </AnimatedPressable>
  );
}

interface LanguageOptionProps {
  lang: Language;
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: any;
}

function LanguageOption({ lang, label, selected, onPress, theme }: LanguageOptionProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96);
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[
        styles.languageOption,
        {
          backgroundColor: selected ? theme.primary : theme.backgroundDefault,
          borderColor: selected ? theme.primary : theme.border,
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        type="h3"
        style={{ color: selected ? "#FFFFFF" : theme.text }}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

export default function OnboardingScreen() {
  const { theme, isDark } = useTheme();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);

  const t = (key: keyof typeof translations.en) => translations[language][key];

  const canProceed = () => {
    switch (step) {
      case "welcome":
        return true;
      case "phone":
        return phone.length >= 10;
      case "name":
        return name.trim().length >= 2;
      case "role":
        return role !== null;
      case "language":
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    switch (step) {
      case "welcome":
        setStep("phone");
        break;
      case "phone":
        setStep("name");
        break;
      case "name":
        setStep("role");
        break;
      case "role":
        setStep("language");
        break;
      case "language":
        if (role) {
          setIsLoading(true);
          try {
            await login(phone, name, role, language);
          } finally {
            setIsLoading(false);
          }
        }
        break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case "phone":
        setStep("welcome");
        break;
      case "name":
        setStep("phone");
        break;
      case "role":
        setStep("name");
        break;
      case "language":
        setStep("role");
        break;
    }
  };

  const renderStepIndicator = () => {
    const steps: OnboardingStep[] = ["welcome", "phone", "name", "role", "language"];
    const currentIndex = steps.indexOf(step);

    return (
      <View style={styles.stepIndicator}>
        {steps.map((s, i) => (
          <View
            key={s}
            style={[
              styles.stepDot,
              {
                backgroundColor: i <= currentIndex ? theme.primary : theme.backgroundTertiary,
                width: i === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderContent = () => {
    switch (step) {
      case "welcome":
        return (
          <Animated.View
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(200)}
            style={styles.stepContent}
          >
            <Image
              source={require("../assets/images/icon.png")}
              style={styles.welcomeIcon}
              resizeMode="contain"
            />
            <ThemedText type="h1" style={styles.welcomeTitle}>
              {t("appName")}
            </ThemedText>
            <ThemedText type="body" style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
              Track tutor attendance with ease
            </ThemedText>
          </Animated.View>
        );

      case "phone":
        return (
          <Animated.View
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(200)}
            style={styles.stepContent}
          >
            <ThemedText type="h2" style={styles.stepTitle}>
              {t("phoneNumber")}
            </ThemedText>
            <ThemedText type="body" style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
              {t("enterPhone")}
            </ThemedText>
            <View style={styles.inputContainer}>
              <View style={[styles.countryCode, { backgroundColor: theme.backgroundDefault }]}>
                <ThemedText type="body">+880</ThemedText>
              </View>
              <TextInput
                style={[
                  styles.input,
                  styles.phoneInput,
                  {
                    backgroundColor: theme.backgroundDefault,
                    color: theme.text,
                  },
                ]}
                value={phone}
                onChangeText={setPhone}
                placeholder="1XXXXXXXXX"
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
                maxLength={11}
                autoFocus
              />
            </View>
          </Animated.View>
        );

      case "name":
        return (
          <Animated.View
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(200)}
            style={styles.stepContent}
          >
            <ThemedText type="h2" style={styles.stepTitle}>
              {t("name")}
            </ThemedText>
            <ThemedText type="body" style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
              {t("enterName")}
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder={t("enterName")}
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="words"
              autoFocus
            />
          </Animated.View>
        );

      case "role":
        return (
          <Animated.View
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(200)}
            style={styles.stepContent}
          >
            <ThemedText type="h2" style={styles.stepTitle}>
              {t("selectRole")}
            </ThemedText>
            <View style={styles.roleContainer}>
              <RoleCard
                role="parent"
                title={t("parent")}
                description={t("parentDesc")}
                icon="users"
                selected={role === "parent"}
                onPress={() => setRole("parent")}
                theme={theme}
              />
              <RoleCard
                role="student"
                title={t("student")}
                description={t("studentDesc")}
                icon="book-open"
                selected={role === "student"}
                onPress={() => setRole("student")}
                theme={theme}
              />
              <RoleCard
                role="tutor"
                title={t("tutor")}
                description={t("tutorDesc")}
                icon="award"
                selected={role === "tutor"}
                onPress={() => setRole("tutor")}
                theme={theme}
              />
            </View>
          </Animated.View>
        );

      case "language":
        return (
          <Animated.View
            entering={SlideInRight.duration(300)}
            exiting={SlideOutLeft.duration(200)}
            style={styles.stepContent}
          >
            <ThemedText type="h2" style={styles.stepTitle}>
              {t("language")}
            </ThemedText>
            <View style={styles.languageContainer}>
              <LanguageOption
                lang="en"
                label="English"
                selected={language === "en"}
                onPress={() => setLanguage("en")}
                theme={theme}
              />
              <LanguageOption
                lang="bn"
                label="বাংলা"
                selected={language === "bn"}
                onPress={() => setLanguage("bn")}
                theme={theme}
              />
            </View>
          </Animated.View>
        );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        {step !== "welcome" ? (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
        ) : (
          <View style={styles.backButton} />
        )}
        {renderStepIndicator()}
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>{renderContent()}</View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Button
          onPress={handleNext}
          disabled={!canProceed() || isLoading}
          style={[
            styles.nextButton,
            { backgroundColor: canProceed() ? theme.primary : theme.backgroundTertiary },
          ]}
        >
          {isLoading ? "..." : step === "language" ? t("done") : step === "welcome" ? t("getStarted") : t("next")}
        </Button>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  stepDot: {
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  stepContent: {
    alignItems: "center",
  },
  welcomeIcon: {
    width: 100,
    height: 100,
    marginBottom: Spacing["2xl"],
  },
  welcomeTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  welcomeSubtitle: {
    textAlign: "center",
  },
  stepTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  inputContainer: {
    flexDirection: "row",
    width: "100%",
    gap: Spacing.sm,
  },
  countryCode: {
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.body.fontSize,
    width: "100%",
  },
  phoneInput: {
    flex: 1,
  },
  roleContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  roleCard: {
    width: "100%",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: "center",
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  roleTitle: {
    marginBottom: Spacing.xs,
  },
  roleDesc: {
    textAlign: "center",
  },
  languageContainer: {
    flexDirection: "row",
    width: "100%",
    gap: Spacing.md,
  },
  languageOption: {
    flex: 1,
    height: 100,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
  nextButton: {
    width: "100%",
  },
});
