import { Router } from "express";
import { isUserAuthenticate } from "../middlewares/auth.middleware";
import { Routes } from "./config";
import { getUserFinanialDataForYear } from "../controllers/user.controller";
const { financialEntry } = Routes.user.path;

const router = Router();
router.route(financialEntry).get(isUserAuthenticate,getUserFinanialDataForYear);

export default router;
