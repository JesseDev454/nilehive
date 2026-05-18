const asyncHandler = require("../../shared/asyncHandler");
const { listPublicClubs, listVisibleClubs } = require("./clubs.service");

function createClubsController(options = {}) {
  const { database } = options;

  return {
    listPublicClubs: asyncHandler(async (req, res) => {
      const clubs = await listPublicClubs({ database });

      res.status(200).json({ data: clubs });
    }),

    listClubs: asyncHandler(async (req, res) => {
      const clubs = await listVisibleClubs({
        actor: req.user,
        database
      });

      res.status(200).json({ data: clubs });
    })
  };
}

module.exports = { createClubsController };
