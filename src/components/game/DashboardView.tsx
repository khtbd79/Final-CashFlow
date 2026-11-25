import React, { useRef } from 'react';
import {
  ArrowRight,
  Baby,
  Check,
  Lock,
  Meh,
  Plus,
  Scale,
  Smile,
  X,
} from 'lucide-react';
import { getT } from '../../data/i18n';
import {
  getEducationCoursesForProfession,
  getEducationCourseTitle,
  getEffectiveEducationCost,
  getEffectiveHappinessCost,
  getEffectiveInsurancePlanPremium,
  getEffectivePersonalAssetInsurance,
  getEffectivePersonalAssetPrice,
  getHappinessCardDescription,
  getHappinessItemsForProfession,
  getInsurancePlanName,
  getLotteryTicketName,
  getPersonalAssetById,
  getPersonalAssetName,
  getWeddingCost,
  INSURANCE_PLANS,
  LOTTERY_TICKETS,
  PERSONAL_ASSETS,
} from '../../data/lifestyle';
import { formatCurrency } from '../../engine/prng';
import {
  FinancialSummary,
  GameSettings,
  GameState,
  LotteryTicketId,
  NavSection,
  PersonalAssetId,
} from '../../types/game';
import {
  EducationIllustration,
  InsuranceHealthIllustration,
  LotteryIllustration,
  PersonalAssetIllustration,
} from '../common/LifestyleIllustrations';

interface DashboardViewProps {
  game: GameState;
  summary: FinancialSummary;
  settings: GameSettings;
  onNextMonth: () => void;
  onPayMonthlyExpense: () => void;
  onNavigate: (section: NavSection) => void;
  onBuyHappiness: (itemId: string) => void;
  onIgnoreHappinessCard: (cardId: string) => void;
  onBuyPersonalAsset: (assetId: PersonalAssetId) => void;
  onTogglePersonalAssetInsurance: (assetId: PersonalAssetId) => void;
  onMarry: () => void;
  onCompleteEducation: (courseId: string) => void;
  onToggleInsurance: (planId: 'health' | 'property') => void;
  onTryVenture: (
    ventureId: string
  ) => { outcomeType: 'win' | 'loss'; delta: number; ventureId: string } | undefined;
  onPlayLottery: (
    ticketId: LotteryTicketId
  ) => { outcomeType: 'win' | 'loss'; delta: number; ticketId: LotteryTicketId } | undefined;
}

const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}> = ({ title, subtitle, rightSlot }) => {
  return (
    <div className="space-y-1 px-0.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
            {title}
          </h3>
          {rightSlot}
        </div>
      </div>
      {subtitle && (
        <p className="text-sm sm:text-base text-white/85 leading-snug max-w-2xl">{subtitle}</p>
      )}
    </div>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  game,
  summary,
  settings,
  onNextMonth,
  onPayMonthlyExpense,
  onNavigate,
  onBuyHappiness,
  onIgnoreHappinessCard,
  onBuyPersonalAsset,
  onTogglePersonalAssetInsurance,
  onMarry,
  onCompleteEducation,
  onToggleInsurance,
  onPlayLottery,
}) => {
  const lastDeckActionTimeRef = useRef<number>(0);

  const lang = settings.language;
  const t = getT(lang);
  const maritalStatus = game.maritalStatus ?? 'single';
  const childrenCount = game.childrenCount ?? 0;
  const weddingCost = getWeddingCost(game);

  const ownedPersonal = game.personalAssets ?? [];
  const playedLotteryIds = new Set(game.playedLotteryIdsThisTurn ?? []);
  const educationCourses = getEducationCoursesForProfession(game.professionId);
  const completedEducationIds = new Set(game.completedEducationIds ?? []);
  const educationBoostsById = game.educationBoostsById ?? {};
  const educatedThisYear = (game.lastEducationYear ?? 0) === game.year;
  const needsMonthlyExpense = !game.monthlyExpensePaidThisTurn;

  // Build sequential 5-card Happiness & Marriage deck inside the central card (strictly 6 total steps: 1 expense + 5 cards)
  const handledSet = new Set(game.handledHappinessIdsThisTurn ?? []);
  const includeMarriageCard = maritalStatus !== 'married' || handledSet.has('__marry__');
  const candidatePool = [
    ...(game.activeHappinessItems ?? []),
    ...getHappinessItemsForProfession(game.professionId),
  ];
  const seenCardIds = new Set<string>();
  const uniqueHappinessPool = candidatePool.filter((item) => {
    if (!item?.id || item.id === '__marry__' || seenCardIds.has(item.id)) return false;
    seenCardIds.add(item.id);
    return true;
  });
  const selectedHappiness = uniqueHappinessPool.slice(0, includeMarriageCard ? 4 : 5);

  type TurnDecisionCard =
    | {
        cardId: string;
        kind: 'happiness';
        description: string;
        cost: number;
        happinessGain: number;
      }
    | {
        cardId: '__marry__';
        kind: 'marry';
        description: string;
        cost: number;
        happinessGain: number;
      };

  const happinessDeckCards: TurnDecisionCard[] = selectedHappiness.map((item) => ({
    cardId: item.id,
    kind: 'happiness',
    description: getHappinessCardDescription(item, lang),
    cost: getEffectiveHappinessCost(item, game),
    happinessGain: item.happinessGain,
  }));

  if (includeMarriageCard) {
    const marryCard: TurnDecisionCard = {
      cardId: '__marry__',
      kind: 'marry',
      description: t.dashboard.marryCardDesc,
      cost: weddingCost,
      happinessGain: 18,
    };
    const insertIdx = Math.min(2, happinessDeckCards.length);
    happinessDeckCards.splice(insertIdx, 0, marryCard);
  }

  const totalCardSteps = 1 + happinessDeckCards.length;
  const handledDeckCount = happinessDeckCards.filter((c) => handledSet.has(c.cardId)).length;
  const nextHappinessCard = !needsMonthlyExpense
    ? happinessDeckCards.find((c) => !handledSet.has(c.cardId)) ?? null
    : null;
  const completedSteps = needsMonthlyExpense
    ? 0
    : Math.min(totalCardSteps, 1 + handledDeckCount);
  const progressPct = Math.min(100, (completedSteps / totalCardSteps) * 100);
  const canBuyCurrentCard = nextHappinessCard
    ? summary.cashAsset >= nextHappinessCard.cost
    : false;

  const canProcessDeckTap = () => {
    const now = Date.now();
    if (now - lastDeckActionTimeRef.current < 220) return false;
    lastDeckActionTimeRef.current = now;
    return true;
  };

  return (
    <div className="space-y-6">

      {/* CENTRAL FOCAL WARM CREAM CARD: 1) Monthly Expense -> 2) Sequential Happiness & Marriage Deck -> 3) End Month */}
      <section
        id="happiness-panel"
        className="rounded-3xl bg-[#F6E7D7] p-5 sm:p-6 text-[#26201C] shadow-xl"
      >
        <div className="relative h-7 w-full overflow-hidden rounded-full bg-white/90">
          <div
            className="h-full rounded-full bg-[#B8B5EE] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-[#26201C]">
            {completedSteps}/{totalCardSteps}
          </div>
        </div>

        {needsMonthlyExpense ? (() => {
          const insufficientForExpense = summary.cashAsset < summary.livingExpensesTotal;
          return (
            <div key="monthly-expense">
              <h2 className="mt-6 font-display text-2xl font-bold text-[#26201C] text-left leading-snug">
                {t.dashboard.monthlyExpenseTitle}
              </h2>

              <p className="mt-3 text-base leading-relaxed text-[#4A423C] text-left">
                {t.dashboard.monthlyExpenseDesc}
              </p>

              <div className="mt-5 font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-[#26201C] text-center">
                {formatCurrency(summary.livingExpensesTotal)}
              </div>

              {insufficientForExpense && (
                <div className="mt-4 rounded-2xl bg-[#FEE2E2] p-3.5 text-center space-y-2.5">
                  <div className="text-xs sm:text-sm font-bold text-[#991B1B]">
                    {lang === 'bn'
                      ? `পর্যাপ্ত নগদ নেই (হাতে আছে ${formatCurrency(summary.cashAsset)})। বিনিয়োগ তুলে নিন অথবা ঋণ নিন।`
                      : `Insufficient cash (${formatCurrency(summary.cashAsset)} available). Withdraw investments or take a loan.`}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate('investments')}
                      className="rounded-xl bg-white hover:bg-white/90 px-3 py-1.5 text-xs font-bold text-[#26201C] shadow-sm transition-colors"
                    >
                      {t.nav.investments}
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('take_loan')}
                      className="rounded-xl bg-white hover:bg-white/90 px-3 py-1.5 text-xs font-bold text-[#26201C] shadow-sm transition-colors"
                    >
                      {t.nav.takeLoan}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={insufficientForExpense}
                onClick={() => {
                  if (!canProcessDeckTap()) return;
                  onPayMonthlyExpense();
                }}
                className="mt-6 w-full min-h-[54px] inline-flex items-center justify-center rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] active:scale-[0.99] px-6 py-3.5 text-base sm:text-lg font-bold text-[#26201C] shadow-sm transition-all disabled:opacity-45 disabled:cursor-not-allowed"
              >
                {t.dashboard.payExpenseBtn}
              </button>
            </div>
          );
        })() : nextHappinessCard ? (
          <div key={nextHappinessCard.cardId}>
            <p className="mt-6 px-1 text-center text-lg sm:text-xl font-medium leading-relaxed text-[#26201C]">
              {nextHappinessCard.description}
            </p>

            <div className="my-5 h-px w-full bg-[#26201C]/25" />

            <div className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-[#26201C] text-center">
              {formatCurrency(nextHappinessCard.cost)}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3.5">
              <div className="flex flex-col items-center gap-2">
                <div className="inline-flex items-center gap-1.5 font-mono text-lg font-bold text-[#26201C]">
                  <span>
                    {nextHappinessCard.happinessGain > 0
                      ? `-${nextHappinessCard.happinessGain}`
                      : '0'}
                  </span>
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F06E6E] text-white">
                    <Meh className="h-4 w-4" />
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!canProcessDeckTap()) return;
                    onIgnoreHappinessCard(nextHappinessCard.cardId);
                  }}
                  aria-label={t.dashboard.ignoreHappinessAria}
                  className="w-full min-h-[54px] inline-flex items-center justify-center rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] active:scale-[0.99] text-[#26201C] shadow-sm transition-all"
                >
                  <X className="h-7 w-7 stroke-[2.5]" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="inline-flex items-center gap-1.5 font-mono text-lg font-bold text-[#26201C]">
                  <span>+{nextHappinessCard.happinessGain}</span>
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#169C5E] text-white">
                    <Smile className="h-4 w-4" />
                  </span>
                </div>
                <button
                  type="button"
                  disabled={!canBuyCurrentCard}
                  onClick={() => {
                    if (!canProcessDeckTap()) return;
                    if (nextHappinessCard.kind === 'marry') {
                      onMarry();
                    } else {
                      onBuyHappiness(nextHappinessCard.cardId);
                    }
                  }}
                  aria-label={t.dashboard.buyHappinessAria}
                  className="w-full min-h-[54px] inline-flex items-center justify-center rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] active:scale-[0.99] text-[#26201C] shadow-sm transition-all disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  <Plus className="h-7 w-7 stroke-[2.75]" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div key="turn-end">
            <h2 className="mt-6 font-display text-2xl font-bold text-[#26201C] text-left leading-snug">
              {t.dashboard.turnCardTitle}
            </h2>

            <p className="mt-3 text-base leading-relaxed text-[#4A423C] text-left">
              {t.dashboard.turnCardDesc}
            </p>

            <button
              type="button"
              onClick={onNextMonth}
              className="mt-6 w-full min-h-[54px] inline-flex items-center justify-center rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] active:scale-[0.99] px-6 py-3.5 text-base sm:text-lg font-bold text-[#26201C] shadow-sm transition-all"
            >
              {t.dashboard.turnCardBtn}
            </button>
          </div>
        )}
      </section>

      {/* COMPACT FAMILY & INFLATION STATUS STRIP */}
      {(childrenCount > 0 || (game.inflationRate ?? 0) > 0) && (
        <div className="flex flex-wrap items-center gap-2 px-0.5">
          {childrenCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white/90">
              <Baby className="h-3.5 w-3.5 text-[#60A5FA]" />
              {t.dashboard.childrenLabel}: {childrenCount}
            </span>
          )}
          {(game.inflationRate ?? 0) > 0 && (
            <span className="rounded-full bg-[#DC2626]/85 px-3 py-1 font-mono text-xs font-bold text-white">
              {t.dashboard.inflationTag} +{game.inflationRate}%
            </span>
          )}
        </div>
      )}

      {/* YEAR-END ZAKAT & INCOME TAX DUE REMINDER */}
      {(summary.zakatDueEffective > 0 || summary.incomeTaxDueEffective > 0) && (
        <section className="rounded-3xl bg-[#F6E7D7] p-5 text-[#26201C] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ring-2 ring-[#F7CA44]/75">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#169C5E]/15 text-[#169C5E]">
              <Scale className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="font-display text-lg font-bold text-[#26201C]">
                {t.dashboard.zakatTaxReminderTitle}
              </div>
              <p className="text-sm text-[#4A423C] leading-snug">{t.dashboard.zakatTaxReminderDesc}</p>
              <div className="flex flex-wrap items-center gap-3 pt-0.5 font-mono text-sm font-bold tabular-nums">
                {summary.zakatDueEffective > 0 && (
                  <span className="text-[#169C5E]">
                    {t.turnSummary.yearEndZakatAssessed}: {formatCurrency(summary.zakatDueEffective)}
                  </span>
                )}
                {summary.incomeTaxDueEffective > 0 && (
                  <span className="text-[#D97706]">
                    {t.turnSummary.yearEndTaxAssessed}:{' '}
                    {formatCurrency(summary.incomeTaxDueEffective)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onNavigate(
                summary.zakatDueEffective > 0 && summary.incomeTaxDueEffective === 0
                  ? 'zakat'
                  : 'tax'
              )
            }
            className="min-h-[48px] shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] px-5 py-2.5 text-sm sm:text-base font-bold text-[#26201C] shadow-sm transition-colors"
          >
            <span>{t.dashboard.openZakatTaxBtn}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      )}

      {/* 0. EDUCATION / SKILL UPGRADES HORIZONTAL CAROUSEL (শিক্ষা — 5 per character, 1 per year) */}
      <section className="space-y-3">
        <SectionHeader
          title={t.dashboard.educationTitle}
          subtitle={t.dashboard.educationSubtitle}
          rightSlot={
            educatedThisYear ? (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-[#F7CA44]">
                {t.dashboard.educationYearDone}
              </span>
            ) : undefined
          }
        />

        <div className="flex gap-3.5 overflow-x-auto overscroll-x-contain touch-pan-x touch-pan-y pb-2 snap-x snap-proximity -mx-4 px-4 sm:mx-0 sm:px-0">
          {educationCourses.map((course, idx) => {
            const completed = completedEducationIds.has(course.id);
            const missingPrereq = educationCourses
              .slice(0, idx)
              .find((prev) => !completedEducationIds.has(prev.id));
            const lockedBySequence = !completed && Boolean(missingPrereq);
            const prereqTitle = missingPrereq
              ? getEducationCourseTitle(missingPrereq, lang)
              : '';
            const earnedBoost = educationBoostsById[course.id];
            const cost = getEffectiveEducationCost(course, game);
            const affordable = summary.cashAsset >= cost;
            const canTake = !completed && !lockedBySequence && !educatedThisYear && affordable;
            const title = getEducationCourseTitle(course, lang);

            return (
              <div
                key={course.id}
                className={`snap-start shrink-0 w-[204px] sm:w-[228px] rounded-[24px] p-4 sm:p-5 text-center text-[#26201C] shadow-xl flex flex-col items-center justify-between transition-opacity ${
                  completed
                    ? 'bg-[#FFFDF7] ring-2 ring-[#169C5E]/50'
                    : lockedBySequence
                      ? 'bg-[#E5DFD6] opacity-60'
                      : canTake
                        ? 'bg-[#F7F3EE]'
                        : 'bg-[#EAE5DD] opacity-65'
                }`}
              >
                <div>
                  <div className="font-display text-base sm:text-lg font-bold text-[#26201C] leading-snug">
                    {title}
                  </div>
                  <div
                    className={`text-sm font-semibold mt-0.5 ${
                      completed ? 'text-[#169C5E]' : 'text-[#5E544C]'
                    }`}
                  >
                    {completed && typeof earnedBoost === 'number'
                      ? `${t.dashboard.educationSalaryPrefix} +${earnedBoost}%`
                      : `${t.dashboard.educationSalaryPrefix} +${course.minSalaryBoostPct}-${course.maxSalaryBoostPct}%`}
                  </div>
                </div>

                <div className="my-2.5 flex h-24 w-full items-center justify-center">
                  <EducationIllustration tier={course.tier} className="w-28 h-24" />
                </div>

                <div className="w-full space-y-2.5">
                  <div className="font-mono text-xl font-bold text-[#26201C] tabular-nums">
                    {formatCurrency(cost)}
                  </div>

                  {completed ? (
                    <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-3.5 py-1.5 text-sm font-bold text-[#14532D]">
                      <Check className="h-4 w-4 text-[#169C5E] stroke-[3]" />
                      <span>{t.dashboard.educationCompleted}</span>
                    </div>
                  ) : lockedBySequence ? (
                    <div className="space-y-1.5">
                      <div
                        aria-disabled="true"
                        title={`${t.dashboard.educationLockedPrevPrefix} ${prereqTitle}`}
                        className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#D3C7B8] text-[#5E544C] cursor-not-allowed"
                      >
                        <Lock className="h-5 w-5 stroke-[2.25]" />
                      </div>
                      <div className="text-xs font-semibold text-[#5E544C] leading-tight line-clamp-2">
                        {t.dashboard.educationLockedPrevPrefix} {prereqTitle}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!canTake}
                      onClick={() => onCompleteEducation(course.id)}
                      className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F7CA44] hover:bg-[#EBBF36] active:scale-95 text-[#26201C] shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label={title}
                    >
                      <Plus className="h-6 w-6 stroke-[2.75]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 1. INSURANCE HORIZONTAL CAROUSEL (বীমা — matches Screenshot) */}
      <section className="space-y-3">
        <SectionHeader
          title={t.dashboard.insuranceTitle}
          subtitle={t.dashboard.insuranceSubtitle}
        />

        <div className="flex gap-3.5 overflow-x-auto overscroll-x-contain touch-pan-x touch-pan-y pb-2 snap-x snap-proximity -mx-4 px-4 sm:mx-0 sm:px-0">
          {INSURANCE_PLANS.filter((plan) => plan.id === 'health').map((plan) => {
            const active = Boolean(game.healthInsured);
            const premium = getEffectiveInsurancePlanPremium(plan, game);
            const cantAffordEnroll = !active && summary.cashAsset < premium;
            return (
              <div
                key={plan.id}
                className={`snap-start shrink-0 w-[200px] sm:w-[224px] rounded-[24px] p-4 sm:p-5 text-center text-[#26201C] shadow-xl flex flex-col items-center justify-between transition-opacity ${
                  active
                    ? 'bg-[#FFF9E6] ring-2 ring-[#F7CA44]'
                    : cantAffordEnroll
                      ? 'bg-[#EAE5DD] opacity-65'
                      : 'bg-[#F7F3EE]'
                }`}
              >
                <div>
                  <div className="font-display text-lg sm:text-xl font-bold text-[#26201C]">
                    {getInsurancePlanName(plan, lang)}
                  </div>
                  <div className="text-sm font-semibold text-[#5E544C] mt-0.5">
                    {active ? t.dashboard.insuranceActive : t.common.perMonth}
                  </div>
                </div>

                <div className="my-3 flex h-24 w-full items-center justify-center">
                  <InsuranceHealthIllustration className="w-24 h-24" />
                </div>

                <div className="w-full space-y-2.5">
                  <div>
                    <div className="font-mono text-xl font-bold text-[#26201C] tabular-nums">
                      {formatCurrency(premium)}
                    </div>
                    <div className="text-sm font-medium text-[#5E544C]">{t.common.perMonth}</div>
                  </div>

                  {active ? (
                    <button
                      type="button"
                      onClick={() => onToggleInsurance(plan.id)}
                      className="mx-auto flex items-center justify-center gap-2 rounded-full bg-[#F7CA44] px-3.5 py-2 text-sm font-bold text-[#26201C] shadow-sm"
                      aria-label={getInsurancePlanName(plan, lang)}
                    >
                      <span className="h-4 w-4 rounded-full bg-white flex items-center justify-center">
                        <Check className="h-3 w-3 text-[#169C5E] stroke-[3]" />
                      </span>
                      <span>{t.dashboard.insuranceActive}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={cantAffordEnroll}
                      onClick={() => onToggleInsurance(plan.id)}
                      className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F7CA44] hover:bg-[#EBBF36] active:scale-95 text-[#26201C] shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label={getInsurancePlanName(plan, lang)}
                    >
                      <Plus className="h-6 w-6 stroke-[2.75]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {ownedPersonal.map((ownedAsset) => {
            const tpl = getPersonalAssetById(ownedAsset.id);
            const assetName = getPersonalAssetName(tpl, lang);
            const premium = getEffectivePersonalAssetInsurance(tpl, game);
            const active = Boolean(ownedAsset.insured);
            const cantAffordEnroll = !active && summary.cashAsset < premium;

            return (
              <div
                key={`ins_${ownedAsset.id}`}
                className={`snap-start shrink-0 w-[200px] sm:w-[224px] rounded-[24px] p-4 sm:p-5 text-center text-[#26201C] shadow-xl flex flex-col items-center justify-between transition-opacity ${
                  active
                    ? 'bg-[#FFF9E6] ring-2 ring-[#F7CA44]'
                    : cantAffordEnroll
                      ? 'bg-[#EAE5DD] opacity-65'
                      : 'bg-[#F7F3EE]'
                }`}
              >
                <div>
                  <div className="font-display text-lg sm:text-xl font-bold text-[#26201C]">
                    {assetName}
                  </div>
                  <div className="text-sm font-semibold text-[#5E544C] mt-0.5">
                    {active ? t.dashboard.insuranceActive : t.common.perMonth}
                  </div>
                </div>

                <div className="my-3 flex h-24 w-full items-center justify-center">
                  <PersonalAssetIllustration assetId={ownedAsset.id} className="w-28 h-24" />
                </div>

                <div className="w-full space-y-2.5">
                  <div>
                    <div className="font-mono text-xl font-bold text-[#26201C] tabular-nums">
                      {formatCurrency(premium)}
                    </div>
                    <div className="text-sm font-medium text-[#5E544C]">{t.common.perMonth}</div>
                  </div>

                  {active ? (
                    <button
                      type="button"
                      onClick={() => onTogglePersonalAssetInsurance(ownedAsset.id)}
                      className="mx-auto flex items-center justify-center gap-2 rounded-full bg-[#F7CA44] px-3.5 py-2 text-sm font-bold text-[#26201C] shadow-sm"
                      aria-label={assetName}
                    >
                      <span className="h-4 w-4 rounded-full bg-white flex items-center justify-center">
                        <Check className="h-3 w-3 text-[#169C5E] stroke-[3]" />
                      </span>
                      <span>{t.dashboard.insuranceActive}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={cantAffordEnroll}
                      onClick={() => onTogglePersonalAssetInsurance(ownedAsset.id)}
                      className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F7CA44] hover:bg-[#EBBF36] active:scale-95 text-[#26201C] shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label={assetName}
                    >
                      <Plus className="h-6 w-6 stroke-[2.75]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. PERSONAL ASSETS / SHOPPING HORIZONTAL CAROUSEL (কেনাকাটা / নিজস্ব সম্পদ) */}
      <section className="space-y-3">
        <SectionHeader
          title={t.dashboard.personalAssetsTitle}
          subtitle={t.dashboard.personalAssetsSubtitle}
        />

        <div className="flex gap-3.5 overflow-x-auto overscroll-x-contain touch-pan-x touch-pan-y pb-2 snap-x snap-proximity -mx-4 px-4 sm:mx-0 sm:px-0">
          {PERSONAL_ASSETS.map((item) => {
            const owned = ownedPersonal.find((o) => o.id === item.id);
            const price = getEffectivePersonalAssetPrice(item, game);
            const affordable = summary.cashAsset >= price;
            const name = getPersonalAssetName(item, lang);

            return (
              <div
                key={item.id}
                className={`snap-start shrink-0 w-[204px] sm:w-[228px] rounded-[24px] p-4 sm:p-5 text-center text-[#26201C] shadow-xl flex flex-col items-center justify-between transition-opacity ${
                  owned
                    ? 'bg-[#FFFDF7] ring-2 ring-[#169C5E]/50'
                    : affordable
                      ? 'bg-[#F7F3EE]'
                      : 'bg-[#F3E9C9] opacity-80'
                }`}
              >
                <div>
                  <div className="font-display text-lg font-bold text-[#26201C]">
                    {name}
                  </div>
                  <div className="text-sm font-semibold text-[#5E544C] mt-0.5">
                    {owned
                      ? t.dashboard.ownedBadge
                      : `+${item.buyHappinessBonus} ${t.happinessLabel}`}
                  </div>
                </div>

                <div className="my-2.5 flex h-24 w-full items-center justify-center">
                  <PersonalAssetIllustration assetId={item.id} className="w-28 h-24" />
                </div>

                {owned ? (
                  <div className="w-full space-y-2.5">
                    <div className="font-mono text-xl font-bold text-[#26201C] tabular-nums">
                      {formatCurrency(owned.purchasePrice)}
                    </div>
                    <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-3.5 py-1.5 text-sm font-bold text-[#14532D]">
                      <Check className="h-4 w-4 text-[#169C5E] stroke-[3]" />
                      <span>{t.dashboard.ownedBadge}</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-2.5">
                    <div>
                      <div className="font-mono text-xl font-bold text-[#26201C] tabular-nums">
                        {formatCurrency(price)}
                      </div>
                      <div className="text-sm font-mono font-semibold text-[#B91C1C]">
                        -{item.yearlyHappinessPenalty} {t.dashboard.yearlyPenaltyUnit}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!affordable}
                      onClick={() => onBuyPersonalAsset(item.id)}
                      className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F7CA44] hover:bg-[#EBBF36] active:scale-95 text-[#26201C] shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label={name}
                    >
                      <Plus className="h-6 w-6 stroke-[2.75]" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. LUCKY LOTTERY HORIZONTAL CAROUSEL (ভাগ্য লটারি) */}
      <section className="space-y-3">
        <SectionHeader
          title={t.dashboard.lotteryTitle}
          subtitle={t.dashboard.lotterySubtitle}
          rightSlot={
            (game.pendingLotteryTickets ?? []).length > 0 ? (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-[#F7CA44]">
                {lang === 'bn'
                  ? `${(game.pendingLotteryTickets ?? []).length}টি টিকিট সারসংক্ষেপে`
                  : `${(game.pendingLotteryTickets ?? []).length} in summary`}
              </span>
            ) : undefined
          }
        />

        <div className="flex gap-3.5 overflow-x-auto overscroll-x-contain touch-pan-x touch-pan-y pb-2 snap-x snap-proximity -mx-4 px-4 sm:mx-0 sm:px-0">
          {LOTTERY_TICKETS.map((ticket) => {
            const alreadyPlayed = playedLotteryIds.has(ticket.id);
            const affordable = !alreadyPlayed && summary.cashAsset >= ticket.cost;
            const title = getLotteryTicketName(ticket, lang);
            return (
              <div
                key={ticket.id}
                className={`snap-start shrink-0 w-[204px] sm:w-[228px] rounded-[24px] p-4 sm:p-5 text-center text-[#26201C] shadow-xl flex flex-col items-center justify-between transition-opacity ${
                  alreadyPlayed
                    ? 'bg-[#E9E1D6]'
                    : affordable
                      ? 'bg-[#F7F3EE]'
                      : 'bg-[#EAE5DD] opacity-65'
                }`}
              >
                <div>
                  <div className="font-display text-base sm:text-lg font-bold text-[#26201C] leading-snug">
                    {title}
                  </div>
                  <div className="text-sm font-mono font-bold text-[#169C5E] mt-1">
                    +{formatCurrency(ticket.jackpotMax)}
                  </div>
                </div>

                <div className="my-2 flex h-20 w-full items-center justify-center">
                  <LotteryIllustration className="w-24 h-20" />
                </div>

                <div className="w-full space-y-2">
                  <div className="font-mono text-xl font-bold text-[#26201C] tabular-nums">
                    {formatCurrency(ticket.cost)}
                  </div>

                  {alreadyPlayed ? (
                    <div className="mx-auto inline-flex items-center gap-1 rounded-full bg-[#D6C7B5] px-3.5 py-1.5 text-sm font-bold text-[#4A4038]">
                      <Check className="h-4 w-4" />
                      <span>{t.dashboard.lotteryPlayedBadge}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!affordable}
                      onClick={() => onPlayLottery(ticket.id)}
                      className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F7CA44] hover:bg-[#EBBF36] active:scale-95 text-[#26201C] shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label={title}
                    >
                      <Plus className="h-6 w-6 stroke-[2.75]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
