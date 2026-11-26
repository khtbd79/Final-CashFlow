import React, { useState } from 'react';
import { ArrowRight, Scale } from 'lucide-react';
import { getT } from '../../data/i18n';
import { localizeProfession } from '../../data/localization';
import { formatCurrency } from '../../engine/prng';
import { FinancialSummary, GameState, LanguageCode, NavSection } from '../../types/game';

interface FinancesViewProps {
  game: GameState;
  summary: FinancialSummary;
  language: LanguageCode;
  onNavigate?: (section: NavSection) => void;
}

export const FinancesView: React.FC<FinancesViewProps> = ({
  game,
  summary,
  language,
  onNavigate,
}) => {
  const [mobileTab, setMobileTab] = useState<'income' | 'balance'>('income');
  const t = getT(language);
  const prof = localizeProfession(game.professionId, language);

  const countWithNote = (count: number, unit: string) =>
    language === 'bn' ? `${count}${unit}` : `${count} ${unit}`;

  const incomeRows = [
    { label: t.finances.salary, value: summary.salaryIncome, note: prof.name },
    {
      label: t.finances.businessIncome,
      value: summary.businessIncome,
      note: countWithNote(game.businesses.length, t.common.ownedCount),
    },
    {
      label: t.finances.rentalIncome,
      value: summary.rentalIncome,
      note: countWithNote(game.properties.length, t.finances.propertiesNote),
    },
    {
      label: t.finances.dividendIncome,
      value: summary.dividendIncome,
      note: countWithNote(game.stocks.length, t.finances.stocksNote),
    },
    {
      label: t.finances.cryptoYield,
      value: summary.cryptoYieldIncome,
      note: countWithNote(game.crypto.length, t.finances.cryptoNote),
    },
    {
      label: t.finances.interestIncome,
      value: summary.interestIncome,
      note: countWithNote(game.fixedIncome.length, t.finances.fixedNote),
    },
    {
      label: t.finances.otherPassiveIncome,
      value: summary.otherPassiveIncome,
      note: t.finances.royaltiesNote,
    },
  ];

  const expenseRows = [
    { label: t.finances.housing, value: summary.housingExpense },
    { label: t.finances.food, value: summary.foodExpense },
    { label: t.finances.transportation, value: summary.transportationExpense },
    { label: t.finances.utilities, value: summary.utilitiesExpense },
    { label: t.finances.education, value: summary.educationExpense },
    { label: t.finances.entertainment, value: summary.entertainmentExpense },
    { label: t.finances.loanPayments, value: summary.loanPaymentsTotal },
    { label: t.finances.businessExpenses, value: summary.businessExpensesTotal },
    { label: t.finances.propertyExpenses, value: summary.propertyExpensesTotal },
    ...(summary.insuranceMonthlyCost > 0
      ? [{ label: t.dashboard.insuranceTitle, value: summary.insuranceMonthlyCost }]
      : []),
    { label: t.finances.otherExpenses, value: summary.otherLivingExpense },
  ];

  const assetRows = [
    { label: t.finances.cash, value: summary.cashAsset },
    { label: t.finances.bankSavings, value: summary.bankSavingsAsset },
    { label: t.finances.stocks, value: summary.stocksAsset },
    { label: t.finances.realEstate, value: summary.realEstateAsset },
    { label: t.finances.businesses, value: summary.businessesAsset },
    { label: t.finances.bonds, value: summary.bondsAsset },
    { label: t.finances.otherInvestments, value: summary.otherInvestmentsAsset },
    { label: t.finances.personalAssets, value: summary.personalAssetsValue },
  ];

  const liabilityRows = [
    { label: t.finances.bankLoans, value: summary.bankLoansLiability },
    { label: t.finances.creditCardDebt, value: summary.creditCardLiability },
    { label: t.finances.propertyLoans, value: summary.propertyLoansLiability },
    { label: t.finances.businessLoans, value: summary.businessLoansLiability },
    { label: t.finances.personalLoans, value: summary.personalLoansLiability },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-white text-center">
          {t.finances.title}
        </h2>

        <div className="w-full max-w-md flex lg:hidden items-center gap-1 rounded-2xl bg-[#F6E7D7] p-1">
          <button
            type="button"
            onClick={() => setMobileTab('income')}
            className={`flex-1 min-h-[40px] rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
              mobileTab === 'income' ? 'bg-[#F7CA44] text-[#26201C]' : 'text-[#665B53]'
            }`}
          >
            {t.finances.incomeStatementTab}
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('balance')}
            className={`flex-1 min-h-[40px] rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
              mobileTab === 'balance' ? 'bg-[#F7CA44] text-[#26201C]' : 'text-[#665B53]'
            }`}
          >
            {t.finances.balanceSheetTab}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* INCOME STATEMENT */}
        <section
          className={`rounded-3xl bg-[#F6E7D7] p-5 sm:p-6 text-[#26201C] shadow-lg ${
            mobileTab === 'income' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="border-b border-[#E2CEB9] pb-3">
            <h3 className="font-display text-lg font-bold text-[#26201C]">
              {t.finances.incomeStatementTitle}
            </h3>
          </div>

          <div className="mt-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#169C5E] mb-2">
              {t.finances.incomeHeader}
            </div>
            <div className="divide-y divide-[#E4D2BE] text-sm">
              {incomeRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-[#26201C]">{row.label}</div>
                    <div className="text-xs text-[#665B53]">{row.note}</div>
                  </div>
                  <span className="font-mono font-bold text-[#169C5E] tabular-nums shrink-0 whitespace-nowrap">
                    +{formatCurrency(row.value)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[#D3BEA8] pt-3 text-sm font-bold">
              <span>{t.finances.totalIncome}</span>
              <span className="font-mono text-[#169C5E] tabular-nums">
                +{formatCurrency(summary.totalIncome)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-[#665B53]">{t.finances.passiveSubtotal}</span>
              <span className="font-mono font-bold text-[#D97706] tabular-nums">
                {formatCurrency(summary.passiveIncome)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs font-bold uppercase tracking-wider text-[#DC2626] mb-2">
              {t.finances.expensesHeader}
            </div>
            <div className="divide-y divide-[#E4D2BE] text-sm">
              {expenseRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 gap-3">
                  <span className="text-[#453B34]">{row.label}</span>
                  <span className="font-mono font-semibold text-[#DC2626] tabular-nums shrink-0 whitespace-nowrap">
                    -{formatCurrency(row.value)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[#D3BEA8] pt-3 text-sm font-bold">
              <span>{t.finances.totalExpenses}</span>
              <span className="font-mono text-[#DC2626] tabular-nums">
                -{formatCurrency(summary.totalExpenses)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-4">
            <div className="text-sm font-bold text-[#26201C]">{t.monthlyCashFlow}</div>
            <div
              className={`font-mono text-xl font-bold tabular-nums ${
                summary.monthlyCashFlow >= 0 ? 'text-[#169C5E]' : 'text-[#DC2626]'
              }`}
            >
              {formatCurrency(summary.monthlyCashFlow, true)}
            </div>
          </div>
        </section>

        {/* BALANCE SHEET */}
        <section
          className={`rounded-3xl bg-[#F6E7D7] p-5 sm:p-6 text-[#26201C] shadow-lg ${
            mobileTab === 'balance' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="border-b border-[#E2CEB9] pb-3">
            <h3 className="font-display text-lg font-bold text-[#26201C]">
              {t.finances.balanceSheetTitle}
            </h3>
          </div>

          <div className="mt-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#D97706] mb-2">
              {t.finances.assetsHeader}
            </div>
            <div className="divide-y divide-[#E4D2BE] text-sm">
              {assetRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2.5 gap-3">
                  <span className="font-medium text-[#26201C]">{row.label}</span>
                  <span className="font-mono font-bold text-[#26201C] tabular-nums shrink-0 whitespace-nowrap">
                    {formatCurrency(row.value)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[#D3BEA8] pt-3 text-sm font-bold">
              <span>{t.totalAssets}</span>
              <span className="font-mono text-[#169C5E] tabular-nums">
                {formatCurrency(summary.totalAssets)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs font-bold uppercase tracking-wider text-[#DC2626] mb-2">
              {t.finances.liabilitiesHeader}
            </div>
            <div className="divide-y divide-[#E4D2BE] text-sm">
              {liabilityRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2.5 gap-3">
                  <span className="text-[#453B34]">{row.label}</span>
                  <span className="font-mono font-semibold text-[#DC2626] tabular-nums shrink-0 whitespace-nowrap">
                    {formatCurrency(row.value)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[#D3BEA8] pt-3 text-sm font-bold">
              <span>{t.totalLiabilities}</span>
              <span className="font-mono text-[#DC2626] tabular-nums">
                {formatCurrency(summary.totalLiabilities)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-4">
            <div className="text-sm font-bold text-[#26201C]">{t.netWorth}</div>
            <div
              className={`font-mono text-xl font-bold tabular-nums ${
                summary.netWorth >= 0 ? 'text-[#169C5E]' : 'text-[#DC2626]'
              }`}
            >
              {formatCurrency(summary.netWorth)}
            </div>
          </div>
        </section>
      </div>

      {onNavigate && (
        <button
          type="button"
          onClick={() => onNavigate('tax')}
          className="w-full rounded-3xl bg-[#F6E7D7] hover:bg-[#EFE0CE] active:scale-[0.99] p-5 text-[#26201C] shadow-lg flex items-center justify-between gap-3 transition-all"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#169C5E]/15 text-[#169C5E]">
              <Scale className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold text-[#26201C]">{t.nav.tax}</span>
          </span>
          <ArrowRight className="h-5 w-5 text-[#26201C] shrink-0" />
        </button>
      )}
    </div>
  );
};
