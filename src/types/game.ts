export type GameScreen =
  | 'MENU'
  | 'PROFESSION_SELECT'
  | 'HOW_TO_PLAY'
  | 'SETTINGS'
  | 'ABOUT'
  | 'PLAYING';

export type NavSection =
  | 'dashboard'
  | 'finances'
  | 'investments'
  | 'properties'
  | 'businesses'
  | 'loans'
  | 'take_loan'
  | 'zakat'
  | 'tax'
  | 'events'
  | 'reports';

export type LanguageCode = 'en' | 'bn' | 'es' | 'id';

export interface GameSettings {
  soundEnabled: boolean;
  language: LanguageCode;
  confirmNextMonth: boolean;
  autoShowTurnSummary: boolean;
  ignoreEvents?: boolean;
}

export interface LivingExpenses {
  housing: number;
  food: number;
  transportation: number;
  utilities: number;
  education: number;
  entertainment: number;
  other: number;
}

export interface ProfessionProfile {
  id: string;
  name: string;
  title: string;
  description: string;
  monthlySalary: number;
  expenses: LivingExpenses;
  bankLoan: number;
  bankLoanRate: number;
  bankLoanTermMonths: number;
  creditCardDebt: number;
  creditCardRate: number;
  creditCardTermMonths: number;
  otherLiabilities: number;
  otherLiabilityRate: number;
  otherLiabilityTermMonths: number;
  initialCash: number;
}

export type LoanCategory = 'bank' | 'credit_card' | 'property' | 'business' | 'personal' | 'other';

export interface LoanRecord {
  id: string;
  name: string;
  category: LoanCategory;
  principal: number;
  remainingBalance: number;
  annualInterestRate: number;
  termMonths: number;
  remainingMonths: number;
  monthlyPayment: number;
  linkedAssetId?: string;
  originTurn: number;
}

export interface StockDefinition {
  symbol: string;
  name: string;
  sector: string;
  basePrice: number;
  volatility: number;
  annualDividendPerShare: number;
  description: string;
}

export interface StockMarketState {
  symbol: string;
  currentPrice: number;
  previousPrice: number;
  priceHistory: number[];
}

export interface StockHolding {
  symbol: string;
  name: string;
  sector: string;
  shares: number;
  avgBuyPrice: number;
  annualDividendPerShare: number;
}

export interface CryptoDefinition {
  symbol: string;
  name: string;
  basePrice: number;
  volatility: number;
  description: string;
}

export interface CryptoMarketState {
  symbol: string;
  currentPrice: number;
  previousPrice: number;
  priceHistory: number[];
}

export interface CryptoHolding {
  symbol: string;
  name: string;
  units: number;
  avgBuyPrice: number;
}

export type PropertyType = 'residential' | 'commercial' | 'rental';

export interface PropertyListing {
  id: string;
  name: string;
  type: PropertyType;
  location: string;
  purchasePrice: number;
  downPayment: number;
  loanAmount: number;
  loanAnnualRate: number;
  loanTermMonths: number;
  monthlyRentalIncome: number;
  maintenanceExpense: number;
  description: string;
}

export interface OwnedProperty {
  id: string;
  name: string;
  type: PropertyType;
  location: string;
  purchasePrice: number;
  downPayment: number;
  loanId: string | null;
  monthlyRentalIncome: number;
  maintenanceExpense: number;
  currentValue: number;
  purchasedTurn: number;
}

export type BusinessMode = 'existing' | 'startup';

export interface BusinessListing {
  id: string;
  name: string;
  category: string;
  mode: BusinessMode;
  purchasePrice: number;
  initialInvestment: number;
  monthlyRevenue: number;
  monthlyOperatingExpenses: number;
  isAutomated: boolean;
  automationUpgradeCost: number;
  automationMonthlyFee: number;
  description: string;
}

export interface OwnedBusiness {
  id: string;
  name: string;
  category: string;
  mode: BusinessMode;
  purchasePrice: number;
  initialInvestment: number;
  monthlyRevenue: number;
  monthlyOperatingExpenses: number;
  isAutomated: boolean;
  automationUpgradeCost: number;
  automationMonthlyFee: number;
  currentValue: number;
  purchasedTurn: number;
}

export type FixedIncomeKind = 'bond' | 'savings';

export interface FixedIncomeProduct {
  id: string;
  name: string;
  kind: FixedIncomeKind;
  minAmount: number;
  annualInterestRate: number;
  maturityMonths: number; // 0 = liquid savings
  payoutFrequency: 'monthly' | 'maturity';
  description: string;
}

export interface OwnedFixedIncome {
  id: string;
  productId: string;
  name: string;
  kind: FixedIncomeKind;
  principal: number;
  annualInterestRate: number;
  payoutFrequency: 'monthly' | 'maturity';
  startTurn: number;
  maturityMonths: number;
  turnsElapsed: number;
  accruedInterest: number;
  currentValue: number;
}

export type EventCategory = 'opportunity' | 'expense_emergency' | 'life_event';

export type EventEffectType =
  | 'cash_delta'
  | 'salary_multiplier'
  | 'salary_delta'
  | 'expense_delta'
  | 'stock_opportunity'
  | 'property_opportunity'
  | 'business_opportunity'
  | 'market_crash'
  | 'property_boom'
  | 'other_passive_income'
  | 'take_emergency_loan'
  | 'new_baby'
  | 'divorce'
  | 'dismiss';

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  effectType: EventEffectType;
  amount?: number;
  secondaryAmount?: number;
  symbol?: string;
  shares?: number;
  propertyTemplate?: PropertyListing;
  businessTemplate?: BusinessListing;
  requiresCashCheck?: boolean;
  tone?: 'positive' | 'negative' | 'neutral' | 'gold';
}

export interface GameEventCard {
  id: string;
  templateId: string;
  turnGenerated: number;
  category: EventCategory;
  title: string;
  description: string;
  financialImpactSummary: string;
  choices: EventChoice[];
  resolved: boolean;
  resolvedTurn?: number;
  chosenChoiceId?: string;
  resolutionNote?: string;
}

export type TransactionCategory =
  | 'Salary'
  | 'Passive Income'
  | 'Business'
  | 'Living Expenses'
  | 'Loan Payment'
  | 'Property Expense'
  | 'Stock Trade'
  | 'Real Estate'
  | 'Business Trade'
  | 'Bonds & Savings'
  | 'Crypto'
  | 'Loan'
  | 'Event'
  | 'Lifestyle'
  | 'Zakat & Tax';

export interface TransactionRecord {
  id: string;
  turn: number;
  year: number;
  month: number;
  dateLabel: string;
  category: TransactionCategory;
  description: string;
  amount: number;
  balanceAfter: number;
}

export interface MonthlySnapshot {
  turn: number;
  year: number;
  month: number;
  label: string;
  salaryIncome: number;
  passiveIncome: number;
  activeBusinessIncome: number;
  totalIncome: number;
  livingExpenses: number;
  loanPayments: number;
  businessExpenses: number;
  propertyExpenses: number;
  totalExpenses: number;
  cashFlow: number;
  cashOnHand: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  investmentPnL: number;
  happiness?: number;
  freedomProgressPct?: number;
}

export interface TurnActionItem {
  category: TransactionCategory;
  description: string;
  amount: number;
}

export interface TurnInvestmentResultItem {
  category: 'stocks' | 'gold' | 'bonds' | 'crypto' | 'real_estate' | 'businesses';
  labelEn: string;
  labelBn: string;
  valueBefore: number;
  valueAfter: number;
  cashEarned: number;
  returnPct: number;
  amountDelta: number;
}

export interface TurnDesireImpactItem {
  id: string;
  labelEn: string;
  labelBn: string;
  delta: number;
}

export interface TurnEventSummaryCard {
  id: string;
  kind:
    | 'black_swan'
    | 'inflation'
    | 'accident'
    | 'baby'
    | 'divorce'
    | 'tax_zakat'
    | 'resolved_event'
    | 'new_events';
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  resultLabelEn?: string;
  resultLabelBn?: string;
  highlightPct?: number;
  trendDeltaPct?: number;
  previousPct?: number;
  tone?: 'positive' | 'negative' | 'neutral' | 'gold';
}

export interface TurnSummary {
  turn: number;
  year: number;
  month: number;
  completedTurn?: number;
  completedYear?: number;
  completedMonth?: number;
  cashAfter?: number;
  totalAssetsAfter?: number;
  totalExpensesAfter?: number;
  freedomCapitalGoal?: number;
  salaryChangePct?: number;
  salaryReceived: number;
  passiveIncomeReceived: number;
  stockDividendsReceived?: number;
  goldDividendsReceived?: number;
  bondInterestReceived?: number;
  savingsInterestReceived?: number;
  rentalIncomeReceived?: number;
  automatedBusinessReceived?: number;
  otherPassiveReceived?: number;
  activeBusinessRevenue: number;
  livingExpensesPaid: number;
  insurancePaid?: number;
  loanPaymentsPaid: number;
  businessExpensesPaid: number;
  propertyExpensesPaid: number;
  maturedFixedIncomePayout: number;
  emergencyCreditDrawn?: number;
  babyBirthCostPaid?: number;
  netTurnCashChange: number;
  netWorthAfter?: number;
  netWorthDelta?: number;
  passiveIncomeAfter?: number;
  passiveIncomeDelta?: number;
  freedomProgressPctAfter?: number;
  freedomProgressDelta?: number;
  happinessAfter?: number;
  happinessDelta?: number;
  actionsCountThisTurn?: number;
  actionsDuringTurn?: TurnActionItem[];
  investmentResults?: TurnInvestmentResultItem[];
  desireImpacts?: TurnDesireImpactItem[];
  eventSummaryCards?: TurnEventSummaryCard[];
  eventsGeneratedCount: number;
  newVictoryTriggered: boolean;
  blackSwanTriggered?: boolean;
  blackSwanMarketDropPct?: number;
  blackSwanGoldSurgePct?: number;
  blackSwanGoldProfit?: number;
  annualInflationPct?: number;
  previousInflationRate?: number;
  inflationRateCurrent?: number;
  inflationLivingCostDelta?: number;
  babyBornThisTurn?: boolean;
  divorceThisTurn?: boolean;
  divorceSettlementPaid?: number;
  yearlyMissingAssetsHappinessLoss?: number;
  uninsuredAccidentOccurred?: boolean;
  uninsuredAccidentAssetId?: PersonalAssetId;
  uninsuredAccidentCashLoss?: number;
  uninsuredAccidentHappinessLoss?: number;
  zakatAssessedThisYearEnd?: number;
  taxAssessedThisYearEnd?: number;
  notes: string[];
}

export type MaritalStatus = 'single' | 'married' | 'divorced';

export interface HappinessItem {
  id: string;
  templateId?: string;
  nameEn: string;
  nameBn: string;
  cost: number;
  happinessGain: number;
}

export interface CharacterVenture {
  id: string;
  templateId?: string;
  titleEn: string;
  titleBn: string;
  cost: number;
  winChance: number;
  minNetProfit: number;
  maxNetProfit: number;
}

export interface EducationCourse {
  id: string;
  tier: 1 | 2 | 3 | 4 | 5;
  titleEn: string;
  titleBn: string;
  cost: number;
  minSalaryBoostPct: number;
  maxSalaryBoostPct: number;
}

export type PersonalAssetId = 'car' | 'house' | 'yacht' | 'villa';

export interface PersonalAssetCatalogItem {
  id: PersonalAssetId;
  nameEn: string;
  nameBn: string;
  basePrice: number;
  yearlyHappinessPenalty: number;
  monthlyInsurance: number;
  accidentLossMinPct: number;
  accidentLossMaxPct: number;
  accidentHappinessLoss: number;
  buyHappinessBonus: number;
}

export interface OwnedPersonalAsset {
  id: PersonalAssetId;
  purchasePrice: number;
  insured: boolean;
  purchasedTurn: number;
}

export type LotteryTicketId = 'scratch_25' | 'national_75' | 'grand_200';

export interface LotteryTicketDef {
  id: LotteryTicketId;
  nameEn: string;
  nameBn: string;
  cost: number;
  jackpotMin: number;
  jackpotMax: number;
  bigWinMin: number;
  bigWinMax: number;
  smallWinMin: number;
  smallWinMax: number;
  jackpotChance: number;
  bigWinChance: number;
  smallWinChance: number;
  jackpotHappinessBonus: number;
}

export interface MarketState {
  stocks: Record<string, StockMarketState>;
  crypto: Record<string, CryptoMarketState>;
  availableProperties: PropertyListing[];
  availableBusinesses: BusinessListing[];
}

export interface PendingOpportunityDeal {
  id: string;
  eventId: string;
  templateId: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  symbol: string;
  shares: number;
  offerPrice: number;
  cost: number;
  turnPurchased: number;
}

export interface GameState {
  version: number;
  gameId: string;
  seed: number;
  professionId: string;
  professionName: string;
  currentTurn: number;
  lastProcessedTurn: number;
  year: number;
  month: number; // 1..12
  cash: number;
  salary: number;
  otherPassiveIncome: number;
  livingExpenses: LivingExpenses;
  stocks: StockHolding[];
  crypto: CryptoHolding[];
  properties: OwnedProperty[];
  businesses: OwnedBusiness[];
  fixedIncome: OwnedFixedIncome[];
  loans: LoanRecord[];
  market: MarketState;
  pendingEvents: GameEventCard[];
  pendingOpportunityDeals?: PendingOpportunityDeal[];
  eventHistory: GameEventCard[];
  transactions: TransactionRecord[];
  monthlyHistory: MonthlySnapshot[];
  realizedInvestmentPnL: number;
  happiness: number; // < 50 triggers Game Over, unlimited upside
  actionsUsedThisTurn: number; // 0..6
  monthlyExpensePaidThisTurn?: boolean;
  monthlyExpensePaidAmountThisTurn?: number;
  healthInsured: boolean;
  propertyInsured: boolean;
  personalAssets?: OwnedPersonalAsset[];
  activeVentures?: CharacterVenture[];
  activeHappinessItems?: HappinessItem[];
  purchasedHappinessIdsThisTurn?: string[];
  handledHappinessIdsThisTurn?: string[];
  ignoredHappinessIdsThisTurn?: string[];
  playedLotteryIdsThisTurn?: string[];
  completedEducationIds?: string[];
  educationBoostsById?: Record<string, number>;
  lastEducationYear?: number;
  inflationRate?: number;
  inflationMultiplier?: number;
  maritalStatus?: MaritalStatus;
  childrenCount?: number;
  marriageCount?: number;
  divorceCount?: number;
  gameOver: boolean;
  gameOverTurn: number | null;
  victoryAchieved: boolean;
  victoryTurn: number | null;
  victoryContinued: boolean;
  blackSwanScheduleYear?: number;
  blackSwanScheduledMonths?: number[];
  zakatAccrualMonths?: number;
  zakatDueBalance?: number;
  zakatPaidTotal?: number;
  zakatPaidAdvanceThisYear?: number;
  zakatHappinessAwardedYear?: number;
  taxableIncomeYTD?: number;
  incomeTaxDueBalance?: number;
  incomeTaxPaidTotal?: number;
  incomeTaxPaidAdvanceThisYear?: number;
  taxHappinessAwardedYear?: number;
  lastTurnSummary: TurnSummary | null;
}

export interface FinancialSummary {
  // Income statement
  salaryIncome: number;
  businessIncome: number;
  automatedBusinessIncome: number;
  activeBusinessIncome: number;
  rentalIncome: number;
  dividendIncome: number;
  interestIncome: number;
  otherPassiveIncome: number;
  passiveIncome: number;
  totalIncome: number;

  // Expenses
  housingExpense: number;
  foodExpense: number;
  transportationExpense: number;
  utilitiesExpense: number;
  educationExpense: number;
  entertainmentExpense: number;
  otherLivingExpense: number;
  livingExpensesTotal: number;
  loanPaymentsTotal: number;
  businessExpensesTotal: number;
  propertyExpensesTotal: number;
  totalExpenses: number;

  // Cash flow
  monthlyCashFlow: number;

  // Balance sheet - Assets
  cashAsset: number;
  bankSavingsAsset: number;
  stocksAsset: number;
  realEstateAsset: number;
  businessesAsset: number;
  bondsAsset: number;
  otherInvestmentsAsset: number;
  personalAssetsValue: number;
  totalAssets: number;

  // Balance sheet - Liabilities
  bankLoansLiability: number;
  creditCardLiability: number;
  propertyLoansLiability: number;
  businessLoansLiability: number;
  personalLoansLiability: number;
  totalLiabilities: number;

  // Net Worth & P&L
  netWorth: number;
  unrealizedInvestmentPnL: number;
  totalInvestmentPnL: number;

  // Lifestyle, Insurance & Loan/Goal metrics
  insuranceMonthlyCost: number;
  happiness: number;
  characterSynergyBonusIncome: number;
  maxLoanEligibility: number;
  remainingBorrowingCapacity: number;
  freedomProgressPct: number;
  isFinanciallyFree: boolean;

  // Zakat & Income Tax (Live auto-accruing & wealth-responsive)
  zakatNisab: number;
  zakatableNetWealth: number;
  zakatEligible: boolean;
  zakatAccruedPct: number;
  zakatAccruedCurrent: number;
  zakatProjectedAnnual: number;
  zakatDueEffective: number;
  incomeTaxRatePct: number;
  incomeTaxAccruedCurrent: number;
  incomeTaxDueEffective: number;
  incomeTaxLossRelief: number;
}
