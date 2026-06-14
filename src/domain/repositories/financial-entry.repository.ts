import {
  CreateFinancialEntryInput,
  FinancialEntry,
  FinancialEntryWithUser,
  LoanTakenUserSummary,
  UpdateFinancialEntryInput,
} from "../entities/financial-entry.entity.js";

export interface IFinancialEntryRepository {
  findByYearAndMonth(yearId: string, month: string): Promise<FinancialEntry | null>;
  findLastByYearId(yearId: string): Promise<FinancialEntry | null>;
  findByMonthAndYearWithUsers(month: string, year: number): Promise<FinancialEntryWithUser[]>;
  findLoanTakenByMonthAndYear(month: string, year: number): Promise<LoanTakenUserSummary[]>;
  findByUserAndYear(userId: string, year: number): Promise<FinancialEntryWithUser[]>;
  create(data: CreateFinancialEntryInput): Promise<FinancialEntry>;
  update(yearId: string, month: string, data: UpdateFinancialEntryInput): Promise<FinancialEntry>;
}
