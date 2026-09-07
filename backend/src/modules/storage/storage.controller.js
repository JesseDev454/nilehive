const asyncHandler = require("../../shared/asyncHandler");
const { createSignedStorageUrl, uploadStorageObject } = require("./storage.service");

function createStorageController(options = {}) {
  const { database } = options;

  return {
    upload: asyncHandler(async (req, res) => {
      const data = await uploadStorageObject({
        actor: req.user,
        payload: req.body,
        database
      });

      res.status(201).json({ data });
    }),

    createSignedUrl: asyncHandler(async (req, res) => {
      const data = await createSignedStorageUrl({
        actor: req.user,
        payload: req.body,
        database
      });

      res.status(200).json({ data });
    })
  };
}

module.exports = { createStorageController };
