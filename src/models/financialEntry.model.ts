import mongoose from "mongoose";

const FinancialEntrySchema = new mongoose.Schema({
  yearId: { type: mongoose.Schema.Types.ObjectId, ref: "FinancialYear" },
  month: { type: String, required: true },
  loanTaken: { type: Number, required: true },
  collection: { type: Number, required: true },
  fine: { type: Number, required: true },
  interest: { type: Number },
  instalment: { type: Number, required: true },
  total: { type: Number, required: true },
  pendingLoan: { type: Number, required: true },
});

export const FinancialEntry = mongoose.model("FinancialEntry", FinancialEntrySchema);
