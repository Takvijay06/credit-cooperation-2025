import { role, StatusCode, successMessages } from "../common/constant.js";
import { financialEntryService, userService } from "../container.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateFinancialDataRequest } from "../utils/validations/admin.validate.js";

const getUserFinanialDataForYear = asyncHandler(async (req, res) => {
  const currentUser = req.user!;
  const { year, serialNumber: querySerial } = req.query;

  const serialNumber =
    currentUser.role === role.ADMIN
      ? (typeof querySerial === "string" ? querySerial : undefined)
      : currentUser.role === role.USER
        ? String(currentUser.serialNumber)
        : undefined;

  const parsedYear = validateFinancialDataRequest(serialNumber, year);
  const user = await userService.findBySerialNumber(Number(serialNumber));

  const entries = await financialEntryService.getUserFinancialDataForYear(user.id, parsedYear);

  return res
    .status(StatusCode.OK)
    .json(
      new ApiResponse(StatusCode.OK, { entries }, successMessages.userFinancialDataPerYear),
    );
});

export { getUserFinanialDataForYear };
