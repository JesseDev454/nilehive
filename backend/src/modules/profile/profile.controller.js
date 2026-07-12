const asyncHandler = require("../../shared/asyncHandler");
const {
  completeProfileOnboarding,
  getMyProfile,
  getClubPreferences,
  updateClubPreferences
} = require("./profile.service");

function createProfileController(options = {}) {
  const { database } = options;

  return {
    getMe: asyncHandler(async (req, res) => {
      const data = await getMyProfile({
        authUser: req.authUser,
        profile: req.profile,
        user: req.user,
        database
      });

      res.status(200).json({ data });
    }),

    getClubPreferences: asyncHandler(async (req, res) => {
      const data = await getClubPreferences({ actor: req.user, database });
      res.status(200).json({ data });
    }),

    updateClubPreferences: asyncHandler(async (req, res) => {
      const data = await updateClubPreferences({ actor: req.user, payload: req.body, database });
      res.status(200).json({ data });
    }),


    completeOnboarding: asyncHandler(async (req, res) => {
      const profile = await completeProfileOnboarding({
        authUser: req.authUser,
        profile: req.profile,
        payload: req.body,
        database
      });

      res.status(201).json({ data: profile });
    })
  };
}

module.exports = { createProfileController };
