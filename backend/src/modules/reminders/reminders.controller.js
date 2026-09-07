const asyncHandler = require("../../shared/asyncHandler");
const { listOwnReminders } = require("./reminders.service");

function createRemindersController(options = {}) {
  const { database } = options;

  return {
    listOwnReminders: asyncHandler(async (req, res) => {
      const reminders = await listOwnReminders({
        actor: req.user,
        database
      });

      res.status(200).json({ data: reminders });
    })
  };
}

module.exports = { createRemindersController };
