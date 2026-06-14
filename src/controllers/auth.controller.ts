import { StatusCode, successMessages } from "../common/constant.js";
import { authService } from "../container.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    serialNumber,
    password,
    phoneNumber,
    emergencyPerson,
    emergencyContact,
  } = req.body;

  const createdUser = await authService.register({
    fullName,
    email,
    serialNumber,
    password,
    phoneNumber,
    emergencyPerson,
    emergencyContact,
  });

  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, createdUser, successMessages.registered));
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { token } = await authService.login(email, password);

  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, { token }, successMessages.login));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const { alreadyVerified } = await authService.verifyEmail(email, otp);

  if (alreadyVerified) {
    return res
      .status(StatusCode.OK)
      .json(new ApiResponse(StatusCode.OK, successMessages.userAlreadyVerified));
  }

  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, successMessages.userVerified));
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.resendOtp(email);

  return res
    .status(StatusCode.OK)
    .json(new ApiResponse(StatusCode.OK, null, successMessages.otpResent));
});

export { registerUser, userLogin, verifyEmail, resendOtp };
