/**
 * OneClub Student Workspaces Export Barrel
 * 
 * Clean, modular exports for all 12 student screens:
 * 1. Home - Activity summary, enrolled clubs, upcoming registered events, quick check-in
 * 2. Discover - Official 14 clubs directory with join application modals
 * 3. Events - Enrolled club event feed with RSVP going/interested/not going (no attendance roster)
 * 4. QrCheckIn - Camera scanner + manual event code entry (no personal student QR)
 * 5. MyClubs - Enrolled clubs + application requests (no leave-club, no exec tools)
 * 6. Dues - Per-club dues clearance, bank instructions, and proof upload/resubmission
 * 7. Announcements - Official university and club broadcasts with mark-read reader
 * 8. Notifications - Personal transaction & alert stream (no mark-all-read)
 * 9. Feedback - Single-form feedback with isolated receipt (no history module)
 * 10. More - Secondary destination hub with theme appearance and secure sign-out
 * 11. Profile - Read-only verified Campus One SSO student identity & co-curricular record
 * 12. Onboarding - Short skippable welcome with interest chips & official 14 club preview
 */

export { StudentHomeWorkspace } from "./home/StudentHomeWorkspace";
export { StudentDiscoverWorkspace } from "./discover/StudentDiscoverWorkspace";
export { StudentEventsWorkspace } from "./events/StudentEventsWorkspace";
export { StudentQrCheckInWorkspace } from "./checkin/StudentQrCheckInWorkspace";
export { StudentMyClubsWorkspace } from "./myclubs/StudentMyClubsWorkspace";
export { StudentDuesWorkspace } from "./dues/StudentDuesWorkspace";
export { StudentAnnouncementsWorkspace } from "./announcements/StudentAnnouncementsWorkspace";
export { StudentNotificationsWorkspace } from "./notifications/StudentNotificationsWorkspace";
export { StudentFeedbackWorkspace } from "./feedback/StudentFeedbackWorkspace";
export { StudentMoreWorkspace } from "./more/StudentMoreWorkspace";
export { StudentProfileWorkspace } from "./profile/StudentProfileWorkspace";
export { StudentOnboardingWorkspace } from "./onboarding/StudentOnboardingWorkspace";
