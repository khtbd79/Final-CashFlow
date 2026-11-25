import { LanguageCode, LoanCategory, PropertyType, TransactionCategory } from '../types/game';

export interface GuideSectionCopy {
  title: string;
  body: string;
  example: string;
}

export interface TranslationPack {
  appName: string;
  logoText: string;
  pageTitle: string;
  tagline: string;
  continueGame: string;
  startNewGame: string;
  howToPlay: string;
  settings: string;
  about: string;
  chooseProfession: string;
  playBtn: string;
  nextMonth: string;
  nextMonthShort: string;
  yearLabel: string;
  monthLabel: string;
  ratRaceGoal: string;
  investmentsLabel: string;
  cashOnHand: string;
  happinessLabel: string;
  freedomLabel: string;
  passiveIncome: string;
  totalExpenses: string;
  monthlyCashFlow: string;
  netWorth: string;
  totalAssets: string;
  totalLiabilities: string;
  common: {
    back: string;
    close: string;
    cancel: string;
    on: string;
    off: string;
    menu: string;
    more: string;
    loadingDb: string;
    offlineFooter: string;
    insufficientCash: string;
    perMonth: string;
    monthsShort: string;
    monthsLeft: string;
    sharesShort: string;
    apr: string;
    apy: string;
    ownedCount: string;
    activeCount: string;
    chartEmpty: string;
    langBanglaLabel: string;
    langEnglishLabel: string;
  };
  nav: {
    dashboard: string;
    finances: string;
    investments: string;
    properties: string;
    businesses: string;
    loans: string;
    takeLoan: string;
    zakat: string;
    tax: string;
    events: string;
    reports: string;
  };
  mainMenu: {
    confirmNewTitle: string;
    confirmNewDesc: string;
  };
  profSelect: {
    startingProfile: string;
    viewBreakdown: string;
    hideDetails: string;
    monthlySalary: string;
    monthlyCashFlow: string;
    initialCash: string;
    totalLiabilities: string;
    expensesAndDebts: string;
    livingExpenses: string;
    loanInstallments: string;
    bankOtherLoans: string;
    creditCardDebt: string;
    startingNetWorth: string;
    prevAria: string;
    nextAria: string;
  };
  howToPlayPage: {
    headerTitle: string;
    heroTitle: string;
    heroBodyPrefix: string;
    heroPassiveWord: string;
    heroBodyMid: string;
    heroExpenseWord: string;
    heroBodySuffix: string;
    sections: GuideSectionCopy[];
  };
  aboutPage: {
    headerTitle: string;
    title: string;
    subtitle: string;
    body: string;
    localTitle: string;
    localDesc: string;
    offlineTitle: string;
    offlineDesc: string;
  };
  settingsPage: {
    headerTitle: string;
    prefsTitle: string;
    prefsSubtitle: string;
    soundTitle: string;
    soundDesc: string;
    langTitle: string;
    langDesc: string;
    summaryModalTitle: string;
    summaryModalDesc: string;
    confirmNextTitle: string;
    confirmNextDesc: string;
    ignoreEventsTitle: string;
    ignoreEventsDesc: string;
    saveTitle: string;
    saveSubtitle: string;
    exportBtn: string;
    importBtn: string;
    resetBtn: string;
    exportOk: string;
    importOkPrefix: string;
    importErrInvalid: string;
    importErrRead: string;
    resetOk: string;
    resetDialogTitle: string;
    resetDialogDesc: string;
    resetConfirmBtn: string;
    offlineBatBtn: string;
    offlineBatOk: string;
    webIntoAppZipBtn: string;
    webIntoAppZipOk: string;
    webIntoAppZipNote: string;
  };
  shell: {
    passiveExp: string;
    allSections: string;
    confirmNextTitle: string;
    confirmNextDescPrefix: string;
    confirmNextDescSuffix: string;
    openMenuAria: string;
    closeMenuAria: string;
  };
  pwa: {
    installOffline: string;
    installIos: string;
    iosTitle: string;
    iosStep1Prefix: string;
    iosShareWord: string;
    iosStep1Suffix: string;
    iosStep2Prefix: string;
    iosAddWord: string;
    iosStep2Suffix: string;
    gotIt: string;
  };
  dashboard: {
    pendingSingular: string;
    pendingPlural: string;
    blockingPrefix: string;
    blockingSuffix: string;
    nonBlockingNotice: string;
    openEvents: string;
    freedomAchieved: string;
    freedomAchievedDesc: string;
    freedomRemainingPrefix: string;
    freedomRemainingSuffix: string;
    incomeTag: string;
    expensesTag: string;
    financialOverview: string;
    incomeBalanceLink: string;
    monthlySalaryMetric: string;
    totalMonthlyIncomeMetric: string;
    totalMonthlyExpensesMetric: string;
    monthlyLoanPaymentsMetric: string;
    chartTitle: string;
    chartSubtitle: string;
    reportsLink: string;
    quickTitle: string;
    quickSubtitle: string;
    stocksBondsTitle: string;
    realEstateTitle: string;
    businessesTitle: string;
    loansDebtTitle: string;
    buyHappinessTitle: string;
    insuranceTitle: string;
    insuranceActive: string;
    characterBonusLbl: string;
    actionsLabel: string;
    venturesTitle: string;
    ventureCostLbl: string;
    ventureProfitRangeLbl: string;
    ventureLossChanceLbl: string;
    ventureInvestBtn: string;
    ventureTurnLimitErr: string;
    happinessBoughtBadge: string;
    inflationTag: string;
    childrenLabel: string;
    maritalStatuses: {
      single: string;
      married: string;
      divorced: string;
    };
    marryBtn: string;
    personalAssetsTitle: string;
    buyBtn: string;
    ownedBadge: string;
    insureBtn: string;
    insuredBtn: string;
    insuranceRequiredBadge: string;
    yearlyPenaltyUnit: string;
    lotteryTitle: string;
    lotteryCostLbl: string;
    lotteryTopPrizeLbl: string;
    lotteryBuyBtn: string;
    lotteryPlayedBadge: string;
    lotteryRandomTag: string;
    insuranceSubtitle: string;
    happinessSubtitle: string;
    personalAssetsSubtitle: string;
    venturesSubtitle: string;
    lotterySubtitle: string;
    turnCardTitle: string;
    turnCardDesc: string;
    turnCardBtn: string;
    monthlyExpenseTitle: string;
    monthlyExpenseDesc: string;
    payExpenseBtn: string;
    marryCardTitle: string;
    marryCardDesc: string;
    ignoreHappinessAria: string;
    buyHappinessAria: string;
    zakatTaxReminderTitle: string;
    zakatTaxReminderDesc: string;
    openZakatTaxBtn: string;
    educationTitle: string;
    educationSubtitle: string;
    educationSalaryPrefix: string;
    educationCompleted: string;
    educationYearDone: string;
  };
  finances: {
    title: string;
    subtitle: string;
    incomeStatementTab: string;
    balanceSheetTab: string;
    incomeStatementTitle: string;
    incomeFormula: string;
    incomeHeader: string;
    salary: string;
    businessIncome: string;
    rentalIncome: string;
    dividendIncome: string;
    interestIncome: string;
    otherPassiveIncome: string;
    stocksNote: string;
    fixedNote: string;
    propertiesNote: string;
    royaltiesNote: string;
    totalIncome: string;
    passiveSubtotal: string;
    expensesHeader: string;
    housing: string;
    food: string;
    transportation: string;
    utilities: string;
    education: string;
    entertainment: string;
    loanPayments: string;
    businessExpenses: string;
    propertyExpenses: string;
    otherExpenses: string;
    totalExpenses: string;
    netCashNote: string;
    balanceSheetTitle: string;
    balanceFormula: string;
    assetsHeader: string;
    cash: string;
    bankSavings: string;
    stocks: string;
    realEstate: string;
    businesses: string;
    bonds: string;
    otherInvestments: string;
    personalAssets: string;
    liabilitiesHeader: string;
    bankLoans: string;
    creditCardDebt: string;
    propertyLoans: string;
    businessLoans: string;
    personalLoans: string;
    equityNote: string;
    zakatTaxCardTitle: string;
    zakatTaxCardDesc: string;
    zakatTaxOpenBtn: string;
  };
  market: {
    title: string;
    subtitle: string;
    availableCash: string;
    tabs: {
      stocks: string;
      real_estate: string;
      businesses: string;
      bonds_savings: string;
      crypto: string;
    };
    listedCompanies: string;
    holdingsLabel: string;
    divShort: string;
    ownedPrefix: string;
    thisMonth: string;
    shares: string;
    avgCost: string;
    unrealizedPnl: string;
    shareQty: string;
    dividend: string;
    monthlyDividendLabel: string;
    directToCashTag: string;
    orderTotal: string;
    buyShares: string;
    sellShares: string;
    realEstateHubTitle: string;
    realEstateHubDesc: string;
    openPropertiesBtn: string;
    businessHubTitle: string;
    businessHubDesc: string;
    openBusinessBtn: string;
    liquidSavings: string;
    monthBondSuffix: string;
    minLabel: string;
    monthlyPayout: string;
    atMaturity: string;
    depositBtn: string;
    yourFixedTitle: string;
    projectedMonthlyInt: string;
    noFixedEmpty: string;
    liquidTag: string;
    withdrawBtn: string;
    redeemEarlyBtn: string;
    cryptoWarningTitle: string;
    cryptoWarningDesc: string;
    volatilityLabel: string;
    highVolSim: string;
    tradeValue: string;
    buyBtnPrefix: string;
    sellBtnPrefix: string;
    characterFitBadge: string;
    filterAll: string;
    filterCharacterFit: string;
    bonusDividend: string;
    bonusApy: string;
    bonusRent: string;
    bonusRevenue: string;
    investedLabel: string;
    debtLabel: string;
    stocksCardTitle: string;
    bondsCardTitle: string;
    cryptoCardTitle: string;
    realEstateCardTitle: string;
    goldCardTitle: string;
    businessesCardTitle: string;
    loansCardTitle: string;
    backToInvestments: string;
    currentPriceLabel: string;
    annualYieldLabel: string;
    period1Yr: string;
    period5Yr: string;
    period10Yr: string;
    quantityLabel: string;
    investBtn: string;
    withdrawToBalanceBtn: string;
    withdrawModeLabel: string;
    backToInvestBtn: string;
    noHoldingSelected: string;
    withdrawAllAria: string;
    infoHelpAria: string;
    positionsSuffix: string;
    helpStocks: string;
    helpBonds: string;
    helpCrypto: string;
    helpGold: string;
    helpRealEstate: string;
    rentalYieldHeader: string;
    reTierEconomy: string;
    reTierStandard: string;
    reTierPremium: string;
    reTierLuxury: string;
    reYieldEconomy: string;
    reYieldStandard: string;
    reYieldPremium: string;
    reYieldLuxury: string;
  };
  properties: {
    title: string;
    subtitle: string;
    cashAvailable: string;
    borrowingLimit: string;
    ownedTitle: string;
    rentalIncomeLbl: string;
    maintenanceLbl: string;
    totalValue: string;
    emptyOwned: string;
    netSuffix: string;
    value: string;
    equity: string;
    rent: string;
    maintLoan: string;
    mortgageBal: string;
    debtFree: string;
    sellBtn: string;
    availableTitle: string;
    filterAll: string;
    types: Record<PropertyType, string>;
    price: string;
    downPayment: string;
    mortgagePmt: string;
    rentalIncome: string;
    maintenance: string;
    netWithLoan: string;
    netAllCash: string;
    financeBtn: string;
    allCashBtn: string;
    sellDialogTitle: string;
    sellDialogDesc: string;
    sellConfirmBtn: string;
  };
  businesses: {
    title: string;
    subtitleBefore: string;
    subtitleHighlight: string;
    subtitleAfter: string;
    cashAvailable: string;
    launchVenture: string;
    startVentureTitle: string;
    businessModel: string;
    companyName: string;
    companyPlaceholder: string;
    launchBtn: string;
    ownedTitle: string;
    automatedRevLbl: string;
    operatingExpLbl: string;
    portfolioValuation: string;
    emptyOwned: string;
    automatedPassive: string;
    ownerOperatedActive: string;
    profitSuffix: string;
    valuation: string;
    revenue: string;
    expenses: string;
    automateBtn: string;
    contributingPassive: string;
    sellBtn: string;
    marketTitle: string;
    filterAll: string;
    filterExisting: string;
    filterStartup: string;
    newStartup: string;
    existingTag: string;
    automatedTag: string;
    ownerOperatedTag: string;
    capital: string;
    price: string;
    operatingExp: string;
    netProfit: string;
    startBizBtn: string;
    acquireBizBtn: string;
    sellDialogTitle: string;
    sellDialogDesc: string;
    sellConfirmBtn: string;
  };
  loans: {
    title: string;
    subtitle: string;
    totalDebt: string;
    activeFacilities: string;
    monthlyPayments: string;
    principalInterest: string;
    creditEligibility: string;
    incomeAssetBacked: string;
    borrowingCapacity: string;
    remainingLimit: string;
    activeLoansTitle: string;
    debtFreeTitle: string;
    debtFreeDesc: string;
    moLeftSuffix: string;
    repayCustom: string;
    payOffFull: string;
    applyLoanTitle: string;
    loanProduct: string;
    principalAmount: string;
    maxPrefix: string;
    repaymentPeriod: string;
    interestRate: string;
    monthlyInstallment: string;
    totalInterest: string;
    approveBtn: string;
    categories: Record<LoanCategory, string>;
    products: Record<string, string>;
  };
  events: {
    title: string;
    subtitle: string;
    cashPrefix: string;
    activeDecisions: string;
    allResolvedTitle: string;
    allResolvedDesc: string;
    categories: {
      opportunity: string;
      expense_emergency: string;
      life_event: string;
    };
    pastHistoryTitle: string;
    emptyHistory: string;
    ignoreToggleLabel: string;
    ignoreOnBadge: string;
    ignoreOffBadge: string;
    ignoreModeTitle: string;
    ignoreModeDesc: string;
    enableEventsBtn: string;
    ignoreAllBtn: string;
    ignoreSingleBtn: string;
  };
  reports: {
    title: string;
    subtitle: string;
    lastMonthSummaryTitle: string;
    viewSummaryBtn: string;
    totalInvPnl: string;
    realizedPrefix: string;
    unrealizedGain: string;
    markToMarket: string;
    monthsSimulated: string;
    ledgerEntries: string;
    verifiedIds: string;
    chartsTitle: string;
    chartTabs: {
      income_expense: string;
      net_worth: string;
      cash_flow: string;
      pnl: string;
    };
    seriesTotalIncome: string;
    seriesCumulativePnl: string;
    txHistoryTitle: string;
    searchPlaceholder: string;
    allCategories: string;
    dateCol: string;
    categoryCol: string;
    descCol: string;
    amountCol: string;
    balanceCol: string;
    noMatchingTx: string;
    txCategories: Record<TransactionCategory, string>;
  };
  turnSummary: {
    title: string;
    salaryReceived: string;
    passiveReceived: string;
    directToCashNote: string;
    stockDividends: string;
    goldDividends: string;
    bondInterest: string;
    savingsInterest: string;
    rentalIncome: string;
    autoBizIncome: string;
    otherPassive: string;
    activeBizRev: string;
    maturedBond: string;
    livingPaid: string;
    loanPaid: string;
    bizExpPaid: string;
    propMaintPaid: string;
    netCashChange: string;
    viewEventsSingular: string;
    viewEventsPlural: string;
    continueBtn: string;
    blackSwanBadge: string;
    blackSwanTitle: string;
    blackSwanMarketDrop: string;
    blackSwanGoldSurge: string;
    blackSwanGoldProfit: string;
    blackSwanNoGold: string;
    annualInflationAlert: string;
    babyBornAlert: string;
    divorceAlert: string;
    yearlyMissingAssetsAlert: string;
    uninsuredAccidentAlert: string;
    completedBadge: string;
    nextPeriodPrefix: string;
    achievedSectionTitle: string;
    didSectionTitle: string;
    receivedPaidSectionTitle: string;
    netWorthMetric: string;
    passiveMetric: string;
    freedomMetric: string;
    happinessMetric: string;
    noActionsMsg: string;
    insurancePaid: string;
    babyBirthCostPaid: string;
    divorceSettlementLabel: string;
    accidentCashLossLabel: string;
    emergencyCreditLabel: string;
    actionsTag: string;
    yearEndTaxZakatTitle: string;
    yearEndZakatAssessed: string;
    yearEndTaxAssessed: string;
    payZakatTaxBtn: string;
  };
  taxPage: {
    title: string;
    subtitle: string;
    zakatTitle: string;
    zakatSubtitle: string;
    zakatPaidTotalLbl: string;
    incomeTaxTitle: string;
    incomeTaxSubtitle: string;
    taxPaidTotalLbl: string;
    zakatableWealthLbl: string;
    nisabLbl: string;
    zakatAccrualLbl: string;
    taxAccrualLbl: string;
    lifetimePaidLbl: string;
    zakatSectionTitle: string;
    zakatRateBadge: string;
    eligibleBadge: string;
    belowNisabBadge: string;
    zakatRuleDesc: string;
    accrualProgressLbl: string;
    monthsCompletedSuffix: string;
    projectedAnnualLbl: string;
    exemptAssetsNote: string;
    wealthDropNote: string;
    yearEndDueLbl: string;
    currentAccruedLbl: string;
    payYearEndZakatBtn: string;
    payAdvanceZakatBtn: string;
    noZakatDueText: string;
    zakatHappinessTag: string;
    taxSectionTitle: string;
    taxRateBadge: string;
    taxRuleDesc: string;
    taxableIncomeYtdLbl: string;
    currentTaxBracketLbl: string;
    lossReliefLbl: string;
    payYearEndTaxBtn: string;
    payAdvanceTaxBtn: string;
    noTaxDueText: string;
    taxHappinessTag: string;
    assetBreakdownTitle: string;
    zakatableAssetsSumLbl: string;
    deductibleDebtsLbl: string;
    netZakatableLbl: string;
  };
  victory: {
    banner: string;
    title: string;
    bodyBeforeProf: string;
    bodyMid: string;
    bodyAfter: string;
    totalPassive: string;
    monthlyExpenses: string;
    monthsTaken: string;
    totalAssets: string;
    totalLiabilities: string;
    netWorth: string;
    propertiesCount: string;
    businessesCount: string;
    stocksCount: string;
    mainMenuBtn: string;
    continueBtn: string;
  };
  gameOver: {
    title: string;
    reason: string;
    happinessLbl: string;
    monthsSurvivedLbl: string;
    netWorthLbl: string;
    passiveIncomeLbl: string;
    startNewBtn: string;
    mainMenuBtn: string;
  };
  professionNames: Record<string, { name: string; title: string; desc: string }>;
}

const EN: TranslationPack = {
  appName: 'CASHFLOW',
  logoText: 'Cashflow',
  pageTitle: 'CASHFLOW — Offline Financial Simulation Game',
  tagline: 'Build passive income, master your balance sheet, and escape the Rat Race.',
  continueGame: 'Continue Game',
  startNewGame: 'New Game',
  howToPlay: 'How to Play',
  settings: 'Settings',
  about: 'About CASHFLOW',
  chooseProfession: 'Choose Profession',
  playBtn: 'Play',
  nextMonth: 'Next Month',
  nextMonthShort: 'M+1',
  yearLabel: 'Year',
  monthLabel: 'Month',
  ratRaceGoal: 'Financial Freedom Goal',
  investmentsLabel: 'Investments',
  cashOnHand: 'Cash',
  happinessLabel: 'Happiness',
  freedomLabel: 'Freedom',
  passiveIncome: 'Passive Income',
  totalExpenses: 'Monthly Expenses',
  monthlyCashFlow: 'Monthly Cash Flow',
  netWorth: 'Net Worth',
  totalAssets: 'Total Assets',
  totalLiabilities: 'Total Liabilities',
  common: {
    back: 'Back',
    close: 'Close',
    cancel: 'Cancel',
    on: 'On',
    off: 'Off',
    menu: 'Menu',
    more: 'More',
    loadingDb: 'Loading CASHFLOW offline database...',
    offlineFooter: 'CASHFLOW · 100% Offline Financial Simulation',
    insufficientCash: 'Insufficient cash',
    perMonth: '/mo',
    monthsShort: 'mo',
    monthsLeft: 'mo left',
    sharesShort: 'sh',
    apr: 'APR',
    apy: 'APY',
    ownedCount: 'owned',
    activeCount: 'active',
    chartEmpty: 'No chart data yet',
    langBanglaLabel: 'বাংলা',
    langEnglishLabel: 'English',
  },
  nav: {
    dashboard: 'Dashboard',
    finances: 'My Finances',
    investments: 'Market',
    properties: 'Properties',
    businesses: 'Businesses',
    loans: 'Loans & Debt',
    takeLoan: 'Take Loan',
    zakat: 'Zakat',
    tax: 'Income Tax',
    events: 'Opportunities',
    reports: 'Reports',
  },
  mainMenu: {
    confirmNewTitle: 'Start a New Career?',
    confirmNewDesc:
      'Starting a new game will replace your current saved progress in offline storage. You can export your current save first in Settings if you want to keep a backup.',
  },
  profSelect: {
    startingProfile: 'Starting Profile',
    viewBreakdown: 'View breakdown',
    hideDetails: 'Hide details',
    monthlySalary: 'Monthly Salary',
    monthlyCashFlow: 'Monthly Cash Flow',
    initialCash: 'Starting Allocation',
    totalLiabilities: 'Total Liabilities',
    expensesAndDebts: 'Monthly Living Expenses',
    livingExpenses: 'Living Expenses',
    loanInstallments: 'Loan Installments',
    bankOtherLoans: 'Bank + Other Loans',
    creditCardDebt: 'Credit Card Debt',
    startingNetWorth: 'Starting Net Worth',
    prevAria: 'Previous profession',
    nextAria: 'Next profession',
  },
  howToPlayPage: {
    headerTitle: 'How to Play CASHFLOW',
    heroTitle: 'Core Objective: Financial Freedom',
    heroBodyPrefix:
      'Most people stay trapped in the Rat Race—relying solely on a monthly paycheck to pay living expenses and debt. In CASHFLOW, your mission is to acquire income-producing assets until your monthly ',
    heroPassiveWord: 'Passive Income',
    heroBodyMid: ' permanently exceeds your ',
    heroExpenseWord: 'Total Monthly Expenses',
    heroBodySuffix: '.',
    sections: [
      {
        title: '1. Salary, Expenses & Monthly Cash Flow',
        body: 'Your Salary is active income earned from your profession each month. Every month you also pay Living Expenses (housing, food, utilities, transport, education, entertainment) and Loan Payments. Monthly Cash Flow = Total Monthly Income - Total Monthly Expenses.',
        example: 'Example: If you earn $4,600/mo and spend $3,100/mo, your Monthly Cash Flow is +$1,500/mo.',
      },
      {
        title: '2. Assets vs. Liabilities',
        body: 'Assets put money in your pocket or hold marketable value (Cash, Savings, Stocks, Rental Real Estate, Businesses, Bonds). Liabilities take money out via debt payments (Bank Loans, Credit Cards, Mortgages, Personal Loans). Net Worth = Total Assets - Total Liabilities.',
        example: 'Tip: Paying off high-APR Credit Card Debt (16–19%) immediately reduces monthly outflows.',
      },
      {
        title: '3. Passive Income & Escaping the Rat Race',
        body: 'Passive Income is earned without trading your hours: Rental Income, Stock Dividends, Bond & Savings Interest, Royalties, and Automatically Operated Businesses. You win when Total Monthly Passive Income exceeds Total Monthly Expenses.',
        example: 'Winning Condition: Passive Income > Total Monthly Expenses (e.g., $4,200 Passive > $3,900 Expenses).',
      },
      {
        title: '4. Stock Market, Gold, Bonds & Crypto',
        body: 'Browse 8 companies (including Gold Bullion Reserve) with historical price charts and monthly dividends. Buy low, collect monthly dividends directly in your main cash account, and sell high. Bonds & High-Yield Savings also deposit monthly interest directly into your cash balance.',
        example: 'Direct Payouts: Stock dividends, gold yield, bond interest, and savings interest credit straight to Cash every month.',
      },
      {
        title: '5. Real Estate & Business Investments',
        body: 'Purchase residential, commercial, or rental properties using Cash or a Mortgage. Businesses can be bought or launched as startups—upgrade owner-operated businesses to Automated Management so their net profit counts toward Passive Income!',
        example: 'Leverage Rule: Verify Rental Income covers Mortgage Payment + Maintenance Expenses.',
      },
      {
        title: '6. Monthly Turns & Event Cards',
        body: 'Tap Next Month when ready to advance one month. Your salary and passive income are credited, expenses and loan installments are amortized, markets update, and Event Cards arrive requiring your decision.',
        example: 'Offline Safety: Every transaction is saved automatically in local storage—zero internet required.',
      },
    ],
  },
  aboutPage: {
    headerTitle: 'About CASHFLOW',
    title: 'CASHFLOW',
    subtitle: 'Offline Financial Strategy & Life Simulation',
    body: 'CASHFLOW is a single-player financial simulation engineered around real-world accounting accuracy. Every stock purchase, mortgage amortization, business automation upgrade, bond maturity, and emergency expense flows through a unified calculation engine—ensuring your Income Statement, Balance Sheet, and Net Worth always reconcile accurately.',
    localTitle: 'Local Offline Persistence',
    localDesc:
      'All game progress, ledgers, portfolios, and settings are saved locally on your device with JSON backup support.',
    offlineTitle: 'Zero External Dependencies',
    offlineDesc:
      'Play anywhere without internet connectivity—local market simulation, bundled fonts, and offline caching built in.',
  },
  settingsPage: {
    headerTitle: 'Settings & Data',
    prefsTitle: 'Game Preferences',
    prefsSubtitle: 'Stored locally in browser preferences.',
    soundTitle: 'Sound Effects',
    soundDesc: 'Offline synthesized chimes on trades & turns',
    langTitle: 'Interface Language',
    langDesc: 'Switch between English and Bangla across the entire app',
    summaryModalTitle: 'Monthly Summary Modal',
    summaryModalDesc: 'Display cashflow breakdown automatically after each turn',
    confirmNextTitle: 'Confirm Before Next Month',
    confirmNextDesc: 'Show confirmation dialog before advancing turn',
    ignoreEventsTitle: 'Ignore Events Section',
    ignoreEventsDesc: 'Skip monthly events and never block Next Month',
    saveTitle: 'Offline Save Management',
    saveSubtitle: 'Export your complete game state as a backup file or restore from a file.',
    exportBtn: 'Export Backup',
    importBtn: 'Import Backup',
    resetBtn: 'Reset Save',
    exportOk: 'Exported save backup file.',
    importOkPrefix: 'Imported save:',
    importErrInvalid: 'Invalid CASHFLOW save file.',
    importErrRead: 'Failed to read the selected file.',
    resetOk: 'Saved game cleared.',
    resetDialogTitle: 'Reset Saved Game?',
    resetDialogDesc:
      'This permanently deletes your current saved progress from local offline storage. Export a backup first if you wish to keep a copy.',
    resetConfirmBtn: 'Delete Saved Game',
    offlineBatBtn: 'CASHFLOW-Offline.bat',
    offlineBatOk: 'Downloaded CASHFLOW-Offline.bat.',
    webIntoAppZipBtn: 'WebIntoApp ZIP (.zip)',
    webIntoAppZipOk: 'Downloaded CASHFLOW-WebIntoApp.zip (index.html at root, ready for WebIntoApp).',
    webIntoAppZipNote:
      'WebIntoApp Mobile App Package: Includes self-contained index.html directly in the ZIP root (no nested folder) with all scripts, styles, fonts, and images bundled offline.',
  },
  shell: {
    passiveExp: 'Passive / Exp',
    allSections: 'All Sections',
    confirmNextTitle: 'Advance to Next Month?',
    confirmNextDescPrefix: 'Close',
    confirmNextDescSuffix:
      'and process monthly income, expenses, loan amortization, and market events.',
    openMenuAria: 'Open Navigation Menu',
    closeMenuAria: 'Close navigation menu',
  },
  pwa: {
    installOffline: 'Install Offline App',
    installIos: 'Install on Phone',
    iosTitle: 'Install on Phone or Tablet',
    iosStep1Prefix: '1. Tap the ',
    iosShareWord: 'Share',
    iosStep1Suffix: ' button in the browser toolbar.',
    iosStep2Prefix: '2. Scroll down and tap ',
    iosAddWord: 'Add to Home Screen',
    iosStep2Suffix: ' to play CASHFLOW offline anytime.',
    gotIt: 'Got It',
  },
  dashboard: {
    pendingSingular: 'Event Card Pending',
    pendingPlural: 'Event Cards Pending',
    blockingPrefix: 'mandatory event must be resolved before advancing to Next Month.',
    blockingSuffix: '',
    nonBlockingNotice: 'Review new opportunities before closing the month.',
    openEvents: 'Open Opportunities',
    freedomAchieved: 'Financial Freedom Achieved!',
    freedomAchievedDesc:
      'Passive income now exceeds all monthly expenses. Continue growing your wealth or inspect your achievements.',
    freedomRemainingPrefix: 'Earn',
    freedomRemainingSuffix:
      '/mo more in passive income from stocks, properties, businesses, or bonds to escape the Rat Race.',
    incomeTag: 'Income',
    expensesTag: 'Expenses',
    financialOverview: 'Financial Overview',
    incomeBalanceLink: 'Income & Balance Sheet →',
    monthlySalaryMetric: 'Monthly Salary',
    totalMonthlyIncomeMetric: 'Total Monthly Income',
    totalMonthlyExpensesMetric: 'Total Monthly Expenses',
    monthlyLoanPaymentsMetric: 'Monthly Loan Payments',
    chartTitle: 'Passive Income vs. Expenses',
    chartSubtitle: 'Monthly Rat Race crossover chart',
    reportsLink: 'Reports →',
    quickTitle: 'Quick Markets & Tools',
    quickSubtitle: 'Acquire cash-flowing assets or pay down debt to improve monthly cash flow.',
    stocksBondsTitle: 'Stocks & Bonds',
    realEstateTitle: 'Real Estate',
    businessesTitle: 'Businesses',
    loansDebtTitle: 'Loans & Debt',
    buyHappinessTitle: 'Buy Happiness',
    insuranceTitle: 'Insurance',
    insuranceActive: 'Active',
    characterBonusLbl: 'Character Fit Bonus',
    actionsLabel: 'Actions',
    venturesTitle: 'Special Opportunities',
    ventureCostLbl: 'Cost',
    ventureProfitRangeLbl: 'Random Profit',
    ventureLossChanceLbl: 'Total Loss Risk',
    ventureInvestBtn: 'Invest',
    ventureTurnLimitErr: 'Turn action limit (6/6) reached — advance to Next Month.',
    happinessBoughtBadge: 'Purchased',
    inflationTag: 'Inflation',
    childrenLabel: 'Children',
    maritalStatuses: {
      single: 'Single',
      married: 'Married',
      divorced: 'Divorced',
    },
    marryBtn: 'Get Married',
    personalAssetsTitle: 'Luxury',
    buyBtn: 'Buy',
    ownedBadge: 'Owned',
    insureBtn: 'Insure',
    insuredBtn: 'Insured',
    insuranceRequiredBadge: 'Insurance Required',
    yearlyPenaltyUnit: 'Happiness/yr',
    lotteryTitle: 'Lottery',
    lotteryCostLbl: 'Ticket',
    lotteryTopPrizeLbl: 'Top Jackpot',
    lotteryBuyBtn: 'Buy Ticket',
    lotteryPlayedBadge: 'Drawn',
    lotteryRandomTag: 'Pure Random',
    insuranceSubtitle: 'If an accident occurs, insurance covers your expenses.',
    happinessSubtitle: 'Boost your happiness and enjoy life experiences.',
    personalAssetsSubtitle: 'Fulfill your desires.',
    venturesSubtitle: 'Short-term opportunities matched to your profession.',
    lotterySubtitle: 'Test your luck.',
    turnCardTitle: 'Before Ending the Month',
    turnCardDesc:
      'Review available opportunities, invest your extra cash, and consider insurance and education.',
    turnCardBtn: 'End Month',
    monthlyExpenseTitle: 'Monthly Expenses',
    monthlyExpenseDesc:
      'Includes food, housing, transportation, utilities, and living costs. You must pay this before ending your turn.',
    payExpenseBtn: 'Pay Expenses',
    marryCardTitle: 'Get Married',
    marryCardDesc:
      'Get Married. Celebrate a new chapter with your partner, grow family joy, and share life together.',
    ignoreHappinessAria: 'Ignore option',
    buyHappinessAria: 'Buy option',
    zakatTaxReminderTitle: 'Year-End Zakat & Income Tax Due',
    zakatTaxReminderDesc:
      'Paying your Zakat or Income Tax clears your annual obligation and grants bonus Happiness.',
    openZakatTaxBtn: 'Open Zakat & Tax',
    educationTitle: 'Education',
    educationSubtitle:
      'The value of your labor depends on job demand, experience, knowledge, and skills.',
    educationSalaryPrefix: 'Salary',
    educationCompleted: 'Completed',
    educationYearDone: '1/1 this year',
  },
  finances: {
    title: 'My Financial Statements',
    subtitle: 'Real-time Income Statement and Balance Sheet reconciled from your active ledger.',
    incomeStatementTab: 'Income Statement',
    balanceSheetTab: 'Balance Sheet',
    incomeStatementTitle: 'Income Statement',
    incomeFormula: 'Monthly Cash Flow = Total Monthly Income − Total Monthly Expenses',
    incomeHeader: 'Income',
    salary: 'Salary',
    businessIncome: 'Business Income',
    rentalIncome: 'Rental Income',
    dividendIncome: 'Dividend Income',
    interestIncome: 'Interest Income',
    otherPassiveIncome: 'Other Passive Income',
    stocksNote: 'stock positions',
    fixedNote: 'bonds & savings',
    propertiesNote: 'properties',
    royaltiesNote: 'Royalties & licenses',
    totalIncome: 'Total Income',
    passiveSubtotal: 'Passive Income Subtotal',
    expensesHeader: 'Expenses',
    housing: 'Housing',
    food: 'Food',
    transportation: 'Transportation',
    utilities: 'Utilities',
    education: 'Education',
    entertainment: 'Entertainment',
    loanPayments: 'Loan Payments',
    businessExpenses: 'Business Expenses',
    propertyExpenses: 'Property Expenses',
    otherExpenses: 'Other Expenses',
    totalExpenses: 'Total Expenses',
    netCashNote: 'Net cash added every turn',
    balanceSheetTitle: 'Balance Sheet',
    balanceFormula: 'Net Worth = Total Assets − Total Liabilities',
    assetsHeader: 'Assets',
    cash: 'Cash',
    bankSavings: 'Bank Savings',
    stocks: 'Stocks',
    realEstate: 'Real Estate',
    businesses: 'Businesses',
    bonds: 'Bonds',
    otherInvestments: 'Other Investments (Crypto)',
    personalAssets: 'Personal Assets (Home, Car, Yacht)',
    liabilitiesHeader: 'Liabilities',
    bankLoans: 'Bank Loans',
    creditCardDebt: 'Credit Card Debt',
    propertyLoans: 'Property Loans',
    businessLoans: 'Business Loans',
    personalLoans: 'Personal Loans',
    equityNote: 'Total equity position',
    zakatTaxCardTitle: 'Islamic Zakat & Income Tax',
    zakatTaxCardDesc: 'Auto-accruing monthly & shrinks when wealth or portfolio drops.',
    zakatTaxOpenBtn: 'Manage Zakat & Tax',
  },
  market: {
    title: 'Investment Market',
    subtitle: 'Allocate capital across equities, real estate, businesses, fixed income, and crypto.',
    availableCash: 'Available Cash',
    tabs: {
      stocks: 'Stock Market',
      real_estate: 'Real Estate',
      businesses: 'Businesses',
      bonds_savings: 'Bonds & Savings',
      crypto: 'Cryptocurrency',
    },
    listedCompanies: 'Listed Companies',
    holdingsLabel: 'Holdings:',
    divShort: 'Div',
    ownedPrefix: 'Owned:',
    thisMonth: 'this month',
    shares: 'Shares',
    avgCost: 'Avg Cost',
    unrealizedPnl: 'Unrealized P&L',
    shareQty: 'Share Quantity',
    dividend: 'Dividend:',
    monthlyDividendLabel: 'Monthly Dividend',
    directToCashTag: 'Credited monthly to main cash',
    orderTotal: 'Order Total',
    buyShares: 'Buy Shares',
    sellShares: 'Sell Shares',
    realEstateHubTitle: 'Real Estate Marketplace & Portfolio',
    realEstateHubDesc: 'properties available this month · You own',
    openPropertiesBtn: 'Open Properties Desk',
    businessHubTitle: 'Business Acquisitions & Startups',
    businessHubDesc: 'opportunities open · You operate',
    openBusinessBtn: 'Open Business Desk',
    liquidSavings: 'Liquid Savings',
    monthBondSuffix: '-Month Bond',
    minLabel: 'Min:',
    monthlyPayout: 'Monthly Payout',
    atMaturity: 'At Maturity',
    depositBtn: 'Deposit',
    yourFixedTitle: 'Your Savings & Bonds',
    projectedMonthlyInt: 'Monthly Interest Projected:',
    noFixedEmpty: 'No active savings deposits or bonds yet.',
    liquidTag: 'Liquid',
    withdrawBtn: 'Withdraw',
    redeemEarlyBtn: 'Redeem Early',
    cryptoWarningTitle: 'High-Volatility Simulated Investment',
    cryptoWarningDesc:
      'Simulated digital assets experience sharp monthly price swings (±25–40%) and generate zero passive cash flow.',
    volatilityLabel: 'Volatility',
    highVolSim: 'High-Volatility Simulated',
    tradeValue: 'Trade Value',
    buyBtnPrefix: 'Buy',
    sellBtnPrefix: 'Sell',
    characterFitBadge: '★ Character Fit',
    filterAll: 'All',
    filterCharacterFit: '★ Character Fit',
    bonusDividend: '+20% Div',
    bonusApy: '+1.0% APY',
    bonusRent: '+12% Rent',
    bonusRevenue: '+15% Rev',
    investedLabel: 'Invested:',
    debtLabel: 'Total Debt:',
    stocksCardTitle: 'Stocks',
    bondsCardTitle: 'Government Bonds & Savings',
    cryptoCardTitle: 'Crypto',
    realEstateCardTitle: 'Real Estate',
    goldCardTitle: 'Gold',
    businessesCardTitle: 'Businesses',
    loansCardTitle: 'Loans & Debt',
    backToInvestments: 'Back to Investments',
    currentPriceLabel: 'Current Price:',
    annualYieldLabel: 'Annual Yield:',
    period1Yr: '1 yr',
    period5Yr: '5 yr',
    period10Yr: '10 yr',
    quantityLabel: 'Qty',
    investBtn: 'Invest',
    withdrawToBalanceBtn: 'Withdraw to Balance',
    withdrawModeLabel: 'Withdraw to Main Balance',
    backToInvestBtn: 'Invest Mode',
    noHoldingSelected: 'No active holding in this asset',
    withdrawAllAria: 'Switch slider to withdraw invested funds to balance',
    infoHelpAria: 'Investment details',
    positionsSuffix: 'positions',
    helpStocks: 'Drag the slider right to allocate cash and tap Invest. Dividends credit to Cash monthly. Tap the yellow dollar tray icon to switch the slider to withdraw funds back to Cash.',
    helpBonds: 'Drag the slider right to deposit into government bonds or high-yield savings. Interest pays monthly to Cash. Tap the yellow dollar tray icon to withdraw your chosen amount anytime.',
    helpCrypto: 'High-volatility simulated crypto assets with no monthly dividend. Drag the slider right to invest, or tap the yellow dollar tray icon to withdraw any amount back to Cash.',
    helpGold: 'Safe-haven Gold reserve that surges during Black Swan market crashes and pays monthly yield. Drag right to invest or tap the dollar tray icon to withdraw any amount to Cash.',
    helpRealEstate: 'Acquire property classes to earn passive monthly rental income. Tap Invest on any class card when you have enough cash, or manage and sell owned properties anytime.',
    rentalYieldHeader: 'Rental Yield',
    reTierEconomy: 'Economy Class',
    reTierStandard: 'Standard Class',
    reTierPremium: 'Premium Class',
    reTierLuxury: 'Luxury Class',
    reYieldEconomy: '6–8%',
    reYieldStandard: '5–7%',
    reYieldPremium: '4–6%',
    reYieldLuxury: '2–4%',
  },
  properties: {
    title: 'Real Estate Market & Holdings',
    subtitle: 'Acquire residential, rental, and commercial properties for monthly passive rental income.',
    cashAvailable: 'Cash Available',
    borrowingLimit: 'Borrowing Limit',
    ownedTitle: 'Owned Properties',
    rentalIncomeLbl: 'Rental Income:',
    maintenanceLbl: 'Maintenance:',
    totalValue: 'Total Property Value',
    emptyOwned: 'No properties owned yet',
    netSuffix: '/mo net',
    value: 'Value',
    equity: 'Equity',
    rent: 'Rent',
    maintLoan: 'Maint + Loan',
    mortgageBal: 'Mortgage bal:',
    debtFree: 'Owned debt-free',
    sellBtn: 'Sell Property',
    availableTitle: 'Available Properties This Month',
    filterAll: 'All',
    types: {
      rental: 'Rental',
      residential: 'Residential',
      commercial: 'Commercial',
    },
    price: 'Price',
    downPayment: 'Down Payment',
    mortgagePmt: 'Mortgage Pmt',
    rentalIncome: 'Rental Income',
    maintenance: 'Maintenance',
    netWithLoan: 'Net w/ Loan:',
    netAllCash: 'Net All-Cash:',
    financeBtn: 'Finance',
    allCashBtn: 'All-Cash',
    sellDialogTitle: 'Sell Property?',
    sellDialogDesc:
      'Selling at current market value will automatically pay off any linked mortgage and credit net equity to Cash on Hand.',
    sellConfirmBtn: 'Confirm Sale',
  },
  businesses: {
    title: 'Business Market & Operations',
    subtitleBefore: 'Buy existing enterprises or launch startups. Only ',
    subtitleHighlight: 'Automated',
    subtitleAfter: ' businesses count toward Passive Income.',
    cashAvailable: 'Cash Available',
    launchVenture: 'Launch Venture',
    startVentureTitle: 'Start a New Business Venture',
    businessModel: 'Business Model',
    companyName: 'Company Name',
    companyPlaceholder: 'e.g. PeakFlow Studio',
    launchBtn: 'Launch',
    ownedTitle: 'Owned Businesses',
    automatedRevLbl: 'Automated Revenue (Passive):',
    operatingExpLbl: 'Operating Exp:',
    portfolioValuation: 'Portfolio Valuation',
    emptyOwned: 'No businesses owned yet',
    automatedPassive: 'Automated (Passive)',
    ownerOperatedActive: 'Owner-Operated (Active)',
    profitSuffix: '/mo profit',
    valuation: 'Valuation',
    revenue: 'Revenue',
    expenses: 'Expenses',
    automateBtn: 'Automate',
    contributingPassive: 'Contributing to Passive Income',
    sellBtn: 'Sell',
    marketTitle: 'Business Opportunities This Month',
    filterAll: 'All',
    filterExisting: 'Existing Businesses',
    filterStartup: 'Startups',
    newStartup: 'New Startup',
    existingTag: 'Existing',
    automatedTag: 'Automated',
    ownerOperatedTag: 'Owner-Operated',
    capital: 'Capital',
    price: 'Price',
    operatingExp: 'Operating Exp',
    netProfit: 'Net Profit',
    startBizBtn: 'Start Business',
    acquireBizBtn: 'Acquire Business',
    sellDialogTitle: 'Sell Business?',
    sellDialogDesc:
      'You will receive its current cash valuation and remove its monthly revenue and operating expenses.',
    sellConfirmBtn: 'Sell Business',
  },
  loans: {
    title: 'Loans & Credit Management',
    subtitle: 'Track credit eligibility, pay down high-interest debt early, or apply for structured financing.',
    totalDebt: 'Total Debt',
    activeFacilities: 'active facilities',
    monthlyPayments: 'Monthly Payments',
    principalInterest: 'Principal + interest',
    creditEligibility: 'Credit Eligibility',
    incomeAssetBacked: 'Income & asset backed',
    borrowingCapacity: 'Borrowing Capacity',
    remainingLimit: 'Remaining limit',
    activeLoansTitle: 'Active Loans & Credit Balances',
    debtFreeTitle: 'Debt-Free Balance Sheet',
    debtFreeDesc: 'You currently have zero outstanding loans or credit card balances.',
    moLeftSuffix: 'mo left',
    repayCustom: 'Repay Custom',
    payOffFull: 'Pay Off Full',
    applyLoanTitle: 'Apply for a New Loan',
    loanProduct: 'Loan Product',
    principalAmount: 'Principal Amount',
    maxPrefix: 'Max',
    repaymentPeriod: 'Repayment Period',
    interestRate: 'Interest Rate',
    monthlyInstallment: 'Monthly Installment',
    totalInterest: 'Total Lifetime Interest',
    approveBtn: 'Approve & Credit',
    categories: {
      bank: 'Bank',
      credit_card: 'Credit Card',
      property: 'Mortgage',
      business: 'Business',
      personal: 'Personal',
      other: 'Other',
    },
    products: {
      personal_flex: 'Personal Term Loan',
      business_exp: 'Business Expansion Facility',
      bank_consolidate: 'Bank Consolidation Loan',
    },
  },
  events: {
    title: 'Opportunities',
    subtitle: 'Every opportunity, emergency expense, and life event requires your deliberate choice.',
    cashPrefix: 'Cash:',
    activeDecisions: 'Active Decisions',
    allResolvedTitle: 'All Monthly Events Resolved',
    allResolvedDesc: '',
    categories: {
      opportunity: 'Opportunity',
      expense_emergency: 'Expense & Emergency',
      life_event: 'Life Event',
    },
    pastHistoryTitle: 'Past Event History',
    emptyHistory: 'No past events',
    ignoreToggleLabel: 'Ignore Events Section',
    ignoreOnBadge: 'Ignored',
    ignoreOffBadge: 'Active',
    ignoreModeTitle: 'Events Section is Ignored',
    ignoreModeDesc: 'Monthly event cards are automatically skipped and will not block Next Month.',
    enableEventsBtn: 'Enable Events',
    ignoreAllBtn: 'Ignore All',
    ignoreSingleBtn: 'Ignore',
  },
  reports: {
    title: 'Financial Reports & Transaction Ledger',
    subtitle: 'Historical performance across income, expenses, asset accumulation, liabilities, and investment P&L.',
    lastMonthSummaryTitle: 'Last Month Summary',
    viewSummaryBtn: 'View Summary',
    totalInvPnl: 'Total Investment P&L',
    realizedPrefix: 'Realized',
    unrealizedGain: 'Unrealized Gain',
    markToMarket: 'Mark-to-market',
    monthsSimulated: 'Months Simulated',
    ledgerEntries: 'Ledger Entries',
    verifiedIds: 'Verified unique IDs',
    chartsTitle: 'Historical Performance Charts',
    chartTabs: {
      income_expense: 'Income & Passive',
      net_worth: 'Assets & Net Worth',
      cash_flow: 'Cash Flow',
      pnl: 'Investment P&L',
    },
    seriesTotalIncome: 'Total Income',
    seriesCumulativePnl: 'Cumulative Investment P&L',
    txHistoryTitle: 'Transaction History',
    searchPlaceholder: 'Search ledger...',
    allCategories: 'All Categories',
    dateCol: 'Date',
    categoryCol: 'Category',
    descCol: 'Description',
    amountCol: 'Amount',
    balanceCol: 'Cash Balance',
    noMatchingTx: 'No matching transactions found.',
    txCategories: {
      Salary: 'Salary',
      'Passive Income': 'Passive Income',
      Business: 'Business',
      'Living Expenses': 'Living Expenses',
      'Loan Payment': 'Loan Payment',
      'Property Expense': 'Property Expense',
      'Stock Trade': 'Stock Trade',
      'Real Estate': 'Real Estate',
      'Business Trade': 'Business Trade',
      'Bonds & Savings': 'Bonds & Savings',
      Crypto: 'Crypto',
      Loan: 'Loan',
      Event: 'Event',
      Lifestyle: 'Happiness & Insurance',
      'Zakat & Tax': 'Zakat & Tax',
    },
  },
  turnSummary: {
    title: 'Monthly Turn Summary',
    salaryReceived: 'Salary Received',
    passiveReceived: 'Passive Income Received',
    directToCashNote: 'Credited directly to main cash account',
    stockDividends: 'Stock Market Dividends',
    goldDividends: 'Gold Investment Dividends',
    bondInterest: 'Bond Monthly Interest',
    savingsInterest: 'Savings Monthly Interest',
    rentalIncome: 'Property Rental Income',
    autoBizIncome: 'Automated Business Income',
    otherPassive: 'Royalties & Other Passive',
    activeBizRev: 'Active Business Revenue',
    maturedBond: 'Matured Bond Payout',
    livingPaid: 'Living Expenses Paid',
    loanPaid: 'Loan Installments Paid',
    bizExpPaid: 'Business Operating Expenses',
    propMaintPaid: 'Property Maintenance',
    netCashChange: 'Net Cash Change',
    viewEventsSingular: 'View 1 New Event',
    viewEventsPlural: 'New Events',
    continueBtn: 'Continue',
    blackSwanBadge: 'BLACK SWAN',
    blackSwanTitle: 'Sudden Market Crash',
    blackSwanMarketDrop: 'Market Crash',
    blackSwanGoldSurge: 'Gold Surge',
    blackSwanGoldProfit: 'Your Gold Profit',
    blackSwanNoGold: 'Only Gold holders stayed in profit',
    annualInflationAlert: 'Annual Inflation',
    babyBornAlert: 'New Baby Born (+14 Happiness)',
    divorceAlert: 'Divorce Settlement (-14 Happiness)',
    yearlyMissingAssetsAlert: 'Yearly Missing Home/Car/Yacht Penalty',
    uninsuredAccidentAlert: 'Uninsured Asset Accident',
    completedBadge: 'Completed',
    nextPeriodPrefix: 'Next:',
    achievedSectionTitle: 'What You Achieved',
    didSectionTitle: 'What You Did This Month',
    receivedPaidSectionTitle: 'Received & Paid at Month End',
    netWorthMetric: 'Net Worth',
    passiveMetric: 'Passive Income',
    freedomMetric: 'Financial Freedom',
    happinessMetric: 'Happiness',
    noActionsMsg: 'No separate trades or purchases were made this month.',
    insurancePaid: 'Insurance Premiums Paid',
    babyBirthCostPaid: 'New Baby Care Expense',
    divorceSettlementLabel: 'Divorce Legal Settlement',
    accidentCashLossLabel: 'Uninsured Accident Loss',
    emergencyCreditLabel: 'Emergency Credit Drawn',
    actionsTag: 'actions',
    yearEndTaxZakatTitle: 'Year-End Zakat & Income Tax Assessed',
    yearEndZakatAssessed: 'Islamic Zakat Due (2.5%)',
    yearEndTaxAssessed: 'Income Tax Due',
    payZakatTaxBtn: 'Pay Zakat & Tax',
  },
  taxPage: {
    title: 'Islamic Zakat & Income Tax',
    subtitle:
      'Auto-accruing monthly obligations that scale down automatically if your wealth drops, and reward Happiness when paid.',
    zakatTitle: 'Islamic Zakat',
    zakatSubtitle:
      '2.5% annual obligation on net zakatable wealth above Nisab, auto-accruing monthly and rewarding Happiness when paid.',
    zakatPaidTotalLbl: 'Total Zakat Paid',
    incomeTaxTitle: 'Income Tax',
    incomeTaxSubtitle:
      'Progressive tax on your annual income and realized gains, automatically adjusted if wealth or markets dip.',
    taxPaidTotalLbl: 'Total Income Tax Paid',
    zakatableWealthLbl: 'Zakatable Net Wealth',
    nisabLbl: 'Nisab Threshold',
    zakatAccrualLbl: 'Zakat Auto-Accrual',
    taxAccrualLbl: 'Income Tax Accrued',
    lifetimePaidLbl: 'Total Zakat & Tax Paid',
    zakatSectionTitle: 'Islamic Zakat (২.৫% / 2.5% Annually)',
    zakatRateBadge: '2.5% Annual Obligation',
    eligibleBadge: 'Nisab Reached · Obligatory',
    belowNisabBadge: 'Below Nisab · $0 Due',
    zakatRuleDesc:
      'Due at year-end only when Zakatable Net Wealth (Cash + Savings + Bonds + Stocks/Gold + Crypto + Real Estate + Business − Debts) reaches Nisab ($7,500). Personal-use home, car, and yacht are exempt.',
    accrualProgressLbl: 'Annual Hawl Accrual Progress',
    monthsCompletedSuffix: 'mo above Nisab',
    projectedAnnualLbl: 'Projected Full-Year Zakat (2.5%)',
    exemptAssetsNote: 'Exempt Personal Assets',
    wealthDropNote:
      'Automatically decreases if your wealth declines, and resets to $0 if wealth falls below Nisab.',
    yearEndDueLbl: 'Year-End Unpaid Zakat Due',
    currentAccruedLbl: 'Accrued This Year (Live)',
    payYearEndZakatBtn: 'Pay Year-End Zakat',
    payAdvanceZakatBtn: 'Pay Accrued Zakat',
    noZakatDueText: 'All Zakat obligations settled',
    zakatHappinessTag: '+8 Happiness (Due) / +5 (Advance)',
    taxSectionTitle: 'Progressive Income Tax',
    taxRateBadge: 'Bracket Rate',
    taxRuleDesc:
      'Calculated progressively from your salary, rental, business, dividend, interest income, and realized gains—automatically reduced by market losses or lower net worth.',
    taxableIncomeYtdLbl: 'Taxable Income (YTD)',
    currentTaxBracketLbl: 'Effective Tax Rate',
    lossReliefLbl: 'Market Dip Tax Relief',
    payYearEndTaxBtn: 'Pay Year-End Tax',
    payAdvanceTaxBtn: 'Pay Accrued Tax',
    noTaxDueText: 'All Income Tax obligations settled',
    taxHappinessTag: '+5 Happiness (Due) / +4 (Advance)',
    assetBreakdownTitle: 'Zakatable Wealth Calculation',
    zakatableAssetsSumLbl: 'Zakatable Assets (Cash & Investments)',
    deductibleDebtsLbl: 'Deductible Liabilities (Loans)',
    netZakatableLbl: 'Net Zakatable Wealth',
  },
  victory: {
    banner: 'RAT RACE COMPLETED!',
    title: 'FINANCIAL FREEDOM ACHIEVED!',
    bodyBeforeProf: 'Congratulations! Starting as a',
    bodyMid:
      ', your monthly passive income now exceeds your total monthly expenses. You have escaped the Rat Race in',
    bodyAfter: 'months.',
    totalPassive: 'Total Passive Income',
    monthlyExpenses: 'Monthly Expenses',
    monthsTaken: 'Months Taken',
    totalAssets: 'Total Assets',
    totalLiabilities: 'Total Liabilities',
    netWorth: 'Net Worth',
    propertiesCount: 'Properties',
    businessesCount: 'Businesses',
    stocksCount: 'Stock Positions',
    mainMenuBtn: 'Main Menu',
    continueBtn: 'Continue Playing',
  },
  gameOver: {
    title: 'GAME OVER',
    reason: 'Happiness dropped below 50%.',
    happinessLbl: 'Happiness',
    monthsSurvivedLbl: 'Months Survived',
    netWorthLbl: 'Net Worth',
    passiveIncomeLbl: 'Passive Income',
    startNewBtn: 'Start New Game',
    mainMenuBtn: 'Main Menu',
  },
  professionNames: {},
};

const BN: TranslationPack = {
  appName: 'ক্যাশফ্লো',
  logoText: 'ক্যাশফ্লো',
  pageTitle: 'ক্যাশফ্লো — অফলাইন আর্থিক সিমুলেশন গেম',
  tagline: 'প্যাসিভ আয় তৈরি করুন, ব্যালেন্স শিট সামলান এবং র‍্যাট রেস থেকে মুক্তি পান।',
  continueGame: 'খেলা চালিয়ে যান',
  startNewGame: 'নতুন খেলা',
  howToPlay: 'কীভাবে খেলতে হয়',
  settings: 'সেটিংস',
  about: 'ক্যাশফ্লো সম্পর্কে',
  chooseProfession: 'পেশা নির্বাচন করুন',
  playBtn: 'খেলা',
  nextMonth: 'পরবর্তী মাস',
  nextMonthShort: '+১ মাস',
  yearLabel: 'বছর',
  monthLabel: 'মাস',
  ratRaceGoal: 'আর্থিক স্বাধীনতার লক্ষ্য',
  investmentsLabel: 'বিনিয়োগ',
  cashOnHand: 'টাকা',
  happinessLabel: 'সুখ',
  freedomLabel: 'স্বাধীনতা',
  passiveIncome: 'প্যাসিভ আয়',
  totalExpenses: 'মাসিক খরচ',
  monthlyCashFlow: 'মাসিক ক্যাশ ফ্লো',
  netWorth: 'নিট সম্পদ',
  totalAssets: 'মোট সম্পদ',
  totalLiabilities: 'মোট দায়',
  common: {
    back: 'ফিরুন',
    close: 'বন্ধ',
    cancel: 'বাতিল',
    on: 'চালু',
    off: 'বন্ধ',
    menu: 'মেনু',
    more: 'আরও',
    loadingDb: 'ক্যাশফ্লো অফলাইন ডেটাবেজ লোড হচ্ছে...',
    offlineFooter: 'ক্যাশফ্লো · ১০০% অফলাইন আর্থিক সিমুলেশন',
    insufficientCash: 'পর্যাপ্ত নগদ নেই',
    perMonth: '/মাস',
    monthsShort: 'মাস',
    monthsLeft: 'মাস বাকি',
    sharesShort: 'শেয়ার',
    apr: 'বার্ষিক সুদ',
    apy: 'বার্ষিক মুনাফা',
    ownedCount: 'টি',
    activeCount: 'টি চালু',
    chartEmpty: 'এখনও কোনো চার্ট তথ্য নেই',
    langBanglaLabel: 'বাংলা',
    langEnglishLabel: 'ইংরেজি',
  },
  nav: {
    dashboard: 'ড্যাশবোর্ড',
    finances: 'আমার অর্থ',
    investments: 'বিনিয়োগ',
    properties: 'প্রপার্টি',
    businesses: 'ব্যবসা',
    loans: 'ঋণ ও দায়',
    takeLoan: 'ঋণ গ্রহণ',
    zakat: 'জাকাত',
    tax: 'আয়কর',
    events: 'সুযোগ',
    reports: 'রিপোর্ট',
  },
  mainMenu: {
    confirmNewTitle: 'নতুন ক্যারিয়ার শুরু করবেন?',
    confirmNewDesc:
      'নতুন খেলা শুরু করলে অফলাইন স্টোরেজে থাকা বর্তমান সেভ মুছে যাবে। ব্যাকআপ রাখতে চাইলে আগে সেটিংস থেকে ফাইল ডাউনলোড করে নিন।',
  },
  profSelect: {
    startingProfile: 'শুরুর আর্থিক প্রোফাইল',
    viewBreakdown: 'বিস্তারিত দেখুন',
    hideDetails: 'বিস্তারিত লুকান',
    monthlySalary: 'মাসিক বেতন',
    monthlyCashFlow: 'মাসিক ক্যাশ ফ্লো',
    initialCash: 'শুরুর থোক বরাদ্দ',
    totalLiabilities: 'মোট দায়',
    expensesAndDebts: 'মাসিক জীবনযাত্রার খরচ',
    livingExpenses: 'জীবনযাত্রার খরচ',
    loanInstallments: 'ঋণের কিস্তি',
    bankOtherLoans: 'ব্যাংক ও অন্যান্য ঋণ',
    creditCardDebt: 'ক্রেডিট কার্ডের ঋণ',
    startingNetWorth: 'শুরুর নিট সম্পদ',
    prevAria: 'আগের পেশা',
    nextAria: 'পরের পেশা',
  },
  howToPlayPage: {
    headerTitle: 'ক্যাশফ্লো খেলার নিয়ম',
    heroTitle: 'মূল লক্ষ্য: আর্থিক স্বাধীনতা',
    heroBodyPrefix:
      'বেশিরভাগ মানুষ শুধু মাসিক বেতনের ওপর নির্ভর করে খরচ ও ঋণ মেটাতে গিয়ে র‍্যাট রেসে আটকে থাকে। ক্যাশফ্লো-তে আপনার লক্ষ্য হলো এমন আয়-উৎপাদনকারী সম্পদ গড়া, যাতে আপনার মাসিক ',
    heroPassiveWord: 'প্যাসিভ আয়',
    heroBodyMid: ' স্থায়ীভাবে আপনার ',
    heroExpenseWord: 'মোট মাসিক খরচ',
    heroBodySuffix: 'কে ছাড়িয়ে যায়।',
    sections: [
      {
        title: '১. বেতন, খরচ ও মাসিক ক্যাশ ফ্লো',
        body: 'আপনার পেশা থেকে প্রতি মাসে পাওয়া বেতন হলো সক্রিয় আয়। প্রতি মাসে বাসস্থান, খাদ্য, বিদ্যুৎ-পানি, যাতায়াত, শিক্ষা, বিনোদন ও ঋণের কিস্তি পরিশোধ করতে হয়। মাসিক ক্যাশ ফ্লো = মোট মাসিক আয় - মোট মাসিক খরচ।',
        example: 'উদাহরণ: মাসে $4,600 আয় এবং $3,100 খরচ হলে আপনার মাসিক ক্যাশ ফ্লো +$1,500/মাস।',
      },
      {
        title: '২. সম্পদ বনাম দায়',
        body: 'সম্পদ আপনার পকেটে টাকা আনে বা বাজারমূল্য ধরে রাখে (নগদ, ব্যাংক সঞ্চয়, শেয়ার, ভাড়ার প্রপার্টি, ব্যবসা, বন্ড)। দায় আপনার পকেট থেকে টাকা বের করে নেয় (ব্যাংক ঋণ, ক্রেডিট কার্ড, মর্টগেজ, ব্যক্তিগত ঋণ)। নিট সম্পদ = মোট সম্পদ - মোট দায়।',
        example: 'পরামর্শ: উচ্চ সুদের (১৬–১৯%) ক্রেডিট কার্ড ঋণ দ্রুত শোধ করলে মাসিক খরচ কমে যায়।',
      },
      {
        title: '৩. প্যাসিভ আয় ও র‍্যাট রেস থেকে মুক্তি',
        body: 'সরাসরি সময় না দিয়েই যে আয় আসে তা হলো প্যাসিভ আয়: ভাড়া আয়, শেয়ার ডিভিডেন্ড, বন্ড ও সঞ্চয়ের সুদ, রয়্যালটি এবং স্বয়ংক্রিয় ব্যবসার আয়। মোট মাসিক প্যাসিভ আয় মোট মাসিক খরচের চেয়ে বেশি হলেই আপনি জিতবেন।',
        example: 'জয়ের শর্ত: প্যাসিভ আয় > মোট মাসিক খরচ (যেমন: $4,200 প্যাসিভ > $3,900 খরচ)।',
      },
      {
        title: '৪. শেয়ার বাজার, সোনা, বন্ড ও ক্রিপ্টো',
        body: 'চার্ট ও মাসিক লভ্যাংশসহ ৮টি কোম্পানির শেয়ার (সোনা রিজার্ভসহ) কেনাবেচা করুন। প্রতিটি শেয়ার ও সোনার মাসিক লভ্যাংশ এবং সব বন্ড ও সঞ্চয়ের মাসিক সুদ বাস্তবের মতোই সরাসরি আপনার মূল অ্যাকাউন্টে (টাকা) জমা হয়।',
        example: 'সরাসরি জমা: শেয়ার, সোনা, বন্ড ও সঞ্চয় থেকে প্রাপ্ত লভ্যাংশ ও সুদ প্রতি মাসে মূল নগদ ব্যালেন্সে যোগ হয়।',
      },
      {
        title: '৫. প্রপার্টি ও ব্যবসা বিনিয়োগ',
        body: 'নগদ টাকায় অথবা মর্টগেজ ঋণ নিয়ে আবাসিক, বাণিজ্যিক বা ভাড়ার প্রপার্টি কিনুন। ব্যবসা কিনে বা নতুন স্টার্টআপ শুরু করে ম্যানেজার বসিয়ে স্বয়ংক্রিয় করলে তার আয় প্যাসিভ আয়ে যোগ হবে।',
        example: 'হিসাবের নিয়ম: নিশ্চিত করুন মাসিক ভাড়া আয় মর্টগেজ কিস্তি ও রক্ষণাবেক্ষণ খরচের চেয়ে বেশি।',
      },
      {
        title: '৬. মাসিক টার্ন ও ঘটনা কার্ড',
        body: 'প্রস্তুত হলে পরবর্তী মাস বাটনে চাপ দিন। বেতন ও প্যাসিভ আয় যোগ হবে, খরচ ও ঋণের কিস্তি কাটা হবে, বাজারদর হালনাগাদ হবে এবং নতুন সুযোগ বা জরুরি ঘটনার কার্ড আসবে।',
        example: 'অফলাইন নিরাপত্তা: আপনার প্রতিটি লেনদেন স্বয়ংক্রিয়ভাবে ফোনের লোকাল স্টোরেজে সেভ হয়।',
      },
    ],
  },
  aboutPage: {
    headerTitle: 'ক্যাশফ্লো সম্পর্কে',
    title: 'ক্যাশফ্লো',
    subtitle: 'অফলাইন আর্থিক কৌশল ও জীবন সিমুলেশন',
    body: 'ক্যাশফ্লো একটি একক-খেলোয়াড় আর্থিক সিমুলেশন গেম যা বাস্তব হিসাববিজ্ঞানের নিয়মে তৈরি। প্রতিটি শেয়ার ক্রয়, মর্টগেজ কিস্তি, ব্যবসার স্বয়ংক্রিয়তা, বন্ডের মেয়াদপূর্তি এবং জরুরি খরচ একটি একক ইঞ্জিনের মাধ্যমে হিসাব হয়—যাতে আয় বিবরণী, ব্যালেন্স শিট এবং নিট সম্পদ সবসময় নির্ভুল থাকে।',
    localTitle: 'লোকাল অফলাইন সংরক্ষণ',
    localDesc:
      'সব অগ্রগতি, লেনদেনের খাতা, পোর্টফোলিও এবং সেটিংস আপনার ডিভাইসে লোকাল স্টোরেজে সেভ থাকে; ব্যাকআপ ফাইলও সংরক্ষণ করা যায়।',
    offlineTitle: 'কোনো ইন্টারনেটের প্রয়োজন নেই',
    offlineDesc:
      'ইন্টারনেট ছাড়াই যেকোনো সময় খেলুন—লোকাল বাজার সিমুলেশন ও অফলাইন ক্যাশিং সম্পূর্ণ প্রস্তুত।',
  },
  settingsPage: {
    headerTitle: 'সেটিংস ও ডেটা',
    prefsTitle: 'গেম পছন্দসমূহ',
    prefsSubtitle: 'ব্রাউজারের লোকাল সেটিংসে সংরক্ষিত থাকে।',
    soundTitle: 'শব্দ ও সাউন্ড ইফেক্ট',
    soundDesc: 'লেনদেন ও মাস পরিবর্তনে অফলাইন সাউন্ড',
    langTitle: 'অ্যাপের ভাষা',
    langDesc: 'এক ক্লিকে সম্পূর্ণ অ্যাপ ইংরেজি বা বাংলায় পরিবর্তন করুন',
    summaryModalTitle: 'মাসিক সারসংক্ষেপ পপআপ',
    summaryModalDesc: 'প্রতি মাস শেষে স্বয়ংক্রিয়ভাবে আয়-ব্যয়ের হিসাব দেখান',
    confirmNextTitle: 'পরবর্তী মাসের আগে নিশ্চিতকরণ',
    confirmNextDesc: 'মাস শেষ করার আগে নিশ্চিতকরণ বার্তা দেখান',
    ignoreEventsTitle: 'ঘটনা বিভাগ উপেক্ষা করুন',
    ignoreEventsDesc: 'মাসিক ঘটনা এড়িয়ে চলুন এবং সরাসরি পরবর্তী মাসে যান',
    saveTitle: 'অফলাইন সেভ ব্যবস্থাপনা',
    saveSubtitle: 'আপনার খেলার সম্পূর্ণ অগ্রগতি ব্যাকআপ ফাইল হিসেবে সংরক্ষণ বা পুনরুদ্ধার করুন।',
    exportBtn: 'ব্যাকআপ সংরক্ষণ',
    importBtn: 'ব্যাকআপ লোড করুন',
    resetBtn: 'সেভ মুছুন',
    exportOk: 'সেভ ব্যাকআপ ফাইল ডাউনলোড হয়েছে।',
    importOkPrefix: 'সেভ লোড হয়েছে:',
    importErrInvalid: 'সঠিক ক্যাশফ্লো সেভ ফাইল নয়।',
    importErrRead: 'নির্বাচিত ফাইল পড়া যায়নি।',
    resetOk: 'সংরক্ষিত খেলা মুছে ফেলা হয়েছে।',
    resetDialogTitle: 'সংরক্ষিত খেলা মুছে ফেলবেন?',
    resetDialogDesc:
      'এটি আপনার ডিভাইসের অফলাইন স্টোরেজ থেকে বর্তমান অগ্রগতি স্থায়ীভাবে মুছে ফেলবে। চাইলে আগে ব্যাকআপ সংরক্ষণ করে নিতে পারেন।',
    resetConfirmBtn: 'সেভ মুছে ফেলুন',
    offlineBatBtn: 'CASHFLOW-Offline.bat',
    offlineBatOk: 'CASHFLOW-Offline.bat ফাইলটি ডাউনলোড হয়েছে।',
    webIntoAppZipBtn: 'WebIntoApp জিপ (.zip)',
    webIntoAppZipOk: 'CASHFLOW-WebIntoApp.zip ডাউনলোড হয়েছে (রুটে index.html সহ WebIntoApp-এর জন্য প্রস্তুত)।',
    webIntoAppZipNote:
      'WebIntoApp মোবাইল অ্যাপ প্যাকেজ: জিপ ফাইলের মূল ডিরেক্টরিতে (কোনো আলাদা ফোল্ডার ছাড়াই) সম্পূর্ণ অফলাইন index.html, ফন্ট, স্টাইল ও ছবি সংযুক্ত থাকে—সরাসরি webintoapp.com-এ আপলোড করে মোবাইল অ্যাপ তৈরি করতে পারবেন।',
  },
  shell: {
    passiveExp: 'প্যাসিভ / খরচ',
    allSections: 'সব বিভাগ',
    confirmNextTitle: 'পরবর্তী মাসে যাবেন?',
    confirmNextDescPrefix: '',
    confirmNextDescSuffix:
      'শেষ করে মাসিক আয়, খরচ, ঋণের কিস্তি ও বাজার হালনাগাদ হিসাব করা হবে।',
    openMenuAria: 'মেনু খুলুন',
    closeMenuAria: 'মেনু বন্ধ করুন',
  },
  pwa: {
    installOffline: 'অফলাইন অ্যাপ ইনস্টল',
    installIos: 'ফোনে ইনস্টল করুন',
    iosTitle: 'ফোন বা ট্যাবলেটে ইনস্টল করুন',
    iosStep1Prefix: '১. ব্রাউজারের টুলবার থেকে ',
    iosShareWord: 'শেয়ার',
    iosStep1Suffix: ' বাটনে চাপ দিন।',
    iosStep2Prefix: '২. নিচে স্ক্রল করে ',
    iosAddWord: 'হোম স্ক্রিনে যোগ করুন',
    iosStep2Suffix: ' নির্বাচন করলে ইন্টারনেট ছাড়াই খেলতে পারবেন।',
    gotIt: 'বুঝেছি',
  },
  dashboard: {
    pendingSingular: 'টি সুযোগ কার্ড বাকি আছে',
    pendingPlural: 'টি সুযোগ কার্ড বাকি আছে',
    blockingPrefix: 'টি জরুরি বা জীবনের ঘটনা সমাধান না করে পরবর্তী মাসে যাওয়া যাবে না।',
    blockingSuffix: '',
    nonBlockingNotice: 'মাস শেষ করার আগে সুযোগ বিভাগ থেকে নতুন সুযোগগুলো দেখে নিন।',
    openEvents: 'সুযোগ দেখুন',
    freedomAchieved: 'আর্থিক স্বাধীনতা অর্জিত হয়েছে!',
    freedomAchievedDesc:
      'আপনার প্যাসিভ আয় এখন সব মাসিক খরচকে ছাড়িয়ে গেছে। চাইলে খেলা চালিয়ে যেতে পারেন বা অর্জন দেখতে পারেন।',
    freedomRemainingPrefix: 'র‍্যাট রেস থেকে মুক্তি পেতে শেয়ার, প্রপার্টি, ব্যবসা বা বন্ড থেকে মাসে আরও',
    freedomRemainingSuffix: 'প্যাসিভ আয় তৈরি করুন।',
    incomeTag: 'আয়',
    expensesTag: 'খরচ',
    financialOverview: 'আর্থিক সারসংক্ষেপ',
    incomeBalanceLink: 'আয় ও ব্যালেন্স শিট →',
    monthlySalaryMetric: 'মাসিক বেতন',
    totalMonthlyIncomeMetric: 'মোট মাসিক আয়',
    totalMonthlyExpensesMetric: 'মোট মাসিক খরচ',
    monthlyLoanPaymentsMetric: 'মাসিক ঋণের কিস্তি',
    chartTitle: 'প্যাসিভ আয় বনাম খরচ',
    chartSubtitle: 'মাসিক র‍্যাট রেস অতিক্রম চার্ট',
    reportsLink: 'রিপোর্ট →',
    quickTitle: 'দ্রুত বাজার ও টুলস',
    quickSubtitle: 'নগদ-প্রবাহী সম্পদ কিনুন অথবা ঋণ কমিয়ে মাসিক ক্যাশ ফ্লো বাড়ান।',
    stocksBondsTitle: 'শেয়ার ও বন্ড',
    realEstateTitle: 'প্রপার্টি',
    businessesTitle: 'ব্যবসা',
    loansDebtTitle: 'ঋণ ও দায়',
    buyHappinessTitle: 'সুখ কিনুন',
    insuranceTitle: 'বীমা',
    insuranceActive: 'সক্রিয়',
    characterBonusLbl: 'চরিত্র উপযোগী বোনাস',
    actionsLabel: 'কার্যক্রম',
    venturesTitle: 'বিশেষ সুযোগ',
    ventureCostLbl: 'খরচ',
    ventureProfitRangeLbl: 'সম্ভাব্য লাভ',
    ventureLossChanceLbl: 'সম্পূর্ণ ক্ষতির ঝুঁকি',
    ventureInvestBtn: 'বিনিয়োগ করুন',
    ventureTurnLimitErr: 'এই মাসের সব কার্যক্রম (৬/৬) শেষ — পরবর্তী মাসে যান।',
    happinessBoughtBadge: 'কেনা হয়েছে',
    inflationTag: 'মুদ্রাস্ফীতি',
    childrenLabel: 'সন্তান',
    maritalStatuses: {
      single: 'অবিবাহিত',
      married: 'বিবাহিত',
      divorced: 'তালাকপ্রাপ্ত',
    },
    marryBtn: 'নতুন বিয়ে করুন',
    personalAssetsTitle: 'বিলাসিতা',
    buyBtn: 'কিনুন',
    ownedBadge: 'মালিকানাধীন',
    insureBtn: 'বীমা করুন',
    insuredBtn: 'বীমাকৃত',
    insuranceRequiredBadge: 'বীমা বাধ্যতামূলক',
    yearlyPenaltyUnit: 'সুখ/বছর',
    lotteryTitle: 'লটারী',
    lotteryCostLbl: 'টিকিট মূল্য',
    lotteryTopPrizeLbl: 'সর্বোচ্চ জ্যাকপট',
    lotteryBuyBtn: 'টিকিট কিনুন',
    lotteryPlayedBadge: 'খেলা হয়েছে',
    lotteryRandomTag: 'সম্পূর্ণ র‍্যান্ডম',
    insuranceSubtitle: 'আপনার কোনো দুর্ঘটনা ঘটলে, বীমা আপনার সমস্ত খরচ বহন করবে।',
    happinessSubtitle: 'আপনার সুখ বাড়ান এবং জীবনের আনন্দ উপভোগ করুন।',
    personalAssetsSubtitle: 'ইচ্ছা পূরণ করুন।',
    venturesSubtitle: 'পেশা অনুযায়ী স্বল্পমেয়াদী সুযোগ।',
    lotterySubtitle: 'ভাগ্য পরীক্ষা করুন।',
    turnCardTitle: 'মাস শেষ হওয়ার আগে',
    turnCardDesc:
      'উপলব্ধ সুযোগগুলো যাচাই করুন, অতিরিক্ত অর্থ বিনিয়োগ করুন এবং বীমা ও শিক্ষার বিষয়টি বিবেচনা করুন।',
    turnCardBtn: 'মাস শেষ করুন',
    monthlyExpenseTitle: 'মাসিক খরচ',
    monthlyExpenseDesc:
      'এর মধ্যে খাদ্য, বাসস্থান, পরিবহন এবং অন্যান্য জীবনযাত্রার খরচ অন্তর্ভুক্ত। আপনার পালা শেষ করার আগে অবশ্যই এটি পরিশোধ করতে হবে।',
    payExpenseBtn: 'খরচ পরিশোধ করুন',
    marryCardTitle: 'নতুন বিয়ে করুন',
    marryCardDesc:
      'নতুন বিয়ে করুন। জীবনসঙ্গীর সাথে নতুন অধ্যায় শুরু করুন এবং পরিবারের সাথে সুখ ভাগ করে নিন।',
    ignoreHappinessAria: 'ইগনোর করুন',
    buyHappinessAria: 'কিনুন',
    zakatTaxReminderTitle: 'বছর শেষের জাকাত ও আয়কর বকেয়া রয়েছে',
    zakatTaxReminderDesc:
      'ইসলামী বিধান অনুযায়ী জাকাত বা নির্ধারিত আয়কর পরিশোধ করলে মনে শান্তি ও অতিরিক্ত সুখ যোগ হবে।',
    openZakatTaxBtn: 'জাকাত ও আয়কর দিন',
    educationTitle: 'শিক্ষা',
    educationSubtitle:
      'আপনার শ্রমের মূল্য নির্ভর করে পেশার চাহিদা, অভিজ্ঞতা, জ্ঞান এবং দক্ষতার উপর।',
    educationSalaryPrefix: 'বেতনে',
    educationCompleted: 'সম্পন্ন',
    educationYearDone: 'এই বছরে ১টি সম্পন্ন',
  },
  finances: {
    title: 'আমার আর্থিক বিবরণী',
    subtitle: 'আপনার সক্রিয় খাতা থেকে তাৎক্ষণিক আয় বিবরণী ও ব্যালেন্স শিট।',
    incomeStatementTab: 'আয় বিবরণী',
    balanceSheetTab: 'ব্যালেন্স শিট',
    incomeStatementTitle: 'আয় বিবরণী',
    incomeFormula: 'মাসিক ক্যাশ ফ্লো = মোট মাসিক আয় − মোট মাসিক খরচ',
    incomeHeader: 'আয়',
    salary: 'বেতন',
    businessIncome: 'ব্যবসায়িক আয়',
    rentalIncome: 'ভাড়া আয়',
    dividendIncome: 'ডিভিডেন্ড আয়',
    interestIncome: 'সুদ আয়',
    otherPassiveIncome: 'অন্যান্য প্যাসিভ আয়',
    stocksNote: 'টি শেয়ার পজিশন',
    fixedNote: 'টি বন্ড ও সঞ্চয়',
    propertiesNote: 'টি প্রপার্টি',
    royaltiesNote: 'রয়্যালটি ও লাইসেন্স',
    totalIncome: 'মোট আয়',
    passiveSubtotal: 'প্যাসিভ আয় উপ-মোট',
    expensesHeader: 'খরচ',
    housing: 'বাসস্থান',
    food: 'খাদ্য',
    transportation: 'যাতায়াত',
    utilities: 'বিদ্যুৎ, গ্যাস ও পানি',
    education: 'শিক্ষা',
    entertainment: 'বিনোদন',
    loanPayments: 'ঋণের কিস্তি',
    businessExpenses: 'ব্যবসার খরচ',
    propertyExpenses: 'প্রপার্টি রক্ষণাবেক্ষণ',
    otherExpenses: 'অন্যান্য খরচ',
    totalExpenses: 'মোট খরচ',
    netCashNote: 'প্রতি মাসে হাতে থাকা নিট নগদ বৃদ্ধি',
    balanceSheetTitle: 'ব্যালেন্স শিট',
    balanceFormula: 'নিট সম্পদ = মোট সম্পদ − মোট দায়',
    assetsHeader: 'সম্পদ',
    cash: 'নগদ টাকা',
    bankSavings: 'ব্যাংক সঞ্চয়',
    stocks: 'শেয়ার',
    realEstate: 'প্রপার্টি ও জমি',
    businesses: 'ব্যবসা প্রতিষ্ঠান',
    bonds: 'বন্ড',
    otherInvestments: 'অন্যান্য বিনিয়োগ (ক্রিপ্টো)',
    personalAssets: 'ব্যক্তিগত সম্পদ (বাড়ি, গাড়ি, ইয়ট)',
    liabilitiesHeader: 'দায় ও ঋণ',
    bankLoans: 'ব্যাংক ঋণ',
    creditCardDebt: 'ক্রেডিট কার্ডের ঋণ',
    propertyLoans: 'প্রপার্টি ঋণ (মর্টগেজ)',
    businessLoans: 'ব্যবসায়িক ঋণ',
    personalLoans: 'ব্যক্তিগত ও অন্যান্য ঋণ',
    equityNote: 'মোট ইক্যুইটি অবস্থান',
    zakatTaxCardTitle: 'ইসলামী জাকাত ও আয়কর',
    zakatTaxCardDesc: 'প্রতি মাসে অটো পারসেন্ট জমা হয়; সম্পদ কমলে জাকাত ও করও কমে যায়।',
    zakatTaxOpenBtn: 'জাকাত ও আয়কর দেখুন',
  },
  market: {
    title: 'বিনিয়োগ বাজার',
    subtitle: 'শেয়ার, প্রপার্টি, ব্যবসা, বন্ড ও ক্রিপ্টোতে মূলধন বিনিয়োগ করুন।',
    availableCash: 'ব্যবহারযোগ্য নগদ',
    tabs: {
      stocks: 'শেয়ার বাজার',
      real_estate: 'প্রপার্টি',
      businesses: 'ব্যবসা',
      bonds_savings: 'বন্ড ও সঞ্চয়',
      crypto: 'ক্রিপ্টোকারেন্সি',
    },
    listedCompanies: 'তালিকাভুক্ত কোম্পানি',
    holdingsLabel: 'ধারণকৃত মূল্য:',
    divShort: 'লভ্যাংশ',
    ownedPrefix: 'মালিকানা:',
    thisMonth: 'এই মাসে',
    shares: 'শেয়ার সংখ্যা',
    avgCost: 'গড় ক্রয়মূল্য',
    unrealizedPnl: 'অবাস্তবায়িত লাভ-ক্ষতি',
    shareQty: 'শেয়ার পরিমাণ',
    dividend: 'মাসিক লভ্যাংশ:',
    monthlyDividendLabel: 'মাসিক লভ্যাংশ',
    directToCashTag: 'প্রতি মাসে মূল অ্যাকাউন্টে জমা',
    orderTotal: 'মোট মূল্য',
    buyShares: 'শেয়ার কিনুন',
    sellShares: 'শেয়ার বিক্রি করুন',
    realEstateHubTitle: 'প্রপার্টি বাজার ও পোর্টফোলিও',
    realEstateHubDesc: 'টি প্রপার্টি এই মাসে বিক্রয়যোগ্য · আপনার মালিকানায় আছে',
    openPropertiesBtn: 'প্রপার্টি বিভাগে যান',
    businessHubTitle: 'ব্যবসা ক্রয় ও স্টার্টআপ',
    businessHubDesc: 'টি সুযোগ চালু আছে · আপনি পরিচালনা করছেন',
    openBusinessBtn: 'ব্যবসা বিভাগে যান',
    liquidSavings: 'তরল সঞ্চয়',
    monthBondSuffix: '-মাসের বন্ড',
    minLabel: 'সর্বনিম্ন:',
    monthlyPayout: 'মাসিক পরিশোধ',
    atMaturity: 'মেয়াদ শেষে',
    depositBtn: 'জমা করুন',
    yourFixedTitle: 'আপনার সঞ্চয় ও বন্ড',
    projectedMonthlyInt: 'সম্ভাব্য মাসিক সুদ:',
    noFixedEmpty: 'এখনও কোনো সঞ্চয় বা বন্ড জমা নেই।',
    liquidTag: 'যেকোনো সময় তোলা যায়',
    withdrawBtn: 'টাকা তুলুন',
    redeemEarlyBtn: 'আগে ভাঙান',
    cryptoWarningTitle: 'উচ্চ-ঝুঁকিপূর্ণ সিমুলেটেড বিনিয়োগ',
    cryptoWarningDesc:
      'ডিজিটাল মুদ্রার দাম প্রতি মাসে হঠাৎ ±২৫–৪০% ওঠানামা করে এবং এখান থেকে কোনো মাসিক প্যাসিভ আয় আসে না।',
    volatilityLabel: 'অস্থিরতা',
    highVolSim: 'উচ্চ-অস্থির সিমুলেশন',
    tradeValue: 'লেনদেন মূল্য',
    buyBtnPrefix: 'কিনুন',
    sellBtnPrefix: 'বিক্রি',
    characterFitBadge: '★ চরিত্র উপযোগী',
    filterAll: 'সবগুলো',
    filterCharacterFit: '★ চরিত্র উপযোগী',
    bonusDividend: '+২০% লভ্যাংশ',
    bonusApy: '+১.০% সুদ',
    bonusRent: '+১২% ভাড়া',
    bonusRevenue: '+১৫% আয়',
    investedLabel: 'বিনিয়োগ করা হয়েছে:',
    debtLabel: 'মোট ঋণ:',
    stocksCardTitle: 'শেয়ার',
    bondsCardTitle: 'সরকারি বন্ড',
    cryptoCardTitle: 'ক্রিপ্টো',
    realEstateCardTitle: 'রিয়েল এস্টেট',
    goldCardTitle: 'সোনা',
    businessesCardTitle: 'ব্যবসা',
    loansCardTitle: 'ঋণ ও দায়',
    backToInvestments: 'বিনিয়োগে ফিরুন',
    currentPriceLabel: 'বর্তমান মূল্য:',
    annualYieldLabel: 'বার্ষিক সুদ:',
    period1Yr: '১ বছর',
    period5Yr: '৫ বছর',
    period10Yr: '১০ বছর',
    quantityLabel: 'পরিমাণ',
    investBtn: 'বিনিয়োগ করুন',
    withdrawToBalanceBtn: 'ব্যালেন্সে ফেরত নিন',
    withdrawModeLabel: 'বিনিয়োগ থেকে ব্যালেন্সে ফেরত আনুন',
    backToInvestBtn: 'বিনিয়োগ মোড',
    noHoldingSelected: 'এই সম্পদে কোনো বিনিয়োগ নেই',
    withdrawAllAria: 'বিনিয়োগ থেকে পরিমাণমতো টাকা ব্যালেন্সে ফেরত আনতে স্লাইডার চালু করুন',
    infoHelpAria: 'বিনিয়োগ তথ্য',
    positionsSuffix: 'টি পজিশন',
    helpStocks: 'স্লাইডার ডানদিকে টেনে মূল ব্যালেন্স থেকে টাকা বেছে নিয়ে বিনিয়োগ করুন। প্রতি মাসে লভ্যাংশ মূল ব্যালেন্সে জমা হয়। পরিমাণমতো টাকা ব্যালেন্সে ফেরত আনতে হলুদ ডলার আইকনে ক্লিক করে স্লাইডার ব্যবহার করুন।',
    helpBonds: 'স্লাইডার ডানদিকে টেনে সরকারি বন্ড ও সঞ্চয়ে জমা করুন। প্রতি মাসে নির্ধারিত সুদ মূল ব্যালেন্সে জমা হয়। হলুদ ডলার আইকনে ক্লিক করে একই স্লাইডার টেনে প্রয়োজনমতো টাকা ফেরত আনতে পারবেন।',
    helpCrypto: 'উচ্চ-অস্থির ক্রিপ্টো সম্পদ (কোনো মাসিক লভ্যাংশ নেই)। স্লাইডার ডানদিকে টেনে বিনিয়োগ করুন অথবা হলুদ ডলার আইকনে ক্লিক করে স্লাইডার দিয়ে পরিমাণমতো টাকা ব্যালেন্সে ফেরত আনুন।',
    helpGold: 'নিরাপদ সোনা রিজার্ভ—বাজার ধসের সময় দাম বাড়ে এবং প্রতি মাসে লভ্যাংশ দেয়। স্লাইডার ডানদিকে টেনে বিনিয়োগ করুন অথবা ডলার আইকনে ক্লিক করে স্লাইডার দিয়ে প্রয়োজনমতো টাকা তুলুন।',
    helpRealEstate: 'মাসিক প্যাসিভ ভাড়া আয় পেতে বিভিন্ন শ্রেণীর রিয়েল এস্টেটে বিনিয়োগ করুন। পর্যাপ্ত নগদ থাকলে পছন্দের কার্ডে বিনিয়োগ করুন বা নিচে মালিকানাধীন প্রপার্টি বিক্রি করুন।',
    rentalYieldHeader: 'ভাড়া থেকে আয়',
    reTierEconomy: 'ইকোনমি ক্লাস',
    reTierStandard: 'স্ট্যান্ডার্ড ক্লাস',
    reTierPremium: 'প্রিমিয়াম ক্লাস',
    reTierLuxury: 'বিলাসবহুল শ্রেণী',
    reYieldEconomy: '৬-৮%',
    reYieldStandard: '৫-৭%',
    reYieldPremium: '৪-৬%',
    reYieldLuxury: '২-৪%',
  },
  properties: {
    title: 'প্রপার্টি বাজার ও মালিকানা',
    subtitle: 'প্রতি মাসে প্যাসিভ ভাড়া আয় গড়তে আবাসিক, ভাড়া ও বাণিজ্যিক প্রপার্টি কিনুন।',
    cashAvailable: 'ব্যবহারযোগ্য নগদ',
    borrowingLimit: 'ঋণ নেওয়ার সীমা',
    ownedTitle: 'মালিকানাধীন প্রপার্টি',
    rentalIncomeLbl: 'ভাড়া আয়:',
    maintenanceLbl: 'রক্ষণাবেক্ষণ:',
    totalValue: 'মোট প্রপার্টি মূল্য',
    emptyOwned: 'এখনও কোনো প্রপার্টি নেই',
    netSuffix: '/মাস নিট',
    value: 'বাজারমূল্য',
    equity: 'নিট ইক্যুইটি',
    rent: 'ভাড়া',
    maintLoan: 'খরচ + কিস্তি',
    mortgageBal: 'মর্টগেজ বাকি:',
    debtFree: 'সম্পূর্ণ ঋণমুক্ত',
    sellBtn: 'বিক্রি করুন',
    availableTitle: 'এই মাসের প্রপার্টি তালিকা',
    filterAll: 'সবগুলো',
    types: {
      rental: 'ভাড়া',
      residential: 'আবাসিক',
      commercial: 'বাণিজ্যিক',
    },
    price: 'মোট মূল্য',
    downPayment: 'ডাউন পেমেন্ট',
    mortgagePmt: 'মর্টগেজ কিস্তি',
    rentalIncome: 'মাসিক ভাড়া আয়',
    maintenance: 'রক্ষণাবেক্ষণ',
    netWithLoan: 'ঋণসহ নিট:',
    netAllCash: 'নগদ ক্রয়ে নিট:',
    financeBtn: 'কিস্তিতে কিনুন',
    allCashBtn: 'সম্পূর্ণ নগদে',
    sellDialogTitle: 'প্রপার্টি বিক্রি করবেন?',
    sellDialogDesc:
      'বর্তমান বাজারমূল্যে বিক্রি করলে যুক্ত মর্টগেজ ঋণ স্বয়ংক্রিয়ভাবে পরিশোধ হয়ে বাকি অর্থ নগদে জমা হবে।',
    sellConfirmBtn: 'বিক্রি নিশ্চিত করুন',
  },
  businesses: {
    title: 'ব্যবসা বাজার ও পরিচালনা',
    subtitleBefore: 'বিদ্যমান ব্যবসা কিনুন বা নতুন স্টার্টআপ শুরু করুন। কেবল ',
    subtitleHighlight: 'স্বয়ংক্রিয়',
    subtitleAfter: ' ব্যবসার আয় প্যাসিভ আয়ে গণনা হয়।',
    cashAvailable: 'ব্যবহারযোগ্য নগদ',
    launchVenture: 'নতুন ব্যবসা শুরু',
    startVentureTitle: 'নতুন ব্যবসায়িক উদ্যোগ শুরু করুন',
    businessModel: 'ব্যবসার ধরন',
    companyName: 'প্রতিষ্ঠানের নাম',
    companyPlaceholder: 'যেমন: গ্রিনভ্যালি ক্যাফে',
    launchBtn: 'শুরু করুন',
    ownedTitle: 'মালিকানাধীন ব্যবসা',
    automatedRevLbl: 'স্বয়ংক্রিয় আয় (প্যাসিভ):',
    operatingExpLbl: 'পরিচালনা ব্যয়:',
    portfolioValuation: 'ব্যবসার মোট মূল্য',
    emptyOwned: 'এখনও কোনো ব্যবসা নেই',
    automatedPassive: 'স্বয়ংক্রিয় (প্যাসিভ)',
    ownerOperatedActive: 'স্ব-পরিচালিত (সক্রিয়)',
    profitSuffix: '/মাস মুনাফা',
    valuation: 'বর্তমান মূল্য',
    revenue: 'মাসিক আয়',
    expenses: 'ব্যয়',
    automateBtn: 'স্বয়ংক্রিয় করুন',
    contributingPassive: 'প্যাসিভ আয়ে যুক্ত হচ্ছে',
    sellBtn: 'বিক্রি করুন',
    marketTitle: 'এই মাসের ব্যবসায়িক সুযোগসমূহ',
    filterAll: 'সবগুলো',
    filterExisting: 'চলমান ব্যবসা',
    filterStartup: 'স্টার্টআপ',
    newStartup: 'নতুন স্টার্টআপ',
    existingTag: 'চলমান',
    automatedTag: 'স্বয়ংক্রিয়',
    ownerOperatedTag: 'স্ব-পরিচালিত',
    capital: 'প্রাথমিক মূলধন',
    price: 'বিক্রয় মূল্য',
    operatingExp: 'পরিচালনা ব্যয়',
    netProfit: 'নিট মুনাফা',
    startBizBtn: 'ব্যবসা শুরু করুন',
    acquireBizBtn: 'ব্যবসা কিনুন',
    sellDialogTitle: 'ব্যবসা বিক্রি করবেন?',
    sellDialogDesc:
      'আপনি ব্যবসার বর্তমান বাজারমূল্য নগদে পাবেন এবং এর মাসিক আয় ও ব্যয় তালিকা থেকে বাদ যাবে।',
    sellConfirmBtn: 'ব্যবসা বিক্রি করুন',
  },
  loans: {
    title: 'ঋণ ও ক্রেডিট ব্যবস্থাপনা',
    subtitle: 'আপনার ঋণ নেওয়ার যোগ্যতা দেখুন, বেশি সুদের ঋণ আগে শোধ করুন বা নতুন ঋণ নিন।',
    totalDebt: 'মোট ঋণ',
    activeFacilities: 'টি সক্রিয় ঋণ',
    monthlyPayments: 'মাসিক কিস্তি',
    principalInterest: 'আসল + সুদ',
    creditEligibility: 'মোট ঋণ যোগ্যতা',
    incomeAssetBacked: 'আয় ও সম্পদ ভিত্তিক',
    borrowingCapacity: 'অবশিষ্ট ঋণ সীমা',
    remainingLimit: 'এখনো নেওয়া যাবে',
    activeLoansTitle: 'সক্রিয় ঋণ ও ক্রেডিট ব্যালেন্স',
    debtFreeTitle: 'সম্পূর্ণ ঋণমুক্ত ব্যালেন্স শিট',
    debtFreeDesc: 'আপনার বর্তমানে কোনো বকেয়া ঋণ বা ক্রেডিট কার্ডের দায় নেই।',
    moLeftSuffix: 'মাস বাকি',
    repayCustom: 'আংশিক পরিশোধ',
    payOffFull: 'সম্পূর্ণ পরিশোধ',
    applyLoanTitle: 'নতুন ঋণের আবেদন করুন',
    loanProduct: 'ঋণের ধরন',
    principalAmount: 'ঋণের পরিমাণ',
    maxPrefix: 'সর্বোচ্চ',
    repaymentPeriod: 'পরিশোধের মেয়াদ',
    interestRate: 'সুদের হার',
    monthlyInstallment: 'মাসিক কিস্তি',
    totalInterest: 'মোট সম্ভাব্য সুদ',
    approveBtn: 'অনুমোদন ও গ্রহণ',
    categories: {
      bank: 'ব্যাংক',
      credit_card: 'ক্রেডিট কার্ড',
      property: 'মর্টগেজ',
      business: 'ব্যবসা',
      personal: 'ব্যক্তিগত',
      other: 'অন্যান্য',
    },
    products: {
      personal_flex: 'ব্যক্তিগত মেয়াদী ঋণ',
      business_exp: 'ব্যবসা সম্প্রসারণ ঋণ',
      bank_consolidate: 'ব্যাংক একীভূতকরণ ঋণ',
    },
  },
  events: {
    title: 'সুযোগ',
    subtitle: 'প্রতিটি সুযোগ, জরুরি খরচ ও জীবনের ঘটনায় আপনার সিদ্ধান্ত প্রয়োজন।',
    cashPrefix: 'নগদ:',
    activeDecisions: 'অপেক্ষমান সুযোগ',
    allResolvedTitle: 'এই মাসের সব সুযোগ সমাধান হয়েছে',
    allResolvedDesc: '',
    categories: {
      opportunity: 'বার্ষিক সুযোগ',
      expense_emergency: 'জরুরি খরচ',
      life_event: 'জীবনের ঘটনা',
    },
    pastHistoryTitle: 'পূর্ববর্তী সুযোগের ইতিহাস',
    emptyHistory: 'কোনো পূর্ববর্তী সুযোগ নেই',
    ignoreToggleLabel: 'সুযোগ উপেক্ষা',
    ignoreOnBadge: 'উপেক্ষিত',
    ignoreOffBadge: 'চালু আছে',
    ignoreModeTitle: 'সুযোগ বিভাগ উপেক্ষা করা আছে',
    ignoreModeDesc: 'নতুন কোনো সুযোগ কার্ড আসবে না এবং পরবর্তী মাসে যেতে কোনো বাধা থাকবে না।',
    enableEventsBtn: 'সুযোগ আবার চালু করুন',
    ignoreAllBtn: 'সব এড়িয়ে যান',
    ignoreSingleBtn: 'এড়িয়ে যান',
  },
  reports: {
    title: 'আর্থিক রিপোর্ট ও লেনদেনের খাতা',
    subtitle: 'আয়, খরচ, সম্পদ বৃদ্ধি, দায় ও বিনিয়োগের লাভ-ক্ষতির পূর্ণাঙ্গ ইতিহাস।',
    lastMonthSummaryTitle: 'শেষ মাসের সারসংক্ষেপ',
    viewSummaryBtn: 'সারসংক্ষেপ দেখুন',
    totalInvPnl: 'মোট বিনিয়োগ লাভ-ক্ষতি',
    realizedPrefix: 'বাস্তবায়িত',
    unrealizedGain: 'অবাস্তবায়িত লাভ-ক্ষতি',
    markToMarket: 'বর্তমান বাজারমূল্য অনুযায়ী',
    monthsSimulated: 'অতিবাহিত মাস',
    ledgerEntries: 'খাতার এন্ট্রি',
    verifiedIds: 'যাচাইকৃত স্বতন্ত্র হিসাব',
    chartsTitle: 'আর্থিক অগ্রগতির চার্ট',
    chartTabs: {
      income_expense: 'আয় ও প্যাসিভ আয়',
      net_worth: 'সম্পদ ও নিট মূল্য',
      cash_flow: 'ক্যাশ ফ্লো',
      pnl: 'বিনিয়োগ লাভ-ক্ষতি',
    },
    seriesTotalIncome: 'মোট আয়',
    seriesCumulativePnl: 'ক্রমপুঞ্জীভূত লাভ-ক্ষতি',
    txHistoryTitle: 'লেনদেনের ইতিহাস',
    searchPlaceholder: 'খাতায় খুঁজুন...',
    allCategories: 'সব ধরন',
    dateCol: 'তারিখ',
    categoryCol: 'ধরন',
    descCol: 'বিবরণ',
    amountCol: 'পরিমাণ',
    balanceCol: 'নগদ ব্যালেন্স',
    noMatchingTx: 'মিলে যায় এমন কোনো লেনদেন পাওয়া যায়নি।',
    txCategories: {
      Salary: 'বেতন',
      'Passive Income': 'প্যাসিভ আয়',
      Business: 'ব্যবসা',
      'Living Expenses': 'জীবনযাত্রার খরচ',
      'Loan Payment': 'ঋণের কিস্তি',
      'Property Expense': 'প্রপার্টি খরচ',
      'Stock Trade': 'শেয়ার লেনদেন',
      'Real Estate': 'প্রপার্টি',
      'Business Trade': 'ব্যবসা লেনদেন',
      'Bonds & Savings': 'বন্ড ও সঞ্চয়',
      Crypto: 'ক্রিপ্টো',
      Loan: 'ঋণ',
      Event: 'ঘটনা',
      Lifestyle: 'সুখ ও বীমা',
      'Zakat & Tax': 'জাকাত ও আয়কর',
    },
  },
  turnSummary: {
    title: 'মাসিক লেনদেনের সারসংক্ষেপ',
    salaryReceived: 'প্রাপ্ত বেতন',
    passiveReceived: 'প্রাপ্ত প্যাসিভ আয়',
    directToCashNote: 'সরাসরি মূল অ্যাকাউন্টে জমা হয়েছে',
    stockDividends: 'শেয়ার বাজারের লভ্যাংশ',
    goldDividends: 'সোনা বিনিয়োগের লভ্যাংশ',
    bondInterest: 'বন্ডের মাসিক সুদ',
    savingsInterest: 'সঞ্চয় হিসাবের মাসিক সুদ',
    rentalIncome: 'প্রপার্টি ভাড়া আয়',
    autoBizIncome: 'স্বয়ংক্রিয় ব্যবসার আয়',
    otherPassive: 'রয়্যালটি ও অন্যান্য প্যাসিভ',
    activeBizRev: 'সক্রিয় ব্যবসার আয়',
    maturedBond: 'মেয়াদোত্তীর্ণ বন্ড পরিশোধ',
    livingPaid: 'পরিশোধিত জীবনযাত্রার খরচ',
    loanPaid: 'পরিশোধিত ঋণের কিস্তি',
    bizExpPaid: 'ব্যবসা পরিচালনা ব্যয়',
    propMaintPaid: 'প্রপার্টি রক্ষণাবেক্ষণ ব্যয়',
    netCashChange: 'নিট নগদ পরিবর্তন',
    viewEventsSingular: '১টি নতুন সুযোগ দেখুন',
    viewEventsPlural: 'টি নতুন সুযোগ দেখুন',
    continueBtn: 'চালিয়ে যান',
    blackSwanBadge: 'কালো রাজহাঁস',
    blackSwanTitle: 'হঠাৎ বাজারে ধস নেমেছে',
    blackSwanMarketDrop: 'বাজার পতন',
    blackSwanGoldSurge: 'সোনার দাম বৃদ্ধি',
    blackSwanGoldProfit: 'সোনা থেকে আপনার লাভ',
    blackSwanNoGold: 'যারা সোনা কিনেছিলেন তারাই লাভে ছিলেন',
    annualInflationAlert: 'বার্ষিক মুদ্রাস্ফীতি',
    babyBornAlert: 'সন্তানের জন্ম হয়েছে (+১৪ সুখ)',
    divorceAlert: 'বিবাহ বিচ্ছেদ ঘটেছে (-১৪ সুখ)',
    yearlyMissingAssetsAlert: 'নিজস্ব বাড়ি/গাড়ি/ইয়ট না থাকায় বার্ষিক সুখ কর্তন',
    uninsuredAccidentAlert: 'বীমাহীন সম্পদে দুর্ঘটনা',
    completedBadge: 'সমাপ্ত',
    nextPeriodPrefix: 'পরবর্তী:',
    achievedSectionTitle: 'কী অর্জন করলাম',
    didSectionTitle: 'সমাপ্ত মাসে কী করলাম',
    receivedPaidSectionTitle: 'মাস শেষে কী পেলাম ও খরচ হলো',
    netWorthMetric: 'নিট সম্পদ',
    passiveMetric: 'মাসিক প্যাসিভ আয়',
    freedomMetric: 'আর্থিক স্বাধীনতা',
    happinessMetric: 'সুখ',
    noActionsMsg: 'এই মাসে কোনো আলাদা কেনাবেচা বা লেনদেন করা হয়নি।',
    insurancePaid: 'পরিশোধিত বীমা প্রিমিয়াম',
    babyBirthCostPaid: 'নবজাতক আগমন ও যত্ন খরচ',
    divorceSettlementLabel: 'বিবাহ বিচ্ছেদ মীমাংসা খরচ',
    accidentCashLossLabel: 'বীমাহীন দুর্ঘটনা ক্ষতি',
    emergencyCreditLabel: 'জরুরি ক্রেডিট লাইন গ্রহণ',
    actionsTag: 'টি কার্যক্রম',
    yearEndTaxZakatTitle: 'বছর শেষের জাকাত ও আয়কর নির্ধারিত হয়েছে',
    yearEndZakatAssessed: 'নির্ধারিত ইসলামী জাকাত (২.৫%)',
    yearEndTaxAssessed: 'নির্ধারিত বার্ষিক আয়কর',
    payZakatTaxBtn: 'জাকাত ও আয়কর পরিশোধ করুন',
  },
  taxPage: {
    title: 'জাকাত ও আয়কর ব্যবস্থা',
    subtitle:
      'প্রতি মাসে অটো পারসেন্ট হিসেবে জমা হতে থাকে, সম্পদ কমে গেলে এগুলোও কমে যায় এবং পরিশোধ করলে ভালো সুখ যোগ হয়।',
    zakatTitle: 'ইসলামী জাকাত',
    zakatSubtitle:
      'নিসাব সীমার উপরের নিট সম্পদে বছরে ২.৫% ফরজ জাকাত, প্রতি মাসে স্বয়ংক্রিয়ভাবে জমা হয় এবং পরিশোধে সুখ যোগ হয়।',
    zakatPaidTotalLbl: 'মোট পরিশোধিত জাকাত',
    incomeTaxTitle: 'আয়কর',
    incomeTaxSubtitle:
      'বার্ষিক আয় ও মুনাফার ওপর প্রগতিশীল হারে আয়কর, বাজারে ক্ষতি বা নিট সম্পদ কমলে স্বয়ংক্রিয়ভাবে কমে যায়।',
    taxPaidTotalLbl: 'মোট পরিশোধিত আয়কর',
    zakatableWealthLbl: 'জাকাতযোগ্য নিট সম্পদ',
    nisabLbl: 'নিসাব সীমা',
    zakatAccrualLbl: 'জাকাত অটো জমা',
    taxAccrualLbl: 'জমাকৃত আয়কর',
    lifetimePaidLbl: 'মোট পরিশোধিত জাকাত ও কর',
    zakatSectionTitle: 'ইসলামী জাকাত (বছরে ২.৫%)',
    zakatRateBadge: '২.৫% বার্ষিক বিধান',
    eligibleBadge: 'নিসাব পূর্ণ · জাকাত ফরজ',
    belowNisabBadge: 'নিসাবের নিচে · $0 জাকাত',
    zakatRuleDesc:
      'জাকাতযোগ্য নিট সম্পদ (নগদ + ব্যাংক সঞ্চয় + বন্ড + শেয়ার/সোনা + ক্রিপ্টো + প্রপার্টি + ব্যবসা − মোট ঋণ) ন্যূনতম নিসাব ($7,500) পরিমাণ অর্জিত হলে বছর শেষে ২.৫% হারে জাকাত দিতে হবে। বসবাসের ব্যক্তিগত বাড়ি, গাড়ি ও ইয়ট জাকাতমুক্ত।',
    accrualProgressLbl: 'বার্ষিক জাকাত অটো পারসেন্ট জমা',
    monthsCompletedSuffix: 'মাস নিসাবের উপরে',
    projectedAnnualLbl: 'বর্তমান সম্পদে বার্ষিক ২.৫% জাকাত',
    exemptAssetsNote: 'জাকাতমুক্ত ব্যক্তিগত সম্পদ',
    wealthDropNote:
      'সম্পদ কমে গেলে জাকাত ও বকেয়া আপনাআপনি কমে যায়, এবং নিসাবের নিচে নামলে $0 হয়ে যায়।',
    yearEndDueLbl: 'বছর শেষের বকেয়া জাকাত',
    currentAccruedLbl: 'চলতি বছরে অটো জমা',
    payYearEndZakatBtn: 'বকেয়া জাকাত পরিশোধ',
    payAdvanceZakatBtn: 'জমাকৃত জাকাত অগ্রিম দিন',
    noZakatDueText: 'কোনো জাকাত বকেয়া নেই',
    zakatHappinessTag: '+৮ সুখ (বকেয়া) / +৫ সুখ (অগ্রিম)',
    taxSectionTitle: 'আয়কর (প্রগতিশীল হার)',
    taxRateBadge: 'আয়কর হার',
    taxRuleDesc:
      'বেতন, ব্যবসা, ভাড়া, ডিভিডেন্ড, সুদ ও শেয়ার-প্রপার্টি বিক্রি থেকে আয়ের ওপর স্বয়ংক্রিয়ভাবে আয়কর জমা হয়। বাজারে ক্ষতি হলে বা নিট সম্পদ কমে গেলে আয়করও স্বয়ংক্রিয়ভাবে কমে যায়।',
    taxableIncomeYtdLbl: 'চলতি বছরের করযোগ্য আয়',
    currentTaxBracketLbl: 'প্রযোজ্য আয়কর হার',
    lossReliefLbl: 'ক্ষতিজনিত কর ছাড়',
    payYearEndTaxBtn: 'বকেয়া আয়কর পরিশোধ',
    payAdvanceTaxBtn: 'জমাকৃত আয়কর অগ্রিম দিন',
    noTaxDueText: 'কোনো আয়কর বকেয়া নেই',
    taxHappinessTag: '+৫ সুখ (বকেয়া) / +৪ সুখ (অগ্রিম)',
    assetBreakdownTitle: 'জাকাতযোগ্য সম্পদের হিসাব',
    zakatableAssetsSumLbl: 'জাকাতযোগ্য মোট সম্পদ (নগদ ও বিনিয়োগ)',
    deductibleDebtsLbl: 'বাদযোগ্য দায় ও ঋণ',
    netZakatableLbl: 'নিট জাকাতযোগ্য সম্পদ',
  },
  victory: {
    banner: 'র‍্যাট রেস সম্পূর্ণ!',
    title: 'আর্থিক স্বাধীনতা অর্জিত হয়েছে!',
    bodyBeforeProf: 'অভিনন্দন!',
    bodyMid:
      'হিসেবে যাত্রা শুরু করে আপনার মাসিক প্যাসিভ আয় এখন মোট মাসিক খরচকে ছাড়িয়ে গেছে। আপনি র‍্যাট রেস থেকে মুক্তি পেয়েছেন মাত্র',
    bodyAfter: 'মাসে।',
    totalPassive: 'মোট প্যাসিভ আয়',
    monthlyExpenses: 'মাসিক খরচ',
    monthsTaken: 'মোট সময় লেগেছে',
    totalAssets: 'মোট সম্পদ',
    totalLiabilities: 'মোট দায়',
    netWorth: 'নিট সম্পদ',
    propertiesCount: 'টি প্রপার্টি',
    businessesCount: 'টি ব্যবসা',
    stocksCount: 'টি শেয়ার পজিশন',
    mainMenuBtn: 'মেইন মেনু',
    continueBtn: 'খেলা চালিয়ে যান',
  },
  gameOver: {
    title: 'গেম ওভার',
    reason: 'সুখ ৫০%-এর নিচে নেমে গেছে।',
    happinessLbl: 'সুখ',
    monthsSurvivedLbl: 'অতিবাহিত মাস',
    netWorthLbl: 'নিট সম্পদ',
    passiveIncomeLbl: 'প্যাসিভ আয়',
    startNewBtn: 'নতুন খেলা শুরু করুন',
    mainMenuBtn: 'মেইন মেনু',
  },
  professionNames: {
    teacher: {
      name: 'শিক্ষক',
      title: 'উচ্চ বিদ্যালয় শিক্ষক',
      desc: 'নিয়মিত বেতন ও $11,000 থোক বরাদ্দ। ছোট বিনিয়োগ ও সাইড বিজনেস শুরুর জন্য দারুণ সুযোগ!',
    },
    doctor: {
      name: 'ডাক্তার',
      title: 'হাসপাতাল চিকিৎসক',
      desc: 'উচ্চ বেতন ও $25,000 শুরুর থোক বরাদ্দ। দ্রুত বড় সম্পদ ও প্যাসিভ আয় গড়ার সুযোগ।',
    },
    engineer: {
      name: 'ইঞ্জিনিয়ার',
      title: 'মেকানিক্যাল সিস্টেমস ইঞ্জিনিয়ার',
      desc: 'শক্তিশালী কারিগরি বেতন ও $16,000 থোক বরাদ্দ। প্রপার্টি ও প্রযুক্তি বিনিয়োগের জন্য চমৎকার।',
    },
    government_employee: {
      name: 'সরকারি চাকরিজীবী',
      title: 'পৌর পরিচালনা বিশেষজ্ঞ',
      desc: 'নিশ্চিত মাসিক বেতন, নিয়ন্ত্রিত খরচ ও $10,000 থোক বরাদ্দে ধাপে ধাপে আয়ের পথ।',
    },
    business_owner: {
      name: 'ব্যবসায়ী',
      title: 'স্বাধীন খুচরা ব্যবসায়ী',
      desc: 'শুরুতেই $22,000 থোক বরাদ্দ ও ভালো মাসিক আয়—নতুন ব্যবসা ও বাজারে বিনিয়োগের সুযোগ।',
    },
    office_clerk: {
      name: 'অফিস ক্লার্ক',
      title: 'প্রশাসনিক সমন্বয়কারী',
      desc: '$7,500 শুরুর থোক বরাদ্দ ও মিতব্যয়ী জীবনযাত্রায় স্মার্ট বিনিয়োগের মাধ্যমে এগিয়ে চলুন।',
    },
    software_developer: {
      name: 'সফটওয়্যার ডেভেলপার',
      title: 'সিনিয়র ফুল-স্ট্যাক ইঞ্জিনিয়ার',
      desc: 'উচ্চ বেতন, কম স্থায়ী খরচ ও $19,000 থোক বরাদ্দ—দ্রুত বিনিয়োগ পোর্টফোলিও গড়ার আদর্শ পেশা।',
    },
    lawyer: {
      name: 'আইনজীবী',
      title: 'কর্পোরেট আইনজীবী',
      desc: 'বড় মাসিক আয়ের পাশাপাশি $24,000 শুরুর থোক বরাদ্দ নিয়ে উচ্চ-মূল্যের বিনিয়োগের সুযোগ।',
    },
    banker: {
      name: 'ব্যাংকার',
      title: 'বাণিজ্যিক ক্রেডিট বিশ্লেষক',
      desc: 'শুরু থেকেই $21,000 থোক রিজার্ভ ও আর্থিক খাতের শক্তিশালী মাসিক বেতন।',
    },
    freelancer: {
      name: 'ফ্রিল্যান্সার',
      title: 'স্বাধীন ডিজাইন পরামর্শক',
      desc: 'নমনীয় খরচ ও $12,000 থোক বরাদ্দ থাকায় দ্রুত প্যাসিভ আয় বাড়িয়ে স্বাধীন হওয়া সহজ।',
    },
  },
};

export const TRANSLATIONS: Record<LanguageCode, TranslationPack> = {
  en: EN,
  bn: BN,
  es: EN,
  id: EN,
};

export function getT(lang: LanguageCode): TranslationPack {
  return TRANSLATIONS[lang] ?? EN;
}
