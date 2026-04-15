const asyncHandler = require("../../shared/asyncHandler");
const {
  createMembershipRequest,
  decideMembershipRequest,
  listMembershipRequests,
  listMyMembershipRequests
} = require("./membership-requests.service");

function createMembershipRequestsController(options = {}) {
  const { database } = options;

  return {
    createRequest: asyncHandler(async (req, res) => {
      const request = await createMembershipRequest({
        actor: req.user,
        payload: req.body,
        database
      });

      res.status(201).json({ data: request });
    }),

    listMyRequests: asyncHandler(async (req, res) => {
      const requests = await listMyMembershipRequests({
        actor: req.user,
        database
      });

      res.status(200).json({ data: requests });
    }),

    listRequests: asyncHandler(async (req, res) => {
      const requests = await listMembershipRequests({
        actor: req.user,
        filters: {
          club_id: req.query.club_id,
          status: req.query.status
        },
        database
      });

      res.status(200).json({ data: requests });
    }),

    decideRequest: asyncHandler(async (req, res) => {
      const result = await decideMembershipRequest({
        actor: req.user,
        requestId: req.params.requestId,
        payload: req.body,
        database
      });

      res.status(200).json({ data: result });
    })
  };
}

module.exports = { createMembershipRequestsController };
