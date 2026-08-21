export interface AuditActor {
  id: string | null;
  full_name: string | null;
  role: string | null;
  student_id: string | null;
}

export interface AuditClub {
  id: string | null;
  name: string | null;
  code: string | null;
}

export interface AuditLogRecord {
  id: string;
  actor_id: string | null;
  actor: AuditActor | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  target_profile_id: string | null;
  target: AuditActor | null;
  club_id: string | null;
  club: AuditClub | null;
  proposal_id: string | null;
  due_payment_id: string | null;
  leadership_application_id: string | null;
  announcement_id: string | null;
  remarks: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ListAuditLogsQuery {
  page?: number;
  page_size?: number;
  q?: string;
  actor_id?: string;
  action?: string;
  entity_type?: string;
  entity_id?: string;
  club_id?: string;
  date_from?: string;
  date_to?: string;
  sort?: "created_at";
  order?: "asc" | "desc";
  signal?: AbortSignal;
}
