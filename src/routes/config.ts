export const Routes = {
  auth: {
    baseUrl: "/api/v1/auth",
    path: {
      register: "/register",
      login: "/login",
      verifyOtp: "/verify-otp",
    },
  },
  admin: {
    baseUrl: "/api/v1/admin",
    path: {
      approvalRequest: "/pending-approvals",
      approveRequest: "/approve/:userId",
      deleteRequest: "/delete/:userId",
      financialEntry: "/financial-entry",
      usersWithLoan: "/loan-users",
    },
  },
  user: {
    baseUrl: "/api/v1/user",
    path: {
      financialEntry: "/financial-entry",
    },
  },
};
