import { NextFunction } from "express";
import { errorMessages, role, StatusCode } from "../common/constant.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isAdmin = asyncHandler(async (req: any, _, next: NextFunction) => {
  if (req.body?.user?.role !== role.ADMIN) {
    throw new ApiError(StatusCode.UNAUTHORIZED, errorMessages.accessDenied);
  }
  next();
});

export { isAdmin };
