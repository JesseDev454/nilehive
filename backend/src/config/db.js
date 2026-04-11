const { createClient } = require("@supabase/supabase-js");
const { getEnv } = require("./env");

const proposalSelect =
  "id, club_id, submitted_by, title, description, event_date, location, aim_objectives, proposed_activity, event_time, number_of_participants, budget_estimate, budget_line_items, responsible_members, status, advisor_remarks, advisor_decided_at, advisor_decided_by, admin_remarks, admin_decided_at, admin_decided_by, created_at, updated_at";
const notificationSelect =
  "id, user_id, proposal_id, type, message, delivery_status, created_at";
const eventReminderSelect =
  "id, user_id, proposal_id, message, remind_at, delivery_status, created_at";
const clubSelect = "id, name, code, advisor_id, created_at";
const taskSelect =
  "id, club_id, assigned_by, assigned_to, title, description, priority, status, due_date, created_at, updated_at";
const taskStatusHistorySelect =
  "id, task_id, changed_by, old_status, new_status, remarks, created_at";

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
        .select("id, full_name, role, club_id")
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
    }
  };
}

const db = createDatabase();

module.exports = {
  createAdminClient,
  createDatabase,
  db
};
