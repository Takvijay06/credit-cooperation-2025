import { errorMessages, otpLength, StatusCode } from "../../common/constant.js";
import { ApiError } from "../ApiError.js";

export const validateRegistrationFields = ({
  fullName,
  email,
  password,
}: {
  fullName: string;
  email: string;
  password: string;
}) => {
  if (![fullName, email, password].every((field) => field.trim() !== errorMessages.emptyString)) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.allFieldRequired);
  }
};

export const validateLoginFields = (email: string, password: string) => {
  if (!email || !password) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.allFieldRequired);
  }
};

export const validateVerifyEmailInput = (email: string, otp: string | number): void => {
  if (!email || !otp) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.allFieldRequired);
  }

  const otpStr = String(otp);
  if (otpStr.length !== otpLength) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.imcompleteOtp);
  }
};

export const validateResendOtpInput = (email: string): void => {
  if (!email || !email.trim()) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.allFieldRequired);
  }
};

export const validateOtp = (inputOtp: string | number, storedOtp: string | number): void => {
  if (Number(inputOtp) !== Number(storedOtp)) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.incorrectOtp);
  }
};
