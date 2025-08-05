export const errorMessages = {
  somethingWentWrong: "Something went wrong",
  success: "Success",
  emptyString: "",
  allFieldRequired: "All fields are required",
  userAlreadyExist: "User with email or username already exists",
  whileRegistering: " while registering the user",
  userNotExist: "User not found",
  credentialsInvalid: " Incorrect credentials",
  noTokenProvided: "Unauthorized request, please provide a valid token",
  invalidToken: "Invalid token",
  invalidYear: "Invalid year",
  invalidMonth: "Invalid month name",
  imcompleteOtp: "Please enter complete otp",
  incorrectOtp: "Incorrect otp",
  accessDenied: "Access denied",
  emailNotVerified: "Email Not verified",
  userNotActive: "Inactive user",
  userNotExistWithRequest: "User not found with approval request",
  InvalidMonthAndYear: "Invalid month or year parameter",
  alreadyEntryFound: "Entry already exists for ",
  entryNotFound:"Entry not found for "
};

export const successMessages = {
  registered: "User registered Successfully",
  login: "User logged in Successfully",
  userVerified: "User verified !!!",
  userAlreadyVerified: "User already verified !!!",
  userPendingRequests: "Users with pending approvals",
  userVerifiedByAdmin: "User verified, now you can login !!!",
  entryInserted: "Entry inserted !!!",
  entryUpdated: "Entry updated !!!",
  userFinancialDataPerMonthPerYear: "Users Financial Data Per Month Per Year fetched !!!",
  loanTakenUsersforMonthYear: "Users with loan taken for Month Per Year fetched !!!",
  userFinancialDataPerYear: "Users Financial Data Year fetched !!!",
  societyDeposit: "Society deposit for given user!!!",
  autoInsertEntry:"Auto entries inserted for "
};

export const emailMessages = {
  subject: "Verify your email with OTP",
  getText: (otp: number) => `Your OTP is ${otp}`,
  otpField: "{{OTP}}",
};

export enum StatusCode {
  NOTFOUND = 404,
  BADREQUEST = 400,
  UNAUTHORIZED = 401,
  INTERNALSERVERERROR = 500,
  CONFLICTS = 409,
  FORBIDDEN = 403,
  OK = 200,
}

export enum role {
  USER = "user",
  ADMIN = "admin",
}

export enum EntryStatus {
  PENDING = "pending",
  DEPOSIT = "deposit"
}

export const publicFolderPath = "public";
export const envPath = "./.env";
export const EmptyValue = "";
export const otpLength = 4;
export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const authHeader = {
  bearer: "Bearer ",
};
