import { months } from "../../common/constant.js";

export const getPreviousMonthYear = (month: string, year: number): [string, number] => {
  const index = months.indexOf(month);
  if (index === -1) throw new Error("Invalid month name");

  if (index === 0) {
    return [months[11], year - 1];
  }

  return [months[index - 1], year];
};

export const generateDigitOTP = (length = 4): number => {
  const thousandValue = Math.pow(10, length - 1);
  return Math.floor(thousandValue + Math.random() * 9 * thousandValue);
};
