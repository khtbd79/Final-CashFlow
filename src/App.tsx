import { useCallback, useEffect, useMemo, useState } from 'react';
import { sound } from './audio/sound';
import { GameShell } from './components/game/GameShell';
import { GameOverModal } from './components/game/GameOverModal';
import { TurnSummaryModal } from './components/game/TurnSummaryModal';
import { VictoryModal } from './components/game/VictoryModal';
import { AboutScreen } from './components/screens/AboutScreen';
import { HowToPlayScreen } from './components/screens/HowToPlayScreen';
import { MainMenuScreen } from './components/screens/MainMenuScreen';
import { ProfessionSelectScreen } from './components/screens/ProfessionSelectScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { getT } from './data/i18n';
import {
  buildCharacterSignatureOpportunityCard,
  generateTurnEvents,
} from './engine/events';
import { computeFinancialSummary } from './engine/finance';
import {
  advanceMonth,
  applyForLoan,
  automateBusiness,
  buyCrypto,
  buyHappinessItem,
  buyOrStartBusiness,
  buyPersonalAsset,
  buyProperty,
  buyStock,
  completeEducationCourse,
  continueAfterVictory,
  createCustomBusiness,
  createNewGame,
  dismissPendingEvent,
  EngineActionResult,
  ignoreAllPendingEvents,
  ignoreHappinessCard,
  investFixedIncome,
  InvestmentSheetCategory,
  marryPartner,
  payIncomeTax,
  payMonthlyExpenses,
  payZakat,
  playLottery,
  redeemFixedIncome,
  repayLoan,
  resolveEventChoice,
  sellBusiness,
  sellCrypto,
  sellProperty,
  sellStock,
  toggleInsurancePlan,
  togglePersonalAssetInsurance,
  tryCharacterVenture,
  withdrawAllInvestmentsByCategory,
  withdrawFixedIncomeAmount,
} from './engine/gameEngine';
import {
  clearSavedGame,
  DEFAULT_SETTINGS,
  loadGameFromIndexedDB,
  loadSettings,
  saveGameToIndexedDB,
  saveSettings,
} from './storage/db';
import {
  BusinessListing,
  GameScreen,
  GameSettings,
  GameState,
  LoanCategory,
  LotteryTicketId,
  NavSection,
  PersonalAssetId,
  PropertyListing,
  TurnSummary,
} from './types/game';

const SESSION_NAV_KEY = 'cashflow_session_nav_v1';
const VALID_SECTIONS: NavSection[] = [
  'dashboard',
  'investments',
  'properties',
  'businesses',
  'loans',
  'take_loan',
  'zakat',
  'tax',
  'events',
  'reports',
];

function loadSavedNavSession(): { screen?: GameScreen; activeSection?: NavSection } {
  try {
    const raw = localStorage.getItem(SESSION_NAV_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { screen?: string; activeSection?: string };
    const section = VALID_SECTIONS.includes(parsed.activeSection as NavSection)
      ? (parsed.activeSection as NavSection)
      : undefined;
    const scr = parsed.screen as GameScreen | undefined;
    return { screen: scr, activeSection: section };
  } catch {
    return {};
  }
}

export default function App() {
  const [bootLoaded, setBootLoaded] = useState(false);
  const [screen, setScreen] = useState<GameScreen>('MENU');
  const [returnScreen, setReturnScreen] = useState<GameScreen>('MENU');
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');

  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [game, setGame] = useState<GameState | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);
  const [turnSummaryModal, setTurnSummaryModal] = useState<TurnSummary | null>(null);

  const lang = settings.language;
  const t = useMemo(() => getT(lang), [lang]);

  // Sync document language and page title with active language
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.pageTitle;
  }, [lang, t.pageTitle]);

  // Reset scroll to top on top-level screen switch
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);

  // Sync sound engine with user settings
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Restore saved game & active page/section from storage on startup
  useEffect(() => {
    let active = true;
    const savedNav = loadSavedNavSession();
    loadGameFromIndexedDB().then((saved) => {
      if (!active) return;
      if (saved) {
        let hydrated = saved;
        if (
          hydrated.currentTurn === 1 &&
          hydrated.pendingEvents.length === 0 &&
          hydrated.eventHistory.length === 0
        ) {
          const hydSummary = computeFinancialSummary(hydrated);
          hydrated = {
            ...hydrated,
            pendingEvents: generateTurnEvents(
              1,
              hydrated.seed,
              hydrated.market,
              [],
              hydrated.maritalStatus ?? 'single',
              hydrated.inflationMultiplier ?? 1,
              {
                professionId: hydrated.professionId,
                cash: hydrated.cash,
                passiveIncome: hydSummary.passiveIncome,
                totalExpenses: hydSummary.totalExpenses,
                netWorth: hydSummary.netWorth,
                assetsCount: 0,
                propertiesCount: 0,
                activeAnnualTemplateIds: [],
              }
            ),
          };
          saveGameToIndexedDB(hydrated);
        } else if (
          !loadSettings().ignoreEvents &&
          !hydrated.pendingEvents.some((e) => e.isCharacterSignature || e.templateId.startsWith('char_opp_')) &&
          !hydrated.eventHistory.some(
            (e) =>
              e.resolvedTurn === hydrated.currentTurn &&
              (e.isCharacterSignature || e.templateId.startsWith('char_opp_'))
          )
        ) {
          const hydSummary = computeFinancialSummary(hydrated);
          const sigCard = buildCharacterSignatureOpportunityCard(
            hydrated.professionId,
            hydrated.currentTurn,
            hydrated.cash,
            hydSummary.netWorth,
            hydrated.inflationMultiplier ?? 1
          );
          hydrated = {
            ...hydrated,
            pendingEvents: [sigCard, ...hydrated.pendingEvents],
          };
          saveGameToIndexedDB(hydrated);
        }
        setGame(hydrated);
        if (savedNav.activeSection) {
          setActiveSection(savedNav.activeSection);
        }
        if (savedNav.screen === 'SETTINGS') {
          setReturnScreen('PLAYING');
          setScreen('SETTINGS');
        } else if (
          savedNav.screen === 'HOW_TO_PLAY' ||
          savedNav.screen === 'ABOUT' ||
          savedNav.screen === 'PROFESSION_SELECT'
        ) {
          setScreen(savedNav.screen);
        } else if (savedNav.screen === 'MENU') {
          setScreen('MENU');
        } else {
          setScreen('PLAYING');
        }
      } else if (
        savedNav.screen === 'SETTINGS' ||
        savedNav.screen === 'HOW_TO_PLAY' ||
        savedNav.screen === 'ABOUT' ||
        savedNav.screen === 'PROFESSION_SELECT'
      ) {
        setScreen(savedNav.screen);
      }
      setBootLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist active screen & section so browser refresh resumes the exact same page
  useEffect(() => {
    if (!bootLoaded) return;
    try {
      localStorage.setItem(
        SESSION_NAV_KEY,
        JSON.stringify({ screen, activeSection })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [bootLoaded, screen, activeSection]);

  // Auto-dismiss toast after 4.5s
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const summary = useMemo(
    () => (game ? computeFinancialSummary(game) : null),
    [game]
  );

  const commitState = useCallback((next: GameState) => {
    setGame(next);
    saveGameToIndexedDB(next);
  }, []);

  const applyEngineResult = useCallback(
    (res: EngineActionResult, playSound: 'cash' | 'click' = 'cash') => {
      if (res.error) {
        sound.warning();
        setToast({ text: res.error, type: 'err' });
        if (res.redirectTo) {
          setActiveSection(res.redirectTo);
        }
        return false;
      }
      if (res.state.gameOver && !game?.gameOver) {
        sound.gameOver();
      } else if (res.outcomeType === 'loss') {
        sound.warning();
      } else if (res.state.victoryAchieved && !game?.victoryAchieved) {
        sound.victory();
      } else if (playSound === 'cash') {
        sound.cashIn();
      } else {
        sound.click();
      }
      commitState(res.state);
      return true;
    },
    [commitState, game?.gameOver, game?.victoryAchieved]
  );

  const handleUpdateSettings = (next: GameSettings) => {
    setSettings(next);
    saveSettings(next);
    if (next.ignoreEvents && game && game.pendingEvents.some((e) => !e.resolved)) {
      const cleared = ignoreAllPendingEvents(game, next.language);
      commitState(cleared.state);
    }
  };

  const handleToggleIgnoreEvents = (nextIgnore: boolean) => {
    sound.click();
    const nextSettings: GameSettings = { ...settings, ignoreEvents: nextIgnore };
    setSettings(nextSettings);
    saveSettings(nextSettings);
    if (nextIgnore && game && game.pendingEvents.some((e) => !e.resolved)) {
      const cleared = ignoreAllPendingEvents(game, lang);
      commitState(cleared.state);
    }
  };

  const handleStartNewGame = async () => {
    sound.click();
    setGame(null);
    setTurnSummaryModal(null);
    setToast(null);
    setActiveSection('dashboard');
    await clearSavedGame();
    setScreen('PROFESSION_SELECT');
  };

  const handleSelectProfession = async (professionId: string) => {
    sound.cashIn();
    await clearSavedGame();
    const fresh = createNewGame(professionId);
    setActiveSection('dashboard');
    setTurnSummaryModal(null);
    setToast(null);
    commitState(fresh);
    setScreen('PLAYING');
  };

  const handleNextMonth = () => {
    if (!game) return;
    const res = advanceMonth(game, lang, Boolean(settings.ignoreEvents));
    if (res.error) {
      sound.warning();
      setToast({ text: res.error, type: 'err' });
      if (res.redirectTo) {
        setActiveSection(res.redirectTo);
      }
      return;
    }

    if (res.state.gameOver && !game.gameOver) {
      sound.gameOver();
    } else if (res.state.lastTurnSummary?.newVictoryTriggered) {
      sound.victory();
    } else if (res.state.lastTurnSummary?.blackSwanTriggered) {
      sound.warning();
    } else {
      sound.nextMonth();
    }

    commitState(res.state);

    if (res.state.lastTurnSummary) {
      setTurnSummaryModal(res.state.lastTurnSummary);
    }
  };

  const handleResetGame = async () => {
    await clearSavedGame();
    setGame(null);
    setTurnSummaryModal(null);
    setToast(null);
  };

  if (!bootLoaded) {
    return (
      <div className="min-h-screen bg-[#191C24] flex items-center justify-center text-white/75 text-sm">
        {t.common.loadingDb}
      </div>
    );
  }

  if (screen === 'MENU') {
    return (
      <MainMenuScreen
        savedGame={game}
        settings={settings}
        onContinue={() => {
          sound.click();
          setScreen('PLAYING');
        }}
        onStartNew={() => {
          void handleStartNewGame();
        }}
        onHowToPlay={() => {
          sound.click();
          setScreen('HOW_TO_PLAY');
        }}
        onSettings={() => {
          sound.click();
          setReturnScreen('MENU');
          setScreen('SETTINGS');
        }}
        onAbout={() => {
          sound.click();
          setScreen('ABOUT');
        }}
        onChangeLanguage={(nextLang) => {
          sound.click();
          handleUpdateSettings({ ...settings, language: nextLang });
        }}
      />
    );
  }

  if (screen === 'PROFESSION_SELECT') {
    return (
      <ProfessionSelectScreen
        language={lang}
        onBack={() => {
          sound.click();
          setScreen('MENU');
        }}
        onSelectProfession={handleSelectProfession}
      />
    );
  }

  if (screen === 'HOW_TO_PLAY') {
    return (
      <HowToPlayScreen
        language={lang}
        onBack={() => {
          sound.click();
          setScreen('MENU');
        }}
      />
    );
  }

  if (screen === 'SETTINGS') {
    return (
      <SettingsScreen
        settings={settings ?? DEFAULT_SETTINGS}
        onUpdateSettings={handleUpdateSettings}
        onBack={() => {
          sound.click();
          setScreen(returnScreen === 'PLAYING' && game ? 'PLAYING' : 'MENU');
        }}
      />
    );
  }

  if (screen === 'ABOUT') {
    return (
      <AboutScreen
        language={lang}
        onBack={() => {
          sound.click();
          setScreen('MENU');
        }}
      />
    );
  }

  if (!game || !summary) {
    return (
      <MainMenuScreen
        savedGame={null}
        settings={settings}
        onContinue={() => {}}
        onStartNew={() => {
          void handleStartNewGame();
        }}
        onHowToPlay={() => setScreen('HOW_TO_PLAY')}
        onSettings={() => {
          setReturnScreen('MENU');
          setScreen('SETTINGS');
        }}
        onAbout={() => setScreen('ABOUT')}
        onChangeLanguage={(nextLang) => {
          sound.click();
          handleUpdateSettings({ ...settings, language: nextLang });
        }}
      />
    );
  }

  const showGameOver = !turnSummaryModal && Boolean(game.gameOver || (game.happiness ?? 70) < 50);
  const showVictory = !turnSummaryModal && !showGameOver && game.victoryAchieved && !game.victoryContinued;

  return (
    <>
      <div
        className={
          turnSummaryModal
            ? 'hidden'
            : showVictory || showGameOver
              ? 'max-sm:fixed max-sm:inset-x-0 max-sm:top-0 max-sm:z-0 max-sm:pointer-events-none'
              : undefined
        }
      >
      <GameShell
        game={game}
        summary={summary}
        settings={settings}
        activeSection={activeSection}
        toast={toast}
        onDismissToast={() => setToast(null)}
        onChangeSection={(sec) => {
          sound.click();
          setActiveSection(sec);
        }}
        onNextMonth={handleNextMonth}
        onPayMonthlyExpense={() => applyEngineResult(payMonthlyExpenses(game, lang))}
        onBuyStock={(symbol, shares) =>
          applyEngineResult(buyStock(game, symbol, shares, undefined, lang))
        }
        onSellStock={(symbol, shares) =>
          applyEngineResult(sellStock(game, symbol, shares, lang))
        }
        onBuyCrypto={(symbol, units, exactSpendAmount) =>
          applyEngineResult(buyCrypto(game, symbol, units, lang, exactSpendAmount))
        }
        onSellCrypto={(symbol, units) =>
          applyEngineResult(sellCrypto(game, symbol, units, lang))
        }
        onInvestFixed={(productId, amount) =>
          applyEngineResult(investFixedIncome(game, productId, amount, lang))
        }
        onRedeemFixed={(fixedId) => applyEngineResult(redeemFixedIncome(game, fixedId, lang))}
        onWithdrawFixedAmount={(productId, amount) =>
          applyEngineResult(withdrawFixedIncomeAmount(game, productId, amount, lang))
        }
        onWithdrawCategory={(category: InvestmentSheetCategory) =>
          applyEngineResult(withdrawAllInvestmentsByCategory(game, category, lang))
        }
        onBuyProperty={(listing: PropertyListing, useFinancing: boolean) =>
          applyEngineResult(buyProperty(game, listing, useFinancing, lang))
        }
        onSellProperty={(propertyId) => applyEngineResult(sellProperty(game, propertyId, lang))}
        onBuyBusiness={(listing: BusinessListing) =>
          applyEngineResult(buyOrStartBusiness(game, listing, lang))
        }
        onAutomateBusiness={(businessId) =>
          applyEngineResult(automateBusiness(game, businessId, lang))
        }
        onSellBusiness={(businessId) => applyEngineResult(sellBusiness(game, businessId, lang))}
        onStartCustomBusiness={(tplIdx, customName) =>
          applyEngineResult(createCustomBusiness(game, tplIdx, customName, lang))
        }
        onApplyLoan={(cat: LoanCategory, name, amount, term, rate) =>
          applyEngineResult(applyForLoan(game, cat, name, amount, term, rate, lang))
        }
        onRepayLoan={(loanId, amount) => applyEngineResult(repayLoan(game, loanId, amount, lang))}
        onResolveEvent={(eventId, choiceId) =>
          applyEngineResult(resolveEventChoice(game, eventId, choiceId, lang))
        }
        onDismissEvent={(eventId) =>
          applyEngineResult(dismissPendingEvent(game, eventId, lang), 'click')
        }
        onIgnoreAllEvents={() =>
          applyEngineResult(ignoreAllPendingEvents(game, lang), 'click')
        }
        onToggleIgnoreEvents={handleToggleIgnoreEvents}
        onBuyHappiness={(itemId) => applyEngineResult(buyHappinessItem(game, itemId, lang))}
        onIgnoreHappinessCard={(cardId) =>
          applyEngineResult(ignoreHappinessCard(game, cardId), 'click')
        }
        onBuyPersonalAsset={(assetId: PersonalAssetId) =>
          applyEngineResult(buyPersonalAsset(game, assetId, lang))
        }
        onTogglePersonalAssetInsurance={(assetId: PersonalAssetId) =>
          applyEngineResult(togglePersonalAssetInsurance(game, assetId, lang))
        }
        onMarry={() => applyEngineResult(marryPartner(game, lang))}
        onCompleteEducation={(courseId) =>
          applyEngineResult(completeEducationCourse(game, courseId, lang))
        }
        onToggleInsurance={(planId) => applyEngineResult(toggleInsurancePlan(game, planId, lang))}
        onTryVenture={(ventureId) => {
          const res = tryCharacterVenture(game, ventureId, lang);
          applyEngineResult(res);
          return res.outcomeType
            ? { outcomeType: res.outcomeType, delta: res.outcomeDelta ?? 0, ventureId }
            : undefined;
        }}
        onPlayLottery={(ticketId: LotteryTicketId) => {
          const res = playLottery(game, ticketId, lang);
          applyEngineResult(res);
          return res.outcomeType
            ? { outcomeType: res.outcomeType, delta: res.outcomeDelta ?? 0, ticketId }
            : undefined;
        }}
        onPayZakat={(mode) => applyEngineResult(payZakat(game, mode, lang))}
        onPayIncomeTax={(mode) => applyEngineResult(payIncomeTax(game, mode, lang))}
        onViewLastTurnSummary={() => {
          if (game.lastTurnSummary) {
            sound.click();
            setTurnSummaryModal(game.lastTurnSummary);
          }
        }}
        onOpenSettings={() => {
          sound.click();
          setReturnScreen('PLAYING');
          setScreen('SETTINGS');
        }}
        onReturnToMenu={() => {
          sound.click();
          setScreen('MENU');
        }}
      />
      </div>

      <TurnSummaryModal
        summary={turnSummaryModal}
        language={lang}
        onClose={() => {
          setTurnSummaryModal(null);
          window.scrollTo({ top: 0 });
        }}
        onGoToEvents={() => setActiveSection('events')}
        onGoToTax={() =>
          setActiveSection(
            summary.zakatDueEffective > 0 && summary.incomeTaxDueEffective === 0
              ? 'zakat'
              : 'tax'
          )
        }
      />

      <VictoryModal
        open={showVictory}
        game={game}
        summary={summary}
        language={lang}
        onContinuePlaying={() => {
          sound.click();
          commitState(continueAfterVictory(game));
        }}
        onReturnToMenu={() => {
          sound.click();
          commitState(continueAfterVictory(game));
          setScreen('MENU');
        }}
      />

      <GameOverModal
        open={showGameOver}
        game={game}
        summary={summary}
        language={lang}
        onStartNewGame={() => {
          void handleStartNewGame();
        }}
        onReturnToMenu={() => {
          sound.click();
          void handleResetGame();
          setScreen('MENU');
        }}
      />
    </>
  );
}
