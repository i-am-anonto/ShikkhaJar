# ShikkhaJar Design Guidelines

## Authentication & Onboarding

**Auth Flow:**
- Phone number-based authentication (required - multi-user with sync)
- Onboarding screens:
  1. Phone number entry with OTP verification
  2. Name input field
  3. Role selection (Parent, Student, Tutor) with large, tappable cards
  4. Language preference selection (Bangla/English)
- No email/password - use phone number as primary identifier
- Include privacy policy & terms links on phone entry screen
- Profile screen includes: avatar, name, phone number, role badge, language toggle

## Navigation Architecture

**Root Navigation:** Tab Bar (role-specific)
- Parent/Student (4 tabs):
  - Home (Dashboard with tutor segments)
  - Calendar (aggregated view)
  - History (archived sessions)
  - Profile
- Tutor (4 tabs):
  - Home (Student segments)
  - Calendar (aggregated view)
  - Earnings
  - Profile

**Information Architecture:**
- Each role has distinct content in Home tab
- Calendar is shared/collaborative between parties
- Heavy use of modals for quick actions (mark attendance, reschedule, view details)

## Screen Specifications

### 1. Dashboard (Home Tab)
**Purpose:** Display tutor/student segments with quick stats

**Layout:**
- Transparent header with greeting ("Hello, [Name]") and notification bell (right button)
- Scrollable content area
- Top safe area: headerHeight + Spacing.xl
- Bottom safe area: tabBarHeight + Spacing.xl

**Components:**
- Hero card: Monthly progress summary ("This Month: 9 sessions")
- Segment cards (scrollable list):
  - Subject name + tutor/student name
  - Mini calendar preview (current week)
  - Quick "Mark Today" button
  - Payment progress indicator for parents
- Floating "+" button (bottom-right) for adding new segment
- Collaboration prompt banner (if solo user): "Invite your tutor to join!"

**Visual States:**
- Segment card: subtle elevation, rounded corners (16px)
- Active day indicator: customizable color (default green) with checkmark icon

### 2. Calendar Screen
**Purpose:** Detailed calendar view for specific segment

**Layout:**
- Header with segment name, back button (left), options menu (right)
- Calendar component fills main area
- Bottom sheet for day details (slides up on date tap)
- Top safe area: headerHeight + Spacing.xl
- Bottom safe area: tabBarHeight + Spacing.xl

**Components:**
- Monthly calendar grid with visual indicators:
  - Present: green circle with checkmark
  - Missed: red circle with X
  - Rescheduled: orange circle with swap icon
  - Makeup class: blue circle with plus
  - Scheduled (upcoming): outlined circle
  - Exam: star icon overlay
- Day detail bottom sheet:
  - Date header
  - Status badge
  - Reschedule reason (if applicable)
  - Action buttons: Mark Attended, Request Reschedule, Mark Missed
- Target day countdown banner (for parents approaching payment day)

**Interactions:**
- Tap date: slide up bottom sheet with celebration animation if marking attendance
- Long press: quick mark/unmark toggle
- Swipe between months with smooth transition

### 3. Reschedule Modal
**Purpose:** Bidirectional rescheduling flow

**Layout:**
- Modal overlay (centered on screen)
- Scrollable form if keyboard appears
- Top inset: insets.top + Spacing.xl
- Bottom inset: insets.bottom + Spacing.xl

**Components:**
- Modal header: "Reschedule Class"
- Current date display
- Reason text input (required)
- New date/time picker
- Notification preview: "Rahman will be notified"
- Action buttons: Cancel (outlined), Propose Time (filled)

**Form Validation:**
- Reason must be at least 10 characters
- New time must be different from original
- Show inline error messages below fields

### 4. History Screen
**Purpose:** View archived payment cycles

**Layout:**
- Header: "Session History", search icon (right)
- Scrollable list
- Top safe area: headerHeight + Spacing.xl
- Bottom safe area: tabBarHeight + Spacing.xl

**Components:**
- Timeline cards (grouped by month):
  - Month/Year header
  - Subject + tutor/student name
  - Stats summary: "12 classes • ৳5,000 paid"
  - Tap to expand: detailed mini calendar view
- Empty state: "No completed sessions yet"

### 5. Notification Center
**Purpose:** Quick actions from notifications

**Layout:**
- Native modal screen
- Header: "Notifications", close button (right)
- Scrollable list
- Top safe area: insets.top + Spacing.xl
- Bottom safe area: insets.bottom + Spacing.xl

**Components:**
- Notification cards grouped by date
- Each card shows:
  - Icon (color-coded by type)
  - Title + timestamp
  - Quick action button (e.g., "Mark Now", "Accept Reschedule")
- Swipe to dismiss

## Design System

### Color Palette
**Light Mode:**
- Primary: #4CAF50 (green for attendance success)
- Secondary: #2196F3 (blue for actions)
- Warning: #FF9800 (orange for reschedules)
- Error: #F44336 (red for missed)
- Background: #FFFFFF
- Surface: #F5F5F5
- Text Primary: #212121
- Text Secondary: #757575

**Dark Mode:**
- Primary: #66BB6A
- Secondary: #42A5F5
- Warning: #FFA726
- Error: #EF5350
- Background: #121212
- Surface: #1E1E1E
- Text Primary: #FFFFFF
- Text Secondary: #B0B0B0

**Semantic Colors (customizable by user):**
- Attendance marked: User-selected (default #4CAF50)
- Allow color picker in settings

### Typography
- Headings: Poppins Bold (or system equivalent)
- Body: Poppins Regular
- Captions: Poppins Medium
- Bengali support: Ensure font supports Bengali Unicode characters
- Sizes: H1 (24px), H2 (20px), H3 (18px), Body (16px), Caption (14px)

### Spacing
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- xxl: 32px

### Animation Guidelines
**Celebration Animation (attendance marked):**
- Confetti particles burst from tapped date
- Color matches user's attendance color
- Duration: 1.5s
- Haptic feedback: "success" pattern

**Transitions:**
- Screen transitions: 300ms ease-out
- Modal appearance: scale from 0.9 to 1.0, fade in (250ms)
- Bottom sheet: slide up 300ms with spring animation
- Tab switching: 200ms cross-fade

**Micro-interactions:**
- Button press: scale to 0.95, opacity 0.7
- Card tap: subtle elevation increase
- Toggle switches: smooth color transition (200ms)
- Loading states: skeleton shimmer animation

**Background Animation:**
- Subtle gradient shift on dashboard (slow, 10s loop)
- Particle effects on empty states (optional, can disable in settings)
- Keep animations minimal to avoid overwhelming users

### Visual Feedback
**Success States:**
- Color: green tint
- Icon: checkmark
- Sound: soft chime (optional, toggle in settings)
- Haptic: light impact

**Error States:**
- Color: red tint
- Icon: X or alert
- Shake animation (2 cycles)
- Haptic: notification feedback

**Progress Indicators:**
- Circular progress for payment countdown
- Linear progress for monthly session goals
- Use primary color with opacity for background track

### Icons
- Use Feather icons from @expo/vector-icons
- Calendar: calendar
- Mark: check-circle
- Missed: x-circle
- Reschedule: refresh-cw
- Payment: dollar-sign (or custom Taka symbol)
- Notification: bell
- Profile: user
- Add: plus-circle
- Settings: settings

### Component Specifications

**Segment Card:**
- Rounded corners: 16px
- Padding: Spacing.lg
- Shadow: subtle (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 4)
- Background: Surface color

**Calendar Day Cell:**
- Size: 40x40px
- Border radius: 20px (circular)
- Icons: 20x20px centered
- Tap target: minimum 44x44px (expand touch area)

**Action Buttons:**
- Primary: filled, rounded corners 12px, height 48px
- Secondary: outlined, same dimensions
- Floating action button: 56x56px circle, shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2)

**One-Tap Quick Action:**
- Large tap target (minimum 60x60px)
- Clear visual affordance (icon + label)
- Positioned strategically: notification quick actions, floating buttons, card swipe actions

### Accessibility
- All tap targets: minimum 44x44px
- Color contrast: WCAG AA compliant (4.5:1 for text)
- Screen reader support: label all interactive elements
- Haptic feedback for important actions
- Text scaling support (up to 200%)
- Offline indicator: persistent banner when no connection
- Language toggle accessible from Profile screen
- Dark mode respects system preference but user can override

### Offline Experience
- Visual indicator: small banner at top when offline
- Optimistic UI: show changes immediately, sync in background
- Sync status icon in header (rotating when syncing)
- Queue failed actions with retry mechanism
- Clear messaging when action requires connection

### Collaboration Prompts
- Banner style: soft background, dismissible
- Frequency: show once per week if not connected
- Placement: top of dashboard
- Copy: friendly, benefit-focused ("Invite [role] to sync calendars automatically!")
- CTA: "Invite" button with share sheet integration