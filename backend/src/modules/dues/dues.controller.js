const asyncHandler = require("../../shared/asyncHandler");
const {
  applyDuesAmountToAllClubs,
  createDuePayment,
  getPaymentSettings,
  listDuePayments,
  listMyDuePayments,
  submitDuePaymentConfirmation,
  upsertPaymentSettings,
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

    listMyDuePayments: asyncHandler(async (req, res) => {
      const result = await listMyDuePayments({
        actor: req.user,
        database
      });

      res.status(200).json({ data: result });
    }),

    getPaymentSettings: asyncHandler(async (req, res) => {
      const settings = await getPaymentSettings({
        actor: req.user,
        clubId: req.query.club_id,
        database
      });

      res.status(200).json({ data: settings });
    }),

    upsertPaymentSettings: asyncHandler(async (req, res) => {
      const settings = await upsertPaymentSettings({
        actor: req.user,
        payload: req.body,
        database
      });

      res.status(200).json({ data: settings });
    }),

    applyDuesAmountToAllClubs: asyncHandler(async (req, res) => {
      const result = await applyDuesAmountToAllClubs({
        actor: req.user,
        payload: req.body,
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
    }),

    submitDuePaymentConfirmation: asyncHandler(async (req, res) => {
      const payment = await submitDuePaymentConfirmation({
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
