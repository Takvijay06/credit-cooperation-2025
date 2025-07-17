import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRouter from "./routes/admin.route.js";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { Routes } from "./routes/config.js";
import { publicFolderPath } from "./common/constant.js";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicFolderPath));
app.use(cookieParser());

app.use(Routes.auth.baseUrl, authRouter);
app.use(Routes.admin.baseUrl, adminRouter);
app.use(Routes.user.baseUrl, userRouter);

app.use(errorHandler);

export { app };
