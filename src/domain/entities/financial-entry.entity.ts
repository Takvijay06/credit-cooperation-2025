import { EntryStatus } from "../../common/constant.js";

export interface FinancialEntry {
  id: string;
  yearId: string;
  month: string;
  loanTaken: number;
  collection: number;
  fine: number;
  interest?: number | null;
  instalment: number;
  total: number;
  pendingLoan: number;
  status: EntryStatus;
  isFreezed: boolean;
}

export interface FinancialEntryWithUser extends Omit<FinancialEntry, "yearId" | "id"> {
  fullName: string;
  serialNumber: number;
  year?: number;
}

export interface LoanTakenUserSummary {
  serialNumber: number;
  fullName: string;
  loanTaken: number;
}

export interface CreateFinancialEntryInput {
  yearId: string;
  month: string;
  loanTaken: number;
  collection: number;
  fine: number;
  interest: number;
  instalment: number;
  total: number;
  pendingLoan: number;
}

export interface UpdateFinancialEntryInput {
  collection?: number;
  loanTaken?: number;
  fine?: number;
  instalment?: number;
  total?: number;
  pendingLoan?: number;
  status?: EntryStatus;
  isFreezed?: boolean;
}
