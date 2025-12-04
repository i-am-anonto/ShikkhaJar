import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { Segment, DayOfWeek } from "@/constants/types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface ScheduledReminder {
  segmentId: string;
  identifier: string;
  day: DayOfWeek;
  time: string;
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === "web") {
    return null;
  }

  let token: string | null = null;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return null;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: "shikkhajar",
      });
      token = tokenData.data;
    } catch (error) {
      console.log("Error getting push token:", error);
    }
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4F46E5",
    });
    
    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Session Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4F46E5",
    });
  }

  return token;
}

export async function scheduleSessionReminder(
  segment: Segment,
  minutesBefore: number = 30,
  title: string,
  body: string
): Promise<string[]> {
  const identifiers: string[] = [];

  await cancelSegmentReminders(segment.id);

  for (const day of segment.classDays) {
    const [hours, minutes] = segment.classTime.split(":").map(Number);
    
    let reminderHours = hours;
    let reminderMinutes = minutes - minutesBefore;
    let reminderDay = day;

    while (reminderMinutes < 0) {
      reminderMinutes += 60;
      reminderHours -= 1;
    }

    while (reminderHours < 0) {
      reminderHours += 24;
      reminderDay = ((reminderDay - 1 + 7) % 7) as DayOfWeek;
    }

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { segmentId: segment.id, type: "session_reminder" },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: reminderDay + 1,
          hour: reminderHours,
          minute: reminderMinutes,
        },
      });

      identifiers.push(identifier);
    } catch (error) {
      console.log("Error scheduling notification:", error);
    }
  }

  return identifiers;
}

export async function cancelSegmentReminders(segmentId: string): Promise<void> {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notification of scheduledNotifications) {
    if (notification.content.data?.segmentId === segmentId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function sendInstantNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null,
  });
}

export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}
