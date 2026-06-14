import { Router } from "express";
import { Routes } from "./config.js";
import { registerUser, userLogin, verifyEmail, resendOtp } from "../controllers/auth.controller.js";
const { register, login, verifyOtp, resendOtp: resendOtpPath } = Routes.auth.path;

const router = Router();
router.route(register).post(registerUser);
router.route(login).post(userLogin);
router.route(verifyOtp).patch(verifyEmail);
router.route(resendOtpPath).post(resendOtp);

export default router;
