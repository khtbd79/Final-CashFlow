import React, { useState } from 'react';
import { Building2, Home } from 'lucide-react';
import { getT } from '../../data/i18n';
import { isPropertyMatchedForProfession } from '../../data/lifestyle';
import { localizeProperty } from '../../data/localization';
import { calculateMonthlyLoanPayment } from '../../engine/finance';
import { formatCurrency, roundMoney } from '../../engine/prng';
import {
  FinancialSummary,
  GameState,
  LanguageCode,
  PropertyListing,
  PropertyType,
} from '../../types/game';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface PropertiesViewProps {
  game: GameState;
  summary: FinancialSummary;
  language: LanguageCode;
  onBuyProperty: (listing: PropertyListing, useFinancing: boolean) => void;
  onSellProperty: (propertyId: string) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  game,
  summary,
  language,
  onBuyProperty,
  onSellProperty,
}) => {
  const t = getT(language);
  const [filter, setFilter] = useState<'all' | PropertyType>('all');
  const [sellTargetId, setSellTargetId] = useState<string | null>(null);

  const listings = game.market.availableProperties.filter(
    (p) => filter === 'all' || p.type === filter
  );
  const sellTarget = game.properties.find((p) => p.id === sellTargetId);
  const sellTargetLoc = sellTarget
    ? localizeProperty(sellTarget.name, sellTarget.location, undefined, language)
    : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-white text-center">
          {t.properties.title}
        </h2>

        <div className="flex items-center justify-center gap-4 rounded-2xl bg-[#F6E7D7] px-5 py-2.5 text-xs text-[#26201C] shadow">
          <div>
            <span className="text-[#665B53] block">{t.properties.cashAvailable}</span>
            <span className="font-mono text-sm font-bold text-[#169C5E] tabular-nums">
              {formatCurrency(summary.cashAsset)}
            </span>
          </div>
          <div className="h-7 w-px bg-[#DFCEBC]" />
          <div>
            <span className="text-[#665B53] block">{t.properties.borrowingLimit}</span>
            <span className="font-mono text-sm font-bold text-[#26201C] tabular-nums">
              {formatCurrency(summary.remainingBorrowingCapacity)}
            </span>
          </div>
        </div>
      </div>

      {/* Owned Properties */}
      <section className="rounded-3xl bg-[#F6E7D7] p-5 sm:p-6 text-[#26201C] shadow-lg">
        <div className="flex items-center justify-between border-b border-[#E2CEB9] pb-4">
          <div>
            <h3 className="font-display text-lg font-bold">
              {t.properties.ownedTitle} ({game.properties.length})
            </h3>
            <p className="text-sm text-[#665B53] mt-0.5">
              {t.properties.rentalIncomeLbl}{' '}
              <strong className="font-mono text-[#169C5E]">
                +{formatCurrency(summary.rentalIncome)}
                {t.common.perMonth}
              </strong>{' '}
              · {t.properties.maintenanceLbl}{' '}
              <strong className="font-mono text-[#DC2626]">
                -{formatCurrency(summary.propertyExpensesTotal)}
                {t.common.perMonth}
              </strong>
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#665B53]">{t.properties.totalValue}</div>
            <div className="font-mono text-lg font-bold text-[#26201C] tabular-nums">
              {formatCurrency(summary.realEstateAsset)}
            </div>
          </div>
        </div>

        {game.properties.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#665B53]">{t.properties.emptyOwned}</div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {game.properties.map((prop) => {
              const loc = localizeProperty(prop.name, prop.location, undefined, language);
              const isFit = isPropertyMatchedForProfession(game.professionId, prop.type);
              const effectiveRent = isFit
                ? Math.round(prop.monthlyRentalIncome * 1.12)
                : prop.monthlyRentalIncome;
              const linkedLoan = prop.loanId
                ? game.loans.find((l) => l.id === prop.loanId)
                : undefined;
              const mortgagePayment = linkedLoan ? linkedLoan.monthlyPayment : 0;
              const netCashFlow =
                effectiveRent - prop.maintenanceExpense - mortgagePayment;
              const equity = prop.currentValue - (linkedLoan?.remainingBalance ?? 0);

              return (
                <div
                  key={prop.id}
                  className="rounded-2xl bg-white p-4 flex flex-col justify-between gap-3 shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-[#686CA8]">
                          <span>
                            {t.properties.types[prop.type]} · {loc.location}
                          </span>
                        </div>
                        <h4 className="font-display text-lg font-bold text-[#26201C] mt-0.5">
                          {loc.name}
                        </h4>
                      </div>
                      <span
                        className={`font-mono text-base font-bold tabular-nums ${
                          netCashFlow >= 0 ? 'text-[#169C5E]' : 'text-[#DC2626]'
                        }`}
                      >
                        {formatCurrency(netCashFlow, true)}
                        {t.properties.netSuffix}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t border-[#F0E4D7] pt-3 text-sm font-mono tabular-nums">
                      <div>
                        <span className="text-[#665B53] block font-sans">{t.properties.value}</span>
                        <span className="font-bold">{formatCurrency(prop.currentValue)}</span>
                      </div>
                      <div>
                        <span className="text-[#665B53] block font-sans">{t.properties.equity}</span>
                        <span className="text-[#169C5E] font-bold">{formatCurrency(equity)}</span>
                      </div>
                      <div>
                        <span className="text-[#665B53] block font-sans">{t.properties.rent}</span>
                        <span className="text-[#169C5E]">
                          +{formatCurrency(effectiveRent)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#665B53] block font-sans">
                          {t.properties.maintLoan}
                        </span>
                        <span className="text-[#DC2626]">
                          -{formatCurrency(prop.maintenanceExpense + mortgagePayment)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#F0E4D7] pt-3">
                    <span className="text-sm text-[#665B53] font-mono">
                      {linkedLoan
                        ? `${t.properties.mortgageBal} ${formatCurrency(linkedLoan.remainingBalance)}`
                        : t.properties.debtFree}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSellTargetId(prop.id)}
                      className="min-h-[40px] rounded-xl bg-[#FEE2E2] hover:bg-[#FECACA] px-4 py-1.5 text-sm font-bold text-[#DC2626] transition-colors"
                    >
                      {t.properties.sellBtn}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Available Properties */}
      <section className="space-y-4">
        <div className="flex flex-col items-center gap-3">
          <h3 className="font-display text-base sm:text-lg font-bold text-white text-center">
            {t.properties.availableTitle}
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-1 rounded-2xl bg-[#F6E7D7] p-1">
            {(['all', 'rental', 'residential', 'commercial'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-initial min-h-[36px] rounded-xl px-3 py-1 text-xs font-bold transition-colors whitespace-nowrap ${
                  filter === f ? 'bg-[#F7CA44] text-[#26201C]' : 'text-[#665B53]'
                }`}
              >
                {f === 'all' ? t.properties.filterAll : t.properties.types[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((item) => {
            const loc = localizeProperty(item.name, item.location, item.description, language);
            const isFit = isPropertyMatchedForProfession(game.professionId, item.type);
            const effectiveRent = isFit
              ? Math.round(item.monthlyRentalIncome * 1.12)
              : item.monthlyRentalIncome;
            const estMortgage = calculateMonthlyLoanPayment(
              item.loanAmount,
              item.loanAnnualRate,
              item.loanTermMonths
            );
            const financedNetFlow =
              effectiveRent - item.maintenanceExpense - estMortgage;
            const cashNetFlow = effectiveRent - item.maintenanceExpense;
            const canFinance =
              roundMoney(summary.cashAsset - item.downPayment) >= 1 &&
              summary.remainingBorrowingCapacity >= item.loanAmount;
            const canAllCash = roundMoney(summary.cashAsset - item.purchasePrice) >= 1;
            const isCardInactive = !canFinance && !canAllCash;

            return (
              <div
                key={item.id}
                className={`rounded-3xl p-5 text-[#26201C] flex flex-col justify-between gap-4 shadow-lg transition-opacity ${
                  isCardInactive ? 'bg-[#EAE0D3] opacity-55' : 'bg-[#F6E7D7]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#3B9AE1]">
                        {item.type === 'commercial' ? (
                          <Building2 className="h-5 w-5" />
                        ) : (
                          <Home className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-[#686CA8]">
                          <span>
                            {t.properties.types[item.type]} · {loc.location}
                          </span>
                        </div>
                        <h4 className="font-display text-lg font-bold">{loc.name}</h4>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm text-[#665B53]">{t.properties.price}</div>
                      <div className="font-mono text-lg font-bold tabular-nums">
                        {formatCurrency(item.purchasePrice)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-2xl bg-white/80 p-3.5 text-sm font-mono tabular-nums">
                    <div>
                      <span className="text-[#665B53] block font-sans">
                        {t.properties.downPayment}
                      </span>
                      <span className="font-bold">{formatCurrency(item.downPayment)}</span>
                    </div>
                    <div>
                      <span className="text-[#665B53] block font-sans">
                        {t.properties.mortgagePmt}
                      </span>
                      <span className="text-[#DC2626]">
                        -{formatCurrency(estMortgage)}
                        {t.common.perMonth}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#665B53] block font-sans">
                        {t.properties.rentalIncome}
                      </span>
                      <span className="text-[#169C5E] font-bold">
                        +{formatCurrency(effectiveRent)}
                        {t.common.perMonth}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#665B53] block font-sans">
                        {t.properties.maintenance}
                      </span>
                      <span className="text-[#DC2626]">
                        -{formatCurrency(item.maintenanceExpense)}
                        {t.common.perMonth}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-[#665B53]">
                      {t.properties.netWithLoan}{' '}
                      <strong
                        className={`font-mono ${
                          financedNetFlow >= 0 ? 'text-[#169C5E]' : 'text-[#DC2626]'
                        }`}
                      >
                        {formatCurrency(financedNetFlow, true)}
                        {t.common.perMonth}
                      </strong>
                    </span>
                    <span className="text-[#665B53]">
                      {t.properties.netAllCash}{' '}
                      <strong className="font-mono text-[#169C5E]">
                        {formatCurrency(cashNetFlow, true)}
                        {t.common.perMonth}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={!canFinance}
                    onClick={() => onBuyProperty(item, true)}
                    className="min-h-[48px] rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#F7CA44] px-3 py-2 text-sm font-bold text-[#26201C] transition-colors"
                  >
                    {t.properties.financeBtn} ({formatCurrency(item.downPayment)})
                  </button>
                  <button
                    type="button"
                    disabled={!canAllCash}
                    onClick={() => onBuyProperty(item, false)}
                    className="min-h-[48px] rounded-2xl bg-white hover:bg-white/80 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white px-3 py-2 text-sm font-bold text-[#26201C] transition-colors"
                  >
                    {t.properties.allCashBtn} ({formatCurrency(item.purchasePrice)})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <ConfirmDialog
        open={!!sellTarget}
        title={
          sellTargetLoc
            ? language === 'bn'
              ? `${sellTargetLoc.name} বিক্রি করবেন?`
              : `Sell ${sellTargetLoc.name}?`
            : t.properties.sellDialogTitle
        }
        description={
          sellTarget
            ? `${t.properties.sellDialogDesc} (${formatCurrency(sellTarget.currentValue)})`
            : ''
        }
        confirmLabel={t.properties.sellConfirmBtn}
        cancelLabel={t.common.cancel}
        closeLabel={t.common.close}
        tone="gold"
        onConfirm={() => {
          if (sellTarget) onSellProperty(sellTarget.id);
          setSellTargetId(null);
        }}
        onCancel={() => setSellTargetId(null)}
      />
    </div>
  );
};
