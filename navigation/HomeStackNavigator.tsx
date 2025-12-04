import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "@/screens/DashboardScreen";
import SegmentDetailScreen from "@/screens/SegmentDetailScreen";
import AddSegmentScreen from "@/screens/AddSegmentScreen";
import NotificationsScreen from "@/screens/NotificationsScreen";
import ExamResultsScreen from "@/screens/ExamResultsScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type HomeStackParamList = {
  Dashboard: undefined;
  SegmentDetail: { segmentId: string };
  AddSegment: undefined;
  Notifications: undefined;
  ExamResults: { segmentId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerTitle: () => <HeaderTitle title="ShikkhaJar" />,
        }}
      />
      <Stack.Screen
        name="SegmentDetail"
        component={SegmentDetailScreen}
        options={{ headerTitle: "" }}
      />
      <Stack.Screen
        name="AddSegment"
        component={AddSegmentScreen}
        options={{ 
          headerTitle: "",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ 
          headerTitle: "",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="ExamResults"
        component={ExamResultsScreen}
        options={{ 
          headerTitle: "",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
