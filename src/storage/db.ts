import offlineBatRaw from '../../CASHFLOW-Offline.bat?raw';
import {
  rollMonthlyHappinessItems,
  rollVenturesForProfession,
  withPilgrimageHappinessItems,
} from '../data/lifestyle';
import { GameSettings, GameState } from '../types/game';

const DB_NAME = 'cashflow_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'game_saves';
const SAVE_KEY = 'active_save';
const SETTINGS_KEY = 'cashflow_settings_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  language: 'en',
  confirmNextMonth: false,
  autoShowTurnSummary: false,
  ignoreEvents: false,
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
  });
}

let storageQueue: Promise<unknown> = Promise.resolve();

function enqueueStorage<T>(task: () => Promise<T>): Promise<T> {
  const next = storageQueue.then(task, task);
  storageQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

const isFileOrigin =
  typeof window !== 'undefined' && window.location.protocol === 'file:';

const SAVE_CLEARED_KEY = 'cashflow_save_cleared';

export async function saveGameToIndexedDB(state: GameState): Promise<void> {
  try {
    localStorage.removeItem(SAVE_CLEARED_KEY);
  } catch {
    // ignore
  }
  return enqueueStorage(async () => {
    if (isFileOrigin) {
      try {
        localStorage.setItem('cashflow_fallback_save', JSON.stringify(state));
      } catch {
        // ignore quota error
      }
      return;
    }
    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(state, SAVE_KEY);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error ?? new Error('Failed to write save to IndexedDB'));
        };
      });
    } catch {
      // Fallback to localStorage if IndexedDB is blocked in restricted contexts
      try {
        localStorage.setItem('cashflow_fallback_save', JSON.stringify(state));
      } catch {
        // ignore quota error
      }
    }
  });
}

export async function loadGameFromIndexedDB(): Promise<GameState | null> {
  return enqueueStorage(async () => {
    try {
      if (localStorage.getItem(SAVE_CLEARED_KEY) === '1') {
        localStorage.removeItem('cashflow_fallback_save');
        return null;
      }
    } catch {
      // ignore
    }

    if (!isFileOrigin) {
      try {
        const db = await openDatabase();
      const result = await new Promise<GameState | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(SAVE_KEY);
        req.onsuccess = () => {
          db.close();
          resolve((req.result as GameState) ?? null);
        };
        req.onerror = () => {
          db.close();
          reject(req.error ?? new Error('Failed to read save'));
        };
      });
      if (result && isValidGameState(result)) {
        return normalizeGameState(result);
      }
      } catch {
        // try fallback
      }
    }

    try {
      const fallback = localStorage.getItem('cashflow_fallback_save');
      if (fallback) {
        const parsed = JSON.parse(fallback);
        if (isValidGameState(parsed)) return normalizeGameState(parsed);
      }
    } catch {
      // ignore
    }
    return null;
  });
}

export async function clearSavedGame(): Promise<void> {
  try {
    localStorage.setItem(SAVE_CLEARED_KEY, '1');
    localStorage.removeItem('cashflow_fallback_save');
  } catch {
    // ignore
  }
  return enqueueStorage(async () => {
    try {
      localStorage.setItem(SAVE_CLEARED_KEY, '1');
      localStorage.removeItem('cashflow_fallback_save');
    } catch {
      // ignore
    }
    if (!isFileOrigin) {
      try {
        const db = await openDatabase();
        await new Promise<void>((resolve) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.delete(SAVE_KEY);
          store.clear();
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => {
            db.close();
            resolve();
          };
        });
      } catch {
        // ignore
      }
    }
  });
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function normalizeGameState(state: GameState): GameState {
  const happiness = typeof state.happiness === 'number' ? state.happiness : 70;
  const isOver = Boolean(state.gameOver || happiness < 50);
  return {
    ...state,
    happiness,
    actionsUsedThisTurn: typeof state.actionsUsedThisTurn === 'number' ? state.actionsUsedThisTurn : 0,
    monthlyExpensePaidThisTurn: Boolean(state.monthlyExpensePaidThisTurn),
    monthlyExpensePaidAmountThisTurn:
      typeof state.monthlyExpensePaidAmountThisTurn === 'number'
        ? state.monthlyExpensePaidAmountThisTurn
        : 0,
    healthInsured: Boolean(state.healthInsured),
    propertyInsured: Boolean(state.propertyInsured),
    personalAssets: Array.isArray(state.personalAssets) ? state.personalAssets : [],
    activeVentures:
      state.activeVentures && state.activeVentures.length > 0
        ? state.activeVentures
        : rollVenturesForProfession(state.professionId, 2),
    activeHappinessItems: withPilgrimageHappinessItems(
      state.activeHappinessItems && state.activeHappinessItems.length > 0
        ? state.activeHappinessItems
        : rollMonthlyHappinessItems(state.professionId, 5),
      state.professionId
    ),
    purchasedHappinessIdsThisTurn: Array.isArray(state.purchasedHappinessIdsThisTurn)
      ? state.purchasedHappinessIdsThisTurn
      : [],
    handledHappinessIdsThisTurn: Array.isArray(state.handledHappinessIdsThisTurn)
      ? state.handledHappinessIdsThisTurn
      : [],
    ignoredHappinessIdsThisTurn: Array.isArray(state.ignoredHappinessIdsThisTurn)
      ? state.ignoredHappinessIdsThisTurn
      : [],
    pendingOpportunityDeals: Array.isArray(state.pendingOpportunityDeals)
      ? state.pendingOpportunityDeals
      : [],
    playedLotteryIdsThisTurn: Array.isArray(state.playedLotteryIdsThisTurn)
      ? state.playedLotteryIdsThisTurn
      : [],
    completedEducationIds: Array.isArray(state.completedEducationIds)
      ? state.completedEducationIds
      : [],
    educationBoostsById:
      state.educationBoostsById && typeof state.educationBoostsById === 'object'
        ? state.educationBoostsById
        : {},
    lastEducationYear: typeof state.lastEducationYear === 'number' ? state.lastEducationYear : 0,
    inflationRate: typeof state.inflationRate === 'number' ? state.inflationRate : 0,
    inflationMultiplier:
      typeof state.inflationMultiplier === 'number' && state.inflationMultiplier > 0
        ? state.inflationMultiplier
        : 1,
    maritalStatus: state.maritalStatus ?? 'single',
    childrenCount: typeof state.childrenCount === 'number' ? state.childrenCount : 0,
    marriageCount: typeof state.marriageCount === 'number' ? state.marriageCount : 0,
    divorceCount: typeof state.divorceCount === 'number' ? state.divorceCount : 0,
    zakatAccrualMonths: typeof state.zakatAccrualMonths === 'number' ? state.zakatAccrualMonths : 0,
    zakatDueBalance: typeof state.zakatDueBalance === 'number' ? state.zakatDueBalance : 0,
    zakatPaidTotal: typeof state.zakatPaidTotal === 'number' ? state.zakatPaidTotal : 0,
    zakatPaidAdvanceThisYear:
      typeof state.zakatPaidAdvanceThisYear === 'number' ? state.zakatPaidAdvanceThisYear : 0,
    zakatHappinessAwardedYear:
      typeof state.zakatHappinessAwardedYear === 'number' ? state.zakatHappinessAwardedYear : 0,
    taxableIncomeYTD: typeof state.taxableIncomeYTD === 'number' ? state.taxableIncomeYTD : 0,
    incomeTaxDueBalance:
      typeof state.incomeTaxDueBalance === 'number' ? state.incomeTaxDueBalance : 0,
    incomeTaxPaidTotal: typeof state.incomeTaxPaidTotal === 'number' ? state.incomeTaxPaidTotal : 0,
    incomeTaxPaidAdvanceThisYear:
      typeof state.incomeTaxPaidAdvanceThisYear === 'number'
        ? state.incomeTaxPaidAdvanceThisYear
        : 0,
    taxHappinessAwardedYear:
      typeof state.taxHappinessAwardedYear === 'number' ? state.taxHappinessAwardedYear : 0,
    gameOver: isOver,
    gameOverTurn: isOver ? state.gameOverTurn ?? state.currentTurn : null,
  };
}

export function isValidGameState(obj: unknown): obj is GameState {
  if (!obj || typeof obj !== 'object') return false;
  const g = obj as Partial<GameState>;
  return (
    typeof g.gameId === 'string' &&
    typeof g.professionId === 'string' &&
    typeof g.currentTurn === 'number' &&
    typeof g.cash === 'number' &&
    typeof g.salary === 'number' &&
    Array.isArray(g.loans) &&
    Array.isArray(g.stocks) &&
    Array.isArray(g.properties) &&
    Array.isArray(g.businesses) &&
    Array.isArray(g.monthlyHistory) &&
    !!g.market
  );
}

export function exportGameDataJson(state: GameState): void {
  const payload = {
    app: 'CASHFLOW',
    exportedAt: new Date().toISOString(),
    gameState: state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cashflow-save-Y${state.year}M${state.month}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function bytesToBase64(bytes: Uint8Array): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      const commaIdx = result.indexOf(',');
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Base64 encoding failed'));
    reader.readAsDataURL(new Blob([bytes.slice().buffer]));
  });
}

function cloneStandaloneHtmlBytesFromDom(): Uint8Array {
  const clone = document.documentElement.cloneNode(true) as HTMLElement;
  const rootEl = clone.querySelector('#root');
  if (rootEl) rootEl.innerHTML = '';
  const htmlString = `<!doctype html>\n${clone.outerHTML}`;
  return new TextEncoder().encode(htmlString);
}

async function loadStandaloneOfflineHtmlBytes(): Promise<Uint8Array> {
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return cloneStandaloneHtmlBytesFromDom();
  }

  try {
    const resp = await fetch(`./CASHFLOW-Offline.html?t=${Date.now()}`, { cache: 'no-store' });
    if (resp.ok) {
      return new Uint8Array(await resp.arrayBuffer());
    }
    if (typeof document !== 'undefined' && !document.querySelector('link[rel="manifest"]')) {
      return cloneStandaloneHtmlBytesFromDom();
    }
    throw new Error(`Offline bundle unavailable (${resp.status})`);
  } catch (err) {
    if (typeof document !== 'undefined' && !document.querySelector('link[rel="manifest"]')) {
      return cloneStandaloneHtmlBytesFromDom();
    }
    throw err instanceof Error ? err : new Error('Offline bundle unavailable');
  }
}

async function tryFetchAssetBytes(url: string): Promise<Uint8Array | null> {
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return null;
  }
  try {
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) return null;
    return new Uint8Array(await resp.arrayBuffer());
  } catch {
    return null;
  }
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function computeCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function deflateRawIfSmaller(
  data: Uint8Array
): Promise<{ payload: Uint8Array; method: 0 | 8 }> {
  if (typeof CompressionStream === 'undefined' || data.length === 0) {
    return { payload: data, method: 0 };
  }
  try {
    const cs = new CompressionStream('deflate-raw');
    const compressedStream = new Blob([data.slice().buffer]).stream().pipeThrough(cs);
    const compressed = new Uint8Array(await new Response(compressedStream).arrayBuffer());
    if (compressed.length < data.length) {
      return { payload: compressed, method: 8 };
    }
  } catch {
    // Fallback to uncompressed STORE when deflate-raw is unsupported
  }
  return { payload: data, method: 0 };
}

interface ZipEntryInput {
  name: string;
  data: Uint8Array;
}

async function buildZipArchive(entries: ZipEntryInput[]): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const now = new Date();
  const dosTime =
    ((now.getHours() & 0x1f) << 11) |
    ((now.getMinutes() & 0x3f) << 5) |
    ((now.getSeconds() >> 1) & 0x1f);
  const dosDate =
    (((Math.max(1980, now.getFullYear()) - 1980) & 0x7f) << 9) |
    (((now.getMonth() + 1) & 0x0f) << 5) |
    (now.getDate() & 0x1f);

  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const crc = computeCrc32(entry.data);
    const { payload, method } = await deflateRawIfSmaller(entry.data);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint16(8, method, true);
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, payload.length, true);
    lv.setUint32(22, entry.data.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, payload);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, method, true);
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, payload.length, true);
    cv.setUint32(24, entry.data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + payload.length;
  }

  let centralSize = 0;
  for (const part of centralParts) centralSize += part.length;

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const totalLength = offset + centralSize + eocd.length;
  const archive = new Uint8Array(totalLength);
  let cursor = 0;
  for (const part of localParts) {
    archive.set(part, cursor);
    cursor += part.length;
  }
  for (const part of centralParts) {
    archive.set(part, cursor);
    cursor += part.length;
  }
  archive.set(eocd, cursor);
  return archive;
}

export async function exportWebIntoAppZip(): Promise<void> {
  let zipBytes: Uint8Array | null = null;

  if (typeof window !== 'undefined' && window.location.protocol !== 'file:') {
    try {
      const resp = await fetch(`./CASHFLOW-WebIntoApp.zip?t=${Date.now()}`, { cache: 'no-store' });
      if (resp.ok) {
        const candidate = new Uint8Array(await resp.arrayBuffer());
        // Verify PK zip magic header so SPA HTML fallback is never saved as a .zip
        if (candidate.length > 4 && candidate[0] === 0x50 && candidate[1] === 0x4b) {
          zipBytes = candidate;
        }
      }
    } catch {
      // Fallback to client-side ZIP assembly
    }
  }

  if (!zipBytes) {
    const indexHtmlBytes = await loadStandaloneOfflineHtmlBytes();
    const entries: ZipEntryInput[] = [{ name: 'index.html', data: indexHtmlBytes }];

    const [iconPngBytes, iconSvgBytes] = await Promise.all([
      tryFetchAssetBytes('./pwa-512x512.png'),
      tryFetchAssetBytes('./icon.svg'),
    ]);
    if (iconPngBytes) {
      entries.push({ name: 'icon.png', data: iconPngBytes });
    }
    if (iconSvgBytes) {
      entries.push({ name: 'icon.svg', data: iconSvgBytes });
    }

    zipBytes = await buildZipArchive(entries);
  }

  const blob = new Blob([zipBytes.slice().buffer], {
    type: 'application/zip',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'CASHFLOW-WebIntoApp.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportOfflineBatLauncher(): Promise<void> {
  const htmlBytes = await loadStandaloneOfflineHtmlBytes();

  let marker = '###CASHFLOW_PAYLOAD_RAW###';
  let payloadBytes = htmlBytes;

  if (typeof CompressionStream !== 'undefined') {
    const cs = new CompressionStream('gzip');
    const compressedStream = new Blob([htmlBytes.slice().buffer]).stream().pipeThrough(cs);
    payloadBytes = new Uint8Array(await new Response(compressedStream).arrayBuffer());
    marker = '###CASHFLOW_PAYLOAD_GZIP###';
  }

  const base64Payload = await bytesToBase64(payloadBytes);
  const baseBat = offlineBatRaw.replace(/\r?\n/g, '\r\n').trimEnd();
  const fullBat = `${baseBat}\r\n\r\n${marker}\r\n${base64Payload}\r\n`;

  const blob = new Blob([fullBat], {
    type: 'application/octet-stream',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'CASHFLOW-Offline.bat';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportedGameJson(rawText: string): GameState | null {
  try {
    const parsed = JSON.parse(rawText);
    const candidate = parsed?.gameState ?? parsed;
    if (isValidGameState(candidate)) {
      return normalizeGameState(candidate);
    }
    return null;
  } catch {
    return null;
  }
}
