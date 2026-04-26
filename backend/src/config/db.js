const { createClient } = require("@supabase/supabase-js");
const { getEnv } = require("./env");
const { buildPaginatedResult } = require("../shared/pagination");

const PUBLIC_CLUB_CACHE_TTL_MS = 5 * 60 * 1000;

const proposalSelect =
  "id, club_id, submitted_by, title, description, event_date, location, aim_objectives, proposed_activity, event_time, number_of_participants, budget_estimate, budget_line_items, responsible_members, status, submitted_at, resubmitted_at, revision_count, last_edited_at, last_edited_by, advisor_remarks, advisor_decided_at, advisor_decided_by, admin_remarks, admin_decided_at, admin_decided_by, created_at, updated_at";
const notificationSelect =
  "id, user_id, proposal_id, announcement_id, type, message, delivery_status, created_at";
const eventReminderSelect =
  "id, user_id, proposal_id, message, remind_at, delivery_status, created_at";
const clubSelect = "id, name, code, advisor_id, created_at";
const clubAdvisorAssignmentSelect =
  "id, club_id, advisor_profile_id, assigned_by, remarks, created_at, club:clubs!club_advisors_club_id_fkey(id, name, code), advisor:profiles!club_advisors_advisor_profile_id_fkey(id, full_name, role, club_id, student_id)";
const publicClubSelect = "id, name, code, created_at, is_public_signup";
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
  "id, full_name, role, club_id, student_id, requested_role, onboarding_status, account_status, created_at, updated_at";
const legacyProfileSelect =
  "id, full_name, role, club_id, student_id, requested_role, onboarding_status, created_at, updated_at";
const profileWithClubSelect =
  "id, full_name, role, club_id, student_id, requested_role, onboarding_status, account_status, created_at, updated_at, club:clubs!profiles_club_id_fkey(id, name, code)";
const legacyProfileWithClubSelect =
  "id, full_name, role, club_id, student_id, requested_role, onboarding_status, created_at, updated_at, club:clubs!profiles_club_id_fkey(id, name, code)";
const membershipRequestSelect =
  "id, profile_id, club_id, requested_role, status, remarks, decision_remarks, reviewed_by, reviewed_at, member_id, due_payment_id, dues_amount, academic_session, created_at, updated_at, profile:profiles!membership_requests_profile_id_fkey(id, full_name, student_id, role), club:clubs!membership_requests_club_id_fkey(id, name, code)";
const leadershipApplicationSelect =
  "id, profile_id, club_id, current_app_role, requested_role, status, reason, experience, goals, availability, reviewed_by, reviewed_at, decision_remarks, created_at, updated_at, profile:profiles!leadership_applications_profile_id_fkey(id, full_name, student_id, role), club:clubs!leadership_applications_club_id_fkey(id, name, code)";
const profileRoleHistorySelect =
  "id, profile_id, previous_role, new_role, previous_club_id, new_club_id, changed_by, remarks, created_at";
const auditLogSelect =
  "id, actor_id, entity_type, action, target_profile_id, club_id, proposal_id, due_payment_id, leadership_application_id, announcement_id, remarks, metadata, created_at";
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
  let publicClubsCache = {
    expiresAt: 0,
    items: null
  };

  function getClient() {
    if (!client) {
      client = clientFactory();
    }

    return client;
  }

  function isMissingColumn(error, columnName) {
    return error?.code === "42703" && error?.message?.includes(columnName);
  }

  function isMissingRelation(error, relationName) {
    return error?.code === "42P01" && error?.message?.includes(relationName);
  }

  function normalizeProfile(profile) {
    if (!profile) {
      return null;
    }

    return {
      ...profile,
      account_status: profile.account_status ?? "active"
    };
  }

  function applyPagination(query, pagination) {
    if (!pagination) {
      return query;
    }

    return query.range(pagination.from, pagination.to);
  }

  function formatQueryResult({ data, count, pagination, normalizeItems = null }) {
    const items = normalizeItems ? (data ?? []).map(normalizeItems) : data ?? [];

    if (!pagination) {
      return items;
    }

    return buildPaginatedResult({
      items,
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: count ?? 0
    });
  }

  function normalizeClub(club) {
    return {
      id: club.id,
      name: club.name,
      code: club.code ?? null,
      advisor_id: club.advisor_id ?? null,
      created_at: club.created_at ?? null
    };
  }

  function normalizeAdvisorAssignment(assignment) {
    if (!assignment) {
      return null;
    }

    return {
      id: assignment.id,
      club_id: assignment.club_id,
      advisor_profile_id: assignment.advisor_profile_id,
      assigned_by: assignment.assigned_by ?? null,
      remarks: assignment.remarks ?? null,
      created_at: assignment.created_at ?? null,
      club: assignment.club
        ? {
            id: assignment.club.id,
            name: assignment.club.name,
            code: assignment.club.code ?? null
          }
        : null,
      advisor: assignment.advisor
        ? {
            id: assignment.advisor.id,
            full_name: assignment.advisor.full_name ?? null,
            role: assignment.advisor.role,
            club_id: assignment.advisor.club_id ?? null,
            student_id: assignment.advisor.student_id ?? null
          }
        : null
    };
  }

  function getCachedPublicClubs() {
    if (publicClubsCache.items && publicClubsCache.expiresAt > Date.now()) {
      return publicClubsCache.items;
    }

    return null;
  }

  function setCachedPublicClubs(clubs) {
    publicClubsCache = {
      items: clubs,
      expiresAt: Date.now() + PUBLIC_CLUB_CACHE_TTL_MS
    };
  }

  async function selectProfileById(profileId, selectClause) {
    return getClient()
      .from("profiles")
      .select(selectClause)
      .eq("id", profileId)
      .maybeSingle();
  }

  async function listAdvisorAssignments(filters = {}) {
    let query = getClient()
      .from("club_advisors")
      .select(clubAdvisorAssignmentSelect)
      .order("created_at", { ascending: true });

    if (filters.clubId) {
      query = query.eq("club_id", filters.clubId);
    }

    if (filters.clubIds?.length) {
      query = query.in("club_id", filters.clubIds);
    }

    if (filters.advisorProfileId) {
      query = query.eq("advisor_profile_id", filters.advisorProfileId);
    }

    if (filters.advisorProfileIds?.length) {
      query = query.in("advisor_profile_id", filters.advisorProfileIds);
    }

    const { data, error } = await query;

    if (error && isMissingRelation(error, "club_advisors")) {
      return null;
    }

    if (error) {
      throw error;
    }

    return (data ?? []).map(normalizeAdvisorAssignment);
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
      let { data, error } = await selectProfileById(profileId, profileSelect);

      if (error && isMissingColumn(error, "account_status")) {
        const fallback = await selectProfileById(profileId, legacyProfileSelect);
        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        throw error;
      }

      return normalizeProfile(data);
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
      if (filters.advisorId) {
        const advisorAssignments = await listAdvisorAssignments({
          advisorProfileId: filters.advisorId
        });

        if (advisorAssignments) {
          const clubs = advisorAssignments
            .map((assignment) => assignment.club)
            .filter(Boolean)
            .map(normalizeClub);

          return filters.ids?.length
            ? clubs.filter((club) => filters.ids.includes(club.id))
            : clubs;
        }
      }

      let query = getClient()
        .from("clubs")
        .select(clubSelect)
        .order("name", { ascending: true });

      if (filters.ids?.length) {
        query = query.in("id", filters.ids);
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

      return (data ?? []).map(normalizeClub);
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

    async createClubAdvisorAssignment(assignment) {
      const { data, error } = await getClient()
        .from("club_advisors")
        .insert(assignment)
        .select(clubAdvisorAssignmentSelect)
        .single();

      if (error && isMissingRelation(error, "club_advisors")) {
        const fallback = await getClient()
          .from("clubs")
          .update({ advisor_id: assignment.advisor_profile_id })
          .eq("id", assignment.club_id)
          .select(clubSelect)
          .single();

        if (fallback.error) {
          throw fallback.error;
        }

        return normalizeAdvisorAssignment({
          id: fallback.data.id,
          club_id: fallback.data.id,
          advisor_profile_id: assignment.advisor_profile_id,
          assigned_by: assignment.assigned_by ?? null,
          remarks: assignment.remarks ?? null,
          created_at: fallback.data.created_at ?? null,
          club: fallback.data,
          advisor: null
        });
      }

      if (error) {
        throw error;
      }

      return normalizeAdvisorAssignment(data);
    },

    async listClubAdvisorAssignments(filters = {}) {
      const assignments = await listAdvisorAssignments({
        clubId: filters.clubId,
        clubIds: filters.clubIds,
        advisorProfileId: filters.advisorProfileId,
        advisorProfileIds: filters.advisorProfileIds
      });

      if (assignments) {
        return assignments;
      }

      if (filters.clubIds?.length || filters.advisorProfileIds?.length) {
        return [];
      }

      if (filters.clubId) {
        const club = await getClient()
          .from("clubs")
          .select(clubSelect)
          .eq("id", filters.clubId)
          .maybeSingle();

        if (club.error) {
          throw club.error;
        }

        return club.data?.advisor_id
          ? [
              normalizeAdvisorAssignment({
                id: club.data.id,
                club_id: club.data.id,
                advisor_profile_id: club.data.advisor_id,
                assigned_by: null,
                remarks: null,
                created_at: club.data.created_at ?? null,
                club: club.data,
                advisor: null
              })
            ]
          : [];
      }

      if (filters.advisorProfileId) {
        const clubs = await getClient()
          .from("clubs")
          .select(clubSelect)
          .eq("advisor_id", filters.advisorProfileId);

        if (clubs.error) {
          throw clubs.error;
        }

        return (clubs.data ?? []).map((club) =>
          normalizeAdvisorAssignment({
            id: club.id,
            club_id: club.id,
            advisor_profile_id: club.advisor_id,
            assigned_by: null,
            remarks: null,
            created_at: club.created_at ?? null,
            club,
            advisor: null
          })
        );
      }

      return [];
    },

    async listPublicClubs() {
      const cachedClubs = getCachedPublicClubs();

      if (cachedClubs) {
        return cachedClubs;
      }

      let query = getClient()
        .from("clubs")
        .select(publicClubSelect)
        .eq("is_public_signup", true)
        .order("name", { ascending: true });

      let { data, error } = await query;

      if (error && isMissingColumn(error, "is_public_signup")) {
        const fallback = await getClient()
          .from("clubs")
          .select("id, name, code, created_at")
          .order("name", { ascending: true });

        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        throw error;
      }

      let clubs = (data ?? []).map(normalizeClub);

      if (!clubs.length) {
        const fallback = await getClient()
          .from("clubs")
          .select("id, name, code, created_at")
          .order("name", { ascending: true });

        if (fallback.error) {
          throw fallback.error;
        }

        clubs = (fallback.data ?? []).map(normalizeClub);
      }

      setCachedPublicClubs(clubs);

      return clubs;
    },

    async clearClubAdvisorAssignments(advisorId) {
      const { data, error } = await getClient()
        .from("club_advisors")
        .delete()
        .eq("advisor_profile_id", advisorId)
        .select(clubAdvisorAssignmentSelect);

      if (error && isMissingRelation(error, "club_advisors")) {
        const fallback = await getClient()
          .from("clubs")
          .update({ advisor_id: null })
          .eq("advisor_id", advisorId)
          .select(clubSelect);

        if (fallback.error) {
          throw fallback.error;
        }

        return fallback.data;
      }

      if (error) {
        throw error;
      }

      return (data ?? []).map(normalizeAdvisorAssignment);
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
      let { data, error } = await getClient()
        .from("profiles")
        .insert(profile)
        .select(profileSelect)
        .single();

      if (error && isMissingColumn(error, "account_status")) {
        const { account_status, ...legacyProfile } = profile;
        const fallback = await getClient()
          .from("profiles")
          .insert(legacyProfile)
          .select(legacyProfileSelect)
          .single();
        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        throw error;
      }

      return normalizeProfile(data);
    },

    async updateProfile(profileId, update) {
      let { data, error } = await getClient()
        .from("profiles")
        .update(update)
        .eq("id", profileId)
        .select(profileSelect)
        .single();

      if (error && isMissingColumn(error, "account_status")) {
        const { account_status, ...legacyUpdate } = update;
        const fallback = await getClient()
          .from("profiles")
          .update(legacyUpdate)
          .eq("id", profileId)
          .select(legacyProfileSelect)
          .single();
        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        throw error;
      }

      return normalizeProfile(data);
    },

    async listProfiles(filters = {}) {
      let query = getClient()
        .from("profiles")
        .select(profileWithClubSelect, filters.pagination ? { count: "exact" } : undefined)
        .order(filters.sort || "created_at", { ascending: (filters.order || "desc") === "asc" });

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

      query = applyPagination(query, filters.pagination);

      let { data, error, count } = await query;

      if (error && isMissingColumn(error, "account_status")) {
        let fallbackQuery = getClient()
          .from("profiles")
          .select(legacyProfileWithClubSelect, filters.pagination ? { count: "exact" } : undefined)
          .order(filters.sort || "created_at", { ascending: (filters.order || "desc") === "asc" });

        if (filters.role) {
          fallbackQuery = fallbackQuery.eq("role", filters.role);
        }

        if (filters.roles?.length) {
          fallbackQuery = fallbackQuery.in("role", filters.roles);
        }

        if (filters.clubId) {
          fallbackQuery = fallbackQuery.eq("club_id", filters.clubId);
        }

        if (filters.requestedRole) {
          fallbackQuery = fallbackQuery.eq("requested_role", filters.requestedRole);
        }

        if (filters.q) {
          const search = filters.q.replace(/[%(),]/g, "").trim();

          if (search) {
            fallbackQuery = fallbackQuery.or(`full_name.ilike.%${search}%,student_id.ilike.%${search}%`);
          }
        }

        fallbackQuery = applyPagination(fallbackQuery, filters.pagination);

        const fallback = await fallbackQuery;
        data = fallback.data;
        error = fallback.error;
        count = fallback.count;
      }

      if (error) {
        throw error;
      }

      return formatQueryResult({
        data,
        count,
        pagination: filters.pagination,
        normalizeItems: normalizeProfile
      });
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

    async listExecutiveProposals(submittedBy, filters = {}) {
      let query = getClient()
        .from("proposals")
        .select(proposalSelect, filters.pagination ? { count: "exact" } : undefined)
        .eq("submitted_by", submittedBy)
        .order(filters.sort || "created_at", { ascending: (filters.order || "desc") === "asc" });

      query = applyPagination(query, filters.pagination);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return formatQueryResult({ data, count, pagination: filters.pagination });
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
        .select(proposalSelect, filters.pagination ? { count: "exact" } : undefined)
        .order(filters.sort || "created_at", { ascending: (filters.order || "desc") === "asc" });

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.requestedRole) {
        query = query.eq("requested_role", filters.requestedRole);
      }

      if (filters.statuses?.length) {
        query = query.in("status", filters.statuses);
      }

      if (filters.clubId) {
        query = query.eq("club_id", filters.clubId);
      }

      query = applyPagination(query, filters.pagination);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return formatQueryResult({ data, count, pagination: filters.pagination });
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
      const assignments = await listAdvisorAssignments({
        advisorProfileId: advisorId
      });

      if (assignments) {
        return assignments.map((assignment) => assignment.club_id);
      }

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
      const assignments = await listAdvisorAssignments({
        clubId
      });

      if (assignments) {
        return assignments.map((assignment) => assignment.advisor_profile_id);
      }

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

    async getAllAdvisorProfileIds() {
      const assignments = await listAdvisorAssignments();

      if (assignments) {
        return [...new Set(assignments.map((assignment) => assignment.advisor_profile_id))];
      }

      const { data, error } = await getClient()
        .from("clubs")
        .select("advisor_id")
        .not("advisor_id", "is", null);

      if (error) {
        throw error;
      }

      return [...new Set((data ?? []).map((club) => club.advisor_id))];
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

    async listNotificationsByUserId(userId, filters = {}) {
      let query = getClient()
        .from("notifications")
        .select(notificationSelect, filters.pagination ? { count: "exact" } : undefined)
        .eq("user_id", userId)
        .order(filters.sort || "created_at", { ascending: (filters.order || "desc") === "asc" });

      query = applyPagination(query, filters.pagination);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return formatQueryResult({ data, count, pagination: filters.pagination });
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
        .select(taskSelect, filters.pagination ? { count: "exact" } : undefined)
        .order(filters.sort || "created_at", { ascending: (filters.order || "desc") === "asc" });

      if (filters.clubId) {
        query = query.eq("club_id", filters.clubId);
      }

      if (filters.assignedTo) {
        query = query.eq("assigned_to", filters.assignedTo);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      query = applyPagination(query, filters.pagination);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return formatQueryResult({ data, count, pagination: filters.pagination });
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
        .select(clubMemberSelect, filters.pagination ? { count: "exact" } : undefined)
        .order(filters.sort || "full_name", { ascending: (filters.order || "asc") === "asc" });

      if (filters.clubId) {
        query = query.eq("club_id", filters.clubId);
      }

      if (filters.clubRoles?.length) {
        query = query.in("club_role", filters.clubRoles);
      }

      if (filters.membershipStatus) {
        query = query.eq("membership_status", filters.membershipStatus);
      }

      query = applyPagination(query, filters.pagination);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return formatQueryResult({ data, count, pagination: filters.pagination });
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

    async createAuditLog(entry) {
      const { data, error } = await getClient()
        .from("audit_logs")
        .insert(entry)
        .select(auditLogSelect)
        .single();

      if (error && isMissingRelation(error, "audit_logs")) {
        return null;
      }

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
        .select(membershipRequestSelect, filters.pagination ? { count: "exact" } : undefined)
        .order(filters.sort || "created_at", { ascending: (filters.order || "desc") === "asc" });

      if (filters.profileId) {
        query = query.eq("profile_id", filters.profileId);
      }

      if (filters.clubId) {
        query = query.eq("club_id", filters.clubId);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      query = applyPagination(query, filters.pagination);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return formatQueryResult({ data, count, pagination: filters.pagination });
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
        .select(leadershipApplicationSelect, filters.pagination ? { count: "exact" } : undefined)
        .order(filters.sort || "created_at", { ascending: (filters.order || "desc") === "asc" });

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

      query = applyPagination(query, filters.pagination);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return formatQueryResult({ data, count, pagination: filters.pagination });
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
        .select(eventReportSelect, filters.pagination ? { count: "exact" } : undefined)
        .order(filters.sort || "submitted_at", { ascending: (filters.order || "desc") === "asc" });

      if (filters.clubId) {
        query = query.eq("club_id", filters.clubId);
      }

      if (filters.clubIds) {
        if (!filters.clubIds.length) {
          return filters.pagination
            ? buildPaginatedResult({
                items: [],
                page: filters.pagination.page,
                pageSize: filters.pagination.pageSize,
                total: 0
              })
            : [];
        }

        query = query.in("club_id", filters.clubIds);
      }

      if (filters.proposalId) {
        query = query.eq("proposal_id", filters.proposalId);
      }

      query = applyPagination(query, filters.pagination);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return formatQueryResult({ data, count, pagination: filters.pagination });
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

    async getAnnouncementById(announcementId) {
      const { data, error } = await getClient()
        .from("announcements")
        .select(announcementSelect)
        .eq("id", announcementId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },

    async getActiveClubIdsByProfileId(profileId) {
      const { data, error } = await getClient()
        .from("club_members")
        .select("club_id")
        .eq("profile_id", profileId)
        .eq("membership_status", "active");

      if (error) {
        throw error;
      }

      return [...new Set((data ?? []).map((member) => member.club_id))];
    },

    async listAnnouncements(filters = {}) {
      let query = getClient()
        .from("announcements")
        .select(announcementSelect, filters.pagination ? { count: "exact" } : undefined)
        .order(filters.sort || "created_at", { ascending: (filters.order || "desc") === "asc" });

      if (filters.audience) {
        query = query.eq("audience", filters.audience);
      }

      if (filters.clubId) {
        query = query.eq("club_id", filters.clubId);
      }

      if (filters.clubIds) {
        if (!filters.clubIds.length) {
          return filters.pagination
            ? buildPaginatedResult({
                items: [],
                page: filters.pagination.page,
                pageSize: filters.pagination.pageSize,
                total: 0
              })
            : [];
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

      query = applyPagination(query, filters.pagination);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return formatQueryResult({ data, count, pagination: filters.pagination });
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
