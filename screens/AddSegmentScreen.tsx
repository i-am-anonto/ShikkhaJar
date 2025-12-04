import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { DayOfWeek } from "@/constants/types";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";

const DAYS = [
  { key: 0 as DayOfWeek, short: "S", full: "Sat" },
  { key: 1 as DayOfWeek, short: "S", full: "Sun" },
  { key: 2 as DayOfWeek, short: "M", full: "Mon" },
  { key: 3 as DayOfWeek, short: "T", full: "Tue" },
  { key: 4 as DayOfWeek, short: "W", full: "Wed" },
  { key: 5 as DayOfWeek, short: "T", full: "Thu" },
  { key: 6 as DayOfWeek, short: "F", full: "Fri" },
];

export default function AddSegmentScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addSegment } = useData();

  const [subject, setSubject] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [classDays, setClassDays] = useState<DayOfWeek[]>([]);
  const [classTime, setClassTime] = useState("");
  const [targetDays, setTargetDays] = useState("12");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleDay = (day: DayOfWeek) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setClassDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const canSubmit = () => {
    return (
      subject.trim().length > 0 &&
      partnerName.trim().length > 0 &&
      classDays.length > 0 &&
      parseInt(targetDays) > 0 &&
      parseInt(monthlyFee) > 0
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit() || !user) return;

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setIsLoading(true);
    try {
      await addSegment({
        name: `${subject} - ${partnerName}`,
        subject: subject.trim(),
        userId: user.id,
        partnerName: partnerName.trim(),
        partnerRole: user.role === "tutor" ? "student" : "tutor",
        classDays,
        classTime: classTime || "10:00",
        targetDays: parseInt(targetDays),
        monthlyFee: parseInt(monthlyFee),
        isCollaborated: false,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert(t("errorOccurred"), t("tryAgain"));
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundDefault,
      color: theme.text,
    },
  ];

  return (
    <ScreenKeyboardAwareScrollView>
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <ThemedText type="h2" style={styles.title}>
          {t("addSegment")}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          {t("subject")}
        </ThemedText>
        <TextInput
          style={inputStyle}
          value={subject}
          onChangeText={setSubject}
          placeholder="e.g., Math, Physics, English"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="words"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          {user?.role === "tutor" ? "Student Name" : "Tutor Name"}
        </ThemedText>
        <TextInput
          style={inputStyle}
          value={partnerName}
          onChangeText={setPartnerName}
          placeholder="e.g., Mr. Rahman, Ahmed"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="words"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          {t("classDays")}
        </ThemedText>
        <View style={styles.daysContainer}>
          {DAYS.map((day) => {
            const isSelected = classDays.includes(day.key);
            return (
              <Pressable
                key={day.key}
                onPress={() => toggleDay(day.key)}
                style={[
                  styles.dayButton,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.backgroundDefault,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{ color: isSelected ? "#FFFFFF" : theme.text, fontWeight: "600" }}
                >
                  {day.full}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(400)}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          {t("classTime")}
        </ThemedText>
        <TextInput
          style={inputStyle}
          value={classTime}
          onChangeText={setClassTime}
          placeholder="e.g., 10:00 AM"
          placeholderTextColor={theme.textSecondary}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).duration(400)}>
        <View style={styles.row}>
          <View style={styles.halfField}>
            <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
              {t("targetDays")}
            </ThemedText>
            <TextInput
              style={inputStyle}
              value={targetDays}
              onChangeText={setTargetDays}
              placeholder="12"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.halfField}>
            <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
              {t("monthlyFee")} (Tk)
            </ThemedText>
            <TextInput
              style={inputStyle}
              value={monthlyFee}
              onChangeText={setMonthlyFee}
              placeholder="5000"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
            />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(700).duration(400)} style={styles.footer}>
        <Button
          onPress={handleSubmit}
          disabled={!canSubmit() || isLoading}
          style={[
            styles.submitButton,
            { backgroundColor: canSubmit() ? theme.primary : theme.backgroundTertiary },
          ]}
        >
          {isLoading ? "..." : t("save")}
        </Button>
      </Animated.View>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: Spacing["2xl"],
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.body.fontSize,
    marginBottom: Spacing.xl,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dayButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  footer: {
    marginTop: Spacing.xl,
  },
  submitButton: {
    width: "100%",
  },
});
