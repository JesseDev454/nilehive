const { createClient } = require("@supabase/supabase-js");
const { getEnv } = require("./env");

const proposalSelect =
  "id, club_id, submitted_by, title, description, event_date, location, aim_objectives, proposed_activity, event_time, number_of_participants, budget_estimate, budget_line_items, responsible_members, status, submitted_at, resubmitted_at, revision_count, last_edited_at, last_edited_by, advisor_remarks, advisor_decided_at, advisor_decided_by, admin_remarks, admin_decided_at, admin_decided_by, created_at, updated_at";
const notificationSelect =
  "id, user_id, proposal_id, announcement_id, type, message, delivery_status, created_at";
const eventReminderSelect =
  "id, user_id, proposal_id, message, remind_at, delivery_status, created_at";
const clubSelect = "id, name, code, advisor_id, created_at";
const publicClubSelect = "id, name, code, created_at";
const taskSelect =
  "id, club_id, assigned_by, assigned_to, title, description, priority, status, due_date, created_at, updated_at, assigned_by_profile:profiles!tasks_assigned_by_fkey(id, full_name, student_id, role), assigned_to_profile:profiles!tasks_assigned_to_fkey(id, full_name, student_id, role)";
const taskStatusHistorySelect =
  "id, task_id, changed_by, old_status, new_status, remarks, created_at";
const clubMemberSelect =
  "id, club_id, profile_id, full_name, student_id, email, phone_number, club_role, membership_status, created_at, updated_at, club:clubs!club_members_club_id_fkey(id, name, code)";
const clubMemberStatusHistorySelect =
  "id, member_id, club_id, profile_id, previous_status, new_status, changed_by, reason, created_at";
const duePaymentSelect =
  "id, club_id, member_id, amount, academic_session, payment_reference, payment_account_name, payment_paid_at, payer_note, proof_url, submitted_at, status, verified_by, verified_at, created_at, updated_at";
const clubPaymentSettingsSelect =
  "id, club_id, bank_name, account_number, account_name, payment_instructions, created_at, updated_at";
const eventReportSelect =
  "id, proposal_id, club_id, submitted_by, attendance_count, summary, challenges, outcomes, budget_used, media_urls, status, submitted_at, created_at, updated_at, proposals(id, title, proposed_activity, event_date, event_time, location, status)";
const announcementSelect =
  "id, club_id, created_by, title, message, audience, priority, target_role, created_at, updated_at";
const feedbackSelect =
  "id, club_id, proposal_id, submitted_by, category, rating, comment, status, created_at, updated_at";
const eventRsvpSelect =
  "id, proposal_id, club_id, user_id, status, created_at, updated_at, profile:profiles!event_rsvps_user_id_fkey(id, full_name, student_id, role)";
const eventAttendanceSelect =
  "id, proposal_id, club_id, user_id, attended, checked_in_by, checked_in_at, created_at, updated_at, profile:profiles!event_attendance_user_id_fkey(id, full_name, student_id, role)";
const profileSelect =
  "id, full_name, role, club_id, student_id, requested_role, onboarding_status, created_at, updated_at";
const profileWithClubSelect =
  "id, full_name, role, club_id, student_id, requested_role, onboarding_status, created_at, updated_at, club:clubs!profiles_club_id_fkey(id, name, code)";
const membershipRequestSelect =
  "id, profile_id, club_id, requested_role, status, remarks, decision_remarks, reviewed_by, reviewed_at, member_id, due_payment_id, dues_amount, academic_session, created_at, updated_at, profile:profiles!membership_requests_profile_id_fkey(id, full_name, student_id, role), club:clubs!membership_requests_club_id_fkey(id, name, code)";
const leadershipApplicationSelect =
  "id, profile_id, club_id, current_app_role, requested_role, status, reason, experience, goals, availability, reviewed_by, reviewed_at, decision_remarks, created_at, updated_at, profile:profiles!leadership_applications_profile_id_fkey(id, full_name, student_id, role), club:clubs!leadership_applications_club_id_fkey(id, name, code)";
const profileRoleHistorySelect =
  "id, profile_id, previous_role, new_role, previous_club_id, new_club_id, changed_by, remarks, created_at";
const emailDeliverySelect =
  "id, provider, recipient_user_id, recipient_email, subject, status, announcement_id, notification_id, proposal_id, error_message, sent_at, created_at, updated_at";

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

      let { data, error } = await query;

      if (error) {
        let fallbackQuery = getClient()
          .from("clubs")
          .select("id, name, advisor_id")
          .order("name", { ascending: true });

        if (filters.ids?.length) {
          fallbackQuery = fallbackQuery.in("id", filters.ids);
        }

        if (filters.advisorId) {
          fallbackQuery = fallbackQuery.eq("advisor_id", filters.advisorId);
        }

        const fallback = await fallbackQuery;
        data = fallback.data;
        error = fallback.error;
      }

      if (error && !filters.advisorId) {
        let minimalQuery = getClient()
          .from("clubs")
          .select("id, name")
          .order("name", { ascending: true });

        if (filters.ids?.length) {
          minimalQuery = minimalQuery.in("id", filters.ids);
        }

        const minimal = await minimalQuery;
        data = minimal.data;
        error = minimal.error;
      }

      if (error) {
        throw error;
      }

      return (data ?? []).map((club) => ({
        id: club.id,
        name: club.name,
        code: club.code ?? null,
        advisor_id: club.advisor_id ?? null,
        created_at: club.created_at ?? null
      }));
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

    async updateClubAdvisor(clubId, advisorId) {
      const { data, error } = await getClient()
        .from("clubs")
        .update({ advisor_id: advisorId })
        .eq("id", clubId)
        .select(clubSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async listPublicClubs() {
      let query = getClient()
        .from("clubs")
        .select(publicClubSelect)
        .order("name", { ascending: true });

      let { data, error } = await query;

      if (error) {
        const fallback = await getClient()
          .from("clubs")
          .select("id, name")
          .order("name", { ascending: true });

        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        throw error;
      }

      return (data ?? []).map((club) => ({
        id: club.id,
        name: club.name,
        code: club.code ?? null,
        advisor_id: null,
        created_at: club.created_at ?? null
      }));
    },

    async clearClubAdvisorAssignments(advisorId) {
      const { data, error } = await getClient()
        .from("clubs")
        .update({ advisor_id: null })
        .eq("advisor_id", advisorId)
        .select(clubSelect);

      if (error) {
        throw error;
      }

      return data;
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

    async listProfiles(filters = {}) {
      let query = getClient()
        .from("profiles")
        .select(profileWithClubSelect)
        .order("created_at", { ascending: false });

      if (filters.role) {
        query = query.eq("role", filters.role);
      }

      if (filters.roles?.length) {
        query = query.in("role", filters.roles);
      }

      if (filters.clubId) {
        query = query.eq("club_id", filters.clubId);
      }

      if (filters.requestedRole) {
        query = query.eq("requested_role", filters.requestedRole);
      }

      if (filters.q) {
        const search = filters.q.replace(/[%(),]/g, "").trim();

        if (search) {
          query = query.or(`full_name.ilike.%${search}%,student_id.ilike.%${search}%`);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data ?? [];
    },

    async createProfileRoleHistory(entry) {
      const { data, error } = await getClient()
        .from("profile_role_history")
        .insert(entry)
        .select(profileRoleHistorySelect)
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

      if (filters.clubId) {
        query = query.eq("club_id", filters.clubId);
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

      if (filters.clubId) {
        query = query.eq("club_id", filters.clubId);
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

    async getApprovalsByProposalId(proposalId) {
      const { data, error } = await getClient()
        .from("approvals")
        .select("proposal_id, reviewer_id, reviewer_role, decision, remarks, decided_at")
        .eq("proposal_id", proposalId)
        .order("decided_at", { ascending: true });

      if (error) {
        throw error;
      }

      return data ?? [];
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

    async getAuthEmailsByProfileIds(profileIds) {
      if (!profileIds.length) {
        return {};
      }

      const entries = await Promise.all(
        profileIds.map(async (profileId) => {
          const { data, error } = await getClient().auth.admin.getUserById(profileId);

          if (error || !data?.user) {
            return [profileId, null];
          }

          return [profileId, data.user.email ?? null];
        })
      );

      return Object.fromEntries(entries);
    },

    async createEmailDeliveryLog(log) {
      const { data, error } = await getClient()
        .from("email_deliveries")
        .insert(log)
        .select(emailDeliverySelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async updateEmailDeliveryLog(logId, update) {
      const { data, error } = await getClient()
        .from("email_deliveries")
        .update(update)
        .eq("id", logId)
        .select(emailDeliverySelect)
        .single();

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

    async createClubMemberStatusHistory(entry) {
      const { data, error } = await getClient()
        .from("club_member_status_history")
        .insert(entry)
        .select(clubMemberStatusHistorySelect)
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

    async createLeadershipApplication(application) {
      const { data, error } = await getClient()
        .from("leadership_applications")
        .insert(application)
        .select(leadershipApplicationSelect)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async getLeadershipApplicationById(applicationId) {
      const { data, error } = await getClient()
        .from("leadership_applications")
        .select(leadershipApplicationSelect)
        .eq("id", applicationId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async getOpenLeadershipApplication(profileId, clubId) {
      const { data, error } = await getClient()
        .from("leadership_applications")
        .select(leadershipApplicationSelect)
        .eq("profile_id", profileId)
        .eq("club_id", clubId)
        .in("status", ["pending", "needs_more_info"])
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async getLatestRejectedLeadershipApplication(profileId, clubId) {
      const { data, error } = await getClient()
        .from("leadership_applications")
        .select(leadershipApplicationSelect)
        .eq("profile_id", profileId)
        .eq("club_id", clubId)
        .eq("status", "rejected")
        .order("reviewed_at", { ascending: false, nullsFirst: false })
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async listLeadershipApplications(filters = {}) {
      let query = getClient()
        .from("leadership_applications")
        .select(leadershipApplicationSelect)
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

      if (filters.requestedRole) {
        query = query.eq("requested_role", filters.requestedRole);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data ?? [];
    },

    async updateLeadershipApplication(applicationId, update) {
      const { data, error } = await getClient()
        .from("leadership_applications")
        .update(update)
        .eq("id", applicationId)
        .select(leadershipApplicationSelect)
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
        query = query.eq("club_id", filters.clubId);
      }

      if (filters.clubIds) {
        if (!filters.clubIds.length) {
          return [];
        } else {
          query = query.in("club_id", filters.clubIds);
        }
      }

      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }

      if (filters.targetRole) {
        query = query.eq("target_role", filters.targetRole);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },

    async listAnnouncementReadsByUserId(userId) {
      const { data, error } = await getClient()
        .from("announcement_reads")
        .select("announcement_id, user_id, read_at")
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      return data ?? [];
    },

    async markAnnouncementRead(announcementId, userId) {
      const { data, error } = await getClient()
        .from("announcement_reads")
        .upsert({
          announcement_id: announcementId,
          user_id: userId,
          read_at: new Date().toISOString()
        }, {
          onConflict: "announcement_id,user_id"
        })
        .select("announcement_id, user_id, read_at")
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    async markAnnouncementsRead(announcementIds, userId) {
      if (!announcementIds.length) {
        return [];
      }

      const now = new Date().toISOString();
      const { data, error } = await getClient()
        .from("announcement_reads")
        .upsert(
          announcementIds.map((announcementId) => ({
            announcement_id: announcementId,
            user_id: userId,
            read_at: now
          })),
          { onConflict: "announcement_id,user_id" }
        )
        .select("announcement_id, user_id, read_at");

      if (error) {
        throw error;
      }

      return data ?? [];
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

      if (filters.submittedBy) {
        query = query.eq("submitted_by", filters.submittedBy);
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
