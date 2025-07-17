import { Types } from "mongoose";
import { role } from "../../common/constant";

export const pendingUserQuery = {
  isEmailVerified: true,
  role: role.USER,
  isActive: false,
};

export const projectionFields = {
  registerUser: "-password -refreshToken",
  getPendingApprovals: "fullName email serialNumber",
  excludePassword: "-password",
};

export const buildUserFinancialAggregation = (month: string, year: number) => [
  {
    $lookup: {
      from: "financialyears",
      localField: "yearId",
      foreignField: "_id",
      as: "financialYear",
    },
  },
  { $unwind: "$financialYear" },
  {
    $match: {
      month,
      "financialYear.year": year,
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "financialYear.userId",
      foreignField: "_id",
      as: "user",
    },
  },
  { $unwind: "$user" },
  {
    $project: {
      _id: 0,
      month: 1,
      loanTaken: 1,
      collection: 1,
      fine: 1,
      interest: 1,
      instalment: 1,
      total: 1,
      pendingLoan: 1,
      fullName: "$user.fullName",
      serialNumber: "$user.serialNumber",
    },
  },
];

export const buildSingleUserFinancialDataPipeline = (userId: Types.ObjectId, year: number) => [
  {
    $lookup: {
      from: "financialyears",
      localField: "yearId",
      foreignField: "_id",
      as: "financialYear",
    },
  },
  { $unwind: "$financialYear" },
  {
    $match: {
      "financialYear.userId": userId,
      "financialYear.year": year,
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "financialYear.userId",
      foreignField: "_id",
      as: "user",
    },
  },
  { $unwind: "$user" },
  {
    $project: {
      _id: 0,
      month: 1,
      loanTaken: 1,
      collection: 1,
      fine: 1,
      interest: 1,
      instalment: 1,
      total: 1,
      pendingLoan: 1,
      fullName: "$user.fullName",
      serialNumber: "$user.serialNumber",
      year,
    },
  },
];

export const postCommands = {
  save:"save"
}

export const models = {
  user: "User",
  financialEntry: "FinancialEntry",
};
