import { Router } from "express";
import { Routes } from "./config";
import { registerUser, userLogin, verifyEmail } from "../controllers/auth.controller.js";
const { register, login, verifyOtp } = Routes.auth.path;

const router = Router();
router.route(register).post(registerUser);
router.route(login).post(userLogin);
router.route(verifyOtp).patch(verifyEmail);

export default router;
