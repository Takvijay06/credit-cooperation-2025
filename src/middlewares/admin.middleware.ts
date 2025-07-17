import { NextFunction } from "express";
import { errorMessages, role, StatusCode } from "../common/constant";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

const isAdmin = asyncHandler(async (req: any, _, next: NextFunction) => {
  if (req.body?.user?.role !== role.ADMIN) {
    throw new ApiError(StatusCode.UNAUTHORIZED, errorMessages.accessDenied);
  }
  next();
});

export { isAdmin };
