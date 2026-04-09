const asyncHandler = require("../../shared/asyncHandler");
const { listOwnNotifications } = require("./notifications.service");

function createNotificationsController(options = {}) {
  const { database } = options;

  return {
    listOwnNotifications: asyncHandler(async (req, res) => {
      const notifications = await listOwnNotifications({
        actor: req.user,
        database
      });

      res.status(200).json({ data: notifications });
    })
  };
}

module.exports = { createNotificationsController };
