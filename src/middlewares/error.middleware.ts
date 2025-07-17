import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { errorMessages, StatusCode } from "../common/constant.js";
import pkg from "jsonwebtoken";

const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
  console.error("Caught error:", err);

  const { JsonWebTokenError, TokenExpiredError } = pkg;

  if (err instanceof ApiError) {
    res.status(err.statusCode).json(new ApiResponse(err.statusCode, null, err.message));
  } else if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
    res
      .status(StatusCode.UNAUTHORIZED)
      .json(new ApiResponse(StatusCode.UNAUTHORIZED, null, err.message));
  } else {
    res
      .status(StatusCode.INTERNALSERVERERROR)
      .json(
        new ApiResponse(StatusCode.INTERNALSERVERERROR, null, errorMessages.somethingWentWrong),
      );
  }
};

export { errorHandler };
