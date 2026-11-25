import React from 'react';
import { CheckCircle2, EyeOff, Plus, X } from 'lucide-react';
import { getCharacterSignatureConfig } from '../../data/events';
import { getT } from '../../data/i18n';
import { localizeEventCard } from '../../data/localization';
import { formatCurrency } from '../../engine/prng';
import { EventChoice, FinancialSummary, GameEventCard, GameState, LanguageCode } from '../../types/game';
import { EventCardIllustration } from '../common/LifestyleIllustrations';

interface EventsViewProps {
  game: GameState;
  summary: FinancialSummary;
  language: LanguageCode;
  ignoreEvents: boolean;
  onResolveEvent: (eventId: string, choiceId: string) => void;
  onDismissEvent: (eventId: string) => void;
  onIgnoreAllEvents: () => void;
  onToggleIgnoreEvents: (ignore: boolean) => void;
}

interface EventMetricRow {
  label: string;
  value: string;
}

function getChoiceCashCost(
  choice: EventChoice,
  evt: GameEventCard,
  game: GameState
): { requiredCash: number; isInsured: boolean } {
  const insuredMedical = evt.templateId === 'exp_medical' && Boolean(game.healthInsured);
  const ownedPersonalAssets = game.personalAssets ?? [];
  const insuredAsset =
    (evt.templateId === 'exp_car_repair' &&
      (Boolean(game.propertyInsured) ||
        ownedPersonalAssets.some((a) => a.id === 'car' && a.insured))) ||
    (evt.templateId === 'exp_home_repair' &&
      (Boolean(game.propertyInsured) ||
        ownedPersonalAssets.some((a) => (a.id === 'house' || a.id === 'villa') && a.insured)));

  const isInsured = insuredMedical || insuredAsset;

  if (choice.effectType === 'stock_opportunity') {
    return {
      requiredCash: Math.round((choice.amount ?? 0) * (choice.shares ?? 1) * 100) / 100,
      isInsured: false,
    };
  }
  if (choice.effectType === 'cash_delta' && (choice.amount ?? 0) < 0 && isInsured) {
    return {
      requiredCash: Math.round(Math.abs(choice.amount ?? 0) * 0.15 * 100) / 100,
      isInsured: true,
    };
  }
  return {
    requiredCash: choice.amount !== undefined ? Math.abs(choice.amount) : 0,
    isInsured: false,
  };
}

function buildEventMetricRows(
  evt: GameEventCard,
  lang: LanguageCode,
  game: GameState
): EventMetricRow[] {
  const isBn = lang === 'bn';
  const perMo = isBn ? '/মাস' : '/mo';

  if (evt.templateId === 'opp_stock_nvda_block' || evt.templateId === 'opp_stock_vltg_block') {
    const buyChoice = evt.choices.find((c) => c.id === 'buy_block');
    if (buyChoice) {
      const shares = buyChoice.shares ?? 25;
      const offerPrice = buyChoice.amount ?? 0;
      const totalCost = Math.round(offerPrice * shares);
      const disc = buyChoice.secondaryAmount ?? 15;
      return [
        {
          label: isBn ? 'শেয়ার সংখ্যা' : 'Shares',
          value: `${shares} ${buyChoice.symbol ?? ''} (${disc}% ${isBn ? 'ছাড়' : 'off'})`,
        },
        {
          label: isBn ? 'বিনিয়োগ' : 'Cost',
          value: formatCurrency(totalCost),
        },
      ];
    }
  }

  if (
    evt.templateId === 'opp_property_distressed_duplex' ||
    evt.templateId === 'opp_property_starter_condo'
  ) {
    const pt = evt.choices.find((c) => c.id === 'buy_financed')?.propertyTemplate;
    if (pt) {
      return [
        {
          label: isBn ? 'মাসিক ভাড়া আয়' : 'Monthly Rent',
          value: `+${formatCurrency(pt.monthlyRentalIncome)}${perMo}`,
        },
        {
          label: isBn ? 'ডাউন পেমেন্ট' : 'Down Payment',
          value: `${formatCurrency(pt.downPayment)} (${isBn ? 'মূল্য' : 'Price'} ${formatCurrency(pt.purchasePrice)})`,
        },
        {
          label: isBn ? 'রক্ষণাবেক্ষণ খরচ' : 'Maintenance',
          value: `${formatCurrency(pt.maintenanceExpense)}${perMo}`,
        },
      ];
    }
  }

  if (evt.templateId === 'opp_business_kiosk_partner') {
    const bt = evt.choices.find((c) => c.id === 'buy_biz')?.businessTemplate;
    if (bt) {
      return [
        {
          label: isBn ? 'মাসিক আয়' : 'Monthly Income',
          value: `+${formatCurrency(bt.monthlyRevenue)}${perMo}`,
        },
        {
          label: isBn ? 'বিনিয়োগ' : 'Investment',
          value: formatCurrency(bt.purchasePrice),
        },
        {
          label: isBn ? 'পরিচালনা ব্যয়' : 'Operating Exp',
          value: `${formatCurrency(bt.monthlyOperatingExpenses)}${perMo}`,
        },
      ];
    }
  }

  if (evt.templateId === 'opp_side_consulting') {
    const bonus = evt.choices.find((c) => c.id === 'accept_gig')?.amount ?? 0;
    return [
      {
        label: isBn ? 'সম্ভাব্য আয়' : 'Potential Income',
        value: `+${formatCurrency(bonus)}`,
      },
      {
        label: isBn ? 'খরচ' : 'Cost',
        value: formatCurrency(0),
      },
    ];
  }

  if (evt.templateId === 'opp_royalty_license') {
    const c = evt.choices.find((ch) => ch.id === 'fund_license');
    const cost = c?.amount ?? 0;
    const gain = c?.secondaryAmount ?? 0;
    return [
      {
        label: isBn ? 'মাসিক আয়' : 'Monthly Income',
        value: `+${formatCurrency(gain)}${perMo}`,
      },
      {
        label: isBn ? 'বিনিয়োগ' : 'Investment',
        value: formatCurrency(cost),
      },
    ];
  }

  if (evt.templateId === 'opp_board_game_publish') {
    const c = evt.choices.find((ch) => ch.id === 'fund_venture');
    const cost = c?.amount ?? 1400;
    const maxPay = c?.secondaryAmount ?? 3600;
    return [
      {
        label: isBn ? 'বিনিয়োগ' : 'Investment',
        value: formatCurrency(cost),
      },
      {
        label: isBn ? 'সম্ভাব্য আয়' : 'Potential Payout',
        value: formatCurrency(maxPay),
      },
    ];
  }

  if (evt.templateId === 'opp_medical_conference') {
    const c = evt.choices.find((ch) => ch.id === 'accept_conference');
    const travel = c?.amount ?? 1200;
    const fee = c?.secondaryAmount ?? 2600;
    return [
      {
        label: isBn ? 'বক্তার পারিশ্রমিক' : 'Speaker Fee',
        value: formatCurrency(fee),
      },
      {
        label: isBn ? 'ভ্রমণ খরচ' : 'Travel Expense',
        value: formatCurrency(travel),
      },
    ];
  }

  if (evt.isCharacterSignature || evt.templateId.startsWith('char_opp_')) {
    const c = evt.choices.find((ch) => ch.id === 'fund_signature');
    const sigCfg = getCharacterSignatureConfig(game.professionId);
    const cost = c?.amount ?? sigCfg.baseCost;
    const minPayout = Math.round((cost * (1 + sigCfg.minReturnPct / 100)) / 10) * 10;
    const maxPayout =
      c?.secondaryAmount ?? Math.round((cost * (1 + sigCfg.maxReturnPct / 100)) / 10) * 10;
    return [
      {
        label: isBn ? 'বিনিয়োগ' : 'Investment',
        value: formatCurrency(cost),
      },
      {
        label: isBn ? 'সম্ভাব্য মোট আয়' : 'Expected Return',
        value: `${formatCurrency(minPayout)} – ${formatCurrency(maxPayout)}`,
      },
    ];
  }

  if (evt.category === 'expense_emergency') {
    const payChoice = evt.choices.find((c) => c.id === 'pay_cash');
    const loanChoice = evt.choices.find((c) => c.id === 'finance_emergency');
    const rawCost = Math.abs(payChoice?.amount ?? loanChoice?.amount ?? 0);
    const { requiredCash, isInsured } = payChoice
      ? getChoiceCashCost(payChoice, evt, game)
      : { requiredCash: rawCost, isInsured: false };

    const rows: EventMetricRow[] = [
      {
        label: isBn ? 'খরচ' : 'Expense',
        value: isInsured
          ? `${formatCurrency(requiredCash)} (${isBn ? 'বীমায় ৮৫% ছাড়' : '85% insured'})`
          : formatCurrency(requiredCash),
      },
    ];
    if (loanChoice) {
      rows.push({
        label: isBn ? 'জরুরি ঋণ' : 'Emergency Loan',
        value: `${formatCurrency(rawCost)} (${isBn ? '১৬% সুদ · ২৪ মাস' : '16% APR · 24 mo'})`,
      });
    }
    return rows;
  }

  if (evt.templateId === 'life_salary_raise') {
    const pct = Math.round(((evt.choices[0]?.secondaryAmount ?? 1.08) - 1) * 100);
    return [
      {
        label: isBn ? 'মাসিক বেতন বৃদ্ধি' : 'Salary Increase',
        value: `+${pct}%`,
      },
    ];
  }

  if (evt.templateId === 'life_promotion') {
    const bonus = evt.choices[0]?.amount ?? 0;
    const raise = evt.choices[0]?.secondaryAmount ?? 0;
    return [
      {
        label: isBn ? 'বেতন বৃদ্ধি' : 'Salary Bump',
        value: `+${formatCurrency(raise)}${perMo}`,
      },
      {
        label: isBn ? 'নগদ বোনাস' : 'Signing Bonus',
        value: `+${formatCurrency(bonus)}`,
      },
    ];
  }

  if (evt.templateId === 'life_salary_cut') {
    const pct = Math.abs(Math.round(((evt.choices[0]?.secondaryAmount ?? 0.93) - 1) * 100));
    return [
      {
        label: isBn ? 'বেতন সমন্বয়' : 'Salary Adjustment',
        value: `-${pct}%`,
      },
    ];
  }

  if (evt.templateId === 'life_property_boom') {
    const boomPct = Math.round(((evt.choices[0]?.secondaryAmount ?? 1.12) - 1) * 100);
    return [
      {
        label: isBn ? 'প্রপার্টি মূল্য বৃদ্ধি' : 'Property Valuation',
        value: `+${boomPct}%`,
      },
    ];
  }

  if (evt.templateId === 'life_new_baby') {
    const birthCost = evt.choices[0]?.amount ?? 700;
    const care = evt.choices[0]?.secondaryAmount ?? 220;
    return [
      {
        label: isBn ? 'প্রাথমিক খরচ' : 'Initial Expense',
        value: formatCurrency(birthCost),
      },
      {
        label: isBn ? 'মাসিক খরচ বৃদ্ধি' : 'Monthly Care Cost',
        value: `+${formatCurrency(care)}${perMo}`,
      },
      {
        label: isBn ? 'সুখ' : 'Happiness',
        value: '+14',
      },
    ];
  }

  if (evt.templateId === 'life_divorce') {
    const fee = evt.choices[0]?.amount ?? 1500;
    return [
      {
        label: isBn ? 'মীমাংসা খরচ' : 'Settlement Cost',
        value: formatCurrency(fee),
      },
      {
        label: isBn ? 'সুখ' : 'Happiness',
        value: '-15',
      },
    ];
  }

  return [
    {
      label: isBn ? 'প্রভাব' : 'Impact',
      value: evt.financialImpactSummary,
    },
  ];
}

export const EventsView: React.FC<EventsViewProps> = ({
  game,
  summary,
  language,
  ignoreEvents,
  onResolveEvent,
  onDismissEvent,
  onToggleIgnoreEvents,
}) => {
  const t = getT(language);
  const pending = game.pendingEvents
    .filter((e) => !e.resolved)
    .map((e) => localizeEventCard(e, language));

  return (
    <div className="space-y-5">
      {/* Header Row: Left-aligned 'সুযোগ' title */}
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
        {t.events.title}
      </h2>

      {ignoreEvents ? (
        <section className="rounded-3xl bg-[#F6E7D7] p-7 text-center text-[#26201C] shadow-lg space-y-3">
          <EyeOff className="h-9 w-9 text-[#686CA8] mx-auto" />
          <div className="text-base font-bold">{t.events.ignoreModeTitle}</div>
          <p className="text-xs sm:text-sm text-[#5E544C] max-w-md mx-auto">
            {t.events.ignoreModeDesc}
          </p>
          <button
            type="button"
            onClick={() => onToggleIgnoreEvents(false)}
            className="min-h-[44px] rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] px-5 py-2 text-xs sm:text-sm font-bold text-[#26201C] transition-colors"
          >
            {t.events.enableEventsBtn}
          </button>
        </section>
      ) : (
        <section className="space-y-4">
          {pending.length === 0 ? (
            <div className="rounded-3xl bg-[#F6E7D7] p-8 text-center text-[#26201C] shadow-lg">
              <CheckCircle2 className="h-9 w-9 text-[#169C5E] mx-auto" />
              <div className="mt-2 text-base font-bold">{t.events.allResolvedTitle}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pending.map((evt) => {
                const categoryLabel = t.events.categories[evt.category];
                const metricRows = buildEventMetricRows(evt, language, game);

                // Separate primary action (+), decline action (X), and optional emergency loan
                const declineChoice = evt.choices.find((c) => c.effectType === 'dismiss');
                const emergencyLoanChoice = evt.choices.find(
                  (c) => c.effectType === 'take_emergency_loan'
                );
                const primaryChoice =
                  evt.choices.find(
                    (c) =>
                      c.effectType !== 'dismiss' &&
                      c.effectType !== 'take_emergency_loan'
                  ) ?? evt.choices[0];

                let needsCash = false;
                if (primaryChoice) {
                  const { requiredCash } = getChoiceCashCost(primaryChoice, evt, game);
                  const exceedsBorrowing =
                    primaryChoice.effectType === 'property_opportunity' &&
                    Boolean(primaryChoice.propertyTemplate) &&
                    (primaryChoice.propertyTemplate?.loanAmount ?? 0) >
                      summary.remainingBorrowingCapacity;
                  needsCash =
                    (Boolean(primaryChoice.requiresCashCheck) &&
                      summary.cashAsset < requiredCash) ||
                    exceedsBorrowing;
                }

                const isBn = language === 'bn';
                const isSignature =
                  Boolean(evt.isCharacterSignature) || evt.templateId.startsWith('char_opp_');
                const isAnnual = evt.durationType === 'annual';
                const monthsLeft = Math.max(1, evt.remainingMonths ?? (isAnnual ? 12 : 1));
                const durationLabel = isSignature
                  ? isBn
                    ? `প্রতি মাসের নিজস্ব সুযোগ · ${t.monthLabel} ${evt.turnGenerated}`
                    : `Signature Monthly Opportunity · Mo ${evt.turnGenerated}`
                  : evt.category === 'opportunity'
                    ? isAnnual
                      ? isBn
                        ? `বার্ষিক সুযোগ · ${monthsLeft} মাস বাকি`
                        : `Annual Opportunity · ${monthsLeft} mo left`
                      : isBn
                        ? 'মাসিক সুযোগ · শুধুমাত্র এই মাস'
                        : 'Monthly Opportunity · This Month'
                    : `${categoryLabel} · ${t.monthLabel} ${evt.turnGenerated}`;

                return (
                  <article
                    key={evt.id}
                    className="rounded-3xl bg-[#F6E7D7] p-5 sm:p-6 text-[#26201C] flex flex-col justify-between gap-4 shadow-lg"
                  >
                    <div className="space-y-3.5">
                      {/* Top Header: Kicker + Title on Left, Isometric Illustration on Right */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-[#7A6E65]">
                            <span>{durationLabel}</span>
                          </div>
                          <h3 className="mt-1 font-display text-lg sm:text-xl font-bold text-[#26201C] leading-snug text-balance">
                            {evt.title}
                          </h3>
                        </div>

                        <EventCardIllustration
                          templateId={evt.templateId}
                          category={evt.category}
                          className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 -mt-1 -mr-1"
                        />
                      </div>

                      {/* Description */}
                      <p className="text-sm sm:text-base text-[#4A423C] leading-relaxed">
                        {evt.description}
                      </p>

                      {/* Hairline Divider */}
                      <div className="border-t border-[#DFCBB5]" />

                      {/* Clean Key-Value Financial Rows */}
                      <div className="space-y-1.5 text-sm sm:text-base text-[#3B332E] tabular-nums">
                        {metricRows.map((row, idx) => (
                          <div key={idx} className="flex flex-wrap items-baseline gap-1.5">
                            <span className="text-[#5E544C]">{row.label}:</span>
                            <span className="font-bold text-[#26201C]">{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Footer: Coral X & Gold + Squircle Buttons */}
                    <div className="pt-1 space-y-2.5">
                      {needsCash && (
                        <div className="text-center text-xs font-semibold text-[#DC2626]">
                          {t.common.insufficientCash}
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-12">
                        <button
                          type="button"
                          onClick={() =>
                            declineChoice
                              ? onResolveEvent(evt.id, declineChoice.id)
                              : onDismissEvent(evt.id)
                          }
                          aria-label={declineChoice?.label ?? t.events.ignoreSingleBtn}
                          title={declineChoice?.label ?? t.events.ignoreSingleBtn}
                          className="w-14 h-12 min-h-[48px] inline-flex items-center justify-center rounded-2xl bg-[#EE7A7A] hover:bg-[#E46868] active:scale-[0.97] text-[#26201C] shadow-sm transition-all"
                        >
                          <X className="h-6 w-6 stroke-[2.5]" />
                        </button>

                        {primaryChoice && (
                          <button
                            type="button"
                            disabled={needsCash}
                            onClick={() => onResolveEvent(evt.id, primaryChoice.id)}
                            aria-label={primaryChoice.label}
                            title={primaryChoice.label}
                            className="w-14 h-12 min-h-[48px] inline-flex items-center justify-center rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] active:scale-[0.97] text-[#26201C] shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-7 w-7 stroke-[2.5]" />
                          </button>
                        )}
                      </div>

                      {emergencyLoanChoice && (
                        <button
                          type="button"
                          onClick={() => onResolveEvent(evt.id, emergencyLoanChoice.id)}
                          className="w-full min-h-[44px] rounded-2xl bg-white/85 hover:bg-white px-4 py-2 text-xs sm:text-sm font-bold text-[#26201C] transition-colors"
                        >
                          {emergencyLoanChoice.label}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {(game.pendingOpportunityDeals ?? []).length > 0 && (
        <section className="space-y-3 pt-1">
          <div className="text-xs sm:text-sm font-semibold text-white/80">
            {language === 'bn'
              ? 'সক্রিয় সুযোগ বিনিয়োগ (মাস শেষে ফলাফল দেখা যাবে)'
              : 'Active Opportunity Investments (Results at Month Close)'}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {(game.pendingOpportunityDeals ?? []).map((deal) => (
              <div
                key={deal.id}
                className="rounded-3xl bg-[#F6E7D7] p-4 sm:p-5 text-[#26201C] shadow-lg flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-display text-base sm:text-lg font-bold text-[#26201C] leading-snug">
                    {language === 'bn' ? deal.titleBn : deal.titleEn}
                  </div>
                  <div className="mt-1 text-xs sm:text-sm text-[#5E544C] tabular-nums">
                    {language === 'bn'
                      ? `বিনিয়োগ করা হয়েছে: ${formatCurrency(deal.cost)}`
                      : `Invested: ${formatCurrency(deal.cost)}`}
                  </div>
                </div>
                <span className="shrink-0 rounded-xl bg-[#EFE0CC] px-3 py-1.5 text-xs font-bold text-[#5E544C]">
                  {language === 'bn' ? 'মাস শেষে ফলাফল' : 'Month Close'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
