import { FinancialYear } from "../entities/financial-year.entity.js";

export interface IFinancialYearRepository {
  findByUserAndYear(userId: string, year: number): Promise<FinancialYear | null>;
  findOrCreate(userId: string, year: number): Promise<FinancialYear>;
}
