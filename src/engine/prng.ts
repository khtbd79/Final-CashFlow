import { LanguageCode } from '../types/game';

export function randomFloat(): number {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const buf = new Uint32Array(1);
    cryptoObj.getRandomValues(buf);
    return buf[0] / 4294967296;
  }
  return Math.random();
}

export function randomSeed(): number {
  return Math.max(1, Math.floor(randomFloat() * 2147483646));
}

export function randomInt(min: number, max: number): number {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  if (hi <= lo) return lo;
  return lo + Math.floor(randomFloat() * (hi - lo + 1));
}

export function randomRange(min: number, max: number): number {
  return min + randomFloat() * (max - min);
}

export function randomPick<T>(items: readonly T[]): T {
  return items[Math.floor(randomFloat() * items.length)] ?? items[0];
}

export function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(randomFloat() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function uid(prefix: string): string {
  const rand = Math.floor(randomFloat() * 1679616).toString(36).padStart(4, '0');
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function roundMoney(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

function formatCompactMillion(dollars: number): string {
  const millions = Math.round((dollars / 1_000_000 + Number.EPSILON) * 100) / 100;
  const formatted = millions.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${formatted} M`;
}

export function formatCurrency(value: number, showSign = false): string {
  const abs = Math.abs(value);
  const roundedCents = Math.round((abs + Number.EPSILON) * 100);
  const formatted =
    roundedCents >= 100_000_000
      ? formatCompactMillion(roundedCents / 100)
      : (() => {
          const hasCents = roundedCents % 100 !== 0;
          return (roundedCents / 100).toLocaleString('en-US', {
            minimumFractionDigits: hasCents ? 2 : 0,
            maximumFractionDigits: hasCents ? 2 : 0,
          });
        })();
  if (value < 0) return `-$${formatted}`;
  if (showSign && value > 0) return `+$${formatted}`;
  return `$${formatted}`;
}

export function formatCurrencyExact(value: number): string {
  const abs = Math.abs(value);
  const roundedCents = Math.round((abs + Number.EPSILON) * 100);
  const formatted =
    roundedCents >= 100_000_000
      ? formatCompactMillion(roundedCents / 100)
      : abs.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  return value < 0 ? `-$${formatted}` : `$${formatted}`;
}

export function formatPercent(ratio: number, showSign = false): string {
  const pct = (ratio * 100).toFixed(1);
  if (showSign && ratio > 0) return `+${pct}%`;
  return `${pct}%`;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_NAMES_BN = [
  'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে',
];

export function formatYearMonth(year: number, month: number, lang: LanguageCode = 'en'): string {
  const idx = (month - 1) % 12;
  if (lang === 'bn') {
    const mName = MONTH_NAMES_BN[idx] ?? 'জানু';
    return `বছর ${year} · ${mName}`;
  }
  const mName = MONTH_NAMES[idx] ?? 'Jan';
  return `Year ${year} · ${mName}`;
}

export function formatShortLabel(year: number, month: number, lang: LanguageCode = 'en'): string {
  const idx = (month - 1) % 12;
  if (lang === 'bn') {
    const mName = MONTH_NAMES_BN[idx] ?? 'জানু';
    return `ব${year} ${mName}`;
  }
  const mName = MONTH_NAMES[idx] ?? 'Jan';
  return `Y${year} ${mName}`;
}

export function formatRelativeMonth(monthsAgo: number, lang: LanguageCode = 'en'): string {
  if (lang === 'bn') {
    return monthsAgo === 0 ? 'বর্তমান' : `-${monthsAgo} মা.`;
  }
  return `M-${monthsAgo}`;
}
