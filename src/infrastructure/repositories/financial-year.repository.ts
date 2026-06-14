import { PrismaClient } from "@prisma/client";
import { FinancialYear } from "../../domain/entities/financial-year.entity.js";
import { IFinancialYearRepository } from "../../domain/repositories/financial-year.repository.js";

export class PrismaFinancialYearRepository implements IFinancialYearRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserAndYear(userId: string, year: number): Promise<FinancialYear | null> {
    const record = await this.prisma.financialYear.findUnique({
      where: { userId_year: { userId, year } },
    });
    return record ? { id: record.id, userId: record.userId, year: record.year } : null;
  }

  async findOrCreate(userId: string, year: number): Promise<FinancialYear> {
    const record = await this.prisma.financialYear.upsert({
      where: { userId_year: { userId, year } },
      update: {},
      create: { userId, year },
    });
    return { id: record.id, userId: record.userId, year: record.year };
  }
}
