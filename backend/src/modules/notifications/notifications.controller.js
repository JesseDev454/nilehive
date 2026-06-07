const asyncHandler = require("../../shared/asyncHandler");
const {
  getPushRegistrationConfig,
  listOwnNotifications,
  registerPushSubscription,
  removePushSubscription
} = require("./notifications.service");
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
    }),

    getPushConfig: asyncHandler(async (req, res) => {
      res.status(200).json({ data: getPushRegistrationConfig() });
    }),

    registerPushSubscription: asyncHandler(async (req, res) => {
      const subscription = await registerPushSubscription({
        actor: req.user,
        payload: req.body,
        userAgent: req.get("user-agent") ?? null,
        database
      });

      res.status(201).json({ data: subscription });
    }),

    removePushSubscription: asyncHandler(async (req, res) => {
      const result = await removePushSubscription({
        actor: req.user,
        payload: req.body,
        database
      });

      res.status(200).json({ data: result });
    })
  };
}

module.exports = { createNotificationsController };
