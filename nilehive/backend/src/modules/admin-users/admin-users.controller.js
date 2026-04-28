const asyncHandler = require("../../shared/asyncHandler");
const { parsePaginationQuery } = require("../../shared/pagination");
const {
  assignAdvisorToClub,
  getAdminUser,
  listAdminUsers,
  updateAdminUserRole
} = require("./admin-users.service");

function createAdminUsersController(options = {}) {
  const { database } = options;

  return {
    listUsers: asyncHandler(async (req, res) => {
      const users = await listAdminUsers({
        actor: req.user,
        filters: {
          role: req.query.role,
          club_id: req.query.club_id,
          requested_role: req.query.requested_role,
          q: req.query.q
        },
        pagination: parsePaginationQuery(req.query, {
          defaultSort: "created_at",
          defaultOrder: "desc",
          allowedSorts: ["created_at", "full_name", "updated_at"]
        }),
        database
      });

      res.status(200).json({ data: users });
    }),

    getUser: asyncHandler(async (req, res) => {
      const user = await getAdminUser({
        actor: req.user,
        profileId: req.params.profileId,
        database
      });

      res.status(200).json({ data: user });
    }),

    updateRole: asyncHandler(async (req, res) => {
      const result = await updateAdminUserRole({
        actor: req.user,
        profileId: req.params.profileId,
        payload: req.body,
        database
      });

      res.status(200).json({ data: result });
    }),

    assignAdvisor: asyncHandler(async (req, res) => {
      const result = await assignAdvisorToClub({
        actor: req.user,
        profileId: req.params.profileId,
        payload: req.body,
        database
      });

      res.status(200).json({ data: result });
    })
  };
}

module.exports = { createAdminUsersController };
