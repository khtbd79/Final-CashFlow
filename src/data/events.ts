import { EventCategory, PropertyListing, BusinessListing } from '../types/game';

export interface EventTemplate {
  id: string;
  category: EventCategory;
  durationType?: 'monthly' | 'annual';
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
    | 'venture_opportunity'
    | 'speaking_opportunity'
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
  // OPPORTUNITIES (Monthly short-term vs Annual 12-month long-term)
  {
    id: 'opp_stock_nvda_block',
    category: 'opportunity',
    durationType: 'monthly',
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
    durationType: 'monthly',
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
    durationType: 'annual',
    weight: 11,
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
    durationType: 'annual',
    weight: 12,
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
    durationType: 'annual',
    weight: 10,
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
    durationType: 'monthly',
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
    durationType: 'annual',
    weight: 9,
    title: 'Digital Template Licensing Deal',
    description: 'Invest $3,500 to package and license a niche industry toolkit that pays recurring monthly royalties.',
    financialImpactSummary: 'Invest $3,500 · Gain +$210/mo Other Passive Income',
    kind: 'other_passive_income',
    cashAmount: 3500,
    secondaryAmount: 210,
  },
  {
    id: 'opp_board_game_publish',
    category: 'opportunity',
    durationType: 'monthly',
    weight: 11,
    title: 'Board Game Publishing',
    description: 'Co-fund a small-batch board game launch. If retail demand catches on, royalties and unit sales pay big at month close.',
    financialImpactSummary: 'Invest $1,400 · Potential payout $2,900 - $4,800 (55% chance)',
    kind: 'venture_opportunity',
    cashAmount: 1400,
    secondaryAmount: 3600,
  },
  {
    id: 'opp_medical_conference',
    category: 'opportunity',
    durationType: 'monthly',
    weight: 10,
    title: 'Industry & Health Conference',
    description: 'You are invited to speak at a major healthcare and innovation conference. Deliver a presentation to earn a speaker honorarium, factoring in travel expenses.',
    financialImpactSummary: 'Speaker Honorarium: $2,600 · Travel Expense: $1,200',
    kind: 'speaking_opportunity',
    cashAmount: 1200,
    secondaryAmount: 2600,
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

export interface CharacterSignatureOpportunityConfig {
  templateId: string;
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
  baseCost: number;
  minReturnPct: number;
  maxReturnPct: number;
  winChance: number;
}

export const CHARACTER_SIGNATURE_OPPORTUNITIES: Record<
  string,
  CharacterSignatureOpportunityConfig
> = {
  teacher: {
    templateId: 'char_opp_teacher',
    titleEn: 'Coaching & Study Guide Batch',
    titleBn: 'কোচিং ও গাইড নোট',
    descEn: 'Print a curated study guide batch and run a focused exam-prep workshop for steady monthly returns.',
    descBn: 'ছাত্রদের জন্য বিশেষ গাইড নোট প্রকাশ ও স্বল্পমেয়াদী কোচিং ব্যাচ পরিচালনা করে প্রায় নিশ্চিত মাসিক মুনাফা পান।',
    baseCost: 300,
    minReturnPct: 22,
    maxReturnPct: 44,
    winChance: 0.92,
  },
  doctor: {
    templateId: 'char_opp_doctor',
    titleEn: 'Weekend Private Health Camp',
    titleBn: 'বিশেষ স্বাস্থ্য ক্যাম্প',
    descEn: 'Sponsor a weekend private screening clinic with partner labs for reliable recurring patient fees.',
    descBn: 'সাপ্তাহিক ছুটির দিনে পার্টনার ল্যাবের সাথে প্রাইভেট স্বাস্থ্য পরীক্ষা ক্যাম্প আয়োজন করে প্রায় নিশ্চিত মুনাফা অর্জন করুন।',
    baseCost: 700,
    minReturnPct: 22,
    maxReturnPct: 44,
    winChance: 0.92,
  },
  engineer: {
    templateId: 'char_opp_engineer',
    titleEn: 'Technical Inspection Contract',
    titleBn: 'কারিগরি পরিদর্শন চুক্তি',
    descEn: 'Supply calibration kits and sign off on a short-term industrial site inspection.',
    descBn: 'স্থানীয় প্রকল্পে স্বল্পমেয়াদী কারিগরি মান যাচাই ও যন্ত্রাংশ ক্যালিব্রেশন চুক্তি থেকে প্রায় নিশ্চিত মুনাফা নিন।',
    baseCost: 480,
    minReturnPct: 22,
    maxReturnPct: 44,
    winChance: 0.92,
  },
  government_employee: {
    templateId: 'char_opp_government_employee',
    titleEn: 'Co-op Essential Supply Lot',
    titleBn: 'সমবায় পণ্য সরবরাহ',
    descEn: 'Participate in a verified cooperative essential-goods supply batch with strong buyer demand.',
    descBn: 'নিরাপদ সমবায় নেটওয়ার্কের মাধ্যমে নিত্যপ্রয়োজনীয় পণ্য সরবরাহ লটে অল্প বিনিয়োগে প্রায় নিশ্চিত লাভ করুন।',
    baseCost: 300,
    minReturnPct: 20,
    maxReturnPct: 40,
    winChance: 0.93,
  },
  business_owner: {
    templateId: 'char_opp_business_owner',
    titleEn: 'Fast Wholesale Trade Flip',
    titleBn: 'দ্রুত পাইকারি লট বিক্রি',
    descEn: 'Pick up a fast-moving wholesale retail lot for pre-booked neighborhood buyers.',
    descBn: 'আগে থেকে চাহিদা থাকা পণ্যের একটি ছোট পাইকারি লট কিনে দ্রুত মুনাফায় বিক্রি করুন।',
    baseCost: 600,
    minReturnPct: 24,
    maxReturnPct: 46,
    winChance: 0.91,
  },
  office_clerk: {
    templateId: 'char_opp_office_clerk',
    titleEn: 'Corporate Stationery Order',
    titleBn: 'অফিস সরবরাহ অর্ডার',
    descEn: 'Fulfill a recurring monthly office stationery and printing supply lot for local firms.',
    descBn: 'স্থানীয় অফিসগুলোর মাসিক স্টেশনারি ও প্রিন্টিং সামগ্রী সরবরাহের ছোট চুক্তি থেকে প্রায় নিশ্চিত লাভ পান।',
    baseCost: 220,
    minReturnPct: 20,
    maxReturnPct: 40,
    winChance: 0.93,
  },
  software_developer: {
    templateId: 'char_opp_software_developer',
    titleEn: 'Automation & Plugin Sprint',
    titleBn: 'অটোমেশন স্ক্রিপ্ট চুক্তি',
    descEn: 'Deploy a lightweight workflow plugin and automation setup for small business clients.',
    descBn: 'ছোট ব্যবসায়ের জন্য অটোমেশন স্ক্রিপ্ট ও প্লাগইন সেটআপ করে অল্প পুঁজিতে প্রায় নিশ্চিত মুনাফা পান।',
    baseCost: 520,
    minReturnPct: 24,
    maxReturnPct: 46,
    winChance: 0.91,
  },
  lawyer: {
    templateId: 'char_opp_lawyer',
    titleEn: 'Contract & Title Review',
    titleBn: 'চুক্তিপত্র ও দলিল যাচাই',
    descEn: 'Handle a fast-turnaround commercial contract and land-title review package.',
    descBn: 'কর্পোরেট ক্লায়েন্টের জরুরি চুক্তিপত্র ও দলিল যাচাইয়ের কাজ নিয়ে প্রায় নিশ্চিত মাসিক আয় করুন।',
    baseCost: 650,
    minReturnPct: 22,
    maxReturnPct: 44,
    winChance: 0.92,
  },
  banker: {
    templateId: 'char_opp_banker',
    titleEn: 'Short-Term Trade Invoice',
    titleBn: 'স্বল্পমেয়াদী ইনভয়েস ট্রেড',
    descEn: 'Fund a short-dated verified commercial trade invoice factoring slot for reliable settlement yield.',
    descBn: 'যাচাইকৃত স্বল্পমেয়াদী বাণিজ্যিক ইনভয়েস ট্রেডে অল্প বিনিয়োগ করে প্রায় নিশ্চিত মুনাফা পান।',
    baseCost: 580,
    minReturnPct: 22,
    maxReturnPct: 44,
    winChance: 0.92,
  },
  freelancer: {
    templateId: 'char_opp_freelancer',
    titleEn: 'Express Brand Design Pack',
    titleBn: 'এক্সপ্রেস ডিজাইন প্যাকেজ',
    descEn: 'Deliver a rapid brand kit and social campaign asset bundle for repeat startup clients.',
    descBn: 'স্টার্টআপ ক্লায়েন্টদের জন্য দ্রুত ব্র্যান্ড ও সোশ্যাল ডিজাইন প্যাকেজ তৈরি করে প্রায় নিশ্চিত লাভ পান।',
    baseCost: 340,
    minReturnPct: 22,
    maxReturnPct: 45,
    winChance: 0.92,
  },
};

export function getCharacterSignatureConfig(
  professionId: string
): CharacterSignatureOpportunityConfig {
  return CHARACTER_SIGNATURE_OPPORTUNITIES[professionId] ?? CHARACTER_SIGNATURE_OPPORTUNITIES.teacher;
}
