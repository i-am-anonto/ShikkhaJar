import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import {
  Segment,
  AttendanceRecord,
  PaymentRecord,
  SessionSummary,
  Notification,
  AttendanceStatus,
  RescheduleInfo,
} from "@/constants/types";
import { storage, generateId, formatDate } from "@/utils/storage";
import { useAuth } from "./AuthContext";

interface DataContextType {
  segments: Segment[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  sessions: SessionSummary[];
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addSegment: (segment: Omit<Segment, "id" | "createdAt" | "currentCycleStart">) => Promise<Segment>;
  updateSegment: (segment: Segment) => Promise<void>;
  deleteSegment: (segmentId: string) => Promise<void>;
  markAttendance: (segmentId: string, date: string, status: AttendanceStatus) => Promise<void>;
  getAttendanceForDate: (segmentId: string, date: string) => AttendanceRecord | undefined;
  getSegmentProgress: (segmentId: string) => { taken: number; target: number; daysRemaining: number };
  markPayment: (segmentId: string, amount: number) => Promise<void>;
  requestReschedule: (segmentId: string, originalDate: string, proposedDate: string, proposedTime: string, reason: string) => Promise<void>;
  respondToReschedule: (recordId: string, accept: boolean, counterDate?: string, counterTime?: string, counterReason?: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadData = useCallback(async () => {
    if (!user) {
      setSegments([]);
      setAttendance([]);
      setPayments([]);
      setSessions([]);
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      const [segs, att, pay, sess, notif] = await Promise.all([
        storage.getSegments(),
        storage.getAttendanceRecords(),
        storage.getPaymentRecords(),
        storage.getSessionSummaries(),
        storage.getNotifications(),
      ]);
      setSegments(segs);
      setAttendance(att);
      setPayments(pay);
      setSessions(sess);
      setNotifications(notif);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = async () => {
    setIsLoading(true);
    await loadData();
  };

  const addSegment = async (segmentData: Omit<Segment, "id" | "createdAt" | "currentCycleStart">): Promise<Segment> => {
    const segment: Segment = {
      ...segmentData,
      id: generateId(),
      createdAt: formatDate(new Date()),
      currentCycleStart: formatDate(new Date()),
    };
    await storage.addSegment(segment);
    setSegments((prev) => [...prev, segment]);
    return segment;
  };

  const updateSegment = async (segment: Segment) => {
    await storage.updateSegment(segment);
    setSegments((prev) => prev.map((s) => (s.id === segment.id ? segment : s)));
  };

  const deleteSegment = async (segmentId: string) => {
    await storage.deleteSegment(segmentId);
    setSegments((prev) => prev.filter((s) => s.id !== segmentId));
  };

  const markAttendance = async (segmentId: string, date: string, status: AttendanceStatus) => {
    if (!user) return;
    
    const record: AttendanceRecord = {
      id: generateId(),
      segmentId,
      date,
      status,
      markedBy: user.id,
      markedAt: new Date().toISOString(),
    };
    
    await storage.addAttendanceRecord(record);
    setAttendance((prev) => {
      const existingIndex = prev.findIndex((r) => r.segmentId === segmentId && r.date === date);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = record;
        return updated;
      }
      return [...prev, record];
    });

    const segment = segments.find((s) => s.id === segmentId);
    if (segment) {
      const notif: Notification = {
        id: generateId(),
        type: "attendance_marked",
        title: status === "present" ? "Class Marked" : "Class Status Updated",
        message: `${segment.subject} - ${segment.partnerName}: ${status}`,
        segmentId,
        date,
        read: false,
        createdAt: new Date().toISOString(),
      };
      await storage.addNotification(notif);
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const getAttendanceForDate = (segmentId: string, date: string): AttendanceRecord | undefined => {
    return attendance.find((r) => r.segmentId === segmentId && r.date === date);
  };

  const getSegmentProgress = (segmentId: string) => {
    const segment = segments.find((s) => s.id === segmentId);
    if (!segment) return { taken: 0, target: 0, daysRemaining: 0 };

    const cycleStart = new Date(segment.currentCycleStart);
    const segmentAttendance = attendance.filter(
      (r) =>
        r.segmentId === segmentId &&
        new Date(r.date) >= cycleStart &&
        (r.status === "present" || r.status === "makeup")
    );

    const taken = segmentAttendance.length;
    const target = segment.targetDays;
    const daysRemaining = Math.max(0, target - taken);

    return { taken, target, daysRemaining };
  };

  const markPayment = async (segmentId: string, amount: number) => {
    if (!user) return;

    const segment = segments.find((s) => s.id === segmentId);
    if (!segment) return;

    const cycleStart = new Date(segment.currentCycleStart);
    const today = new Date();
    
    const cycleAttendance = attendance.filter(
      (r) => r.segmentId === segmentId && new Date(r.date) >= cycleStart
    );

    const classesTaken = cycleAttendance.filter((r) => r.status === "present" || r.status === "makeup").length;
    const classesMissed = cycleAttendance.filter((r) => r.status === "missed").length;
    const classesRescheduled = cycleAttendance.filter((r) => r.status === "rescheduled").length;

    const payment: PaymentRecord = {
      id: generateId(),
      segmentId,
      amount,
      paidAt: new Date().toISOString(),
      cycleStart: segment.currentCycleStart,
      cycleEnd: formatDate(today),
      classesTaken,
      classesMissed,
      classesRescheduled,
    };

    await storage.addPaymentRecord(payment);
    setPayments((prev) => [...prev, payment]);

    const summary: SessionSummary = {
      id: generateId(),
      segmentId,
      month: today.toLocaleString("default", { month: "long" }),
      year: today.getFullYear(),
      classesTaken,
      classesMissed,
      classesRescheduled,
      amountPaid: amount,
      attendanceRecords: cycleAttendance,
      paymentRecord: payment,
    };

    await storage.addSessionSummary(summary);
    setSessions((prev) => [summary, ...prev]);

    const updatedSegment = {
      ...segment,
      currentCycleStart: formatDate(today),
    };
    await storage.updateSegment(updatedSegment);
    setSegments((prev) => prev.map((s) => (s.id === segmentId ? updatedSegment : s)));

    const notif: Notification = {
      id: generateId(),
      type: "payment_received",
      title: "Payment Received",
      message: `Payment of ৳${amount} received for ${segment.subject}`,
      segmentId,
      date: formatDate(today),
      read: false,
      createdAt: new Date().toISOString(),
    };
    await storage.addNotification(notif);
    setNotifications((prev) => [notif, ...prev]);
  };

  const requestReschedule = async (
    segmentId: string,
    originalDate: string,
    proposedDate: string,
    proposedTime: string,
    reason: string
  ) => {
    if (!user) return;

    const rescheduleInfo: RescheduleInfo = {
      id: generateId(),
      originalDate,
      proposedDate,
      proposedTime,
      reason,
      proposedBy: user.id,
      status: "pending",
    };

    const record: AttendanceRecord = {
      id: generateId(),
      segmentId,
      date: originalDate,
      status: "rescheduled",
      markedBy: user.id,
      markedAt: new Date().toISOString(),
      rescheduleInfo,
    };

    await storage.addAttendanceRecord(record);
    setAttendance((prev) => [...prev, record]);

    const segment = segments.find((s) => s.id === segmentId);
    if (segment) {
      const notif: Notification = {
        id: generateId(),
        type: "reschedule_request",
        title: "Reschedule Request",
        message: `${segment.partnerName} requested to reschedule ${segment.subject} class`,
        segmentId,
        date: originalDate,
        read: false,
        actionType: "accept_reschedule",
        createdAt: new Date().toISOString(),
      };
      await storage.addNotification(notif);
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const respondToReschedule = async (
    recordId: string,
    accept: boolean,
    counterDate?: string,
    counterTime?: string,
    counterReason?: string
  ) => {
    const recordIndex = attendance.findIndex((r) => r.id === recordId);
    if (recordIndex === -1) return;

    const record = attendance[recordIndex];
    if (!record.rescheduleInfo) return;

    const updatedRecord = { ...record };
    
    if (accept) {
      updatedRecord.rescheduleInfo = {
        ...record.rescheduleInfo,
        status: "accepted",
      };
    } else if (counterDate && counterTime && counterReason) {
      updatedRecord.rescheduleInfo = {
        ...record.rescheduleInfo,
        status: "counter",
        counterProposal: {
          date: counterDate,
          time: counterTime,
          reason: counterReason,
        },
      };
    } else {
      updatedRecord.rescheduleInfo = {
        ...record.rescheduleInfo,
        status: "rejected",
      };
    }

    await storage.addAttendanceRecord(updatedRecord);
    setAttendance((prev) => {
      const updated = [...prev];
      updated[recordIndex] = updatedRecord;
      return updated;
    });
  };

  const addNotificationHandler = async (notification: Omit<Notification, "id" | "createdAt">) => {
    const notif: Notification = {
      ...notification,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await storage.addNotification(notif);
    setNotifications((prev) => [notif, ...prev]);
  };

  const markNotificationRead = async (notificationId: string) => {
    await storage.markNotificationRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = async () => {
    await storage.clearAllNotifications();
    setNotifications([]);
  };

  return (
    <DataContext.Provider
      value={{
        segments,
        attendance,
        payments,
        sessions,
        notifications,
        unreadCount,
        isLoading,
        refreshData,
        addSegment,
        updateSegment,
        deleteSegment,
        markAttendance,
        getAttendanceForDate,
        getSegmentProgress,
        markPayment,
        requestReschedule,
        respondToReschedule,
        addNotification: addNotificationHandler,
        markNotificationRead,
        clearNotifications,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
