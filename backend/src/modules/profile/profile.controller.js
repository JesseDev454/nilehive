const asyncHandler = require("../../shared/asyncHandler");
const {
  completeProfileOnboarding,
  getMyProfile,
  uploadSignupReceipt
} = require("./profile.service");

function createProfileController(options = {}) {
  const { database } = options;

  return {
    getMe: asyncHandler(async (req, res) => {
      const data = await getMyProfile({
        authUser: req.authUser,
        profile: req.profile,
        database
      });

      res.status(200).json({ data });
    }),

    uploadSignupReceipt: asyncHandler(async (req, res) => {
      const data = await uploadSignupReceipt({
        payload: req.body,
        database
      });

      res.status(201).json({ data });
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
