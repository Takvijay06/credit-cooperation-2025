import { errorMessages, months, StatusCode } from "../../common/constant.js";
import { ApiError } from "../ApiError.js";

export const validateYearMonthParams = (
  month: unknown,
  year: unknown,
): { month: string; year: number } => {
  const parsedMonth = typeof month === "string" ? month : null;
  const parsedYear = typeof year === "string" ? parseInt(year, 10) : null;

  if (!parsedMonth || !parsedYear || isNaN(parsedYear)) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.InvalidMonthAndYear);
  }

  return { month: parsedMonth, year: parsedYear };
};

export const validateInsertEntryInput = (serialNumber: unknown, year: unknown, month: unknown) => {
  if (!serialNumber || !year || !month) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.allFieldRequired);
  }

  const isValidYear = typeof year === "number" && year >= 2000 && year <= 2100;
  if (!isValidYear) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.invalidYear);
  }

  if (typeof month !== "string" || !months.includes(month)) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.invalidMonth);
  }
};
