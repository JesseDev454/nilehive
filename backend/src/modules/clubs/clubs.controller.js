const asyncHandler = require("../../shared/asyncHandler");
const {
  createClub,
  createClubMedia,
  deleteClub,
  deleteClubMedia,
  getClubDetail,
  listClubMedia,
  listPublicClubs,
  listVisibleClubs,
  updateClub,
  updateClubMedia,
  updateClubProfile
} = require("./clubs.service");

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

    getClubDetail: asyncHandler(async (req, res) => {
      const club = await getClubDetail({
        actor: req.user,
        clubId: req.params.clubId,
        database
      });
      res.status(200).json({ data: club });
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
    }),

    deleteClub: asyncHandler(async (req, res) => {
      await deleteClub({
        actor: req.user,
        clubId: req.params.clubId,
        database
      });
      res.status(204).end();
    }),

    updateClubProfile: asyncHandler(async (req, res) => {
      const club = await updateClubProfile({
        actor: req.user,
        clubId: req.params.clubId,
        payload: req.body,
        database
      });
      res.status(200).json({ data: club });
    }),

    listClubMedia: asyncHandler(async (req, res) => {
      const media = await listClubMedia({
        actor: req.user,
        clubId: req.params.clubId,
        database
      });
      res.status(200).json({ data: media });
    }),

    createClubMedia: asyncHandler(async (req, res) => {
      const media = await createClubMedia({
        actor: req.user,
        clubId: req.params.clubId,
        payload: req.body,
        database
      });
      res.status(201).json({ data: media });
    }),

    updateClubMedia: asyncHandler(async (req, res) => {
      const media = await updateClubMedia({
        actor: req.user,
        clubId: req.params.clubId,
        mediaId: req.params.mediaId,
        payload: req.body,
        database
      });
      res.status(200).json({ data: media });
    }),

    deleteClubMedia: asyncHandler(async (req, res) => {
      await deleteClubMedia({
        actor: req.user,
        clubId: req.params.clubId,
        mediaId: req.params.mediaId,
        database
      });
      res.status(204).end();
    })
  };
}

module.exports = { createClubsController };
