import { EmptyValue, successMessages } from "../common/constant.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { FinancialEntry } from "../models/financialEntry.model.js";
import { validateFinancialDataRequest } from "../utils/validations/auth.validate.js";
import { role } from "../common/interface.js";
import { findUserBySerialNumber } from "../utils/helper/index.js";
import { buildSingleUserFinancialDataPipeline } from "../utils/helper/query.js";

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
