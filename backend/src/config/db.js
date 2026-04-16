const { createClient } = require("@supabase/supabase-js");
const { getEnv } = require("./env");

const proposalSelect =
  "id, club_id, submitted_by, title, description, event_date, location, aim_objectives, proposed_activity, event_time, number_of_participants, budget_estimate, budget_line_items, responsible_members, status, submitted_at, resubmitted_at, revision_count, last_edited_at, last_edited_by, advisor_remarks, advisor_decided_at, advisor_decided_by, admin_remarks, admin_decided_at, admin_decided_by, created_at, updated_at";
const notificationSelect =
  "id, user_id, proposal_id, type, message, delivery_status, created_at";
const eventReminderSelect =
  "id, user_id, proposal_id, message, remind_at, delivery_status, created_at";
const clubSelect = "id, name, code, advisor_id, created_at";
const taskSelect =
  "id, club_id, assigned_by, assigned_to, title, description, priority, status, due_date, created_at, updated_at";
const taskStatusHistorySelect =
  "id, task_id, changed_by, old_status, new_status, remarks, created_at";
const clubMemberSelect =
  "id, club_id, profile_id, full_name, student_id, email, phone_number, club_role, membership_status, created_at, updated_at";
const duePaymentSelect =
  "id, club_id, member_id, amount, academic_session, payment_reference, payment_account_name, payment_paid_at, payer_note, proof_url, submitted_at, status, verified_by, verified_at, created_at, updated_at";
const clubPaymentSettingsSelect =
  "id, club_id, bank_name, account_number, account_name, payment_instructions, created_at, updated_at";
const eventReportSelect =
  "id, proposal_id, club_id, submitted_by, attendance_count, summary, challenges, outcomes, budget_used, media_urls, status, submitted_at, created_at, updated_at, proposals(id, title, proposed_activity, event_date, event_time, location, status)";
const announcementSelect =
  "id, club_id, created_by, title, message, audience, created_at, updated_at";
const feedbackSelect =
  "id, club_id, proposal_id, submitted_by, category, rating, comment, status, created_at, updated_at";
const eventRsvpSelect =
  "id, proposal_id, club_id, user_id, status, created_at, updated_at, profile:profiles!event_rsvps_user_id_fkey(id, full_name, student_id, role)";
const eventAttendanceSelect =
  "id, proposal_id, club_id, user_id, attended, checked_in_by, checked_in_at, created_at, updated_at, profile:profiles!event_attendance_user_id_fkey(id, full_name, student_id, role)";
const profileSelect =
  "id, full_name, role, club_id, student_id, requested_role, onboarding_status, created_at, updated_at";
const membershipRequestSelect =
  "id, profile_id, club_id, requested_role, status, remarks, decision_remarks, reviewed_by, reviewed_at, member_id, due_payment_id, dues_amount, academic_session, created_at, updated_at, profile:profiles!membership_requests_profile_id_fkey(id, full_name, student_id, role), club:clubs!membership_requests_club_id_fkey(id, name, code)";

function createAdminClient() {
  const env = getEnv();

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function createDatabase(options = {}) {
  const { clientFactory = createAdminClient } = options;
  let client;

  function getClient() {
    if (!client) {
      client = clientFactory();
    }

    return client;
  }

  return {
    async ping() {
      const { error } = await getClient()
        .from("profiles")
        .select("id", { head: true, count: "exact" });

      if (error) {
        throw error;
      }

      return { ok: true };
    },

    async getUserByAccessToken(accessToken) {
      const { data, error } = await getClient().auth.getUser(accessToken);

      if (error) {
        return null;
      }

      return data.user ?? null;
    },

    async getProfileById(profileId) {
      const { data, error } = await getClient()
        .from("profiles")
        .select(profileSelect)
        .eq("id", profileId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async createProposal(proposal) {
      const { data, error } = await getClient()
        .from("proposals")
        .insert(proposal)
        .select(proposalSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async listClubs(filters = {}) {
      let query = getClient()
        .from("clubs")
        .select(clubSelect)
        .order("name", { ascending: true });

      if (filters.ids?.length) {
        query = query.in("id", filters.ids);
      }

      if (filters.advisorId) {
        query = query.eq("advisor_id", filters.advisorId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },

    async getClubById(clubId) {
      const { data, error } = await getClient()
        .from("clubs")
        .select(clubSelect)
        .eq("id", clubId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async getProposalById(proposalId) {
      const { data, error } = await getClient()
        .from("proposals")
        .select(proposalSelect)
        .eq("id", proposalId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async createProfile(profile) {
      const { data, error } = await getClient()
        .from("profiles")
        .insert(profile)
        .select(profileSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async updateProfile(profileId, update) {
      const { data, error } = await getClient()
        .from("profiles")
        .update(update)
        .eq("id", profileId)
        .select(profileSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async updateProposal(proposalId, update) {
      const { data, error } = await getClient()
        .from("proposals")
        .update(update)
        .eq("id", proposalId)
        .select(proposalSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async listExecutiveProposals(submittedBy) {
      const { data, error } = await getClient()
        .from("proposals")
        .select(proposalSelect)
        .eq("submitted_by", submittedBy)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    },

    async listProposalsByClubId(clubId) {
      const { data, error } = await getClient()
        .from("proposals")
        .select(proposalSelect)
        .eq("club_id", clubId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    },

    async listAdminProposals(filters = {}) {
      let query = getClient()
        .from("proposals")
        .select(proposalSelect)
        .order("created_at", { ascending: false });

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },

    async listApprovedProposals(filters = {}) {
      let query = getClient()
        .from("proposals")
        .select(proposalSelect)
        .eq("status", "approved")
        .order("event_date", { ascending: true });

      if (filters.clubIds) {
        if (!filters.clubIds.length) {
          return [];
        }

        query = query.in("club_id", filters.clubIds);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },

    async getApprovedProposalById(proposalId) {
      const { data, error } = await getClient()
        .from("proposals")
        .select(proposalSelect)
        .eq("id", proposalId)
        .eq("status", "approved")
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async upsertEventRsvp(rsvp) {
      const { data, error } = await getClient()
        .from("event_rsvps")
        .upsert(rsvp, { onConflict: "proposal_id,user_id" })
        .select(eventRsvpSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async listEventRsvps(filters = {}) {
      let query = getClient()
        .from("event_rsvps")
        .select(eventRsvpSelect)
        .order("created_at", { ascending: false });

      if (filters.proposalId) {
        query = query.eq("proposal_id", filters.proposalId);
      }

      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },

    async upsertEventAttendance(attendance) {
      const { data, error } = await getClient()
        .from("event_attendance")
        .upsert(attendance, { onConflict: "proposal_id,user_id" })
        .select(eventAttendanceSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async listEventAttendance(filters = {}) {
      let query = getClient()
        .from("event_attendance")
        .select(eventAttendanceSelect)
        .order("checked_in_at", { ascending: false });

      if (filters.proposalId) {
        query = query.eq("proposal_id", filters.proposalId);
      }

      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },

    async getAdvisorClubIds(advisorId) {
      const { data, error } = await getClient()
        .from("clubs")
        .select("id")
        .eq("advisor_id", advisorId);

      if (error) {
        throw error;
      }

      return data.map((club) => club.id);
    },

    async getAdvisorProfileIdsByClubId(clubId) {
      const { data, error } = await getClient()
        .from("clubs")
        .select("advisor_id")
        .eq("id", clubId)
        .not("advisor_id", "is", null);

      if (error) {
        throw error;
      }

      return data.map((club) => club.advisor_id);
    },

    async getAdminProfileIds() {
      const { data, error } = await getClient()
        .from("profiles")
        .select("id")
        .eq("role", "admin");

      if (error) {
        throw error;
      }

      return data.map((profile) => profile.id);
    },

    async getPresidentProfileIdsByClubId(clubId) {
      const { data, error } = await getClient()
        .from("profiles")
        .select("id")
        .eq("role", "president")
        .eq("club_id", clubId);

      if (error) {
        throw error;
      }

      return data.map((profile) => profile.id);
    },

    async listProfilesByClubId(clubId, filters = {}) {
      let query = getClient()
        .from("profiles")
        .select("id, full_name, role, club_id, created_at")
        .eq("club_id", clubId)
        .order("full_name", { ascending: true });

      if (filters.role) {
        query = query.eq("role", filters.role);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },

    async listPendingProposalsByClubIds(clubIds) {
      if (!clubIds.length) {
        return [];
      }

      const { data, error } = await getClient()
        .from("proposals")
        .select(proposalSelect)
        .in("club_id", clubIds)
        .eq("status", "pending_advisor_review")
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    },

    async updateProposalAdvisorDecision(proposalId, proposalUpdate) {
      const { data, error } = await getClient()
        .from("proposals")
        .update(proposalUpdate)
        .eq("id", proposalId)
        .select(proposalSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async applyAdvisorDecision(decisionInput) {
      const { data, error } = await getClient().rpc("apply_advisor_decision", {
        p_proposal_id: decisionInput.proposalId,
        p_reviewer_id: decisionInput.reviewerId,
        p_reviewer_role: decisionInput.reviewerRole,
        p_decision: decisionInput.decision,
        p_remarks: decisionInput.remarks,
        p_decided_at: decisionInput.decidedAt,
        p_next_status: decisionInput.nextStatus
      });

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async applyAdminDecision(decisionInput) {
      const { data, error } = await getClient().rpc("apply_admin_decision", {
        p_proposal_id: decisionInput.proposalId,
        p_reviewer_id: decisionInput.reviewerId,
        p_reviewer_role: decisionInput.reviewerRole,
        p_decision: decisionInput.decision,
        p_remarks: decisionInput.remarks,
        p_decided_at: decisionInput.decidedAt,
        p_next_status: decisionInput.nextStatus
      });

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async getLatestApprovalByProposalId(proposalId) {
      const { data, error } = await getClient()
        .from("approvals")
        .select("proposal_id, reviewer_id, reviewer_role, decision, remarks, decided_at")
        .eq("proposal_id", proposalId)
        .order("decided_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async getLatestApprovalsByProposalIds(proposalIds) {
      if (!proposalIds.length) {
        return {};
      }

      const { data, error } = await getClient()
        .from("approvals")
        .select("proposal_id, reviewer_id, reviewer_role, decision, remarks, decided_at")
        .in("proposal_id", proposalIds)
        .order("decided_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data.reduce((latestByProposal, approval) => {
        if (!latestByProposal[approval.proposal_id]) {
          latestByProposal[approval.proposal_id] = approval;
        }

        return latestByProposal;
      }, {});
    },

    async createNotifications(notifications) {
      if (!notifications.length) {
        return [];
      }

      const { data, error } = await getClient()
        .from("notifications")
        .insert(notifications)
        .select(notificationSelect);

      if (error) {
        throw error;
      }

      return data;
    },

    async createEventReminders(reminders) {
      if (!reminders.length) {
        return [];
      }

      const { data, error } = await getClient()
        .from("event_reminders")
        .upsert(reminders, { onConflict: "user_id,proposal_id" })
        .select(eventReminderSelect);

      if (error) {
        throw error;
      }

      return data;
    },

    async listNotificationsByUserId(userId) {
      const { data, error } = await getClient()
        .from("notifications")
        .select(notificationSelect)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    },

    async listEventRemindersByUserId(userId) {
      const { data, error } = await getClient()
        .from("event_reminders")
        .select(eventReminderSelect)
        .eq("user_id", userId)
        .order("remind_at", { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    },

    async createTask(task) {
      const { data, error } = await getClient()
        .from("tasks")
        .insert(task)
        .select(taskSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async getTaskById(taskId) {
      const { data, error } = await getClient()
        .from("tasks")
        .select(taskSelect)
        .eq("id", taskId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async listTasks(filters = {}) {
      let query = getClient()
        .from("tasks")
        .select(taskSelect)
        .order("created_at", { ascending: false });

      if (filters.clubId) {
        query = query.eq("club_id", filters.clubId);
      }

      if (filters.assignedTo) {
        query = query.eq("assigned_to", filters.assignedTo);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },

    async updateTaskStatus(taskId, update) {
      const { data, error } = await getClient()
        .from("tasks")
        .update(update)
        .eq("id", taskId)
        .select(taskSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async createTaskStatusHistory(entry) {
      const { data, error } = await getClient()
        .from("task_status_history")
        .insert(entry)
        .select(taskStatusHistorySelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async listTaskStatusHistory(taskId) {
      const { data, error } = await getClient()
        .from("task_status_history")
        .select(taskStatusHistorySelect)
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    },

    async createClubMember(member) {
      const { data, error } = await getClient()
        .from("club_members")
        .insert(member)
        .select(clubMemberSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async getClubMemberById(memberId) {
      const { data, error } = await getClient()
        .from("club_members")
        .select(clubMemberSelect)
        .eq("id", memberId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async listClubMembers(filters = {}) {
      let query = getClient()
        .from("club_members")
        .select(clubMemberSelect)
        .order("full_name", { ascending: true });

      if (filters.clubId) {
        query = query.eq("club_id", filters.clubId);
      }

      if (filters.clubRoles?.length) {
        query = query.in("club_role", filters.clubRoles);
      }

      if (filters.membershipStatus) {
        query = query.eq("membership_status", filters.membershipStatus);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },

    async getClubMemberByProfileAndClub(profileId, clubId) {
      const { data, error } = await getClient()
        .from("club_members")
        .select(clubMemberSelect)
        .eq("profile_id", profileId)
        .eq("club_id", clubId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async getClubPaymentSettings(clubId) {
      const { data, error } = await getClient()
        .from("club_payment_settings")
        .select(clubPaymentSettingsSelect)
        .eq("club_id", clubId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async upsertClubPaymentSettings(settings) {
      const { data, error } = await getClient()
        .from("club_payment_settings")
        .upsert(settings, { onConflict: "club_id" })
        .select(clubPaymentSettingsSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async updateClubMember(memberId, update) {
      const { data, error } = await getClient()
        .from("club_members")
        .update(update)
        .eq("id", memberId)
        .select(clubMemberSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async createDuePayment(payment) {
      const { data, error } = await getClient()
        .from("due_payments")
        .insert(payment)
        .select(duePaymentSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async getDuePaymentById(paymentId) {
      const { data, error } = await getClient()
        .from("due_payments")
        .select(duePaymentSelect)
        .eq("id", paymentId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async listDuePayments(filters = {}) {
      let query = getClient()
        .from("due_payments")
        .select(duePaymentSelect)
        .order("created_at", { ascending: false });

      if (filters.clubId) {
        query = query.eq("club_id", filters.clubId);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.memberId) {
        query = query.eq("member_id", filters.memberId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },

    async updateDuePayment(paymentId, update) {
      const { data, error } = await getClient()
        .from("due_payments")
        .update(update)
        .eq("id", paymentId)
        .select(duePaymentSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async listDuePaymentsForProfile(profileId) {
      const { data: members, error: membersError } = await getClient()
        .from("club_members")
        .select("id")
        .eq("profile_id", profileId);

      if (membersError) {
        throw membersError;
      }

      const memberIds = members.map((member) => member.id);

      if (!memberIds.length) {
        return [];
      }

      const { data, error } = await getClient()
        .from("due_payments")
        .select(duePaymentSelect)
        .in("member_id", memberIds)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    },

    async createMembershipRequest(request) {
      const { data, error } = await getClient()
        .from("membership_requests")
        .insert(request)
        .select(membershipRequestSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async getMembershipRequestById(requestId) {
      const { data, error } = await getClient()
        .from("membership_requests")
        .select(membershipRequestSelect)
        .eq("id", requestId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async getOpenMembershipRequest(profileId, clubId) {
      const { data, error } = await getClient()
        .from("membership_requests")
        .select(membershipRequestSelect)
        .eq("profile_id", profileId)
        .eq("club_id", clubId)
        .in("status", ["pending", "approved_pending_dues", "active"])
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async getMembershipRequestByMemberId(memberId) {
      const { data, error } = await getClient()
        .from("membership_requests")
        .select(membershipRequestSelect)
        .eq("member_id", memberId)
        .eq("status", "approved_pending_dues")
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async listMembershipRequests(filters = {}) {
      let query = getClient()
        .from("membership_requests")
        .select(membershipRequestSelect)
        .order("created_at", { ascending: false });

      if (filters.profileId) {
        query = query.eq("profile_id", filters.profileId);
      }

      if (filters.clubId) {
        query = query.eq("club_id", filters.clubId);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },

    async updateMembershipRequest(requestId, update) {
      const { data, error } = await getClient()
        .from("membership_requests")
        .update(update)
        .eq("id", requestId)
        .select(membershipRequestSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async createEventReport(report) {
      const { data, error } = await getClient()
        .from("event_reports")
        .insert(report)
        .select(eventReportSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async getEventReportById(reportId) {
      const { data, error } = await getClient()
        .from("event_reports")
        .select(eventReportSelect)
        .eq("id", reportId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async getEventReportByProposalId(proposalId) {
      const { data, error } = await getClient()
        .from("event_reports")
        .select(eventReportSelect)
        .eq("proposal_id", proposalId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async listEventReports(filters = {}) {
      let query = getClient()
        .from("event_reports")
        .select(eventReportSelect)
        .order("submitted_at", { ascending: false });

      if (filters.clubId) {
        query = query.eq("club_id", filters.clubId);
      }

      if (filters.clubIds) {
        if (!filters.clubIds.length) {
          return [];
        }

        query = query.in("club_id", filters.clubIds);
      }

      if (filters.proposalId) {
        query = query.eq("proposal_id", filters.proposalId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },

    async createAnnouncement(announcement) {
      const { data, error } = await getClient()
        .from("announcements")
        .insert(announcement)
        .select(announcementSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async listAnnouncements(filters = {}) {
      let query = getClient()
        .from("announcements")
        .select(announcementSelect)
        .order("created_at", { ascending: false });

      if (filters.audience) {
        query = query.eq("audience", filters.audience);
      }

      if (filters.clubId) {
        query = query.or(`audience.eq.all,club_id.eq.${filters.clubId}`);
      }

      if (filters.clubIds) {
        if (!filters.clubIds.length) {
          query = query.eq("audience", "all");
        } else {
          query = query.or(`audience.eq.all,club_id.in.(${filters.clubIds.join(",")})`);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },

    async createFeedback(feedback) {
      const { data, error } = await getClient()
        .from("event_feedback")
        .insert(feedback)
        .select(feedbackSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async listFeedback(filters = {}) {
      let query = getClient()
        .from("event_feedback")
        .select(feedbackSelect)
        .order("created_at", { ascending: false });

      if (filters.clubId) {
        query = query.eq("club_id", filters.clubId);
      }

      if (filters.clubIds) {
        if (!filters.clubIds.length) {
          return [];
        }

        query = query.in("club_id", filters.clubIds);
      }

      if (filters.proposalId) {
        query = query.eq("proposal_id", filters.proposalId);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    }
  };
}

const db = createDatabase();

module.exports = {
  createAdminClient,
  createDatabase,
  db
};
