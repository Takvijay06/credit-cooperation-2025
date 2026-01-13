import mongoose, { Schema } from "mongoose";
import { IFinancialYear } from "../common/interface.js";

const FinancialYearSchema: Schema<IFinancialYear> = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
});

export const FinancialYear = mongoose.model("FinancialYear", FinancialYearSchema);
