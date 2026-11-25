import { EventCategory, PropertyListing, BusinessListing } from '../types/game';

export interface EventTemplate {
  id: string;
  category: EventCategory;
  weight: number;
  title: string;
  description: string;
  financialImpactSummary: string;
  kind:
    | 'stock_discount'
    | 'property_deal'
    | 'business_deal'
    | 'side_hustle'
    | 'other_passive_income'
    | 'dividend_windfall'
    | 'medical_bill'
    | 'car_repair'
    | 'home_repair'
    | 'family_expense'
    | 'tax_audit'
    | 'education_course'
    | 'salary_raise'
    | 'salary_cut'
    | 'promotion'
    | 'market_crash'
    | 'property_boom'
    | 'new_baby'
    | 'divorce';
  cashAmount?: number;
  secondaryAmount?: number;
  symbol?: string;
  shares?: number;
  propertyDeal?: Omit<PropertyListing, 'id'>;
  businessDeal?: Omit<BusinessListing, 'id'>;
}

export const EVENT_POOL: EventTemplate[] = [
  // OPPORTUNITIES
  {
    id: 'opp_stock_nvda_block',
    category: 'opportunity',
    weight: 12,
    title: 'Private Placement: NovaCore Block',
    description: 'An institutional broker offers an off-market block of 25 shares of NovaCore Semiconductors (NVDAX) at 18% below market price.',
    financialImpactSummary: 'Buy 25 NVDAX shares at an 18% discount (player decision required)',
    kind: 'stock_discount',
    symbol: 'NVDAX',
    shares: 25,
    secondaryAmount: 0.82, // 18% discount multiplier
  },
  {
    id: 'opp_stock_vltg_block',
    category: 'opportunity',
    weight: 12,
    title: 'Dividend Share Offering: VoltGrid',
    description: 'A retiring colleague wants to liquidate 40 shares of VoltGrid Energy (VLTG) quickly at a 15% discount.',
    financialImpactSummary: 'Buy 40 VLTG shares at 15% discount + steady dividend income',
    kind: 'stock_discount',
    symbol: 'VLTG',
    shares: 40,
    secondaryAmount: 0.85,
  },
  {
    id: 'opp_property_distressed_duplex',
    category: 'opportunity',
    weight: 10,
    title: 'Off-Market Distressed Duplex',
    description: 'A motivated seller needs a fast close on a 2-unit duplex below neighborhood comps. Requires $16,000 down payment.',
    financialImpactSummary: 'Price $80,000 · Down $16,000 · Rent $1,240/mo · Maint $240/mo',
    kind: 'property_deal',
    propertyDeal: {
      name: 'Elmwood Distressed Duplex',
      type: 'rental',
      location: 'Westgate District',
      purchasePrice: 80000,
      downPayment: 16000,
      loanAmount: 64000,
      loanAnnualRate: 0.065,
      loanTermMonths: 240,
      monthlyRentalIncome: 1240,
      maintenanceExpense: 240,
      description: 'Under-market duplex deal sourced privately with immediate tenant cashflow.',
    },
  },
  {
    id: 'opp_property_starter_condo',
    category: 'opportunity',
    weight: 11,
    title: 'Foreclosure Condo Auction',
    description: 'A bank-owned 1-bedroom rental condo is available privately for $38,000 with just $7,600 down.',
    financialImpactSummary: 'Price $38,000 · Down $7,600 · Rent $590/mo · Maint $115/mo',
    kind: 'property_deal',
    propertyDeal: {
      name: 'Station Square Condo',
      type: 'rental',
      location: 'Central Transit',
      purchasePrice: 38000,
      downPayment: 7600,
      loanAmount: 30400,
      loanAnnualRate: 0.067,
      loanTermMonths: 180,
      monthlyRentalIncome: 590,
      maintenanceExpense: 115,
      description: 'Low-entry foreclosure rental property with solid monthly cashflow margin.',
    },
  },
  {
    id: 'opp_business_kiosk_partner',
    category: 'opportunity',
    weight: 9,
    title: 'Automated Parcel Locker Network',
    description: 'Partner in a turnkey apartment parcel-locker kiosk route already installed across 8 residential lobbies.',
    financialImpactSummary: 'Cost $19,500 · Passive Revenue $1,580/mo · Operating Exp $760/mo',
    kind: 'business_deal',
    businessDeal: {
      name: 'SmartDrop Parcel Lockers',
      category: 'Automated Infrastructure',
      mode: 'existing',
      purchasePrice: 19500,
      initialInvestment: 19500,
      monthlyRevenue: 1580,
      monthlyOperatingExpenses: 760,
      isAutomated: true,
      automationUpgradeCost: 0,
      automationMonthlyFee: 0,
      description: 'Automated lobby locker network generating hands-off monthly fee income.',
    },
  },
  {
    id: 'opp_side_consulting',
    category: 'opportunity',
    weight: 12,
    title: 'Weekend Advisory Contract',
    description: 'An industry acquaintance invites you to deliver a weekend workshop and advisory sprint.',
    financialImpactSummary: 'Earn +$1,450 cash immediately (optional engagement)',
    kind: 'side_hustle',
    cashAmount: 1450,
  },
  {
    id: 'opp_royalty_license',
    category: 'opportunity',
    weight: 7,
    title: 'Digital Template Licensing Deal',
    description: 'Invest $3,500 to package and license a niche industry toolkit that pays recurring monthly royalties.',
    financialImpactSummary: 'Invest $3,500 · Gain +$210/mo Other Passive Income',
    kind: 'other_passive_income',
    cashAmount: 3500,
    secondaryAmount: 210,
  },

  // EXPENSES AND EMERGENCIES
  {
    id: 'exp_medical',
    category: 'expense_emergency',
    weight: 10,
    title: 'Unexpected Dental & Medical Bill',
    description: 'An urgent outpatient procedure left out-of-pocket medical charges not covered by your standard plan.',
    financialImpactSummary: '-$1,100 cash expense (or finance via emergency loan)',
    kind: 'medical_bill',
    cashAmount: 1100,
  },
  {
    id: 'exp_car_repair',
    category: 'expense_emergency',
    weight: 11,
    title: 'Vehicle Transmission Repair',
    description: 'Your daily commuter vehicle requires an immediate transmission overhaul to stay roadworthy.',
    financialImpactSummary: '-$1,350 cash expense',
    kind: 'car_repair',
    cashAmount: 1350,
  },
  {
    id: 'exp_home_repair',
    category: 'expense_emergency',
    weight: 10,
    title: 'Storm Roof & Plumbing Repair',
    description: 'Heavy seasonal weather caused roof flashing damage and an emergency plumbing callout.',
    financialImpactSummary: '-$1,600 cash expense',
    kind: 'home_repair',
    cashAmount: 1600,
  },
  {
    id: 'exp_family',
    category: 'expense_emergency',
    weight: 9,
    title: 'Urgent Family Support',
    description: 'A close family member faces a sudden shortfall and asks for financial assistance this month.',
    financialImpactSummary: '-$950 cash expense',
    kind: 'family_expense',
    cashAmount: 950,
  },
  {
    id: 'exp_tax_bill',
    category: 'expense_emergency',
    weight: 8,
    title: 'Municipal Assessment Adjustment',
    description: 'A revised annual tax reconciliation requires a one-time balance payment this period.',
    financialImpactSummary: '-$1,200 cash expense',
    kind: 'tax_audit',
    cashAmount: 1200,
  },
  {
    id: 'exp_education',
    category: 'expense_emergency',
    weight: 8,
    title: 'Mandatory Licensing Renewal',
    description: 'Professional accreditation renewal and compliance training fees are due this month.',
    financialImpactSummary: '-$680 cash expense',
    kind: 'education_course',
    cashAmount: 680,
  },

  // LIFE EVENTS
  {
    id: 'life_salary_raise',
    category: 'life_event',
    weight: 8,
    title: 'Annual Performance Merit Raise',
    description: 'Strong quarterly output earned you a permanent 8% salary increase.',
    financialImpactSummary: '+8% permanent Monthly Salary increase',
    kind: 'salary_raise',
    secondaryAmount: 1.08,
  },
  {
    id: 'life_promotion',
    category: 'life_event',
    weight: 6,
    title: 'Senior Role Promotion & Bonus',
    description: 'You stepped into a lead role with a +$650/month salary bump and a $1,500 signing bonus.',
    financialImpactSummary: '+$650/mo Salary & +$1,500 immediate bonus',
    kind: 'promotion',
    cashAmount: 1500,
    secondaryAmount: 650,
  },
  {
    id: 'life_salary_cut',
    category: 'life_event',
    weight: 5,
    title: 'Department Budget Contraction',
    description: 'Industry headwinds reduced overtime and bonus allowances, trimming monthly salary by 7%.',
    financialImpactSummary: '-7% Monthly Salary adjustment',
    kind: 'salary_cut',
    secondaryAmount: 0.93,
  },
  {
    id: 'life_market_crash',
    category: 'life_event',
    weight: 5,
    title: 'Black Swan Market Crash',
    description: 'A sudden Black Swan shock triggers a sharp sell-off in stocks and crypto while Gold surges as a safe haven.',
    financialImpactSummary: 'Stocks & Crypto plunge sharply · Gold holders profit',
    kind: 'market_crash',
  },
  {
    id: 'life_property_boom',
    category: 'life_event',
    weight: 7,
    title: 'Metro Transit Expansion Approved',
    description: 'New regional rail funding boosted residential & rental property valuations by +12% across the city.',
    financialImpactSummary: 'All owned Real Estate values increase by +12%',
    kind: 'property_boom',
    secondaryAmount: 1.12,
  },
  {
    id: 'life_new_baby',
    category: 'life_event',
    weight: 5,
    title: 'A New Baby Has Arrived!',
    description: 'Congratulations! Your family welcomed a newborn baby, bringing joy alongside monthly care costs.',
    financialImpactSummary: 'Happiness rises · Monthly family & education expenses increase',
    kind: 'new_baby',
  },
  {
    id: 'life_divorce',
    category: 'life_event',
    weight: 4,
    title: 'Divorce & Separation Settlement',
    description: 'An unexpected marital breakdown leads to legal separation, emotional strain, and a financial settlement.',
    financialImpactSummary: 'Marital status changes to Divorced · Settlement cost & happiness drop',
    kind: 'divorce',
  },
];
