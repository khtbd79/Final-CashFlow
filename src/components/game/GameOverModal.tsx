import React from 'react';
import { HeartCrack } from 'lucide-react';
import { getT } from '../../data/i18n';
import { formatCurrency } from '../../engine/prng';
import { FinancialSummary, GameState, LanguageCode } from '../../types/game';

interface GameOverModalProps {
  open: boolean;
  game: GameState;
  summary: FinancialSummary;
  language: LanguageCode;
  onStartNewGame: () => void;
  onReturnToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  open,
  game,
  summary,
  language,
  onStartNewGame,
  onReturnToMenu,
}) => {
  if (!open) return null;

  const t = getT(language);
  const monthsSurvived = game.gameOverTurn ?? game.currentTurn;

  return (
    <div
      className="relative z-50 min-h-[100dvh] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:fixed sm:inset-0 sm:overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-3xl bg-[#F6E7D7] text-[#26201C] overflow-hidden shadow-2xl my-auto">
        <div className="bg-gradient-to-br from-[#7F1D1D] via-[#991B1B] to-[#450A0A] px-6 py-7 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <HeartCrack className="h-8 w-8 text-[#FCA5A5]" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            {t.gameOver.title}
          </h2>
          <p className="mt-1.5 text-sm font-medium text-[#FEE2E2]">
            {t.gameOver.reason}
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 font-mono tabular-nums">
            <div>
              <div className="font-sans text-xs text-[#665B53]">{t.gameOver.happinessLbl}</div>
              <div className="mt-0.5 text-lg font-bold text-[#DC2626]">
                {summary.happiness}%
              </div>
            </div>
            <div>
              <div className="font-sans text-xs text-[#665B53]">
                {t.gameOver.monthsSurvivedLbl}
              </div>
              <div className="mt-0.5 text-lg font-bold text-[#26201C]">
                {monthsSurvived} {t.common.monthsShort}
              </div>
            </div>
            <div>
              <div className="font-sans text-xs text-[#665B53]">{t.gameOver.netWorthLbl}</div>
              <div
                className={`mt-0.5 text-lg font-bold ${
                  summary.netWorth >= 0 ? 'text-[#26201C]' : 'text-[#DC2626]'
                }`}
              >
                {formatCurrency(summary.netWorth)}
              </div>
            </div>
            <div>
              <div className="font-sans text-xs text-[#665B53]">
                {t.gameOver.passiveIncomeLbl}
              </div>
              <div className="mt-0.5 text-lg font-bold text-[#169C5E]">
                +{formatCurrency(summary.passiveIncome)}
                {t.common.perMonth}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onReturnToMenu}
              className="w-full sm:w-auto min-h-[48px] rounded-2xl bg-[#EAD7C3] hover:bg-[#DFC9B2] px-5 py-2.5 text-sm font-bold text-[#26201C] transition-colors"
            >
              {t.gameOver.mainMenuBtn}
            </button>
            <button
              type="button"
              onClick={onStartNewGame}
              className="w-full sm:w-auto min-h-[48px] rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] px-6 py-2.5 text-sm font-bold text-[#26201C] transition-colors"
            >
              {t.gameOver.startNewBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
