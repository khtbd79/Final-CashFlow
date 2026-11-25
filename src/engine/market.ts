import {
  BUSINESS_TEMPLATES,
  CRYPTO_CATALOG,
  PROPERTY_TEMPLATES,
  STOCK_CATALOG,
} from '../data/markets';
import {
  BusinessListing,
  CryptoMarketState,
  MarketState,
  PropertyListing,
  StockMarketState,
} from '../types/game';
import { randomFloat, randomPick, randomRange, roundMoney, shuffleArray, uid } from './prng';

function stepAssetPrice(
  current: number,
  base: number,
  volatility: number,
  macroDrift: number,
  crashFactor = 1
): number {
  const u1 = Math.max(0.0001, randomFloat());
  const u2 = randomFloat();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  const ratioToBase = current / base;
  const meanReversion = (1 - Math.min(2.2, ratioToBase)) * 0.035;
  const changePct = Math.max(
    -0.42,
    Math.min(0.45, macroDrift + meanReversion + z * volatility)
  );
  const next = current * (1 + changePct) * crashFactor;
  return roundMoney(Math.max(base * 0.25, next));
}

function stepCryptoPrice(
  current: number,
  base: number,
  volatility: number,
  macroDrift: number,
  stockCrash: boolean,
  crashFactorOverride?: number
): number {
  if (stockCrash) {
    const crashMult =
      (crashFactorOverride ? crashFactorOverride * 0.88 : randomRange(0.56, 0.74)) *
      randomRange(0.90, 0.99);
    const stepped = stepAssetPrice(current, base, volatility, macroDrift * 1.4, crashMult);
    return roundMoney(Math.max(base * 0.15, Math.min(stepped, current * 0.78)));
  }

  const roll = randomFloat();
  const megaRallyChance = current > base * 5.5 ? 0.015 : 0.038;

  // Sudden unpredictable 250% - 338%+ crypto moon surge
  if (roll < megaRallyChance) {
    const surgePct = randomRange(2.5, 3.38);
    return roundMoney(current * (1 + surgePct));
  }

  // Volatile mid-tier crypto breakout (+65% to +145%)
  if (roll < megaRallyChance + 0.05) {
    const pumpPct = randomRange(0.65, 1.45);
    return roundMoney(current * (1 + pumpPct));
  }

  // Sharp crypto shakeout / flash pullback (-28% to -52%)
  if (roll < megaRallyChance + 0.11) {
    const dipPct = randomRange(-0.52, -0.28);
    return roundMoney(Math.max(base * 0.15, current * (1 + dipPct)));
  }

  // High-volatility regular month (-45% to +58%)
  const u1 = Math.max(0.0001, randomFloat());
  const u2 = randomFloat();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  const ratioToBase = current / base;
  const meanReversion = (1 - Math.min(2.6, ratioToBase)) * 0.03;
  const changePct = Math.max(
    -0.45,
    Math.min(0.58, macroDrift * 1.4 + meanReversion + z * volatility)
  );
  return roundMoney(Math.max(base * 0.15, current * (1 + changePct)));
}

export function createInitialMarket(_seed?: number): MarketState {
  const stocks: Record<string, StockMarketState> = {};

  for (const def of STOCK_CATALOG) {
    const openingPrice = roundMoney(
      Math.max(def.basePrice * 0.45, def.basePrice * randomRange(0.76, 1.32))
    );
    stocks[def.symbol] = {
      symbol: def.symbol,
      previousPrice: openingPrice,
      currentPrice: openingPrice,
      priceHistory: [openingPrice],
    };
  }

  const crypto: Record<string, CryptoMarketState> = {};
  for (const def of CRYPTO_CATALOG) {
    const openingPrice = roundMoney(
      Math.max(def.basePrice * 0.35, def.basePrice * randomRange(0.68, 1.42))
    );
    crypto[def.symbol] = {
      symbol: def.symbol,
      previousPrice: openingPrice,
      currentPrice: openingPrice,
      priceHistory: [openingPrice],
    };
  }

  return {
    stocks,
    crypto,
    availableProperties: generatePropertyListings(1),
    availableBusinesses: generateBusinessListings(1),
  };
}

export function generatePropertyListings(
  turn: number,
  _rng?: () => number
): PropertyListing[] {
  const selected = shuffleArray(PROPERTY_TEMPLATES).slice(0, 4);

  return selected.map((tpl) => {
    const marketScale = randomRange(0.82, 1.22);
    const purchasePrice = Math.max(
      15000,
      Math.round((tpl.purchasePrice * marketScale) / 500) * 500
    );
    const downPct = randomRange(0.15, 0.28);
    const downPayment = Math.round((purchasePrice * downPct) / 100) * 100;
    const loanAmount = Math.max(0, purchasePrice - downPayment);
    const loanAnnualRate = Number(randomRange(0.056, 0.088).toFixed(3));
    const loanTermMonths = randomPick([120, 180, 240]);
    const monthlyRentalIncome = Math.max(
      250,
      Math.round((tpl.monthlyRentalIncome * randomRange(0.85, 1.2)) / 10) * 10
    );
    const maintenanceExpense = Math.max(
      60,
      Math.round((tpl.maintenanceExpense * randomRange(0.85, 1.18)) / 10) * 10
    );

    return {
      ...tpl,
      id: uid(`prop_t${turn}`),
      purchasePrice,
      downPayment,
      loanAmount,
      loanAnnualRate,
      loanTermMonths,
      monthlyRentalIncome,
      maintenanceExpense,
    };
  });
}

export function generateBusinessListings(
  turn: number,
  _rng?: () => number
): BusinessListing[] {
  const existing = BUSINESS_TEMPLATES.filter((b) => b.mode === 'existing');
  const startups = BUSINESS_TEMPLATES.filter((b) => b.mode === 'startup');

  const pickedExisting = shuffleArray(existing).slice(0, 3);
  const pickedStartups = shuffleArray(startups).slice(0, 2);

  return [...pickedExisting, ...pickedStartups].map((tpl) => {
    const scale = randomRange(0.82, 1.24);
    const purchasePrice = Math.max(
      5000,
      Math.round((tpl.purchasePrice * scale) / 500) * 500
    );
    const monthlyRevenue = Math.max(
      500,
      Math.round((tpl.monthlyRevenue * randomRange(0.84, 1.22)) / 10) * 10
    );
    const rawExp = Math.round(
      (tpl.monthlyOperatingExpenses * randomRange(0.84, 1.18)) / 10
    ) * 10;
    const monthlyOperatingExpenses = Math.min(
      rawExp,
      Math.round((monthlyRevenue * 0.78) / 10) * 10
    );
    const automationUpgradeCost = tpl.isAutomated
      ? 0
      : Math.max(2000, Math.round((tpl.automationUpgradeCost * randomRange(0.8, 1.25)) / 100) * 100);
    const automationMonthlyFee = tpl.isAutomated
      ? 0
      : Math.max(100, Math.round((tpl.automationMonthlyFee * randomRange(0.82, 1.2)) / 10) * 10);

    return {
      ...tpl,
      id: uid(`biz_t${turn}`),
      purchasePrice,
      initialInvestment: purchasePrice,
      monthlyRevenue,
      monthlyOperatingExpenses,
      automationUpgradeCost,
      automationMonthlyFee,
    };
  });
}

export function advanceMarket(
  market: MarketState,
  turn: number,
  _seed: number,
  stockCrash = false,
  crashFactorOverride?: number,
  crashWinnerSymbol = 'GOLDM'
): MarketState {
  const macroDrift = stockCrash ? -0.05 : randomRange(-0.025, 0.036);

  const nextStocks: Record<string, StockMarketState> = {};
  for (const def of STOCK_CATALOG) {
    const prev = market.stocks[def.symbol];
    const currentPrice = prev?.currentPrice ?? def.basePrice;
    let nextPrice: number;

    if (stockCrash && def.symbol === crashWinnerSymbol) {
      // One random safe-haven/counter-cyclical investment (often Gold) surges +62% to +79% during a crash
      const winnerSurgeFactor = randomRange(1.62, 1.79);
      nextPrice = roundMoney(Math.max(def.basePrice * 0.65, currentPrice * winnerSurgeFactor));
    } else if (stockCrash && def.symbol === 'GOLDM') {
      // Gold remains resilient as a safe haven even if another asset leads the surge
      const goldBufferFactor = randomRange(1.04, 1.16);
      nextPrice = roundMoney(Math.max(def.basePrice * 0.65, currentPrice * goldBufferFactor));
    } else {
      const effectiveDrift =
        def.symbol === 'GOLDM' && macroDrift < 0 ? Math.abs(macroDrift) * 0.55 : macroDrift;
      const crashMult = stockCrash
        ? (crashFactorOverride ?? randomRange(0.56, 0.75)) * randomRange(0.90, 0.99)
        : 1;
      const stepped = stepAssetPrice(
        currentPrice,
        def.basePrice,
        def.volatility,
        effectiveDrift,
        crashMult
      );
      // Guarantee non-winning equities drop noticeably during a Black Swan crash
      nextPrice = stockCrash
        ? roundMoney(Math.max(def.basePrice * 0.22, Math.min(stepped, currentPrice * 0.82)))
        : stepped;
    }

    const prevHist = prev?.priceHistory ?? [currentPrice];
    nextStocks[def.symbol] = {
      symbol: def.symbol,
      previousPrice: currentPrice,
      currentPrice: nextPrice,
      priceHistory: [...prevHist.slice(-17), nextPrice],
    };
  }

  const nextCrypto: Record<string, CryptoMarketState> = {};
  for (const def of CRYPTO_CATALOG) {
    const prev = market.crypto[def.symbol];
    const currentPrice = prev?.currentPrice ?? def.basePrice;
    const nextPrice = stepCryptoPrice(
      currentPrice,
      def.basePrice,
      def.volatility,
      macroDrift,
      stockCrash,
      crashFactorOverride
    );
    const prevHist = prev?.priceHistory ?? [currentPrice];
    nextCrypto[def.symbol] = {
      symbol: def.symbol,
      previousPrice: currentPrice,
      currentPrice: nextPrice,
      priceHistory: [...prevHist.slice(-17), nextPrice],
    };
  }

  return {
    stocks: nextStocks,
    crypto: nextCrypto,
    availableProperties: generatePropertyListings(turn),
    availableBusinesses: generateBusinessListings(turn),
  };
}
