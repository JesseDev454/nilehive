const asyncHandler = require("../../shared/asyncHandler");
const {
  createDuePayment,
  listDuePayments,
  updateDuePayment
} = require("./dues.service");

function createDuesController(options = {}) {
  const { database } = options;

  return {
    listDuePayments: asyncHandler(async (req, res) => {
      const result = await listDuePayments({
        actor: req.user,
        filters: {
          club_id: req.query.club_id,
          status: req.query.status,
          member_id: req.query.member_id
        },
        database
      });

      res.status(200).json({ data: result });
    }),

    createDuePayment: asyncHandler(async (req, res) => {
      const payment = await createDuePayment({
        actor: req.user,
        payload: req.body,
        database
      });

      res.status(201).json({ data: payment });
    }),

    updateDuePayment: asyncHandler(async (req, res) => {
      const payment = await updateDuePayment({
        actor: req.user,
        paymentId: req.params.paymentId,
        payload: req.body,
        database
      });

      res.status(200).json({ data: payment });
    })
  };
}

module.exports = { createDuesController };
