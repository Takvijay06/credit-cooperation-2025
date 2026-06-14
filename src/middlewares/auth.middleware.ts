import { errorMessages, StatusCode } from "../common/constant.js";
import { authService } from "../container.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const isUserAuthenticate = asyncHandler(async (req, _, next) => {
  const headers = req.headers.authorization;
  if (!headers || !headers.startsWith("Bearer ")) {
    throw new ApiError(StatusCode.UNAUTHORIZED, errorMessages.noTokenProvided);
  }

  const token = headers.replace("Bearer ", "").trim();
  req.user = await authService.getAuthenticatedUser(token);
  next();
});

export { isUserAuthenticate };
