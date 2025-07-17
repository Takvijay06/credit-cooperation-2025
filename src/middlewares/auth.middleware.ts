import jwt, { JwtPayload } from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { EmptyValue, errorMessages, StatusCode } from "../common/constant.js";
import { projectionFields } from "../utils/helper/query.js";

const isUserAuthenticate = asyncHandler(async (req: any, _, next) => {
  const headers = req.headers.authorization;
  if (!headers || !headers.startsWith("Bearer ")) {
    throw new ApiError(StatusCode.UNAUTHORIZED, errorMessages.noTokenProvided);
  }
  const token = headers.replace("Bearer ", "").trim();
  const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;
  const user = await User.findById(decodedToken?.id).select(projectionFields.excludePassword);
  if (!user) {
    throw new ApiError(StatusCode.UNAUTHORIZED, errorMessages.invalidToken);
  }
  req.body.user = user;
  next();
});

export { isUserAuthenticate };
