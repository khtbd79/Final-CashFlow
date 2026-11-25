import React, { useMemo, useState } from 'react';
import { CalendarCheck, Search } from 'lucide-react';
import { getT } from '../../data/i18n';
import { localizeTransactionDate, localizeTransactionText } from '../../data/localization';
import { formatCurrency, formatShortLabel, formatYearMonth } from '../../engine/prng';
import { FinancialSummary, GameState, LanguageCode, TransactionCategory } from '../../types/game';
import { FinancialChart } from '../charts/FinancialChart';

interface ReportsViewProps {
  game: GameState;
  summary: FinancialSummary;
  language: LanguageCode;
  onViewLastTurnSummary?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  game,
  summary,
  language,
  onViewLastTurnSummary,
}) => {
  const t = getT(language);
  const [chartView, setChartView] = useState<'income_expense' | 'net_worth' | 'cash_flow' | 'pnl'>(
    'income_expense'
  );
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<'all' | TransactionCategory>('all');

  const history = game.monthlyHistory;
  const labels = history.map((m) => formatShortLabel(m.year, m.month, language));

  const filteredTx = useMemo(() => {
    const q = search.trim().toLowerCase();
    return game.transactions.filter((tx) => {
      const catOk = catFilter === 'all' || tx.category === catFilter;
      if (!q) return catOk;
      const locDesc = localizeTransactionText(tx.description, language).toLowerCase();
      const locCat = (t.reports.txCategories[tx.category] ?? tx.category).toLowerCase();
      const locDate = localizeTransactionDate(tx, language).toLowerCase();
      const qOk =
        locDesc.includes(q) ||
        locCat.includes(q) ||
        locDate.includes(q) ||
        tx.description.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.dateLabel.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [game.transactions, search, catFilter, language, t.reports.txCategories]);

  const categories: TransactionCategory[] = [
    'Salary',
    'Passive Income',
    'Business',
    'Living Expenses',
    'Loan Payment',
    'Property Expense',
    'Stock Trade',
    'Real Estate',
    'Business Trade',
    'Bonds & Savings',
    'Crypto',
    'Loan',
    'Event',
    'Lifestyle',
    'Zakat & Tax',
  ];

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-white text-center">
        {t.reports.title}
      </h2>

      {game.lastTurnSummary && onViewLastTurnSummary && (
        <section className="rounded-3xl bg-[#F6E7D7] p-4 sm:p-5 text-[#26201C] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#169C5E] shadow-sm">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-base sm:text-lg font-bold text-[#26201C]">
                {t.reports.lastMonthSummaryTitle}
              </div>
              <div className="text-xs sm:text-sm font-mono text-[#5E544C] truncate">
                {formatYearMonth(
                  game.lastTurnSummary.completedYear ?? game.lastTurnSummary.year,
                  game.lastTurnSummary.completedMonth ?? game.lastTurnSummary.month,
                  language
                )}{' '}
                · {t.monthLabel} {game.lastTurnSummary.completedTurn ?? game.lastTurnSummary.turn} ·{' '}
                {formatCurrency(game.lastTurnSummary.netTurnCashChange, true)}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onViewLastTurnSummary}
            className="min-h-[46px] shrink-0 inline-flex items-center justify-center rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] px-5 py-2.5 text-sm sm:text-base font-bold text-[#26201C] shadow-sm transition-colors"
          >
            {t.reports.viewSummaryBtn}
          </button>
        </section>
      )}

      {/* Top Summary Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-[#F6E7D7] p-3.5 sm:p-4 text-[#26201C] shadow min-w-0">
          <div className="text-xs sm:text-sm text-[#5E544C] truncate">{t.reports.totalInvPnl}</div>
          <div
            className={`mt-1 font-mono text-base sm:text-lg font-bold tabular-nums whitespace-nowrap ${
              summary.totalInvestmentPnL >= 0 ? 'text-[#169C5E]' : 'text-[#DC2626]'
            }`}
          >
            {formatCurrency(summary.totalInvestmentPnL, true)}
          </div>
          <div className="text-xs text-[#665B53] mt-1 truncate">
            {t.reports.realizedPrefix} {formatCurrency(game.realizedInvestmentPnL, true)}
          </div>
        </div>

        <div className="rounded-2xl bg-[#F6E7D7] p-3.5 sm:p-4 text-[#26201C] shadow min-w-0">
          <div className="text-xs sm:text-sm text-[#5E544C] truncate">{t.reports.unrealizedGain}</div>
          <div
            className={`mt-1 font-mono text-base sm:text-lg font-bold tabular-nums whitespace-nowrap ${
              summary.unrealizedInvestmentPnL >= 0 ? 'text-[#169C5E]' : 'text-[#DC2626]'
            }`}
          >
            {formatCurrency(summary.unrealizedInvestmentPnL, true)}
          </div>
        </div>

        <div className="rounded-2xl bg-[#F6E7D7] p-3.5 sm:p-4 text-[#26201C] shadow min-w-0">
          <div className="text-xs sm:text-sm text-[#5E544C] truncate">{t.reports.monthsSimulated}</div>
          <div className="mt-1 font-mono text-base sm:text-lg font-bold text-[#26201C] tabular-nums whitespace-nowrap">
            {game.currentTurn}
          </div>
          <div className="text-xs text-[#665B53] mt-1 truncate">
            {t.yearLabel} {game.year} · {t.monthLabel} {game.month}
          </div>
        </div>

        <div className="rounded-2xl bg-[#F6E7D7] p-3.5 sm:p-4 text-[#26201C] shadow min-w-0">
          <div className="text-xs sm:text-sm text-[#5E544C] truncate">{t.reports.ledgerEntries}</div>
          <div className="mt-1 font-mono text-base sm:text-lg font-bold text-[#26201C] tabular-nums whitespace-nowrap">
            {game.transactions.length}
          </div>
        </div>
      </section>

      {/* Interactive Analytics Charts */}
      <section className="rounded-3xl bg-[#F6E7D7] p-5 sm:p-6 text-[#26201C] space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-display text-base font-bold">{t.reports.chartsTitle}</h3>
          <div className="flex flex-wrap items-center gap-1 rounded-2xl bg-white p-1">
            {(
              [
                { id: 'income_expense', label: t.reports.chartTabs.income_expense },
                { id: 'net_worth', label: t.reports.chartTabs.net_worth },
                { id: 'cash_flow', label: t.reports.chartTabs.cash_flow },
                { id: 'pnl', label: t.reports.chartTabs.pnl },
              ] as const
            ).map((tabItem) => (
              <button
                key={tabItem.id}
                type="button"
                onClick={() => setChartView(tabItem.id)}
                className={`min-h-[36px] rounded-xl px-3 py-1 text-xs font-bold transition-colors ${
                  chartView === tabItem.id ? 'bg-[#F7CA44] text-[#26201C]' : 'text-[#665B53]'
                }`}
              >
                {tabItem.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white/80 p-3.5">
          {chartView === 'income_expense' && (
            <FinancialChart
              labels={labels}
              height={240}
              emptyLabel={t.common.chartEmpty}
              series={[
                {
                  id: 'tot_inc',
                  label: t.reports.seriesTotalIncome,
                  color: '#3B9AE1',
                  values: history.map((m) => m.totalIncome),
                },
                {
                  id: 'pas_inc',
                  label: t.passiveIncome,
                  color: '#169C5E',
                  values: history.map((m) => m.passiveIncome),
                },
                {
                  id: 'tot_exp',
                  label: t.finances.totalExpenses,
                  color: '#DC2626',
                  values: history.map((m) => m.totalExpenses),
                },
              ]}
            />
          )}

          {chartView === 'net_worth' && (
            <FinancialChart
              labels={labels}
              height={240}
              emptyLabel={t.common.chartEmpty}
              series={[
                {
                  id: 'assets',
                  label: t.totalAssets,
                  color: '#D97706',
                  values: history.map((m) => m.totalAssets),
                },
                {
                  id: 'liabilities',
                  label: t.totalLiabilities,
                  color: '#DC2626',
                  values: history.map((m) => m.totalLiabilities),
                },
                {
                  id: 'nw',
                  label: t.netWorth,
                  color: '#169C5E',
                  values: history.map((m) => m.netWorth),
                },
              ]}
            />
          )}

          {chartView === 'cash_flow' && (
            <FinancialChart
              labels={labels}
              height={240}
              emptyLabel={t.common.chartEmpty}
              series={[
                {
                  id: 'cf',
                  label: t.monthlyCashFlow,
                  color: '#169C5E',
                  values: history.map((m) => m.cashFlow),
                },
              ]}
            />
          )}

          {chartView === 'pnl' && (
            <FinancialChart
              labels={labels}
              height={240}
              emptyLabel={t.common.chartEmpty}
              series={[
                {
                  id: 'pnl',
                  label: t.reports.seriesCumulativePnl,
                  color: '#D97706',
                  values: history.map((m) => m.investmentPnL),
                },
              ]}
            />
          )}
        </div>
      </section>

      {/* Transaction History Ledger */}
      <section className="rounded-3xl bg-[#F6E7D7] p-5 sm:p-6 text-[#26201C] space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="font-display text-base font-bold">{t.reports.txHistoryTitle}</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="h-4 w-4 text-[#665B53] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.reports.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-52 min-h-[40px] rounded-xl border border-[#DFC9B4] bg-white pl-9 pr-3 text-xs text-[#26201C] focus:outline-none"
              />
            </div>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value as 'all' | TransactionCategory)}
              className="min-h-[40px] rounded-xl border border-[#DFC9B4] bg-white px-3 text-xs font-semibold text-[#26201C] focus:outline-none"
            >
              <option value="all">{t.reports.allCategories}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {t.reports.txCategories[c] ?? c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white p-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E4D2BE] text-[#665B53]">
                <th className="py-2.5 pr-3 font-semibold">{t.reports.dateCol}</th>
                <th className="py-2.5 pr-3 font-semibold">{t.reports.categoryCol}</th>
                <th className="py-2.5 pr-3 font-semibold">{t.reports.descCol}</th>
                <th className="py-2.5 pl-3 text-right font-semibold">{t.reports.amountCol}</th>
                <th className="py-2.5 pl-3 text-right font-semibold">{t.reports.balanceCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E4D7]">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#665B53]">
                    {t.reports.noMatchingTx}
                  </td>
                </tr>
              ) : (
                filteredTx.slice(0, 80).map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#FAF2E9]">
                    <td className="py-2.5 pr-3 font-mono text-[#665B53] whitespace-nowrap">
                      {localizeTransactionDate(tx, language)}
                    </td>
                    <td className="py-2.5 pr-3 font-medium text-[#26201C] whitespace-nowrap">
                      {t.reports.txCategories[tx.category] ?? tx.category}
                    </td>
                    <td className="py-2.5 pr-3 text-[#453B34]">
                      {localizeTransactionText(tx.description, language)}
                    </td>
                    <td
                      className={`py-2.5 pl-3 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                        tx.amount > 0
                          ? 'text-[#169C5E]'
                          : tx.amount < 0
                          ? 'text-[#DC2626]'
                          : 'text-[#665B53]'
                      }`}
                    >
                      {tx.amount === 0 ? '$0' : formatCurrency(tx.amount, true)}
                    </td>
                    <td className="py-2.5 pl-3 text-right font-mono text-[#26201C] tabular-nums whitespace-nowrap">
                      {formatCurrency(tx.balanceAfter)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
