import { isAdmin } from "../middlewares/admin.middleware.js";
import { Router } from "express";
import { Routes } from "./config.js";
import {
  getPendingApprovals,
  approveUserRequest,
  getUsersWithFinancialDataPerMonthPerYear,
  getLoanTakenUsersInGivenMonthYear,
  insertEntry,
  deleteUserRequest,
  editEntry,
  depositSocietyForUser,
  autoInsertEntriesForMonthYear,
  freezeEntriesForMonthYear
} from "../controllers/admin.controller.js";
import { isUserAuthenticate } from "../middlewares/auth.middleware.js";
const {
  approvalRequest,
  approveRequest,
  financialEntry,
  usersWithLoan,
  deleteRequest,
  autoFinancialEntry,
  freezeFinancialEntry,
} = Routes.admin.path;

const router = Router();

router.route(approvalRequest).get(isUserAuthenticate, isAdmin, getPendingApprovals);
router.route(approveRequest).put(isUserAuthenticate, isAdmin, approveUserRequest);
router.route(deleteRequest).put(isUserAuthenticate, isAdmin, deleteUserRequest);
router
  .route(financialEntry)
  .get(isUserAuthenticate, isAdmin, getUsersWithFinancialDataPerMonthPerYear);
router.route(usersWithLoan).get(isUserAuthenticate, isAdmin, getLoanTakenUsersInGivenMonthYear);
router.route(financialEntry).post(isUserAuthenticate, isAdmin, insertEntry);
router.route(financialEntry).put(isUserAuthenticate, isAdmin, editEntry);
router.route(financialEntry).patch(isUserAuthenticate, isAdmin, depositSocietyForUser);
router.route(autoFinancialEntry).post(isUserAuthenticate, isAdmin, autoInsertEntriesForMonthYear);
router.route(freezeFinancialEntry).put(isUserAuthenticate, isAdmin, freezeEntriesForMonthYear);

export default router;
