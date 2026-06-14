import { EntryStatus, errorMessages, StatusCode, successMessages } from "../common/constant.js";
import { financialEntryService, userService } from "../container.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  validateInsertEntryInput,
  validateYearMonthParams,
} from "../utils/validations/admin.validate.js";

const getPendingApprovals = asyncHandler(async (_, res) => {
  const pendingApprovalUsers = await userService.getPendingApprovals();
  return res
    .status(StatusCode.OK)
    .json(
      new ApiResponse(StatusCode.OK, pendingApprovalUsers, successMessages.userPendingRequests),
    );
});

const approveUserRequest = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const pendingUsers = await userService.approveUser(Number(userId));

  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, pendingUsers, successMessages.userVerifiedByAdmin));
});

const deleteUserRequest = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const pendingUsers = await userService.rejectUser(Number(userId));

  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, pendingUsers, successMessages.userVerifiedByAdmin));
});

const getUsersWithFinancialDataPerMonthPerYear = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const { month: validMonth, year: validYear } = validateYearMonthParams(month, year);

  const entries = await financialEntryService.getUsersFinancialDataForMonthYear(
    validMonth,
    validYear,
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

  const entries = await financialEntryService.getLoanTakenUsersForMonthYear(validMonth, validYear);
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

  const result = await financialEntryService.insertEntry({
    serialNumber,
    year,
    month,
    loanTaken,
    collection,
    fine,
    instalment,
  });

  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, result, successMessages.entryInserted));
});

const editEntry = asyncHandler(async (req, res) => {
  const { serialNumber, year, month, collection, loanTaken, fine, instalment } = req.body;

  validateInsertEntryInput(serialNumber, year, month);

  const result = await financialEntryService.editEntry({
    serialNumber,
    year,
    month,
    collection,
    loanTaken,
    fine,
    instalment,
  });

  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, result, successMessages.entryUpdated));
});

const depositSocietyForUser = asyncHandler(async (req, res) => {
  const { serialNumber, year, month } = req.body;
  validateInsertEntryInput(serialNumber, year, month);

  const result = await financialEntryService.depositSocietyForUser({ serialNumber, year, month });

  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, result, successMessages.societyDeposit));
});

const autoInsertEntriesForMonthYear = asyncHandler(async (req, res) => {
  const { year, month } = req.body;

  if (!year || !month) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.InvalidMonthAndYear);
  }

  const result = await financialEntryService.autoInsertEntriesForMonthYear(year, month);

  return res.status(StatusCode.OK).json(
    new ApiResponse(
      StatusCode.OK,
      result,
      `${successMessages.autoInsertEntry}${month} ${year}`,
    ),
  );
});

const freezeEntriesForMonthYear = asyncHandler(async (req, res) => {
  const { year, month } = req.body;

  if (!year || !month) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.InvalidMonthAndYear);
  }

  const result = await financialEntryService.freezeEntriesForMonthYear(year, month);

  return res
    .status(StatusCode.OK)
    .json(
      new ApiResponse(
        StatusCode.OK,
        result,
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
  freezeEntriesForMonthYear,
};
