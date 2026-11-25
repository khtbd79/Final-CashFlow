import React, { useState } from 'react';
import { ChevronDown, Info, Settings } from 'lucide-react';
import { getT } from '../../data/i18n';
import { localizeProfession } from '../../data/localization';
import { computeFinancialSummary } from '../../engine/finance';
import { formatCurrency, formatYearMonth } from '../../engine/prng';
import { GameSettings, GameState, LanguageCode } from '../../types/game';
import menuWealthHeroImg from '../../assets/images/menu_wealth_hero_1795324461170.jpg';
import { CashflowLogo } from '../common/CashflowLogo';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface MainMenuScreenProps {
  savedGame: GameState | null;
  settings: GameSettings;
  onContinue: () => void;
  onStartNew: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
  onAbout: () => void;
  onChangeLanguage: (lang: LanguageCode) => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  savedGame,
  settings,
  onContinue,
  onStartNew,
  onHowToPlay,
  onSettings,
  onAbout,
  onChangeLanguage,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [bgError, setBgError] = useState(false);

  const t = getT(settings.language);
  const activeSavedGame =
    savedGame && !savedGame.gameOver && (savedGame.happiness ?? 70) >= 50 ? savedGame : null;
  const savedSummary = activeSavedGame ? computeFinancialSummary(activeSavedGame) : null;
  const savedProfName = activeSavedGame
    ? localizeProfession(activeSavedGame.professionId, settings.language).name
    : '';

  const langOptions: { code: LanguageCode; label: string }[] = [
    { code: 'bn', label: t.common.langBanglaLabel },
    { code: 'en', label: t.common.langEnglishLabel },
  ];

  const activeLang =
    langOptions.find((l) => l.code === settings.language) ?? langOptions[1];

  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-[#14171F] text-white flex flex-col justify-between">
      {/* Full-bleed darkened urban skyline backdrop */}
      <div className="absolute inset-0 z-0">
        {!bgError && (
          <img
            src={menuWealthHeroImg}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setBgError(true)}
            className="h-full w-full object-cover brightness-[0.48] contrast-[1.08]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E1117]/75 via-[#181B22]/55 to-[#0D1016]/90" />
      </div>

      {/* Subtle top utility bar */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <PWAInstallButton language={settings.language} />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSettings}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-white/12 backdrop-blur-md border border-white/25 px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/20 transition-colors whitespace-nowrap"
          >
            <Settings className="h-3.5 w-3.5 shrink-0" />
            {t.settings}
          </button>
          <button
            type="button"
            onClick={onAbout}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-white/12 backdrop-blur-md border border-white/25 px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/20 transition-colors whitespace-nowrap"
          >
            <Info className="h-3.5 w-3.5 shrink-0" />
            {t.about}
          </button>
        </div>
      </header>

      {/* Center Frosted Glass Stack */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-6">
        <div className="w-full max-w-md flex flex-col items-center">
          <CashflowLogo language={settings.language} className="w-72 h-24 sm:w-80 sm:h-28 mb-8" />

          {/* Frosted Glass Menu Buttons */}
          <div className="w-full space-y-3.5">
            <button
              type="button"
              disabled={!activeSavedGame}
              onClick={onContinue}
              className={`w-full min-h-[60px] rounded-2xl border backdrop-blur-md px-6 py-3.5 text-center transition-all ${
                activeSavedGame
                  ? 'border-white/40 bg-white/18 hover:bg-white/26 text-white shadow-lg shadow-black/25'
                  : 'cursor-not-allowed border-white/15 bg-white/5 text-white/40'
              }`}
            >
              <div className="text-base sm:text-lg font-semibold tracking-wide">
                {t.continueGame}
              </div>
              {activeSavedGame && savedSummary && (
                <div className="mt-0.5 text-xs font-mono text-[#F7CA44]">
                  {savedProfName} · {formatYearMonth(activeSavedGame.year, activeSavedGame.month, settings.language)} ·{' '}
                  {formatCurrency(savedSummary.cashAsset)}
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={onStartNew}
              className="w-full min-h-[60px] rounded-2xl border border-white/40 bg-white/18 hover:bg-white/26 backdrop-blur-md px-6 py-3.5 text-center text-base sm:text-lg font-semibold tracking-wide text-white shadow-lg shadow-black/25 transition-all"
            >
              {t.startNewGame}
            </button>

            <button
              type="button"
              onClick={onHowToPlay}
              className="w-full min-h-[60px] rounded-2xl border border-white/40 bg-white/18 hover:bg-white/26 backdrop-blur-md px-6 py-3.5 text-center text-base sm:text-lg font-semibold tracking-wide text-white shadow-lg shadow-black/25 transition-all"
            >
              {t.howToPlay}
            </button>
          </div>

          {/* Bilingual Language Selector Dropdown */}
          <div className="relative w-full mt-8">
            <button
              type="button"
              onClick={() => setLangMenuOpen((v) => !v)}
              className="relative w-full min-h-[56px] flex items-center justify-center rounded-2xl border border-white/40 bg-white/18 hover:bg-white/26 backdrop-blur-md px-5 py-3 text-base font-semibold text-white shadow-lg shadow-black/25 transition-all"
            >
              <span className="text-center">{activeLang.label}</span>
              <ChevronDown
                className={`absolute right-5 h-5 w-5 text-white/80 transition-transform ${
                  langMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {langMenuOpen && (
              <div className="mt-2 w-full rounded-2xl border border-white/30 bg-[#1B1E27]/95 backdrop-blur-xl p-1.5 shadow-2xl space-y-1">
                {langOptions.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => {
                      onChangeLanguage(opt.code);
                      setLangMenuOpen(false);
                    }}
                    className={`relative w-full min-h-[44px] flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                      opt.code === settings.language
                        ? 'bg-[#F7CA44] text-[#26201C] font-bold'
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-center">{opt.label}</span>
                    {opt.code === settings.language && (
                      <span className="absolute right-4 text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="relative z-10 h-6" />
    </div>
  );
};
