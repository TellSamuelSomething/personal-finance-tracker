import express from "express";

import { createTransaction, deleteTransaction, listTransactions } from "../controllers/transactionController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { transactionSchema } from "../validators/schemas.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", listTransactions);
router.post("/", validate(transactionSchema), createTransaction);
router.delete("/:id", deleteTransaction);

export default router;
