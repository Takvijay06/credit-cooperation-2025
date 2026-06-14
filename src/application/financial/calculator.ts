export class FinancialCalculator {
  constructor(private readonly interestRate = Number(process.env.INTEREST_RATE ?? 0.01)) {}

  computeInterest(pendingLoan: number): number {
    return pendingLoan * this.interestRate;
  }

  computeTotal(collection: number, interest: number, instalment: number, fine: number): number {
    return collection + interest + instalment + fine;
  }

  computePendingLoan(lastPending: number, loanTaken: number, instalment: number): number {
    return lastPending + loanTaken - instalment;
  }
}
