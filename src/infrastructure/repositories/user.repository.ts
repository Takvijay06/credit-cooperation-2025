import { PrismaClient } from "@prisma/client";
import { CreateUserInput, User, UserSummary } from "../../domain/entities/user.entity.js";
import { IUserRepository } from "../../domain/repositories/user.repository.js";
import { mapUser, pendingUserFilter } from "../prisma/mappers.js";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? mapUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? mapUser(user) : null;
  }

  async findBySerialNumber(serialNumber: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { serialNumber } });
    return user ? mapUser(user) : null;
  }

  async findBySerialNumberOrEmail(serialNumber: number, email: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ serialNumber }, { email }] },
    });
    return user ? mapUser(user) : null;
  }

  async findPendingApprovals(): Promise<UserSummary[]> {
    return this.prisma.user.findMany({
      where: pendingUserFilter,
      select: { fullName: true, email: true, serialNumber: true },
    });
  }

  async findVerifiedUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany({ where: { isEmailVerified: true } });
    return users.map(mapUser);
  }

  async findVerifiedActiveUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { isEmailVerified: true, isActive: true },
    });
    return users.map(mapUser);
  }

  async create(data: CreateUserInput & { password: string }): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        serialNumber: Number(data.serialNumber),
        otp: data.otp,
        phoneNumber:
          data.phoneNumber !== undefined && data.phoneNumber !== null
            ? String(data.phoneNumber)
            : undefined,
        emergencyPerson: data.emergencyPerson,
        emergencyContact:
          data.emergencyContact !== undefined && data.emergencyContact !== null
            ? String(data.emergencyContact)
            : undefined,
      },
    });
    return mapUser(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
        phoneNumber:
          data.phoneNumber !== undefined && data.phoneNumber !== null
            ? String(data.phoneNumber)
            : data.phoneNumber,
        isEmailVerified: data.isEmailVerified,
        otp: data.otp,
        isActive: data.isActive,
        emergencyPerson: data.emergencyPerson,
        emergencyContact:
          data.emergencyContact !== undefined && data.emergencyContact !== null
            ? String(data.emergencyContact)
            : data.emergencyContact,
        accessToken: data.accessToken,
      },
    });
    return mapUser(user);
  }

  async updateBySerialNumber(
    serialNumber: number,
    filter: { isActive: boolean; isEmailVerified: boolean },
    data: Partial<User>,
  ): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        serialNumber,
        isActive: filter.isActive,
        isEmailVerified: filter.isEmailVerified,
      },
    });

    if (!user) return null;

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: data.isActive,
        isEmailVerified: data.isEmailVerified,
      },
    });
    return mapUser(updated);
  }
}
