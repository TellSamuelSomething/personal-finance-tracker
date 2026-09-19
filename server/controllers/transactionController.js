import mongoose from "mongoose";

import Transaction from "../models/Transaction.js";

// Every query is scoped to `req.userId`, so users can only see and change their own transactions.

export const listTransactions = async (req, res) => {
  const transactions = await Transaction.find({ user: req.userId }).sort({ date: -1, _id: -1 }).lean();
  res.json(transactions);
};

export const createTransaction = async (req, res) => {
  const { type, amount, category, date } = req.body;
  const transaction = await Transaction.create({ user: req.userId, type, amount, category, date });
  res.status(201).json(transaction);
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  const deleted = mongoose.isValidObjectId(id)
    ? await Transaction.findOneAndDelete({ _id: id, user: req.userId })
    : null;

  // Someone else's transaction looks exactly like one that does not exist.
  if (!deleted) return res.status(404).json({ message: "Transaction not found" });

  res.json({ message: "Transaction deleted" });
};
