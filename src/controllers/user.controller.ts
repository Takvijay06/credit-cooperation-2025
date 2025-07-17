import { EmptyValue, successMessages } from "../common/constant";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { FinancialEntry } from "../models/financialEntry.model";
import { validateFinancialDataRequest } from "../utils/validations/auth.validate";
import { role } from "../common/interface";
import { createFinancialYear, findUserBySerialNumber } from "../utils/helper";
import { buildSingleUserFinancialDataPipeline } from "../utils/helper/query";

const getUserFinanialDataForYear = asyncHandler(async (req, res) => {
  const { user: currentUser } = req.body;
  const { year, serialNumber: querySerial } = req.query;

  const serialNumber =
    currentUser.role === role.ADMIN
      ? querySerial
      : currentUser.role === role.USER
        ? currentUser.serialNumber
        : undefined;

  const parsedYear = validateFinancialDataRequest(serialNumber, year);

  const user = await findUserBySerialNumber(serialNumber);
  
  const entries = await FinancialEntry.aggregate(
    buildSingleUserFinancialDataPipeline(user._id, parsedYear),
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { entries }, successMessages.userFinancialDataPerYear));
});

export { getUserFinanialDataForYear };
