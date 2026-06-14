import { PrismaClient } from "@prisma/client";
import { EntryStatus, months } from "../../common/constant.js";
import {
  CreateFinancialEntryInput,
  FinancialEntry,
  FinancialEntryWithUser,
  LoanTakenUserSummary,
  UpdateFinancialEntryInput,
} from "../../domain/entities/financial-entry.entity.js";
import { IFinancialEntryRepository } from "../../domain/repositories/financial-entry.repository.js";

const mapEntry = (entry: {
  id: string;
  yearId: string;
  month: string;
  loanTaken: number;
  collection: number;
  fine: number;
  interest: number | null;
  instalment: number;
  total: number;
  pendingLoan: number;
  status: string;
  isFreezed: boolean;
}): FinancialEntry => ({
  id: entry.id,
  yearId: entry.yearId,
  month: entry.month,
  loanTaken: entry.loanTaken,
  collection: entry.collection,
  fine: entry.fine,
  interest: entry.interest,
  instalment: entry.instalment,
  total: entry.total,
  pendingLoan: entry.pendingLoan,
  status: entry.status as EntryStatus,
  isFreezed: entry.isFreezed,
});

const mapEntryWithUser = (
  entry: {
    month: string;
    loanTaken: number;
    collection: number;
    fine: number;
    interest: number | null;
    instalment: number;
    total: number;
    pendingLoan: number;
    status: string;
    isFreezed: boolean;
    year: { year: number; user: { fullName: string; serialNumber: number } };
  },
  includeYear = false,
): FinancialEntryWithUser => ({
  month: entry.month,
  loanTaken: entry.loanTaken,
  collection: entry.collection,
  fine: entry.fine,
  interest: entry.interest,
  instalment: entry.instalment,
  total: entry.total,
  pendingLoan: entry.pendingLoan,
  status: entry.status as EntryStatus,
  isFreezed: entry.isFreezed,
  fullName: entry.year.user.fullName,
  serialNumber: entry.year.user.serialNumber,
  ...(includeYear ? { year: entry.year.year } : {}),
});

export class PrismaFinancialEntryRepository implements IFinancialEntryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByYearAndMonth(yearId: string, month: string): Promise<FinancialEntry | null> {
    const entry = await this.prisma.financialEntry.findUnique({
      where: { yearId_month: { yearId, month } },
    });
    return entry ? mapEntry(entry) : null;
  }

  async findLastByYearId(yearId: string): Promise<FinancialEntry | null> {
    const entries = await this.prisma.financialEntry.findMany({
      where: { yearId },
    });

    if (!entries.length) return null;

    const sorted = entries.sort(
      (a, b) => months.indexOf(b.month) - months.indexOf(a.month),
    );
    return mapEntry(sorted[0]);
  }

  async findByMonthAndYearWithUsers(
    month: string,
    year: number,
  ): Promise<FinancialEntryWithUser[]> {
    const entries = await this.prisma.financialEntry.findMany({
      where: { month, year: { year } },
      include: { year: { include: { user: { select: { fullName: true, serialNumber: true } } } } },
    });
    return entries.map((entry) => mapEntryWithUser(entry));
  }

  async findLoanTakenByMonthAndYear(
    month: string,
    year: number,
  ): Promise<LoanTakenUserSummary[]> {
    const entries = await this.prisma.financialEntry.findMany({
      where: { month, year: { year }, loanTaken: { gt: 0 } },
      include: { year: { include: { user: { select: { fullName: true, serialNumber: true } } } } },
    });
    return entries.map((entry) => ({
      serialNumber: entry.year.user.serialNumber,
      fullName: entry.year.user.fullName,
      loanTaken: entry.loanTaken,
    }));
  }

  async findByUserAndYear(userId: string, year: number): Promise<FinancialEntryWithUser[]> {
    const entries = await this.prisma.financialEntry.findMany({
      where: { year: { userId, year } },
      include: { year: { include: { user: { select: { fullName: true, serialNumber: true } } } } },
    });
    return entries.map((entry) => mapEntryWithUser(entry, true));
  }

  async create(data: CreateFinancialEntryInput): Promise<FinancialEntry> {
    const entry = await this.prisma.financialEntry.create({ data });
    return mapEntry(entry);
  }

  async update(
    yearId: string,
    month: string,
    data: UpdateFinancialEntryInput,
  ): Promise<FinancialEntry> {
    const entry = await this.prisma.financialEntry.update({
      where: { yearId_month: { yearId, month } },
      data: {
        collection: data.collection,
        loanTaken: data.loanTaken,
        fine: data.fine,
        instalment: data.instalment,
        total: data.total,
        pendingLoan: data.pendingLoan,
        status: data.status,
        isFreezed: data.isFreezed,
      },
    });
    return mapEntry(entry);
  }
}
