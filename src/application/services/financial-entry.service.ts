import { EntryStatus, errorMessages, months, StatusCode } from "../../common/constant.js";
import {
  FinancialEntry,
  FinancialEntryWithUser,
  LoanTakenUserSummary,
} from "../../domain/entities/financial-entry.entity.js";
import { IFinancialEntryRepository } from "../../domain/repositories/financial-entry.repository.js";
import { IFinancialYearRepository } from "../../domain/repositories/financial-year.repository.js";
import { IUserRepository } from "../../domain/repositories/user.repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { FinancialCalculator } from "../financial/calculator.js";
import { getPreviousMonthYear } from "../utils/date.utils.js";

const DEFAULT_COLLECTION = Number(process.env.DEFAULT_COLLECTION ?? 1000);

export class FinancialEntryService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly financialYearRepository: IFinancialYearRepository,
    private readonly financialEntryRepository: IFinancialEntryRepository,
    private readonly calculator: FinancialCalculator,
  ) {}

  async getUsersFinancialDataForMonthYear(
    month: string,
    year: number,
  ): Promise<FinancialEntryWithUser[]> {
    return this.financialEntryRepository.findByMonthAndYearWithUsers(month, year);
  }

  async getLoanTakenUsersForMonthYear(
    month: string,
    year: number,
  ): Promise<LoanTakenUserSummary[]> {
    return this.financialEntryRepository.findLoanTakenByMonthAndYear(month, year);
  }

  async getUserFinancialDataForYear(
    userId: string,
    year: number,
  ): Promise<FinancialEntryWithUser[]> {
    return this.financialEntryRepository.findByUserAndYear(userId, year);
  }

  async insertEntry(input: {
    serialNumber: number;
    year: number;
    month: string;
    loanTaken?: number;
    collection?: number;
    fine?: number;
    instalment?: number;
  }): Promise<{ newEntry: FinancialEntry }> {
    const user = await this.userRepository.findBySerialNumber(input.serialNumber);
    if (!user) {
      throw new ApiError(StatusCode.NOTFOUND, errorMessages.userNotExist);
    }

    const currentYear = await this.financialYearRepository.findOrCreate(user.id, input.year);

    const existingEntry = await this.financialEntryRepository.findByYearAndMonth(
      currentYear.id,
      input.month,
    );
    if (existingEntry) {
      throw new ApiError(
        StatusCode.CONFLICTS,
        errorMessages.alreadyEntryFound + `${input.month} ${input.year}`,
      );
    }

    const loanTaken = input.loanTaken ?? 0;
    const collection = input.collection ?? 0;
    const fine = input.fine ?? 0;
    const instalment = input.instalment ?? 0;

    const lastPending = await this.getLastPendingLoan(user.id, input.year, input.month);
    const interest = this.calculator.computeInterest(lastPending);
    const total = this.calculator.computeTotal(collection, interest, instalment, fine);
    const pendingLoan = this.calculator.computePendingLoan(lastPending, loanTaken, instalment);

    const newEntry = await this.financialEntryRepository.create({
      yearId: currentYear.id,
      month: input.month,
      loanTaken,
      collection,
      fine,
      interest,
      instalment,
      total,
      pendingLoan,
    });

    return { newEntry };
  }

  async editEntry(input: {
    serialNumber: number;
    year: number;
    month: string;
    collection?: number;
    loanTaken?: number;
    fine?: number;
    instalment?: number;
  }): Promise<{ updatedEntry: FinancialEntry }> {
    const user = await this.userRepository.findBySerialNumber(input.serialNumber);
    if (!user) {
      throw new ApiError(StatusCode.NOTFOUND, errorMessages.userNotExist);
    }

    const currentYear = await this.financialYearRepository.findOrCreate(user.id, input.year);

    const existingEntry = await this.financialEntryRepository.findByYearAndMonth(
      currentYear.id,
      input.month,
    );
    if (!existingEntry) {
      throw new ApiError(
        StatusCode.NOTFOUND,
        errorMessages.entryNotFound + `${input.month} ${input.year}`,
      );
    }

    const updateFields: {
      collection?: number;
      loanTaken?: number;
      fine?: number;
      instalment?: number;
      total?: number;
      pendingLoan?: number;
    } = {};

    const basePendingLoan = Number(existingEntry.pendingLoan);
    const baseCollection = Number(existingEntry.collection);
    updateFields.pendingLoan = basePendingLoan;
    updateFields.collection = baseCollection;

    if (input.collection !== undefined && input.collection !== baseCollection) {
      updateFields.collection = input.collection;
    }
    if (input.loanTaken !== undefined) {
      updateFields.loanTaken = input.loanTaken;
      updateFields.pendingLoan =
        updateFields.pendingLoan - Number(existingEntry.loanTaken - input.loanTaken);
    }
    if (input.fine !== undefined) updateFields.fine = input.fine;
    if (input.instalment !== undefined) updateFields.instalment = input.instalment;

    if (input.instalment !== undefined && input.fine !== undefined) {
      updateFields.total =
        input.instalment + input.fine + updateFields.collection + Number(existingEntry.interest);
      updateFields.pendingLoan =
        updateFields.pendingLoan + Number(existingEntry.instalment) - input.instalment;
    } else if (input.instalment !== undefined) {
      updateFields.pendingLoan =
        updateFields.pendingLoan + Number(existingEntry.instalment) - input.instalment;
      updateFields.total =
        input.instalment +
        Number(existingEntry.fine) +
        updateFields.collection +
        Number(existingEntry.interest);
    } else if (input.fine !== undefined) {
      updateFields.total =
        Number(existingEntry.instalment) +
        input.fine +
        updateFields.collection +
        Number(existingEntry.interest);
    } else if (input.collection !== undefined) {
      updateFields.total =
        Number(existingEntry.instalment) +
        Number(existingEntry.fine) +
        input.collection +
        Number(existingEntry.interest);
    }

    const updatedEntry = await this.financialEntryRepository.update(
      currentYear.id,
      input.month,
      updateFields,
    );

    return { updatedEntry };
  }

  async depositSocietyForUser(input: {
    serialNumber: number;
    year: number;
    month: string;
  }): Promise<{ updatedEntry: FinancialEntry }> {
    const user = await this.userRepository.findBySerialNumber(input.serialNumber);
    if (!user) {
      throw new ApiError(StatusCode.NOTFOUND, errorMessages.userNotExist);
    }

    const currentYear = await this.financialYearRepository.findOrCreate(user.id, input.year);

    const existingEntry = await this.financialEntryRepository.findByYearAndMonth(
      currentYear.id,
      input.month,
    );
    if (!existingEntry) {
      throw new ApiError(
        StatusCode.NOTFOUND,
        errorMessages.entryNotFound + `${input.month} ${input.year}`,
      );
    }

    const updatedEntry = await this.financialEntryRepository.update(currentYear.id, input.month, {
      status: EntryStatus.DEPOSIT,
    });

    return { updatedEntry };
  }

  async autoInsertEntriesForMonthYear(
    year: number,
    month: string,
  ): Promise<{ count: number }> {
    const users = await this.userRepository.findVerifiedUsers();
    const insertedEntries: FinancialEntry[] = [];

    for (const user of users) {
      const currentYear = await this.financialYearRepository.findOrCreate(user.id, year);
      const existingEntry = await this.financialEntryRepository.findByYearAndMonth(
        currentYear.id,
        month,
      );

      if (existingEntry) continue;

      const [prevMonth, prevYear] = getPreviousMonthYear(month, year);
      const prevYearData = await this.financialYearRepository.findOrCreate(user.id, prevYear);

      const lastEntry = await this.financialEntryRepository.findByYearAndMonth(
        prevYearData.id,
        prevMonth,
      );

      const loanTaken = 0;
      const collection = lastEntry?.collection ?? DEFAULT_COLLECTION;
      const instalment = lastEntry?.instalment || 0;
      const fine = lastEntry?.fine || 0;

      const lastPending = await this.getLastPendingLoan(user.id, year, month);
      const interest = this.calculator.computeInterest(lastPending);
      const total = this.calculator.computeTotal(collection, interest, instalment, fine);
      const pendingLoan = this.calculator.computePendingLoan(lastPending, loanTaken, instalment);

      const newEntry = await this.financialEntryRepository.create({
        yearId: currentYear.id,
        month,
        loanTaken,
        collection,
        fine,
        interest,
        instalment,
        total,
        pendingLoan,
      });

      insertedEntries.push(newEntry);
    }

    return { count: insertedEntries.length };
  }

  async freezeEntriesForMonthYear(year: number, month: string): Promise<{ updatedCount: number }> {
    const users = await this.userRepository.findVerifiedActiveUsers();
    let updatedCount = 0;

    for (const user of users) {
      const yearDoc = await this.financialYearRepository.findOrCreate(user.id, year);
      const entry = await this.financialEntryRepository.findByYearAndMonth(yearDoc.id, month);

      if (entry && !entry.isFreezed) {
        await this.financialEntryRepository.update(yearDoc.id, month, { isFreezed: true });
        updatedCount++;
      }
    }

    return { updatedCount };
  }

  private async getLastPendingLoan(userId: string, year: number, month: string): Promise<number> {
    const isFirstMonth = month === months[0];
    const lookupYear = isFirstMonth ? year - 1 : year;

    const financialYear = await this.financialYearRepository.findByUserAndYear(userId, lookupYear);
    if (!financialYear) return 0;

    const previousEntry = await this.financialEntryRepository.findLastByYearId(financialYear.id);
    return previousEntry?.pendingLoan ?? 0;
  }
}
