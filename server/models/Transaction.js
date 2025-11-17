import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  type: { type: String, required: true }, // "Income" or "Expense"
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
});

export default mongoose.model("Transaction", transactionSchema);