import React, { useState } from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
import { getT } from '../../data/i18n';
import { localizeProfession } from '../../data/localization';
import { formatCurrency } from '../../engine/prng';
import { FinancialSummary, GameState, LanguageCode } from '../../types/game';
import victoryFreedomEmblemImg from '../../assets/images/victory_freedom_emblem_1795324460380.jpg';

interface VictoryModalProps {
  open: boolean;
  game: GameState;
  summary: FinancialSummary;
  language: LanguageCode;
  onContinuePlaying: () => void;
  onReturnToMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  open,
  game,
  summary,
  language,
  onContinuePlaying,
  onReturnToMenu,
}) => {
  const [imgError, setImgError] = useState(false);

  if (!open) return null;

  const t = getT(language);
  const prof = localizeProfession(game.professionId, language);
  const monthsTaken = game.victoryTurn ?? game.currentTurn;

  const countLabel = (count: number, unit: string) =>
    language === 'bn' ? `${count}${unit}` : `${count} ${unit}`;

  return (
    <div
      className="relative z-50 min-h-[100dvh] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:fixed sm:inset-0 sm:overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl rounded-3xl bg-[#F6E7D7] text-[#26201C] overflow-hidden shadow-2xl my-auto">
        <div className="relative h-48 sm:h-56 w-full bg-[#191C24]">
          {!imgError ? (
            <img
              src={victoryFreedomEmblemImg}
              alt={t.victory.title}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Award className="h-16 w-16 text-[#F7CA44]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {t.victory.title}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-[#5E544C] leading-relaxed">
            {t.victory.bodyBeforeProf} <strong className="text-[#26201C]">{prof.name}</strong>
            {language === 'bn' ? ' ' : ''}
            {t.victory.bodyMid}{' '}
            <strong className="font-mono text-[#169C5E]">
              {monthsTaken} {t.victory.bodyAfter}
            </strong>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl bg-white p-4 font-mono tabular-nums">
            <div>
              <div className="font-sans text-xs text-[#665B53]">{t.victory.totalPassive}</div>
              <div className="text-base font-bold text-[#169C5E] mt-0.5">
                +{formatCurrency(summary.passiveIncome)}
                {t.common.perMonth}
              </div>
            </div>
            <div>
              <div className="font-sans text-xs text-[#665B53]">{t.victory.monthlyExpenses}</div>
              <div className="text-base font-bold text-[#DC2626] mt-0.5">
                -{formatCurrency(summary.totalExpenses)}
                {t.common.perMonth}
              </div>
            </div>
            <div>
              <div className="font-sans text-xs text-[#665B53]">{t.victory.monthsTaken}</div>
              <div className="text-base font-bold text-[#26201C] mt-0.5">
                {monthsTaken} {t.common.monthsShort}
              </div>
            </div>
            <div>
              <div className="font-sans text-xs text-[#665B53]">{t.victory.totalAssets}</div>
              <div className="text-base font-bold text-[#26201C] mt-0.5">
                {formatCurrency(summary.totalAssets)}
              </div>
            </div>
            <div>
              <div className="font-sans text-xs text-[#665B53]">{t.victory.totalLiabilities}</div>
              <div className="text-base font-bold text-[#DC2626] mt-0.5">
                {formatCurrency(summary.totalLiabilities)}
              </div>
            </div>
            <div>
              <div className="font-sans text-xs text-[#665B53]">{t.victory.netWorth}</div>
              <div className="text-base font-bold text-[#169C5E] mt-0.5">
                {formatCurrency(summary.netWorth)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#5E544C]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#169C5E]" />
              {countLabel(game.properties.length, t.victory.propertiesCount)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#169C5E]" />
              {countLabel(game.businesses.length, t.victory.businessesCount)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#169C5E]" />
              {countLabel(game.stocks.length, t.victory.stocksCount)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onReturnToMenu}
              className="w-full sm:w-auto min-h-[48px] rounded-2xl bg-[#EAD7C3] hover:bg-[#DFC9B2] px-5 py-2.5 text-sm font-bold text-[#26201C] transition-colors"
            >
              {t.victory.mainMenuBtn}
            </button>
            <button
              type="button"
              onClick={onContinuePlaying}
              className="w-full sm:w-auto min-h-[48px] rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] px-6 py-2.5 text-sm font-bold text-[#26201C] transition-colors"
            >
              {t.victory.continueBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
