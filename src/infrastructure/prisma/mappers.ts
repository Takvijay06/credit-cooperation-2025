import { User as PrismaUser } from "@prisma/client";
import { EntryStatus, role } from "../../common/constant.js";
import { User, UserRole } from "../../domain/entities/user.entity.js";

export const mapUser = (user: PrismaUser): User => ({
  id: user.id,
  serialNumber: user.serialNumber,
  email: user.email,
  fullName: user.fullName,
  password: user.password,
  role: user.role as UserRole,
  phoneNumber: user.phoneNumber,
  isEmailVerified: user.isEmailVerified,
  otp: user.otp,
  isActive: user.isActive,
  emergencyPerson: user.emergencyPerson,
  emergencyContact: user.emergencyContact,
  accessToken: user.accessToken,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const toPublicUser = (user: User) => {
  const { password: _password, accessToken: _accessToken, ...publicUser } = user;
  return publicUser;
};

export const pendingUserFilter = {
  isEmailVerified: true,
  role: role.USER,
  isActive: false,
};
