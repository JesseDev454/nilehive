const asyncHandler = require("../../shared/asyncHandler");
const { listOwnNotifications } = require("./notifications.service");
const { parsePaginationQuery } = require("../../shared/pagination");

function createNotificationsController(options = {}) {
  const { database } = options;

  return {
    listOwnNotifications: asyncHandler(async (req, res) => {
      const notifications = await listOwnNotifications({
        actor: req.user,
        pagination: parsePaginationQuery(req.query, {
          defaultSort: "created_at",
          defaultOrder: "desc",
          allowedSorts: ["created_at"]
        }),
        database
      });

      res.status(200).json({ data: notifications });
    })
  };
}

module.exports = { createNotificationsController };
