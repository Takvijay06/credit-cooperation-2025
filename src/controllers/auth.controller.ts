import {
  EmptyValue,
  errorMessages,
  otpLength,
  StatusCode,
  successMessages,
} from "../common/constant.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  checkIfUserExists,
  findUserByEmail,
  generateDigitOTP,
  sendOtpEmail,
} from "../utils/helper/index.js";
import { projectionFields } from "../utils/helper/query.js";
import {
  checkUserExistAndStatus,
  validateLoginFields,
  validateOtp,
  validateRegistrationFields,
  validateUserCredentials,
  validateUserStatus,
  validateVerifyEmailInput,
} from "../utils/validations/auth.validate.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, serialNumber, password } = req.body;
  validateRegistrationFields({ fullName, email, password });

  const isUserExists = await checkIfUserExists({ serialNumber, email });
  if (isUserExists) {
    throw new ApiError(StatusCode.CONFLICTS, errorMessages.userAlreadyExist);
  }

  const otp = generateDigitOTP(otpLength);
  const user = await User.create({
    fullName,
    email,
    password,
    serialNumber: serialNumber,
    otp: otp,
  });
  const createdUser = await User.findById(user._id).select(projectionFields.registerUser);

  if (!createdUser) {
    throw new ApiError(
      StatusCode.INTERNALSERVERERROR,
      errorMessages.somethingWentWrong + errorMessages.whileRegistering,
    );
  }
  await sendOtpEmail(email, otp);

  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, createdUser, successMessages.registered));
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  validateLoginFields(email, password);

  const user = await findUserByEmail(email);

  await validateUserCredentials(user, password);
  validateUserStatus(user);

  const token = user.generateAccessToken();

  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, { token }, successMessages.login));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  validateVerifyEmailInput(email, otp);

  const user = await checkUserExistAndStatus(email);

  if (user.isEmailVerified) {
    return res
      .status(StatusCode.OK)
      .json(new ApiResponse(StatusCode.OK, successMessages.userAlreadyVerified));
  }

  validateOtp(otp, user.otp ?? EmptyValue);

  user.isEmailVerified = true;
  user.otp = undefined;
  await user.save();

  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, successMessages.userVerified));
});

export { registerUser, userLogin, verifyEmail };
