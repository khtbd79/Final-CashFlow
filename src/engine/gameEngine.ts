import {
  ALL_HAPPINESS_ITEMS,
  getAnnualMissingAssetsPenalty,
  getEducationCoursesForProfession,
  getEducationCourseTitle,
  getEffectiveEducationCost,
  getEffectiveHappinessCost,
  getEffectivePersonalAssetInsurance,
  getEffectivePersonalAssetPrice,
  getHappinessItemName,
  getHappinessItemsForProfession,
  getInsurancePlanName,
  getLotteryTicketById,
  getLotteryTicketName,
  getPersonalAssetById,
  getPersonalAssetName,
  getVenturesForProfession,
  getVentureTitle,
  getWeddingCost,
  INSURANCE_PLANS,
  isFixedIncomeMatchedForProfession,
  isStockMatchedForProfession,
  PERSONAL_ASSETS,
  rollMonthlyHappinessItems,
  rollSingleVenture,
  rollVenturesForProfession,
  withPilgrimageHappinessItems,
} from '../data/lifestyle';
import {
  localizeBusiness,
  localizeCrypto,
  localizeEventCard,
  localizeFixedIncome,
  localizeLoanName,
  localizeProperty,
  localizeStock,
} from '../data/localization';
import { BUSINESS_TEMPLATES, CRYPTO_CATALOG, FIXED_INCOME_PRODUCTS, STOCK_CATALOG } from '../data/markets';
import { getProfessionById } from '../data/professions';
import {
  BusinessListing,
  GameEventCard,
  GameState,
  LanguageCode,
  LoanCategory,
  LoanRecord,
  LotteryTicketId,
  MonthlySnapshot,
  NavSection,
  OwnedBusiness,
  OwnedFixedIncome,
  OwnedProperty,
  PendingOpportunityDeal,
  PersonalAssetId,
  PropertyListing,
  TransactionCategory,
  TransactionRecord,
  TurnActionItem,
  TurnDesireImpactItem,
  TurnEventSummaryCard,
  TurnInvestmentResultItem,
  TurnSummary,
} from '../types/game';
import { generateTurnEvents } from './events';
import {
  buildInitialLoansForProfession,
  calculateMonthlyLoanPayment,
  computeFinancialSummary,
} from './finance';
import { advanceMarket, createInitialMarket } from './market';
import {
  formatCurrency,
  formatShortLabel,
  randomFloat,
  randomInt,
  randomPick,
  randomRange,
  randomSeed,
  roundMoney,
  shuffleArray,
  uid,
} from './prng';

export interface EngineActionResult {
  state: GameState;
  error?: string;
  successMessage?: string;
  redirectTo?: NavSection;
  outcomeType?: 'win' | 'loss';
  outcomeDelta?: number;
}

function appendTx(
  transactions: TransactionRecord[],
  turn: number,
  year: number,
  month: number,
  category: TransactionCategory,
  description: string,
  amount: number,
  balanceAfter: number
): TransactionRecord[] {
  const rec: TransactionRecord = {
    id: uid('tx'),
    turn,
    year,
    month,
    dateLabel: formatShortLabel(year, month),
    category,
    description,
    amount: roundMoney(amount),
    balanceAfter: roundMoney(balanceAfter),
  };
  return [rec, ...transactions].slice(0, 400);
}

const AUTOMATED_SETTLEMENT_PREFIXES = [
  'Started career as ',
  'Monthly Salary Credited',
  'Stock Market Dividends Credited',
  'Gold Investment Dividends Credited',
  'Bond Monthly Interest Credited',
  'Savings Monthly Interest Credited',
  'Property Rental Income Credited',
  'Automated Business Passive Income',
  'Royalties & Other Passive Income Credited',
  'Active Business Revenue',
  'Matured Bond Principal Returned',
  'Monthly Housing, Food, Utilities & Living Costs',
  'Monthly Insurance Premiums',
  'Monthly Business Operating Expenses',
  'Monthly Property Maintenance & Taxes',
  'Scheduled Monthly Debt & Mortgage Installments',
  'Automatic Credit Facility Draw',
  'New Baby Arrival Care',
  'Divorce Legal Settlement',
  'Uninsured Accident (',
  'Opportunity Settled: ',
];

function isAutomatedTurnSettlementTx(description: string): boolean {
  return AUTOMATED_SETTLEMENT_PREFIXES.some((prefix) => description.startsWith(prefix));
}

function checkVictory(state: GameState): GameState {
  const summary = computeFinancialSummary(state);
  if (!state.victoryAchieved && summary.isFinanciallyFree) {
    return {
      ...state,
      victoryAchieved: true,
      victoryTurn: state.currentTurn,
    };
  }
  return state;
}

function checkGameOver(state: GameState): GameState {
  const happiness = state.happiness ?? 70;
  if (!state.gameOver && happiness < 50) {
    return {
      ...state,
      gameOver: true,
      gameOverTurn: state.currentTurn,
    };
  }
  return state;
}

function rollBlackSwanMonthsForYear(
  year: number,
  minMonth: number,
  prevMonthTriggered: boolean,
  countOverride?: number
): number[] {
  const startMonth =
    year === 1
      ? Math.max(3, minMonth)
      : Math.max(prevMonthTriggered ? 2 : 1, minMonth);

  const eligible: number[] = [];
  for (let m = startMonth; m <= 12; m += 1) {
    eligible.push(m);
  }
  if (eligible.length === 0) return [];

  const desiredCount = countOverride ?? (randomFloat() < 0.5 ? 2 : 3);
  const targetCount = Math.min(desiredCount, eligible.length);

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const shuffled = shuffleArray(eligible);
    const picked: number[] = [];
    for (const m of shuffled) {
      if (picked.every((existing) => Math.abs(existing - m) >= 2)) {
        picked.push(m);
        if (picked.length === targetCount) {
          return picked.sort((a, b) => a - b);
        }
      }
    }
  }

  return shuffleArray(eligible).slice(0, targetCount).sort((a, b) => a - b);
}

export function createNewGame(professionId: string): GameState {
  const prof = getProfessionById(professionId);
  const seed = randomSeed();
  const market = createInitialMarket(seed);
  const loans = buildInitialLoansForProfession(prof);

  const initialMaritalStatus = randomFloat() < 0.5 ? 'married' : 'single';
  const initialBlackSwanMonths = rollBlackSwanMonthsForYear(1, 3, false);

  const baseState: GameState = {
    version: 1,
    gameId: uid('game'),
    seed,
    professionId: prof.id,
    professionName: prof.name,
    currentTurn: 1,
    lastProcessedTurn: 1,
    year: 1,
    month: 1,
    cash: prof.initialCash,
    salary: prof.monthlySalary,
    otherPassiveIncome: 0,
    livingExpenses: { ...prof.expenses },
    stocks: [],
    crypto: [],
    properties: [],
    businesses: [],
    fixedIncome: [],
    loans,
    market,
    pendingEvents: [],
    pendingOpportunityDeals: [],
    eventHistory: [],
    transactions: [],
    monthlyHistory: [],
    realizedInvestmentPnL: 0,
    happiness: 70,
    actionsUsedThisTurn: 0,
    monthlyExpensePaidThisTurn: false,
    monthlyExpensePaidAmountThisTurn: 0,
    healthInsured: false,
    propertyInsured: false,
    personalAssets: [],
    activeVentures: rollVenturesForProfession(prof.id, 2),
    activeHappinessItems: rollMonthlyHappinessItems(prof.id, 5),
    purchasedHappinessIdsThisTurn: [],
    handledHappinessIdsThisTurn: [],
    ignoredHappinessIdsThisTurn: [],
    playedLotteryIdsThisTurn: [],
    completedEducationIds: [],
    educationBoostsById: {},
    lastEducationYear: 0,
    inflationRate: 0,
    inflationMultiplier: 1,
    maritalStatus: initialMaritalStatus,
    childrenCount: 0,
    marriageCount: initialMaritalStatus === 'married' ? 1 : 0,
    divorceCount: 0,
    victoryAchieved: false,
    victoryTurn: null,
    victoryContinued: false,
    blackSwanScheduleYear: 1,
    blackSwanScheduledMonths: initialBlackSwanMonths,
    zakatAccrualMonths: 0,
    zakatDueBalance: 0,
    zakatPaidTotal: 0,
    zakatPaidAdvanceThisYear: 0,
    taxableIncomeYTD: 0,
    incomeTaxDueBalance: 0,
    incomeTaxPaidTotal: 0,
    incomeTaxPaidAdvanceThisYear: 0,
    gameOver: false,
    gameOverTurn: null,
    lastTurnSummary: null,
  };

  baseState.transactions = appendTx(
    [],
    1,
    1,
    1,
    'Event',
    `Started career as ${prof.name} with ${formatCurrency(prof.initialCash)} initial cash`,
    prof.initialCash,
    prof.initialCash
  );

  baseState.pendingEvents = generateTurnEvents(
    1,
    seed,
    market,
    [],
    initialMaritalStatus,
    1
  );

  const summary = computeFinancialSummary(baseState);
  const initSnap: MonthlySnapshot = {
    turn: 1,
    year: 1,
    month: 1,
    label: formatShortLabel(1, 1),
    salaryIncome: summary.salaryIncome,
    passiveIncome: summary.passiveIncome,
    activeBusinessIncome: summary.activeBusinessIncome,
    totalIncome: summary.totalIncome,
    livingExpenses: summary.livingExpensesTotal,
    loanPayments: summary.loanPaymentsTotal,
    businessExpenses: summary.businessExpensesTotal,
    propertyExpenses: summary.propertyExpensesTotal,
    totalExpenses: summary.totalExpenses,
    cashFlow: summary.monthlyCashFlow,
    cashOnHand: summary.cashAsset,
    totalAssets: summary.totalAssets,
    totalLiabilities: summary.totalLiabilities,
    netWorth: summary.netWorth,
    investmentPnL: summary.totalInvestmentPnL,
    happiness: baseState.happiness,
    freedomProgressPct: Number(summary.freedomProgressPct.toFixed(1)),
  };
  baseState.monthlyHistory = [initSnap];

  return baseState;
}

export function advanceMonth(
  state: GameState,
  lang: LanguageCode = 'en',
  ignoreEvents = false
): EngineActionResult {
  if (state.gameOver || (state.happiness ?? 70) < 50) {
    return { state: checkGameOver(state) };
  }

  const nextTurn = state.currentTurn + 1;

  // Duplicate turn protection
  if (state.lastProcessedTurn >= nextTurn) {
    return {
      state,
      error: lang === 'bn' ? 'এই মাসটি ইতিমধ্যেই প্রক্রিয়াকরণ হয়েছে।' : 'This turn has already been processed.',
    };
  }

  // Require mandatory monthly living expenses payment before ending the turn
  if (!state.monthlyExpensePaidThisTurn) {
    return {
      state,
      redirectTo: 'dashboard',
      error:
        lang === 'bn'
          ? 'মাস শেষ করার আগে ড্যাশবোর্ড থেকে মাসিক খরচ পরিশোধ করুন।'
          : 'Pay your mandatory Monthly Expenses on the Dashboard before ending the month.',
    };
  }

  // Require resolving mandatory emergencies or life events unless Events section is ignored
  if (!ignoreEvents) {
    const blockingEvents = state.pendingEvents.filter(
      (e) => !e.resolved && (e.category === 'expense_emergency' || e.category === 'life_event')
    );
    if (blockingEvents.length > 0) {
      return {
        state,
        redirectTo: 'events',
        error:
          lang === 'bn'
            ? `পরবর্তী মাসে যাওয়ার আগে ঘটনা বিভাগে ${blockingEvents.length}টি জরুরি বা জীবনের ঘটনা সমাধান করুন।`
            : `Resolve ${blockingEvents.length} pending emergency or life event(s) in the Events tab before advancing to next month.`,
      };
    }
  }

  const nextMonth = state.month === 12 ? 1 : state.month + 1;
  const nextYear = state.month === 12 ? state.year + 1 : state.year;

  const summaryBefore = computeFinancialSummary(state);
  const notes: string[] = [];
  let runningCash = state.cash;
  let txs = [...state.transactions];

  // 1. Salary
  const salaryReceived = summaryBefore.salaryIncome;
  if (salaryReceived > 0) {
    runningCash = roundMoney(runningCash + salaryReceived);
    txs = appendTx(txs, nextTurn, nextYear, nextMonth, 'Salary', 'Monthly Salary Credited', salaryReceived, runningCash);
  }

  // 2. Stock Dividends, Gold Dividends, Rental, Automated Business & Other Passive Income -> direct to main cash account
  let stockDividendIncome = 0;
  let goldDividendIncome = 0;
  for (const holding of state.stocks) {
    const baseDiv = (holding.shares * holding.annualDividendPerShare) / 12;
    const matched = isStockMatchedForProfession(state.professionId, holding.symbol);
    const itemDiv = roundMoney(matched ? baseDiv * 1.2 : baseDiv);
    if (holding.symbol === 'GOLDM') {
      goldDividendIncome = roundMoney(goldDividendIncome + itemDiv);
    } else {
      stockDividendIncome = roundMoney(stockDividendIncome + itemDiv);
    }
  }

  const rentalIncome = summaryBefore.rentalIncome;
  const dividendIncome = roundMoney(stockDividendIncome + goldDividendIncome);
  const automatedBizRev = summaryBefore.automatedBusinessIncome;
  const activeBizRev = summaryBefore.activeBusinessIncome;
  const otherPassive = summaryBefore.otherPassiveIncome;

  if (stockDividendIncome > 0) {
    runningCash = roundMoney(runningCash + stockDividendIncome);
    txs = appendTx(
      txs,
      nextTurn,
      nextYear,
      nextMonth,
      'Passive Income',
      'Stock Market Dividends Credited',
      stockDividendIncome,
      runningCash
    );
  }

  if (goldDividendIncome > 0) {
    runningCash = roundMoney(runningCash + goldDividendIncome);
    txs = appendTx(
      txs,
      nextTurn,
      nextYear,
      nextMonth,
      'Passive Income',
      'Gold Investment Dividends Credited',
      goldDividendIncome,
      runningCash
    );
  }

  if (rentalIncome > 0) {
    runningCash = roundMoney(runningCash + rentalIncome);
    txs = appendTx(
      txs,
      nextTurn,
      nextYear,
      nextMonth,
      'Passive Income',
      'Property Rental Income Credited',
      rentalIncome,
      runningCash
    );
  }

  if (automatedBizRev > 0) {
    runningCash = roundMoney(runningCash + automatedBizRev);
    txs = appendTx(
      txs,
      nextTurn,
      nextYear,
      nextMonth,
      'Passive Income',
      'Automated Business Passive Income',
      automatedBizRev,
      runningCash
    );
  }

  if (otherPassive > 0) {
    runningCash = roundMoney(runningCash + otherPassive);
    txs = appendTx(
      txs,
      nextTurn,
      nextYear,
      nextMonth,
      'Passive Income',
      'Royalties & Other Passive Income Credited',
      otherPassive,
      runningCash
    );
  }

  const cashPassiveNonInterest = roundMoney(
    rentalIncome + dividendIncome + automatedBizRev + otherPassive
  );

  if (activeBizRev > 0) {
    runningCash = roundMoney(runningCash + activeBizRev);
    txs = appendTx(
      txs,
      nextTurn,
      nextYear,
      nextMonth,
      'Business',
      'Active Business Revenue',
      activeBizRev,
      runningCash
    );
  }

  // 3. Fixed Income (Bonds & Savings) monthly interest credited directly to main cash account & maturities
  let bondInterestPaid = 0;
  let savingsInterestPaid = 0;
  let maturedPayout = 0;
  const updatedFixedIncome: OwnedFixedIncome[] = [];

  for (const fi of state.fixedIncome) {
    const matched = isFixedIncomeMatchedForProfession(state.professionId, fi.productId);
    const effectiveRate = matched ? fi.annualInterestRate + 0.01 : fi.annualInterestRate;
    const monthlyInt = roundMoney((fi.currentValue * effectiveRate) / 12);
    const nextTurns = fi.turnsElapsed + 1;

    if (fi.kind === 'bond') {
      bondInterestPaid = roundMoney(bondInterestPaid + monthlyInt);
    } else {
      savingsInterestPaid = roundMoney(savingsInterestPaid + monthlyInt);
    }

    if (fi.maturityMonths > 0 && nextTurns >= fi.maturityMonths) {
      maturedPayout = roundMoney(maturedPayout + fi.currentValue);
      notes.push(`${fi.name} matured — ${formatCurrency(fi.currentValue)} returned to cash.`);
    } else {
      updatedFixedIncome.push({
        ...fi,
        payoutFrequency: 'monthly',
        turnsElapsed: nextTurns,
      });
    }
  }

  if (bondInterestPaid > 0) {
    runningCash = roundMoney(runningCash + bondInterestPaid);
    txs = appendTx(
      txs,
      nextTurn,
      nextYear,
      nextMonth,
      'Passive Income',
      'Bond Monthly Interest Credited',
      bondInterestPaid,
      runningCash
    );
  }
  if (savingsInterestPaid > 0) {
    runningCash = roundMoney(runningCash + savingsInterestPaid);
    txs = appendTx(
      txs,
      nextTurn,
      nextYear,
      nextMonth,
      'Passive Income',
      'Savings Monthly Interest Credited',
      savingsInterestPaid,
      runningCash
    );
  }
  if (maturedPayout > 0) {
    runningCash = roundMoney(runningCash + maturedPayout);
    txs = appendTx(
      txs,
      nextTurn,
      nextYear,
      nextMonth,
      'Bonds & Savings',
      'Matured Bond Principal Returned',
      maturedPayout,
      runningCash
    );
  }

  const interestPaidToCash = roundMoney(bondInterestPaid + savingsInterestPaid);
  const totalPassiveIncomeReceived = roundMoney(cashPassiveNonInterest + interestPaidToCash);

  // 4. Living Expenses (already paid during turn via payMonthlyExpenses) & Insurance Premiums
  const livingPaid = state.monthlyExpensePaidAmountThisTurn ?? summaryBefore.livingExpensesTotal;
  const insurancePaid = summaryBefore.insuranceMonthlyCost;
  if (insurancePaid > 0) {
    runningCash = roundMoney(runningCash - insurancePaid);
    txs = appendTx(
      txs,
      nextTurn,
      nextYear,
      nextMonth,
      'Lifestyle',
      'Monthly Insurance Premiums',
      -insurancePaid,
      runningCash
    );
  }

  // 5. Business Operating Expenses
  const bizExpPaid = summaryBefore.businessExpensesTotal;
  if (bizExpPaid > 0) {
    runningCash = roundMoney(runningCash - bizExpPaid);
    txs = appendTx(
      txs,
      nextTurn,
      nextYear,
      nextMonth,
      'Business',
      'Monthly Business Operating Expenses',
      -bizExpPaid,
      runningCash
    );
  }

  // 6. Property Maintenance Expenses
  const propExpPaid = summaryBefore.propertyExpensesTotal;
  if (propExpPaid > 0) {
    runningCash = roundMoney(runningCash - propExpPaid);
    txs = appendTx(
      txs,
      nextTurn,
      nextYear,
      nextMonth,
      'Property Expense',
      'Monthly Property Maintenance & Taxes',
      -propExpPaid,
      runningCash
    );
  }

  // 7. Loan Amortization Payments
  let loanPaymentsPaid = 0;
  const updatedLoans: LoanRecord[] = [];
  for (const loan of state.loans) {
    if (loan.remainingBalance <= 0.01) continue;
    const monthlyInterest = roundMoney(loan.remainingBalance * (loan.annualInterestRate / 12));
    const payoffCap = roundMoney(loan.remainingBalance + monthlyInterest);
    const actualPayment = roundMoney(Math.min(loan.monthlyPayment, payoffCap));
    const principalReduced = roundMoney(actualPayment - monthlyInterest);
    const newBalance = roundMoney(Math.max(0, loan.remainingBalance - principalReduced));
    const newRemainingMonths = Math.max(0, loan.remainingMonths - 1);

    loanPaymentsPaid = roundMoney(loanPaymentsPaid + actualPayment);

    if (newBalance <= 0.01) {
      notes.push(`Loan completely paid off: ${loan.name}!`);
    } else {
      updatedLoans.push({
        ...loan,
        remainingBalance: newBalance,
        remainingMonths: newRemainingMonths,
      });
    }
  }

  if (loanPaymentsPaid > 0) {
    runningCash = roundMoney(runningCash - loanPaymentsPaid);
    txs = appendTx(
      txs,
      nextTurn,
      nextYear,
      nextMonth,
      'Loan Payment',
      'Scheduled Monthly Debt & Mortgage Installments',
      -loanPaymentsPaid,
      runningCash
    );
  }

  // 8. Require sufficient cash after scheduled bills & debt installments (never auto-load credit)
  const overdraftDrawn = 0;
  if (runningCash < 0) {
    const shortfall = roundMoney(Math.abs(runningCash));
    return {
      state,
      redirectTo: 'investments',
      error:
        lang === 'bn'
          ? `মাস শেষের নির্ধারিত খরচ ও কিস্তি পরিশোধের জন্য আরও ${formatCurrency(shortfall)} নগদ প্রয়োজন। বিনিয়োগ তুলে নিন অথবা ঋণ নিন।`
          : `Insufficient cash to cover month-end bills and loan payments (short by ${formatCurrency(shortfall)}). Withdraw investments or take a loan first.`,
    };
  }

  // 9. Advance Market Prices (hidden random Black Swan schedule: 2-3 times per year, never in Month 1)
  const prevTurnWasBlackSwan = Boolean(state.lastTurnSummary?.blackSwanTriggered);
  let activeBlackSwanYear = state.blackSwanScheduleYear;
  let activeBlackSwanMonths = state.blackSwanScheduledMonths;

  if (activeBlackSwanYear !== nextYear || !Array.isArray(activeBlackSwanMonths)) {
    const startFrom = nextYear === 1 ? Math.max(3, nextMonth) : nextMonth;
    const remainingCount = Math.max(0, 12 - startFrom + 1);
    const baseTarget = randomFloat() < 0.5 ? 2 : 3;
    const scaledTarget =
      nextMonth > 1 && state.blackSwanScheduleYear === undefined
        ? Math.min(remainingCount, Math.max(0, Math.round((baseTarget * remainingCount) / 12)))
        : baseTarget;
    activeBlackSwanYear = nextYear;
    activeBlackSwanMonths = rollBlackSwanMonthsForYear(
      nextYear,
      startFrom,
      prevTurnWasBlackSwan,
      scaledTarget
    );
  }

  const blackSwanTriggered =
    nextTurn >= 3 &&
    !prevTurnWasBlackSwan &&
    activeBlackSwanMonths.includes(nextMonth);
  const crashFactor = blackSwanTriggered ? randomRange(0.56, 0.75) : undefined;
  const CRASH_WINNER_POOL = [
    'GOLDM',
    'GOLDM',
    'GOLDM',
    'GOLDM',
    'GOLDM',
    'VLTG',
    'HLTH',
    'RVRB',
    'TRNS',
    'APEX',
  ];
  const crashWinnerSymbol = blackSwanTriggered ? randomPick(CRASH_WINNER_POOL) : 'GOLDM';
  const nextMarket = advanceMarket(
    state.market,
    nextTurn,
    state.seed,
    blackSwanTriggered,
    crashFactor,
    crashWinnerSymbol
  );

  let blackSwanMarketDropPct: number | undefined;
  let blackSwanGoldSurgePct: number | undefined;
  let blackSwanGoldProfit: number | undefined;
  let blackSwanWinnerEn = 'Gold';
  let blackSwanWinnerBn = 'সোনা';

  if (blackSwanTriggered) {
    const dropRates: number[] = [];
    for (const [sym, prevS] of Object.entries(state.market.stocks)) {
      if (sym === crashWinnerSymbol || sym === 'GOLDM') continue;
      const nextS = nextMarket.stocks[sym];
      if (prevS.currentPrice > 0 && nextS) {
        dropRates.push(Math.max(0, (prevS.currentPrice - nextS.currentPrice) / prevS.currentPrice));
      }
    }
    for (const [sym, prevC] of Object.entries(state.market.crypto)) {
      const nextC = nextMarket.crypto[sym];
      if (prevC.currentPrice > 0 && nextC) {
        dropRates.push(Math.max(0, (prevC.currentPrice - nextC.currentPrice) / prevC.currentPrice));
      }
    }
    const avgDrop =
      dropRates.length > 0 ? dropRates.reduce((sum, r) => sum + r, 0) / dropRates.length : 0.32;
    blackSwanMarketDropPct = Math.max(20, Math.round(avgDrop * 100));

    const winnerDef = STOCK_CATALOG.find((s) => s.symbol === crashWinnerSymbol);
    blackSwanWinnerEn =
      crashWinnerSymbol === 'GOLDM' ? 'Gold' : winnerDef?.name ?? crashWinnerSymbol;
    blackSwanWinnerBn =
      crashWinnerSymbol === 'GOLDM'
        ? 'সোনা'
        : localizeStock(crashWinnerSymbol, 'bn').symbol;

    const prevWinPrice = state.market.stocks[crashWinnerSymbol]?.currentPrice ?? winnerDef?.basePrice ?? 28;
    const nextWinPrice = nextMarket.stocks[crashWinnerSymbol]?.currentPrice ?? prevWinPrice;
    blackSwanGoldSurgePct =
      prevWinPrice > 0
        ? Math.max(62, Math.round(((nextWinPrice - prevWinPrice) / prevWinPrice) * 100))
        : 68;

    const heldWinnerShares = state.stocks.find((h) => h.symbol === crashWinnerSymbol)?.shares ?? 0;
    blackSwanGoldProfit =
      heldWinnerShares > 0 ? roundMoney(heldWinnerShares * (nextWinPrice - prevWinPrice)) : 0;

    notes.push(
      blackSwanGoldProfit > 0
        ? `Black Swan Crash (-${blackSwanMarketDropPct}%): [${blackSwanWinnerEn}] surged +${blackSwanGoldSurgePct}% (+${formatCurrency(blackSwanGoldProfit)} profit)`
        : `Black Swan Crash (-${blackSwanMarketDropPct}%): [${blackSwanWinnerEn}] surged +${blackSwanGoldSurgePct}% for holders`
    );
  }

  // 9b. Settle Opportunity Deals bought during the month (only reveal outcome at month close)
  const pendingOpps = state.pendingOpportunityDeals ?? [];
  const settledEventIds = new Set<string>();
  const settledOpportunityCards: TurnEventSummaryCard[] = [];
  let realizedGainFromOpps = 0;

  for (const deal of pendingOpps) {
    const nextPrice = nextMarket.stocks[deal.symbol]?.currentPrice ?? deal.offerPrice;
    const payout = roundMoney(deal.shares * nextPrice);
    const profit = roundMoney(payout - deal.cost);
    const pct = deal.cost > 0 ? Math.round((profit / deal.cost) * 100) : 0;
    const sign = profit >= 0 ? '+' : '';
    const pctSign = pct >= 0 ? '+' : '';
    const bnSym = localizeStock(deal.symbol, 'bn').symbol;

    runningCash = roundMoney(runningCash + payout);
    realizedGainFromOpps = roundMoney(realizedGainFromOpps + profit);
    settledEventIds.add(deal.eventId);

    txs = appendTx(
      txs,
      nextTurn,
      nextYear,
      nextMonth,
      'Event',
      `Opportunity Settled: ${deal.titleEn} (${formatCurrency(payout)})`,
      payout,
      runningCash
    );

    notes.push(
      `Opportunity Settled (${deal.titleEn}): Payout ${formatCurrency(payout)} (${sign}${formatCurrency(profit)} · ${pctSign}${pct}%).`
    );

    settledOpportunityCards.push({
      id: `opp_settle_${deal.id}`,
      kind: 'resolved_event',
      titleEn: deal.titleEn,
      titleBn: deal.titleBn,
      descriptionEn: `Settled ${deal.shares} ${deal.symbol} private placement at month close (Invested: ${formatCurrency(deal.cost)}).`,
      descriptionBn: `মাস শেষে ${deal.shares}টি ${bnSym} শেয়ারের সুযোগ নিষ্পত্তি হয়েছে (বিনিয়োগ: ${formatCurrency(deal.cost)})।`,
      resultLabelEn: `Payout: ${formatCurrency(payout)} (${sign}${formatCurrency(profit)} · ${pctSign}${pct}%)`,
      resultLabelBn: `পরিশোধ: ${formatCurrency(payout)} (${sign}${formatCurrency(profit)} · ${pctSign}${pct}%)`,
      highlightPct: pct,
      tone: profit > 0 ? 'positive' : profit < 0 ? 'negative' : 'neutral',
    });
  }

  const updatedProperties = state.properties.map((p) => {
    const valDrift = randomRange(0.985, 1.024);
    return {
      ...p,
      currentValue: Math.round((p.currentValue * valDrift) / 100) * 100,
    };
  });

  const updatedBusinesses = state.businesses.map((b) => {
    const valDrift = randomRange(0.98, 1.028);
    const revDrift = randomRange(0.95, 1.065);
    const nextRevenue = Math.max(
      Math.round((b.initialInvestment * 0.03) / 10) * 10,
      Math.round((b.monthlyRevenue * revDrift) / 10) * 10
    );
    return {
      ...b,
      currentValue: Math.round((b.currentValue * valDrift) / 100) * 100,
      monthlyRevenue: nextRevenue,
    };
  });

  // 10. Annual Random Inflation (every new year) & Family Life Developments
  const previousInflationRate = state.inflationRate ?? 0;
  let annualInflationPct: number | undefined;
  let inflationLivingCostDelta = 0;
  let nextInflationMultiplier = state.inflationMultiplier ?? 1;
  let nextInflationRate = state.inflationRate ?? 0;
  let nextLivingExpenses = { ...state.livingExpenses };

  if (nextMonth === 1) {
    const pct = randomFloat() < 0.85 ? randomInt(3, 11) : randomInt(0, 2);
    annualInflationPct = pct;
    nextInflationRate = pct;
    if (pct > 0) {
      const livingBeforeInf =
        nextLivingExpenses.housing +
        nextLivingExpenses.food +
        nextLivingExpenses.transportation +
        nextLivingExpenses.utilities +
        nextLivingExpenses.education +
        nextLivingExpenses.entertainment +
        nextLivingExpenses.other;
      const infFactor = 1 + pct / 100;
      nextInflationMultiplier = Number((nextInflationMultiplier * infFactor).toFixed(4));
      nextLivingExpenses = {
        housing: Math.round(nextLivingExpenses.housing * infFactor),
        food: Math.round(nextLivingExpenses.food * infFactor),
        transportation: Math.round(nextLivingExpenses.transportation * infFactor),
        utilities: Math.round(nextLivingExpenses.utilities * infFactor),
        education: Math.round(nextLivingExpenses.education * infFactor),
        entertainment: Math.round(nextLivingExpenses.entertainment * infFactor),
        other: Math.round(nextLivingExpenses.other * infFactor),
      };
      const livingAfterInf =
        nextLivingExpenses.housing +
        nextLivingExpenses.food +
        nextLivingExpenses.transportation +
        nextLivingExpenses.utilities +
        nextLivingExpenses.education +
        nextLivingExpenses.entertainment +
        nextLivingExpenses.other;
      inflationLivingCostDelta = roundMoney(livingAfterInf - livingBeforeInf);
      notes.push(`Annual Inflation (+${pct}%): Living expenses & prices rose.`);
    } else {
      notes.push('Annual Inflation (0%): Prices remained stable this year.');
    }
  }

  let nextMaritalStatus = state.maritalStatus ?? 'single';
  let nextChildrenCount = state.childrenCount ?? 0;
  let nextDivorceCount = state.divorceCount ?? 0;
  let babyBornThisTurn = false;
  let babyBirthCostPaid = 0;
  let divorceThisTurn = false;
  let divorceSettlementPaid: number | undefined;
  let familyHappinessDelta = 0;

  if (nextTurn >= 6 && nextMaritalStatus === 'married') {
    const familySummary = computeFinancialSummary({
      ...state,
      cash: runningCash,
      livingExpenses: nextLivingExpenses,
      fixedIncome: updatedFixedIncome,
      loans: updatedLoans,
      properties: updatedProperties,
      businesses: updatedBusinesses,
      market: nextMarket,
    });
    const hasFamilySolvency =
      (runningCash >= 4000 &&
        (familySummary.passiveIncome >= 150 ||
          familySummary.totalAssets >= 22000 ||
          familySummary.monthlyCashFlow >= 450)) ||
      (nextTurn >= 10 && runningCash >= 2500);
    const babyRoll = randomFloat();
    const divorceProb = (state.happiness ?? 70) < 62 ? 0.085 : 0.04;
    if (hasFamilySolvency && nextChildrenCount < 5 && babyRoll < 0.065) {
      babyBornThisTurn = true;
      nextChildrenCount += 1;
      familyHappinessDelta += 14;
      const monthlyCareFood = Math.round(90 * nextInflationMultiplier);
      const monthlyCareEdu = Math.round(135 * nextInflationMultiplier);
      nextLivingExpenses = {
        ...nextLivingExpenses,
        food: nextLivingExpenses.food + monthlyCareFood,
        education: nextLivingExpenses.education + monthlyCareEdu,
      };
      const birthCost = Math.min(
        Math.max(0, roundMoney(runningCash * 0.2)),
        Math.round((750 * nextInflationMultiplier) / 50) * 50
      );
      if (birthCost > 0) {
        babyBirthCostPaid = birthCost;
        runningCash = roundMoney(runningCash - birthCost);
        txs = appendTx(
          txs,
          nextTurn,
          nextYear,
          nextMonth,
          'Lifestyle',
          'New Baby Arrival Care',
          -birthCost,
          runningCash
        );
      }
      notes.push(
        `New Baby Born! Childcare added +${formatCurrency(monthlyCareFood + monthlyCareEdu)}/mo.`
      );
    } else if ((hasFamilySolvency || (state.happiness ?? 70) < 60) && randomFloat() < divorceProb) {
      divorceThisTurn = true;
      nextMaritalStatus = 'divorced';
      nextDivorceCount += 1;
      familyHappinessDelta -= 14;
      const settlement =
        runningCash > 500
          ? roundMoney(
              Math.min(
                runningCash - 250,
                Math.max(400, runningCash * randomRange(0.18, 0.28))
              )
            )
          : 0;
      if (settlement > 0) {
        divorceSettlementPaid = settlement;
        runningCash = roundMoney(runningCash - settlement);
        txs = appendTx(
          txs,
          nextTurn,
          nextYear,
          nextMonth,
          'Lifestyle',
          'Divorce Legal Settlement',
          -settlement,
          runningCash
        );
      }
      notes.push(
        settlement > 0
          ? `Divorce occurred: Settlement ${formatCurrency(settlement)} paid.`
          : 'Divorce occurred: Marital status changed to Divorced.'
      );
    }
  }

  // 10b. Annual Missing Personal Assets Happiness Penalty & Uninsured Accident Check
  let yearlyMissingAssetsHappinessLoss: number | undefined;
  if (nextMonth === 1) {
    const missingPenalty = getAnnualMissingAssetsPenalty(state.personalAssets ?? []);
    if (missingPenalty > 0) {
      yearlyMissingAssetsHappinessLoss = missingPenalty;
      notes.push(
        `Yearly Happiness Penalty (-${missingPenalty}): Missing Own House/Car/Yacht.`
      );
    }
  }

  let uninsuredAccidentOccurred = false;
  let uninsuredAccidentAssetId: PersonalAssetId | undefined;
  let uninsuredAccidentCashLoss: number | undefined;
  let uninsuredAccidentHappinessLoss: number | undefined;

  const uninsuredOwned = (state.personalAssets ?? []).filter((a) => !a.insured);
  if (nextTurn >= 2 && uninsuredOwned.length > 0) {
    const accidentChance = Math.min(0.45, 0.2 + (uninsuredOwned.length - 1) * 0.08);
    if (randomFloat() < accidentChance) {
      const victim = randomPick(uninsuredOwned);
      const tpl = getPersonalAssetById(victim.id);
      const dmgPct = randomRange(tpl.accidentLossMinPct, tpl.accidentLossMaxPct);
      const rawDamage = Math.max(400, Math.round((victim.purchasePrice * dmgPct) / 100) * 100);
      const cashLoss = Math.min(Math.max(0, runningCash), rawDamage);
      if (cashLoss > 0) {
        runningCash = roundMoney(runningCash - cashLoss);
        txs = appendTx(
          txs,
          nextTurn,
          nextYear,
          nextMonth,
          'Lifestyle',
          `Uninsured Accident (${tpl.nameEn})`,
          -cashLoss,
          runningCash
        );
      }
      uninsuredAccidentOccurred = true;
      uninsuredAccidentAssetId = victim.id;
      uninsuredAccidentCashLoss = cashLoss;
      uninsuredAccidentHappinessLoss = tpl.accidentHappinessLoss;
      notes.push(
        `Uninsured Accident (${tpl.nameEn}): -${formatCurrency(cashLoss)} & -${tpl.accidentHappinessLoss} Happiness.`
      );
    }
  }

  // 11. Move unchosen opportunity cards to history as expired/ignored, generate new events unless ignored
  const expiredOpportunities: GameEventCard[] = state.pendingEvents
    .filter((e) => !e.resolved)
    .map((e) => ({
      ...e,
      resolved: true,
      resolutionNote: ignoreEvents ? 'Ignored (Events disabled).' : 'Opportunity expired at end of month.',
    }));

  const recentIds = [...state.eventHistory, ...expiredOpportunities].map((e) => e.templateId);
  const eventSummary = computeFinancialSummary({
    ...state,
    cash: runningCash,
    livingExpenses: nextLivingExpenses,
    fixedIncome: updatedFixedIncome,
    loans: updatedLoans,
    properties: updatedProperties,
    businesses: updatedBusinesses,
    market: nextMarket,
  });
  const newEvents = ignoreEvents
    ? []
    : generateTurnEvents(
        nextTurn,
        state.seed,
        nextMarket,
        recentIds,
        nextMaritalStatus,
        nextInflationMultiplier,
        {
          cash: runningCash,
          passiveIncome: eventSummary.passiveIncome,
          totalExpenses: eventSummary.totalExpenses,
          netWorth: eventSummary.netWorth,
          assetsCount:
            state.stocks.length +
            state.crypto.length +
            updatedFixedIncome.length +
            updatedProperties.length +
            updatedBusinesses.length +
            (state.personalAssets ?? []).length,
          propertiesCount: updatedProperties.length,
        }
      );

  // Update happiness & reset turn action counter + roll new monthly random happiness items
  let triggeredOverdraft = false;
  if (notes.some((n) => n.includes('Emergency Credit Line'))) {
    triggeredOverdraft = true;
  }
  const activeOpsPenalty = state.businesses.some((b) => !b.isAutomated) ? 3 : 0;
  const happinessDelta =
    -3 -
    activeOpsPenalty -
    (triggeredOverdraft ? 5 : 0) +
    familyHappinessDelta -
    (yearlyMissingAssetsHappinessLoss ?? 0) -
    (uninsuredAccidentHappinessLoss ?? 0);
  const nextHappiness = Math.max(0, (state.happiness ?? 70) + happinessDelta);

  const netTurnCashChange = roundMoney(runningCash - state.cash);

  const monthlyNetTaxable = Math.max(
    0,
    roundMoney(
      salaryReceived +
        totalPassiveIncomeReceived +
        activeBizRev -
        bizExpPaid -
        propExpPaid -
        loanPaymentsPaid * 0.3
    )
  );
  const updatedTaxableYTD = Math.max(
    0,
    roundMoney((state.taxableIncomeYTD ?? 0) + monthlyNetTaxable + realizedGainFromOpps)
  );

  let nextState: GameState = {
    ...state,
    currentTurn: nextTurn,
    lastProcessedTurn: nextTurn,
    year: nextYear,
    month: nextMonth,
    cash: runningCash,
    livingExpenses: nextLivingExpenses,
    happiness: nextHappiness,
    actionsUsedThisTurn: 0,
    monthlyExpensePaidThisTurn: false,
    monthlyExpensePaidAmountThisTurn: 0,
    activeVentures: rollVenturesForProfession(state.professionId, 2),
    activeHappinessItems: rollMonthlyHappinessItems(state.professionId, 5),
    purchasedHappinessIdsThisTurn: [],
    handledHappinessIdsThisTurn: [],
    ignoredHappinessIdsThisTurn: [],
    playedLotteryIdsThisTurn: [],
    inflationRate: nextInflationRate,
    inflationMultiplier: nextInflationMultiplier,
    maritalStatus: nextMaritalStatus,
    childrenCount: nextChildrenCount,
    divorceCount: nextDivorceCount,
    fixedIncome: updatedFixedIncome,
    loans: updatedLoans,
    properties: updatedProperties,
    businesses: updatedBusinesses,
    market: nextMarket,
    pendingEvents: newEvents,
    pendingOpportunityDeals: [],
    eventHistory: [...expiredOpportunities, ...state.eventHistory].slice(0, 100),
    transactions: txs,
    realizedInvestmentPnL: roundMoney((state.realizedInvestmentPnL ?? 0) + realizedGainFromOpps),
    blackSwanScheduleYear: activeBlackSwanYear,
    blackSwanScheduledMonths: activeBlackSwanMonths,
    taxableIncomeYTD: updatedTaxableYTD,
  };

  const preZakatSummary = computeFinancialSummary(nextState);
  let nextZakatAccrualMonths = state.zakatAccrualMonths ?? 0;
  if (preZakatSummary.zakatEligible) {
    nextZakatAccrualMonths = Math.min(12, nextZakatAccrualMonths + 1);
  }
  nextState = {
    ...nextState,
    zakatAccrualMonths: nextZakatAccrualMonths,
  };

  let zakatAssessedThisYearEnd: number | undefined;
  let taxAssessedThisYearEnd: number | undefined;

  if (nextMonth === 1) {
    const yearEndSummary = computeFinancialSummary(nextState);
    const zakatAssessed = yearEndSummary.zakatAccruedCurrent;
    const taxAssessed = yearEndSummary.incomeTaxAccruedCurrent;
    if (zakatAssessed > 0) {
      zakatAssessedThisYearEnd = zakatAssessed;
      notes.push(`Year-End Islamic Zakat due: ${formatCurrency(zakatAssessed)} (2.5% on eligible wealth).`);
    }
    if (taxAssessed > 0) {
      taxAssessedThisYearEnd = taxAssessed;
      notes.push(`Year-End Income Tax assessed: ${formatCurrency(taxAssessed)}.`);
    }
    nextState = {
      ...nextState,
      zakatDueBalance: roundMoney((state.zakatDueBalance ?? 0) + zakatAssessed),
      zakatAccrualMonths: 0,
      zakatPaidAdvanceThisYear: 0,
      incomeTaxDueBalance: roundMoney((state.incomeTaxDueBalance ?? 0) + taxAssessed),
      taxableIncomeYTD: 0,
      incomeTaxPaidAdvanceThisYear: 0,
    };
  }

  const summaryAfter = computeFinancialSummary(nextState);
  const newVictoryTriggered = !state.victoryAchieved && summaryAfter.isFinanciallyFree;

  if (newVictoryTriggered) {
    nextState = {
      ...nextState,
      victoryAchieved: true,
      victoryTurn: nextTurn,
    };
  }

  nextState = checkGameOver(nextState);

  const prevSnap = state.monthlyHistory[state.monthlyHistory.length - 1];
  const actionsDuringTurn: TurnActionItem[] = state.transactions
    .filter((tx) => tx.turn === state.currentTurn && !isAutomatedTurnSettlementTx(tx.description))
    .slice()
    .reverse()
    .map((tx) => ({
      category: tx.category,
      description: tx.description,
      amount: tx.amount,
    }));

  const netWorthDelta = roundMoney(
    summaryAfter.netWorth - (prevSnap?.netWorth ?? summaryBefore.netWorth)
  );
  const passiveIncomeDelta = roundMoney(
    summaryAfter.passiveIncome - (prevSnap?.passiveIncome ?? summaryBefore.passiveIncome)
  );
  const freedomProgressPctAfter = Number(summaryAfter.freedomProgressPct.toFixed(1));
  const prevFreedomPct = prevSnap?.freedomProgressPct ?? summaryBefore.freedomProgressPct;
  const freedomProgressDelta = Number((summaryAfter.freedomProgressPct - prevFreedomPct).toFixed(1));
  const monthlyHappinessNetDelta = nextHappiness - (prevSnap?.happiness ?? state.happiness ?? 70);

  const prevSalaryBase = prevSnap?.salaryIncome ?? summaryBefore.salaryIncome;
  const salaryChangePct =
    prevSalaryBase > 0
      ? Math.round(((summaryAfter.salaryIncome - prevSalaryBase) / prevSalaryBase) * 100)
      : 0;

  // Compute investment performance per category (market revaluation + monthly cash yield)
  const investmentResults: TurnInvestmentResultItem[] = [];

  const equityHoldings = state.stocks.filter((h) => h.symbol !== 'GOLDM');
  if (equityHoldings.length > 0) {
    let valBefore = 0;
    let valAfter = 0;
    for (const h of equityHoldings) {
      const pBefore = state.market.stocks[h.symbol]?.currentPrice ?? h.avgBuyPrice;
      const pAfter = nextMarket.stocks[h.symbol]?.currentPrice ?? pBefore;
      valBefore += h.shares * pBefore;
      valAfter += h.shares * pAfter;
    }
    valBefore = roundMoney(valBefore);
    valAfter = roundMoney(valAfter);
    if (valBefore > 0) {
      const amountDelta = roundMoney(valAfter - valBefore + stockDividendIncome);
      const returnPct = Math.round((amountDelta / valBefore) * 100);
      investmentResults.push({
        category: 'stocks',
        labelEn: 'Stocks',
        labelBn: 'শেয়ার',
        valueBefore: valBefore,
        valueAfter: valAfter,
        cashEarned: stockDividendIncome,
        returnPct,
        amountDelta,
      });
    }
  }

  const goldHoldings = state.stocks.filter((h) => h.symbol === 'GOLDM');
  if (goldHoldings.length > 0) {
    let valBefore = 0;
    let valAfter = 0;
    for (const h of goldHoldings) {
      const pBefore = state.market.stocks.GOLDM?.currentPrice ?? h.avgBuyPrice;
      const pAfter = nextMarket.stocks.GOLDM?.currentPrice ?? pBefore;
      valBefore += h.shares * pBefore;
      valAfter += h.shares * pAfter;
    }
    valBefore = roundMoney(valBefore);
    valAfter = roundMoney(valAfter);
    if (valBefore > 0) {
      const amountDelta = roundMoney(valAfter - valBefore + goldDividendIncome);
      const returnPct = Math.round((amountDelta / valBefore) * 100);
      investmentResults.push({
        category: 'gold',
        labelEn: 'Gold',
        labelBn: 'সোনা',
        valueBefore: valBefore,
        valueAfter: valAfter,
        cashEarned: goldDividendIncome,
        returnPct,
        amountDelta,
      });
    }
  }

  if (state.crypto.length > 0) {
    let valBefore = 0;
    let valAfter = 0;
    for (const c of state.crypto) {
      const pBefore = state.market.crypto[c.symbol]?.currentPrice ?? c.avgBuyPrice;
      const pAfter = nextMarket.crypto[c.symbol]?.currentPrice ?? pBefore;
      valBefore += c.units * pBefore;
      valAfter += c.units * pAfter;
    }
    valBefore = roundMoney(valBefore);
    valAfter = roundMoney(valAfter);
    if (valBefore > 0) {
      const amountDelta = roundMoney(valAfter - valBefore);
      const returnPct = Math.round((amountDelta / valBefore) * 100);
      investmentResults.push({
        category: 'crypto',
        labelEn: 'Crypto',
        labelBn: 'ক্রিপ্টো',
        valueBefore: valBefore,
        valueAfter: valAfter,
        cashEarned: 0,
        returnPct,
        amountDelta,
      });
    }
  }

  if (state.fixedIncome.length > 0) {
    const valBefore = roundMoney(state.fixedIncome.reduce((s, f) => s + f.currentValue, 0));
    const valAfter = roundMoney(
      updatedFixedIncome.reduce((s, f) => s + f.currentValue, 0) + maturedPayout
    );
    const fixedYield = roundMoney(bondInterestPaid + savingsInterestPaid);
    if (valBefore > 0) {
      const amountDelta = fixedYield;
      const rawPct = (amountDelta / valBefore) * 100;
      const returnPct = Math.abs(rawPct) >= 1 ? Math.round(rawPct) : Number(rawPct.toFixed(1));
      investmentResults.push({
        category: 'bonds',
        labelEn: 'Bonds & Savings',
        labelBn: 'সরকারি বন্ড',
        valueBefore: valBefore,
        valueAfter: valAfter,
        cashEarned: fixedYield,
        returnPct,
        amountDelta,
      });
    }
  }

  if (state.properties.length > 0) {
    const valBefore = roundMoney(state.properties.reduce((s, p) => s + p.currentValue, 0));
    const valAfter = roundMoney(updatedProperties.reduce((s, p) => s + p.currentValue, 0));
    const netRent = roundMoney(rentalIncome - propExpPaid);
    if (valBefore > 0) {
      const amountDelta = roundMoney(valAfter - valBefore + netRent);
      const returnPct = Math.round((amountDelta / valBefore) * 100);
      investmentResults.push({
        category: 'real_estate',
        labelEn: 'Real Estate',
        labelBn: 'রিয়েল এস্টেট',
        valueBefore: valBefore,
        valueAfter: valAfter,
        cashEarned: netRent,
        returnPct,
        amountDelta,
      });
    }
  }

  if (state.businesses.length > 0) {
    const valBefore = roundMoney(state.businesses.reduce((s, b) => s + b.currentValue, 0));
    const valAfter = roundMoney(updatedBusinesses.reduce((s, b) => s + b.currentValue, 0));
    const netBiz = roundMoney(automatedBizRev + activeBizRev - bizExpPaid);
    if (valBefore > 0) {
      const amountDelta = roundMoney(valAfter - valBefore + netBiz);
      const returnPct = Math.round((amountDelta / valBefore) * 100);
      investmentResults.push({
        category: 'businesses',
        labelEn: 'Businesses',
        labelBn: 'ব্যবসা',
        valueBefore: valBefore,
        valueAfter: valAfter,
        cashEarned: netBiz,
        returnPct,
        amountDelta,
      });
    }
  }

  // Compute Desires / Happiness impacts for the turn
  const desireImpacts: TurnDesireImpactItem[] = [];
  const ownedPersonalAssets = state.personalAssets ?? [];

  for (const asset of ownedPersonalAssets) {
    if (asset.purchasedTurn === state.currentTurn) {
      const tpl = getPersonalAssetById(asset.id);
      desireImpacts.push({
        id: `bought_${asset.id}`,
        labelEn: tpl.nameEn,
        labelBn: tpl.nameBn,
        delta: tpl.buyHappinessBonus,
      });
    }
  }

  if (nextMonth === 1) {
    const ownedSet = new Set(ownedPersonalAssets.map((o) => o.id));
    for (const tpl of PERSONAL_ASSETS) {
      if (!ownedSet.has(tpl.id) && tpl.yearlyHappinessPenalty > 0) {
        desireImpacts.push({
          id: `missing_${tpl.id}`,
          labelEn: tpl.nameEn,
          labelBn: tpl.nameBn,
          delta: -tpl.yearlyHappinessPenalty,
        });
      }
    }
  }

  const happinessPool = withPilgrimageHappinessItems(
    [
      ...(state.activeHappinessItems ?? []),
      ...getHappinessItemsForProfession(state.professionId),
      ...ALL_HAPPINESS_ITEMS,
    ],
    state.professionId
  );
  for (const hid of state.purchasedHappinessIdsThisTurn ?? []) {
    const item = happinessPool.find((h) => h.id === hid);
    if (item && item.happinessGain !== 0) {
      desireImpacts.push({
        id: `hap_${hid}`,
        labelEn: item.nameEn,
        labelBn: item.nameBn,
        delta: item.happinessGain,
      });
    }
  }
  for (const hid of state.ignoredHappinessIdsThisTurn ?? []) {
    if (hid === '__marry__') {
      desireImpacts.push({
        id: `ign_${hid}`,
        labelEn: 'Ignored Marriage',
        labelBn: 'বিয়ে এড়িয়ে গেছেন',
        delta: -18,
      });
    } else {
      const item = happinessPool.find((h) => h.id === hid);
      if (item && item.happinessGain !== 0) {
        desireImpacts.push({
          id: `ign_${hid}`,
          labelEn: `${item.nameEn} (Ignored)`,
          labelBn: `${item.nameBn} (ইগনোর)`,
          delta: -item.happinessGain,
        });
      }
    }
  }

  const turnTxs = state.transactions.filter((tx) => tx.turn === state.currentTurn);
  if (turnTxs.some((tx) => tx.description.startsWith('Wedding Ceremony'))) {
    desireImpacts.push({
      id: 'wedding',
      labelEn: 'Marriage',
      labelBn: 'নতুন বিয়ে',
      delta: 18,
    });
  }

  if (babyBornThisTurn) {
    desireImpacts.push({
      id: 'baby_born',
      labelEn: 'New Baby',
      labelBn: 'সন্তান জন্ম',
      delta: 14,
    });
  }
  if (divorceThisTurn) {
    desireImpacts.push({
      id: 'divorce',
      labelEn: 'Divorce',
      labelBn: 'বিবাহ বিচ্ছেদ',
      delta: -14,
    });
  }
  if (uninsuredAccidentOccurred && uninsuredAccidentAssetId) {
    const tpl = getPersonalAssetById(uninsuredAccidentAssetId);
    desireImpacts.push({
      id: 'accident_hap',
      labelEn: `Accident (${tpl.nameEn})`,
      labelBn: `দুর্ঘটনা (${tpl.nameBn})`,
      delta: -(uninsuredAccidentHappinessLoss ?? tpl.accidentHappinessLoss),
    });
  }
  if (activeOpsPenalty > 0) {
    desireImpacts.push({
      id: 'active_biz_stress',
      labelEn: 'Owner-Operated Business',
      labelBn: 'স্ব-পরিচালিত ব্যবসা',
      delta: -activeOpsPenalty,
    });
  }
  if (triggeredOverdraft) {
    desireImpacts.push({
      id: 'overdraft_stress',
      labelEn: 'Emergency Credit Stress',
      labelBn: 'জরুরি ঋণের চাপ',
      delta: -5,
    });
  }
  if (turnTxs.some((tx) => tx.description.includes('Islamic Zakat'))) {
    desireImpacts.push({
      id: 'zakat_peace',
      labelEn: 'Zakat Peace of Mind',
      labelBn: 'জাকাত পরিশোধ',
      delta: 5,
    });
  }
  if (turnTxs.some((tx) => tx.description.includes('Income Tax'))) {
    desireImpacts.push({
      id: 'tax_peace',
      labelEn: 'Income Tax Cleared',
      labelBn: 'আয়কর পরিশোধ',
      delta: 4,
    });
  }
  if (desireImpacts.length === 0) {
    desireImpacts.push({
      id: 'monthly_routine',
      labelEn: 'Work-Life Routine',
      labelBn: 'মাসিক কর্মচাপ',
      delta: -3,
    });
  }

  // Build Event Summary Cards for the turn
  const eventSummaryCards: TurnEventSummaryCard[] = [...settledOpportunityCards];

  const resolvedThisTurn = state.eventHistory.filter(
    (evt) =>
      evt.resolvedTurn === state.currentTurn &&
      evt.chosenChoiceId &&
      evt.resolutionNote !== 'Ignored' &&
      evt.resolutionNote !== 'Passed / Declined' &&
      evt.resolutionNote !== 'Pending month-end settlement' &&
      !settledEventIds.has(evt.id)
  );
  for (const evt of resolvedThisTurn) {
    const enCard = localizeEventCard(evt, 'en');
    const bnCard = localizeEventCard(evt, 'bn');
    const chosenChoice = evt.choices.find((c) => c.id === evt.chosenChoiceId);

    const isMedicalInsured = evt.templateId === 'exp_medical' && Boolean(state.healthInsured);
    const isCarInsured =
      evt.templateId === 'exp_car_repair' &&
      (Boolean(state.propertyInsured) ||
        ownedPersonalAssets.some((a) => a.id === 'car' && a.insured));
    const isHomeInsured =
      evt.templateId === 'exp_home_repair' &&
      (Boolean(state.propertyInsured) ||
        ownedPersonalAssets.some((a) => (a.id === 'house' || a.id === 'villa') && a.insured));
    const insuredCovered =
      chosenChoice?.effectType === 'cash_delta' &&
      (chosenChoice.amount ?? 0) < 0 &&
      (isMedicalInsured || isCarInsured || isHomeInsured);

    const paidAmt = insuredCovered
      ? roundMoney(Math.abs(chosenChoice?.amount ?? 0) * 0.15)
      : Math.abs(chosenChoice?.amount ?? 0);

    eventSummaryCards.push({
      id: evt.id,
      kind: 'resolved_event',
      titleEn: enCard.title,
      titleBn: bnCard.title,
      descriptionEn: enCard.description,
      descriptionBn: bnCard.description,
      resultLabelEn: insuredCovered
        ? `Insurance covered 85% (Paid: ${formatCurrency(paidAmt)})`
        : chosenChoice?.effectType === 'cash_delta' && (chosenChoice.amount ?? 0) < 0
          ? `Paid: ${formatCurrency(paidAmt)}`
          : chosenChoice?.effectType === 'cash_delta' && (chosenChoice.amount ?? 0) > 0
            ? `Received: +${formatCurrency(paidAmt)}`
            : evt.resolutionNote ?? bnCard.financialImpactSummary,
      resultLabelBn: insuredCovered
        ? `বীমা ৮৫% কভার করেছে (পরিশোধ: ${formatCurrency(paidAmt)})`
        : chosenChoice?.effectType === 'cash_delta' && (chosenChoice.amount ?? 0) < 0
          ? `পরিশোধ: ${formatCurrency(paidAmt)}`
          : chosenChoice?.effectType === 'cash_delta' && (chosenChoice.amount ?? 0) > 0
            ? `প্রাপ্ত: +${formatCurrency(paidAmt)}`
            : bnCard.financialImpactSummary,
      tone: insuredCovered || (chosenChoice?.amount ?? 0) > 0 ? 'positive' : 'neutral',
    });
  }

  if (blackSwanTriggered) {
    eventSummaryCards.push({
      id: `bs_${nextTurn}`,
      kind: 'black_swan',
      titleEn: 'Black Swan Market Crash',
      titleBn: 'কালো রাজহাঁস বাজার ধস',
      descriptionEn: `Equities and crypto dropped -${blackSwanMarketDropPct ?? 30}%, while ${blackSwanWinnerEn} surged +${blackSwanGoldSurgePct ?? 68}%.`,
      descriptionBn: `শেয়ার ও ক্রিপ্টো বাজার -${blackSwanMarketDropPct ?? 30}% কমেছে, তবে ${blackSwanWinnerBn} +${blackSwanGoldSurgePct ?? 68}% বেড়েছে।`,
      resultLabelEn:
        (blackSwanGoldProfit ?? 0) > 0
          ? `${blackSwanWinnerEn} Profit: +${formatCurrency(blackSwanGoldProfit ?? 0)} (+${blackSwanGoldSurgePct ?? 68}%)`
          : `Market Drop: -${blackSwanMarketDropPct ?? 30}% · ${blackSwanWinnerEn} +${blackSwanGoldSurgePct ?? 68}%`,
      resultLabelBn:
        (blackSwanGoldProfit ?? 0) > 0
          ? `${blackSwanWinnerBn} থেকে লাভ: +${formatCurrency(blackSwanGoldProfit ?? 0)} (+${blackSwanGoldSurgePct ?? 68}%)`
          : `বাজার পতন: -${blackSwanMarketDropPct ?? 30}% · ${blackSwanWinnerBn} +${blackSwanGoldSurgePct ?? 68}%`,
      tone: (blackSwanGoldProfit ?? 0) > 0 ? 'gold' : 'negative',
    });
  }

  if (uninsuredAccidentOccurred && uninsuredAccidentAssetId) {
    const tpl = getPersonalAssetById(uninsuredAccidentAssetId);
    eventSummaryCards.push({
      id: `acc_${nextTurn}`,
      kind: 'accident',
      titleEn: `Uninsured Accident: ${tpl.nameEn}`,
      titleBn: `বীমাহীন দুর্ঘটনা: ${tpl.nameBn}`,
      descriptionEn: `Your uninsured ${tpl.nameEn.toLowerCase()} suffered unexpected damage without insurance coverage.`,
      descriptionBn: `বীমা না থাকায় আপনার ${tpl.nameBn}-এর ক্ষয়ক্ষতি নিজেকেই বহন করতে হয়েছে।`,
      resultLabelEn: `Paid: ${formatCurrency(uninsuredAccidentCashLoss ?? 0)} · -${uninsuredAccidentHappinessLoss ?? tpl.accidentHappinessLoss} Happiness`,
      resultLabelBn: `পরিশোধ: ${formatCurrency(uninsuredAccidentCashLoss ?? 0)} · -${uninsuredAccidentHappinessLoss ?? tpl.accidentHappinessLoss} সুখ`,
      tone: 'negative',
    });
  }

  if (babyBornThisTurn) {
    eventSummaryCards.push({
      id: `baby_${nextTurn}`,
      kind: 'baby',
      titleEn: 'New Baby Arrived',
      titleBn: 'নতুন সন্তানের আগমন',
      descriptionEn: 'Your family welcomed a newborn baby, bringing joy and new monthly childcare expenses.',
      descriptionBn: 'পরিবারে নতুন সন্তানের জন্ম হয়েছে, যা আনন্দ ও মাসিক যত্ন খরচ যোগ করেছে।',
      resultLabelEn:
        babyBirthCostPaid > 0
          ? `Care Cost: ${formatCurrency(babyBirthCostPaid)} · +14 Happiness`
          : '+14 Happiness',
      resultLabelBn:
        babyBirthCostPaid > 0
          ? `খরচ: ${formatCurrency(babyBirthCostPaid)} · +১৪ সুখ`
          : '+১৪ সুখ',
      tone: 'positive',
    });
  }

  if (divorceThisTurn) {
    eventSummaryCards.push({
      id: `div_${nextTurn}`,
      kind: 'divorce',
      titleEn: 'Marital Separation',
      titleBn: 'বিবাহ বিচ্ছেদ',
      descriptionEn: 'Relationship challenges led to separation and legal settlement.',
      descriptionBn: 'পারিবারিক জটিলতায় বিবাহ বিচ্ছেদ ও আইনি মীমাংসা হয়েছে।',
      resultLabelEn:
        (divorceSettlementPaid ?? 0) > 0
          ? `Settlement: ${formatCurrency(divorceSettlementPaid ?? 0)} · -14 Happiness`
          : '-14 Happiness',
      resultLabelBn:
        (divorceSettlementPaid ?? 0) > 0
          ? `মীমাংসা: ${formatCurrency(divorceSettlementPaid ?? 0)} · -১৪ সুখ`
          : '-১৪ সুখ',
      tone: 'negative',
    });
  }

  if ((zakatAssessedThisYearEnd ?? 0) > 0 || (taxAssessedThisYearEnd ?? 0) > 0) {
    const zAmt = zakatAssessedThisYearEnd ?? 0;
    const tAmt = taxAssessedThisYearEnd ?? 0;
    eventSummaryCards.push({
      id: `tz_${nextTurn}`,
      kind: 'tax_zakat',
      titleEn: 'Year-End Zakat & Income Tax',
      titleBn: 'বছর শেষের জাকাত ও আয়কর',
      descriptionEn: 'Annual Zakat (2.5% on eligible wealth) and progressive Income Tax have been assessed.',
      descriptionBn: 'বার্ষিক ইসলামী জাকাত (২.৫%) ও আয়কর নির্ধারিত হয়েছে।',
      resultLabelEn: `Zakat ${formatCurrency(zAmt)} · Tax ${formatCurrency(tAmt)}`,
      resultLabelBn: `জাকাত ${formatCurrency(zAmt)} · আয়কর ${formatCurrency(tAmt)}`,
      tone: 'gold',
    });
  }

  if (annualInflationPct !== undefined) {
    const hasPrevYear = state.year >= 2;
    const trendDeltaPct = hasPrevYear ? annualInflationPct - previousInflationRate : undefined;
    eventSummaryCards.push({
      id: `inf_${nextTurn}`,
      kind: 'inflation',
      titleEn: 'Inflation',
      titleBn: 'মুদ্রাস্ফীতি',
      descriptionEn:
        annualInflationPct > 0
          ? 'Prices for all goods and services (including insurance and education) increased by:'
          : 'Prices for goods and services remained unchanged this year:',
      descriptionBn:
        annualInflationPct > 0
          ? 'সকল পণ্য ও পরিষেবার (বীমা ও শিক্ষা সহ) মূল্য বৃদ্ধি পেয়েছে:'
          : 'এ বছর পণ্য ও পরিষেবার মূল্য স্থিতিশীল রয়েছে:',
      highlightPct: annualInflationPct,
      trendDeltaPct,
      previousPct: hasPrevYear ? previousInflationRate : undefined,
      resultLabelEn:
        inflationLivingCostDelta > 0
          ? `Monthly expenses up: +${formatCurrency(inflationLivingCostDelta)}/mo`
          : 'Monthly living expenses unchanged ($0)',
      resultLabelBn:
        inflationLivingCostDelta > 0
          ? `মাসিক জীবনযাত্রার খরচ বেড়েছে: +${formatCurrency(inflationLivingCostDelta)}/মাস`
          : 'মাসিক জীবনযাত্রার খরচ অপরিবর্তিত ($0)',
      tone: annualInflationPct > 0 ? 'negative' : 'positive',
    });
  }

  const freedomCapitalGoal = Math.max(
    50000,
    Math.round(((summaryAfter.totalExpenses * 150) || 175000) / 1000) * 1000
  );

  const turnSummary: TurnSummary = {
    turn: nextTurn,
    year: nextYear,
    month: nextMonth,
    completedTurn: state.currentTurn,
    completedYear: state.year,
    completedMonth: state.month,
    cashAfter: summaryAfter.cashAsset,
    totalAssetsAfter: summaryAfter.totalAssets,
    totalExpensesAfter: summaryAfter.totalExpenses,
    freedomCapitalGoal,
    salaryChangePct,
    salaryReceived,
    passiveIncomeReceived: totalPassiveIncomeReceived,
    stockDividendsReceived: stockDividendIncome,
    goldDividendsReceived: goldDividendIncome,
    bondInterestReceived: bondInterestPaid,
    savingsInterestReceived: savingsInterestPaid,
    rentalIncomeReceived: rentalIncome,
    automatedBusinessReceived: automatedBizRev,
    otherPassiveReceived: otherPassive,
    activeBusinessRevenue: activeBizRev,
    livingExpensesPaid: livingPaid,
    insurancePaid,
    loanPaymentsPaid,
    businessExpensesPaid: bizExpPaid,
    propertyExpensesPaid: propExpPaid,
    maturedFixedIncomePayout: maturedPayout,
    emergencyCreditDrawn: overdraftDrawn > 0 ? overdraftDrawn : undefined,
    babyBirthCostPaid: babyBirthCostPaid > 0 ? babyBirthCostPaid : undefined,
    netTurnCashChange,
    netWorthAfter: summaryAfter.netWorth,
    netWorthDelta,
    passiveIncomeAfter: summaryAfter.passiveIncome,
    passiveIncomeDelta,
    freedomProgressPctAfter,
    freedomProgressDelta,
    happinessAfter: nextHappiness,
    happinessDelta: monthlyHappinessNetDelta,
    actionsCountThisTurn: state.actionsUsedThisTurn ?? 0,
    actionsDuringTurn,
    investmentResults,
    desireImpacts,
    eventSummaryCards,
    eventsGeneratedCount: newEvents.length,
    newVictoryTriggered,
    blackSwanTriggered,
    blackSwanMarketDropPct,
    blackSwanGoldSurgePct,
    blackSwanGoldProfit,
    annualInflationPct,
    previousInflationRate: state.year >= 2 ? previousInflationRate : undefined,
    inflationRateCurrent: nextInflationRate,
    inflationLivingCostDelta: inflationLivingCostDelta > 0 ? inflationLivingCostDelta : undefined,
    babyBornThisTurn,
    divorceThisTurn,
    divorceSettlementPaid,
    yearlyMissingAssetsHappinessLoss,
    uninsuredAccidentOccurred,
    uninsuredAccidentAssetId,
    uninsuredAccidentCashLoss,
    uninsuredAccidentHappinessLoss,
    zakatAssessedThisYearEnd,
    taxAssessedThisYearEnd,
    notes,
  };

  const snap: MonthlySnapshot = {
    turn: nextTurn,
    year: nextYear,
    month: nextMonth,
    label: formatShortLabel(nextYear, nextMonth),
    salaryIncome: summaryAfter.salaryIncome,
    passiveIncome: summaryAfter.passiveIncome,
    activeBusinessIncome: summaryAfter.activeBusinessIncome,
    totalIncome: summaryAfter.totalIncome,
    livingExpenses: summaryAfter.livingExpensesTotal,
    loanPayments: summaryAfter.loanPaymentsTotal,
    businessExpenses: summaryAfter.businessExpensesTotal,
    propertyExpenses: summaryAfter.propertyExpensesTotal,
    totalExpenses: summaryAfter.totalExpenses,
    cashFlow: summaryAfter.monthlyCashFlow,
    cashOnHand: summaryAfter.cashAsset,
    totalAssets: summaryAfter.totalAssets,
    totalLiabilities: summaryAfter.totalLiabilities,
    netWorth: summaryAfter.netWorth,
    investmentPnL: summaryAfter.totalInvestmentPnL,
    happiness: nextHappiness,
    freedomProgressPct: freedomProgressPctAfter,
  };

  nextState = {
    ...nextState,
    lastTurnSummary: turnSummary,
    monthlyHistory: [...state.monthlyHistory, snap],
  };

  return { state: nextState };
}

// ==========================================
// STOCKS
// ==========================================
export function buyStock(
  state: GameState,
  symbol: string,
  shares: number,
  priceOverride?: number,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const qty = Math.floor(shares);
  if (qty <= 0) {
    return {
      state,
      error: lang === 'bn' ? 'কেনার জন্য কমপক্ষে ১টি শেয়ার লিখুন।' : 'Enter at least 1 share to purchase.',
    };
  }

  const def = STOCK_CATALOG.find((s) => s.symbol === symbol);
  const mkt = state.market.stocks[symbol];
  if (!def || !mkt) {
    return { state, error: lang === 'bn' ? 'শেয়ার পাওয়া যায়নি।' : 'Stock symbol not found.' };
  }

  const unitPrice = priceOverride ?? mkt.currentPrice;
  const totalCost = roundMoney(unitPrice * qty);
  const dispSym = localizeStock(symbol, lang).symbol;

  if (state.cash < totalCost) {
    return {
      state,
      error:
        lang === 'bn'
          ? `পর্যাপ্ত নগদ নেই। প্রয়োজন ${formatCurrency(totalCost)}, হাতে আছে ${formatCurrency(state.cash)}।`
          : `Insufficient cash. Need ${formatCurrency(totalCost)}, available ${formatCurrency(state.cash)}.`,
    };
  }

  const nextCash = roundMoney(state.cash - totalCost);
  const existing = state.stocks.find((h) => h.symbol === symbol);
  let nextStocks = [...state.stocks];

  if (existing) {
    const newShares = existing.shares + qty;
    const newAvg = roundMoney((existing.shares * existing.avgBuyPrice + totalCost) / newShares);
    nextStocks = nextStocks.map((h) =>
      h.symbol === symbol ? { ...h, shares: newShares, avgBuyPrice: newAvg } : h
    );
  } else {
    nextStocks.push({
      symbol: def.symbol,
      name: def.name,
      sector: def.sector,
      shares: qty,
      avgBuyPrice: unitPrice,
      annualDividendPerShare: def.annualDividendPerShare,
    });
  }

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Stock Trade',
    `Bought ${qty} sh ${symbol} @ ${formatCurrency(unitPrice)}`,
    -totalCost,
    nextCash
  );

  const nextState = checkVictory({
    ...state,
    cash: nextCash,
    stocks: nextStocks,
    actionsUsedThisTurn: Math.min(6, (state.actionsUsedThisTurn ?? 0) + 1),
    transactions: txs,
  });
  return {
    state: nextState,
    successMessage:
      lang === 'bn'
        ? `${formatCurrency(totalCost)} মূল্যে ${qty}টি ${dispSym} শেয়ার কেনা হয়েছে।`
        : `Bought ${qty} shares of ${symbol} for ${formatCurrency(totalCost)}.`,
  };
}

export function sellStock(
  state: GameState,
  symbol: string,
  shares: number,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const qty = Math.floor(shares);
  if (qty <= 0) {
    return {
      state,
      error: lang === 'bn' ? 'বিক্রির জন্য কমপক্ষে ১টি শেয়ার লিখুন।' : 'Enter at least 1 share to sell.',
    };
  }

  const dispSym = localizeStock(symbol, lang).symbol;
  const existing = state.stocks.find((h) => h.symbol === symbol);
  if (!existing || existing.shares < qty) {
    return {
      state,
      error:
        lang === 'bn'
          ? `${qty}টি ${dispSym} শেয়ার বিক্রি করা যাবে না; আপনার কাছে আছে ${existing?.shares ?? 0}টি।`
          : `Cannot sell ${qty} shares of ${symbol}; you only own ${existing?.shares ?? 0}.`,
    };
  }

  const price = state.market.stocks[symbol]?.currentPrice ?? existing.avgBuyPrice;
  const proceeds = roundMoney(price * qty);
  const realizedGain = roundMoney((price - existing.avgBuyPrice) * qty);
  const nextCash = roundMoney(state.cash + proceeds);

  const remaining = existing.shares - qty;
  const nextStocks =
    remaining > 0
      ? state.stocks.map((h) => (h.symbol === symbol ? { ...h, shares: remaining } : h))
      : state.stocks.filter((h) => h.symbol !== symbol);

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Stock Trade',
    `Sold ${qty} sh ${symbol} @ ${formatCurrency(price)} (P&L ${formatCurrency(realizedGain, true)})`,
    proceeds,
    nextCash
  );

  const nextState = checkVictory({
    ...state,
    cash: nextCash,
    stocks: nextStocks,
    realizedInvestmentPnL: roundMoney(state.realizedInvestmentPnL + realizedGain),
    taxableIncomeYTD: Math.max(0, roundMoney((state.taxableIncomeYTD ?? 0) + realizedGain)),
    transactions: txs,
  });
  return {
    state: nextState,
    successMessage:
      lang === 'bn'
        ? `${qty}টি ${dispSym} শেয়ার ${formatCurrency(proceeds)}-এ বিক্রি হয়েছে।`
        : `Sold ${qty} shares of ${symbol} for ${formatCurrency(proceeds)}.`,
  };
}

// ==========================================
// CRYPTOCURRENCY
// ==========================================
export function buyCrypto(
  state: GameState,
  symbol: string,
  units: number,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const qty = roundMoney(units);
  if (qty <= 0) {
    return {
      state,
      error: lang === 'bn' ? 'কেনার জন্য সঠিক পরিমাণ লিখুন।' : 'Enter a valid quantity to buy.',
    };
  }

  const def = CRYPTO_CATALOG.find((c) => c.symbol === symbol);
  const mkt = state.market.crypto[symbol];
  if (!def || !mkt) {
    return { state, error: lang === 'bn' ? 'সম্পদ পাওয়া যায়নি।' : 'Asset not found.' };
  }

  const dispSym = localizeCrypto(symbol, lang).symbol;
  const totalCost = roundMoney(mkt.currentPrice * qty);
  if (state.cash < totalCost) {
    return {
      state,
      error:
        lang === 'bn'
          ? `পর্যাপ্ত নগদ নেই। প্রয়োজন ${formatCurrency(totalCost)}।`
          : `Insufficient cash. Need ${formatCurrency(totalCost)}.`,
    };
  }

  const nextCash = roundMoney(state.cash - totalCost);
  const existing = state.crypto.find((c) => c.symbol === symbol);
  let nextCrypto = [...state.crypto];

  if (existing) {
    const newUnits = roundMoney(existing.units + qty);
    const newAvg = roundMoney((existing.units * existing.avgBuyPrice + totalCost) / newUnits);
    nextCrypto = nextCrypto.map((c) =>
      c.symbol === symbol ? { ...c, units: newUnits, avgBuyPrice: newAvg } : c
    );
  } else {
    nextCrypto.push({
      symbol: def.symbol,
      name: def.name,
      units: qty,
      avgBuyPrice: mkt.currentPrice,
    });
  }

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Crypto',
    `Bought ${qty} ${symbol} @ ${formatCurrency(mkt.currentPrice)}`,
    -totalCost,
    nextCash
  );

  return {
    state: { ...state, cash: nextCash, crypto: nextCrypto, transactions: txs },
    successMessage:
      lang === 'bn'
        ? `${formatCurrency(totalCost)}-এ ${qty} ${dispSym} কেনা হয়েছে।`
        : `Purchased ${qty} ${symbol} for ${formatCurrency(totalCost)}.`,
  };
}

export function sellCrypto(
  state: GameState,
  symbol: string,
  units: number,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const qty = roundMoney(units);
  if (qty <= 0) {
    return {
      state,
      error: lang === 'bn' ? 'বিক্রির জন্য সঠিক পরিমাণ লিখুন।' : 'Enter a valid quantity to sell.',
    };
  }

  const dispSym = localizeCrypto(symbol, lang).symbol;
  const existing = state.crypto.find((c) => c.symbol === symbol);
  if (!existing || existing.units < qty - 0.0001) {
    return {
      state,
      error: lang === 'bn' ? `পর্যাপ্ত ${dispSym} ব্যালেন্স নেই।` : `Insufficient ${symbol} balance.`,
    };
  }

  const sellQty = Math.min(qty, existing.units);
  const price = state.market.crypto[symbol]?.currentPrice ?? existing.avgBuyPrice;
  const proceeds = roundMoney(price * sellQty);
  const realizedGain = roundMoney((price - existing.avgBuyPrice) * sellQty);
  const nextCash = roundMoney(state.cash + proceeds);

  const remaining = roundMoney(existing.units - sellQty);
  const nextCrypto =
    remaining > 0.0001
      ? state.crypto.map((c) => (c.symbol === symbol ? { ...c, units: remaining } : c))
      : state.crypto.filter((c) => c.symbol !== symbol);

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Crypto',
    `Sold ${sellQty} ${symbol} @ ${formatCurrency(price)}`,
    proceeds,
    nextCash
  );

  return {
    state: {
      ...state,
      cash: nextCash,
      crypto: nextCrypto,
      realizedInvestmentPnL: roundMoney(state.realizedInvestmentPnL + realizedGain),
      taxableIncomeYTD: Math.max(0, roundMoney((state.taxableIncomeYTD ?? 0) + realizedGain)),
      transactions: txs,
    },
    successMessage:
      lang === 'bn'
        ? `${sellQty} ${dispSym} বিক্রি করে ${formatCurrency(proceeds)} অর্জিত হয়েছে।`
        : `Sold ${sellQty} ${symbol} for ${formatCurrency(proceeds)}.`,
  };
}

// ==========================================
// REAL ESTATE
// ==========================================
export function buyProperty(
  state: GameState,
  listing: PropertyListing,
  useFinancing: boolean,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const cashRequired = useFinancing ? listing.downPayment : listing.purchasePrice;
  if (state.cash < cashRequired) {
    return {
      state,
      error:
        lang === 'bn'
          ? `পর্যাপ্ত নগদ নেই। প্রয়োজন ${formatCurrency(cashRequired)}, হাতে আছে ${formatCurrency(state.cash)}।`
          : `Insufficient cash. Need ${formatCurrency(cashRequired)}, available ${formatCurrency(state.cash)}.`,
    };
  }

  const summary = computeFinancialSummary(state);
  if (useFinancing && listing.loanAmount > summary.remainingBorrowingCapacity) {
    return {
      state,
      error:
        lang === 'bn'
          ? `মর্টগেজ (${formatCurrency(listing.loanAmount)}) আপনার অবশিষ্ট ঋণ সীমা (${formatCurrency(summary.remainingBorrowingCapacity)}) ছাড়িয়ে গেছে।`
          : `Mortgage (${formatCurrency(listing.loanAmount)}) exceeds your available borrowing capacity (${formatCurrency(summary.remainingBorrowingCapacity)}).`,
    };
  }

  const propId = uid('prop');
  let nextLoans = [...state.loans];
  let loanId: string | null = null;

  if (useFinancing && listing.loanAmount > 0) {
    loanId = uid('loan_prop');
    nextLoans.push({
      id: loanId,
      name: `Mortgage: ${listing.name}`,
      category: 'property',
      principal: listing.loanAmount,
      remainingBalance: listing.loanAmount,
      annualInterestRate: listing.loanAnnualRate,
      termMonths: listing.loanTermMonths,
      remainingMonths: listing.loanTermMonths,
      monthlyPayment: calculateMonthlyLoanPayment(
        listing.loanAmount,
        listing.loanAnnualRate,
        listing.loanTermMonths
      ),
      linkedAssetId: propId,
      originTurn: state.currentTurn,
    });
  }

  const newProp: OwnedProperty = {
    id: propId,
    name: listing.name,
    type: listing.type,
    location: listing.location,
    purchasePrice: listing.purchasePrice,
    downPayment: cashRequired,
    loanId,
    monthlyRentalIncome: listing.monthlyRentalIncome,
    maintenanceExpense: listing.maintenanceExpense,
    currentValue: listing.purchasePrice,
    purchasedTurn: state.currentTurn,
  };

  const nextCash = roundMoney(state.cash - cashRequired);
  const remainingListings = state.market.availableProperties.filter((p) => p.id !== listing.id);
  const dispName = localizeProperty(listing.name, listing.location, listing.description, lang).name;

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Real Estate',
    `Acquired ${listing.name} (${useFinancing ? `${formatCurrency(cashRequired)} down + mortgage` : 'All-cash'})`,
    -cashRequired,
    nextCash
  );

  const nextState = checkVictory({
    ...state,
    cash: nextCash,
    properties: [...state.properties, newProp],
    loans: nextLoans,
    actionsUsedThisTurn: Math.min(6, (state.actionsUsedThisTurn ?? 0) + 1),
    market: { ...state.market, availableProperties: remainingListings },
    transactions: txs,
  });

  return {
    state: nextState,
    successMessage:
      lang === 'bn'
        ? `${dispName} কেনা হয়েছে! মাসিক ভাড়া আয় +${formatCurrency(listing.monthlyRentalIncome)}/মাস।`
        : `Acquired ${listing.name}! Rental income +${formatCurrency(listing.monthlyRentalIncome)}/mo.`,
  };
}

export function sellProperty(
  state: GameState,
  propertyId: string,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const prop = state.properties.find((p) => p.id === propertyId);
  if (!prop) {
    return {
      state,
      error: lang === 'bn' ? 'মালিকানাধীন প্রপার্টি পাওয়া যায়নি।' : 'Owned property not found.',
    };
  }

  const linkedLoan = prop.loanId ? state.loans.find((l) => l.id === prop.loanId) : undefined;
  const payoffBalance = linkedLoan ? linkedLoan.remainingBalance : 0;
  const netEquity = roundMoney(prop.currentValue - payoffBalance);

  if (state.cash + netEquity < 0) {
    return {
      state,
      error:
        lang === 'bn'
          ? `বিক্রি সম্ভব নয়: মর্টগেজ বকেয়া বাজারমূল্যের চেয়ে ${formatCurrency(Math.abs(netEquity))} বেশি এবং নগদ ঘাটতি রয়েছে।`
          : `Cannot sell: mortgage payoff exceeds property value by ${formatCurrency(Math.abs(netEquity))} and cash is insufficient to cover shortfall.`,
    };
  }

  const nextCash = roundMoney(state.cash + netEquity);
  const realizedGain = roundMoney(prop.currentValue - prop.purchasePrice);
  const nextLoans = linkedLoan
    ? state.loans.filter((l) => l.id !== linkedLoan.id)
    : state.loans;
  const nextProperties = state.properties.filter((p) => p.id !== propertyId);
  const dispName = localizeProperty(prop.name, prop.location, undefined, lang).name;

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Real Estate',
    `Sold ${prop.name} for ${formatCurrency(prop.currentValue)} (Mortgage payoff ${formatCurrency(payoffBalance)})`,
    netEquity,
    nextCash
  );

  const nextState = checkVictory({
    ...state,
    cash: nextCash,
    properties: nextProperties,
    loans: nextLoans,
    realizedInvestmentPnL: roundMoney(state.realizedInvestmentPnL + realizedGain),
    taxableIncomeYTD: Math.max(0, roundMoney((state.taxableIncomeYTD ?? 0) + realizedGain)),
    transactions: txs,
  });

  return {
    state: nextState,
    successMessage:
      lang === 'bn'
        ? `${dispName} বিক্রি হয়েছে। নিট ${formatCurrency(netEquity)} নগদে জমা হয়েছে।`
        : `Sold ${prop.name}. Net proceeds ${formatCurrency(netEquity)} credited to cash.`,
  };
}

// ==========================================
// BUSINESSES
// ==========================================
export function buyOrStartBusiness(
  state: GameState,
  listing: BusinessListing,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const cost = listing.purchasePrice;
  if (state.cash < cost) {
    return {
      state,
      error:
        lang === 'bn'
          ? `পর্যাপ্ত নগদ নেই। প্রয়োজন ${formatCurrency(cost)}।`
          : `Insufficient cash. Need ${formatCurrency(cost)}.`,
    };
  }

  const newBiz: OwnedBusiness = {
    id: uid('biz'),
    name: listing.name,
    category: listing.category,
    mode: listing.mode,
    purchasePrice: listing.purchasePrice,
    initialInvestment: listing.initialInvestment,
    monthlyRevenue: listing.monthlyRevenue,
    monthlyOperatingExpenses: listing.monthlyOperatingExpenses,
    isAutomated: listing.isAutomated,
    automationUpgradeCost: listing.automationUpgradeCost,
    automationMonthlyFee: listing.automationMonthlyFee,
    currentValue: listing.purchasePrice,
    purchasedTurn: state.currentTurn,
  };

  const nextCash = roundMoney(state.cash - cost);
  const remainingListings = state.market.availableBusinesses.filter((b) => b.id !== listing.id);
  const dispName = localizeBusiness(listing.name, listing.category, listing.description, lang).name;

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Business Trade',
    `${listing.mode === 'startup' ? 'Launched' : 'Acquired'} ${listing.name}`,
    -cost,
    nextCash
  );

  const nextState = checkVictory({
    ...state,
    cash: nextCash,
    businesses: [...state.businesses, newBiz],
    actionsUsedThisTurn: Math.min(6, (state.actionsUsedThisTurn ?? 0) + 1),
    market: { ...state.market, availableBusinesses: remainingListings },
    transactions: txs,
  });

  return {
    state: nextState,
    successMessage:
      lang === 'bn'
        ? `${dispName} ${listing.mode === 'startup' ? 'শুরু হয়েছে!' : 'কেনা হয়েছে!'}`
        : `${listing.mode === 'startup' ? 'Launched' : 'Acquired'} ${listing.name}!`,
  };
}

export function automateBusiness(
  state: GameState,
  businessId: string,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const biz = state.businesses.find((b) => b.id === businessId);
  if (!biz) {
    return { state, error: lang === 'bn' ? 'ব্যবসা পাওয়া যায়নি।' : 'Business not found.' };
  }
  if (biz.isAutomated) {
    return {
      state,
      error:
        lang === 'bn'
          ? 'এই ব্যবসাটি ইতিমধ্যেই স্বয়ংক্রিয় করা হয়েছে।'
          : 'This business is already configured as automated.',
    };
  }

  const upgradeCost = biz.automationUpgradeCost || 5000;
  if (state.cash < upgradeCost) {
    return {
      state,
      error:
        lang === 'bn'
          ? `ম্যানেজার ও স্বয়ংক্রিয় ব্যবস্থা স্থাপনের জন্য ${formatCurrency(upgradeCost)} প্রয়োজন।`
          : `Need ${formatCurrency(upgradeCost)} to hire management & automate operations.`,
    };
  }

  const nextCash = roundMoney(state.cash - upgradeCost);
  const nextBusinesses = state.businesses.map((b) =>
    b.id === businessId
      ? {
          ...b,
          isAutomated: true,
          monthlyOperatingExpenses: roundMoney(b.monthlyOperatingExpenses + b.automationMonthlyFee),
          currentValue: roundMoney(b.currentValue + upgradeCost * 0.8),
        }
      : b
  );
  const dispName = localizeBusiness(biz.name, biz.category, undefined, lang).name;

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Business Trade',
    `Automated ${biz.name} (Manager & Systems Setup)`,
    -upgradeCost,
    nextCash
  );

  const nextState = checkVictory({
    ...state,
    cash: nextCash,
    businesses: nextBusinesses,
    transactions: txs,
  });

  return {
    state: nextState,
    successMessage:
      lang === 'bn'
        ? `${dispName} এখন স্বয়ংক্রিয় — এর নিট মুনাফা প্যাসিভ আয়ে যোগ হবে!`
        : `${biz.name} is now Automatically Operated — its net profit counts toward Passive Income!`,
  };
}

export function sellBusiness(
  state: GameState,
  businessId: string,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const biz = state.businesses.find((b) => b.id === businessId);
  if (!biz) {
    return { state, error: lang === 'bn' ? 'ব্যবসা পাওয়া যায়নি।' : 'Business not found.' };
  }

  const proceeds = biz.currentValue;
  const realizedGain = roundMoney(proceeds - biz.initialInvestment);
  const nextCash = roundMoney(state.cash + proceeds);
  const nextBusinesses = state.businesses.filter((b) => b.id !== businessId);
  const dispName = localizeBusiness(biz.name, biz.category, undefined, lang).name;

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Business Trade',
    `Sold ${biz.name} for ${formatCurrency(proceeds)}`,
    proceeds,
    nextCash
  );

  const nextState = checkVictory({
    ...state,
    cash: nextCash,
    businesses: nextBusinesses,
    realizedInvestmentPnL: roundMoney(state.realizedInvestmentPnL + realizedGain),
    taxableIncomeYTD: Math.max(0, roundMoney((state.taxableIncomeYTD ?? 0) + realizedGain)),
    transactions: txs,
  });

  return {
    state: nextState,
    successMessage:
      lang === 'bn'
        ? `${dispName} ${formatCurrency(proceeds)}-এ বিক্রি হয়েছে।`
        : `Sold ${biz.name} for ${formatCurrency(proceeds)}.`,
  };
}

export function createCustomBusiness(
  state: GameState,
  templateIndex: number,
  customName: string,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const tpl = BUSINESS_TEMPLATES[templateIndex] ?? BUSINESS_TEMPLATES[0];
  const listing: BusinessListing = {
    ...tpl,
    id: uid('biz_tpl'),
    name: customName.trim() || tpl.name,
  };
  return buyOrStartBusiness(state, listing, lang);
}

// ==========================================
// BONDS & SAVINGS
// ==========================================
export function investFixedIncome(
  state: GameState,
  productId: string,
  amount: number,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const product = FIXED_INCOME_PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    return { state, error: lang === 'bn' ? 'পণ্য পাওয়া যায়নি।' : 'Product not found.' };
  }

  const dispName = localizeFixedIncome(product.id, product.name, lang).name;
  const investAmt = roundMoney(amount);
  if (investAmt < 1) {
    return {
      state,
      error:
        lang === 'bn'
          ? `${dispName}-এ কমপক্ষে $1 বিনিয়োগ করুন।`
          : `Minimum investment for ${product.name} is $1.`,
    };
  }
  if (state.cash < investAmt) {
    return {
      state,
      error:
        lang === 'bn'
          ? `পর্যাপ্ত নগদ নেই। হাতে আছে: ${formatCurrency(state.cash)}।`
          : `Insufficient cash. Available: ${formatCurrency(state.cash)}.`,
    };
  }

  const nextCash = roundMoney(state.cash - investAmt);
  const record: OwnedFixedIncome = {
    id: uid('fi'),
    productId: product.id,
    name: product.name,
    kind: product.kind,
    principal: investAmt,
    annualInterestRate: product.annualInterestRate,
    payoutFrequency: product.payoutFrequency,
    startTurn: state.currentTurn,
    maturityMonths: product.maturityMonths,
    turnsElapsed: 0,
    accruedInterest: 0,
    currentValue: investAmt,
  };

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Bonds & Savings',
    `Deposited ${formatCurrency(investAmt)} into ${product.name}`,
    -investAmt,
    nextCash
  );

  const nextState = checkVictory({
    ...state,
    cash: nextCash,
    fixedIncome: [...state.fixedIncome, record],
    actionsUsedThisTurn: Math.min(6, (state.actionsUsedThisTurn ?? 0) + 1),
    transactions: txs,
  });

  return {
    state: nextState,
    successMessage:
      lang === 'bn'
        ? `${dispName}-এ ${formatCurrency(investAmt)} জমা করা হয়েছে।`
        : `Invested ${formatCurrency(investAmt)} in ${product.name}.`,
  };
}

export function redeemFixedIncome(
  state: GameState,
  fixedId: string,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const item = state.fixedIncome.find((f) => f.id === fixedId);
  if (!item) {
    return { state, error: lang === 'bn' ? 'সঞ্চয় বা বন্ড পাওয়া যায়নি।' : 'Position not found.' };
  }

  const dispName = localizeFixedIncome(item.productId, item.name, lang).name;
  const proceeds = roundMoney(Math.max(0, item.currentValue));
  const nextCash = roundMoney(state.cash + proceeds);

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Bonds & Savings',
    `Redeemed ${item.name}`,
    proceeds,
    nextCash
  );

  const nextState = checkVictory({
    ...state,
    cash: nextCash,
    fixedIncome: state.fixedIncome.filter((f) => f.id !== fixedId),
    transactions: txs,
  });

  return {
    state: nextState,
    successMessage:
      lang === 'bn'
        ? `${dispName} থেকে ${formatCurrency(proceeds)} মূল ব্যালেন্সে তোলা হয়েছে।`
        : `Withdrew ${formatCurrency(proceeds)} from ${item.name}.`,
  };
}

export function withdrawFixedIncomeAmount(
  state: GameState,
  productId: string,
  amount: number,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const matching = state.fixedIncome.filter((f) => f.productId === productId);
  const totalAvailable = roundMoney(
    matching.reduce((acc, f) => acc + Math.max(0, f.currentValue), 0)
  );
  if (matching.length === 0 || totalAvailable <= 0) {
    return {
      state,
      error:
        lang === 'bn'
          ? 'প্রত্যাহার করার মতো কোনো বন্ড বা সঞ্চয় নেই।'
          : 'No active holdings in this bond or savings plan.',
    };
  }

  const req = roundMoney(amount);
  if (req <= 0) {
    return {
      state,
      error: lang === 'bn' ? 'সঠিক পরিমাণ নির্বাচন করুন।' : 'Select a valid amount to withdraw.',
    };
  }

  // Snap tiny remainder (<$0.05) to full withdrawal so zero dust remains
  const withdrawAmt = totalAvailable - req < 0.05 ? totalAvailable : Math.min(req, totalAvailable);
  let remainingToTake = withdrawAmt;

  const nextFixedIncome: OwnedFixedIncome[] = [];
  for (const item of state.fixedIncome) {
    if (item.productId !== productId || remainingToTake <= 0.001) {
      nextFixedIncome.push(item);
      continue;
    }
    const itemVal = Math.max(0, item.currentValue);
    if (itemVal <= remainingToTake + 0.01) {
      remainingToTake = roundMoney(Math.max(0, remainingToTake - itemVal));
      continue;
    }
    const nextVal = roundMoney(itemVal - remainingToTake);
    const ratio = itemVal > 0 ? nextVal / itemVal : 0;
    nextFixedIncome.push({
      ...item,
      currentValue: nextVal,
      principal: roundMoney(item.principal * ratio),
      accruedInterest: roundMoney(item.accruedInterest * ratio),
    });
    remainingToTake = 0;
  }

  const product = FIXED_INCOME_PRODUCTS.find((p) => p.id === productId);
  const dispName = localizeFixedIncome(productId, product?.name ?? matching[0].name, lang).name;
  const nextCash = roundMoney(state.cash + withdrawAmt);

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Bonds & Savings',
    `Withdrew ${formatCurrency(withdrawAmt)} from ${product?.name ?? matching[0].name}`,
    withdrawAmt,
    nextCash
  );

  const nextState = checkVictory({
    ...state,
    cash: nextCash,
    fixedIncome: nextFixedIncome,
    transactions: txs,
  });

  return {
    state: nextState,
    successMessage:
      lang === 'bn'
        ? `${dispName} থেকে ${formatCurrency(withdrawAmt)} মূল ব্যালেন্সে ফেরত আনা হয়েছে।`
        : `Withdrew ${formatCurrency(withdrawAmt)} from ${product?.name ?? matching[0].name} to main balance.`,
  };
}

export type InvestmentSheetCategory = 'stocks' | 'gold' | 'bonds_savings' | 'crypto';

export function withdrawAllInvestmentsByCategory(
  state: GameState,
  category: InvestmentSheetCategory,
  lang: LanguageCode = 'en'
): EngineActionResult {
  let working = state;
  let totalProceeds = 0;

  if (category === 'stocks') {
    const holdings = state.stocks.filter((s) => s.symbol !== 'GOLDM');
    if (holdings.length === 0) {
      return {
        state,
        error: lang === 'bn' ? 'প্রত্যাহার করার মতো কোনো শেয়ার নেই।' : 'No stock holdings to withdraw.',
      };
    }
    for (const h of holdings) {
      const cashBefore = working.cash;
      const res = sellStock(working, h.symbol, h.shares, lang);
      if (res.error) return res;
      working = res.state;
      totalProceeds = roundMoney(totalProceeds + (working.cash - cashBefore));
    }
    return {
      state: working,
      successMessage:
        lang === 'bn'
          ? `শেয়ার থেকে সব ${formatCurrency(totalProceeds)} মূল ব্যালেন্সে যোগ হয়েছে।`
          : `Withdrew ${formatCurrency(totalProceeds)} from Stocks to main balance.`,
    };
  }

  if (category === 'gold') {
    const goldHolding = state.stocks.find((s) => s.symbol === 'GOLDM');
    if (!goldHolding) {
      return {
        state,
        error: lang === 'bn' ? 'প্রত্যাহার করার মতো কোনো সোনা নেই।' : 'No gold holdings to withdraw.',
      };
    }
    const res = sellStock(working, 'GOLDM', goldHolding.shares, lang);
    if (res.error) return res;
    totalProceeds = roundMoney(res.state.cash - working.cash);
    return {
      state: res.state,
      successMessage:
        lang === 'bn'
          ? `সোনা থেকে সব ${formatCurrency(totalProceeds)} মূল ব্যালেন্সে যোগ হয়েছে।`
          : `Withdrew ${formatCurrency(totalProceeds)} from Gold to main balance.`,
    };
  }

  if (category === 'bonds_savings') {
    if (state.fixedIncome.length === 0) {
      return {
        state,
        error: lang === 'bn' ? 'প্রত্যাহার করার মতো কোনো বন্ড বা সঞ্চয় নেই।' : 'No bonds or savings to withdraw.',
      };
    }
    for (const fi of state.fixedIncome) {
      const cashBefore = working.cash;
      const res = redeemFixedIncome(working, fi.id, lang);
      if (res.error) return res;
      working = res.state;
      totalProceeds = roundMoney(totalProceeds + (working.cash - cashBefore));
    }
    return {
      state: working,
      successMessage:
        lang === 'bn'
          ? `সরকারি বন্ড থেকে সব ${formatCurrency(totalProceeds)} মূল ব্যালেন্সে যোগ হয়েছে।`
          : `Withdrew ${formatCurrency(totalProceeds)} from Bonds to main balance.`,
    };
  }

  // crypto
  if (state.crypto.length === 0) {
    return {
      state,
      error: lang === 'bn' ? 'প্রত্যাহার করার মতো কোনো ক্রিপ্টো নেই।' : 'No crypto holdings to withdraw.',
    };
  }
  for (const c of state.crypto) {
    const cashBefore = working.cash;
    const res = sellCrypto(working, c.symbol, c.units, lang);
    if (res.error) return res;
    working = res.state;
    totalProceeds = roundMoney(totalProceeds + (working.cash - cashBefore));
  }
  return {
    state: working,
    successMessage:
      lang === 'bn'
        ? `ক্রিপ্টো থেকে সব ${formatCurrency(totalProceeds)} মূল ব্যালেন্সে যোগ হয়েছে।`
        : `Withdrew ${formatCurrency(totalProceeds)} from Crypto to main balance.`,
  };
}

// ==========================================
// LOANS & CREDIT
// ==========================================
export function applyForLoan(
  state: GameState,
  category: LoanCategory,
  name: string,
  amount: number,
  termMonths: number,
  annualInterestRate: number,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const principal = roundMoney(amount);
  if (principal < 500) {
    return {
      state,
      error: lang === 'bn' ? 'সর্বনিম্ন ঋণের পরিমাণ $500।' : 'Minimum loan amount is $500.',
    };
  }

  const summary = computeFinancialSummary(state);
  if (principal > summary.remainingBorrowingCapacity) {
    return {
      state,
      error:
        lang === 'bn'
          ? `আবেদিত পরিমাণ (${formatCurrency(principal)}) আপনার ঋণ সীমা (${formatCurrency(summary.remainingBorrowingCapacity)}) ছাড়িয়ে গেছে।`
          : `Requested amount (${formatCurrency(principal)}) exceeds your borrowing limit (${formatCurrency(summary.remainingBorrowingCapacity)}).`,
    };
  }

  const monthlyPayment = calculateMonthlyLoanPayment(principal, annualInterestRate, termMonths);
  const newLoan: LoanRecord = {
    id: uid('loan'),
    name: name.trim() || 'Personal Credit Facility',
    category,
    principal,
    remainingBalance: principal,
    annualInterestRate,
    termMonths,
    remainingMonths: termMonths,
    monthlyPayment,
    originTurn: state.currentTurn,
  };

  const nextCash = roundMoney(state.cash + principal);
  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Loan',
    `Issued ${newLoan.name} (${formatCurrency(principal)} @ ${(annualInterestRate * 100).toFixed(1)}% APR)`,
    principal,
    nextCash
  );

  return {
    state: {
      ...state,
      cash: nextCash,
      loans: [...state.loans, newLoan],
      transactions: txs,
    },
    successMessage:
      lang === 'bn'
        ? `${formatCurrency(principal)} ঋণ অনুমোদিত হয়েছে (মাসিক কিস্তি ${formatCurrency(monthlyPayment)}/মাস)।`
        : `Loan approved for ${formatCurrency(principal)} (${formatCurrency(monthlyPayment)}/mo).`,
  };
}

export function repayLoan(
  state: GameState,
  loanId: string,
  amount: number,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const loan = state.loans.find((l) => l.id === loanId);
  if (!loan) {
    return { state, error: lang === 'bn' ? 'ঋণ পাওয়া যায়নি।' : 'Loan not found.' };
  }

  const dispName = localizeLoanName(loan, lang);
  const payAmt = roundMoney(Math.min(amount, loan.remainingBalance));
  if (payAmt <= 0) {
    return {
      state,
      error: lang === 'bn' ? 'সঠিক পরিশোধের পরিমাণ লিখুন।' : 'Enter a valid repayment amount.',
    };
  }
  if (state.cash < payAmt) {
    return {
      state,
      error:
        lang === 'bn'
          ? `পর্যাপ্ত নগদ নেই। হাতে আছে: ${formatCurrency(state.cash)}।`
          : `Insufficient cash. Available: ${formatCurrency(state.cash)}.`,
    };
  }

  const nextCash = roundMoney(state.cash - payAmt);
  const newBalance = roundMoney(Math.max(0, loan.remainingBalance - payAmt));
  const isPaidOff = newBalance <= 0.01;

  const nextLoans = isPaidOff
    ? state.loans.filter((l) => l.id !== loanId)
    : state.loans.map((l) => (l.id === loanId ? { ...l, remainingBalance: newBalance } : l));

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Loan Payment',
    `${isPaidOff ? 'Paid off' : 'Extra payment on'} ${loan.name}`,
    -payAmt,
    nextCash
  );

  const nextState = checkVictory({
    ...state,
    cash: nextCash,
    loans: nextLoans,
    transactions: txs,
  });

  return {
    state: nextState,
    successMessage: isPaidOff
      ? lang === 'bn'
        ? `${dispName} সম্পূর্ণ পরিশোধ হয়েছে!`
        : `${loan.name} completely paid off!`
      : lang === 'bn'
      ? `${dispName}-এ ${formatCurrency(payAmt)} পরিশোধ করা হয়েছে।`
      : `Paid ${formatCurrency(payAmt)} toward ${loan.name}.`,
  };
}

// ==========================================
// EVENT RESOLUTION
// ==========================================
export function resolveEventChoice(
  state: GameState,
  eventId: string,
  choiceId: string,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const eventCard = state.pendingEvents.find((e) => e.id === eventId);
  if (!eventCard) {
    return { state, error: lang === 'bn' ? 'ঘটনা কার্ড পাওয়া যায়নি।' : 'Event card not found.' };
  }
  if (eventCard.resolved) {
    return { state, error: lang === 'bn' ? 'ঘটনাটি ইতিমধ্যেই সমাধান হয়েছে।' : 'Event already resolved.' };
  }

  const choice = eventCard.choices.find((c) => c.id === choiceId);
  if (!choice) {
    return { state, error: lang === 'bn' ? 'অবৈধ সিদ্ধান্ত।' : 'Invalid event choice.' };
  }

  const localizedEvt = localizeEventCard(eventCard, lang);
  const localizedChoice = localizedEvt.choices.find((c) => c.id === choiceId) ?? choice;

  let workingState = { ...state };
  let resolutionNote = choice.label;
  let toastNote = localizedChoice.label;

  switch (choice.effectType) {
    case 'dismiss': {
      resolutionNote = 'Passed / Declined';
      toastNote = lang === 'bn' ? 'এড়িয়ে যাওয়া হয়েছে' : 'Passed / Declined';
      break;
    }

    case 'cash_delta': {
      let delta = choice.amount ?? 0;
      const insuredMedical = eventCard.templateId === 'exp_medical' && workingState.healthInsured;
      const ownedPersonalAssets = workingState.personalAssets ?? [];
      const insuredAsset =
        (eventCard.templateId === 'exp_car_repair' &&
          (Boolean(workingState.propertyInsured) ||
            ownedPersonalAssets.some((a) => a.id === 'car' && a.insured))) ||
        (eventCard.templateId === 'exp_home_repair' &&
          (Boolean(workingState.propertyInsured) ||
            ownedPersonalAssets.some(
              (a) => (a.id === 'house' || a.id === 'villa') && a.insured
            )));
      if (delta < 0 && (insuredMedical || insuredAsset)) {
        delta = roundMoney(delta * 0.15); // Insurance covers 85%
      }
      if (delta < 0 && workingState.cash < Math.abs(delta)) {
        return {
          state,
          error:
            lang === 'bn'
              ? `নগদ অর্থ (${formatCurrency(workingState.cash)}) ${formatCurrency(Math.abs(delta))} পরিশোধের জন্য যথেষ্ট নয়। জরুরি ঋণ বিকল্প ব্যবহার করুন।`
              : `Insufficient cash (${formatCurrency(workingState.cash)}) to pay ${formatCurrency(Math.abs(delta))}. Use the financing option instead.`,
        };
      }
      const nextCash = roundMoney(workingState.cash + delta);
      workingState.cash = nextCash;
      if (delta < 0) {
        const penalty = insuredMedical || insuredAsset ? 1 : 6;
        workingState.happiness = Math.max(0, (workingState.happiness ?? 70) - penalty);
      }
      workingState.transactions = appendTx(
        workingState.transactions,
        workingState.currentTurn,
        workingState.year,
        workingState.month,
        'Event',
        `${eventCard.title}: ${choice.label}`,
        delta,
        nextCash
      );
      if (insuredMedical || insuredAsset) {
        toastNote =
          lang === 'bn'
            ? `বীমা ৮৫% খরচ বহন করেছে (পরিশোধিত ${formatCurrency(Math.abs(delta))})`
            : `Insurance covered 85% (paid ${formatCurrency(Math.abs(delta))})`;
      }
      break;
    }

    case 'take_emergency_loan': {
      const amt = choice.amount ?? 1000;
      const rate = 0.16;
      const term = 24;
      const monthlyPayment = calculateMonthlyLoanPayment(amt, rate, term);
      const emergLoan: LoanRecord = {
        id: uid('loan_emerg'),
        name: `Emergency Loan (${eventCard.title})`,
        category: 'personal',
        principal: amt,
        remainingBalance: amt,
        annualInterestRate: rate,
        termMonths: term,
        remainingMonths: term,
        monthlyPayment,
        originTurn: workingState.currentTurn,
      };
      workingState.loans = [...workingState.loans, emergLoan];
      workingState.transactions = appendTx(
        workingState.transactions,
        workingState.currentTurn,
        workingState.year,
        workingState.month,
        'Loan',
        `Financed ${eventCard.title} (${formatCurrency(amt)} @ 16% APR)`,
        0,
        workingState.cash
      );
      resolutionNote = `Financed ${formatCurrency(amt)} (${formatCurrency(monthlyPayment)}/mo)`;
      toastNote =
        lang === 'bn'
          ? `ঋণে পরিশোধিত ${formatCurrency(amt)} (${formatCurrency(monthlyPayment)}/মাস)`
          : resolutionNote;
      break;
    }

    case 'stock_opportunity': {
      const symbol = choice.symbol ?? 'NVDAX';
      const shares = Math.max(1, Math.round(choice.shares ?? 25));
      const marketPrice = workingState.market.stocks[symbol]?.currentPrice ?? 25;
      const offerPrice = roundMoney(choice.amount ?? marketPrice);
      const totalCost = roundMoney(offerPrice * shares);
      if (workingState.cash < totalCost) {
        return {
          state,
          error:
            lang === 'bn'
              ? `পর্যাপ্ত নগদ নেই। প্রয়োজন ${formatCurrency(totalCost)}, হাতে আছে ${formatCurrency(workingState.cash)}।`
              : `Insufficient cash. Need ${formatCurrency(totalCost)}, have ${formatCurrency(workingState.cash)}.`,
        };
      }
      const nextCash = roundMoney(workingState.cash - totalCost);
      const enCard = localizeEventCard(eventCard, 'en');
      const bnCard = localizeEventCard(eventCard, 'bn');
      const deal: PendingOpportunityDeal = {
        id: uid('opp_deal'),
        eventId: eventCard.id,
        templateId: eventCard.templateId,
        titleEn: enCard.title,
        titleBn: bnCard.title,
        descriptionEn: enCard.description,
        descriptionBn: bnCard.description,
        symbol,
        shares,
        offerPrice,
        cost: totalCost,
        turnPurchased: workingState.currentTurn,
      };
      workingState.cash = nextCash;
      workingState.pendingOpportunityDeals = [
        ...(workingState.pendingOpportunityDeals ?? []),
        deal,
      ];
      workingState.transactions = appendTx(
        workingState.transactions,
        workingState.currentTurn,
        workingState.year,
        workingState.month,
        'Event',
        `Opportunity Investment: ${shares} ${symbol} @ ${formatCurrency(offerPrice)}`,
        -totalCost,
        nextCash
      );
      resolutionNote = 'Pending month-end settlement';
      toastNote =
        lang === 'bn'
          ? `${formatCurrency(totalCost)} বিনিয়োগ সম্পন্ন — ফলাফল মাস শেষে দেখা যাবে।`
          : `Invested ${formatCurrency(totalCost)} — result will be shown at month close.`;
      break;
    }

    case 'property_opportunity': {
      if (!choice.propertyTemplate) {
        return { state, error: lang === 'bn' ? 'প্রপার্টি তথ্য পাওয়া যায়নি।' : 'Missing property deal.' };
      }
      const res = buyProperty(workingState, choice.propertyTemplate, true, lang);
      if (res.error) return res;
      workingState = res.state;
      resolutionNote = res.successMessage ?? choice.label;
      toastNote = resolutionNote;
      break;
    }

    case 'business_opportunity': {
      if (!choice.businessTemplate) {
        return { state, error: lang === 'bn' ? 'ব্যবসার তথ্য পাওয়া যায়নি।' : 'Missing business deal.' };
      }
      const res = buyOrStartBusiness(workingState, choice.businessTemplate, lang);
      if (res.error) return res;
      workingState = res.state;
      resolutionNote = res.successMessage ?? choice.label;
      toastNote = resolutionNote;
      break;
    }

    case 'other_passive_income': {
      const cost = choice.amount ?? 0;
      const monthlyGain = choice.secondaryAmount ?? 0;
      if (workingState.cash < cost) {
        return {
          state,
          error:
            lang === 'bn'
              ? `${formatCurrency(cost)} বিনিয়োগের জন্য পর্যাপ্ত নগদ নেই (${formatCurrency(workingState.cash)})।`
              : `Insufficient cash (${formatCurrency(workingState.cash)}) for ${formatCurrency(cost)} investment.`,
        };
      }
      const nextCash = roundMoney(workingState.cash - cost);
      workingState.cash = nextCash;
      workingState.otherPassiveIncome = roundMoney(workingState.otherPassiveIncome + monthlyGain);
      workingState.transactions = appendTx(
        workingState.transactions,
        workingState.currentTurn,
        workingState.year,
        workingState.month,
        'Event',
        `${eventCard.title}: +${formatCurrency(monthlyGain)}/mo Passive Income`,
        -cost,
        nextCash
      );
      toastNote =
        lang === 'bn'
          ? `+${formatCurrency(monthlyGain)}/মাস প্যাসিভ আয় যুক্ত হয়েছে`
          : resolutionNote;
      break;
    }

    case 'salary_multiplier': {
      const mult = choice.secondaryAmount ?? 1;
      workingState.salary = Math.round(workingState.salary * mult);
      resolutionNote = `Salary updated to ${formatCurrency(workingState.salary)}/mo`;
      toastNote =
        lang === 'bn'
          ? `বেতন হালনাগাদ হয়েছে ${formatCurrency(workingState.salary)}/মাস`
          : resolutionNote;
      break;
    }

    case 'salary_delta': {
      const bonus = choice.amount ?? 0;
      const raise = choice.secondaryAmount ?? 0;
      workingState.salary = roundMoney(workingState.salary + raise);
      workingState.cash = roundMoney(workingState.cash + bonus);
      workingState.transactions = appendTx(
        workingState.transactions,
        workingState.currentTurn,
        workingState.year,
        workingState.month,
        'Event',
        `${eventCard.title} Bonus`,
        bonus,
        workingState.cash
      );
      resolutionNote = `Salary +${formatCurrency(raise)}/mo & +${formatCurrency(bonus)} bonus`;
      toastNote =
        lang === 'bn'
          ? `বেতন +${formatCurrency(raise)}/মাস ও +${formatCurrency(bonus)} বোনাস`
          : resolutionNote;
      break;
    }

    case 'market_crash': {
      const winnerSym = randomPick(['GOLDM', 'GOLDM', 'GOLDM', 'VLTG', 'HLTH', 'RVRB']);
      const prevWinPrice = workingState.market.stocks[winnerSym]?.currentPrice ?? 28;
      workingState.market = advanceMarket(
        workingState.market,
        workingState.currentTurn + 99,
        workingState.seed,
        true,
        choice.secondaryAmount ?? randomRange(0.56, 0.75),
        winnerSym
      );
      const nextWinPrice = workingState.market.stocks[winnerSym]?.currentPrice ?? prevWinPrice;
      const winSurgePct =
        prevWinPrice > 0
          ? Math.max(62, Math.round(((nextWinPrice - prevWinPrice) / prevWinPrice) * 100))
          : 68;
      const heldWin = workingState.stocks.find((h) => h.symbol === winnerSym)?.shares ?? 0;
      const winGain = heldWin > 0 ? roundMoney(heldWin * (nextWinPrice - prevWinPrice)) : 0;
      const winEn =
        winnerSym === 'GOLDM'
          ? 'Gold'
          : STOCK_CATALOG.find((s) => s.symbol === winnerSym)?.name ?? winnerSym;
      const winBn = winnerSym === 'GOLDM' ? 'সোনা' : localizeStock(winnerSym, 'bn').symbol;
      resolutionNote =
        winGain > 0
          ? `Black Swan crash: Equities & crypto fell; ${winEn} jumped +${winSurgePct}% (+${formatCurrency(winGain)} profit).`
          : `Black Swan crash: Equities & crypto fell while ${winEn} jumped +${winSurgePct}%.`;
      toastNote =
        lang === 'bn'
          ? winGain > 0
            ? `কালো রাজহাঁস ধস: ${winBn} +${winSurgePct}% বেড়ে আপনার +${formatCurrency(winGain)} লাভ হয়েছে!`
            : `কালো রাজহাঁস ধস: বাজার পড়েছে, তবে ${winBn} +${winSurgePct}% বেড়েছে!`
          : resolutionNote;
      break;
    }

    case 'property_boom': {
      const mult = choice.secondaryAmount ?? 1.12;
      const boomPct = Math.round((mult - 1) * 100);
      workingState.properties = workingState.properties.map((p) => ({
        ...p,
        currentValue: Math.round((p.currentValue * mult) / 100) * 100,
      }));
      resolutionNote = `Owned real estate values increased by +${boomPct}%.`;
      toastNote =
        lang === 'bn' ? `সব প্রপার্টির মূল্য +${boomPct}% বৃদ্ধি পেয়েছে।` : resolutionNote;
      break;
    }

    case 'new_baby': {
      const birthCost = choice.amount ?? 700;
      const monthlyCare = choice.secondaryAmount ?? 220;
      const paid = Math.min(Math.max(0, workingState.cash), birthCost);
      workingState.cash = roundMoney(workingState.cash - paid);
      workingState.childrenCount = (workingState.childrenCount ?? 0) + 1;
      workingState.happiness = (workingState.happiness ?? 70) + 14;
      const addFood = Math.round(monthlyCare * 0.42);
      const addEdu = Math.round(monthlyCare * 0.58);
      workingState.livingExpenses = {
        ...workingState.livingExpenses,
        food: workingState.livingExpenses.food + addFood,
        education: workingState.livingExpenses.education + addEdu,
      };
      if (paid > 0) {
        workingState.transactions = appendTx(
          workingState.transactions,
          workingState.currentTurn,
          workingState.year,
          workingState.month,
          'Lifestyle',
          'New Baby Arrival Care',
          -paid,
          workingState.cash
        );
      }
      resolutionNote = `New baby arrived (+14 Happiness, +${formatCurrency(monthlyCare)}/mo).`;
      toastNote =
        lang === 'bn'
          ? `নতুন সন্তান জন্মগ্রহণ করেছে (+১৪ সুখ, +${formatCurrency(monthlyCare)}/মাস খরচ)।`
          : resolutionNote;
      break;
    }

    case 'divorce': {
      const legalFee = choice.amount ?? 1500;
      const paid = Math.min(Math.max(0, workingState.cash), legalFee);
      workingState.cash = roundMoney(workingState.cash - paid);
      workingState.maritalStatus = 'divorced';
      workingState.divorceCount = (workingState.divorceCount ?? 0) + 1;
      workingState.happiness = Math.max(0, (workingState.happiness ?? 70) - 15);
      if (paid > 0) {
        workingState.transactions = appendTx(
          workingState.transactions,
          workingState.currentTurn,
          workingState.year,
          workingState.month,
          'Lifestyle',
          'Divorce Legal Settlement',
          -paid,
          workingState.cash
        );
      }
      resolutionNote = `Divorce settled (-${formatCurrency(paid)}, -15 Happiness).`;
      toastNote =
        lang === 'bn'
          ? `বিবাহ বিচ্ছেদ সম্পন্ন (-${formatCurrency(paid)}, -১৫ সুখ)।`
          : resolutionNote;
      break;
    }
  }

  const resolvedCard: GameEventCard = {
    ...eventCard,
    resolved: true,
    resolvedTurn: state.currentTurn,
    chosenChoiceId: choice.id,
    resolutionNote,
  };

  workingState.pendingEvents = workingState.pendingEvents.filter((e) => e.id !== eventId);
  workingState.eventHistory = [resolvedCard, ...workingState.eventHistory].slice(0, 100);
  workingState = checkGameOver(checkVictory(workingState));

  return {
    state: workingState,
    successMessage: toastNote,
  };
}

export function dismissPendingEvent(
  state: GameState,
  eventId: string,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const eventCard = state.pendingEvents.find((e) => e.id === eventId && !e.resolved);
  if (!eventCard) {
    return { state };
  }

  const ignoredCard: GameEventCard = {
    ...eventCard,
    resolved: true,
    resolutionNote: 'Ignored',
  };

  return {
    state: {
      ...state,
      pendingEvents: state.pendingEvents.filter((e) => e.id !== eventId),
      eventHistory: [ignoredCard, ...state.eventHistory].slice(0, 100),
    },
    successMessage: lang === 'bn' ? 'ঘটনাটি উপেক্ষা করা হয়েছে' : 'Event ignored',
  };
}

export function ignoreAllPendingEvents(
  state: GameState,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const unresolved = state.pendingEvents.filter((e) => !e.resolved);
  if (unresolved.length === 0) {
    return { state };
  }

  const ignoredCards: GameEventCard[] = unresolved.map((e) => ({
    ...e,
    resolved: true,
    resolutionNote: 'Ignored',
  }));

  return {
    state: {
      ...state,
      pendingEvents: [],
      eventHistory: [...ignoredCards, ...state.eventHistory].slice(0, 100),
    },
    successMessage: lang === 'bn' ? 'সব ঘটনা উপেক্ষা করা হয়েছে' : 'All pending events ignored',
  };
}

export function continueAfterVictory(state: GameState): GameState {
  return {
    ...state,
    victoryContinued: true,
  };
}

// ==========================================
// HAPPINESS & INSURANCE
// ==========================================
export function buyHappinessItem(
  state: GameState,
  itemId: string,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const rawPool =
    state.activeHappinessItems && state.activeHappinessItems.length > 0
      ? state.activeHappinessItems
      : getHappinessItemsForProfession(state.professionId);
  const pool = withPilgrimageHappinessItems(rawPool, state.professionId);
  const item =
    pool.find((h) => h.id === itemId) ??
    getHappinessItemsForProfession(state.professionId).find((h) => h.id === itemId);
  if (!item) {
    return { state, error: lang === 'bn' ? 'আইটেম পাওয়া যায়নি।' : 'Item not found.' };
  }
  const purchasedIds = state.purchasedHappinessIdsThisTurn ?? [];
  if (purchasedIds.includes(itemId)) {
    return {
      state,
      error:
        lang === 'bn'
          ? 'এই সুখটি এই মাসে ইতিমধ্যেই কেনা হয়েছে।'
          : 'This happiness item is already purchased this month.',
    };
  }
  const currentHappiness = state.happiness ?? 70;
  const effectiveCost = getEffectiveHappinessCost(item, state);
  if (state.cash < effectiveCost) {
    return {
      state,
      error:
        lang === 'bn'
          ? `পর্যাপ্ত নগদ নেই। প্রয়োজন ${formatCurrency(effectiveCost)}।`
          : `Insufficient cash. Need ${formatCurrency(effectiveCost)}.`,
    };
  }

  const nextCash = roundMoney(state.cash - effectiveCost);
  const nextHappiness = currentHappiness + item.happinessGain;
  const itemName = getHappinessItemName(item, lang);

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Lifestyle',
    `${item.nameEn} (+${item.happinessGain} Happiness)`,
    -effectiveCost,
    nextCash
  );

  const handledIds = state.handledHappinessIdsThisTurn ?? [];
  return {
    state: {
      ...state,
      cash: nextCash,
      happiness: nextHappiness,
      purchasedHappinessIdsThisTurn: [...purchasedIds, itemId],
      handledHappinessIdsThisTurn: handledIds.includes(itemId)
        ? handledIds
        : [...handledIds, itemId],
      transactions: txs,
    },
    successMessage:
      lang === 'bn'
        ? `${itemName} — সুখ +${item.happinessGain} (মোট ${nextHappiness})`
        : `${itemName} — Happiness +${item.happinessGain} (${nextHappiness})`,
  };
}

export function marryPartner(
  state: GameState,
  lang: LanguageCode = 'en'
): EngineActionResult {
  if ((state.maritalStatus ?? 'single') === 'married') {
    return {
      state,
      error: lang === 'bn' ? 'আপনি ইতিমধ্যেই বিবাহিত।' : 'You are already married.',
    };
  }
  const weddingCost = getWeddingCost(state);
  if (state.cash < weddingCost) {
    return {
      state,
      error:
        lang === 'bn'
          ? `বিয়ের জন্য পর্যাপ্ত নগদ নেই। প্রয়োজন ${formatCurrency(weddingCost)}।`
          : `Insufficient cash for wedding. Need ${formatCurrency(weddingCost)}.`,
    };
  }

  const nextCash = roundMoney(state.cash - weddingCost);
  const nextHappiness = (state.happiness ?? 70) + 18;
  const inf = state.inflationMultiplier ?? 1;
  const foodDelta = Math.round(110 * inf);
  const entDelta = Math.round(60 * inf);

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Lifestyle',
    'Wedding Ceremony (+18 Happiness)',
    -weddingCost,
    nextCash
  );

  const handledIds = state.handledHappinessIdsThisTurn ?? [];
  return {
    state: {
      ...state,
      cash: nextCash,
      happiness: nextHappiness,
      maritalStatus: 'married',
      marriageCount: (state.marriageCount ?? 0) + 1,
      livingExpenses: {
        ...state.livingExpenses,
        food: state.livingExpenses.food + foodDelta,
        entertainment: state.livingExpenses.entertainment + entDelta,
      },
      handledHappinessIdsThisTurn: handledIds.includes('__marry__')
        ? handledIds
        : [...handledIds, '__marry__'],
      transactions: txs,
    },
    successMessage:
      lang === 'bn'
        ? `অভিনন্দন! নতুন বিয়ে সম্পন্ন হয়েছে (+১৮ সুখ)`
        : `Congratulations! Marriage completed (+18 Happiness).`,
  };
}

export function toggleInsurancePlan(
  state: GameState,
  planId: 'health' | 'property',
  lang: LanguageCode = 'en'
): EngineActionResult {
  const plan = INSURANCE_PLANS.find((p) => p.id === planId);
  if (!plan) {
    return { state, error: lang === 'bn' ? 'বীমা প্ল্যান পাওয়া যায়নি।' : 'Plan not found.' };
  }
  const isHealth = planId === 'health';
  const currentlyActive = isHealth ? Boolean(state.healthInsured) : Boolean(state.propertyInsured);
  const planName = getInsurancePlanName(plan, lang);

  if (currentlyActive) {
    return {
      state: {
        ...state,
        healthInsured: isHealth ? false : state.healthInsured,
        propertyInsured: !isHealth ? false : state.propertyInsured,
      },
      successMessage:
        lang === 'bn' ? `${planName} বীমা বাতিল হয়েছে।` : `${planName} Insurance cancelled.`,
    };
  }

  if (state.cash < plan.monthlyPremium) {
    return {
      state,
      error:
        lang === 'bn'
          ? `প্রথম প্রিমিয়ামের জন্য ${formatCurrency(plan.monthlyPremium)} প্রয়োজন।`
          : `Need ${formatCurrency(plan.monthlyPremium)} for initial premium.`,
    };
  }

  const nextCash = roundMoney(state.cash - plan.monthlyPremium);
  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Lifestyle',
    `Enrolled in ${plan.nameEn} Insurance`,
    -plan.monthlyPremium,
    nextCash
  );

  return {
    state: {
      ...state,
      cash: nextCash,
      healthInsured: isHealth ? true : state.healthInsured,
      propertyInsured: !isHealth ? true : state.propertyInsured,
      actionsUsedThisTurn: Math.min(6, (state.actionsUsedThisTurn ?? 0) + 1),
      transactions: txs,
    },
    successMessage:
      lang === 'bn'
        ? `${planName} বীমা চালু হয়েছে (${formatCurrency(plan.monthlyPremium)}/মাস)`
        : `${planName} Insurance active (${formatCurrency(plan.monthlyPremium)}/mo)`,
  };
}

export function tryCharacterVenture(
  state: GameState,
  ventureId: string,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const activePool =
    state.activeVentures && state.activeVentures.length > 0
      ? state.activeVentures
      : getVenturesForProfession(state.professionId);
  const venture = activePool.find((v) => v.id === ventureId);
  if (!venture) {
    return {
      state,
      error: lang === 'bn' ? 'সুযোগ পাওয়া যায়নি।' : 'Opportunity not found.',
    };
  }
  if ((state.actionsUsedThisTurn ?? 0) >= 6) {
    return {
      state,
      error:
        lang === 'bn'
          ? 'এই মাসের সব কার্যক্রম (৬/৬) শেষ — পরবর্তী মাসে যান।'
          : 'Turn action limit (6/6) reached — advance to Next Month.',
    };
  }
  if (state.cash < venture.cost) {
    return {
      state,
      error:
        lang === 'bn'
          ? `পর্যাপ্ত নগদ নেই। প্রয়োজন ${formatCurrency(venture.cost)}।`
          : `Insufficient cash. Need ${formatCurrency(venture.cost)}.`,
    };
  }

  const title = getVentureTitle(venture, lang);
  const won = randomFloat() < venture.winChance;
  const actionsNext = Math.min(6, (state.actionsUsedThisTurn ?? 0) + 1);

  const currentTplIds = activePool.map((v) => v.templateId ?? v.id);
  const replacement = rollSingleVenture(state.professionId, currentTplIds);
  const nextVentures = activePool.map((v) => (v.id === ventureId ? replacement : v));

  if (won) {
    const rawProfit =
      venture.minNetProfit + randomFloat() * (venture.maxNetProfit - venture.minNetProfit);
    const profit = Math.max(10, Math.round(rawProfit / 10) * 10);
    const nextCash = roundMoney(state.cash + profit);
    const nextHappiness = (state.happiness ?? 70) + 2;
    const txs = appendTx(
      state.transactions,
      state.currentTurn,
      state.year,
      state.month,
      'Event',
      `Venture Profit: ${venture.titleEn}`,
      profit,
      nextCash
    );
    const nextState = checkVictory({
      ...state,
      cash: nextCash,
      happiness: nextHappiness,
      actionsUsedThisTurn: actionsNext,
      activeVentures: nextVentures,
      realizedInvestmentPnL: roundMoney(state.realizedInvestmentPnL + profit),
      taxableIncomeYTD: Math.max(0, roundMoney((state.taxableIncomeYTD ?? 0) + profit)),
      transactions: txs,
    });
    return {
      state: nextState,
      outcomeType: 'win',
      outcomeDelta: profit,
      successMessage:
        lang === 'bn'
          ? `${title} — লাভ হয়েছে! +${formatCurrency(profit)}`
          : `${title} — Random Profit! +${formatCurrency(profit)}`,
    };
  }

  const loss = venture.cost;
  const nextCash = roundMoney(state.cash - loss);
  const nextHappiness = Math.max(0, (state.happiness ?? 70) - 3);
  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Event',
    `Venture Loss: ${venture.titleEn}`,
    -loss,
    nextCash
  );
  const nextState = checkGameOver({
    ...state,
    cash: nextCash,
    happiness: nextHappiness,
    actionsUsedThisTurn: actionsNext,
    activeVentures: nextVentures,
    realizedInvestmentPnL: roundMoney(state.realizedInvestmentPnL - loss),
    taxableIncomeYTD: Math.max(0, roundMoney((state.taxableIncomeYTD ?? 0) - loss)),
    transactions: txs,
  });

  return {
    state: nextState,
    outcomeType: 'loss',
    outcomeDelta: -loss,
    successMessage:
      lang === 'bn'
        ? `${title} — সম্পূর্ণ বিনিয়োগ ক্ষতি! -${formatCurrency(loss)}`
        : `${title} — Entire Investment Lost! -${formatCurrency(loss)}`,
  };
}

export function buyPersonalAsset(
  state: GameState,
  assetId: PersonalAssetId,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const existing = state.personalAssets ?? [];
  if (existing.some((a) => a.id === assetId)) {
    return {
      state,
      error: lang === 'bn' ? 'এই সম্পদটি ইতিমধ্যেই কেনা হয়েছে।' : 'You already own this asset.',
    };
  }

  const tpl = getPersonalAssetById(assetId);
  const price = getEffectivePersonalAssetPrice(tpl, state);
  const monthlyPremium = getEffectivePersonalAssetInsurance(tpl, state);
  const name = getPersonalAssetName(tpl, lang);

  if (state.cash < price) {
    return {
      state,
      error:
        lang === 'bn'
          ? `পর্যাপ্ত নগদ নেই। প্রয়োজন ${formatCurrency(price)}।`
          : `Insufficient cash. Need ${formatCurrency(price)}.`,
    };
  }

  const nextCash = roundMoney(state.cash - price);
  const nextHappiness = (state.happiness ?? 70) + tpl.buyHappinessBonus;
  const nextOwned = [
    ...existing,
    {
      id: assetId,
      purchasePrice: price,
      insured: true,
      purchasedTurn: state.currentTurn,
    },
  ];

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Lifestyle',
    `Bought ${tpl.nameEn}`,
    -price,
    nextCash
  );

  const nextState = checkVictory({
    ...state,
    cash: nextCash,
    happiness: nextHappiness,
    personalAssets: nextOwned,
    actionsUsedThisTurn: Math.min(6, (state.actionsUsedThisTurn ?? 0) + 1),
    transactions: txs,
  });

  return {
    state: nextState,
    successMessage:
      lang === 'bn'
        ? `${name} কেনা হয়েছে (+${tpl.buyHappinessBonus} সুখ) — বীমা বিভাগে এর মাসিক বীমা (${formatCurrency(monthlyPremium)}/মাস) যুক্ত ও সক্রিয় হয়েছে!`
        : `Purchased ${name} (+${tpl.buyHappinessBonus} Happiness) — monthly insurance (${formatCurrency(monthlyPremium)}/mo) added and active under Insurance!`,
  };
}

export function togglePersonalAssetInsurance(
  state: GameState,
  assetId: PersonalAssetId,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const existing = state.personalAssets ?? [];
  const target = existing.find((a) => a.id === assetId);
  if (!target) {
    return {
      state,
      error: lang === 'bn' ? 'সম্পদটি পাওয়া যায়নি।' : 'Personal asset not found.',
    };
  }

  const tpl = getPersonalAssetById(assetId);
  const name = getPersonalAssetName(tpl, lang);

  if (target.insured) {
    const nextOwned = existing.map((a) => (a.id === assetId ? { ...a, insured: false } : a));
    return {
      state: {
        ...state,
        personalAssets: nextOwned,
      },
      successMessage:
        lang === 'bn'
          ? `${name}-এর বীমা বাতিল করা হয়েছে।`
          : `Cancelled insurance for ${name}.`,
    };
  }

  const premium = getEffectivePersonalAssetInsurance(tpl, state);
  if (state.cash < premium) {
    return {
      state,
      error:
        lang === 'bn'
          ? `বীমা চালুর জন্য ${formatCurrency(premium)} প্রয়োজন।`
          : `Need ${formatCurrency(premium)} to activate insurance.`,
    };
  }

  const nextCash = roundMoney(state.cash - premium);
  const nextOwned = existing.map((a) => (a.id === assetId ? { ...a, insured: true } : a));
  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Lifestyle',
    `Insured ${tpl.nameEn}`,
    -premium,
    nextCash
  );

  return {
    state: {
      ...state,
      cash: nextCash,
      personalAssets: nextOwned,
      transactions: txs,
    },
    successMessage:
      lang === 'bn'
        ? `${name}-এর বীমা সক্রিয় হয়েছে (${formatCurrency(premium)}/মাস)।`
        : `${name} is now insured (${formatCurrency(premium)}/mo).`,
  };
}

export function playLottery(
  state: GameState,
  ticketId: LotteryTicketId,
  lang: LanguageCode = 'en'
): EngineActionResult {
  const played = state.playedLotteryIdsThisTurn ?? [];
  if (played.includes(ticketId)) {
    return {
      state,
      error:
        lang === 'bn'
          ? 'এই মাসে এই লটারি ইতিমধ্যেই খেলা হয়েছে।'
          : 'You already played this lottery ticket this month.',
    };
  }

  const ticket = getLotteryTicketById(ticketId);
  const name = getLotteryTicketName(ticket, lang);

  if (state.cash < ticket.cost) {
    return {
      state,
      error:
        lang === 'bn'
          ? `পর্যাপ্ত নগদ নেই। প্রয়োজন ${formatCurrency(ticket.cost)}।`
          : `Insufficient cash. Need ${formatCurrency(ticket.cost)}.`,
    };
  }

  const roll = randomFloat();
  let grossPrize = 0;
  let happinessBoost = 0;
  let tier: 'jackpot' | 'big' | 'small' | 'none' = 'none';

  if (roll < ticket.jackpotChance) {
    tier = 'jackpot';
    grossPrize = Math.round(randomRange(ticket.jackpotMin, ticket.jackpotMax) / 100) * 100;
    happinessBoost = ticket.jackpotHappinessBonus;
  } else if (roll < ticket.jackpotChance + ticket.bigWinChance) {
    tier = 'big';
    grossPrize = Math.round(randomRange(ticket.bigWinMin, ticket.bigWinMax) / 50) * 50;
    happinessBoost = 6;
  } else if (roll < ticket.jackpotChance + ticket.bigWinChance + ticket.smallWinChance) {
    tier = 'small';
    grossPrize = Math.round(randomRange(ticket.smallWinMin, ticket.smallWinMax) / 5) * 5;
    happinessBoost = 2;
  }

  const netDelta = roundMoney(grossPrize - ticket.cost);
  const nextCash = roundMoney(state.cash + netDelta);
  const nextHappiness = (state.happiness ?? 70) + happinessBoost;
  const nextPlayed = [...played, ticketId];

  const txDesc =
    tier === 'jackpot'
      ? `Lottery Jackpot: ${ticket.nameEn}`
      : grossPrize > 0
      ? `Lottery Win: ${ticket.nameEn}`
      : `Lottery Ticket: ${ticket.nameEn}`;

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Event',
    txDesc,
    netDelta,
    nextCash
  );

  const nextState = checkVictory({
    ...state,
    cash: nextCash,
    happiness: nextHappiness,
    playedLotteryIdsThisTurn: nextPlayed,
    transactions: txs,
  });

  if (tier === 'jackpot') {
    return {
      state: nextState,
      outcomeType: 'win',
      outcomeDelta: grossPrize,
      successMessage:
        lang === 'bn'
          ? `মহাভাগ্য জ্যাকপট! ${name} থেকে জিতেছেন +${formatCurrency(grossPrize)}!`
          : `JACKPOT! ${name} won +${formatCurrency(grossPrize)}!`,
    };
  }

  if (grossPrize > 0) {
    return {
      state: nextState,
      outcomeType: 'win',
      outcomeDelta: grossPrize,
      successMessage:
        lang === 'bn'
          ? `অভিনন্দন! ${name} থেকে পুরস্কার জিতেছেন +${formatCurrency(grossPrize)}!`
          : `Lucky Win! ${name} paid +${formatCurrency(grossPrize)}!`,
    };
  }

  return {
    state: nextState,
    outcomeType: 'loss',
    outcomeDelta: -ticket.cost,
    successMessage:
      lang === 'bn'
        ? `${name} — এবার মেলেনি (-${formatCurrency(ticket.cost)})।`
        : `${name} — No prize this time (-${formatCurrency(ticket.cost)}).`,
  };
}

// ==========================================
// ISLAMIC ZAKAT & INCOME TAX PAYMENTS
// ==========================================
export function payZakat(
  state: GameState,
  mode: 'due' | 'accrued',
  lang: LanguageCode = 'en'
): EngineActionResult {
  const summary = computeFinancialSummary(state);
  const amount = mode === 'due' ? summary.zakatDueEffective : summary.zakatAccruedCurrent;

  if (amount <= 0) {
    return {
      state,
      error:
        lang === 'bn'
          ? 'বর্তমানে পরিশোধযোগ্য কোনো জাকাত নেই।'
          : 'No Zakat amount is currently due or accrued.',
    };
  }

  if (state.cash < amount) {
    return {
      state,
      error:
        lang === 'bn'
          ? `জাকাত পরিশোধের জন্য ${formatCurrency(amount)} নগদ প্রয়োজন।`
          : `Insufficient cash. Need ${formatCurrency(amount)} to pay Zakat.`,
    };
  }

  const nextCash = roundMoney(state.cash - amount);
  const canAwardHappiness =
    mode === 'due' ||
    (amount >= 25 && (state.zakatHappinessAwardedYear ?? 0) !== state.year);
  const happinessGain = canAwardHappiness ? (mode === 'due' ? 8 : 5) : 0;
  const nextHappiness = (state.happiness ?? 70) + happinessGain;

  const desc =
    mode === 'due'
      ? `Paid Year-End Islamic Zakat (${formatCurrency(amount)})`
      : `Paid Accrued Islamic Zakat (${formatCurrency(amount)})`;

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Zakat & Tax',
    desc,
    -amount,
    nextCash
  );

  return {
    state: {
      ...state,
      cash: nextCash,
      happiness: nextHappiness,
      zakatDueBalance: mode === 'due' ? 0 : state.zakatDueBalance,
      zakatPaidAdvanceThisYear:
        mode === 'accrued'
          ? roundMoney((state.zakatPaidAdvanceThisYear ?? 0) + amount)
          : state.zakatPaidAdvanceThisYear,
      zakatPaidTotal: roundMoney((state.zakatPaidTotal ?? 0) + amount),
      zakatHappinessAwardedYear:
        canAwardHappiness && mode === 'accrued' ? state.year : state.zakatHappinessAwardedYear,
      transactions: txs,
    },
    successMessage:
      lang === 'bn'
        ? happinessGain > 0
          ? `জাকাত (${formatCurrency(amount)}) পরিশোধিত হয়েছে! (+${happinessGain} সুখ)`
          : `জাকাত (${formatCurrency(amount)}) পরিশোধিত হয়েছে।`
        : happinessGain > 0
          ? `Paid ${formatCurrency(amount)} Islamic Zakat! (+${happinessGain} Happiness)`
          : `Paid ${formatCurrency(amount)} Islamic Zakat.`,
  };
}

export function payIncomeTax(
  state: GameState,
  mode: 'due' | 'accrued',
  lang: LanguageCode = 'en'
): EngineActionResult {
  const summary = computeFinancialSummary(state);
  const amount = mode === 'due' ? summary.incomeTaxDueEffective : summary.incomeTaxAccruedCurrent;

  if (amount <= 0) {
    return {
      state,
      error:
        lang === 'bn'
          ? 'বর্তমানে পরিশোধযোগ্য কোনো আয়কর নেই।'
          : 'No Income Tax is currently due or accrued.',
    };
  }

  if (state.cash < amount) {
    return {
      state,
      error:
        lang === 'bn'
          ? `আয়কর পরিশোধের জন্য ${formatCurrency(amount)} নগদ প্রয়োজন।`
          : `Insufficient cash. Need ${formatCurrency(amount)} to pay Income Tax.`,
    };
  }

  const nextCash = roundMoney(state.cash - amount);
  const canAwardHappiness =
    mode === 'due' ||
    (amount >= 25 && (state.taxHappinessAwardedYear ?? 0) !== state.year);
  const happinessGain = canAwardHappiness ? (mode === 'due' ? 5 : 4) : 0;
  const nextHappiness = (state.happiness ?? 70) + happinessGain;

  const desc =
    mode === 'due'
      ? `Paid Year-End Income Tax (${formatCurrency(amount)})`
      : `Paid Accrued Income Tax (${formatCurrency(amount)})`;

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Zakat & Tax',
    desc,
    -amount,
    nextCash
  );

  return {
    state: {
      ...state,
      cash: nextCash,
      happiness: nextHappiness,
      incomeTaxDueBalance: mode === 'due' ? 0 : state.incomeTaxDueBalance,
      incomeTaxPaidAdvanceThisYear:
        mode === 'accrued'
          ? roundMoney((state.incomeTaxPaidAdvanceThisYear ?? 0) + amount)
          : state.incomeTaxPaidAdvanceThisYear,
      incomeTaxPaidTotal: roundMoney((state.incomeTaxPaidTotal ?? 0) + amount),
      taxHappinessAwardedYear:
        canAwardHappiness && mode === 'accrued' ? state.year : state.taxHappinessAwardedYear,
      transactions: txs,
    },
    successMessage:
      lang === 'bn'
        ? happinessGain > 0
          ? `আয়কর (${formatCurrency(amount)}) পরিশোধিত হয়েছে! (+${happinessGain} সুখ)`
          : `আয়কর (${formatCurrency(amount)}) পরিশোধিত হয়েছে।`
        : happinessGain > 0
          ? `Paid ${formatCurrency(amount)} Income Tax! (+${happinessGain} Happiness)`
          : `Paid ${formatCurrency(amount)} Income Tax.`,
  };
}

// ==========================================
// MANDATORY MONTHLY LIVING EXPENSES PAYMENT
// ==========================================
export function payMonthlyExpenses(
  state: GameState,
  lang: LanguageCode = 'en'
): EngineActionResult {
  if (state.gameOver || (state.happiness ?? 70) < 50) {
    return { state: checkGameOver(state) };
  }

  if (state.monthlyExpensePaidThisTurn) {
    return {
      state,
      error:
        lang === 'bn'
          ? 'এই মাসের খরচ ইতিমধ্যেই পরিশোধ করা হয়েছে।'
          : 'Monthly expenses have already been paid this turn.',
    };
  }

  const summary = computeFinancialSummary(state);
  const amount = roundMoney(Math.max(0, summary.livingExpensesTotal));

  if (state.cash < amount) {
    return {
      state,
      error:
        lang === 'bn'
          ? `মাসিক খরচ (${formatCurrency(amount)}) পরিশোধের জন্য পর্যাপ্ত নগদ নেই। হাতে আছে ${formatCurrency(state.cash)}। বিনিয়োগ তুলে নিন অথবা ঋণ নিন।`
          : `Insufficient cash (${formatCurrency(state.cash)}) to pay monthly expenses (${formatCurrency(amount)}). Withdraw investments or apply for a loan.`,
    };
  }

  let runningCash = state.cash;
  let txs = [...state.transactions];

  if (amount > 0) {
    runningCash = roundMoney(runningCash - amount);
    txs = appendTx(
      txs,
      state.currentTurn,
      state.year,
      state.month,
      'Living Expenses',
      'Monthly Housing, Food, Utilities & Living Costs',
      -amount,
      runningCash
    );
  }

  return {
    state: {
      ...state,
      cash: runningCash,
      transactions: txs,
      monthlyExpensePaidThisTurn: true,
      monthlyExpensePaidAmountThisTurn: amount,
    },
  };
}

export function ignoreHappinessCard(
  state: GameState,
  cardId: string
): EngineActionResult {
  const handled = state.handledHappinessIdsThisTurn ?? [];
  if (handled.includes(cardId)) {
    return { state };
  }

  let happinessLoss = 0;
  if (cardId === '__marry__') {
    happinessLoss = 18;
  } else {
    const rawPool =
      state.activeHappinessItems && state.activeHappinessItems.length > 0
        ? state.activeHappinessItems
        : getHappinessItemsForProfession(state.professionId);
    const pool = withPilgrimageHappinessItems(
      [...rawPool, ...getHappinessItemsForProfession(state.professionId), ...ALL_HAPPINESS_ITEMS],
      state.professionId
    );
    const item = pool.find((h) => h.id === cardId);
    happinessLoss = Math.max(0, item?.happinessGain ?? 0);
  }

  const nextHappiness = Math.max(0, (state.happiness ?? 70) - happinessLoss);
  const ignoredIds = state.ignoredHappinessIdsThisTurn ?? [];

  const nextState = checkGameOver({
    ...state,
    happiness: nextHappiness,
    handledHappinessIdsThisTurn: [...handled, cardId],
    ignoredHappinessIdsThisTurn: ignoredIds.includes(cardId)
      ? ignoredIds
      : [...ignoredIds, cardId],
  });

  return {
    state: nextState,
  };
}

export function completeEducationCourse(
  state: GameState,
  courseId: string,
  lang: LanguageCode = 'en'
): EngineActionResult {
  if (state.gameOver || (state.happiness ?? 70) < 50) {
    return { state: checkGameOver(state) };
  }

  const courses = getEducationCoursesForProfession(state.professionId);
  const course = courses.find((c) => c.id === courseId);
  if (!course) {
    return {
      state,
      error: lang === 'bn' ? 'শিক্ষা কোর্স পাওয়া যায়নি।' : 'Education course not found.',
    };
  }

  const completedIds = state.completedEducationIds ?? [];
  if (completedIds.includes(courseId)) {
    return {
      state,
      error:
        lang === 'bn'
          ? 'এই দক্ষতা কোর্সটি ইতিমধ্যেই সম্পন্ন হয়েছে।'
          : 'You have already completed this course.',
    };
  }

  if ((state.lastEducationYear ?? 0) === state.year) {
    return {
      state,
      error:
        lang === 'bn'
          ? `প্রতি বছর মাত্র ১টি দক্ষতা কোর্স নেওয়া যাবে। পরবর্তী বছরে (বছর ${state.year + 1}) আবার চেষ্টা করুন।`
          : `Only 1 skill upgrade per year. Unlock the next one in Year ${state.year + 1}.`,
    };
  }

  const cost = getEffectiveEducationCost(course, state);
  const title = getEducationCourseTitle(course, lang);

  if (state.cash < cost) {
    return {
      state,
      error:
        lang === 'bn'
          ? `পর্যাপ্ত নগদ নেই। প্রয়োজন ${formatCurrency(cost)}, হাতে আছে ${formatCurrency(state.cash)}।`
          : `Insufficient cash. Need ${formatCurrency(cost)}, available ${formatCurrency(state.cash)}.`,
    };
  }

  const boostPct = randomInt(course.minSalaryBoostPct, course.maxSalaryBoostPct);
  const salaryIncrease = Math.max(50, Math.round((state.salary * (boostPct / 100)) / 10) * 10);
  const nextSalary = roundMoney(state.salary + salaryIncrease);
  const nextCash = roundMoney(state.cash - cost);
  const nextCompleted = [...completedIds, courseId];
  const nextBoosts = { ...(state.educationBoostsById ?? {}), [courseId]: boostPct };

  const txs = appendTx(
    state.transactions,
    state.currentTurn,
    state.year,
    state.month,
    'Lifestyle',
    `Education: ${course.titleEn} (+${boostPct}% Salary)`,
    -cost,
    nextCash
  );

  const nextState = checkVictory({
    ...state,
    cash: nextCash,
    salary: nextSalary,
    completedEducationIds: nextCompleted,
    educationBoostsById: nextBoosts,
    lastEducationYear: state.year,
    actionsUsedThisTurn: Math.min(6, (state.actionsUsedThisTurn ?? 0) + 1),
    transactions: txs,
  });

  return {
    state: nextState,
    successMessage:
      lang === 'bn'
        ? `${title} সম্পন্ন! মাসিক বেতন +${boostPct}% বেড়েছে (+${formatCurrency(salaryIncrease)}/মাস)।`
        : `${title} completed! Monthly salary increased by +${boostPct}% (+${formatCurrency(salaryIncrease)}/mo).`,
  };
}







