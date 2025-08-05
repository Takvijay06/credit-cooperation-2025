import {
  EmptyValue,
  EntryStatus,
  errorMessages,
  StatusCode,
  successMessages,
} from "../common/constant";
import { FinancialEntry } from "../models/financialEntry.model";
import { FinancialYear } from "../models/financialYear.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { createFinancialYear, getLastPendingLoan, getPreviousMonthYear } from "../utils/helper";
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

const editEntry = asyncHandler(async (req, res) => {
  const { serialNumber, year, month, loanTaken, fine, instalment } = req.body;

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

  if (!existingEntry) {
    throw new ApiError(StatusCode.NOTFOUND, errorMessages.entryNotFound + `${month} ${year}`);
  }

  const updateFields: Partial<{
    loanTaken: number;
    fine: number;
    instalment: number;
    total: number;
    pendingLoan: number;
  }> = {};

  const basePendingLoan = Number(existingEntry.pendingLoan);
  updateFields.pendingLoan = basePendingLoan;
  if (loanTaken !== undefined) {
    updateFields.loanTaken = loanTaken;
    updateFields.pendingLoan =
      updateFields.pendingLoan - Number(existingEntry.loanTaken - loanTaken);
  }
  if (fine !== undefined) updateFields.fine = fine;
  if (instalment !== undefined) updateFields.instalment = instalment;
  if (instalment !== undefined && fine !== undefined) {
    updateFields.total =
      instalment + fine + Number(existingEntry.collection) + Number(existingEntry.interest);
    updateFields.pendingLoan =
      updateFields.pendingLoan + Number(existingEntry.instalment) - instalment;
  } else if (instalment !== undefined) {
    updateFields.pendingLoan =
      updateFields.pendingLoan + Number(existingEntry.instalment) - instalment;
    updateFields.total =
      instalment +
      Number(existingEntry.fine) +
      Number(existingEntry.collection) +
      Number(existingEntry.interest);
  } else if (fine !== undefined) {
    updateFields.total =
      Number(existingEntry.instalment) +
      fine +
      Number(existingEntry.collection) +
      Number(existingEntry.interest);
  }

  const updatedEntry = await FinancialEntry.findOneAndUpdate(
    { yearId: currentYear._id, month },
    { $set: updateFields },
    { new: true },
  );

  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, { updatedEntry }, successMessages.entryUpdated));
});

const depositSocietyForUser = asyncHandler(async (req, res) => {
  const { serialNumber, year, month } = req.body;
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

  if (!existingEntry) {
    throw new ApiError(StatusCode.NOTFOUND, errorMessages.entryNotFound + `${month} ${year}`);
  }

  const updatedEntry = await FinancialEntry.findOneAndUpdate(
    { yearId: currentYear._id, month },
    { $set: { status: EntryStatus.DEPOSIT } },
    { new: true },
  );
  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, { updatedEntry }, successMessages.societyDeposit));
});



const autoInsertEntriesForMonthYear = asyncHandler(async (req, res) => {
  const { year, month } = req.body;

  if (!year || !month) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.InvalidMonthAndYear);
  }

  const users = await User.find({ isEmailVerified: true, isActive: true });
  const insertedEntries = [];
  for (const user of users) {
    const currentYear = await createFinancialYear(user._id + EmptyValue, year);
    const [prevMonth, prevYear] = getPreviousMonthYear(month, year);
    const prevYearDataEntry = await createFinancialYear(user._id + EmptyValue, prevYear);

    const lastEntry = await FinancialEntry.findOne({
      yearId: prevYearDataEntry?._id,
      month: prevMonth,
    });

    const loanTaken = 0;
    const collection = lastEntry?.collection || 0;
    const instalment = lastEntry?.instalment || 0;
    const fine = lastEntry?.fine || 0;

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

    insertedEntries.push(newEntry);
  }

  return res.status(StatusCode.OK).json(
    new ApiResponse(
      StatusCode.OK,
      {
        count: insertedEntries.length,
      },
      `${successMessages.autoInsertEntry}${month} ${year}`,
    ),
  );
});

export {
  getPendingApprovals,
  approveUserRequest,
  deleteUserRequest,
  getUsersWithFinancialDataPerMonthPerYear,
  insertEntry,
  editEntry,
  getLoanTakenUsersInGivenMonthYear,
  depositSocietyForUser,
  autoInsertEntriesForMonthYear,
};
