import { EmptyValue, errorMessages, StatusCode, successMessages } from "../common/constant";
import { FinancialEntry } from "../models/financialEntry.model";
import { FinancialYear } from "../models/financialYear.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { createFinancialYear, getLastPendingLoan } from "../utils/helper";
import {
  buildUserFinancialAggregation,
  buildUsersWithLoanInMonth,
  pendingUserQuery,
  projectionFields,
} from "../utils/helper/query";
import {
  validateInsertEntryInput,
  validateYearMonthParams,
} from "../utils/validations/admin.validate";

const getPendingApprovals = asyncHandler(async (_, res) => {
  const pendingApprovalUsers = await User.find(
    pendingUserQuery,
    projectionFields.getPendingApprovals,
  );
  return res
    .status(StatusCode.OK)
    .json(
      new ApiResponse(StatusCode.OK, pendingApprovalUsers, successMessages.userPendingRequests),
    );
});

const approveUserRequest = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const approvedUser = await User.findOneAndUpdate(
    { serialNumber: userId, isActive: false, isEmailVerified: true },
    { $set: { isActive: true } },
    { new: true },
  );

  if (!approvedUser) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.userNotExistWithRequest);
  }

  const pendingUsers = await User.find(pendingUserQuery, projectionFields.getPendingApprovals);

  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, pendingUsers, successMessages.userVerifiedByAdmin));
});

const deleteUserRequest = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const deletedUserRequest = await User.findOneAndUpdate(
    { serialNumber: userId, isActive: false, isEmailVerified: true },
    { $set: { isEmailVerified: false } },
    { new: true },
  );

  if (!deletedUserRequest) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.userNotExistWithRequest);
  }

  const pendingUsers = await User.find(pendingUserQuery, projectionFields.getPendingApprovals);

  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, pendingUsers, successMessages.userVerifiedByAdmin));
});

const getUsersWithFinancialDataPerMonthPerYear = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const { month: validMonth, year: validYear } = validateYearMonthParams(month, year);

  const entries = await FinancialEntry.aggregate(
    buildUserFinancialAggregation(validMonth, validYear),
  );
  return res
    .status(StatusCode.OK)
    .json(
      new ApiResponse(StatusCode.OK, entries, successMessages.userFinancialDataPerMonthPerYear),
    );
});

const getLoanTakenUsersInGivenMonthYear = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const { month: validMonth, year: validYear } = validateYearMonthParams(month, year);

  const entries = await FinancialEntry.aggregate(buildUsersWithLoanInMonth(validMonth, validYear));
  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, entries, successMessages.loanTakenUsersforMonthYear));
});

const insertEntry = asyncHandler(async (req, res) => {
  const {
    serialNumber,
    year,
    month,
    loanTaken = 0,
    collection = 0,
    fine = 0,
    instalment = 0,
  } = req.body;

  validateInsertEntryInput(serialNumber, year, month);

  const user = await User.findOne({ serialNumber });
  if (!user) {
    throw new ApiError(StatusCode.NOTFOUND, errorMessages.userNotExist);
  }

  const currentYear = await createFinancialYear(user._id + EmptyValue, year);

  const existingEntry = await FinancialEntry.findOne({
    yearId: currentYear._id,
    month,
  });
  if (existingEntry) {
    throw new ApiError(StatusCode.CONFLICTS, errorMessages.alreadyEntryFound + `${month} ${year}`);
  }

  const lastPending = await getLastPendingLoan(user._id + EmptyValue, year, month);

  const interest = (lastPending * 1) / 100;
  const total = collection + interest + instalment + fine;
  const pendingLoan = lastPending + loanTaken - instalment;

  const newEntry = await FinancialEntry.create({
    yearId: currentYear._id,
    month,
    loanTaken,
    collection,
    fine,
    interest,
    instalment,
    total,
    pendingLoan,
  });

  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, { newEntry }, successMessages.entryInserted));
});

export {
  getPendingApprovals,
  approveUserRequest,
  deleteUserRequest,
  getUsersWithFinancialDataPerMonthPerYear,
  insertEntry,
  getLoanTakenUsersInGivenMonthYear,
};
