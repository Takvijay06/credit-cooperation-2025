import { Router } from "express";
import { isUserAuthenticate } from "../middlewares/auth.middleware.js";
import { Routes } from "./config";
import { getUserFinanialDataForYear } from "../controllers/user.controller.js";
const { financialEntry } = Routes.user.path;

const router = Router();
router.route(financialEntry).get(isUserAuthenticate,getUserFinanialDataForYear);

export default router;
