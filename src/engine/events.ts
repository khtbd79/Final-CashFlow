import { EVENT_POOL, EventTemplate, getCharacterSignatureConfig } from '../data/events';
import { STOCK_CATALOG } from '../data/markets';
import { getProfessionById } from '../data/professions';
import { EventChoice, GameEventCard, MaritalStatus, MarketState } from '../types/game';
import {
  formatCurrency,
  randomFloat,
  randomInt,
  randomPick,
  randomRange,
  roundMoney,
  uid,
} from './prng';

export interface TurnEventContext {
  professionId?: string;
  cash: number;
  passiveIncome: number;
  totalExpenses: number;
  netWorth: number;
  assetsCount: number;
  propertiesCount: number;
  activeAnnualTemplateIds?: string[];
}

function isTemplateEligible(
  t: EventTemplate,
  turn: number,
  maritalStatus: MaritalStatus,
  ctx?: TurnEventContext
): boolean {
  if (turn <= 1) {
    return t.category === 'opportunity';
  }

  const hasSolvency = ctx
    ? (ctx.cash >= 4000 &&
        (ctx.passiveIncome >= 150 || ctx.assetsCount >= 2 || ctx.netWorth >= 12000)) ||
      turn >= 8
    : turn >= 6;

  if (t.kind === 'new_baby') {
    return maritalStatus === 'married' && turn >= 5 && hasSolvency;
  }
  if (t.kind === 'divorce') {
    return maritalStatus === 'married' && turn >= 6 && (hasSolvency || turn >= 9);
  }
  if (t.kind === 'market_crash') {
    return false;
  }
  if (t.kind === 'property_boom') {
    return (ctx?.propertiesCount ?? 0) > 0 || turn >= 5;
  }
  if (t.kind === 'home_repair') {
    return (ctx?.propertiesCount ?? 0) > 0 || turn >= 4;
  }
  if (t.kind === 'salary_raise' || t.kind === 'promotion' || t.kind === 'salary_cut') {
    return turn >= 4;
  }
  if (t.kind === 'property_deal' || t.kind === 'business_deal') {
    return turn >= 3 || (ctx ? ctx.cash >= 6000 : false);
  }
  if (t.category === 'expense_emergency') {
    return turn >= 3;
  }
  return true;
}

function pickWeightedFromPool(pool: EventTemplate[]): EventTemplate {
  const totalWeight = pool.reduce((sum, t) => sum + t.weight, 0);
  let roll = randomFloat() * totalWeight;
  for (const item of pool) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return pool[0];
}

function pickWeightedTemplate(
  excludeIds: Set<string>,
  turn: number,
  maritalStatus: MaritalStatus = 'single',
  ctx?: TurnEventContext,
  durationFilter?: 'monthly' | 'annual'
): EventTemplate | null {
  const baseEligible = EVENT_POOL.filter((t) => {
    if (!isTemplateEligible(t, turn, maritalStatus, ctx)) return false;
    if (!durationFilter) return true;
    const tplDuration = t.durationType ?? 'monthly';
    return tplDuration === durationFilter;
  });
  const candidates = baseEligible.filter((t) => !excludeIds.has(t.id));
  const pool = candidates.length > 0 ? candidates : baseEligible;
  if (pool.length === 0) return null;
  return pickWeightedFromPool(pool);
}

export function buildCharacterSignatureOpportunityCard(
  professionId: string,
  turn: number,
  cash: number,
  netWorth: number,
  inflationMultiplier = 1
): GameEventCard {
  const cfg = getCharacterSignatureConfig(professionId);
  const prof = getProfessionById(professionId);
  const startCash = Math.max(4000, prof.initialCash);
  const moneyReference = Math.max(
    startCash,
    cash,
    Math.round(cash * 0.72 + Math.max(0, netWorth) * 0.28)
  );
  const growthRatio = moneyReference / startCash;
  const investCost = Math.max(
    100,
    Math.round((cfg.baseCost * Math.pow(growthRatio, 0.92) * inflationMultiplier) / 50) * 50
  );
  const minPayout = Math.round((investCost * (1 + cfg.minReturnPct / 100)) / 10) * 10;
  const maxPayout = Math.round((investCost * (1 + cfg.maxReturnPct / 100)) / 10) * 10;
  const minProfit = minPayout - investCost;
  const maxProfit = maxPayout - investCost;

  return {
    id: uid(`evt_t${turn}_${cfg.templateId}`),
    templateId: cfg.templateId,
    turnGenerated: turn,
    category: 'opportunity',
    durationType: 'monthly',
    remainingMonths: 1,
    expiresAtTurn: turn,
    isCharacterSignature: true,
    title: cfg.titleEn,
    description: `${cfg.descEn} (Invest ${formatCurrency(investCost)} · Expected net profit +${formatCurrency(minProfit)} to +${formatCurrency(maxProfit)}).`,
    financialImpactSummary: `Invest ${formatCurrency(investCost)} · Expected Return ${formatCurrency(minPayout)} - ${formatCurrency(maxPayout)}`,
    choices: [
      {
        id: 'fund_signature',
        label: `Invest ${formatCurrency(investCost)}`,
        description: `Expected return ${formatCurrency(minPayout)}–${formatCurrency(maxPayout)} in Turn Summary.`,
        effectType: 'venture_opportunity',
        amount: investCost,
        secondaryAmount: maxPayout,
        requiresCashCheck: true,
        tone: 'positive',
      },
      {
        id: 'decline',
        label: 'Pass',
        description: 'Skip this month and check again next month.',
        effectType: 'dismiss',
        tone: 'neutral',
      },
    ],
    resolved: false,
  };
}

function buildEventCardFromTemplate(
  tpl: EventTemplate,
  turn: number,
  market: MarketState,
  inflationMultiplier = 1
): GameEventCard {
  const id = uid(`evt_t${turn}_${tpl.id}`);
  let title = tpl.title;
  let description = tpl.description;
  let impact = tpl.financialImpactSummary;
  const choices: EventChoice[] = [];

  switch (tpl.kind) {
    case 'stock_discount': {
      const stockDef = randomPick(STOCK_CATALOG);
      const symbol = stockDef.symbol;
      const marketPrice = market.stocks[symbol]?.currentPrice ?? stockDef.basePrice;
      const discountPct = randomInt(12, 28);
      const discountMult = Number((1 - discountPct / 100).toFixed(2));
      const targetSpend = randomRange(1500, 4400);
      const shares = Math.max(8, Math.min(80, Math.round(targetSpend / Math.max(10, marketPrice))));
      const offerPrice = roundMoney(marketPrice * discountMult);
      const totalCost = roundMoney(offerPrice * shares);
      title = `Private Placement: ${stockDef.name} (${symbol})`;
      description = `An off-market block of ${shares} shares of ${stockDef.name} (${symbol}) is available at ${discountPct}% below market price (${formatCurrency(marketPrice)}/sh → ${formatCurrency(offerPrice)}/sh).`;
      impact = `Buy ${shares} ${symbol} for ${formatCurrency(totalCost)} (Market value ${formatCurrency(marketPrice * shares)})`;
      choices.push({
        id: 'buy_block',
        label: `Buy ${shares} ${symbol} (${formatCurrency(totalCost)})`,
        description: 'Purchase discounted shares using Cash on Hand.',
        effectType: 'stock_opportunity',
        symbol,
        shares,
        amount: offerPrice,
        secondaryAmount: discountPct,
        requiresCashCheck: true,
        tone: 'positive',
      });
      choices.push({
        id: 'decline',
        label: 'Decline Offer',
        description: 'Keep your cash reserves and pass on this placement.',
        effectType: 'dismiss',
        tone: 'neutral',
      });
      break;
    }

    case 'property_deal': {
      const base = tpl.propertyDeal!;
      const priceScale = randomRange(0.76, 1.12);
      const purchasePrice = Math.max(24000, Math.round((base.purchasePrice * priceScale) / 500) * 500);
      const downPct = randomRange(0.15, 0.23);
      const downPayment = Math.round((purchasePrice * downPct) / 100) * 100;
      const loanAmount = Math.max(0, purchasePrice - downPayment);
      const loanAnnualRate = Number(randomRange(0.056, 0.078).toFixed(3));
      const loanTermMonths = randomPick([180, 240]);
      const monthlyRentalIncome = Math.max(
        400,
        Math.round((base.monthlyRentalIncome * priceScale * randomRange(0.92, 1.16)) / 10) * 10
      );
      const maintenanceExpense = Math.max(
        80,
        Math.round((base.maintenanceExpense * priceScale * randomRange(0.88, 1.14)) / 10) * 10
      );
      const listing = {
        ...base,
        id: uid(`evt_prop_${turn}`),
        purchasePrice,
        downPayment,
        loanAmount,
        loanAnnualRate,
        loanTermMonths,
        monthlyRentalIncome,
        maintenanceExpense,
      };
      description = `A motivated seller offers ${listing.name} below comps. Requires ${formatCurrency(downPayment)} down payment.`;
      impact = `Price ${formatCurrency(purchasePrice)} · Down ${formatCurrency(downPayment)} · Rent ${formatCurrency(monthlyRentalIncome)}/mo · Maint ${formatCurrency(maintenanceExpense)}/mo`;
      choices.push({
        id: 'buy_financed',
        label: `Acquire w/ Mortgage (${formatCurrency(listing.downPayment)} Down)`,
        description: `Down payment ${formatCurrency(listing.downPayment)}, Loan ${formatCurrency(listing.loanAmount)}, Rent +${formatCurrency(listing.monthlyRentalIncome)}/mo`,
        effectType: 'property_opportunity',
        propertyTemplate: listing,
        amount: listing.downPayment,
        requiresCashCheck: true,
        tone: 'gold',
      });
      choices.push({
        id: 'decline',
        label: 'Pass on Deal',
        description: 'Decline the private property offering.',
        effectType: 'dismiss',
        tone: 'neutral',
      });
      break;
    }

    case 'business_deal': {
      const base = tpl.businessDeal!;
      const scale = randomRange(0.76, 1.18);
      const purchasePrice = Math.max(9500, Math.round((base.purchasePrice * scale) / 500) * 500);
      const monthlyRevenue = Math.max(
        800,
        Math.round((base.monthlyRevenue * scale * randomRange(0.92, 1.18)) / 10) * 10
      );
      const rawExp = Math.round((base.monthlyOperatingExpenses * scale * randomRange(0.88, 1.12)) / 10) * 10;
      const monthlyOperatingExpenses = Math.min(rawExp, Math.round((monthlyRevenue * 0.72) / 10) * 10);
      const listing = {
        ...base,
        id: uid(`evt_biz_${turn}`),
        purchasePrice,
        initialInvestment: purchasePrice,
        monthlyRevenue,
        monthlyOperatingExpenses,
      };
      impact = `Cost ${formatCurrency(purchasePrice)} · Passive Revenue ${formatCurrency(monthlyRevenue)}/mo · Operating Exp ${formatCurrency(monthlyOperatingExpenses)}/mo`;
      choices.push({
        id: 'buy_biz',
        label: `Invest ${formatCurrency(listing.purchasePrice)}`,
        description: `Automated business generating +${formatCurrency(listing.monthlyRevenue - listing.monthlyOperatingExpenses)}/mo net passive profit.`,
        effectType: 'business_opportunity',
        businessTemplate: listing,
        amount: listing.purchasePrice,
        requiresCashCheck: true,
        tone: 'gold',
      });
      choices.push({
        id: 'decline',
        label: 'Pass on Partnership',
        description: 'Keep cash available for other deals.',
        effectType: 'dismiss',
        tone: 'neutral',
      });
      break;
    }

    case 'side_hustle': {
      const bonus = randomInt(13, 49) * 50; // $650 - $2,450
      impact = `Earn +${formatCurrency(bonus)} cash immediately (optional engagement)`;
      choices.push({
        id: 'accept_gig',
        label: `Accept Contract (+${formatCurrency(bonus)})`,
        description: 'Complete the advisory sprint and add earnings to cash.',
        effectType: 'cash_delta',
        amount: bonus,
        tone: 'positive',
      });
      choices.push({
        id: 'skip_gig',
        label: 'Decline',
        description: 'Skip the extra engagement this month.',
        effectType: 'dismiss',
        tone: 'neutral',
      });
      break;
    }

    case 'other_passive_income': {
      const cost = randomInt(20, 56) * 100; // $2,000 - $5,600
      const monthlyGain = Math.max(120, Math.round((cost * randomRange(0.052, 0.078)) / 10) * 10);
      description = `Invest ${formatCurrency(cost)} to package and license a niche industry toolkit that pays recurring monthly royalties.`;
      impact = `Invest ${formatCurrency(cost)} · Gain +${formatCurrency(monthlyGain)}/mo Other Passive Income`;
      choices.push({
        id: 'fund_license',
        label: `Invest ${formatCurrency(cost)} (+${formatCurrency(monthlyGain)}/mo)`,
        description: `Pay ${formatCurrency(cost)} to add +${formatCurrency(monthlyGain)}/mo permanent passive royalty income.`,
        effectType: 'other_passive_income',
        amount: cost,
        secondaryAmount: monthlyGain,
        requiresCashCheck: true,
        tone: 'positive',
      });
      choices.push({
        id: 'decline',
        label: 'Pass',
        description: 'Decline the licensing deal.',
        effectType: 'dismiss',
        tone: 'neutral',
      });
      break;
    }

    case 'venture_opportunity': {
      const investCost = Math.max(600, Math.round((randomInt(10, 24) * 100 * inflationMultiplier) / 100) * 100);
      const maxPayout = Math.round((investCost * randomRange(2.2, 3.2)) / 100) * 100;
      description = `Co-fund a small-batch board game release for ${formatCurrency(investCost)}. If retail sales take off, payouts reach up to ${formatCurrency(maxPayout)} at summary!`;
      impact = `Invest ${formatCurrency(investCost)} · Up to +${formatCurrency(maxPayout)} payout`;
      choices.push({
        id: 'fund_venture',
        label: `Invest ${formatCurrency(investCost)}`,
        description: 'Pay upfront production cost — outcome revealed in Turn Summary.',
        effectType: 'venture_opportunity',
        amount: investCost,
        secondaryAmount: maxPayout,
        requiresCashCheck: true,
        tone: 'gold',
      });
      choices.push({
        id: 'decline',
        label: 'Pass',
        description: 'Decline this publishing venture.',
        effectType: 'dismiss',
        tone: 'neutral',
      });
      break;
    }

    case 'speaking_opportunity': {
      const travelCost = Math.max(500, Math.round((randomInt(9, 16) * 100 * inflationMultiplier) / 100) * 100);
      const honorarium = Math.round((travelCost + randomInt(9, 17) * 100 * inflationMultiplier) / 100) * 100;
      description = `You are invited to speak at a major healthcare and innovation conference. Deliver a presentation to earn ${formatCurrency(honorarium)}, while covering ${formatCurrency(travelCost)} in travel expenses.`;
      impact = `Honorarium: ${formatCurrency(honorarium)} · Travel Expense: ${formatCurrency(travelCost)}`;
      choices.push({
        id: 'accept_conference',
        label: `Attend (${formatCurrency(travelCost)} travel → ${formatCurrency(honorarium)} fee)`,
        description: 'Cover travel expenses now and collect honorarium in Turn Summary.',
        effectType: 'speaking_opportunity',
        amount: travelCost,
        secondaryAmount: honorarium,
        requiresCashCheck: true,
        tone: 'positive',
      });
      choices.push({
        id: 'decline',
        label: 'Decline',
        description: 'Skip the speaking invitation this month.',
        effectType: 'dismiss',
        tone: 'neutral',
      });
      break;
    }

    case 'medical_bill':
    case 'car_repair':
    case 'home_repair':
    case 'family_expense':
    case 'tax_audit':
    case 'education_course': {
      const cost = randomInt(9, 44) * 50; // $450 - $2,200
      impact = `-${formatCurrency(cost)} cash expense (or finance via emergency loan)`;
      choices.push({
        id: 'pay_cash',
        label: `Pay ${formatCurrency(cost)} from Cash`,
        description: 'Settle the obligation immediately with cash on hand.',
        effectType: 'cash_delta',
        amount: -cost,
        requiresCashCheck: true,
        tone: 'negative',
      });
      choices.push({
        id: 'finance_emergency',
        label: `Finance w/ Emergency Loan (${formatCurrency(cost)})`,
        description: 'Cover the bill using a 24-month personal loan at 16% APR.',
        effectType: 'take_emergency_loan',
        amount: cost,
        tone: 'neutral',
      });
      break;
    }

    case 'salary_raise': {
      const pct = randomInt(4, 14);
      const mult = Number((1 + pct / 100).toFixed(2));
      description = `Strong quarterly output earned you a permanent ${pct}% salary increase.`;
      impact = `+${pct}% permanent Monthly Salary increase`;
      choices.push({
        id: 'ack_raise',
        label: 'Accept Compensation Update',
        description: `Your monthly salary rises permanently by ${pct}%.`,
        effectType: 'salary_multiplier',
        secondaryAmount: mult,
        tone: 'positive',
      });
      break;
    }

    case 'promotion': {
      const bonus = randomInt(15, 52) * 50; // $750 - $2,600
      const raise = randomInt(6, 20) * 50; // $300 - $1,000/mo
      description = `You stepped into a lead role with a +${formatCurrency(raise)}/month salary bump and a ${formatCurrency(bonus)} signing bonus.`;
      impact = `+${formatCurrency(raise)}/mo Salary & +${formatCurrency(bonus)} immediate bonus`;
      choices.push({
        id: 'accept_promo',
        label: `Accept Promotion (+${formatCurrency(raise)}/mo & +${formatCurrency(bonus)})`,
        description: 'Applies immediate bonus to cash and updates your monthly salary.',
        effectType: 'salary_delta',
        amount: bonus,
        secondaryAmount: raise,
        tone: 'positive',
      });
      break;
    }

    case 'salary_cut': {
      const pct = randomInt(4, 12);
      const mult = Number((1 - pct / 100).toFixed(2));
      description = `Industry headwinds reduced overtime and bonus allowances, trimming monthly salary by ${pct}%.`;
      impact = `-${pct}% Monthly Salary adjustment`;
      choices.push({
        id: 'ack_cut',
        label: 'Acknowledge Adjustment',
        description: `Monthly salary adjusts by -${pct}%.`,
        effectType: 'salary_multiplier',
        secondaryAmount: mult,
        tone: 'negative',
      });
      break;
    }

    case 'market_crash': {
      const dropPct = randomInt(20, 35);
      const factor = Number((1 - dropPct / 100).toFixed(2));
      description = `A sudden Black Swan shock hit stocks and crypto (~-${dropPct}%), while Gold surged as investors rushed to safety.`;
      impact = `Stocks & Crypto plunge (~-${dropPct}%) · Gold surges sharply`;
      choices.push({
        id: 'ack_crash',
        label: `Apply Black Swan Shock (-${dropPct}%)`,
        description: 'Equities and crypto plunge while Gold rallies sharply.',
        effectType: 'market_crash',
        secondaryAmount: factor,
        tone: 'negative',
      });
      break;
    }

    case 'property_boom': {
      const boomPct = randomInt(6, 18);
      const mult = Number((1 + boomPct / 100).toFixed(2));
      description = `New regional rail funding boosted residential & rental property valuations by +${boomPct}% across the city.`;
      impact = `All owned Real Estate values increase by +${boomPct}%`;
      choices.push({
        id: 'ack_boom',
        label: `Revalue Real Estate (+${boomPct}%)`,
        description: 'Updates valuations of all owned properties.',
        effectType: 'property_boom',
        secondaryAmount: mult,
        tone: 'gold',
      });
      break;
    }

    case 'new_baby': {
      const birthCost = Math.round((randomInt(500, 1300) * inflationMultiplier) / 50) * 50;
      const monthlyCare = Math.round((randomInt(180, 340) * inflationMultiplier) / 10) * 10;
      description = `Your family welcomed a newborn! Initial hospital & nursery expenses are ${formatCurrency(birthCost)} and monthly childcare adds +${formatCurrency(monthlyCare)}/mo.`;
      impact = `+14 Happiness · -${formatCurrency(birthCost)} initial · +${formatCurrency(monthlyCare)}/mo living cost`;
      choices.push({
        id: 'welcome_baby',
        label: `Welcome Baby (${formatCurrency(birthCost)})`,
        description: `Happiness +14, adds +${formatCurrency(monthlyCare)}/mo childcare expenses.`,
        effectType: 'new_baby',
        amount: birthCost,
        secondaryAmount: monthlyCare,
        tone: 'gold',
      });
      break;
    }

    case 'divorce': {
      const legalFee = Math.round((randomInt(1200, 3200) * inflationMultiplier) / 100) * 100;
      description = `Marital separation brings a legal & financial settlement of ${formatCurrency(legalFee)} and reduces happiness.`;
      impact = `Divorced status · -${formatCurrency(legalFee)} settlement · -15 Happiness`;
      choices.push({
        id: 'ack_divorce',
        label: `Finalize Separation (-${formatCurrency(legalFee)})`,
        description: 'Applies settlement payment and updates marital status to Divorced.',
        effectType: 'divorce',
        amount: legalFee,
        tone: 'negative',
      });
      break;
    }
  }

  const durationType: 'monthly' | 'annual' = tpl.durationType ?? 'monthly';
  const remainingMonths = durationType === 'annual' ? 12 : 1;

  return {
    id,
    templateId: tpl.id,
    turnGenerated: turn,
    category: tpl.category,
    durationType,
    remainingMonths,
    expiresAtTurn: durationType === 'annual' ? turn + 11 : turn,
    title,
    description,
    financialImpactSummary: impact,
    choices,
    resolved: false,
  };
}

export function generateTurnEvents(
  turn: number,
  _seed: number,
  market: MarketState,
  recentTemplateIds: string[],
  maritalStatus: MaritalStatus = 'single',
  inflationMultiplier = 1,
  ctx?: TurnEventContext
): GameEventCard[] {
  const activeAnnualIds = new Set(ctx?.activeAnnualTemplateIds ?? []);
  const exclude = new Set([...recentTemplateIds.slice(-4), ...activeAnnualIds]);
  const events: GameEventCard[] = [];

  // 1. Always generate the character's guaranteed monthly signature opportunity (scales with money)
  events.push(
    buildCharacterSignatureOpportunityCard(
      ctx?.professionId ?? 'teacher',
      turn,
      ctx?.cash ?? 10000,
      ctx?.netWorth ?? 10000,
      inflationMultiplier
    )
  );

  // 2. Keep up to 2 long-term (12-month) Annual Opportunities available so players can save & buy when ready
  if (activeAnnualIds.size < 2) {
    const shouldSpawnAnnual = turn <= 1 || activeAnnualIds.size === 0 || randomFloat() < 0.65;
    if (shouldSpawnAnnual) {
      const annualTpl = pickWeightedTemplate(exclude, turn, maritalStatus, ctx, 'annual');
      if (annualTpl && !activeAnnualIds.has(annualTpl.id)) {
        exclude.add(annualTpl.id);
        events.push(buildEventCardFromTemplate(annualTpl, turn, market, inflationMultiplier));
      }
    }
  }

  // 3. Add 1-2 monthly (1-month) opportunities / emergencies / life events that rotate every month
  const monthlyCount = turn <= 1 ? 2 : randomFloat() < 0.55 ? 2 : 1;
  for (let i = 0; i < monthlyCount; i++) {
    const monthlyTpl = pickWeightedTemplate(exclude, turn, maritalStatus, ctx, 'monthly');
    if (!monthlyTpl) continue;
    exclude.add(monthlyTpl.id);
    events.push(buildEventCardFromTemplate(monthlyTpl, turn, market, inflationMultiplier));
  }

  return events;
}
