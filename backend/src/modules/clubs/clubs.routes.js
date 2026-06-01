const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createRateLimitMiddleware } = require("../../middleware/rateLimit");
const { createClubsController } = require("./clubs.controller");

function createClubsRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createClubsController({ database });
  const clubWriteLimit = createRateLimitMiddleware({
    windowMs: 10 * 60 * 1000,
    max: 20,
    code: "CLUB_WRITE_RATE_LIMITED",
    message: "Too many club updates. Please wait before trying again.",
    key: (req) => `${req.user?.id || req.ip}:clubs:write`
  });

  router.get("/public", controller.listPublicClubs);
  router.get("/", auth, controller.listClubs);
  router.post("/", auth, clubWriteLimit, controller.createClub);
  router.patch("/:clubId", auth, clubWriteLimit, controller.updateClub);

  return router;
}

module.exports = { createClubsRouter };
