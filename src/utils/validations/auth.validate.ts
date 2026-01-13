import { errorMessages, otpLength, StatusCode } from "../../common/constant.js";
import { IUser } from "../../common/interface.js";
import { User } from "../../models/user.model.js";
import { ApiError } from "../ApiError.js";
import bcrypt from "bcrypt";

export const validateFinancialDataRequest = (serialNumber: string | undefined, year: any) => {
  if (!serialNumber || !year) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.allFieldRequired);
  }

  const parsedYear = Number(year);

  if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.invalidYear);
  }

  return parsedYear;
};

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

export const validateUserCredentials = async (user: IUser, inputPassword: string) => {
  if (!user) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.userNotExist);
  }

  const isMatch = await bcrypt.compare(inputPassword, user.password);
  if (!isMatch) {
    throw new ApiError(StatusCode.UNAUTHORIZED, errorMessages.credentialsInvalid);
  }
};

export const validateUserStatus = (user: IUser) => {
  if (!user.isActive) {
    throw new ApiError(StatusCode.UNAUTHORIZED, errorMessages.emailNotVerified);
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

export const checkUserExistAndStatus = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.userNotExist);
  }
  return user;
};

export const validateOtp = (inputOtp: string | number, storedOtp: string | number): void => {
  if (Number(inputOtp) !== Number(storedOtp)) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.incorrectOtp);
  }
};
