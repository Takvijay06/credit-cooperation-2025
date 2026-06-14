import { role } from "../../common/constant.js";

export type UserRole = role.USER | role.ADMIN;

export interface User {
  id: string;
  serialNumber: number;
  email: string;
  fullName: string;
  password: string;
  role: UserRole;
  phoneNumber?: string | null;
  isEmailVerified: boolean;
  otp?: number | null;
  isActive: boolean;
  emergencyPerson?: string | null;
  emergencyContact?: string | null;
  accessToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSummary {
  fullName: string;
  email: string;
  serialNumber: number;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  serialNumber: number;
  otp?: number;
  phoneNumber?: string | number;
  emergencyPerson?: string;
  emergencyContact?: string | number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  serialNumber: number;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
}

export interface PublicUser extends Omit<User, "password" | "accessToken"> {}
