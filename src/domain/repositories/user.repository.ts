import { CreateUserInput, User, UserSummary } from "../entities/user.entity.js";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findBySerialNumber(serialNumber: number): Promise<User | null>;
  findBySerialNumberOrEmail(serialNumber: number, email: string): Promise<User | null>;
  findPendingApprovals(): Promise<UserSummary[]>;
  findVerifiedUsers(): Promise<User[]>;
  findVerifiedActiveUsers(): Promise<User[]>;
  create(data: CreateUserInput & { password: string }): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  updateBySerialNumber(
    serialNumber: number,
    filter: { isActive: boolean; isEmailVerified: boolean },
    data: Partial<User>,
  ): Promise<User | null>;
}
