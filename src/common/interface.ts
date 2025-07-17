import { NextFunction } from "express";
import mongoose, { ObjectId } from "mongoose";

export type RequestHandlerType = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export interface IUser extends Document {
  serialNumber: number;
  email: string;
  fullName: string;
  password: string;
  role?: role.USER | role.ADMIN;
  phoneNumber?: number;
  isEmailVerified?: boolean;
  otp?: number;
  isActive?: boolean;
  emergencyPerson?: string;
  emergencyContact?: number;
  accessToken?: string | null;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken: () => string;
}

export enum role {
  USER = "user",
  ADMIN = "admin",
}

export interface IFinancialYear {
  userId: ObjectId;
  year: number;
}
