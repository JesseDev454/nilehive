const asyncHandler = require("../../shared/asyncHandler");
const { createClub, listPublicClubs, listVisibleClubs, updateClub } = require("./clubs.service");

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
    }),

    createClub: asyncHandler(async (req, res) => {
      const club = await createClub({ actor: req.user, payload: req.body, database });
      res.status(201).json({ data: club });
    }),

    updateClub: asyncHandler(async (req, res) => {
      const club = await updateClub({
        actor: req.user,
        clubId: req.params.clubId,
        payload: req.body,
        database
      });
      res.status(200).json({ data: club });
    })
  };
}

module.exports = { createClubsController };
