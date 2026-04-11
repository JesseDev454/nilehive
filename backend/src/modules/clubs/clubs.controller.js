const asyncHandler = require("../../shared/asyncHandler");
const { listVisibleClubs } = require("./clubs.service");

function createClubsController(options = {}) {
  const { database } = options;

  return {
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
