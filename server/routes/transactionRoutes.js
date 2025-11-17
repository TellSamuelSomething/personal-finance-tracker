import express from "express";
import Transaction from "../models/Transaction.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const transaction = await Transaction.find();
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { type, amount, category, date } = req.body;
    const transaction = new Transaction({ type, amount, category, date });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Transaction not found" });

    res.json({ message: "Transaction deleted" }); // MUST BE JSON
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
