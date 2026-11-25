import { EVENT_POOL, EventTemplate } from '../data/events';
import { STOCK_CATALOG } from '../data/markets';
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
  cash: number;
  passiveIncome: number;
  totalExpenses: number;
  netWorth: number;
  assetsCount: number;
  propertiesCount: number;
}

function isTemplateEligible(
  t: EventTemplate,
  turn: number,
  maritalStatus: MaritalStatus,
  ctx?: TurnEventContext
): boolean {
  if (turn <= 1) {
    return (
      t.category === 'opportunity' &&
      t.kind !== 'property_deal' &&
      t.kind !== 'business_deal'
    );
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

function pickWeightedTemplate(
  excludeIds: Set<string>,
  turn: number,
  maritalStatus: MaritalStatus = 'single',
  ctx?: TurnEventContext
): EventTemplate {
  const baseEligible = EVENT_POOL.filter((t) =>
    isTemplateEligible(t, turn, maritalStatus, ctx)
  );
  const candidates = baseEligible.filter((t) => !excludeIds.has(t.id));
  const pool =
    candidates.length > 0
      ? candidates
      : baseEligible.length > 0
      ? baseEligible
      : EVENT_POOL.filter((t) => t.kind === 'stock_discount' || t.kind === 'side_hustle');
  const totalWeight = pool.reduce((sum, t) => sum + t.weight, 0);
  let roll = randomFloat() * totalWeight;
  for (const item of pool) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return pool[0];
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

  return {
    id,
    templateId: tpl.id,
    turnGenerated: turn,
    category: tpl.category,
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
  const exclude = new Set(recentTemplateIds.slice(-4));

  let count = 2;
  if (turn <= 1) {
    count = 3;
  } else if (turn === 2) {
    count = 2;
  } else {
    const roll = randomFloat();
    count = roll < 0.5 ? 2 : 3;
  }

  const events: GameEventCard[] = [];

  for (let i = 0; i < count; i++) {
    const tpl = pickWeightedTemplate(exclude, turn, maritalStatus, ctx);
    exclude.add(tpl.id);
    events.push(buildEventCardFromTemplate(tpl, turn, market, inflationMultiplier));
  }

  return events;
}
