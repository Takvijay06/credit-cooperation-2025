import { errorMessages, StatusCode } from "../../common/constant";
import { ApiError } from "../ApiError";

const validateFinancialDataRequest = (serialNumber?: number, year?: unknown): number => {
  if (!serialNumber || !year) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.allFieldRequired);
  }

  const parsedYear = typeof year === "string" ? parseInt(year, 10) : year;

  if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
    throw new ApiError(StatusCode.BADREQUEST, "Invalid year");
  }

  return parsedYear;
};