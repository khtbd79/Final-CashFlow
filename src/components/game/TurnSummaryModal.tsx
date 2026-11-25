import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Frown,
  HelpCircle,
  Smile,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import menuWealthHeroImg from '../../assets/images/menu_wealth_hero_1795324461170.jpg';
import { getT } from '../../data/i18n';
import { localizeTransactionText, localizeTurnNote } from '../../data/localization';
import { formatCurrency, formatYearMonth } from '../../engine/prng';
import { LanguageCode, TurnSummary } from '../../types/game';
import { TurnSummaryEventIllustration } from '../common/LifestyleIllustrations';

interface TurnSummaryModalProps {
  summary: TurnSummary | null;
  language: LanguageCode;
  onClose: () => void;
  onGoToEvents: () => void;
  onGoToTax?: () => void;
}

function formatSignedPct(value: number): string {
  if (value === 0) return '0%';
  const sign = value > 0 ? '+' : '-';
  return `${sign}${Math.abs(value)}%`;
}

function formatSignedNum(value: number): string {
  if (value === 0) return '0';
  const sign = value > 0 ? '+' : '-';
  return `${sign}${Math.abs(value)}`;
}

export const TurnSummaryModal: React.FC<TurnSummaryModalProps> = ({
  summary,
  language,
  onClose,
  onGoToEvents,
  onGoToTax,
}) => {
  const [bgError, setBgError] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showInflationHelp, setShowInflationHelp] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (summary) {
      window.scrollTo({ top: 0 });
    }
  }, [summary]);

  if (!summary) return null;

  const isBn = language === 'bn';
  const t = getT(language);
  const completedYear = summary.completedYear ?? summary.year;
  const completedMonth = summary.completedMonth ?? summary.month;
  const isYearEnd = completedMonth === 12;

  const headerTitle = isYearEnd
    ? isBn
      ? 'বার্ষিক সারসংক্ষেপ'
      : 'Annual Summary'
    : isBn
      ? 'মাসিক সারসংক্ষেপ'
      : 'Monthly Summary';

  const capitalValue =
    summary.totalAssetsAfter ?? summary.cashAfter ?? Math.max(0, summary.netWorthAfter ?? 0);
  const goalValue = summary.freedomCapitalGoal ?? 175000;
  const capitalPct =
    summary.capitalProgressPct ??
    (goalValue > 0
      ? Math.min(100, Math.max(0, Math.round((capitalValue / goalValue) * 100)))
      : 0);
  const salaryChangePct = summary.salaryChangePct ?? 0;

  const investmentResults = summary.investmentResults ?? [];
  const desireImpacts = summary.desireImpacts ?? [];
  const subscriptionImpacts = summary.subscriptionImpacts ?? [];
  const eventCards = summary.eventSummaryCards ?? [];

  const viewEventsText =
    summary.eventsGeneratedCount === 1
      ? t.turnSummary.viewEventsSingular
      : isBn
        ? `${summary.eventsGeneratedCount}${t.turnSummary.viewEventsPlural}`
        : `View ${summary.eventsGeneratedCount} ${t.turnSummary.viewEventsPlural}`;

  const actions = summary.actionsDuringTurn ?? [];
  const passiveBreakdown = [
    { label: t.turnSummary.stockDividends, val: summary.stockDividendsReceived ?? 0 },
    { label: t.turnSummary.goldDividends, val: summary.goldDividendsReceived ?? 0 },
    { label: t.turnSummary.bondInterest, val: summary.bondInterestReceived ?? 0 },
    { label: t.turnSummary.savingsInterest, val: summary.savingsInterestReceived ?? 0 },
    { label: t.turnSummary.rentalIncome, val: summary.rentalIncomeReceived ?? 0 },
    { label: t.turnSummary.autoBizIncome, val: summary.automatedBusinessReceived ?? 0 },
    { label: t.turnSummary.otherPassive, val: summary.otherPassiveReceived ?? 0 },
  ].filter((r) => r.val > 0);

  return (
    <div
      className="relative z-50 min-h-[100dvh] bg-[#191C24] text-white"
      role="dialog"
      aria-modal="true"
      aria-label={headerTitle}
    >
      {/* Cityscape Atmospheric Backdrop matching GameShell */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {!bgError && (
          <img
            src={menuWealthHeroImg}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setBgError(true)}
            className="h-full w-full object-cover brightness-[0.34] contrast-[1.06]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#14171F]/80 via-[#191C24]/82 to-[#14171F]/94" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-lg px-4 pt-5 pb-[calc(28px+env(safe-area-inset-bottom,0px))] space-y-5">
        {/* Top Bar: Title + Help (?) */}
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white">
              {headerTitle}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-mono text-white/70">
              <span>{formatYearMonth(completedYear, completedMonth, language)}</span>
              <span className="rounded-md bg-[#169C5E]/25 px-2 py-0.5 font-sans font-bold text-[#4ADE80]">
                {t.turnSummary.completedBadge}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowHelp((prev) => !prev)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white/80 text-white/95 hover:bg-white/10 transition-colors"
            aria-label={isBn ? 'সারসংক্ষেপ সাহায্য' : 'Summary help'}
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </header>

        {showHelp && (
          <div className="rounded-2xl bg-[#222733]/95 border border-white/15 p-4 text-xs sm:text-sm text-white/90 leading-relaxed shadow-lg">
            {isBn
              ? 'এই সারসংক্ষেপে আপনার সমাপ্ত মাসের মোট মূলধন ও আর্থিক স্বাধীনতার অগ্রগতি, বেতন, সক্রিয় বিনিয়োগের ফলাফল (%), আকাঙ্ক্ষা/সুখের পরিবর্তন এবং মাসের বিশেষ ইভেন্টসমূহ দেখানো হয়েছে। নিচে "চালিয়ে যান" বাটনে ক্লিক করলে নতুন মাস শুরু হবে।'
              : 'This summary shows your ending Capital & Financial Freedom progress, Salary, active Investment returns (%), Desires/Happiness changes, and completed monthly Events. Tap "Continue" below to enter the new month.'}
          </div>
        )}

        {/* Capital & Goal Progress Card */}
        <section className="rounded-2xl bg-[#F6E7D7] p-4 text-[#26201C] shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#7C6F65]">
                {isBn ? 'মূলধন' : 'Capital'}
              </div>
              <div className="mt-0.5 font-mono text-lg sm:text-xl font-bold text-[#26201C] tabular-nums">
                {formatCurrency(capitalValue)}
              </div>
            </div>

            <div className="min-w-0 text-right">
              <div className="text-xs font-semibold text-[#7C6F65]">
                {isBn ? 'লক্ষ্য' : 'Goal'}
              </div>
              <div className="mt-0.5 font-mono text-lg sm:text-xl font-bold text-[#26201C] tabular-nums">
                {formatCurrency(goalValue)}
              </div>
            </div>
          </div>

          <div className="relative mt-3 h-7 w-full overflow-hidden rounded-full bg-white shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#56C2F6] to-[#38BDF8] transition-all duration-500"
              style={{ width: `${capitalPct}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-[#26201C] tabular-nums">
              {capitalPct}%
            </div>
          </div>
        </section>

        {/* Salary Card */}
        <section className="rounded-2xl bg-[#F6E7D7] px-4 py-3.5 text-[#26201C] shadow-lg flex items-center justify-between gap-3">
          <span className="text-base font-bold text-[#26201C]">
            {isBn ? 'বেতন' : 'Salary'}
          </span>
          <div className="text-right font-mono tabular-nums">
            <div className="text-base font-bold text-[#169C5E]">
              {formatCurrency(summary.salaryReceived)}
            </div>
            <div
              className={`text-xs font-bold ${
                salaryChangePct > 0
                  ? 'text-[#169C5E]'
                  : salaryChangePct < 0
                    ? 'text-[#DC2626]'
                    : 'text-[#7C6F65]'
              }`}
            >
              {formatSignedPct(salaryChangePct)}
            </div>
          </div>
        </section>

        {/* Investments Section (বিনিয়োগ) */}
        <section className="space-y-2.5">
          <h3 className="font-display text-lg font-bold text-white">
            {isBn ? 'বিনিয়োগ' : 'Investments'}
          </h3>

          {investmentResults.length === 0 ? (
            <div className="rounded-2xl bg-[#F6E7D7] px-4 py-3.5 text-[#26201C] shadow-md flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[#5E544C]">
                {isBn ? 'কোনো সক্রিয় বিনিয়োগ নেই' : 'No active investments'}
              </span>
              <span className="font-mono text-base font-bold text-[#7C6F65] tabular-nums">0%</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {investmentResults.map((item) => {
                const isPositive = item.returnPct >= 0;
                return (
                  <div
                    key={item.category}
                    className="rounded-2xl bg-[#F6E7D7] px-4 py-3.5 text-[#26201C] shadow-md flex items-center justify-between gap-3"
                  >
                    <span className="text-base font-bold text-[#26201C]">
                      {isBn ? item.labelBn : item.labelEn}
                    </span>
                    <div className="text-right font-mono tabular-nums">
                      <div
                        className={`text-base font-bold ${
                          item.returnPct > 0
                            ? 'text-[#169C5E]'
                            : item.returnPct < 0
                              ? 'text-[#DC2626]'
                              : 'text-[#665B53]'
                        }`}
                      >
                        {formatSignedPct(item.returnPct)}
                      </div>
                      {item.amountDelta !== 0 && (
                        <div
                          className={`text-xs font-semibold ${
                            isPositive ? 'text-[#169C5E]/85' : 'text-[#DC2626]/85'
                          }`}
                        >
                          {formatCurrency(item.amountDelta, true)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Desires Section (আকাঙ্ক্ষা) */}
        <section className="space-y-2.5">
          <h3 className="font-display text-lg font-bold text-white">
            {isBn ? 'আকাঙ্ক্ষা' : 'Desires'}
          </h3>

          <div className="space-y-2.5">
            {desireImpacts.map((item) => {
              const isPos = item.delta >= 0;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#F6E7D7] px-4 py-3.5 text-[#26201C] shadow-md flex items-center justify-between gap-3"
                >
                  <span className="text-base font-bold text-[#26201C]">
                    {isBn ? item.labelBn : item.labelEn}
                  </span>
                  <div className="inline-flex items-center gap-2 font-mono text-base font-bold tabular-nums">
                    <span className={isPos ? 'text-[#169C5E]' : 'text-[#EF5A5A]'}>
                      {formatSignedNum(item.delta)}
                    </span>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${
                        isPos ? 'bg-[#22C55E]' : 'bg-[#F87171]'
                      }`}
                    >
                      {isPos ? <Smile className="h-4 w-4" /> : <Frown className="h-4 w-4" />}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Subscriptions Section (সাবস্ক্রিপশন) */}
        {subscriptionImpacts.length > 0 && (
          <section className="space-y-2.5">
            <h3 className="font-display text-lg font-bold text-white">
              {isBn ? 'সাবস্ক্রিপশন' : 'Subscriptions'}
            </h3>

            <div className="space-y-2.5">
              {subscriptionImpacts.map((item) => {
                const isPos = item.delta >= 0;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-[#F6E7D7] px-4 py-3.5 text-[#26201C] shadow-md flex items-center justify-between gap-3"
                  >
                    <span className="text-base font-bold text-[#26201C]">
                      {isBn ? item.labelBn : item.labelEn}
                    </span>
                    <div className="inline-flex items-center gap-2 font-mono text-base font-bold tabular-nums">
                      <span className={isPos ? 'text-[#169C5E]' : 'text-[#EF5A5A]'}>
                        {formatSignedNum(item.delta)}
                      </span>
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${
                          isPos ? 'bg-[#22C55E]' : 'bg-[#F87171]'
                        }`}
                      >
                        {isPos ? <Smile className="h-4 w-4" /> : <Frown className="h-4 w-4" />}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Events Section (ইভেন্টগুলি) */}
        {eventCards.length > 0 && (
          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white">
              {isBn ? 'ইভেন্টগুলি' : 'Events'}
            </h3>

            <div className="space-y-3.5">
              {eventCards.map((card) => {
                const title = isBn ? card.titleBn : card.titleEn;
                const desc = isBn ? card.descriptionBn : card.descriptionEn;
                const resultText = isBn ? card.resultLabelBn : card.resultLabelEn;
                const isInsuredCard =
                  card.kind === 'resolved_event' &&
                  Boolean(
                    resultText &&
                      (resultText.includes('বীমা') || resultText.includes('Insurance'))
                  );

                return (
                  <div
                    key={card.id}
                    className="rounded-2xl bg-[#F6E7D7] p-5 text-center text-[#26201C] shadow-lg"
                  >
                    <div className="mb-3">
                      <TurnSummaryEventIllustration
                        kind={card.kind}
                        templateId={card.templateId}
                        isInsuredCard={isInsuredCard}
                        className="h-16 w-16 sm:h-20 sm:w-20 mx-auto"
                      />
                    </div>

                    {title && (
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <h4 className="font-display text-base sm:text-lg font-bold text-[#26201C]">
                          {title}
                        </h4>
                        {card.kind === 'inflation' && (
                          <button
                            type="button"
                            onClick={() => setShowInflationHelp((prev) => !prev)}
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#26201C]/70 text-[#26201C] hover:bg-black/5"
                            aria-label={isBn ? 'মুদ্রাস্ফীতি তথ্য' : 'Inflation info'}
                          >
                            <span className="font-mono text-[11px] font-bold">?</span>
                          </button>
                        )}
                      </div>
                    )}

                    {card.kind === 'inflation' && showInflationHelp && (
                      <div className="mt-2 rounded-xl bg-white/85 px-3 py-2 text-xs text-[#4A423C] leading-relaxed">
                        {isBn
                          ? 'প্রতি বছর শেষে মুদ্রাস্ফীতি নির্ধারিত হয়। "+" চিহ্ন মানে পণ্য, বীমা, শিক্ষা ও জীবনযাত্রার খরচ সেই শতাংশ হারে বেড়েছে; আর নিচের ব্যাজ থেকে দেখতে পাবেন আগের বছরের তুলনায় মুদ্রাস্ফীতির হার বেড়েছে নাকি কমেছে।'
                          : 'Inflation updates once per year. "+" means living expenses, insurance, and tuition rose by that percentage, and the badge below compares the new rate against last year.'}
                      </div>
                    )}

                    {desc && (
                      <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#4A423C] font-medium">
                        {desc}
                      </p>
                    )}

                    {card.amountDisplay !== undefined && card.kind !== 'inflation' && (
                      <div
                        className={`mt-2.5 font-mono text-xl font-bold tabular-nums ${
                          card.amountDisplay >= 0 ? 'text-[#169C5E]' : 'text-[#DC2626]'
                        }`}
                      >
                        {card.amountDisplay >= 0
                          ? formatCurrency(card.amountDisplay)
                          : `-${formatCurrency(Math.abs(card.amountDisplay))}`}
                      </div>
                    )}

                    {card.kind === 'inflation' && card.highlightPct !== undefined && (
                      <div className="mt-2.5 space-y-2">
                        <div
                          className={`inline-flex items-center justify-center gap-1.5 font-mono text-2xl font-extrabold tabular-nums ${
                            card.highlightPct > 0 ? 'text-[#26201C]' : 'text-[#169C5E]'
                          }`}
                        >
                          {card.highlightPct > 0 ? (
                            <TrendingUp className="h-5 w-5 text-[#DC2626]" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-[#169C5E]" />
                          )}
                          <span>{card.highlightPct}%</span>
                        </div>

                        <div>
                          {card.trendDeltaPct !== undefined ? (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                                card.trendDeltaPct > 0
                                  ? 'bg-[#FEE2E2] text-[#B91C1C]'
                                  : card.trendDeltaPct < 0
                                    ? 'bg-[#DCFCE7] text-[#15803D]'
                                    : 'bg-[#E5DCD2] text-[#4A423C]'
                              }`}
                            >
                              {card.trendDeltaPct > 0
                                ? isBn
                                  ? `▲ গত বছরের (${card.previousPct ?? 0}%) তুলনায় +${card.trendDeltaPct}% বেড়েছে`
                                  : `▲ Up +${card.trendDeltaPct}% vs last year (${card.previousPct ?? 0}%)`
                                : card.trendDeltaPct < 0
                                  ? isBn
                                    ? `▼ গত বছরের (${card.previousPct ?? 0}%) তুলনায় -${Math.abs(card.trendDeltaPct)}% কমেছে`
                                    : `▼ Down -${Math.abs(card.trendDeltaPct)}% vs last year (${card.previousPct ?? 0}%)`
                                  : isBn
                                    ? `গত বছরের সমান (${card.previousPct ?? 0}%)`
                                    : `Same as last year (${card.previousPct ?? 0}%)`}
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                                card.highlightPct > 0
                                  ? 'bg-[#FEE2E2] text-[#B91C1C]'
                                  : 'bg-[#DCFCE7] text-[#15803D]'
                              }`}
                            >
                              {card.highlightPct > 0
                                ? isBn
                                  ? `▲ দাম ও খরচ +${card.highlightPct}% বেড়েছে`
                                  : `▲ Prices & costs rose +${card.highlightPct}%`
                                : isBn
                                  ? 'মূল্য স্থিতিশীল (বাড়েনি)'
                                  : 'Prices stable (0%)'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {resultText && (
                      <div className="mt-3 pt-2.5 border-t border-[#DFCBB5] text-sm font-bold text-[#26201C]">
                        {resultText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Black Swan quick alert banner if Black Swan happened and wasn't already clear */}
        {summary.blackSwanTriggered && !eventCards.some((c) => c.kind === 'black_swan') && (
          <div className="rounded-2xl bg-[#191C24] border border-[#F7CA44]/40 p-4 text-white flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[#F7CA44] shrink-0" />
            <div className="text-xs sm:text-sm">{t.turnSummary.blackSwanTitle}</div>
          </div>
        )}

        {/* Collapsible Cashflow & Actions Breakdown */}
        <section className="rounded-2xl bg-[#F6E7D7]/95 text-[#26201C] shadow-md overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-[#EFE0CE] transition-colors"
          >
            <div>
              <div className="text-sm font-bold text-[#26201C]">
                {isBn ? 'আয়, খরচ ও কার্যক্রমের বিবরণী' : 'Cashflow & Actions Breakdown'}
              </div>
              <div className="text-xs font-mono text-[#665B53] mt-0.5 tabular-nums">
                {t.turnSummary.netCashChange}:{' '}
                <span
                  className={
                    summary.netTurnCashChange >= 0
                      ? 'font-bold text-[#169C5E]'
                      : 'font-bold text-[#DC2626]'
                  }
                >
                  {formatCurrency(summary.netTurnCashChange, true)}
                </span>
              </div>
            </div>
            {showDetails ? (
              <ChevronUp className="h-5 w-5 text-[#5E544C] shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[#5E544C] shrink-0" />
            )}
          </button>

          {showDetails && (
            <div className="px-4 pb-4 pt-2 border-t border-[#E2CEB9] space-y-3 text-xs sm:text-sm">
              {/* Income & Expense lines */}
              <div className="space-y-1.5 font-mono tabular-nums">
                <div className="flex justify-between">
                  <span className="font-sans text-[#5E544C]">{t.turnSummary.salaryReceived}</span>
                  <span className="font-bold text-[#169C5E]">
                    +{formatCurrency(summary.salaryReceived)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-[#5E544C]">{t.turnSummary.passiveReceived}</span>
                  <span className="font-bold text-[#169C5E]">
                    +{formatCurrency(summary.passiveIncomeReceived)}
                  </span>
                </div>

                {passiveBreakdown.length > 0 && (
                  <div className="rounded-xl bg-white/75 px-3 py-2 space-y-1 text-xs">
                    {passiveBreakdown.map((item) => (
                      <div key={item.label} className="flex justify-between gap-2">
                        <span className="font-sans text-[#665B53]">{item.label}</span>
                        <span className="font-bold text-[#169C5E]">+{formatCurrency(item.val)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {summary.activeBusinessRevenue > 0 && (
                  <div className="flex justify-between">
                    <span className="font-sans text-[#5E544C]">{t.turnSummary.activeBizRev}</span>
                    <span className="font-bold text-[#169C5E]">
                      +{formatCurrency(summary.activeBusinessRevenue)}
                    </span>
                  </div>
                )}

                <div className="border-t border-[#E2CEB9] my-1.5" />

                <div className="flex justify-between">
                  <span className="font-sans text-[#5E544C]">{t.turnSummary.livingPaid}</span>
                  <span className="font-bold text-[#DC2626]">
                    -{formatCurrency(summary.livingExpensesPaid)}
                  </span>
                </div>
                {(summary.insurancePaid ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="font-sans text-[#5E544C]">{t.turnSummary.insurancePaid}</span>
                    <span className="font-bold text-[#DC2626]">
                      -{formatCurrency(summary.insurancePaid ?? 0)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-sans text-[#5E544C]">{t.turnSummary.loanPaid}</span>
                  <span className="font-bold text-[#DC2626]">
                    -{formatCurrency(summary.loanPaymentsPaid)}
                  </span>
                </div>
                {summary.businessExpensesPaid > 0 && (
                  <div className="flex justify-between">
                    <span className="font-sans text-[#5E544C]">{t.turnSummary.bizExpPaid}</span>
                    <span className="font-bold text-[#DC2626]">
                      -{formatCurrency(summary.businessExpensesPaid)}
                    </span>
                  </div>
                )}
                {summary.propertyExpensesPaid > 0 && (
                  <div className="flex justify-between">
                    <span className="font-sans text-[#5E544C]">{t.turnSummary.propMaintPaid}</span>
                    <span className="font-bold text-[#DC2626]">
                      -{formatCurrency(summary.propertyExpensesPaid)}
                    </span>
                  </div>
                )}
              </div>

              {actions.length > 0 && (
                <div className="rounded-xl bg-white/80 p-3 space-y-1.5">
                  <div className="text-xs font-bold text-[#4A423C]">
                    {t.turnSummary.didSectionTitle}
                  </div>
                  {actions.map((act, idx) => (
                    <div key={idx} className="flex justify-between gap-2 text-xs">
                      <span className="truncate text-[#26201C]">
                        {localizeTransactionText(act.description, language)}
                      </span>
                      <span
                        className={`font-mono font-bold shrink-0 ${
                          act.amount > 0
                            ? 'text-[#169C5E]'
                            : act.amount < 0
                              ? 'text-[#DC2626]'
                              : 'text-[#665B53]'
                        }`}
                      >
                        {act.amount === 0 ? '$0' : formatCurrency(act.amount, true)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {(summary.inflationRateCurrent ?? 0) > 0 && (
                <div className="rounded-xl bg-white/80 px-3 py-2 flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#5E544C]">
                    {isBn ? 'বর্তমান বার্ষিক মুদ্রাস্ফীতির হার' : 'Current Annual Inflation Rate'}
                  </span>
                  <span className="font-mono font-bold text-[#DC2626] tabular-nums">
                    +{summary.inflationRateCurrent}%
                  </span>
                </div>
              )}

              {summary.notes.length > 0 && (
                <div className="rounded-xl bg-white/80 p-3 text-xs text-[#5E544C] space-y-1">
                  {summary.notes.map((n, i) => (
                    <div key={i}>• {localizeTurnNote(n, language)}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Bottom Action Buttons */}
        <div className="pt-1 space-y-2.5">
          {((summary.zakatAssessedThisYearEnd ?? 0) > 0 ||
            (summary.taxAssessedThisYearEnd ?? 0) > 0) &&
            onGoToTax && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToTax();
                }}
                className="w-full min-h-[48px] rounded-2xl bg-[#169C5E] hover:bg-[#12834E] px-4 py-2.5 text-sm font-bold text-white shadow-md transition-colors"
              >
                {t.turnSummary.payZakatTaxBtn}
              </button>
            )}

          {summary.eventsGeneratedCount > 0 && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onGoToEvents();
              }}
              className="w-full min-h-[46px] rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2 text-xs sm:text-sm font-bold text-white transition-colors"
            >
              {viewEventsText}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[54px] rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] active:scale-[0.99] px-6 py-3 text-base font-bold text-[#26201C] shadow-xl transition-all"
          >
            {isBn ? 'চালিয়ে যান' : t.turnSummary.continueBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
