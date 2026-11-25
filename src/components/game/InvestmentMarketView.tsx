import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Banknote, ChevronDown, PiggyBank, TrendingUp } from 'lucide-react';
import { getT } from '../../data/i18n';
import {
  isFixedIncomeMatchedForProfession,
  isPropertyMatchedForProfession,
  isStockMatchedForProfession,
} from '../../data/lifestyle';
import {
  localizeCrypto,
  localizeFixedIncome,
  localizeProperty,
  localizeStock,
} from '../../data/localization';
import {
  CRYPTO_CATALOG,
  FIXED_INCOME_PRODUCTS,
  REAL_ESTATE_TIER_LISTINGS,
  STOCK_CATALOG,
} from '../../data/markets';
import { InvestmentSheetCategory } from '../../engine/gameEngine';
import { formatCurrency, formatCurrencyExact, roundMoney } from '../../engine/prng';
import {
  FinancialSummary,
  GameState,
  LanguageCode,
  NavSection,
  PropertyListing,
  RealEstateTierId,
} from '../../types/game';
import { RealEstateTierIllustration } from '../common/LifestyleIllustrations';

type OverviewOrCategory = 'overview' | InvestmentSheetCategory | 'real_estate';

const WAVE_PATHS = [
  'M0 84 C 45 55, 80 18, 125 32 C 165 45, 175 102, 210 92 C 250 80, 290 22, 360 52',
  'M0 95 C 40 85, 70 12, 108 26 C 145 40, 155 108, 195 90 C 235 72, 255 34, 300 60 C 325 74, 345 45, 360 36',
  'M0 98 C 75 96, 155 96, 200 72 C 240 50, 265 14, 295 28 C 320 40, 338 56, 360 44',
  'M0 105 C 35 100, 72 48, 106 58 C 142 68, 150 98, 195 82 C 245 64, 300 32, 360 14',
  'M0 104 C 42 100, 75 14, 106 24 C 138 34, 155 102, 205 90 C 255 78, 290 36, 360 12',
  'M0 78 C 55 30, 110 88, 170 62 C 230 36, 285 78, 360 28',
  'M0 64 C 65 92, 130 24, 195 54 C 260 84, 310 34, 360 58',
];

const EQUITY_CATALOG = STOCK_CATALOG.filter((s) => s.symbol !== 'GOLDM');
const GOLD_DEF = STOCK_CATALOG.find((s) => s.symbol === 'GOLDM') ?? STOCK_CATALOG[STOCK_CATALOG.length - 1];

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function buildDisplaySeries(
  key: string,
  priceHistory: number[],
  basePrice: number,
  volatility: number,
  isYieldCurve = false,
  annualRate = 0.05
): number[] {
  if (isYieldCurve) {
    const pts: number[] = [];
    for (let i = 0; i <= 11; i++) {
      const t = i / 11;
      const compound = Math.pow(1 + annualRate, i * 0.9);
      const gentleWave = Math.sin(t * Math.PI * 2.2) * 0.012;
      pts.push(Number((100 * (compound + gentleWave)).toFixed(2)));
    }
    return pts;
  }

  const live = priceHistory.length > 0 ? priceHistory : [basePrice];
  const targetStart = live[0] ?? basePrice;
  const neededPrefix = Math.max(0, 12 - live.length);
  if (neededPrefix === 0) {
    return live;
  }

  const seed = hashSeed(key);
  const prefix: number[] = [];
  for (let i = 0; i < neededPrefix; i++) {
    const progress = i / neededPrefix;
    const phase = seed * Math.PI * 4 + i * 0.85;
    const wave =
      Math.sin(phase) * volatility * 1.45 + Math.cos(phase * 1.65) * volatility * 0.75;
    const blend = 1 + wave * (1 - progress * 0.6);
    prefix.push(Math.max(basePrice * 0.25, roundMoney(targetStart * blend)));
  }

  return [...prefix, ...live];
}

function buildSmoothSplinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function formatCleanMoney(val: number): string {
  const rounded = Math.round(val);
  if (Math.abs(val - rounded) < 0.01) {
    return formatCurrency(rounded);
  }
  return formatCurrencyExact(val);
}

const DollarWithdrawTrayIcon: React.FC<{ className?: string; active?: boolean }> = ({
  className = 'h-7 w-7',
  active = false,
}) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    <circle cx="16" cy="13" r="8.5" fill={active ? '#F7CA44' : '#1E2129'} />
    <text
      x="16"
      y="16.8"
      textAnchor="middle"
      fill={active ? '#1E2129' : '#F7CA44'}
      fontSize="11.5"
      fontWeight="800"
      fontFamily="Plus Jakarta Sans, sans-serif"
    >
      $
    </text>
    <path
      d="M5 17.5V22.5C5 24.433 6.567 26 8.5 26H23.5C25.433 26 27 24.433 27 22.5V17.5"
      stroke={active ? '#F7CA44' : '#1E2129'}
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SmoothRangeSlider: React.FC<{
  value: number;
  max: number;
  disabled?: boolean;
  ariaLabel: string;
  onChange: (nextVal: number) => void;
}> = ({ value, max, disabled = false, ariaLabel, onChange }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [dragPct, setDragPct] = useState<number | null>(null);

  const safeMax = Math.max(0, max);
  const isDisabled = disabled || safeMax <= 0;

  const updateFromClientX = useCallback(
    (clientX: number, keepContinuous: boolean) => {
      const el = trackRef.current;
      if (!el || isDisabled) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      if (keepContinuous) {
        setDragPct(ratio * 100);
      } else {
        setDragPct(null);
      }
      const nextStep = Math.round(ratio * safeMax);
      onChange(nextStep);
    },
    [isDisabled, onChange, safeMax]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    e.preventDefault();
    e.stopPropagation();
    pointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore capture errors on non-standard WebViews
    }
    updateFromClientX(e.clientX, true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDisabled || pointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    updateFromClientX(e.clientX, true);
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    pointerIdRef.current = null;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
    setDragPct(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    const stepJump = Math.max(1, Math.round(safeMax / 20));
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(safeMax, value + 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(0, value - 1));
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      onChange(Math.min(safeMax, value + stepJump));
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      onChange(Math.max(0, value - stepJump));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(safeMax);
    }
  };

  const restPct = safeMax > 0 ? Math.max(0, Math.min(100, (value / safeMax) * 100)) : 0;
  const displayPct = isDisabled ? 0 : dragPct !== null ? dragPct : restPct;

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={isDisabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={isDisabled ? 0 : value}
      aria-disabled={isDisabled}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onLostPointerCapture={finishDrag}
      onKeyDown={handleKeyDown}
      style={{ touchAction: 'none' }}
      className={`relative flex h-11 w-full items-center select-none focus:outline-none ${
        isDisabled ? 'opacity-45 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
      }`}
    >
      {/* Full track */}
      <div
        className={`h-[3.5px] w-full rounded-full ${
          isDisabled ? 'bg-[#C7BCB0]' : 'bg-[#8D847B]/75'
        }`}
      />
      {/* Active filled track */}
      {!isDisabled && displayPct > 0 && (
        <div
          className="pointer-events-none absolute left-0 h-[3.5px] rounded-full bg-[#1E2129]"
          style={{ width: `${displayPct}%` }}
        />
      )}
      {/* Thumb */}
      <div
        className={`pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-[24px] w-[24px] rounded-full transition-transform ${
          isDisabled
            ? 'bg-[#9E948A] border-2 border-[#9E948A]'
            : dragPct !== null
              ? 'bg-[#1E2129] border-2 border-[#1E2129] scale-115 shadow-[0_3px_10px_rgba(30,33,41,0.38)]'
              : 'bg-[#1E2129] border-2 border-[#1E2129] shadow-[0_2px_6px_rgba(30,33,41,0.28)]'
        }`}
        style={{ left: `${displayPct}%` }}
      />
    </div>
  );
};

const CreamSplineChart: React.FC<{ values: number[] }> = React.memo(({ values }) => {
  const width = 360;
  const height = 195;
  const padX = 12;
  const padY = 16;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = useMemo(() => {
    const safe = values.length >= 2 ? values : [100, 100];
    const min = Math.min(...safe);
    const max = Math.max(...safe);
    const span = max - min || Math.max(1, max * 0.1);
    return safe.map((v, idx) => ({
      x: padX + (idx / (safe.length - 1)) * innerW,
      y: padY + innerH - ((v - min) / span) * innerH,
    }));
  }, [values, innerW, innerH]);

  const pathD = useMemo(() => buildSmoothSplinePath(points), [points]);

  const vCols = 6;
  const hRows = 6;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 sm:h-52 overflow-visible select-none">
      {/* Subtle dashed grid lines on cream backdrop */}
      {Array.from({ length: vCols }).map((_, i) => {
        const x = padX + ((i + 0.5) / vCols) * innerW;
        return (
          <line
            key={`v_${i}`}
            x1={x}
            y1={4}
            x2={x}
            y2={height - 4}
            stroke="#C8B9A9"
            strokeWidth="1"
            strokeDasharray="4 4"
            strokeOpacity="0.65"
          />
        );
      })}
      {Array.from({ length: hRows }).map((_, i) => {
        const y = padY + (i / (hRows - 1)) * innerH;
        return (
          <line
            key={`h_${i}`}
            x1={6}
            y1={y}
            x2={width - 6}
            y2={y}
            stroke="#C8B9A9"
            strokeWidth="1"
            strokeDasharray="4 4"
            strokeOpacity="0.65"
          />
        );
      })}

      {/* Smooth white spline line */}
      <path
        d={pathD}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Crisp node markers */}
      {points.map((pt, idx) => (
        <circle
          key={idx}
          cx={pt.x}
          cy={pt.y}
          r={idx === 0 || idx === points.length - 1 ? 3.8 : 2.2}
          fill="#FFFFFF"
          fillOpacity={idx === 0 || idx === points.length - 1 ? 1 : 0.72}
        />
      ))}
    </svg>
  );
});

const REAL_ESTATE_TIER_GRADIENTS: Record<RealEstateTierId, string> = {
  economy: 'bg-gradient-to-b from-[#E4F2FF] to-[#8CD0FC]',
  standard: 'bg-gradient-to-b from-[#F4EBFF] to-[#B78BF7]',
  premium: 'bg-gradient-to-b from-[#FFFBE4] to-[#F3DD63]',
  luxury: 'bg-gradient-to-b from-[#FFF1E5] to-[#F79F5B]',
};

const REAL_ESTATE_TIERS = REAL_ESTATE_TIER_LISTINGS.map((entry) => ({
  ...entry,
  gradientClass: REAL_ESTATE_TIER_GRADIENTS[entry.tier],
}));

const REAL_ESTATE_SERIES: { color: string; values: number[] }[] = [
  {
    color: '#F98D46',
    values: [68, 76, 82, 92, 54, 62, 70, 81, 93, 96, 98],
  },
  {
    color: '#DED03A',
    values: [28, 30, 34, 36, 25, 29, 36, 40, 46, 51, 55],
  },
  {
    color: '#A78BFA',
    values: [13, 14, 15, 17, 12, 14, 16, 18, 21, 24, 25],
  },
  {
    color: '#60B5F7',
    values: [7, 7.5, 8, 9, 6.5, 7.5, 8.5, 9.5, 11, 12, 13],
  },
];

const RealEstateMultiSplineChart: React.FC = () => {
  const width = 360;
  const height = 168;
  const padX = 12;
  const padY = 12;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const vCols = 9;
  const hRows = 7;

  const builtSeries = useMemo(() => {
    const maxVal = 100;
    const minVal = 4;
    const span = maxVal - minVal;
    return REAL_ESTATE_SERIES.map((s) => {
      const pts = s.values.map((v, idx) => ({
        x: padX + (idx / (s.values.length - 1)) * innerW,
        y: padY + innerH - ((v - minVal) / span) * innerH,
      }));
      return {
        color: s.color,
        pts,
        pathD: buildSmoothSplinePath(pts),
      };
    });
  }, [innerW, innerH]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 sm:h-44 overflow-visible select-none">
      {Array.from({ length: vCols }).map((_, i) => {
        const x = padX + ((i + 0.5) / vCols) * innerW;
        return (
          <line
            key={`v_${i}`}
            x1={x}
            y1={4}
            x2={x}
            y2={height - 4}
            stroke="#C8B9A9"
            strokeWidth="1"
            strokeDasharray="4 4"
            strokeOpacity="0.65"
          />
        );
      })}
      {Array.from({ length: hRows }).map((_, i) => {
        const y = padY + (i / (hRows - 1)) * innerH;
        return (
          <line
            key={`h_${i}`}
            x1={6}
            y1={y}
            x2={width - 6}
            y2={y}
            stroke="#C8B9A9"
            strokeWidth="1"
            strokeDasharray="4 4"
            strokeOpacity="0.65"
          />
        );
      })}

      {builtSeries.map((s) => (
        <g key={s.color}>
          <path
            d={s.pathD}
            fill="none"
            stroke={s.color}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {s.pts.map((pt, idx) => (
            <circle key={idx} cx={pt.x} cy={pt.y} r="3.2" fill={s.color} />
          ))}
        </g>
      ))}
    </svg>
  );
};

interface InvestmentMarketViewProps {
  game: GameState;
  summary: FinancialSummary;
  language: LanguageCode;
  onBuyStock: (symbol: string, shares: number) => void;
  onSellStock: (symbol: string, shares: number) => void;
  onBuyCrypto: (symbol: string, units: number) => void;
  onSellCrypto: (symbol: string, units: number) => void;
  onInvestFixed: (productId: string, amount: number) => void;
  onRedeemFixed: (fixedId: string) => void;
  onWithdrawFixedAmount: (productId: string, amount: number) => void;
  onWithdrawCategory?: (category: InvestmentSheetCategory) => void;
  onBuyProperty: (listing: PropertyListing, useFinancing: boolean) => void;
  onSellProperty: (propertyId: string) => void;
  onNavigate: (section: NavSection) => void;
  onSheetOpenChange?: (open: boolean) => void;
}

export const InvestmentMarketView: React.FC<InvestmentMarketViewProps> = ({
  game,
  summary,
  language,
  onBuyStock,
  onSellStock,
  onBuyCrypto,
  onSellCrypto,
  onInvestFixed,
  onWithdrawFixedAmount,
  onBuyProperty,
  onSellProperty,
  onNavigate,
  onSheetOpenChange,
}) => {
  const t = getT(language);
  const [activeCategory, setActiveCategory] = useState<OverviewOrCategory>('overview');
  const [selectedStockSym, setSelectedStockSym] = useState(EQUITY_CATALOG[0].symbol);
  const [selectedCryptoSym, setSelectedCryptoSym] = useState(CRYPTO_CATALOG[0].symbol);
  const [selectedBondId, setSelectedBondId] = useState(FIXED_INCOME_PRODUCTS[0].id);
  const [tradeMode, setTradeMode] = useState<'invest' | 'withdraw'>('invest');
  const [sliderStep, setSliderStep] = useState<number>(0);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const open = activeCategory !== 'overview';
    onSheetOpenChange?.(open);
    if (window.innerWidth < 640) {
      window.scrollTo({ top: 0 });
    }
    return () => {
      onSheetOpenChange?.(false);
    };
  }, [activeCategory, onSheetOpenChange]);

  // Portfolio category metrics
  const equityHoldings = game.stocks.filter((s) => s.symbol !== 'GOLDM');
  const equityVal = equityHoldings.reduce((acc, h) => {
    const p = game.market.stocks[h.symbol]?.currentPrice ?? h.avgBuyPrice;
    return acc + h.shares * p;
  }, 0);
  const equityCost = equityHoldings.reduce((acc, h) => acc + h.shares * h.avgBuyPrice, 0);
  const equityPnl = equityVal - equityCost;
  const equityPct = equityCost > 0 ? (equityPnl / equityCost) * 100 : 0;

  const goldHolding = game.stocks.find((s) => s.symbol === 'GOLDM');
  const goldPrice = game.market.stocks.GOLDM?.currentPrice ?? GOLD_DEF.basePrice;
  const goldVal = goldHolding ? goldHolding.shares * goldPrice : 0;
  const goldCost = goldHolding ? goldHolding.shares * goldHolding.avgBuyPrice : 0;
  const goldPnl = goldVal - goldCost;
  const goldPct = goldCost > 0 ? (goldPnl / goldCost) * 100 : 0;

  const fixedVal = summary.bondsAsset + summary.bankSavingsAsset;
  const fixedPrincipal = game.fixedIncome.reduce((acc, fi) => acc + fi.principal, 0);
  const fixedReturn = fixedVal - fixedPrincipal + summary.interestIncome;
  const fixedPct = fixedPrincipal > 0 ? (fixedReturn / fixedPrincipal) * 100 : 0;

  const cryptoVal = summary.otherInvestmentsAsset;
  const cryptoCost = game.crypto.reduce((acc, c) => acc + c.units * c.avgBuyPrice, 0);
  const cryptoPnl = cryptoVal - cryptoCost;
  const cryptoPct = cryptoCost > 0 ? (cryptoPnl / cryptoCost) * 100 : 0;

  const realEstateCost = game.properties.reduce((acc, p) => acc + p.purchasePrice, 0);
  const realEstatePnl = summary.realEstateAsset - realEstateCost;
  const realEstatePct = realEstateCost > 0 ? (realEstatePnl / realEstateCost) * 100 : 0;

  const businessCost = game.businesses.reduce(
    (acc, b) => acc + (b.purchasePrice || b.initialInvestment),
    0
  );
  const businessPnl = summary.businessesAsset - businessCost;
  const businessPct = businessCost > 0 ? (businessPnl / businessCost) * 100 : 0;

  const formatDeltaSummary = (pnl: number, pct: number) =>
    `${pnl > 0 ? '+' : ''}${formatCurrency(pnl)} (${pct > 0 ? '+' : ''}${pct.toFixed(0)}%)`;

  const openCategorySheet = (cat: InvestmentSheetCategory) => {
    setTradeMode('invest');
    setSliderStep(0);
    setShowHelp(false);
    if (cat === 'stocks') {
      const heldFirst = equityHoldings[0]?.symbol;
      if (heldFirst && !equityHoldings.some((h) => h.symbol === selectedStockSym)) {
        setSelectedStockSym(heldFirst);
      }
    } else if (cat === 'crypto') {
      const heldCoin = game.crypto[0]?.symbol;
      if (heldCoin && !game.crypto.some((c) => c.symbol === selectedCryptoSym)) {
        setSelectedCryptoSym(heldCoin);
      }
    } else if (cat === 'bonds_savings') {
      const heldBond = game.fixedIncome[0]?.productId;
      if (heldBond && !game.fixedIncome.some((f) => f.productId === selectedBondId)) {
        setSelectedBondId(heldBond);
      }
    }
    setActiveCategory(cat);
  };

  const overviewCards: {
    id: string;
    title: string;
    label: string;
    amount: number;
    subtext: string;
    subtextTone: 'pos' | 'neg' | 'neutral';
    wavePath: string;
    onClick: () => void;
  }[] = [
    {
      id: 'stocks',
      title: t.market.stocksCardTitle,
      label: t.market.investedLabel,
      amount: equityVal,
      subtext: formatDeltaSummary(equityPnl, equityPct),
      subtextTone: equityPnl > 0 ? 'pos' : equityPnl < 0 ? 'neg' : 'neutral',
      wavePath: WAVE_PATHS[0],
      onClick: () => openCategorySheet('stocks'),
    },
    {
      id: 'bonds_savings',
      title: t.market.bondsCardTitle,
      label: t.market.investedLabel,
      amount: fixedVal,
      subtext:
        summary.interestIncome > 0
          ? `+${formatCurrency(summary.interestIncome)}${t.common.perMonth}`
          : formatDeltaSummary(fixedReturn, fixedPct),
      subtextTone: fixedVal > 0 ? 'pos' : 'neutral',
      wavePath: WAVE_PATHS[1],
      onClick: () => openCategorySheet('bonds_savings'),
    },
    {
      id: 'crypto',
      title: t.market.cryptoCardTitle,
      label: t.market.investedLabel,
      amount: cryptoVal,
      subtext: formatDeltaSummary(cryptoPnl, cryptoPct),
      subtextTone: cryptoPnl > 0 ? 'pos' : cryptoPnl < 0 ? 'neg' : 'neutral',
      wavePath: WAVE_PATHS[2],
      onClick: () => openCategorySheet('crypto'),
    },
    {
      id: 'real_estate',
      title: t.market.realEstateCardTitle,
      label: t.market.investedLabel,
      amount: summary.realEstateAsset,
      subtext:
        summary.rentalIncome > 0
          ? `+${formatCurrency(summary.rentalIncome)}${t.common.perMonth}`
          : formatDeltaSummary(realEstatePnl, realEstatePct),
      subtextTone: summary.rentalIncome > 0 || realEstatePnl > 0 ? 'pos' : 'neutral',
      wavePath: WAVE_PATHS[3],
      onClick: () => {
        setTradeMode('invest');
        setSliderStep(0);
        setShowHelp(false);
        setActiveCategory('real_estate');
      },
    },
    {
      id: 'gold',
      title: t.market.goldCardTitle,
      label: t.market.investedLabel,
      amount: goldVal,
      subtext: formatDeltaSummary(goldPnl, goldPct),
      subtextTone: goldPnl > 0 ? 'pos' : goldPnl < 0 ? 'neg' : 'neutral',
      wavePath: WAVE_PATHS[4],
      onClick: () => openCategorySheet('gold'),
    },
    {
      id: 'businesses',
      title: t.market.businessesCardTitle,
      label: t.market.investedLabel,
      amount: summary.businessesAsset,
      subtext:
        summary.businessIncome > 0
          ? `+${formatCurrency(summary.businessIncome)}${t.common.perMonth}`
          : formatDeltaSummary(businessPnl, businessPct),
      subtextTone: summary.businessIncome > 0 || businessPnl > 0 ? 'pos' : 'neutral',
      wavePath: WAVE_PATHS[5],
      onClick: () => onNavigate('businesses'),
    },
  ];

  // Active sheet computation (for slider market cards)
  const sheetData = useMemo(() => {
    if (activeCategory === 'overview' || activeCategory === 'real_estate') return null;

    if (activeCategory === 'stocks' || activeCategory === 'gold') {
      const def =
        activeCategory === 'gold'
          ? GOLD_DEF
          : EQUITY_CATALOG.find((s) => s.symbol === selectedStockSym) ?? EQUITY_CATALOG[0];
      const mkt = game.market.stocks[def.symbol];
      const unitPrice = mkt?.currentPrice ?? def.basePrice;
      const chartValues = buildDisplaySeries(
        def.symbol,
        mkt?.priceHistory ?? [unitPrice],
        def.basePrice,
        def.volatility
      );

      const recentReturnPct =
        chartValues.length >= 2 && chartValues[chartValues.length - 6 >= 0 ? chartValues.length - 6 : 0] > 0
          ? ((unitPrice - chartValues[Math.max(0, chartValues.length - 6)]) /
              chartValues[Math.max(0, chartValues.length - 6)]) *
            100
          : ((unitPrice - def.basePrice) / def.basePrice) * 100;
      const divYieldPct = unitPrice > 0 ? (def.annualDividendPerShare / unitPrice) * 100 : 0;
      const fiveYrPct = Math.round(((unitPrice - def.basePrice) / def.basePrice) * 65 + divYieldPct * 4.2);
      const tenYrPct = Math.round(((unitPrice - def.basePrice) / def.basePrice) * 45 + divYieldPct * 7.8);

      const categoryHoldings = activeCategory === 'gold' ? (goldHolding ? [goldHolding] : []) : equityHoldings;
      const investedValue = activeCategory === 'gold' ? goldVal : equityVal;
      const pnl = activeCategory === 'gold' ? goldPnl : equityPnl;
      const pnlPct = activeCategory === 'gold' ? goldPct : equityPct;

      let qtyLine = '';
      if (categoryHoldings.length === 1) {
        const h = categoryHoldings[0];
        qtyLine = `${t.market.quantityLabel}: ${h.shares} @ ${formatCleanMoney(h.avgBuyPrice)}`;
      } else if (categoryHoldings.length > 1) {
        const totalShares = categoryHoldings.reduce((acc, h) => acc + h.shares, 0);
        qtyLine = `${t.market.quantityLabel}: ${totalShares} (${categoryHoldings.length} ${t.market.positionsSuffix})`;
      }

      const selectedHolding = categoryHoldings.find((h) => h.symbol === def.symbol);
      const isWithdraw = tradeMode === 'withdraw';
      const maxSteps = isWithdraw
        ? Math.max(0, selectedHolding?.shares ?? 0)
        : Math.max(0, Math.floor(summary.cashAsset / unitPrice));
      const clampedSteps = Math.min(sliderStep, maxSteps);
      const actionAmount = roundMoney(clampedSteps * unitPrice);
      const actionUnitsLabel =
        isWithdraw && clampedSteps > 0 ? `${clampedSteps} ${t.common.sharesShort}` : '';

      const matched = isStockMatchedForProfession(game.professionId, def.symbol);
      const monthlyDivPerShare = ((def.annualDividendPerShare * (matched ? 1.2 : 1)) / 12).toFixed(2);

      return {
        category: activeCategory,
        title: activeCategory === 'gold' ? t.market.goldCardTitle : t.market.stocksCardTitle,
        priceLabel: `${t.market.currentPriceLabel} ${formatCleanMoney(unitPrice)}`,
        helpText:
          (activeCategory === 'gold' ? t.market.helpGold : t.market.helpStocks) +
          ` ($${monthlyDivPerShare}/${t.common.sharesShort}${t.common.perMonth})`,
        stat1: Math.round(recentReturnPct),
        stat5: fiveYrPct,
        stat10: tenYrPct,
        chartValues,
        investedValue,
        pnl,
        pnlPct,
        qtyLine,
        maxSteps,
        clampedSteps,
        actionAmount,
        actionUnitsLabel,
        canConfirm: isWithdraw
          ? clampedSteps > 0 && (selectedHolding?.shares ?? 0) >= clampedSteps
          : clampedSteps > 0 && actionAmount <= summary.cashAsset,
        onConfirm: () => {
          if (clampedSteps <= 0) return;
          if (isWithdraw) {
            onSellStock(def.symbol, clampedSteps);
          } else {
            onBuyStock(def.symbol, clampedSteps);
          }
          setSliderStep(0);
        },
        ensureWithdrawSelection: () => {
          if (activeCategory === 'stocks' && !selectedHolding && equityHoldings[0]) {
            setSelectedStockSym(equityHoldings[0].symbol);
          }
        },
        selectorOptions:
          activeCategory === 'stocks'
            ? EQUITY_CATALOG.map((s) => {
                const loc = localizeStock(s.symbol, language);
                const held = equityHoldings.find((h) => h.symbol === s.symbol);
                const heldPrice = game.market.stocks[s.symbol]?.currentPrice ?? s.basePrice;
                const heldBadge = held ? ` (${formatCurrency(held.shares * heldPrice)})` : '';
                return { id: s.symbol, label: `${loc.symbol} · ${loc.name}${heldBadge}` };
              })
            : null,
        selectedOptionId: def.symbol,
        onSelectOption: (id: string) => {
          setSelectedStockSym(id);
          setSliderStep(0);
        },
      };
    }

    if (activeCategory === 'bonds_savings') {
      const prod =
        FIXED_INCOME_PRODUCTS.find((p) => p.id === selectedBondId) ?? FIXED_INCOME_PRODUCTS[0];
      const matched = isFixedIncomeMatchedForProfession(game.professionId, prod.id);
      const effRate = prod.annualInterestRate + (matched ? 0.01 : 0);
      const oneYr = effRate * 100;
      const fiveYr = (Math.pow(1 + effRate, 5) - 1) * 100;
      const tenYr = (Math.pow(1 + effRate, 10) - 1) * 100;

      const chartValues = buildDisplaySeries(prod.id, [], 100, 0.02, true, effRate);

      const isWithdraw = tradeMode === 'withdraw';
      const heldProdTotal = roundMoney(
        game.fixedIncome
          .filter((f) => f.productId === prod.id)
          .reduce((acc, f) => acc + Math.max(0, f.currentValue), 0)
      );

      let maxSteps = 0;
      let clampedSteps = 0;
      let actionAmount = 0;

      if (isWithdraw) {
        maxSteps = heldProdTotal <= 0 ? 0 : heldProdTotal < 100 ? Math.max(1, Math.round(heldProdTotal)) : 100;
        clampedSteps = Math.min(sliderStep, maxSteps);
        actionAmount =
          clampedSteps <= 0 || maxSteps <= 0
            ? 0
            : clampedSteps >= maxSteps
              ? heldProdTotal
              : Math.min(heldProdTotal, Math.max(1, Math.round((heldProdTotal * clampedSteps) / maxSteps)));
      } else {
        const canAffordMin = summary.cashAsset >= prod.minAmount;
        const dollarStep = 100;
        maxSteps = canAffordMin
          ? 1 + Math.floor((summary.cashAsset - prod.minAmount) / dollarStep)
          : 0;
        clampedSteps = Math.min(sliderStep, maxSteps);
        actionAmount =
          clampedSteps <= 0
            ? 0
            : roundMoney(prod.minAmount + (clampedSteps - 1) * dollarStep);
      }

      const qtyLine =
        game.fixedIncome.length > 0
          ? `${t.market.quantityLabel}: ${game.fixedIncome.length} ${t.market.positionsSuffix} (+${formatCurrency(summary.interestIncome)}${t.common.perMonth})`
          : '';

      return {
        category: 'bonds_savings' as const,
        title: t.market.bondsCardTitle,
        priceLabel: `${t.market.annualYieldLabel} ${(effRate * 100).toFixed(1)}% ${t.common.apy}`,
        helpText: t.market.helpBonds,
        stat1: Number(oneYr.toFixed(1)),
        stat5: Math.round(fiveYr),
        stat10: Math.round(tenYr),
        chartValues,
        investedValue: fixedVal,
        pnl: fixedReturn,
        pnlPct: fixedPct,
        qtyLine,
        maxSteps,
        clampedSteps,
        actionAmount,
        actionUnitsLabel: '',
        canConfirm: isWithdraw
          ? actionAmount > 0 && heldProdTotal > 0
          : actionAmount >= prod.minAmount && actionAmount <= summary.cashAsset,
        onConfirm: () => {
          if (isWithdraw) {
            if (actionAmount <= 0) return;
            onWithdrawFixedAmount(prod.id, actionAmount);
          } else {
            if (actionAmount < prod.minAmount) return;
            onInvestFixed(prod.id, actionAmount);
          }
          setSliderStep(0);
        },
        ensureWithdrawSelection: () => {
          if (heldProdTotal <= 0 && game.fixedIncome[0]) {
            setSelectedBondId(game.fixedIncome[0].productId);
          }
        },
        selectorOptions: FIXED_INCOME_PRODUCTS.map((p) => {
          const loc = localizeFixedIncome(p.id, p.name, language);
          const rate = ((p.annualInterestRate + (isFixedIncomeMatchedForProfession(game.professionId, p.id) ? 0.01 : 0)) * 100).toFixed(1);
          const pHeld = game.fixedIncome
            .filter((f) => f.productId === p.id)
            .reduce((acc, f) => acc + Math.max(0, f.currentValue), 0);
          const heldBadge = pHeld > 0 ? ` · ${formatCurrency(pHeld)}` : '';
          return { id: p.id, label: `${loc.name} (${rate}%)${heldBadge}` };
        }),
        selectedOptionId: prod.id,
        onSelectOption: (id: string) => {
          setSelectedBondId(id);
          setSliderStep(0);
        },
      };
    }

    // Crypto
    const coin = CRYPTO_CATALOG.find((c) => c.symbol === selectedCryptoSym) ?? CRYPTO_CATALOG[0];
    const mkt = game.market.crypto[coin.symbol];
    const unitPrice = mkt?.currentPrice ?? coin.basePrice;
    const chartValues = buildDisplaySeries(
      coin.symbol,
      mkt?.priceHistory ?? [unitPrice],
      coin.basePrice,
      coin.volatility
    );

    const recentIdx = Math.max(0, chartValues.length - 6);
    const recentReturnPct =
      chartValues[recentIdx] > 0
        ? ((unitPrice - chartValues[recentIdx]) / chartValues[recentIdx]) * 100
        : 0;
    const fiveYrPct = Math.round(((unitPrice - coin.basePrice) / coin.basePrice) * 85 + 24);
    const tenYrPct = Math.round(((unitPrice - coin.basePrice) / coin.basePrice) * 60 + 42);

    const isWithdraw = tradeMode === 'withdraw';
    const heldCoin = game.crypto.find((c) => c.symbol === coin.symbol);
    const heldUnits = heldCoin?.units ?? 0;
    const heldCoinVal = roundMoney(heldUnits * unitPrice);

    let maxSteps = 0;
    let clampedSteps = 0;
    let unitsToTrade = 0;
    let actionAmount = 0;

    if (isWithdraw) {
      maxSteps = heldUnits <= 0 ? 0 : Math.min(100, Math.max(10, Math.round(heldUnits * 100)));
      clampedSteps = Math.min(sliderStep, maxSteps);
      if (clampedSteps > 0 && maxSteps > 0) {
        if (clampedSteps >= maxSteps) {
          unitsToTrade = heldUnits;
          actionAmount = heldCoinVal;
        } else {
          unitsToTrade = Math.min(
            heldUnits,
            Math.max(0.01, Math.round(((heldUnits * clampedSteps) / maxSteps) * 100) / 100)
          );
          actionAmount = roundMoney(unitsToTrade * unitPrice);
        }
      }
    } else {
      const canAffordMinUnit = Math.floor((summary.cashAsset / unitPrice) * 100) / 100 >= 0.01;
      const baseStep = summary.cashAsset >= 2000 ? 100 : summary.cashAsset >= 200 ? 10 : 1;
      const dollarStep =
        canAffordMinUnit &&
        Math.floor(((Math.floor(summary.cashAsset / baseStep) * baseStep) / unitPrice) * 100) / 100 < 0.01
          ? 1
          : baseStep;
      maxSteps = canAffordMinUnit
        ? Math.max(0, Math.floor(summary.cashAsset / dollarStep))
        : 0;
      clampedSteps = Math.min(sliderStep, maxSteps);
      const rawDollar = clampedSteps * dollarStep;
      unitsToTrade = Math.floor((rawDollar / unitPrice) * 100) / 100;
      actionAmount = roundMoney(unitsToTrade * unitPrice);
    }

    let qtyLine = '';
    if (game.crypto.length === 1) {
      const c = game.crypto[0];
      qtyLine = `${t.market.quantityLabel}: ${c.units} @ ${formatCleanMoney(c.avgBuyPrice)}`;
    } else if (game.crypto.length > 1) {
      const totalUnits = roundMoney(game.crypto.reduce((acc, c) => acc + c.units, 0));
      qtyLine = `${t.market.quantityLabel}: ${totalUnits} (${game.crypto.length} ${t.market.positionsSuffix})`;
    }

    const coinLoc = localizeCrypto(coin.symbol, language);

    return {
      category: 'crypto' as const,
      title: t.market.cryptoCardTitle,
      priceLabel: `${t.market.currentPriceLabel} ${formatCleanMoney(unitPrice)}`,
      helpText: t.market.helpCrypto,
      stat1: Math.round(recentReturnPct),
      stat5: fiveYrPct,
      stat10: tenYrPct,
      chartValues,
      investedValue: cryptoVal,
      pnl: cryptoPnl,
      pnlPct: cryptoPct,
      qtyLine,
      maxSteps,
      clampedSteps,
      actionAmount,
      actionUnitsLabel: isWithdraw && unitsToTrade > 0 ? `${unitsToTrade} ${coinLoc.symbol}` : '',
      canConfirm: unitsToTrade > 0 && (isWithdraw ? heldUnits > 0 : actionAmount <= summary.cashAsset),
      onConfirm: () => {
        if (unitsToTrade <= 0) return;
        if (isWithdraw) {
          onSellCrypto(coin.symbol, unitsToTrade);
        } else {
          onBuyCrypto(coin.symbol, unitsToTrade);
        }
        setSliderStep(0);
      },
      ensureWithdrawSelection: () => {
        if (!heldCoin && game.crypto[0]) {
          setSelectedCryptoSym(game.crypto[0].symbol);
        }
      },
      selectorOptions: CRYPTO_CATALOG.map((c) => {
        const loc = localizeCrypto(c.symbol, language);
        const held = game.crypto.find((h) => h.symbol === c.symbol);
        const heldPrice = game.market.crypto[c.symbol]?.currentPrice ?? c.basePrice;
        const heldBadge = held ? ` (${formatCurrency(held.units * heldPrice)})` : '';
        return { id: c.symbol, label: `${loc.symbol} · ${loc.name}${heldBadge}` };
      }),
      selectedOptionId: coin.symbol,
      onSelectOption: (id: string) => {
        setSelectedCryptoSym(id);
        setSliderStep(0);
      },
    };
  }, [
    activeCategory,
    selectedStockSym,
    selectedCryptoSym,
    selectedBondId,
    tradeMode,
    sliderStep,
    game,
    summary.cashAsset,
    summary.interestIncome,
    goldHolding,
    goldVal,
    goldPnl,
    goldPct,
    equityHoldings,
    equityVal,
    equityPnl,
    equityPct,
    fixedVal,
    fixedReturn,
    fixedPct,
    cryptoVal,
    cryptoPnl,
    cryptoPct,
    t,
    language,
    onBuyStock,
    onSellStock,
    onInvestFixed,
    onWithdrawFixedAmount,
    onBuyCrypto,
    onSellCrypto,
  ]);

  // Automatically return to invest mode if category holdings drop to zero
  useEffect(() => {
    if (tradeMode === 'withdraw' && sheetData && sheetData.investedValue <= 0) {
      setTradeMode('invest');
      setSliderStep(0);
    }
  }, [tradeMode, sheetData]);

  return (
    <>
      <div
        className={
          activeCategory !== 'overview'
            ? 'max-sm:fixed max-sm:inset-x-0 max-sm:top-[152px] max-sm:px-4 max-sm:z-10 max-sm:pointer-events-none space-y-5'
            : 'space-y-5'
        }
      >
        {/* Section Heading */}
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white px-0.5">
          {t.investmentsLabel}
        </h2>

        {/* Wavy Cream Investment Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overviewCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={card.onClick}
              className="group relative overflow-hidden rounded-3xl bg-[#F6E7D7] hover:bg-[#FAF0E6] p-5 text-left text-[#26201C] shadow-xl transition-all min-h-[150px] flex flex-col justify-between"
            >
              <svg
                viewBox="0 0 360 120"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                <path
                  d={card.wavePath}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeOpacity="0.72"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              </svg>

              <div className="relative z-10 flex items-center gap-2.5">
                <TrendingUp className="h-5 w-5 text-[#26201C] shrink-0" />
                <span className="font-display text-xl font-bold text-[#26201C]">
                  {card.title}
                </span>
              </div>

              <div className="relative z-10 text-right pt-6">
                <div className="flex items-baseline justify-end gap-2">
                  <span className="text-sm sm:text-base font-semibold text-[#5E544C] whitespace-nowrap">
                    {card.label}
                  </span>
                  <span className="font-mono text-2xl sm:text-4xl font-bold text-[#26201C] tabular-nums whitespace-nowrap">
                    {formatCurrency(card.amount)}
                  </span>
                </div>
                <div
                  className={`mt-1 font-mono text-sm sm:text-base font-bold tabular-nums ${
                    card.subtextTone === 'pos'
                      ? 'text-[#169C5E]'
                      : card.subtextTone === 'neg'
                        ? 'text-[#DC2626]'
                        : 'text-[#5E544C]'
                  }`}
                >
                  {card.subtext}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cream Investment Sheet Modal (Matches Reference Screenshots 1 & 2) */}
      {sheetData && (
        <div
          className="relative z-50 min-h-[100dvh] bg-black/50 backdrop-blur-[2px] flex items-end pt-10 sm:fixed sm:inset-0 sm:lg:left-64 sm:items-center sm:justify-center sm:p-6"
          onClick={() => {
            setTradeMode('invest');
            setSliderStep(0);
            setActiveCategory('overview');
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={sheetData.title}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg sm:max-h-[90dvh] sm:overflow-y-auto overscroll-contain rounded-t-[26px] sm:rounded-3xl bg-[#F6E7D7] text-[#26201C] px-4 sm:px-5 pt-4 pb-[calc(24px+env(safe-area-inset-bottom,0px))] shadow-2xl"
          >
            {/* Top Row: Invested Badge, Cash Badge, Close Chevron */}
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-2xl bg-white px-3 py-2.5 text-center shadow-sm min-w-0">
                <PiggyBank className="h-6 w-6 text-[#3B9AE1] mx-auto" />
                <div className="mt-0.5 font-mono text-lg sm:text-xl font-bold text-[#1E2129] tabular-nums truncate">
                  {formatCleanMoney(
                    tradeMode === 'withdraw'
                      ? Math.max(0, sheetData.investedValue - sheetData.actionAmount)
                      : sheetData.investedValue
                  )}
                </div>
              </div>

              <div className="flex-1 rounded-2xl bg-white px-3 py-2.5 text-center shadow-sm min-w-0">
                <Banknote className="h-6 w-6 text-[#169C5E] mx-auto" />
                <div className="mt-0.5 font-mono text-lg sm:text-xl font-bold text-[#1E2129] tabular-nums truncate">
                  {formatCleanMoney(
                    tradeMode === 'withdraw'
                      ? summary.cashAsset + sheetData.actionAmount
                      : Math.max(0, summary.cashAsset - sheetData.actionAmount)
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTradeMode('invest');
                  setSliderStep(0);
                  setActiveCategory('overview');
                }}
                aria-label={t.common.close}
                className="h-12 w-12 shrink-0 rounded-2xl bg-white hover:bg-white/85 flex items-center justify-center shadow-sm transition-colors"
              >
                <ChevronDown className="h-6 w-6 text-[#1E2129] stroke-[2.5]" />
              </button>
            </div>

            {/* Title & (?) Help Row */}
            <div className="mt-5 flex items-center justify-between gap-3">
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#1E2129]">
                {sheetData.title}
              </h3>

              <button
                type="button"
                onClick={() => setShowHelp((v) => !v)}
                aria-label={t.market.infoHelpAria}
                aria-expanded={showHelp}
                className="h-9 w-9 shrink-0 rounded-full border-2 border-[#4B443E] text-[#4B443E] font-bold text-base flex items-center justify-center hover:bg-white/60 transition-colors"
              >
                ?
              </button>
            </div>

            {/* Current Price / APY + Quiet Instrument Selector */}
            <div className="mt-1.5 flex items-center justify-between gap-2 flex-wrap">
              <div className="font-display text-base sm:text-lg font-bold text-[#3B3530] tabular-nums">
                {sheetData.priceLabel}
              </div>

              {sheetData.selectorOptions && (
                <select
                  aria-label={sheetData.title}
                  value={sheetData.selectedOptionId}
                  onChange={(e) => sheetData.onSelectOption(e.target.value)}
                  className="max-w-[175px] min-h-[34px] rounded-xl bg-white/75 border border-[#E2CEB9] px-2.5 py-1 text-xs font-bold text-[#26201C] focus:outline-none truncate"
                >
                  {sheetData.selectorOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Expandable Help Note */}
            {showHelp && (
              <div className="mt-3 rounded-2xl bg-white/85 border border-[#E2CEB9] px-3.5 py-2.5 text-xs sm:text-sm text-[#4B443E] leading-relaxed">
                {sheetData.helpText}
              </div>
            )}

            {/* 3-Column Period Return Stats (1 yr / 5 yr / 10 yr) */}
            <div className="mt-5 grid grid-cols-3 text-center">
              {[
                { label: t.market.period1Yr, val: sheetData.stat1 },
                { label: t.market.period5Yr, val: sheetData.stat5 },
                { label: t.market.period10Yr, val: sheetData.stat10 },
              ].map((col) => (
                <div key={col.label}>
                  <div className="text-xs sm:text-sm font-medium text-[#756A60]">{col.label}</div>
                  <div
                    className={`mt-0.5 font-mono text-base sm:text-lg font-bold tabular-nums ${
                      col.val < 0 ? 'text-[#DC2626]' : 'text-[#169C5E]'
                    }`}
                  >
                    {col.val}%
                  </div>
                </div>
              ))}
            </div>

            {/* Smooth Cream-Backdrop White Line Chart */}
            <div className="mt-3">
              <CreamSplineChart values={sheetData.chartValues} />
            </div>

            {/* Active Holdings & Yellow Dollar-in-Tray Withdraw-Slider Toggle Button */}
            {sheetData.investedValue > 0 && (
              <>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-2xl sm:text-3xl font-bold text-[#26201C] tabular-nums">
                      {formatCleanMoney(sheetData.investedValue)}
                    </div>
                    <div
                      className={`font-mono text-sm sm:text-base font-bold tabular-nums ${
                        sheetData.pnl < 0 ? 'text-[#DC2626]' : 'text-[#169C5E]'
                      }`}
                    >
                      {sheetData.pnl < 0 ? '-' : ''}
                      {formatCleanMoney(Math.abs(sheetData.pnl))} ({Math.round(sheetData.pnlPct)}%)
                    </div>
                    {sheetData.qtyLine && (
                      <div className="mt-0.5 text-sm sm:text-base font-semibold text-[#3B3530] tabular-nums">
                        {sheetData.qtyLine}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    aria-pressed={tradeMode === 'withdraw'}
                    onClick={() => {
                      setSliderStep(0);
                      if (tradeMode === 'withdraw') {
                        setTradeMode('invest');
                      } else {
                        sheetData.ensureWithdrawSelection();
                        setTradeMode('withdraw');
                      }
                    }}
                    aria-label={t.market.withdrawAllAria}
                    className={`h-12 w-16 shrink-0 rounded-2xl active:scale-95 flex items-center justify-center shadow-sm transition-all ${
                      tradeMode === 'withdraw'
                        ? 'bg-[#1E2129] ring-2 ring-[#F7CA44]'
                        : 'bg-[#F7CA44] hover:bg-[#EBBF36]'
                    }`}
                  >
                    <DollarWithdrawTrayIcon
                      className="h-7 w-7"
                      active={tradeMode === 'withdraw'}
                    />
                  </button>
                </div>

                <div className="my-4 border-t-2 border-dotted border-[#A89C90]/60" />
              </>
            )}

            {/* Slider + Action Button (Invest Mode or Withdraw-to-Balance Mode) */}
            <div className={sheetData.investedValue > 0 ? 'space-y-3' : 'mt-4 space-y-3'}>
              {tradeMode === 'withdraw' && (
                <div className="flex items-center justify-between gap-2 px-0.5">
                  <span className="text-xs sm:text-sm font-bold text-[#169C5E]">
                    {t.market.withdrawModeLabel}
                    {sheetData.actionUnitsLabel ? ` (${sheetData.actionUnitsLabel})` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTradeMode('invest');
                      setSliderStep(0);
                    }}
                    className="rounded-xl bg-white/85 hover:bg-white border border-[#DFCBB5] px-2.5 py-1 text-xs font-bold text-[#26201C] transition-colors"
                  >
                    {t.market.backToInvestBtn}
                  </button>
                </div>
              )}

              <div className="text-center font-mono text-2xl sm:text-3xl font-bold text-[#26201C] tabular-nums">
                {formatCleanMoney(sheetData.actionAmount)}
              </div>

              <div className="px-1">
                <SmoothRangeSlider
                  ariaLabel={
                    tradeMode === 'withdraw' ? t.market.withdrawToBalanceBtn : t.market.investBtn
                  }
                  max={sheetData.maxSteps}
                  disabled={sheetData.maxSteps <= 0}
                  value={sheetData.clampedSteps}
                  onChange={setSliderStep}
                />
              </div>

              {sheetData.maxSteps <= 0 && (
                <div className="text-center text-xs font-semibold text-[#DC2626]">
                  {tradeMode === 'withdraw'
                    ? t.market.noHoldingSelected
                    : language === 'bn'
                      ? 'মূল ব্যালেন্সে পর্যাপ্ত টাকা নেই'
                      : 'Insufficient main balance'}
                </div>
              )}

              <button
                type="button"
                disabled={!sheetData.canConfirm}
                onClick={sheetData.onConfirm}
                className="w-full min-h-[52px] rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#F7CA44] text-base sm:text-lg font-bold text-[#1E2129] shadow-sm transition-all"
              >
                {tradeMode === 'withdraw' ? t.market.withdrawToBalanceBtn : t.market.investBtn}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Real Estate Cream Investment Sheet (Matches Reference Screenshot) */}
      {activeCategory === 'real_estate' && (
        <div
          className="relative z-50 min-h-[100dvh] bg-black/50 backdrop-blur-[2px] flex items-end pt-10 sm:fixed sm:inset-0 sm:lg:left-64 sm:items-center sm:justify-center sm:p-6"
          onClick={() => setActiveCategory('overview')}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.market.realEstateCardTitle}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg sm:max-h-[92dvh] sm:overflow-y-auto overscroll-contain rounded-t-[26px] sm:rounded-3xl bg-[#F6E7D7] text-[#26201C] px-4 sm:px-5 pt-3.5 pb-[calc(24px+env(safe-area-inset-bottom,0px))] shadow-2xl"
          >
            {/* Top Row: Invested Badge, Cash Badge, Close Chevron */}
            <div className="flex items-center gap-2.5">
              <div className="flex-1 rounded-2xl bg-white px-3 py-2 text-center shadow-sm min-w-0">
                <PiggyBank className="h-5 w-5 sm:h-6 sm:w-6 text-[#3B9AE1] mx-auto" />
                <div className="mt-0.5 font-mono text-base sm:text-xl font-bold text-[#1E2129] tabular-nums truncate">
                  {formatCleanMoney(summary.realEstateAsset)}
                </div>
              </div>

              <div className="flex-1 rounded-2xl bg-white px-3 py-2 text-center shadow-sm min-w-0">
                <Banknote className="h-5 w-5 sm:h-6 sm:w-6 text-[#169C5E] mx-auto" />
                <div className="mt-0.5 font-mono text-base sm:text-xl font-bold text-[#1E2129] tabular-nums truncate">
                  {formatCleanMoney(summary.cashAsset)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveCategory('overview')}
                aria-label={t.common.close}
                className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-2xl bg-white hover:bg-white/85 flex items-center justify-center shadow-sm transition-colors"
              >
                <ChevronDown className="h-6 w-6 text-[#1E2129] stroke-[2.5]" />
              </button>
            </div>

            {/* Title & (?) Help Row */}
            <div className="mt-3 flex items-center justify-between gap-3">
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#1E2129]">
                {t.market.realEstateCardTitle}
              </h3>

              <button
                type="button"
                onClick={() => setShowHelp((v) => !v)}
                aria-label={t.market.infoHelpAria}
                aria-expanded={showHelp}
                className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-full border-2 border-[#4B443E] text-[#4B443E] font-bold text-sm sm:text-base flex items-center justify-center hover:bg-white/60 transition-colors"
              >
                ?
              </button>
            </div>

            {showHelp && (
              <div className="mt-2.5 rounded-2xl bg-white/85 border border-[#E2CEB9] px-3.5 py-2 text-xs sm:text-sm text-[#4B443E] leading-relaxed">
                {t.market.helpRealEstate}
              </div>
            )}

            {/* Rental Yield Legend Table */}
            <div className="mt-2.5">
              <div className="grid grid-cols-12 items-center text-xs sm:text-sm font-semibold text-[#756A60] mb-1 px-1">
                <div className="col-span-7" />
                <div className="col-span-5 text-center">{t.market.rentalYieldHeader}</div>
              </div>
              <div className="space-y-1 px-1">
                {[
                  {
                    color: '#60B5F7',
                    name: t.market.reTierEconomy,
                    yieldTxt: t.market.reYieldEconomy,
                  },
                  {
                    color: '#A78BFA',
                    name: t.market.reTierStandard,
                    yieldTxt: t.market.reYieldStandard,
                  },
                  {
                    color: '#DED03A',
                    name: t.market.reTierPremium,
                    yieldTxt: t.market.reYieldPremium,
                  },
                  {
                    color: '#F98D46',
                    name: t.market.reTierLuxury,
                    yieldTxt: t.market.reYieldLuxury,
                  },
                ].map((row) => (
                  <div key={row.name} className="grid grid-cols-12 items-center text-sm sm:text-base">
                    <div className="col-span-7 flex items-center gap-2 min-w-0">
                      <span
                        className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="font-medium text-[#5E544C] truncate">{row.name}</span>
                    </div>
                    <div className="col-span-5 text-center font-mono font-semibold text-[#5E544C] tabular-nums">
                      {row.yieldTxt}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4-Line Multi-Color Real Estate Chart */}
            <div className="mt-2">
              <RealEstateMultiSplineChart />
            </div>

            {/* Horizontal Scrollable Pastel Property Tier Cards */}
            <div className="mt-2.5 -mx-4 sm:-mx-5 px-4 sm:px-5 flex items-stretch gap-3.5 overflow-x-auto overscroll-x-contain touch-pan-x touch-pan-y pb-1.5 snap-x snap-mandatory">
              {REAL_ESTATE_TIERS.map((item) => {
                const canAfford = summary.cashAsset >= item.listing.purchasePrice;
                const tierLabel =
                  item.tier === 'economy'
                    ? t.market.reTierEconomy
                    : item.tier === 'standard'
                      ? t.market.reTierStandard
                      : item.tier === 'premium'
                        ? t.market.reTierPremium
                        : t.market.reTierLuxury;
                const ownedOfTier = game.properties.filter(
                  (p) => p.name === item.listing.name
                ).length;

                return (
                  <div
                    key={item.tier}
                    className={`w-[196px] sm:w-[215px] shrink-0 snap-start rounded-[24px] ${item.gradientClass} px-3.5 py-3.5 text-center flex flex-col items-center justify-between shadow-md`}
                  >
                    <div className="w-full shrink-0">
                      <div className="font-display text-base sm:text-lg font-bold text-[#1E2129] leading-snug">
                        {tierLabel}
                      </div>
                      {ownedOfTier > 0 && (
                        <div className="mt-0.5 text-xs font-bold text-[#26201C]/75">
                          {t.dashboard.ownedBadge}: {ownedOfTier}
                        </div>
                      )}
                    </div>

                    <div className="my-1.5 flex items-center justify-center shrink-0">
                      <RealEstateTierIllustration tier={item.tier} className="w-28 h-24" />
                    </div>

                    <div className="w-full space-y-2 shrink-0">
                      <div className="font-mono text-2xl sm:text-3xl font-bold text-[#3B3530] tabular-nums">
                        {formatCurrency(item.listing.purchasePrice)}
                      </div>

                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => onBuyProperty(item.listing, false)}
                        className={`w-full min-h-[42px] rounded-2xl text-sm sm:text-base font-bold transition-all shadow-sm ${
                          canAfford
                            ? 'bg-[#F7CA44] hover:bg-[#EBBF36] active:scale-[0.98] text-[#1E2129]'
                            : 'bg-[#8A8C8F] text-white/95 cursor-not-allowed'
                        }`}
                      >
                        {t.market.investBtn}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Owned Properties Quick Sell List (only rendered when player owns properties) */}
            {game.properties.length > 0 && (
              <div className="mt-4 pt-4 border-t-2 border-dotted border-[#A89C90]/60 space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#665B53]">
                  {t.properties.ownedTitle} ({game.properties.length})
                </div>
                <div className="space-y-2">
                  {game.properties.map((prop) => {
                    const loc = localizeProperty(prop.name, prop.location, undefined, language);
                    const isFit = isPropertyMatchedForProfession(game.professionId, prop.type);
                    const effRent = isFit
                      ? Math.round(prop.monthlyRentalIncome * 1.12)
                      : prop.monthlyRentalIncome;
                    const linkedLoan = prop.loanId
                      ? game.loans.find((l) => l.id === prop.loanId)
                      : undefined;
                    const netFlow = effRent - prop.maintenanceExpense - (linkedLoan?.monthlyPayment ?? 0);
                    return (
                      <div
                        key={prop.id}
                        className="rounded-2xl bg-white/90 px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-[#26201C] truncate">
                            {loc.name}
                          </div>
                          <div className="font-mono text-xs text-[#169C5E] font-bold tabular-nums">
                            {formatCurrency(prop.currentValue)} · {formatCurrency(netFlow, true)}
                            {t.common.perMonth}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onSellProperty(prop.id)}
                          aria-label={t.properties.sellBtn}
                          className="h-10 w-12 shrink-0 rounded-xl bg-[#F7CA44] hover:bg-[#EBBF36] active:scale-95 flex items-center justify-center shadow-sm transition-all"
                        >
                          <DollarWithdrawTrayIcon className="h-6 w-6" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
