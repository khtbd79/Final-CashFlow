import {
  getEffectiveInsurancePlanPremium,
  getEffectivePersonalAssetInsurance,
  getPersonalAssetById,
  INSURANCE_PLANS,
  isBusinessMatchedForProfession,
  isFixedIncomeMatchedForProfession,
  isPropertyMatchedForProfession,
  isStockMatchedForProfession,
} from '../data/lifestyle';
import {
  FinancialSummary,
  GameState,
  LoanRecord,
  ProfessionProfile,
} from '../types/game';
import { roundMoney } from './prng';

export const ZAKAT_NISAB = 7500;
export const ZAKAT_ANNUAL_RATE = 0.025;

export function computeProgressiveTaxRatePct(
  annualizedTaxableIncome: number,
  netWorth: number
): number {
  let baseRate = 0;
  if (annualizedTaxableIncome > 120000) baseRate = 18;
  else if (annualizedTaxableIncome > 72000) baseRate = 14;
  else if (annualizedTaxableIncome > 36000) baseRate = 10;
  else if (annualizedTaxableIncome > 12000) baseRate = 6;

  let wealthAdj = 0;
  if (netWorth >= 150000) wealthAdj = 2;
  else if (netWorth >= 50000) wealthAdj = 1;
  else if (netWorth < 10000 && baseRate > 0) wealthAdj = -2;

  return Math.max(0, Math.min(20, baseRate + wealthAdj));
}

/**
 * Standard amortizing monthly loan payment formula:
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyLoanPayment(
  principal: number,
  annualInterestRate: number,
  termMonths: number
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const monthlyRate = annualInterestRate / 12;
  if (monthlyRate <= 0) {
    return roundMoney(principal / termMonths);
  }
  const factor = Math.pow(1 + monthlyRate, termMonths);
  const payment = (principal * (monthlyRate * factor)) / (factor - 1);
  return roundMoney(payment);
}

/**
 * Single Source of Truth for all financial statements, cashflow, net worth,
 * credit eligibility, and winning condition checks.
 */
export function computeFinancialSummary(state: GameState): FinancialSummary {
  const happiness = typeof state.happiness === 'number' ? state.happiness : 70;
  let characterSynergyBonusIncome = 0;

  // 1. Income Statement - Income (Happiness >= 85 gives +5% morale efficiency, < 25 gives -10%)
  const salaryMultiplier = happiness >= 85 ? 1.05 : happiness < 25 ? 0.9 : 1;
  const salaryIncome = roundMoney(state.salary * salaryMultiplier);

  let automatedBusinessIncome = 0;
  let activeBusinessIncome = 0;
  let businessExpensesTotal = 0;

  for (const biz of state.businesses) {
    businessExpensesTotal += biz.monthlyOperatingExpenses;
    const matched = isBusinessMatchedForProfession(state.professionId, biz.category);
    const rev = matched ? biz.monthlyRevenue * 1.15 : biz.monthlyRevenue;
    if (matched) {
      characterSynergyBonusIncome += biz.monthlyRevenue * 0.15;
    }
    if (biz.isAutomated) {
      automatedBusinessIncome += rev;
    } else {
      activeBusinessIncome += rev;
    }
  }
  automatedBusinessIncome = roundMoney(automatedBusinessIncome);
  activeBusinessIncome = roundMoney(activeBusinessIncome);
  businessExpensesTotal = roundMoney(businessExpensesTotal);
  const businessIncome = roundMoney(automatedBusinessIncome + activeBusinessIncome);

  let rentalIncome = 0;
  let propertyExpensesTotal = 0;
  for (const prop of state.properties) {
    const matched = isPropertyMatchedForProfession(state.professionId, prop.type);
    const rent = matched ? prop.monthlyRentalIncome * 1.12 : prop.monthlyRentalIncome;
    if (matched) {
      characterSynergyBonusIncome += prop.monthlyRentalIncome * 0.12;
    }
    rentalIncome += rent;
    propertyExpensesTotal += prop.maintenanceExpense;
  }
  rentalIncome = roundMoney(rentalIncome);
  propertyExpensesTotal = roundMoney(propertyExpensesTotal);

  let dividendIncome = 0;
  for (const holding of state.stocks) {
    const baseDiv = (holding.shares * holding.annualDividendPerShare) / 12;
    const matched = isStockMatchedForProfession(state.professionId, holding.symbol);
    if (matched) {
      characterSynergyBonusIncome += roundMoney(baseDiv * 0.2);
      dividendIncome += roundMoney(baseDiv * 1.2);
    } else {
      dividendIncome += roundMoney(baseDiv);
    }
  }
  dividendIncome = roundMoney(dividendIncome);

  let interestIncome = 0;
  for (const fi of state.fixedIncome) {
    const matched = isFixedIncomeMatchedForProfession(state.professionId, fi.productId);
    const effectiveRate = matched ? fi.annualInterestRate + 0.01 : fi.annualInterestRate;
    if (matched) {
      characterSynergyBonusIncome += roundMoney((fi.currentValue * 0.01) / 12);
    }
    interestIncome += roundMoney((fi.currentValue * effectiveRate) / 12);
  }
  interestIncome = roundMoney(interestIncome);
  characterSynergyBonusIncome = roundMoney(characterSynergyBonusIncome);

  const otherPassiveIncome = roundMoney(state.otherPassiveIncome);

  const passiveIncome = roundMoney(
    rentalIncome +
      dividendIncome +
      interestIncome +
      otherPassiveIncome +
      automatedBusinessIncome
  );

  const totalIncome = roundMoney(
    salaryIncome +
      businessIncome +
      rentalIncome +
      dividendIncome +
      interestIncome +
      otherPassiveIncome
  );

  // 2. Income Statement - Expenses
  const housingExpense = roundMoney(state.livingExpenses.housing);
  const foodExpense = roundMoney(state.livingExpenses.food);
  const transportationExpense = roundMoney(state.livingExpenses.transportation);
  const utilitiesExpense = roundMoney(state.livingExpenses.utilities);
  const educationExpense = roundMoney(state.livingExpenses.education);
  const entertainmentExpense = roundMoney(state.livingExpenses.entertainment);
  const otherLivingExpense = roundMoney(state.livingExpenses.other);

  const livingExpensesTotal = roundMoney(
    housingExpense +
      foodExpense +
      transportationExpense +
      utilitiesExpense +
      educationExpense +
      entertainmentExpense +
      otherLivingExpense
  );

  const healthPlan = INSURANCE_PLANS.find((p) => p.id === 'health')!;
  const propPlan = INSURANCE_PLANS.find((p) => p.id === 'property')!;
  const personalAssetsInsurance = (state.personalAssets ?? []).reduce((sum, asset) => {
    if (!asset.insured) return sum;
    return sum + getEffectivePersonalAssetInsurance(getPersonalAssetById(asset.id), state);
  }, 0);
  const insuranceMonthlyCost = roundMoney(
    (state.healthInsured ? getEffectiveInsurancePlanPremium(healthPlan, state) : 0) +
      (state.propertyInsured ? getEffectiveInsurancePlanPremium(propPlan, state) : 0) +
      personalAssetsInsurance
  );

  let loanPaymentsTotal = 0;
  for (const loan of state.loans) {
    if (loan.remainingBalance > 0.01) {
      loanPaymentsTotal += Math.min(
        loan.monthlyPayment,
        loan.remainingBalance * (1 + loan.annualInterestRate / 12)
      );
    }
  }
  loanPaymentsTotal = roundMoney(loanPaymentsTotal);

  const totalExpenses = roundMoney(
    livingExpensesTotal +
      insuranceMonthlyCost +
      loanPaymentsTotal +
      businessExpensesTotal +
      propertyExpensesTotal
  );

  const monthlyCashFlow = roundMoney(totalIncome - totalExpenses);

  // 3. Balance Sheet - Assets (Zero double counting)
  const cashAsset = roundMoney(state.cash);

  let bankSavingsAsset = 0;
  let bondsAsset = 0;
  for (const fi of state.fixedIncome) {
    if (fi.kind === 'savings') {
      bankSavingsAsset += fi.currentValue;
    } else {
      bondsAsset += fi.currentValue;
    }
  }
  bankSavingsAsset = roundMoney(bankSavingsAsset);
  bondsAsset = roundMoney(bondsAsset);

  let stocksAsset = 0;
  let stocksCostBasis = 0;
  for (const holding of state.stocks) {
    const marketPrice = state.market.stocks[holding.symbol]?.currentPrice ?? holding.avgBuyPrice;
    stocksAsset += holding.shares * marketPrice;
    stocksCostBasis += holding.shares * holding.avgBuyPrice;
  }
  stocksAsset = roundMoney(stocksAsset);

  let realEstateAsset = 0;
  let realEstateCostBasis = 0;
  for (const prop of state.properties) {
    realEstateAsset += prop.currentValue;
    realEstateCostBasis += prop.purchasePrice;
  }
  realEstateAsset = roundMoney(realEstateAsset);

  let businessesAsset = 0;
  let businessesCostBasis = 0;
  for (const biz of state.businesses) {
    businessesAsset += biz.currentValue;
    businessesCostBasis += biz.initialInvestment;
  }
  businessesAsset = roundMoney(businessesAsset);

  let otherInvestmentsAsset = 0;
  let cryptoCostBasis = 0;
  for (const coin of state.crypto) {
    const price = state.market.crypto[coin.symbol]?.currentPrice ?? coin.avgBuyPrice;
    otherInvestmentsAsset += coin.units * price;
    cryptoCostBasis += coin.units * coin.avgBuyPrice;
  }
  otherInvestmentsAsset = roundMoney(otherInvestmentsAsset);

  const personalAssetsValue = roundMoney(
    (state.personalAssets ?? []).reduce((sum, a) => sum + a.purchasePrice, 0)
  );

  const totalAssets = roundMoney(
    cashAsset +
      bankSavingsAsset +
      stocksAsset +
      realEstateAsset +
      businessesAsset +
      bondsAsset +
      otherInvestmentsAsset +
      personalAssetsValue
  );

  // 4. Balance Sheet - Liabilities
  let bankLoansLiability = 0;
  let creditCardLiability = 0;
  let propertyLoansLiability = 0;
  let businessLoansLiability = 0;
  let personalLoansLiability = 0;

  for (const loan of state.loans) {
    if (loan.remainingBalance <= 0.01) continue;
    switch (loan.category) {
      case 'bank':
        bankLoansLiability += loan.remainingBalance;
        break;
      case 'credit_card':
        creditCardLiability += loan.remainingBalance;
        break;
      case 'property':
        propertyLoansLiability += loan.remainingBalance;
        break;
      case 'business':
        businessLoansLiability += loan.remainingBalance;
        break;
      case 'personal':
      case 'other':
        personalLoansLiability += loan.remainingBalance;
        break;
    }
  }

  bankLoansLiability = roundMoney(bankLoansLiability);
  creditCardLiability = roundMoney(creditCardLiability);
  propertyLoansLiability = roundMoney(propertyLoansLiability);
  businessLoansLiability = roundMoney(businessLoansLiability);
  personalLoansLiability = roundMoney(personalLoansLiability);

  const totalLiabilities = roundMoney(
    bankLoansLiability +
      creditCardLiability +
      propertyLoansLiability +
      businessLoansLiability +
      personalLoansLiability
  );

  const netWorth = roundMoney(totalAssets - totalLiabilities);

  const unrealizedInvestmentPnL = roundMoney(
    (stocksAsset - stocksCostBasis) +
      (otherInvestmentsAsset - cryptoCostBasis) +
      (realEstateAsset - realEstateCostBasis) +
      (businessesAsset - businessesCostBasis)
  );
  const totalInvestmentPnL = roundMoney(state.realizedInvestmentPnL + unrealizedInvestmentPnL);

  // 5. Borrowing Capacity & Eligibility
  // Based on annual income capacity + 60% of tangible non-cash assets, capped reasonably
  const maxLoanEligibility = roundMoney(
    Math.max(10000, totalIncome * 18 + (totalAssets - cashAsset) * 0.5)
  );
  const remainingBorrowingCapacity = roundMoney(
    Math.max(0, maxLoanEligibility - totalLiabilities)
  );

  // 6. Rat Race Freedom Progress
  const freedomProgressPct =
    totalExpenses > 0
      ? Math.min(100, roundMoney((passiveIncome / totalExpenses) * 100))
      : 100;
  const isFinanciallyFree = totalExpenses > 0 ? passiveIncome > totalExpenses : passiveIncome > 0;

  // 7. Islamic Zakat (2.5% annual on Zakatable Net Wealth >= Nisab; excludes personal home/car/yacht)
  const zakatableAssets = roundMoney(
    cashAsset +
      bankSavingsAsset +
      bondsAsset +
      stocksAsset +
      otherInvestmentsAsset +
      realEstateAsset +
      businessesAsset
  );
  const zakatableNetWealth = Math.max(0, roundMoney(zakatableAssets - totalLiabilities));
  const zakatEligible = zakatableNetWealth >= ZAKAT_NISAB;
  const zakatAccrualMonths = Math.max(0, Math.min(12, state.zakatAccrualMonths ?? 0));
  const zakatAccruedPct = zakatEligible
    ? Number(((zakatAccrualMonths / 12) * 2.5).toFixed(2))
    : 0;
  const zakatProjectedAnnual = zakatEligible
    ? roundMoney(zakatableNetWealth * ZAKAT_ANNUAL_RATE)
    : 0;
  const zakatGrossAccrued = zakatEligible
    ? roundMoney(zakatableNetWealth * ZAKAT_ANNUAL_RATE * (zakatAccrualMonths / 12))
    : 0;
  const zakatAccruedCurrent = Math.max(
    0,
    roundMoney(zakatGrossAccrued - (state.zakatPaidAdvanceThisYear ?? 0))
  );
  const rawZakatDue = Math.max(0, state.zakatDueBalance ?? 0);
  // Scales down automatically if wealth drops below assessed level or below Nisab
  const zakatDueEffective =
    rawZakatDue <= 0
      ? 0
      : zakatEligible
        ? roundMoney(Math.min(rawZakatDue, zakatProjectedAnnual))
        : 0;

  // 8. Income Tax (Progressive + responds dynamically to losses & net worth reduction)
  const taxableIncomeYTD = Math.max(0, state.taxableIncomeYTD ?? 0);
  const accruedMonthCount = Math.max(1, state.month ?? 1);
  const annualizedIncomeEst =
    taxableIncomeYTD > 0
      ? (taxableIncomeYTD / Math.max(1, accruedMonthCount - 1 || 1)) * 12
      : totalIncome * 12;
  const incomeTaxRatePct = computeProgressiveTaxRatePct(
    Math.max(taxableIncomeYTD, annualizedIncomeEst * 0.5),
    netWorth
  );
  const incomeTaxLossRelief = Math.max(0, roundMoney(-unrealizedInvestmentPnL * 0.2));
  const grossTaxAccrued = Math.max(
    0,
    roundMoney(taxableIncomeYTD * (incomeTaxRatePct / 100) - incomeTaxLossRelief)
  );
  const incomeTaxAccruedCurrent = Math.max(
    0,
    roundMoney(grossTaxAccrued - (state.incomeTaxPaidAdvanceThisYear ?? 0))
  );
  const rawTaxDue = Math.max(0, state.incomeTaxDueBalance ?? 0);
  const incomeTaxDueEffective =
    rawTaxDue <= 0
      ? 0
      : Math.max(0, roundMoney(rawTaxDue - Math.max(0, -unrealizedInvestmentPnL * 0.1)));

  return {
    salaryIncome,
    businessIncome,
    automatedBusinessIncome,
    activeBusinessIncome,
    rentalIncome,
    dividendIncome,
    interestIncome,
    otherPassiveIncome,
    passiveIncome,
    totalIncome,

    housingExpense,
    foodExpense,
    transportationExpense,
    utilitiesExpense,
    educationExpense,
    entertainmentExpense,
    otherLivingExpense,
    livingExpensesTotal,
    loanPaymentsTotal,
    businessExpensesTotal,
    propertyExpensesTotal,
    totalExpenses,

    monthlyCashFlow,

    cashAsset,
    bankSavingsAsset,
    stocksAsset,
    realEstateAsset,
    businessesAsset,
    bondsAsset,
    otherInvestmentsAsset,
    personalAssetsValue,
    totalAssets,

    bankLoansLiability,
    creditCardLiability,
    propertyLoansLiability,
    businessLoansLiability,
    personalLoansLiability,
    totalLiabilities,

    netWorth,
    unrealizedInvestmentPnL,
    totalInvestmentPnL,

    insuranceMonthlyCost,
    happiness,
    characterSynergyBonusIncome,
    maxLoanEligibility,
    remainingBorrowingCapacity,
    freedomProgressPct,
    isFinanciallyFree,

    zakatNisab: ZAKAT_NISAB,
    zakatableNetWealth,
    zakatEligible,
    zakatAccruedPct,
    zakatAccruedCurrent,
    zakatProjectedAnnual,
    zakatDueEffective,
    incomeTaxRatePct,
    incomeTaxAccruedCurrent,
    incomeTaxDueEffective,
    incomeTaxLossRelief,
  };
}

/**
 * Preview starting financial condition for a profession before game creation.
 */
export function buildInitialLoansForProfession(p: ProfessionProfile): LoanRecord[] {
  const loans: LoanRecord[] = [];
  if (p.bankLoan > 0) {
    loans.push({
      id: 'init_bank_loan',
      name: 'Bank Education / Starter Loan',
      category: 'bank',
      principal: p.bankLoan,
      remainingBalance: p.bankLoan,
      annualInterestRate: p.bankLoanRate,
      termMonths: p.bankLoanTermMonths,
      remainingMonths: p.bankLoanTermMonths,
      monthlyPayment: calculateMonthlyLoanPayment(p.bankLoan, p.bankLoanRate, p.bankLoanTermMonths),
      originTurn: 1,
    });
  }
  if (p.creditCardDebt > 0) {
    loans.push({
      id: 'init_credit_card',
      name: 'Credit Card Balance',
      category: 'credit_card',
      principal: p.creditCardDebt,
      remainingBalance: p.creditCardDebt,
      annualInterestRate: p.creditCardRate,
      termMonths: p.creditCardTermMonths,
      remainingMonths: p.creditCardTermMonths,
      monthlyPayment: calculateMonthlyLoanPayment(p.creditCardDebt, p.creditCardRate, p.creditCardTermMonths),
      originTurn: 1,
    });
  }
  if (p.otherLiabilities > 0) {
    loans.push({
      id: 'init_other_loan',
      name: 'Auto & Personal Obligations',
      category: 'other',
      principal: p.otherLiabilities,
      remainingBalance: p.otherLiabilities,
      annualInterestRate: p.otherLiabilityRate,
      termMonths: p.otherLiabilityTermMonths,
      remainingMonths: p.otherLiabilityTermMonths,
      monthlyPayment: calculateMonthlyLoanPayment(
        p.otherLiabilities,
        p.otherLiabilityRate,
        p.otherLiabilityTermMonths
      ),
      originTurn: 1,
    });
  }
  return loans;
}

export function previewProfessionSummary(p: ProfessionProfile) {
  const loans = buildInitialLoansForProfession(p);
  const living =
    p.expenses.housing +
    p.expenses.food +
    p.expenses.transportation +
    p.expenses.utilities +
    p.expenses.education +
    p.expenses.entertainment +
    p.expenses.other;
  const loanPayments = roundMoney(loans.reduce((acc, l) => acc + l.monthlyPayment, 0));
  const totalExpenses = roundMoney(living + loanPayments);
  const monthlyCashFlow = roundMoney(p.monthlySalary - totalExpenses);
  const totalLiabilities = roundMoney(p.bankLoan + p.creditCardDebt + p.otherLiabilities);
  const netWorth = roundMoney(p.initialCash - totalLiabilities);

  return {
    livingExpenses: living,
    loanPayments,
    totalExpenses,
    monthlyCashFlow,
    totalLiabilities,
    netWorth,
  };
}
