import React, { useState } from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { getT } from '../../data/i18n';
import { localizeLoanName } from '../../data/localization';
import { calculateMonthlyLoanPayment } from '../../engine/finance';
import { formatCurrency } from '../../engine/prng';
import { FinancialSummary, GameState, LanguageCode, LoanCategory } from '../../types/game';

interface LoansViewProps {
  game: GameState;
  summary: FinancialSummary;
  language: LanguageCode;
  onApplyLoan: (
    category: LoanCategory,
    name: string,
    amount: number,
    termMonths: number,
    annualRate: number
  ) => void;
  onRepayLoan: (loanId: string, amount: number) => void;
  mode?: 'liabilities' | 'apply';
}

const LOAN_PRODUCTS: {
  id: string;
  category: LoanCategory;
  name: string;
  rate: number;
  terms: number[];
}[] = [
  {
    id: 'personal_flex',
    category: 'personal',
    name: 'Personal Term Loan',
    rate: 0.115,
    terms: [12, 24, 36, 48],
  },
  {
    id: 'business_exp',
    category: 'business',
    name: 'Business Expansion Facility',
    rate: 0.088,
    terms: [24, 36, 60],
  },
  {
    id: 'bank_consolidate',
    category: 'bank',
    name: 'Bank Consolidation Loan',
    rate: 0.075,
    terms: [36, 60, 84],
  },
];

export const LoansView: React.FC<LoansViewProps> = ({
  game,
  summary,
  language,
  onApplyLoan,
  onRepayLoan,
  mode = 'liabilities',
}) => {
  const t = getT(language);
  const [selectedProdId, setSelectedProdId] = useState(LOAN_PRODUCTS[0].id);
  const [loanAmount, setLoanAmount] = useState('5000');
  const [termMonths, setTermMonths] = useState(36);
  const [repayInputs, setRepayInputs] = useState<Record<string, string>>({});

  const selectedProd =
    LOAN_PRODUCTS.find((p) => p.id === selectedProdId) ?? LOAN_PRODUCTS[0];
  const parsedAmount = Math.max(0, Number(loanAmount) || 0);
  const previewMonthly = calculateMonthlyLoanPayment(
    parsedAmount,
    selectedProd.rate,
    termMonths
  );
  const totalInterest = Math.max(0, previewMonthly * termMonths - parsedAmount);

  const activeFacilityLabel =
    language === 'bn'
      ? `${game.loans.length}${t.loans.activeFacilities}`
      : `${game.loans.length} ${t.loans.activeFacilities}`;

  const isApplyMode = mode === 'apply';

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-white text-center">
        {isApplyMode ? t.nav.takeLoan : t.loans.title}
      </h2>

      {/* Credit Capacity Strip */}
      <section className={`grid gap-3 ${isApplyMode ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'}`}>
        <div className="rounded-2xl bg-[#F6E7D7] p-3.5 sm:p-4 text-[#26201C] shadow min-w-0">
          <div className="text-xs sm:text-sm font-medium text-[#5E544C] truncate">
            {t.loans.totalDebt}
          </div>
          <div className="mt-1 font-mono text-base sm:text-xl font-bold text-[#DC2626] tabular-nums whitespace-nowrap">
            {formatCurrency(summary.totalLiabilities)}
          </div>
          <div className="mt-1 text-xs sm:text-sm text-[#5E544C] truncate">
            {activeFacilityLabel}
          </div>
        </div>

        <div className="rounded-2xl bg-[#F6E7D7] p-3.5 sm:p-4 text-[#26201C] shadow min-w-0">
          <div className="text-xs sm:text-sm font-medium text-[#5E544C] truncate">
            {t.loans.monthlyPayments}
          </div>
          <div className="mt-1 font-mono text-base sm:text-xl font-bold text-[#DC2626] tabular-nums whitespace-nowrap">
            -{formatCurrency(summary.loanPaymentsTotal)}
            {t.common.perMonth}
          </div>
        </div>

        {isApplyMode && (
          <>
            <div className="rounded-2xl bg-[#F6E7D7] p-3.5 sm:p-4 text-[#26201C] shadow min-w-0">
              <div className="text-xs sm:text-sm font-medium text-[#5E544C] truncate">
                {t.loans.creditEligibility}
              </div>
              <div className="mt-1 font-mono text-base sm:text-xl font-bold text-[#26201C] tabular-nums whitespace-nowrap">
                {formatCurrency(summary.maxLoanEligibility)}
              </div>
            </div>

            <div className="rounded-2xl bg-[#F6E7D7] p-3.5 sm:p-4 text-[#26201C] shadow min-w-0">
              <div className="text-xs sm:text-sm font-medium text-[#5E544C] truncate">
                {t.loans.borrowingCapacity}
              </div>
              <div className="mt-1 font-mono text-base sm:text-xl font-bold text-[#169C5E] tabular-nums whitespace-nowrap">
                {formatCurrency(summary.remainingBorrowingCapacity)}
              </div>
            </div>
          </>
        )}
      </section>

      {!isApplyMode ? (
        <section className="rounded-3xl bg-[#F6E7D7] p-5 sm:p-6 text-[#26201C] shadow-lg">
          <h3 className="font-display text-lg font-bold border-b border-[#E2CEB9] pb-3">
            {t.loans.activeLoansTitle}
          </h3>

          {game.loans.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <ShieldCheck className="h-8 w-8 text-[#169C5E] mx-auto" />
              <div className="text-sm font-bold">{t.loans.debtFreeTitle}</div>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-[#E2CEB9]">
              {game.loans.map((loan) => {
                const customPay =
                  repayInputs[loan.id] ?? String(Math.min(1000, Math.ceil(loan.remainingBalance)));
                const dispLoanName = localizeLoanName(loan, language);
                const catLabel = t.loans.categories[loan.category] ?? loan.category;
                return (
                  <div key={loan.id} className="py-4 first:pt-1 last:pb-1 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[#665B53]">
                          {catLabel} · {(loan.annualInterestRate * 100).toFixed(1)}% {t.common.apr} ·{' '}
                          {loan.remainingMonths} {t.loans.moLeftSuffix}
                        </div>
                        <div className="text-base sm:text-lg font-bold mt-0.5">{dispLoanName}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-base sm:text-lg font-bold text-[#DC2626] tabular-nums whitespace-nowrap">
                          {formatCurrency(loan.remainingBalance)}
                        </div>
                        <div className="font-mono text-xs sm:text-sm text-[#665B53] tabular-nums whitespace-nowrap">
                          {formatCurrency(loan.monthlyPayment)}
                          {t.common.perMonth}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={loan.remainingBalance}
                        value={customPay}
                        onChange={(e) =>
                          setRepayInputs({ ...repayInputs, [loan.id]: e.target.value })
                        }
                        className="w-28 min-h-[42px] rounded-xl border border-[#DFC9B4] bg-white px-3 font-mono text-sm font-bold text-[#26201C] focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={
                          (Number(customPay) || 0) <= 0 ||
                          Math.min(Number(customPay) || 0, loan.remainingBalance) >
                            summary.cashAsset
                        }
                        onClick={() => onRepayLoan(loan.id, Number(customPay) || 0)}
                        className="min-h-[42px] rounded-xl bg-white hover:bg-white/80 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white px-3.5 text-sm font-bold text-[#26201C] transition-colors"
                      >
                        {t.loans.repayCustom}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRepayLoan(loan.id, loan.remainingBalance)}
                        disabled={summary.cashAsset < loan.remainingBalance}
                        className="min-h-[42px] rounded-xl bg-[#F7CA44] hover:bg-[#EBBF36] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#F7CA44] px-3.5 text-sm font-bold text-[#26201C] transition-colors"
                      >
                        {t.loans.payOffFull} ({formatCurrency(loan.remainingBalance)})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <section className="lg:col-span-5 rounded-3xl bg-[#F6E7D7] p-5 sm:p-6 text-[#26201C] space-y-4 shadow-lg">
            <div className="flex items-center gap-2.5 border-b border-[#E2CEB9] pb-3">
              <CreditCard className="h-5 w-5 text-[#686CA8]" />
              <h3 className="font-display text-lg font-bold">{t.loans.applyLoanTitle}</h3>
            </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#5E544C] mb-1">
                {t.loans.loanProduct}
              </label>
              <select
                value={selectedProdId}
                onChange={(e) => {
                  const next =
                    LOAN_PRODUCTS.find((p) => p.id === e.target.value) ?? LOAN_PRODUCTS[0];
                  setSelectedProdId(next.id);
                  if (!next.terms.includes(termMonths)) {
                    setTermMonths(next.terms[0]);
                  }
                }}
                className="w-full min-h-[44px] rounded-xl border border-[#DFC9B4] bg-white px-3 text-sm font-semibold text-[#26201C] focus:outline-none"
              >
                {LOAN_PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {t.loans.products[p.id] ?? p.name} ({(p.rate * 100).toFixed(1)}% {t.common.apr})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5E544C] mb-1">
                {t.loans.principalAmount} ({t.loans.maxPrefix}{' '}
                {formatCurrency(summary.remainingBorrowingCapacity)})
              </label>
              <input
                type="number"
                min={500}
                step={500}
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-[#DFC9B4] bg-white px-3 font-mono text-sm font-bold text-[#26201C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5E544C] mb-1">
                {t.loans.repaymentPeriod}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {selectedProd.terms.map((tm) => (
                  <button
                    key={tm}
                    type="button"
                    onClick={() => setTermMonths(tm)}
                    className={`min-h-[42px] rounded-xl text-sm font-mono font-bold transition-colors whitespace-nowrap ${
                      termMonths === tm
                        ? 'bg-[#F7CA44] text-[#26201C]'
                        : 'bg-white text-[#665B53] hover:text-[#26201C]'
                    }`}
                  >
                    {tm} {t.common.monthsShort}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 space-y-2 text-sm font-mono tabular-nums">
            <div className="flex justify-between">
              <span className="text-[#665B53] font-sans">{t.loans.interestRate}</span>
              <span className="font-bold">
                {(selectedProd.rate * 100).toFixed(1)}% {t.common.apr}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#665B53] font-sans">{t.loans.monthlyInstallment}</span>
              <span className="text-[#DC2626] font-bold">
                -{formatCurrency(previewMonthly)}
                {t.common.perMonth}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#665B53] font-sans">{t.loans.totalInterest}</span>
              <span>{formatCurrency(totalInterest)}</span>
            </div>
          </div>

            <button
              type="button"
              disabled={parsedAmount < 500 || parsedAmount > summary.remainingBorrowingCapacity}
              onClick={() =>
                onApplyLoan(
                  selectedProd.category,
                  selectedProd.name,
                  parsedAmount,
                  termMonths,
                  selectedProd.rate
                )
              }
              className="w-full min-h-[48px] rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#F7CA44] text-sm font-bold text-[#26201C] transition-colors"
            >
              {t.loans.approveBtn} {formatCurrency(parsedAmount)}
            </button>
          </section>

          <section className="lg:col-span-7 rounded-3xl bg-[#F6E7D7] p-5 sm:p-6 text-[#26201C] shadow-lg">
            <h3 className="font-display text-lg font-bold border-b border-[#E2CEB9] pb-3">
              {t.loans.activeLoansTitle}
            </h3>

            {game.loans.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <ShieldCheck className="h-8 w-8 text-[#169C5E] mx-auto" />
                <div className="text-sm font-bold">{t.loans.debtFreeTitle}</div>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-[#E2CEB9]">
                {game.loans.map((loan) => {
                  const customPay =
                    repayInputs[loan.id] ?? String(Math.min(1000, Math.ceil(loan.remainingBalance)));
                  const dispLoanName = localizeLoanName(loan, language);
                  const catLabel = t.loans.categories[loan.category] ?? loan.category;
                  return (
                    <div key={loan.id} className="py-4 first:pt-1 last:pb-1 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-[#665B53]">
                            {catLabel} · {(loan.annualInterestRate * 100).toFixed(1)}% {t.common.apr} ·{' '}
                            {loan.remainingMonths} {t.loans.moLeftSuffix}
                          </div>
                          <div className="text-base sm:text-lg font-bold mt-0.5">{dispLoanName}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono text-base sm:text-lg font-bold text-[#DC2626] tabular-nums whitespace-nowrap">
                            {formatCurrency(loan.remainingBalance)}
                          </div>
                          <div className="font-mono text-xs sm:text-sm text-[#665B53] tabular-nums whitespace-nowrap">
                            {formatCurrency(loan.monthlyPayment)}
                            {t.common.perMonth}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={loan.remainingBalance}
                          value={customPay}
                          onChange={(e) =>
                            setRepayInputs({ ...repayInputs, [loan.id]: e.target.value })
                          }
                          className="w-28 min-h-[42px] rounded-xl border border-[#DFC9B4] bg-white px-3 font-mono text-sm font-bold text-[#26201C] focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={
                            (Number(customPay) || 0) <= 0 ||
                            Math.min(Number(customPay) || 0, loan.remainingBalance) >
                              summary.cashAsset
                          }
                          onClick={() => onRepayLoan(loan.id, Number(customPay) || 0)}
                          className="min-h-[42px] rounded-xl bg-white hover:bg-white/80 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white px-3.5 text-sm font-bold text-[#26201C] transition-colors"
                        >
                          {t.loans.repayCustom}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRepayLoan(loan.id, loan.remainingBalance)}
                          disabled={summary.cashAsset < loan.remainingBalance}
                          className="min-h-[42px] rounded-xl bg-[#F7CA44] hover:bg-[#EBBF36] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#F7CA44] px-3.5 text-sm font-bold text-[#26201C] transition-colors"
                        >
                          {t.loans.payOffFull} ({formatCurrency(loan.remainingBalance)})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
