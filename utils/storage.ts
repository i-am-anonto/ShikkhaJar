import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  User,
  Segment,
  AttendanceRecord,
  PaymentRecord,
  SessionSummary,
  Notification,
  ExamResult,
  Referral,
} from "@/constants/types";

const STORAGE_KEYS = {
  USER: "@shikkhajar_user",
  SEGMENTS: "@shikkhajar_segments",
  ATTENDANCE: "@shikkhajar_attendance",
  PAYMENTS: "@shikkhajar_payments",
  SESSIONS: "@shikkhajar_sessions",
  NOTIFICATIONS: "@shikkhajar_notifications",
  PENDING_SYNC: "@shikkhajar_pending_sync",
  EXAM_RESULTS: "@shikkhajar_exam_results",
  REFERRALS: "@shikkhajar_referrals",
};

export const storage = {
  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },

  async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error("Error setting user:", error);
    }
  },

  async clearUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error("Error clearing user:", error);
    }
  },

  async getSegments(): Promise<Segment[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SEGMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting segments:", error);
      return [];
    }
  },

  async setSegments(segments: Segment[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SEGMENTS, JSON.stringify(segments));
    } catch (error) {
      console.error("Error setting segments:", error);
    }
  },

  async addSegment(segment: Segment): Promise<void> {
    try {
      const segments = await this.getSegments();
      segments.push(segment);
      await this.setSegments(segments);
    } catch (error) {
      console.error("Error adding segment:", error);
    }
  },

  async updateSegment(updatedSegment: Segment): Promise<void> {
    try {
      const segments = await this.getSegments();
      const index = segments.findIndex((s) => s.id === updatedSegment.id);
      if (index !== -1) {
        segments[index] = updatedSegment;
        await this.setSegments(segments);
      }
    } catch (error) {
      console.error("Error updating segment:", error);
    }
  },

  async deleteSegment(segmentId: string): Promise<void> {
    try {
      const segments = await this.getSegments();
      const filtered = segments.filter((s) => s.id !== segmentId);
      await this.setSegments(filtered);
    } catch (error) {
      console.error("Error deleting segment:", error);
    }
  },

  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting attendance:", error);
      return [];
    }
  },

  async setAttendanceRecords(records: AttendanceRecord[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
    } catch (error) {
      console.error("Error setting attendance:", error);
    }
  },

  async addAttendanceRecord(record: AttendanceRecord): Promise<void> {
    try {
      const records = await this.getAttendanceRecords();
      const existingIndex = records.findIndex(
        (r) => r.segmentId === record.segmentId && r.date === record.date
      );
      if (existingIndex !== -1) {
        records[existingIndex] = record;
      } else {
        records.push(record);
      }
      await this.setAttendanceRecords(records);
    } catch (error) {
      console.error("Error adding attendance:", error);
    }
  },

  async getAttendanceForSegment(segmentId: string): Promise<AttendanceRecord[]> {
    try {
      const records = await this.getAttendanceRecords();
      return records.filter((r) => r.segmentId === segmentId);
    } catch (error) {
      console.error("Error getting segment attendance:", error);
      return [];
    }
  },

  async getPaymentRecords(): Promise<PaymentRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting payments:", error);
      return [];
    }
  },

  async addPaymentRecord(record: PaymentRecord): Promise<void> {
    try {
      const records = await this.getPaymentRecords();
      records.push(record);
      await AsyncStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(records));
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  },

  async getSessionSummaries(): Promise<SessionSummary[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting sessions:", error);
      return [];
    }
  },

  async addSessionSummary(summary: SessionSummary): Promise<void> {
    try {
      const summaries = await this.getSessionSummaries();
      summaries.unshift(summary);
      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(summaries));
    } catch (error) {
      console.error("Error adding session:", error);
    }
  },

  async getNotifications(): Promise<Notification[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting notifications:", error);
      return [];
    }
  },

  async addNotification(notification: Notification): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      notifications.unshift(notification);
      if (notifications.length > 100) {
        notifications.pop();
      }
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const index = notifications.findIndex((n) => n.id === notificationId);
      if (index !== -1) {
        notifications[index].read = true;
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      }
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  },

  async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  },

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error("Error clearing all data:", error);
    }
  },

  async getExamResults(): Promise<ExamResult[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.EXAM_RESULTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting exam results:", error);
      return [];
    }
  },

  async addExamResult(result: ExamResult): Promise<void> {
    try {
      const results = await this.getExamResults();
      results.unshift(result);
      await AsyncStorage.setItem(STORAGE_KEYS.EXAM_RESULTS, JSON.stringify(results));
    } catch (error) {
      console.error("Error adding exam result:", error);
    }
  },

  async deleteExamResult(resultId: string): Promise<void> {
    try {
      const results = await this.getExamResults();
      const filtered = results.filter((r) => r.id !== resultId);
      await AsyncStorage.setItem(STORAGE_KEYS.EXAM_RESULTS, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting exam result:", error);
    }
  },

  async getReferrals(): Promise<Referral[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.REFERRALS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting referrals:", error);
      return [];
    }
  },

  async addReferral(referral: Referral): Promise<void> {
    try {
      const referrals = await this.getReferrals();
      referrals.push(referral);
      await AsyncStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(referrals));
    } catch (error) {
      console.error("Error adding referral:", error);
    }
  },

  async updateReferral(referral: Referral): Promise<void> {
    try {
      const referrals = await this.getReferrals();
      const index = referrals.findIndex((r) => r.id === referral.id);
      if (index !== -1) {
        referrals[index] = referral;
        await AsyncStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(referrals));
      }
    } catch (error) {
      console.error("Error updating referral:", error);
    }
  },
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function parseDate(dateString: string): Date {
  return new Date(dateString + "T00:00:00");
}
