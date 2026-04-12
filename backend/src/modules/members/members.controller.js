const asyncHandler = require("../../shared/asyncHandler");
const {
  createMember,
  listMembers,
  updateMember
} = require("./members.service");

function createMembersController(options = {}) {
  const { database } = options;

  return {
    listMembers: asyncHandler(async (req, res) => {
      const members = await listMembers({
        actor: req.user,
        filters: {
          club_id: req.query.club_id,
          team: req.query.team,
          membership_status: req.query.membership_status
        },
        database
      });

      res.status(200).json({ data: members });
    }),

    createMember: asyncHandler(async (req, res) => {
      const member = await createMember({
        actor: req.user,
        payload: req.body,
        database
      });

      res.status(201).json({ data: member });
    }),

    updateMember: asyncHandler(async (req, res) => {
      const member = await updateMember({
        actor: req.user,
        memberId: req.params.memberId,
        payload: req.body,
        database
      });

      res.status(200).json({ data: member });
    })
  };
}

module.exports = { createMembersController };
