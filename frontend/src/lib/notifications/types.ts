export type AdminNotificationCategory =
  | "proposal"
  | "join_request"
  | "dues_proof"
  | "event"
  | "announcement"
  | "system";

export type NotificationRelatedRecordType =
  | "proposal"
  | "membership"
  | "payment"
  | "event"
  | "announcement"
  | "general";

export interface NotificationRecord {
  id: string;
  user_id: string | null;
  proposal_id: string | null;
  announcement_id: string | null;
  type: string;
  message: string;
  delivery_status: string | null;
  read_at: string | null;
  created_at: string | null;
}

export interface ListNotificationsQuery {
  page?: number;
  page_size?: number;
  sort?: "created_at";
  order?: "asc" | "desc";
  signal?: AbortSignal;
}

export interface AdminNotificationView {
  id: string;
  category: AdminNotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  relatedRecordType: NotificationRelatedRecordType;
  relatedRecordId?: string;
  destinationUrl: string | null;
  destinationLabel: string;
  source: string;
  type: string;
}

export type { AdminNotificationView as AdminNotificationRecord };
