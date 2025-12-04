import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import OnboardingScreen from "@/screens/OnboardingScreen";
import ParentTabNavigator from "@/navigation/ParentTabNavigator";
import TutorTabNavigator from "@/navigation/TutorTabNavigator";
import { ActivityIndicator, View, StyleSheet } from "react-native";

export type RootStackParamList = {
  Onboarding: undefined;
  ParentTabs: undefined;
  TutorTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { theme, isDark } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : user?.role === "tutor" ? (
        <Stack.Screen name="TutorTabs" component={TutorTabNavigator} />
      ) : (
        <Stack.Screen name="ParentTabs" component={ParentTabNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
