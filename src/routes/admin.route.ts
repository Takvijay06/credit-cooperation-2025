import { isAdmin } from "../middlewares/admin.middleware";
import { Router } from "express";
import { Routes } from "./config.js";
import {
  getPendingApprovals,
  approveUserRequest,
  getUsersWithFinancialDataPerMonthPerYear,
  getLoanTakenUsersInGivenMonthYear,
  insertEntry,
  deleteUserRequest,
} from "../controllers/admin.controller.js";
import { isUserAuthenticate } from "../middlewares/auth.middleware.js";
const { approvalRequest, approveRequest, financialEntry, usersWithLoan, deleteRequest } =
  Routes.admin.path;

const router = Router();

router.route(approvalRequest).get(isUserAuthenticate, isAdmin, getPendingApprovals);
router.route(approveRequest).put(isUserAuthenticate, isAdmin, approveUserRequest);
router.route(deleteRequest).put(isUserAuthenticate, isAdmin, deleteUserRequest);
router
  .route(financialEntry)
  .get(isUserAuthenticate, isAdmin, getUsersWithFinancialDataPerMonthPerYear);
router.route(usersWithLoan).get(isUserAuthenticate, isAdmin, getLoanTakenUsersInGivenMonthYear);
router.route(financialEntry).post(isUserAuthenticate, isAdmin, insertEntry);

export default router;
