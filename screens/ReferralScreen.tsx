import React, { useState } from "react";
import { View, StyleSheet, Pressable, Share, Platform, Alert } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";

import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useData } from "@/context/DataContext";
import { Spacing, BorderRadius } from "@/constants/theme";

const REFERRAL_BONUS = 50;

export default function ReferralScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { referrals } = useData();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.referralCode || `SHIKKHA${user?.phone?.slice(-4) || "0000"}`;
  const totalCredits = (referrals?.length || 0) * REFERRAL_BONUS;
  const pendingCredits = referrals?.filter((r) => r.status === "pending").length || 0;
  const successfulReferrals = referrals?.filter((r) => r.status === "completed").length || 0;

  const handleCopyCode = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      const message = language === "en"
        ? `Join ShikkhaJar - the best tutor attendance tracking app! Use my referral code "${referralCode}" to get ${REFERRAL_BONUS} Taka bonus on your first month. Download now: https://shikkhajar.app/download`
        : `ShikkhaJar এ যোগ দিন - সেরা টিউটর অ্যাটেন্ডেন্স ট্র্যাকিং অ্যাপ! আমার রেফারেল কোড "${referralCode}" ব্যবহার করে প্রথম মাসে ${REFERRAL_BONUS} টাকা বোনাস পান। এখনই ডাউনলোড করুন: https://shikkhajar.app/download`;
      
      await Share.share({
        message,
        title: language === "en" ? "Join ShikkhaJar" : "ShikkhaJar এ যোগ দিন",
      });
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  return (
    <ScreenScrollView>
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <ThemedText type="h2" style={styles.title}>
          {t("referralRewards")}
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          {language === "en" 
            ? "Invite friends and earn credits" 
            : "বন্ধুদের আমন্ত্রণ জানান এবং ক্রেডিট অর্জন করুন"}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Card style={styles.creditCard}>
          <View style={styles.creditIconContainer}>
            <View style={[styles.creditIcon, { backgroundColor: theme.success + "20" }]}>
              <Feather name="gift" size={32} color={theme.success} />
            </View>
          </View>
          <ThemedText type="h1" style={[styles.creditAmount, { color: theme.success }]}>
            {totalCredits} {language === "en" ? "Taka" : "টাকা"}
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {language === "en" ? "Total Credits Earned" : "মোট অর্জিত ক্রেডিট"}
          </ThemedText>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText type="h3" style={{ color: theme.primary }}>
                {successfulReferrals}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {language === "en" ? "Successful" : "সফল"}
              </ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <ThemedText type="h3" style={{ color: theme.warning }}>
                {pendingCredits}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {language === "en" ? "Pending" : "মুলতুবি"}
              </ThemedText>
            </View>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <Card style={styles.codeCard}>
          <ThemedText type="h4" style={styles.codeLabel}>
            {language === "en" ? "Your Referral Code" : "আপনার রেফারেল কোড"}
          </ThemedText>
          <View style={[styles.codeContainer, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h2" style={styles.codeText}>
              {referralCode}
            </ThemedText>
            <Pressable
              onPress={handleCopyCode}
              style={({ pressed }) => [
                styles.copyButton,
                { backgroundColor: copied ? theme.success : theme.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name={copied ? "check" : "copy"} size={18} color="#fff" />
            </Pressable>
          </View>
          {copied ? (
            <ThemedText type="small" style={[styles.copiedText, { color: theme.success }]}>
              {language === "en" ? "Code copied to clipboard!" : "কোড কপি করা হয়েছে!"}
            </ThemedText>
          ) : null}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <Button onPress={handleShare} style={styles.shareButton}>
          <View style={styles.shareButtonContent}>
            <Feather name="share-2" size={20} color="#fff" style={styles.shareIcon} />
            <ThemedText type="body" style={{ color: "#fff", fontWeight: "600" }}>
              {language === "en" ? "Share with Friends" : "বন্ধুদের সাথে শেয়ার করুন"}
            </ThemedText>
          </View>
        </Button>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(400)}>
        <Card style={styles.howItWorksCard}>
          <ThemedText type="h4" style={styles.howItWorksTitle}>
            {language === "en" ? "How It Works" : "কিভাবে কাজ করে"}
          </ThemedText>
          
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: theme.primary + "20" }]}>
                <ThemedText type="body" style={{ color: theme.primary, fontWeight: "700" }}>
                  1
                </ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {language === "en" ? "Share Your Code" : "আপনার কোড শেয়ার করুন"}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {language === "en" 
                    ? "Send your unique referral code to friends" 
                    : "বন্ধুদের কাছে আপনার অনন্য রেফারেল কোড পাঠান"}
                </ThemedText>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: theme.secondary + "20" }]}>
                <ThemedText type="body" style={{ color: theme.secondary, fontWeight: "700" }}>
                  2
                </ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {language === "en" ? "Friend Signs Up" : "বন্ধু সাইন আপ করে"}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {language === "en" 
                    ? "They download and register with your code" 
                    : "তারা আপনার কোড দিয়ে ডাউনলোড এবং রেজিস্টার করে"}
                </ThemedText>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: theme.success + "20" }]}>
                <ThemedText type="body" style={{ color: theme.success, fontWeight: "700" }}>
                  3
                </ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {language === "en" ? "Both Get Rewards" : "উভয়েই পুরস্কার পায়"}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {language === "en" 
                    ? `You both get ${REFERRAL_BONUS} Taka credit` 
                    : `আপনারা উভয়েই ${REFERRAL_BONUS} টাকা ক্রেডিট পাবেন`}
                </ThemedText>
              </View>
            </View>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).duration(400)}>
        <ThemedText type="h4" style={styles.historyTitle}>
          {language === "en" ? "Referral History" : "রেফারেল ইতিহাস"}
        </ThemedText>
        
        {(!referrals || referrals.length === 0) ? (
          <Card style={styles.emptyHistoryCard}>
            <Feather name="users" size={32} color={theme.textSecondary} />
            <ThemedText type="body" style={[styles.emptyHistoryText, { color: theme.textSecondary }]}>
              {language === "en" 
                ? "No referrals yet. Start sharing your code!" 
                : "এখনও কোনো রেফারেল নেই। আপনার কোড শেয়ার করা শুরু করুন!"}
            </ThemedText>
          </Card>
        ) : (
          referrals.map((referral, index) => (
            <Animated.View 
              key={referral.id} 
              entering={FadeInUp.delay(650 + index * 50).duration(300)}
            >
              <Card style={styles.referralItem}>
                <View style={styles.referralItemLeft}>
                  <View style={[styles.referralAvatar, { backgroundColor: theme.primary + "20" }]}>
                    <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
                      {referral.referredName.charAt(0).toUpperCase()}
                    </ThemedText>
                  </View>
                  <View>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>
                      {referral.referredName}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      {new Date(referral.createdAt).toLocaleDateString(language === "en" ? "en-US" : "bn-BD")}
                    </ThemedText>
                  </View>
                </View>
                <View style={[
                  styles.referralStatus,
                  { backgroundColor: referral.status === "completed" ? theme.success + "20" : theme.warning + "20" }
                ]}>
                  <ThemedText 
                    type="small" 
                    style={{ 
                      color: referral.status === "completed" ? theme.success : theme.warning,
                      fontWeight: "600"
                    }}
                  >
                    {referral.status === "completed" 
                      ? (language === "en" ? "Completed" : "সম্পন্ন")
                      : (language === "en" ? "Pending" : "মুলতুবি")}
                  </ThemedText>
                </View>
              </Card>
            </Animated.View>
          ))
        )}
      </Animated.View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  creditCard: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
    marginBottom: Spacing.xl,
  },
  creditIconContainer: {
    marginBottom: Spacing.lg,
  },
  creditIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  creditAmount: {
    marginBottom: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  codeCard: {
    marginBottom: Spacing.xl,
  },
  codeLabel: {
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  codeText: {
    letterSpacing: 2,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  copiedText: {
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  shareButton: {
    marginBottom: Spacing.xl,
  },
  shareButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  shareIcon: {
    marginRight: Spacing.sm,
  },
  howItWorksCard: {
    marginBottom: Spacing.xl,
  },
  howItWorksTitle: {
    marginBottom: Spacing.lg,
  },
  stepsList: {
    gap: Spacing.lg,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepContent: {
    flex: 1,
    gap: 4,
  },
  historyTitle: {
    marginBottom: Spacing.lg,
  },
  emptyHistoryCard: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  emptyHistoryText: {
    textAlign: "center",
  },
  referralItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  referralItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  referralAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  referralStatus: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
});
