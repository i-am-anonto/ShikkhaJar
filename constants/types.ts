export type UserRole = "parent" | "student" | "tutor";

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  language: "en" | "bn";
  createdAt: string;
  settings: UserSettings;
}

export interface UserSettings {
  attendanceColor: string;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  darkMode: "system" | "light" | "dark";
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Segment {
  id: string;
  name: string;
  subject: string;
  userId: string;
  partnerId?: string;
  partnerName: string;
  partnerRole: UserRole;
  classDays: DayOfWeek[];
  classTime: string;
  targetDays: number;
  monthlyFee: number;
  currentCycleStart: string;
  createdAt: string;
  isCollaborated: boolean;
}

export type AttendanceStatus = "present" | "missed" | "rescheduled" | "makeup" | "exam";

export interface AttendanceRecord {
  id: string;
  segmentId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  markedAt: string;
  rescheduleInfo?: RescheduleInfo;
  examInfo?: ExamInfo;
}

export interface RescheduleInfo {
  id: string;
  originalDate: string;
  proposedDate: string;
  proposedTime: string;
  reason: string;
  proposedBy: string;
  status: "pending" | "accepted" | "rejected" | "counter";
  counterProposal?: {
    date: string;
    time: string;
    reason: string;
  };
}

export interface ExamInfo {
  subject: string;
  notes?: string;
  resultUrl?: string;
}

export interface PaymentRecord {
  id: string;
  segmentId: string;
  amount: number;
  paidAt: string;
  cycleStart: string;
  cycleEnd: string;
  classesTaken: number;
  classesMissed: number;
  classesRescheduled: number;
}

export interface SessionSummary {
  id: string;
  segmentId: string;
  month: string;
  year: number;
  classesTaken: number;
  classesMissed: number;
  classesRescheduled: number;
  amountPaid: number;
  attendanceRecords: AttendanceRecord[];
  paymentRecord?: PaymentRecord;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  segmentId?: string;
  date: string;
  read: boolean;
  actionType?: "mark_attendance" | "accept_reschedule" | "mark_paid" | "view";
  createdAt: string;
}

export type NotificationType =
  | "attendance_marked"
  | "attendance_reminder"
  | "reschedule_request"
  | "reschedule_response"
  | "payment_reminder"
  | "payment_received"
  | "cycle_warning"
  | "cycle_complete"
  | "exam_reminder"
  | "collaboration_invite";

export interface PortfolioStats {
  totalClasses: number;
  totalStudents: number;
  totalEarnings: number;
  subjects: string[];
  monthlyBreakdown: {
    month: string;
    classes: number;
    earnings: number;
  }[];
}
