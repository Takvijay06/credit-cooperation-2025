import { errorMessages } from "../common/constant";

class ApiError extends Error {
  statusCode: number;
  data: null;
  success: boolean;
  errors: any[];

  constructor(
    statusCode: number,
    message: string = errorMessages.somethingWentWrong,
    errors: any[] = [],
    stack: string = errorMessages.emptyString,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
