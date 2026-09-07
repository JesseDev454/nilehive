const asyncHandler = require("../../shared/asyncHandler");
const { parsePaginationQuery } = require("../../shared/pagination");
const {
  createMembershipRequest,
  decideMembershipRequest,
  listMembershipRequests,
  listMyMembershipRequests,
  markWhatsAppOnboardingAdded
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
          status: req.query.status,
          requested_role: req.query.requested_role
        },
        pagination: parsePaginationQuery(req.query, {
          defaultSort: "created_at",
          defaultOrder: "desc",
          allowedSorts: ["created_at", "updated_at", "requested_role"]
        }),
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
    }),

    markWhatsAppAdded: asyncHandler(async (req, res) => {
      const request = await markWhatsAppOnboardingAdded({
        actor: req.user,
        requestId: req.params.requestId,
        payload: req.body,
        database
      });

      res.status(200).json({ data: request });
    })
  };
}

module.exports = { createMembershipRequestsController };
