const test = require("node:test");
const assert = require("node:assert/strict");
const { rankClubs, scoreClub, validatePreferences } = require("../src/modules/profile/clubPreferences");

const preferences = validatePreferences({
  interests: ["Tech", "Leadership"], skills: ["technical", "communication"], career_goals: ["portfolio_building"], availability: ["weekday_evening"], weekly_commitment: "3-5"
});

test("club preference validation requires complete structured answers", () => {
  assert.equal(preferences.status, "completed");
  assert.throws(() => validatePreferences({ interests: [], skills: [], career_goals: [], availability: [], weekly_commitment: "" }), /Choose at least one/);
});

test("club matching applies the documented 50/25/15/10 weights", () => {
  const result = scoreClub(preferences, { categories: ["Tech", "Leadership"], skills_offered: ["technical", "communication"], career_goals: ["portfolio_building"], meeting_windows: ["weekday_evening"], weekly_commitment: "3-5" });
  assert.equal(result.score, 100);
  assert.ok(result.reasons.some((reason) => reason.startsWith("Interests:")));
});

test("club ranking excludes joined clubs and resolves ties by activity then name", () => {
  const clubs = [
    { id: "joined", name: "Joined", categories: ["Tech"], skills_offered: [], career_goals: [], meeting_windows: [] },
    { id: "b", name: "Beta", categories: ["Tech"], skills_offered: [], career_goals: [], meeting_windows: [], has_upcoming_event: true },
    { id: "a", name: "Alpha", categories: ["Tech"], skills_offered: [], career_goals: [], meeting_windows: [] }
  ];
  assert.deepEqual(rankClubs(preferences, clubs, ["joined"]).map((item) => item.club.id), ["b", "a"]);
});
