const INTERESTS = new Set(["Tech", "Gaming", "Music", "Entrepreneurship", "Sports", "Volunteering", "Academics", "Media", "Arts", "Leadership"]);
const SKILLS = new Set(["communication", "leadership", "technical", "design", "research", "entrepreneurship", "event_planning", "media_content", "teamwork", "community_service"]);
const CAREER_GOALS = new Set(["portfolio_building", "leadership", "networking", "technology", "entrepreneurship", "public_speaking", "creative_practice", "community_impact", "academic_enrichment"]);
const AVAILABILITY = new Set(["weekday_daytime", "weekday_evening", "weekend", "flexible"]);
const COMMITMENTS = new Set(["1-2", "3-5", "6+"]);

function normalizeList(value, allowed, field) {
  if (!Array.isArray(value)) {
    const ApiError = require("../../shared/ApiError");
    throw new ApiError(400, `${field} must be a list`, "VALIDATION_ERROR", { field });
  }

  const normalized = [...new Set(value.map((item) => String(item).trim()).filter(Boolean))];
  const invalid = normalized.find((item) => !allowed.has(item));
  if (invalid) {
    const ApiError = require("../../shared/ApiError");
    throw new ApiError(400, `Unsupported ${field} value: ${invalid}`, "VALIDATION_ERROR", { field });
  }
  return normalized;
}

function validatePreferences(payload = {}) {
  const status = payload.status === "dismissed" ? "dismissed" : "completed";
  if (status === "dismissed") {
    return { interests: [], skills: [], career_goals: [], availability: [], weekly_commitment: null, status };
  }

  const preferences = {
    interests: normalizeList(payload.interests, INTERESTS, "interests"),
    skills: normalizeList(payload.skills, SKILLS, "skills"),
    career_goals: normalizeList(payload.career_goals, CAREER_GOALS, "career_goals"),
    availability: normalizeList(payload.availability, AVAILABILITY, "availability"),
    weekly_commitment: String(payload.weekly_commitment || "").trim(),
    status
  };

  for (const field of ["interests", "skills", "career_goals", "availability"]) {
    if (preferences[field].length === 0) {
      const ApiError = require("../../shared/ApiError");
      throw new ApiError(400, `Choose at least one ${field.replace("_", " ")}`, "VALIDATION_ERROR", { field });
    }
  }
  if (!COMMITMENTS.has(preferences.weekly_commitment)) {
    const ApiError = require("../../shared/ApiError");
    throw new ApiError(400, "Choose a weekly commitment", "VALIDATION_ERROR", { field: "weekly_commitment" });
  }
  return preferences;
}

function overlapScore(selected, offered, weight) {
  if (!selected.length) return 0;
  const offeredSet = new Set(offered || []);
  return (selected.filter((item) => offeredSet.has(item)).length / selected.length) * weight;
}

function scoreClub(preferences, club) {
  const interestMatches = preferences.interests.filter((item) => (club.categories || []).includes(item));
  const skillMatches = preferences.skills.filter((item) => (club.skills_offered || []).includes(item));
  const goalMatches = preferences.career_goals.filter((item) => (club.career_goals || []).includes(item));
  const availabilityMatches = preferences.availability.filter((item) => (club.meeting_windows || []).includes(item));
  let score = overlapScore(preferences.interests, club.categories, 50)
    + overlapScore(preferences.skills, club.skills_offered, 25)
    + overlapScore(preferences.career_goals, club.career_goals, 15);
  const availabilityScore = overlapScore(preferences.availability, club.meeting_windows, 6);
  const commitmentScore = preferences.weekly_commitment && preferences.weekly_commitment === club.weekly_commitment ? 4 : 0;
  score += availabilityScore + commitmentScore;

  const reasons = [];
  if (interestMatches.length) reasons.push(`Interests: ${interestMatches.slice(0, 2).join(", ")}`);
  if (skillMatches.length) reasons.push(`Skills: ${skillMatches.slice(0, 2).join(", ").replaceAll("_", " ")}`);
  if (goalMatches.length) reasons.push(`Goals: ${goalMatches.slice(0, 2).join(", ").replaceAll("_", " ")}`);
  if (availabilityMatches.length) reasons.push(`Availability: ${availabilityMatches[0].replaceAll("_", " ")}`);

  return { club, score: Math.round(score), reasons };
}

function rankClubs(preferences, clubs, joinedClubIds = []) {
  const joined = new Set(joinedClubIds);
  return clubs
    .filter((club) => !joined.has(club.id))
    .map((club) => scoreClub(preferences, club))
    .sort((a, b) => b.score - a.score || Number(Boolean(b.club.has_upcoming_event)) - Number(Boolean(a.club.has_upcoming_event)) || a.club.name.localeCompare(b.club.name));
}

module.exports = { AVAILABILITY, CAREER_GOALS, COMMITMENTS, INTERESTS, SKILLS, rankClubs, scoreClub, validatePreferences };
