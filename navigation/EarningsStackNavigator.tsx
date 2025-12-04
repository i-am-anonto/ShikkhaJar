import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EarningsScreen from "@/screens/EarningsScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type EarningsStackParamList = {
  Earnings: undefined;
};

const Stack = createNativeStackNavigator<EarningsStackParamList>();

export default function EarningsStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator screenOptions={getCommonScreenOptions({ theme, isDark })}>
      <Stack.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ headerTitle: "" }}
      />
    </Stack.Navigator>
  );
}
