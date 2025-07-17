import {
  emailMessages,
  EmptyValue,
  errorMessages,
  months,
  otpLength,
  StatusCode,
} from "../../common/constant";
import { FinancialEntry } from "../../models/financialEntry.model";
import { FinancialYear } from "../../models/financialYear.model";
import { User } from "../../models/user.model";
import { ApiError } from "../ApiError";
import { html, sendMail } from "../services/sendMail";

export const generateDigitOTP = (number = otpLength) => {
  const thousandValue = Math.pow(10, number - 1);
  return Math.floor(thousandValue + Math.random() * 9 * thousandValue);
};

export const checkIfUserExists = async ({
  serialNumber,
  email,
}: {
  serialNumber: string;
  email: string;
}) => {
  return await User.findOne({ $or: [{ serialNumber }, { email }] });
};

export const findUserByEmail = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.userNotExist);
  }
  return user;
};

export const findUserBySerialNumber = async (serialNumber: number) => {
  const user = await User.findOne({ serialNumber });
  if (!user) {
    throw new ApiError(StatusCode.BADREQUEST, errorMessages.userNotExist);
  }
  return user;
};

export const sendOtpEmail = async (email: string, otp: number) => {
  await sendMail({
    to: email,
    subject: emailMessages.subject,
    text: emailMessages.getText(otp),
    html: html.replace(emailMessages.otpField, otp + EmptyValue),
  });
};

export const createFinancialYear = async (userId: string, year: number) => {
  let financialEntryForUser = await FinancialYear.findOne({ userId, year });
  if (!financialEntryForUser) {
    financialEntryForUser = await FinancialYear.create({ userId, year });
  }
  return financialEntryForUser;
};

export const getLastPendingLoan = async (userId: string, year: number, month: string) => {
  const isFirstMonth = month === months[0];
  const lookupYear = isFirstMonth ? year - 1 : year;

  const prevYear = await FinancialYear.findOne({ userId, year: lookupYear });
  if (!prevYear) return 0;

  const previousEntry = await FinancialEntry.find({ yearId: prevYear._id })
    .sort({ _id: -1 })
    .limit(1);

  return previousEntry.length ? previousEntry[0].pendingLoan : 0;
};
