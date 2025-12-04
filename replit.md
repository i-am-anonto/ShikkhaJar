# Overview

ShikkhaJar is a React Native mobile application built with Expo that helps tutors, students, and parents manage tuition sessions, track attendance, and coordinate schedules. The app features role-based navigation, collaborative calendars, attendance tracking with celebration animations, and multi-language support (English and Bangla).

The application uses phone number-based authentication and stores data locally using AsyncStorage. It's designed for cross-platform deployment (iOS, Android, Web) with platform-specific optimizations including haptic feedback, blur effects, and gesture handling.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework & Runtime**
- React Native 0.81.5 with React 19.1.0
- Expo SDK 54 with new architecture enabled
- React Compiler experimental support enabled
- Platform targets: iOS, Android, Web

**Navigation Structure**
- React Navigation v7 with native stack and bottom tabs
- Role-based tab navigation (Parent/Student vs Tutor flows)
- Transparent/blurred headers on iOS, solid headers on Android/Web
- Modal presentations for quick actions (add segment, notifications)
- Stack navigators: Home, Calendar, History/Earnings, Profile

**State Management**
- Context API for global state (AuthContext, LanguageContext, DataContext)
- Local state with React hooks for component-level state
- No external state management library (Redux/MobX)

**UI Components & Styling**
- Custom themed components (ThemedText, ThemedView, Card, Button)
- React Native Reanimated for animations (spring physics, gesture-driven)
- Platform-specific UI adaptations (BlurView on iOS, solid backgrounds elsewhere)
- Design system constants for spacing, typography, colors, and shadows
- Light/dark mode support with system preference detection

**Gestures & Interactions**
- React Native Gesture Handler for swipe/pan gestures
- Expo Haptics for tactile feedback (iOS/Android only)
- Keyboard-aware scroll views with react-native-keyboard-controller
- Animated pressable components with spring-based scale transformations

## Data Architecture

**Storage Strategy**
- AsyncStorage for local persistence (no backend/database yet)
- Data models: User, Segment, AttendanceRecord, PaymentRecord, SessionSummary, Notification
- Unique ID generation using timestamp-based strings
- Date formatting utilities for consistent date handling

**Data Models**
- User: phone authentication, role (parent/student/tutor), language preference, settings
- Segment: tuition session definition with partner info, class schedule, target days, fees
- AttendanceRecord: tracks attendance status (present, missed, rescheduled, makeup, exam)
- PaymentRecord: payment tracking for tutor earnings
- SessionSummary: historical session aggregation for cycle completion
- Notification: in-app notifications with type-based routing
- ExamResult: exam scores with marks, notes, image attachments, and voice notes (URI + duration)
- Referral: referral tracking with code, invitee info, status (pending/completed), and reward amount

**Features**
- Analytics dashboard: completion rates, attendance trends, weekly stats, most active day visualization
- Referral system: unique code generation from user name + ID, code sharing, referral tracking
- Exam results: upload marks with image attachments and voice note feedback using expo-av
- Push notifications: session reminders with configurable timing (15/30/60/120 minutes before)
- Voice notes: record, playback, and delete audio feedback for exam results (mobile only)

**Collaboration Model**
- Segments can be linked between users via partnerId
- Shared calendar views with filtered attendance records
- Reschedule requests with approval workflow (request → response → counter-offer)
- Invitation system for connecting tutors with students/parents

## Authentication & Authorization

**Authentication Flow**
- Phone number-based auth (no OTP implementation yet - design intent only)
- Single active user per device
- User roles: parent, student, tutor
- No backend authentication service (local only)

**Authorization**
- Role-based UI rendering (different tab bars per role)
- Feature access control based on user role
- Tutor-specific features: earnings tracking, student management
- Parent/Student features: tutor tracking, history archives

## Internationalization

**Multi-language Support**
- English and Bangla (Bengali) translations
- Translation keys stored in constants/translations.ts
- LanguageContext provides translation function t(key)
- User language preference stored in user profile
- Calendar and date formatting respect language setting

## Error Handling

**Error Boundaries**
- Top-level ErrorBoundary component wraps entire app
- Custom ErrorFallback component with developer details view
- Modal-based error details in development mode
- App reload functionality on errors
- Stack trace preservation for debugging

**User Feedback**
- Alert dialogs for destructive actions (logout, delete)
- Loading states during async operations
- Celebration animations for attendance milestones
- Platform-specific feedback (haptics on mobile, visual only on web)

# External Dependencies

**Core Framework**
- Expo SDK 54 (expo, expo-constants, expo-font, expo-linking, expo-splash-screen)
- React Navigation (native, native-stack, bottom-tabs, elements)
- React Native core (react-native, react, react-dom)

**UI & Animations**
- react-native-reanimated: Complex animations and gesture-driven interactions
- react-native-gesture-handler: Touch gesture recognition
- expo-blur: Blur effects for iOS translucent UI
- expo-glass-effect: Liquid glass visual effects (conditional usage)
- expo-haptics: Tactile feedback on iOS/Android

**Platform Services**
- react-native-safe-area-context: Safe area insets for notches/dynamic islands
- expo-system-ui: System UI color control
- expo-status-bar: Status bar styling
- expo-symbols: SF Symbols support on iOS
- expo-web-browser: In-app browser for external links

**Storage & Data**
- @react-native-async-storage/async-storage: Local key-value persistence
- No database (Postgres, SQLite, or otherwise) currently integrated
- No backend API integration

**Media & Audio**
- expo-av: Audio recording and playback for voice notes (deprecated in SDK 54)
- expo-image-picker: Camera and photo library access for exam result attachments
- expo-clipboard: Clipboard access for referral code copying

**Notifications**
- expo-notifications: Push notification scheduling for session reminders
- expo-device: Device identification for push tokens

**Input & Keyboard**
- react-native-keyboard-controller: Keyboard-aware scrolling and input management
- react-native-worklets: JavaScript worklets for animation thread

**Icons & Assets**
- @expo/vector-icons: Icon library (Feather icons primary)
- expo-image: Optimized image loading component

**Development Tools**
- TypeScript 5.9.2 with strict mode
- ESLint with Expo config and Prettier integration
- Babel with module resolver (@ alias to root)
- React Compiler babel plugin

**Platform-Specific Notes**
- iOS: Uses blur effects, haptics, SF Symbols, edge-to-edge layout
- Android: Adaptive icons, edge-to-edge enabled, predictive back disabled
- Web: Single-page application output, keyboard controller fallback to standard ScrollView