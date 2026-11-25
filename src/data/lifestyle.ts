import { randomInt, randomPick, randomRange, shuffleArray, uid } from '../engine/prng';
import {
  CharacterVenture,
  EducationCourse,
  GameState,
  HappinessItem,
  LanguageCode,
  LotteryTicketDef,
  LotteryTicketId,
  OwnedPersonalAsset,
  PersonalAssetCatalogItem,
  PersonalAssetId,
  PropertyType,
} from '../types/game';
import { getProfessionById } from './professions';
export type { HappinessItem };

export const PROFESSION_HAPPINESS_ITEMS: Record<string, HappinessItem[]> = {
  teacher: [
    { id: 'tea_book', nameEn: 'Rare Book Edition', nameBn: 'দুর্লভ বইয়ের সংগ্রহ', cost: 90, happinessGain: 5 },
    { id: 'tea_poetry', nameEn: 'Cafe Literature Night', nameBn: 'কফি ও সাহিত্য আড্ডা', cost: 220, happinessGain: 10 },
    { id: 'tea_garden', nameEn: 'Botanical Retreat', nameBn: 'বোটানিক্যাল গার্ডেন ভ্রমণ', cost: 480, happinessGain: 15 },
    { id: 'tea_hill', nameEn: 'Hilltop Study Break', nameBn: 'পাহাড়ি অবকাশ ভ্রমণ', cost: 1100, happinessGain: 24 },
    { id: 'tea_library', nameEn: 'Home Library Studio', nameBn: 'নিজস্ব পাঠাগার সাজানো', cost: 2100, happinessGain: 35 },
  ],
  doctor: [
    { id: 'doc_espresso', nameEn: 'Artisan Espresso Bar', nameBn: 'স্পেশালিটি কফি কর্নার', cost: 250, happinessGain: 5 },
    { id: 'doc_dining', nameEn: 'Family Fine Dining', nameBn: 'পারিবারিক ফাইন ডাইনিং', cost: 680, happinessGain: 10 },
    { id: 'doc_spa', nameEn: 'Private Recovery Spa', nameBn: 'প্রাইভেট স্পা ও থেরাপি', cost: 1450, happinessGain: 15 },
    { id: 'doc_resort', nameEn: 'Coastal Resort Stay', nameBn: 'সমুদ্র রিসোর্ট অবকাশ', cost: 3200, happinessGain: 24 },
    { id: 'doc_club', nameEn: 'Country Club Membership', nameBn: 'প্রাইভেট ক্লাব সদস্যপদ', cost: 5800, happinessGain: 35 },
  ],
  engineer: [
    { id: 'eng_tools', nameEn: 'Precision Hobby Kit', nameBn: 'শখের কারিগরি টুলকিট', cost: 160, happinessGain: 5 },
    { id: 'eng_gadget', nameEn: 'Smart Home Upgrade', nameBn: 'স্মার্ট হোম গ্যাজেট', cost: 420, happinessGain: 10 },
    { id: 'eng_sim', nameEn: 'Racing Sim Rig', nameBn: 'রেসিং সিমুলেটর সেটআপ', cost: 950, happinessGain: 15 },
    { id: 'eng_drive', nameEn: 'Mountain Road Trip', nameBn: 'পাহাড়ি রোড-ট্রিপ ভ্রমণ', cost: 2000, happinessGain: 24 },
    { id: 'eng_lounge', nameEn: 'Workshop Studio Setup', nameBn: 'আধুনিক স্টুডিও ও লাউঞ্জ', cost: 3900, happinessGain: 35 },
  ],
  government_employee: [
    { id: 'gov_tea', nameEn: 'Classic Music & Tea', nameBn: 'সন্ধ্যার চা ও সংগীত', cost: 85, happinessGain: 5 },
    { id: 'gov_feast', nameEn: 'Community Family Feast', nameBn: 'পারিবারিক ও সামাজিক ভোজ', cost: 240, happinessGain: 10 },
    { id: 'gov_club', nameEn: 'Heritage Club Pass', nameBn: 'হেরিটেজ ক্লাব সদস্যপদ', cost: 520, happinessGain: 15 },
    { id: 'gov_tour', nameEn: 'Historic Family Tour', nameBn: 'পরিবারসহ ঐতিহাসিক ভ্রমণ', cost: 1200, happinessGain: 24 },
    { id: 'gov_veranda', nameEn: 'Garden Veranda Makeover', nameBn: 'বাগান ও বারান্দা সাজানো', cost: 2300, happinessGain: 35 },
  ],
  business_owner: [
    { id: 'biz_lounge', nameEn: 'Executive Lounge Hour', nameBn: 'লাউঞ্জ ও প্রিমিয়াম কফি', cost: 220, happinessGain: 5 },
    { id: 'biz_golf', nameEn: 'Golf Club Morning', nameBn: 'গলফ ক্লাব ডে-পাস', cost: 620, happinessGain: 10 },
    { id: 'biz_watch', nameEn: 'Signature Watch Care', nameBn: 'সংগ্রহের ঘড়ি সংযোজন', cost: 1350, happinessGain: 15 },
    { id: 'biz_yacht', nameEn: 'Private Boat Charter', nameBn: 'প্রাইভেট বোট ও নদী ভ্রমণ', cost: 2900, happinessGain: 24 },
    { id: 'biz_villa', nameEn: 'Family Villa Retreat', nameBn: 'পরিবারসহ বিলাসবহুল ভিলা', cost: 5200, happinessGain: 35 },
  ],
  office_clerk: [
    { id: 'clk_cinema', nameEn: 'Street Food & Cinema', nameBn: 'সিনেমা ও স্ট্রিট ফুড', cost: 65, happinessGain: 5 },
    { id: 'clk_picnic', nameEn: 'Weekend Picnic Day', nameBn: 'সাপ্তাহিক পিকনিক ও আড্ডা', cost: 160, happinessGain: 10 },
    { id: 'clk_sports', nameEn: 'Badminton Club Pass', nameBn: 'ব্যাডমিন্টন ক্লাব ফি', cost: 350, happinessGain: 15 },
    { id: 'clk_cruise', nameEn: 'River Cruise Trip', nameBn: 'নৌ-ভ্রমণ ও পারিবারিক দিন', cost: 820, happinessGain: 24 },
    { id: 'clk_home', nameEn: 'Living Room Refresh', nameBn: 'বসার ঘর সাজানো', cost: 1650, happinessGain: 35 },
  ],
  software_developer: [
    { id: 'dev_kb', nameEn: 'Custom Mechanical Keys', nameBn: 'কাস্টম মেকানিক্যাল কিবোর্ড', cost: 180, happinessGain: 5 },
    { id: 'dev_show', nameEn: 'Live Synth Concert', nameBn: 'কনসার্ট ও সাউন্ড শো', cost: 450, happinessGain: 10 },
    { id: 'dev_desk', nameEn: 'Ultrawide Desk Gear', nameBn: 'আল্ট্রাওয়াইড ডেস্ক সেটআপ', cost: 1100, happinessGain: 15 },
    { id: 'dev_cabin', nameEn: 'Mountain Cabin Week', nameBn: 'পাহাড়ি কেবিন ভ্রমণ', cost: 2400, happinessGain: 24 },
    { id: 'dev_vr', nameEn: 'Home Cinema & Gaming', nameBn: 'হোম থিয়েটার ও গেমিং রুম', cost: 4400, happinessGain: 35 },
  ],
  lawyer: [
    { id: 'law_theatre', nameEn: 'Theatre Box Tickets', nameBn: 'মঞ্চনাটক ভিআইপি টিকিট', cost: 240, happinessGain: 5 },
    { id: 'law_vintage', nameEn: 'Rare Antique Piece', nameBn: 'দুর্লভ অ্যান্টিক সংগ্রহ', cost: 650, happinessGain: 10 },
    { id: 'law_tailor', nameEn: 'Bespoke Suit Tailoring', nameBn: 'কাস্টম ডিজাইনার পোশাক', cost: 1400, happinessGain: 15 },
    { id: 'law_city', nameEn: 'Heritage City Tour', nameBn: 'ঐতিহ্যবাহী শহর ভ্রমণ', cost: 3100, happinessGain: 24 },
    { id: 'law_art', nameEn: 'Original Gallery Art', nameBn: 'নিজস্ব চিত্রকলা সংগ্রহ', cost: 5500, happinessGain: 35 },
  ],
  banker: [
    { id: 'bnk_dining', nameEn: 'Chef Tasting Menu', nameBn: 'গুরমেট ডিনার সন্ধ্যা', cost: 210, happinessGain: 5 },
    { id: 'bnk_club', nameEn: 'Athletic Wellness Spa', nameBn: 'অ্যাথলেটিক ক্লাব ও স্পা', cost: 580, happinessGain: 10 },
    { id: 'bnk_watch', nameEn: 'Collector Timepiece', nameBn: 'সংগ্রাহক ঘড়ি সংযোজন', cost: 1300, happinessGain: 15 },
    { id: 'bnk_ski', nameEn: 'Alpine Resort Retreat', nameBn: 'পাহাড়ি রিসোর্ট ছুটি', cost: 2850, happinessGain: 24 },
    { id: 'bnk_decor', nameEn: 'Penthouse Interior Upgrade', nameBn: 'বাসভবন প্রিমিয়াম সাজসজ্জা', cost: 4900, happinessGain: 35 },
  ],
  freelancer: [
    { id: 'frl_sketch', nameEn: 'Pour-Over & Sketchbook', nameBn: 'কফি ও স্কেচবুক সময়', cost: 95, happinessGain: 5 },
    { id: 'frl_studio', nameEn: 'Art Studio Pass', nameBn: 'আর্ট স্টুডিও ও গ্যালারি', cost: 260, happinessGain: 10 },
    { id: 'frl_camera', nameEn: 'Camera Lens Kit', nameBn: 'ফটোগ্রাফি লেন্স কিট', cost: 590, happinessGain: 15 },
    { id: 'frl_island', nameEn: 'Island Nature Escape', nameBn: 'দ্বীপ ও প্রকৃতি ভ্রমণ', cost: 1350, happinessGain: 24 },
    { id: 'frl_loft', nameEn: 'Creative Loft Makeover', nameBn: 'সৃজনশীল স্টুডিও সাজানো', cost: 2600, happinessGain: 35 },
  ],
};

export const UNIVERSAL_HAPPINESS_ITEMS: HappinessItem[] = [
  { id: 'uni_sunset_walk', nameEn: 'Lakeside Boat & Tea', nameBn: 'লেকে নৌ-ভ্রমণ ও চা', cost: 110, happinessGain: 6 },
  { id: 'uni_music_night', nameEn: 'Acoustic Live Music Night', nameBn: 'সরাসরি সংগীত সন্ধ্যা', cost: 260, happinessGain: 9 },
  { id: 'uni_wellness', nameEn: 'Full-Day Sauna & Massage', nameBn: 'সারা দিনের স্পা ও ম্যাসাজ', cost: 480, happinessGain: 12 },
  { id: 'uni_charity', nameEn: 'Community Charity Feast', nameBn: 'সামাজিক কল্যাণ ও দান', cost: 620, happinessGain: 14 },
  { id: 'uni_family_out', nameEn: 'Theme Park & Dinner', nameBn: 'থিম পার্ক ও রাতের খাবার', cost: 780, happinessGain: 15 },
  { id: 'uni_cooking', nameEn: 'Chef Cooking Workshop', nameBn: 'রন্ধন ও বেকিং কর্মশালা', cost: 340, happinessGain: 10 },
  { id: 'uni_camping', nameEn: 'Stargazing Forest Camp', nameBn: 'বনাঞ্চলে রাত্রিযাপন ও ক্যাম্পিং', cost: 920, happinessGain: 18 },
  { id: 'uni_cycle', nameEn: 'Carbon Road Bicycle', nameBn: 'আধুনিক রোড বাইসাইকেল', cost: 1250, happinessGain: 20 },
  { id: 'uni_garden', nameEn: 'Rooftop Orchid Garden', nameBn: 'ছাদবাগান ও অর্কিড সজ্জা', cost: 1550, happinessGain: 22 },
  { id: 'uni_cruise', nameEn: 'Luxury River Cruise Weekend', nameBn: 'সাপ্তাহিক বিলাসবহুল নৌ-ভ্রমণ', cost: 2300, happinessGain: 27 },
  { id: 'uni_overseas', nameEn: 'International City Escape', nameBn: 'বিদেশি পর্যটন শহর ভ্রমণ', cost: 3800, happinessGain: 34 },
  { id: 'uni_piano', nameEn: 'Home Music & Lounge Corner', nameBn: 'গৃহ সংগীত ও বিশ্রাম কর্নার', cost: 1850, happinessGain: 24 },
  { id: 'uni_pottery', nameEn: 'Artisan Pottery & Art Day', nameBn: 'মৃৎশিল্প ও চিত্রাঙ্কন দিন', cost: 190, happinessGain: 8 },
  { id: 'uni_sports_vip', nameEn: 'Championship Stadium Box', nameBn: 'ফাইনাল ম্যাচ ভিআইপি গ্যালারি', cost: 860, happinessGain: 16 },
  { id: 'uni_gym', nameEn: 'Boutique Fitness Membership', nameBn: 'প্রিমিয়াম ফিটনেস ক্লাব', cost: 540, happinessGain: 13 },
  { id: 'uni_bakery', nameEn: 'Gourmet Dessert Tasting', nameBn: 'বিশেষ মিষ্টান্ন ও বেকারি স্বাদ', cost: 145, happinessGain: 7 },
];

export const PILGRIMAGE_HAPPINESS_ITEMS: HappinessItem[] = [
  {
    id: 'pilgrimage_umrah',
    templateId: 'pilgrimage_umrah',
    nameEn: 'Umrah Pilgrimage',
    nameBn: 'ওমরা হজ',
    cost: 1800,
    happinessGain: 22,
  },
  {
    id: 'pilgrimage_hajj',
    templateId: 'pilgrimage_hajj',
    nameEn: 'Major Hajj',
    nameBn: 'বড় হজ',
    cost: 5500,
    happinessGain: 40,
  },
];

export const ALL_HAPPINESS_ITEMS: HappinessItem[] = [
  ...Object.values(PROFESSION_HAPPINESS_ITEMS).flat(),
  ...UNIVERSAL_HAPPINESS_ITEMS,
  ...PILGRIMAGE_HAPPINESS_ITEMS,
];

export const HAPPINESS_ITEMS: HappinessItem[] = PROFESSION_HAPPINESS_ITEMS.teacher;

function buildScaledPilgrimageItems(professionId: string): HappinessItem[] {
  const prof = getProfessionById(professionId);
  const scale = Math.max(0.75, Math.min(1.65, prof.initialCash / 12000));
  return PILGRIMAGE_HAPPINESS_ITEMS.map((item) => ({
    ...item,
    id: item.id,
    templateId: item.templateId ?? item.id,
    cost: Math.max(500, Math.round((item.cost * scale) / 50) * 50),
  }));
}

export function withPilgrimageHappinessItems(
  items: HappinessItem[],
  professionId: string
): HappinessItem[] {
  const existingTemplates = new Set(items.map((item) => item.templateId ?? item.id));
  const missingPilgrimage = buildScaledPilgrimageItems(professionId).filter(
    (p) => !existingTemplates.has(p.templateId ?? p.id)
  );
  if (missingPilgrimage.length === 0) return items;
  return [...items, ...missingPilgrimage];
}

export function getHappinessItemsForProfession(professionId: string): HappinessItem[] {
  const profItems = PROFESSION_HAPPINESS_ITEMS[professionId] ?? PROFESSION_HAPPINESS_ITEMS.teacher;
  return [...profItems, ...buildScaledPilgrimageItems(professionId)];
}

export function rollMonthlyHappinessItems(
  professionId: string,
  count = 5
): HappinessItem[] {
  const profSpecific =
    PROFESSION_HAPPINESS_ITEMS[professionId] ?? PROFESSION_HAPPINESS_ITEMS.teacher;
  const prof = getProfessionById(professionId);
  const profScale = Math.max(0.65, Math.min(2.4, prof.initialCash / 12000));

  const scaledUniversal = UNIVERSAL_HAPPINESS_ITEMS.map((item) => ({
    ...item,
    cost: Math.max(40, Math.round((item.cost * profScale) / 10) * 10),
  }));

  const pilgrimageItems = buildScaledPilgrimageItems(professionId);
  const allPool = [...profSpecific, ...scaledUniversal, ...pilgrimageItems];
  const tolerableThreshold = Math.max(450, Math.round(prof.initialCash * 0.08));
  const affordablePool = shuffleArray(allPool.filter((item) => item.cost <= tolerableThreshold));
  const guaranteedAffordable = affordablePool.slice(0, Math.min(2, count));
  const usedIds = new Set(guaranteedAffordable.map((item) => item.id));
  const remainingPool = shuffleArray(allPool.filter((item) => !usedIds.has(item.id)));
  const combinedPool = shuffleArray([
    ...guaranteedAffordable,
    ...remainingPool.slice(0, Math.max(0, count - guaranteedAffordable.length)),
  ]);

  const picked = combinedPool.slice(0, count).map((tpl) => {
    const isPilgrimage =
      tpl.templateId === 'pilgrimage_umrah' || tpl.templateId === 'pilgrimage_hajj';
    const randomizedCost = isPilgrimage
      ? tpl.cost
      : Math.max(35, Math.round((tpl.cost * randomRange(0.68, 1.48)) / 5) * 5);
    const randomizedGain = isPilgrimage
      ? tpl.happinessGain
      : Math.max(4, Math.min(40, tpl.happinessGain + randomInt(-2, 3)));
    return {
      ...tpl,
      id: uid(tpl.id),
      templateId: tpl.templateId ?? tpl.id,
      cost: randomizedCost,
      happinessGain: randomizedGain,
    };
  });

  return picked;
}

export function getEffectiveHappinessCost(
  item: { cost: number },
  state: Pick<GameState, 'cash' | 'professionId' | 'inflationMultiplier'>
): number {
  const prof = getProfessionById(state.professionId);
  const baseline = Math.max(4000, prof.initialCash);
  let wealthFactor = 1;
  if (state.cash < baseline) {
    const cashRatio = Math.max(0.08, state.cash / baseline);
    wealthFactor = Math.max(0.28, 0.28 + 0.72 * Math.pow(cashRatio, 0.68));
  } else {
    const excess = Math.max(0, state.cash - baseline);
    wealthFactor = 1 + Math.pow(excess / baseline, 0.9) * 0.55;
  }
  const inf = state.inflationMultiplier ?? 1;
  return Math.max(20, Math.round((item.cost * wealthFactor * inf) / 5) * 5);
}

export function getWeddingCost(
  state: Pick<GameState, 'cash' | 'professionId' | 'inflationMultiplier'>
): number {
  const prof = getProfessionById(state.professionId);
  const baseline = Math.max(4000, prof.initialCash);
  const wealthFactor = 1 + Math.max(0, state.cash - baseline) / (baseline * 2.4);
  const inf = state.inflationMultiplier ?? 1;
  return Math.max(800, Math.round((1400 * wealthFactor * inf) / 100) * 100);
}

export interface InsurancePlan {
  id: 'health' | 'property';
  nameEn: string;
  nameBn: string;
  monthlyPremium: number;
}

export const INSURANCE_PLANS: InsurancePlan[] = [
  {
    id: 'health',
    nameEn: 'Health',
    nameBn: 'স্বাস্থ্য',
    monthlyPremium: 180,
  },
  {
    id: 'property',
    nameEn: 'Asset',
    nameBn: 'সম্পদ',
    monthlyPremium: 220,
  },
];

export function getEffectiveInsurancePlanPremium(
  plan: InsurancePlan,
  state: Pick<GameState, 'inflationMultiplier'>
): number {
  const inf = state.inflationMultiplier ?? 1;
  return Math.max(50, Math.round((plan.monthlyPremium * inf) / 10) * 10);
}

export interface ProfessionAffinity {
  stocks: string[];
  crypto: string[];
  fixedIncome: string[];
  propertyTypes: PropertyType[];
  businessCategories: string[];
}

export const PROFESSION_AFFINITIES: Record<string, ProfessionAffinity> = {
  teacher: {
    stocks: ['RVRB', 'APEX', 'VLTG'],
    crypto: ['BTCX'],
    fixedIncome: ['hy_savings', 't_bill_3m'],
    propertyTypes: ['residential', 'rental'],
    businessCategories: ['Local Services', 'Food & Beverage', 'Digital Software'],
  },
  doctor: {
    stocks: ['HLTH', 'RVRB'],
    crypto: ['BTCX'],
    fixedIncome: ['corp_bond_6m', 'infra_bond_12m'],
    propertyTypes: ['rental', 'commercial'],
    businessCategories: ['Wellness', 'Local Services'],
  },
  engineer: {
    stocks: ['NVDAX', 'VLTG', 'TRNS'],
    crypto: ['BTCX', 'ETHX'],
    fixedIncome: ['t_bill_3m', 'infra_bond_12m'],
    propertyTypes: ['commercial', 'rental'],
    businessCategories: ['Clean Tech', 'Automotive', 'Automated Infrastructure'],
  },
  government_employee: {
    stocks: ['VLTG', 'RVRB', 'TRNS'],
    crypto: [],
    fixedIncome: ['hy_savings', 't_bill_3m', 'infra_bond_12m'],
    propertyTypes: ['residential', 'rental'],
    businessCategories: ['Local Services', 'Automated Retail'],
  },
  business_owner: {
    stocks: ['APEX', 'TRNS', 'RVRB'],
    crypto: ['BTCX', 'SOLX'],
    fixedIncome: ['corp_bond_6m'],
    propertyTypes: ['commercial', 'rental'],
    businessCategories: ['Food & Beverage', 'Automated Retail', 'Direct-to-Consumer', 'Automotive'],
  },
  office_clerk: {
    stocks: ['RVRB', 'VLTG'],
    crypto: ['SOLX'],
    fixedIncome: ['hy_savings', 't_bill_3m'],
    propertyTypes: ['residential', 'rental'],
    businessCategories: ['Local Services', 'Automated Retail'],
  },
  software_developer: {
    stocks: ['NVDAX', 'CLDF'],
    crypto: ['BTCX', 'ETHX', 'SOLX'],
    fixedIncome: ['hy_savings'],
    propertyTypes: ['rental'],
    businessCategories: ['Digital Software', 'Direct-to-Consumer', 'Automated Infrastructure'],
  },
  lawyer: {
    stocks: ['APEX', 'GOLDM', 'HLTH'],
    crypto: ['BTCX'],
    fixedIncome: ['corp_bond_6m', 'infra_bond_12m'],
    propertyTypes: ['commercial', 'residential'],
    businessCategories: ['Food & Beverage', 'Wellness'],
  },
  banker: {
    stocks: ['APEX', 'TRNS', 'GOLDM'],
    crypto: ['BTCX', 'ETHX'],
    fixedIncome: ['t_bill_3m', 'corp_bond_6m', 'infra_bond_12m'],
    propertyTypes: ['commercial', 'rental'],
    businessCategories: ['Clean Tech', 'Automated Infrastructure'],
  },
  freelancer: {
    stocks: ['CLDF', 'NVDAX', 'RVRB'],
    crypto: ['ETHX', 'SOLX', 'VLTX'],
    fixedIncome: ['hy_savings'],
    propertyTypes: ['residential', 'rental'],
    businessCategories: ['Digital Software', 'Direct-to-Consumer', 'Food & Beverage'],
  },
};

export function getProfessionAffinity(professionId: string): ProfessionAffinity {
  return PROFESSION_AFFINITIES[professionId] ?? PROFESSION_AFFINITIES.teacher;
}

export function isStockMatchedForProfession(professionId: string, symbol: string): boolean {
  return getProfessionAffinity(professionId).stocks.includes(symbol);
}

export function isCryptoMatchedForProfession(professionId: string, symbol: string): boolean {
  return getProfessionAffinity(professionId).crypto.includes(symbol);
}

export function isFixedIncomeMatchedForProfession(
  professionId: string,
  productId: string
): boolean {
  return getProfessionAffinity(professionId).fixedIncome.includes(productId);
}

export function isPropertyMatchedForProfession(
  professionId: string,
  propertyType: PropertyType
): boolean {
  return getProfessionAffinity(professionId).propertyTypes.includes(propertyType);
}

export function isBusinessMatchedForProfession(
  professionId: string,
  category: string
): boolean {
  return getProfessionAffinity(professionId).businessCategories.includes(category);
}

export function getHappinessItemName(item: HappinessItem, lang: LanguageCode): string {
  return lang === 'bn' ? item.nameBn : item.nameEn;
}

export function getHappinessCardDescription(item: HappinessItem, lang: LanguageCode): string {
  const tpl = item.templateId ?? item.id;
  if (tpl === 'pilgrimage_umrah') {
    return lang === 'bn'
      ? 'ওমরা হজ। পবিত্র মক্কা ও মদিনায় আধ্যাত্মিক সফর এবং হৃদয়ে গভীর প্রশান্তি।'
      : 'Umrah Pilgrimage. A spiritual journey to Makkah and Madinah bringing deep peace and joy.';
  }
  if (tpl === 'pilgrimage_hajj') {
    return lang === 'bn'
      ? 'বড় হজ। জীবনের শ্রেষ্ঠ আধ্যাত্মিক সফর ও আত্মিক পরিপূর্ণতার অমূল্য অভিজ্ঞতা।'
      : 'Major Hajj Pilgrimage. A once-in-a-lifetime spiritual milestone of faith and fulfillment.';
  }
  const name = getHappinessItemName(item, lang);
  return lang === 'bn'
    ? `${name}। ব্যস্ত জীবনের ক্লান্তি কাটিয়ে মানসিক প্রশান্তি ও আনন্দ বাড়ানোর দারুণ সুযোগ।`
    : `${name}. Take a refreshing break from work to recharge and boost your happiness.`;
}

export function getInsurancePlanName(plan: InsurancePlan, lang: LanguageCode): string {
  return lang === 'bn' ? plan.nameBn : plan.nameEn;
}

export type { CharacterVenture };

export const CHARACTER_VENTURES: Record<string, CharacterVenture[]> = {
  teacher: [
    {
      id: 'teacher_notes',
      titleEn: 'Exam Prep Booklets',
      titleBn: 'পরীক্ষার নোট প্রকাশনা',
      cost: 400,
      winChance: 0.62,
      minNetProfit: 450,
      maxNetProfit: 1150,
    },
    {
      id: 'teacher_camp',
      titleEn: 'Weekend Study Camp',
      titleBn: 'সাপ্তাহিক কোচিং ক্যাম্প',
      cost: 900,
      winChance: 0.56,
      minNetProfit: 1000,
      maxNetProfit: 2400,
    },
    {
      id: 'teacher_course',
      titleEn: 'Recorded Video Course Batch',
      titleBn: 'অনলাইন ভিডিও কোর্স ব্যাচ',
      cost: 650,
      winChance: 0.59,
      minNetProfit: 750,
      maxNetProfit: 1850,
    },
    {
      id: 'teacher_fair',
      titleEn: 'Local Book Fair Stall',
      titleBn: 'আঞ্চলিক বইমেলা স্টল',
      cost: 1150,
      winChance: 0.53,
      minNetProfit: 1350,
      maxNetProfit: 3100,
    },
  ],
  doctor: [
    {
      id: 'doctor_camp',
      titleEn: 'Telehealth Clinic Pop-Up',
      titleBn: 'টেলিমেডিসিন ক্যাম্প',
      cost: 800,
      winChance: 0.6,
      minNetProfit: 950,
      maxNetProfit: 2250,
    },
    {
      id: 'doctor_import',
      titleEn: 'Diagnostic Kit Batch',
      titleBn: 'চিকিৎসা সরঞ্জাম চালান',
      cost: 1600,
      winChance: 0.54,
      minNetProfit: 1900,
      maxNetProfit: 4300,
    },
    {
      id: 'doctor_screening',
      titleEn: 'Corporate Health Screening',
      titleBn: 'কর্পোরেট স্বাস্থ্য পরীক্ষা ক্যাম্প',
      cost: 1200,
      winChance: 0.58,
      minNetProfit: 1400,
      maxNetProfit: 3300,
    },
    {
      id: 'doctor_lab',
      titleEn: 'Mobile Lab Partnership',
      titleBn: 'ভ্রাম্যমাণ ডায়াগনস্টিক প্রকল্প',
      cost: 2100,
      winChance: 0.51,
      minNetProfit: 2500,
      maxNetProfit: 5600,
    },
  ],
  engineer: [
    {
      id: 'eng_proto',
      titleEn: '3D Prototype Run',
      titleBn: 'প্রোটোটাইপ ৩ডি প্রিন্ট',
      cost: 650,
      winChance: 0.6,
      minNetProfit: 750,
      maxNetProfit: 1900,
    },
    {
      id: 'eng_solar',
      titleEn: 'Solar Micro-Grid Kit',
      titleBn: 'সোলার মিনি-গ্রিড প্রজেক্ট',
      cost: 1400,
      winChance: 0.55,
      minNetProfit: 1650,
      maxNetProfit: 3750,
    },
    {
      id: 'eng_audit',
      titleEn: 'Factory Energy Audit',
      titleBn: 'কারখানা বিদ্যুৎ সাশ্রয় নিরীক্ষা',
      cost: 950,
      winChance: 0.59,
      minNetProfit: 1100,
      maxNetProfit: 2650,
    },
    {
      id: 'eng_iot',
      titleEn: 'Smart Sensor Hardware Batch',
      titleBn: 'স্মার্ট সেন্সর যন্ত্রাংশ ব্যাচ',
      cost: 1850,
      winChance: 0.52,
      minNetProfit: 2200,
      maxNetProfit: 4950,
    },
  ],
  government_employee: [
    {
      id: 'govt_supply',
      titleEn: 'Agri Co-op Supply Lot',
      titleBn: 'কৃষি সমবায় পণ্য সরবরাহ',
      cost: 500,
      winChance: 0.62,
      minNetProfit: 580,
      maxNetProfit: 1420,
    },
    {
      id: 'govt_stall',
      titleEn: 'Trade Fair Stall Lease',
      titleBn: 'বাণিজ্য মেলা স্টল বরাদ্দ',
      cost: 1100,
      winChance: 0.56,
      minNetProfit: 1250,
      maxNetProfit: 2950,
    },
    {
      id: 'govt_fishery',
      titleEn: 'Seasonal Hatchery Share',
      titleBn: 'মৌসুমী মৎস্য খামার অংশীদারিত্ব',
      cost: 750,
      winChance: 0.59,
      minNetProfit: 900,
      maxNetProfit: 2100,
    },
    {
      id: 'govt_transport',
      titleEn: 'Shuttle Van Syndicate Slot',
      titleBn: 'যাত্রীবাহী পরিবহন অংশীদারিত্ব',
      cost: 1500,
      winChance: 0.53,
      minNetProfit: 1750,
      maxNetProfit: 3900,
    },
  ],
  business_owner: [
    {
      id: 'biz_flip',
      titleEn: 'Wholesale Stock Flip',
      titleBn: 'পাইকারি পণ্য ফ্লিপ',
      cost: 900,
      winChance: 0.58,
      minNetProfit: 1050,
      maxNetProfit: 2650,
    },
    {
      id: 'biz_kiosk',
      titleEn: 'Festival Pop-Up Stall',
      titleBn: 'উৎসব পপ-আপ স্টল',
      cost: 1800,
      winChance: 0.54,
      minNetProfit: 2100,
      maxNetProfit: 4900,
    },
    {
      id: 'biz_import',
      titleEn: 'Seasonal Import Container Lot',
      titleBn: 'মৌসুমী আমদানি পণ্যের লট',
      cost: 1400,
      winChance: 0.55,
      minNetProfit: 1700,
      maxNetProfit: 4000,
    },
    {
      id: 'biz_catering',
      titleEn: 'Corporate Event Catering Bid',
      titleBn: 'কর্পোরেট অনুষ্ঠান ক্যাটারিং চুক্তি',
      cost: 2200,
      winChance: 0.51,
      minNetProfit: 2600,
      maxNetProfit: 5900,
    },
  ],
  office_clerk: [
    {
      id: 'clerk_print',
      titleEn: 'Office Stationery Lot',
      titleBn: 'অফিস স্টেশনারি অর্ডার',
      cost: 350,
      winChance: 0.62,
      minNetProfit: 400,
      maxNetProfit: 1020,
    },
    {
      id: 'clerk_data',
      titleEn: 'Archive Digitization Bid',
      titleBn: 'ডিজিটাল আর্কাইভ চুক্তি',
      cost: 750,
      winChance: 0.57,
      minNetProfit: 880,
      maxNetProfit: 2050,
    },
    {
      id: 'clerk_parcel',
      titleEn: 'Neighborhood Courier Drop Point',
      titleBn: 'স্থানীয় পার্সেল ডেলিভারি পয়েন্ট',
      cost: 550,
      winChance: 0.6,
      minNetProfit: 650,
      maxNetProfit: 1550,
    },
    {
      id: 'clerk_gift',
      titleEn: 'Festival Gift Hamper Batch',
      titleBn: 'উৎসব উপহার বক্স সরবরাহ',
      cost: 950,
      winChance: 0.53,
      minNetProfit: 1150,
      maxNetProfit: 2600,
    },
  ],
  software_developer: [
    {
      id: 'dev_plugin',
      titleEn: 'Micro-App Launch',
      titleBn: 'মাইক্রো-অ্যাপ লঞ্চ',
      cost: 600,
      winChance: 0.58,
      minNetProfit: 800,
      maxNetProfit: 2150,
    },
    {
      id: 'dev_assets',
      titleEn: 'Digital Theme Pack',
      titleBn: 'ডিজিটাল থিম প্যাক',
      cost: 1300,
      winChance: 0.52,
      minNetProfit: 1650,
      maxNetProfit: 4250,
    },
    {
      id: 'dev_bot',
      titleEn: 'Automation Script Bundle',
      titleBn: 'স্বয়ংক্রিয় টুল প্যাকেজ',
      cost: 850,
      winChance: 0.56,
      minNetProfit: 1050,
      maxNetProfit: 2700,
    },
    {
      id: 'dev_hack',
      titleEn: 'Enterprise Audit Bounty',
      titleBn: 'সফটওয়্যার নিরাপত্তা নিরীক্ষা',
      cost: 1650,
      winChance: 0.5,
      minNetProfit: 2100,
      maxNetProfit: 5200,
    },
  ],
  lawyer: [
    {
      id: 'law_templates',
      titleEn: 'Legal Contract Kit',
      titleBn: 'আইনি চুক্তিপত্র বান্ডেল',
      cost: 700,
      winChance: 0.6,
      minNetProfit: 850,
      maxNetProfit: 2150,
    },
    {
      id: 'law_syndicate',
      titleEn: 'Arbitration Syndicate',
      titleBn: 'সালিশি সহ-বিনিয়োগ',
      cost: 1700,
      winChance: 0.54,
      minNetProfit: 2000,
      maxNetProfit: 4650,
    },
    {
      id: 'law_registry',
      titleEn: 'Land Title Due Diligence Lot',
      titleBn: 'জমি দলিল যাচাই প্রকল্প',
      cost: 1100,
      winChance: 0.58,
      minNetProfit: 1300,
      maxNetProfit: 3100,
    },
    {
      id: 'law_ip',
      titleEn: 'Trademark Filing Batch',
      titleBn: 'ট্রেডমার্ক নিবন্ধন প্যাকেজ',
      cost: 1950,
      winChance: 0.52,
      minNetProfit: 2400,
      maxNetProfit: 5400,
    },
  ],
  banker: [
    {
      id: 'bank_invoice',
      titleEn: 'Short Trade Invoice Flip',
      titleBn: 'স্বল্পমেয়াদী ইনভয়েস ট্রেড',
      cost: 850,
      winChance: 0.59,
      minNetProfit: 1000,
      maxNetProfit: 2450,
    },
    {
      id: 'bank_arb',
      titleEn: 'Allocation Arbitrage',
      titleBn: 'শেয়ার অ্যালোকেশন ট্রেড',
      cost: 1600,
      winChance: 0.54,
      minNetProfit: 1850,
      maxNetProfit: 4550,
    },
    {
      id: 'bank_fx',
      titleEn: 'Treasury Spread Opportunity',
      titleBn: 'মুদ্রা বিনিময় স্প্রেড সুযোগ',
      cost: 1200,
      winChance: 0.56,
      minNetProfit: 1450,
      maxNetProfit: 3450,
    },
    {
      id: 'bank_ipo',
      titleEn: 'Pre-Listing Bridge Lot',
      titleBn: 'প্রাক-তালিকাভুক্ত শেয়ার লট',
      cost: 2100,
      winChance: 0.5,
      minNetProfit: 2600,
      maxNetProfit: 6000,
    },
  ],
  freelancer: [
    {
      id: 'free_uikit',
      titleEn: 'Design Asset Drop',
      titleBn: 'ডিজাইন রিসোর্স প্যাক',
      cost: 400,
      winChance: 0.61,
      minNetProfit: 520,
      maxNetProfit: 1380,
    },
    {
      id: 'free_campaign',
      titleEn: 'Ad Campaign Sprint',
      titleBn: 'বিজ্ঞাপন ক্যাম্পেইন চুক্তি',
      cost: 950,
      winChance: 0.55,
      minNetProfit: 1150,
      maxNetProfit: 2900,
    },
    {
      id: 'free_rebrand',
      titleEn: 'Startup Brand Pitch Pack',
      titleBn: 'স্টার্টআপ ব্র্যান্ডিং প্যাকেজ',
      cost: 650,
      winChance: 0.58,
      minNetProfit: 780,
      maxNetProfit: 1950,
    },
    {
      id: 'free_merch',
      titleEn: 'Limited Apparel Drop',
      titleBn: 'সীমিত সংস্করণ পোশাক লট',
      cost: 1250,
      winChance: 0.52,
      minNetProfit: 1550,
      maxNetProfit: 3650,
    },
  ],
};

function randomizeVentureTemplate(tpl: CharacterVenture): CharacterVenture {
  const cost = Math.max(150, Math.round((tpl.cost * randomRange(0.72, 1.35)) / 50) * 50);
  const winChance = Number(randomRange(0.46, 0.65).toFixed(2));
  const minNetProfit = Math.max(
    cost,
    Math.round((cost * randomRange(1.05, 1.45)) / 50) * 50
  );
  const maxNetProfit = Math.max(
    minNetProfit + 200,
    Math.round((cost * randomRange(2.15, 3.35)) / 50) * 50
  );
  return {
    ...tpl,
    id: uid(tpl.id),
    templateId: tpl.templateId ?? tpl.id,
    cost,
    winChance,
    minNetProfit,
    maxNetProfit,
  };
}

export function getVenturesForProfession(professionId: string): CharacterVenture[] {
  return CHARACTER_VENTURES[professionId] ?? CHARACTER_VENTURES.teacher;
}

export function rollVenturesForProfession(
  professionId: string,
  count = 2
): CharacterVenture[] {
  const pool = getVenturesForProfession(professionId);
  return shuffleArray(pool).slice(0, count).map(randomizeVentureTemplate);
}

export function rollSingleVenture(
  professionId: string,
  excludeTemplateIds: string[] = []
): CharacterVenture {
  const pool = getVenturesForProfession(professionId);
  const excludeSet = new Set(excludeTemplateIds);
  const freshPool = pool.filter((v) => !excludeSet.has(v.templateId ?? v.id));
  const chosen = randomPick(freshPool.length > 0 ? freshPool : pool);
  return randomizeVentureTemplate(chosen);
}

export function getVentureTitle(venture: CharacterVenture, lang: LanguageCode): string {
  return lang === 'bn' ? venture.titleBn : venture.titleEn;
}

export const PERSONAL_ASSETS: PersonalAssetCatalogItem[] = [
  {
    id: 'car',
    nameEn: 'Personal Car',
    nameBn: 'নিজের গাড়ি',
    basePrice: 14000,
    yearlyHappinessPenalty: 2,
    monthlyInsurance: 140,
    accidentLossMinPct: 0.14,
    accidentLossMaxPct: 0.24,
    accidentHappinessLoss: 8,
    buyHappinessBonus: 5,
  },
  {
    id: 'house',
    nameEn: 'Own House',
    nameBn: 'নিজের বাড়ি',
    basePrice: 45000,
    yearlyHappinessPenalty: 3,
    monthlyInsurance: 260,
    accidentLossMinPct: 0.1,
    accidentLossMaxPct: 0.19,
    accidentHappinessLoss: 11,
    buyHappinessBonus: 7,
  },
  {
    id: 'yacht',
    nameEn: 'Private Yacht',
    nameBn: 'ব্যক্তিগত ইয়ট',
    basePrice: 95000,
    yearlyHappinessPenalty: 2,
    monthlyInsurance: 480,
    accidentLossMinPct: 0.12,
    accidentLossMaxPct: 0.22,
    accidentHappinessLoss: 12,
    buyHappinessBonus: 8,
  },
  {
    id: 'villa',
    nameEn: 'Island Villa',
    nameBn: 'অবকাশ ভিলা',
    basePrice: 160000,
    yearlyHappinessPenalty: 2,
    monthlyInsurance: 650,
    accidentLossMinPct: 0.1,
    accidentLossMaxPct: 0.18,
    accidentHappinessLoss: 12,
    buyHappinessBonus: 8,
  },
];

export function getPersonalAssetById(id: PersonalAssetId): PersonalAssetCatalogItem {
  return PERSONAL_ASSETS.find((p) => p.id === id) ?? PERSONAL_ASSETS[0];
}

export function getPersonalAssetName(
  item: { nameEn: string; nameBn: string },
  lang: LanguageCode
): string {
  return lang === 'bn' ? item.nameBn : item.nameEn;
}

export function getEffectivePersonalAssetPrice(
  item: PersonalAssetCatalogItem,
  state: Pick<GameState, 'inflationMultiplier'>
): number {
  const inf = state.inflationMultiplier ?? 1;
  return Math.max(1000, Math.round((item.basePrice * inf) / 500) * 500);
}

export function getEffectivePersonalAssetInsurance(
  item: PersonalAssetCatalogItem,
  state: Pick<GameState, 'inflationMultiplier'>
): number {
  const inf = state.inflationMultiplier ?? 1;
  return Math.max(50, Math.round((item.monthlyInsurance * inf) / 10) * 10);
}

export function getAnnualMissingAssetsPenalty(owned: OwnedPersonalAsset[] = []): number {
  const ownedSet = new Set(owned.map((o) => o.id));
  return PERSONAL_ASSETS.reduce(
    (sum, item) => (ownedSet.has(item.id) ? sum : sum + item.yearlyHappinessPenalty),
    0
  );
}

export const LOTTERY_TICKETS: LotteryTicketDef[] = [
  {
    id: 'scratch_25',
    nameEn: 'Lucky Scratch Card',
    nameBn: 'সাপ্তাহিক স্ক্র্যাচ টিকিট',
    cost: 25,
    jackpotMin: 5000,
    jackpotMax: 12000,
    bigWinMin: 300,
    bigWinMax: 1200,
    smallWinMin: 60,
    smallWinMax: 180,
    jackpotChance: 0.006,
    bigWinChance: 0.035,
    smallWinChance: 0.075,
    jackpotHappinessBonus: 10,
  },
  {
    id: 'national_75',
    nameEn: 'National Luck Draw',
    nameBn: 'জাতীয় ভাগ্য লটারি',
    cost: 75,
    jackpotMin: 45000,
    jackpotMax: 110000,
    bigWinMin: 3500,
    bigWinMax: 14000,
    smallWinMin: 250,
    smallWinMax: 900,
    jackpotChance: 0.004,
    bigWinChance: 0.025,
    smallWinChance: 0.06,
    jackpotHappinessBonus: 15,
  },
  {
    id: 'grand_200',
    nameEn: 'Grand Fortune Jackpot',
    nameBn: 'মহাভাগ্য জ্যাকপট টিকিট',
    cost: 200,
    jackpotMin: 120000,
    jackpotMax: 300000,
    bigWinMin: 15000,
    bigWinMax: 45000,
    smallWinMin: 800,
    smallWinMax: 2500,
    jackpotChance: 0.005,
    bigWinChance: 0.02,
    smallWinChance: 0.05,
    jackpotHappinessBonus: 18,
  },
];

export function getLotteryTicketById(id: LotteryTicketId): LotteryTicketDef {
  return LOTTERY_TICKETS.find((t) => t.id === id) ?? LOTTERY_TICKETS[0];
}

export function getLotteryTicketName(
  ticket: { nameEn: string; nameBn: string },
  lang: LanguageCode
): string {
  return lang === 'bn' ? ticket.nameBn : ticket.nameEn;
}

export const PROFESSION_EDUCATION_COURSES: Record<string, EducationCourse[]> = {
  teacher: [
    { id: 'tea_edu_1', tier: 1, titleEn: 'Online Course', titleBn: 'অনলাইন কোর্স', cost: 1000, minSalaryBoostPct: 6, maxSalaryBoostPct: 12 },
    { id: 'tea_edu_2', tier: 2, titleEn: 'Higher Education', titleBn: 'উচ্চশিক্ষা', cost: 1800, minSalaryBoostPct: 8, maxSalaryBoostPct: 15 },
    { id: 'tea_edu_3', tier: 3, titleEn: 'Postgraduate Degree', titleBn: 'স্নাতকোত্তর ডিগ্রি', cost: 2600, minSalaryBoostPct: 10, maxSalaryBoostPct: 18 },
    { id: 'tea_edu_4', tier: 4, titleEn: 'Experience Exchange', titleBn: 'অভিজ্ঞতা বিনিময়', cost: 3400, minSalaryBoostPct: 12, maxSalaryBoostPct: 20 },
    { id: 'tea_edu_5', tier: 5, titleEn: 'MBA', titleBn: 'এমবিএ', cost: 4500, minSalaryBoostPct: 15, maxSalaryBoostPct: 24 },
  ],
  doctor: [
    { id: 'doc_edu_1', tier: 1, titleEn: 'Telemedicine Course', titleBn: 'টেলিমেডিসিন কোর্স', cost: 2200, minSalaryBoostPct: 6, maxSalaryBoostPct: 12 },
    { id: 'doc_edu_2', tier: 2, titleEn: 'Diagnostic Fellowship', titleBn: 'ডায়াগনস্টিক উচ্চশিক্ষা', cost: 3800, minSalaryBoostPct: 8, maxSalaryBoostPct: 15 },
    { id: 'doc_edu_3', tier: 3, titleEn: 'MD Postgraduate Degree', titleBn: 'এমডি স্নাতকোত্তর ডিগ্রি', cost: 5600, minSalaryBoostPct: 10, maxSalaryBoostPct: 18 },
    { id: 'doc_edu_4', tier: 4, titleEn: 'Medical Exchange', titleBn: 'চিকিৎসা অভিজ্ঞতা বিনিময়', cost: 7200, minSalaryBoostPct: 12, maxSalaryBoostPct: 20 },
    { id: 'doc_edu_5', tier: 5, titleEn: 'Healthcare MBA', titleBn: 'হেলথকেয়ার এমবিএ', cost: 9200, minSalaryBoostPct: 15, maxSalaryBoostPct: 24 },
  ],
  engineer: [
    { id: 'eng_edu_1', tier: 1, titleEn: 'Automation Online Course', titleBn: 'অটোমেশন অনলাইন কোর্স', cost: 1400, minSalaryBoostPct: 6, maxSalaryBoostPct: 12 },
    { id: 'eng_edu_2', tier: 2, titleEn: 'PE Higher Certification', titleBn: 'প্রকৌশল উচ্চশিক্ষা', cost: 2400, minSalaryBoostPct: 8, maxSalaryBoostPct: 15 },
    { id: 'eng_edu_3', tier: 3, titleEn: 'M.Sc. Engineering', titleBn: 'ইঞ্জিনিয়ারিং স্নাতকোত্তর', cost: 3600, minSalaryBoostPct: 10, maxSalaryBoostPct: 18 },
    { id: 'eng_edu_4', tier: 4, titleEn: 'Industrial Exchange', titleBn: 'শিল্প অভিজ্ঞতা বিনিময়', cost: 4800, minSalaryBoostPct: 12, maxSalaryBoostPct: 20 },
    { id: 'eng_edu_5', tier: 5, titleEn: 'Technical MBA', titleBn: 'টেকনিক্যাল এমবিএ', cost: 6200, minSalaryBoostPct: 15, maxSalaryBoostPct: 24 },
  ],
  government_employee: [
    { id: 'gov_edu_1', tier: 1, titleEn: 'Digital Governance Course', titleBn: 'ই-গভর্ন্যান্স কোর্স', cost: 1000, minSalaryBoostPct: 6, maxSalaryBoostPct: 12 },
    { id: 'gov_edu_2', tier: 2, titleEn: 'Higher Policy Studies', titleBn: 'জনপ্রশাসনে উচ্চশিক্ষা', cost: 1800, minSalaryBoostPct: 8, maxSalaryBoostPct: 15 },
    { id: 'gov_edu_3', tier: 3, titleEn: 'MPA Postgraduate Degree', titleBn: 'এমপিএ স্নাতকোত্তর ডিগ্রি', cost: 2700, minSalaryBoostPct: 10, maxSalaryBoostPct: 18 },
    { id: 'gov_edu_4', tier: 4, titleEn: 'Administrative Exchange', titleBn: 'প্রশাসনিক অভিজ্ঞতা বিনিময়', cost: 3500, minSalaryBoostPct: 12, maxSalaryBoostPct: 20 },
    { id: 'gov_edu_5', tier: 5, titleEn: 'Executive Public MBA', titleBn: 'এক্সিকিউটিভ এমবিএ', cost: 4600, minSalaryBoostPct: 15, maxSalaryBoostPct: 24 },
  ],
  business_owner: [
    { id: 'biz_edu_1', tier: 1, titleEn: 'Digital Commerce Course', titleBn: 'ডিজিটাল মার্কেটিং কোর্স', cost: 1600, minSalaryBoostPct: 6, maxSalaryBoostPct: 12 },
    { id: 'biz_edu_2', tier: 2, titleEn: 'Supply Chain Studies', titleBn: 'সাপ্লাই চেইন উচ্চশিক্ষা', cost: 2800, minSalaryBoostPct: 8, maxSalaryBoostPct: 15 },
    { id: 'biz_edu_3', tier: 3, titleEn: 'Postgraduate Management', titleBn: 'ব্যবসায়িক স্নাতকোত্তর ডিগ্রি', cost: 4200, minSalaryBoostPct: 10, maxSalaryBoostPct: 18 },
    { id: 'biz_edu_4', tier: 4, titleEn: 'Trade Experience Exchange', titleBn: 'বাণিজ্য অভিজ্ঞতা বিনিময়', cost: 5400, minSalaryBoostPct: 12, maxSalaryBoostPct: 20 },
    { id: 'biz_edu_5', tier: 5, titleEn: 'Executive MBA', titleBn: 'এক্সিকিউটিভ এমবিএ', cost: 7000, minSalaryBoostPct: 15, maxSalaryBoostPct: 24 },
  ],
  office_clerk: [
    { id: 'clk_edu_1', tier: 1, titleEn: 'Office Systems Course', titleBn: 'অফিস ও এক্সেল কোর্স', cost: 800, minSalaryBoostPct: 6, maxSalaryBoostPct: 12 },
    { id: 'clk_edu_2', tier: 2, titleEn: 'Higher Accounting Study', titleBn: 'হিসাববিজ্ঞানে উচ্চশিক্ষা', cost: 1400, minSalaryBoostPct: 8, maxSalaryBoostPct: 15 },
    { id: 'clk_edu_3', tier: 3, titleEn: 'Postgraduate Admin', titleBn: 'প্রশাসনে স্নাতকোত্তর ডিগ্রি', cost: 2100, minSalaryBoostPct: 10, maxSalaryBoostPct: 18 },
    { id: 'clk_edu_4', tier: 4, titleEn: 'Corporate Desk Exchange', titleBn: 'কর্মক্ষেত্র অভিজ্ঞতা বিনিময়', cost: 2800, minSalaryBoostPct: 12, maxSalaryBoostPct: 20 },
    { id: 'clk_edu_5', tier: 5, titleEn: 'Business MBA', titleBn: 'এমবিএ', cost: 3600, minSalaryBoostPct: 15, maxSalaryBoostPct: 24 },
  ],
  software_developer: [
    { id: 'dev_edu_1', tier: 1, titleEn: 'Cloud & AI Online Course', titleBn: 'ক্লাউড ও এআই কোর্স', cost: 1700, minSalaryBoostPct: 6, maxSalaryBoostPct: 12 },
    { id: 'dev_edu_2', tier: 2, titleEn: 'Systems Architecture Study', titleBn: 'সিস্টেম আর্কিটেকচার উচ্চশিক্ষা', cost: 3000, minSalaryBoostPct: 8, maxSalaryBoostPct: 15 },
    { id: 'dev_edu_3', tier: 3, titleEn: 'M.Sc. Computer Science', titleBn: 'সিএস স্নাতকোত্তর ডিগ্রি', cost: 4400, minSalaryBoostPct: 10, maxSalaryBoostPct: 18 },
    { id: 'dev_edu_4', tier: 4, titleEn: 'Global Tech Exchange', titleBn: 'টেক অভিজ্ঞতা বিনিময়', cost: 5800, minSalaryBoostPct: 12, maxSalaryBoostPct: 20 },
    { id: 'dev_edu_5', tier: 5, titleEn: 'Tech Product MBA', titleBn: 'টেক প্রোডাক্ট এমবিএ', cost: 7500, minSalaryBoostPct: 15, maxSalaryBoostPct: 24 },
  ],
  lawyer: [
    { id: 'law_edu_1', tier: 1, titleEn: 'Legal Drafting Course', titleBn: 'আইনি ড্রাফটিং কোর্স', cost: 2000, minSalaryBoostPct: 6, maxSalaryBoostPct: 12 },
    { id: 'law_edu_2', tier: 2, titleEn: 'Higher Corporate Law', titleBn: 'কর্পোরেট আইনে উচ্চশিক্ষা', cost: 3400, minSalaryBoostPct: 8, maxSalaryBoostPct: 15 },
    { id: 'law_edu_3', tier: 3, titleEn: 'LL.M. Postgraduate Degree', titleBn: 'এলএল.এম স্নাতকোত্তর ডিগ্রি', cost: 5000, minSalaryBoostPct: 10, maxSalaryBoostPct: 18 },
    { id: 'law_edu_4', tier: 4, titleEn: 'Bar Council Exchange', titleBn: 'আইনি অভিজ্ঞতা বিনিময়', cost: 6600, minSalaryBoostPct: 12, maxSalaryBoostPct: 20 },
    { id: 'law_edu_5', tier: 5, titleEn: 'Law & Finance MBA', titleBn: 'কর ও কর্পোরেট এমবিএ', cost: 8400, minSalaryBoostPct: 15, maxSalaryBoostPct: 24 },
  ],
  banker: [
    { id: 'bnk_edu_1', tier: 1, titleEn: 'Financial Modeling Course', titleBn: 'ফাইন্যান্সিয়াল মডেলিং কোর্স', cost: 1600, minSalaryBoostPct: 6, maxSalaryBoostPct: 12 },
    { id: 'bnk_edu_2', tier: 2, titleEn: 'CFA Higher Studies', titleBn: 'সিএফএ উচ্চশিক্ষা', cost: 2900, minSalaryBoostPct: 8, maxSalaryBoostPct: 15 },
    { id: 'bnk_edu_3', tier: 3, titleEn: 'M.Sc. in Finance', titleBn: 'ফাইন্যান্সে স্নাতকোত্তর ডিগ্রি', cost: 4300, minSalaryBoostPct: 10, maxSalaryBoostPct: 18 },
    { id: 'bnk_edu_4', tier: 4, titleEn: 'Global Banking Exchange', titleBn: 'ব্যাংকিং অভিজ্ঞতা বিনিময়', cost: 5600, minSalaryBoostPct: 12, maxSalaryBoostPct: 20 },
    { id: 'bnk_edu_5', tier: 5, titleEn: 'Finance MBA', titleBn: 'ফাইন্যান্স এমবিএ', cost: 7200, minSalaryBoostPct: 15, maxSalaryBoostPct: 24 },
  ],
  freelancer: [
    { id: 'frl_edu_1', tier: 1, titleEn: 'UI/UX Online Course', titleBn: 'ডিজাইন অনলাইন কোর্স', cost: 1100, minSalaryBoostPct: 6, maxSalaryBoostPct: 12 },
    { id: 'frl_edu_2', tier: 2, titleEn: 'Higher Brand Strategy', titleBn: 'ব্র্যান্ড স্ট্র্যাটেজি উচ্চশিক্ষা', cost: 1900, minSalaryBoostPct: 8, maxSalaryBoostPct: 15 },
    { id: 'frl_edu_3', tier: 3, titleEn: 'Postgraduate Digital Media', titleBn: 'ডিজিটাল মিডিয়ায় স্নাতকোত্তর', cost: 2800, minSalaryBoostPct: 10, maxSalaryBoostPct: 18 },
    { id: 'frl_edu_4', tier: 4, titleEn: 'Global Studio Exchange', titleBn: 'ক্রিয়েটিভ অভিজ্ঞতা বিনিময়', cost: 3700, minSalaryBoostPct: 12, maxSalaryBoostPct: 20 },
    { id: 'frl_edu_5', tier: 5, titleEn: 'Creative Business MBA', titleBn: 'বিজনেস ও মার্কেটিং এমবিএ', cost: 4800, minSalaryBoostPct: 15, maxSalaryBoostPct: 24 },
  ],
};

export function getEducationCoursesForProfession(professionId: string): EducationCourse[] {
  return PROFESSION_EDUCATION_COURSES[professionId] ?? PROFESSION_EDUCATION_COURSES.teacher;
}

export function getEducationCourseTitle(
  course: { titleEn: string; titleBn: string },
  lang: LanguageCode
): string {
  return lang === 'bn' ? course.titleBn : course.titleEn;
}

export function getEffectiveEducationCost(
  course: { cost: number },
  state: Pick<GameState, 'inflationMultiplier'>
): number {
  const inf = state.inflationMultiplier ?? 1;
  return Math.max(200, Math.round((course.cost * inf) / 50) * 50);
}



