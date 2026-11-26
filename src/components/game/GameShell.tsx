import React, { useEffect, useState } from 'react';
import {
  Banknote,
  BarChart3,
  Briefcase,
  Building2,
  CalendarPlus,
  Coins,
  CreditCard,
  Flame,
  Gem,
  Home,
  Landmark,
  Menu,
  PiggyBank,
  Rocket,
  Settings,
  Smile,
  X,
} from 'lucide-react';
import { getT } from '../../data/i18n';
import { localizeProfession } from '../../data/localization';
import { InvestmentSheetCategory } from '../../engine/gameEngine';
import { formatCurrency, formatShortLabel, formatYearMonth } from '../../engine/prng';
import {
  BusinessListing,
  FinancialSummary,
  GameSettings,
  GameState,
  LoanCategory,
  LotteryTicketId,
  NavSection,
  PersonalAssetId,
  PropertyListing,
} from '../../types/game';
import menuWealthHeroImg from '../../assets/images/menu_wealth_hero_1795324461170.jpg';
import { CashflowLogo } from '../common/CashflowLogo';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { BusinessesView } from './BusinessesView';
import { DashboardView } from './DashboardView';
import { EventsView } from './EventsView';
import { InvestmentMarketView } from './InvestmentMarketView';
import { LoansView } from './LoansView';
import { PropertiesView } from './PropertiesView';
import { ReportsView } from './ReportsView';
import { ZakatTaxView } from './ZakatTaxView';

interface GameShellProps {
  game: GameState;
  summary: FinancialSummary;
  settings: GameSettings;
  activeSection: NavSection;
  toast: { text: string; type: 'ok' | 'err' } | null;
  onDismissToast: () => void;
  onChangeSection: (section: NavSection) => void;
  onNextMonth: () => void;
  onPayMonthlyExpense: () => void;
  onBuyStock: (symbol: string, shares: number) => void;
  onSellStock: (symbol: string, shares: number) => void;
  onBuyCrypto: (symbol: string, units: number, exactSpendAmount?: number) => void;
  onSellCrypto: (symbol: string, units: number) => void;
  onInvestFixed: (productId: string, amount: number) => void;
  onRedeemFixed: (fixedId: string) => void;
  onWithdrawFixedAmount: (productId: string, amount: number) => void;
  onWithdrawCategory: (category: InvestmentSheetCategory) => void;
  onBuyProperty: (listing: PropertyListing, useFinancing: boolean) => void;
  onSellProperty: (propertyId: string) => void;
  onBuyBusiness: (listing: BusinessListing) => void;
  onAutomateBusiness: (businessId: string) => void;
  onSellBusiness: (businessId: string) => void;
  onStartCustomBusiness: (templateIndex: number, customName: string) => void;
  onApplyLoan: (
    category: LoanCategory,
    name: string,
    amount: number,
    termMonths: number,
    annualRate: number
  ) => void;
  onRepayLoan: (loanId: string, amount: number) => void;
  onResolveEvent: (eventId: string, choiceId: string) => void;
  onDismissEvent: (eventId: string) => void;
  onIgnoreAllEvents: () => void;
  onToggleIgnoreEvents: (ignore: boolean) => void;
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
  onPayZakat: (mode: 'due' | 'accrued') => void;
  onPayIncomeTax: (mode: 'due' | 'accrued') => void;
  onViewLastTurnSummary?: () => void;
  onOpenSettings: () => void;
  onReturnToMenu: () => void;
}

export const GameShell: React.FC<GameShellProps> = ({
  game,
  summary,
  settings,
  activeSection,
  toast,
  onDismissToast,
  onChangeSection,
  onNextMonth,
  onPayMonthlyExpense,
  onBuyStock,
  onSellStock,
  onBuyCrypto,
  onSellCrypto,
  onInvestFixed,
  onRedeemFixed,
  onWithdrawFixedAmount,
  onWithdrawCategory,
  onBuyProperty,
  onSellProperty,
  onBuyBusiness,
  onAutomateBusiness,
  onSellBusiness,
  onStartCustomBusiness,
  onApplyLoan,
  onRepayLoan,
  onResolveEvent,
  onDismissEvent,
  onIgnoreAllEvents,
  onToggleIgnoreEvents,
  onBuyHappiness,
  onIgnoreHappinessCard,
  onBuyPersonalAsset,
  onTogglePersonalAssetInsurance,
  onMarry,
  onCompleteEducation,
  onToggleInsurance,
  onTryVenture,
  onPlayLottery,
  onPayZakat,
  onPayIncomeTax,
  onViewLastTurnSummary,
  onOpenSettings,
  onReturnToMenu,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [investmentSheetOpen, setInvestmentSheetOpen] = useState(false);
  const [confirmNextOpen, setConfirmNextOpen] = useState(false);
  const [bgError, setBgError] = useState(false);

  useEffect(() => {
    setInvestmentSheetOpen(false);
    window.scrollTo({ top: 0 });
  }, [activeSection]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [mobileDrawerOpen]);

  const lang = settings.language;
  const t = getT(lang);
  const pendingEventCount = settings.ignoreEvents
    ? 0
    : game.pendingEvents.filter((e) => !e.resolved).length;
  const zakatDueCount = summary.zakatDueEffective > 0 ? 1 : 0;
  const incomeTaxDueCount = summary.incomeTaxDueEffective > 0 ? 1 : 0;
  const translatedProfessionName = localizeProfession(game.professionId, lang).name;
  const investedTotal = Math.max(0, summary.totalAssets - summary.cashAsset);

  const handleOpenHappinessPanel = () => {
    onChangeSection('dashboard');
    window.setTimeout(() => {
      const el = document.getElementById('happiness-panel');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const navItems: {
    id: NavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: Gem },
    { id: 'investments', label: t.nav.investments, icon: PiggyBank },
    { id: 'properties', label: t.nav.properties, icon: Building2 },
    { id: 'businesses', label: t.nav.businesses, icon: Briefcase },
    { id: 'loans', label: t.nav.loans, icon: CreditCard },
    { id: 'take_loan', label: t.nav.takeLoan, icon: Banknote },
    { id: 'zakat', label: t.nav.zakat, icon: Coins, badge: zakatDueCount || undefined },
    { id: 'tax', label: t.nav.tax, icon: Landmark, badge: incomeTaxDueCount || undefined },
    { id: 'events', label: t.nav.events, icon: Flame, badge: pendingEventCount || undefined },
    { id: 'reports', label: t.nav.reports, icon: BarChart3 },
  ];

  const mobileDrawerItems: {
    id: NavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: Gem },
    { id: 'take_loan', label: t.nav.takeLoan, icon: Banknote },
    { id: 'zakat', label: t.nav.zakat, icon: Coins, badge: zakatDueCount || undefined },
    { id: 'tax', label: t.nav.tax, icon: Landmark, badge: incomeTaxDueCount || undefined },
    { id: 'reports', label: t.nav.reports, icon: BarChart3 },
  ];

  const handleNextMonthClick = () => {
    if (!game.monthlyExpensePaidThisTurn) {
      onNextMonth();
      return;
    }
    if (settings.confirmNextMonth) {
      setConfirmNextOpen(true);
    } else {
      onNextMonth();
    }
  };

  const isDrawerSectionActive = [
    'properties',
    'businesses',
    'loans',
    'take_loan',
    'zakat',
    'tax',
    'reports',
  ].includes(activeSection);

  const formattedPeriod = formatYearMonth(game.year, game.month, lang);
  const confirmNextDesc = t.shell.confirmNextDescPrefix
    ? `${t.shell.confirmNextDescPrefix} ${formattedPeriod} ${t.shell.confirmNextDescSuffix}`
    : `${formattedPeriod} ${t.shell.confirmNextDescSuffix}`;

  return (
    <div className="relative min-h-[100dvh] bg-[#191C24] text-white flex flex-col lg:flex-row">
      {/* Subtle darkened cityscape atmosphere matching Screenshot 3 */}
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#14171F]/80 via-[#191C24]/82 to-[#14171F]/92" />
      </div>

      {/* DESKTOP SIDEBAR (lg+) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30 border-r border-white/10 bg-[#161920]/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <button
            type="button"
            onClick={onReturnToMenu}
            className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity"
            aria-label={t.victory.mainMenuBtn}
          >
            <CashflowLogo className="w-28 h-9" language={lang} />
          </button>
          <span className="font-mono text-xs text-white/60">
            {formatShortLabel(game.year, game.month, lang)}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeSection(item.id)}
                className={`flex w-full min-h-[44px] items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-[#F7CA44] text-[#26201C] shadow-sm'
                    : 'text-[#8A90A0] hover:bg-white/8 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${active ? 'text-[#26201C]' : 'text-[#8A90A0]'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </span>
                {item.badge !== undefined && (
                  <span
                    className={`font-mono text-xs font-bold ${
                      active ? 'text-[#26201C]' : 'text-[#F7CA44]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Sidebar Actions */}
        <div className="border-t border-white/10 p-4 space-y-2.5">
          <button
            type="button"
            onClick={handleNextMonthClick}
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] px-4 py-2.5 text-sm font-bold text-[#26201C] shadow-md transition-colors"
          >
            <CalendarPlus className="h-4 w-4" />
            {t.nextMonth}
          </button>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/8 text-xs font-medium text-white/85 hover:bg-white/15 transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
              {t.settings}
            </button>
            <button
              type="button"
              onClick={onReturnToMenu}
              className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/8 text-xs font-medium text-white/85 hover:bg-white/15 transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              {t.common.menu}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div
        className={`relative z-10 flex-1 lg:pl-64 flex-col min-w-0 min-h-[100dvh] ${
          mobileDrawerOpen ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* FROZEN TOP BAR + TOP 3 KPI CARDS (Investments, Cash, Happiness) */}
        <div
          className={`bg-[#161922] border-b border-white/10 shadow-[0_8px_20px_rgba(10,12,18,0.55)] ${
            investmentSheetOpen
              ? 'max-sm:fixed max-sm:top-0 max-sm:inset-x-0 max-sm:z-10 max-sm:pointer-events-none sm:sticky sm:top-0 sm:z-30'
              : 'sticky top-0 z-30'
          }`}
        >
          <header className="px-3 sm:px-6 pt-2.5 pb-2">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 sm:gap-5">
              {/* Left: Mobile Hamburger + Desktop Context */}
              <div className="flex items-center gap-3 min-w-0 shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(true)}
                  className="lg:hidden min-h-[44px] min-w-[44px] -ml-1.5 flex items-center justify-center rounded-xl text-white hover:bg-white/10 transition-colors"
                  aria-label={t.shell.openMenuAria}
                >
                  <Menu className="h-7 w-7 stroke-[2.25]" />
                </button>

                <span className="hidden lg:inline font-display text-sm font-semibold text-white truncate">
                  {translatedProfessionName} · {formattedPeriod}
                </span>
              </div>

              {/* Center: Prominent Year X Header on Mobile */}
              <div className="lg:hidden text-center">
                <div className="font-display text-lg font-bold tracking-wide text-white whitespace-nowrap">
                  {t.yearLabel} {game.year}
                </div>
              </div>

              {/* Center/Right: Spaced Passive/Exp & Cash metrics */}
              <div className="hidden sm:flex flex-1 items-center justify-end lg:justify-center gap-3 md:gap-4 min-w-0">
                <div className="inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 whitespace-nowrap">
                  <span className="text-xs font-medium text-white/70">{t.shell.passiveExp}</span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold tabular-nums">
                    <span className="text-[#34D399]">{formatCurrency(summary.passiveIncome)}</span>
                    <span className="text-white/40">/</span>
                    <span className="text-[#F87171]">{formatCurrency(summary.totalExpenses)}</span>
                  </span>
                </div>

                <div className="hidden md:inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 whitespace-nowrap">
                  <span className="text-xs font-medium text-white/70">{t.cashOnHand}</span>
                  <span className="font-mono text-sm font-bold text-[#F7CA44] tabular-nums">
                    {formatCurrency(summary.cashAsset)}
                  </span>
                </div>
              </div>

              {/* Right: Clean spacer on mobile dashboard, Next Month on desktop/other views */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden md:block">
                  <PWAInstallButton language={lang} />
                </div>

                {activeSection === 'dashboard' ? (
                  <>
                    <div className="w-11 sm:hidden" aria-hidden="true" />
                    <button
                      type="button"
                      onClick={handleNextMonthClick}
                      className="hidden sm:inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#F7CA44] hover:bg-[#EBBF36] px-3 sm:px-4 py-1.5 text-xs font-bold text-[#26201C] shadow-sm transition-colors whitespace-nowrap shrink-0"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" />
                      <span>{t.nextMonth}</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextMonthClick}
                    className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-[#F7CA44] hover:bg-[#EBBF36] px-3 sm:px-4 py-1.5 text-xs font-bold text-[#26201C] shadow-sm transition-colors whitespace-nowrap shrink-0"
                  >
                    <CalendarPlus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t.nextMonth}</span>
                    <span className="sm:hidden">{t.nextMonthShort}</span>
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* FROZEN TOP 3 WARM CREAM KPI CARDS (বিনিয়োগ, টাকা, সুখ) */}
          <div className="px-3 sm:px-6 pb-3 pt-1">
            <section className="mx-auto max-w-6xl grid grid-cols-3 gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => onChangeSection('investments')}
                className="min-w-0 rounded-2xl bg-[#F6E7D7] px-2 py-2.5 sm:p-4 text-center shadow-md hover:bg-[#F1DFCC] transition-colors"
              >
                <div className="mx-auto flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center">
                  <PiggyBank className="h-5 w-5 sm:h-7 sm:w-7 text-[#3B9AE1]" />
                </div>
                <div className="mt-0.5 font-mono text-[17px] sm:text-2xl font-bold text-[#26201C] tabular-nums whitespace-nowrap">
                  {formatCurrency(investedTotal)}
                </div>
                <div className="text-xs sm:text-base font-semibold text-[#5E544C] mt-0.5 whitespace-nowrap">
                  {t.investmentsLabel}
                </div>
              </button>

              <div className="min-w-0 rounded-2xl bg-[#F6E7D7] px-2 py-2.5 sm:p-4 text-center shadow-md">
                <div className="mx-auto flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center">
                  <Banknote className="h-5 w-5 sm:h-7 sm:w-7 text-[#169C5E]" />
                </div>
                <div className="mt-0.5 font-mono text-[17px] sm:text-2xl font-bold text-[#26201C] tabular-nums whitespace-nowrap">
                  {formatCurrency(summary.cashAsset)}
                </div>
                <div className="text-xs sm:text-base font-semibold text-[#5E544C] mt-0.5 whitespace-nowrap">
                  {t.cashOnHand}
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenHappinessPanel}
                className="min-w-0 rounded-2xl bg-[#F6E7D7] px-2 py-2.5 sm:p-4 text-center shadow-md hover:bg-[#F1DFCC] transition-colors"
              >
                <div className="mx-auto flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center">
                  <Smile className="h-5 w-5 sm:h-7 sm:w-7 text-[#F59E0B]" />
                </div>
                <div
                  className={`mt-0.5 font-mono text-[17px] sm:text-2xl font-bold tabular-nums whitespace-nowrap ${
                    summary.happiness <= 55
                      ? 'text-[#DC2626]'
                      : summary.happiness <= 65
                        ? 'text-[#D97706]'
                        : 'text-[#26201C]'
                  }`}
                >
                  {summary.happiness}
                </div>
                <div className="text-xs sm:text-base font-semibold text-[#5E544C] mt-0.5 whitespace-nowrap">
                  {t.happinessLabel}
                </div>
              </button>
            </section>
          </div>
        </div>

        {/* DOCUMENT-FLOW VIEW CONTENT */}
        <div className="flex-1 flex flex-col">
          {/* Feedback Toast Banner */}
          {toast && (
            <div className="mx-auto w-full max-w-6xl px-4 pt-3 sm:px-6">
              <div
                className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold shadow-md ${
                  toast.type === 'ok'
                    ? 'bg-[#DCFCE7] text-[#14532D]'
                    : 'bg-[#FEE2E2] text-[#7F1D1D]'
                }`}
              >
                <span>{toast.text}</span>
                <button
                  type="button"
                  onClick={onDismissToast}
                  className="opacity-70 hover:opacity-100 shrink-0"
                  aria-label={t.common.close}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Active View Content */}
          <main
            className={`mx-auto w-full max-w-6xl ${
              investmentSheetOpen
                ? 'max-sm:p-0'
                : 'px-4 py-4 pb-[calc(104px+env(safe-area-inset-bottom,0px))]'
            } sm:px-6 lg:py-6 lg:pb-8`}
          >
          {activeSection === 'dashboard' && (
            <DashboardView
              game={game}
              summary={summary}
              settings={settings}
              onNextMonth={handleNextMonthClick}
              onPayMonthlyExpense={onPayMonthlyExpense}
              onNavigate={onChangeSection}
              onBuyHappiness={onBuyHappiness}
              onIgnoreHappinessCard={onIgnoreHappinessCard}
              onBuyPersonalAsset={onBuyPersonalAsset}
              onTogglePersonalAssetInsurance={onTogglePersonalAssetInsurance}
              onMarry={onMarry}
              onCompleteEducation={onCompleteEducation}
              onToggleInsurance={onToggleInsurance}
              onTryVenture={onTryVenture}
              onPlayLottery={onPlayLottery}
            />
          )}
          {activeSection === 'investments' && (
            <InvestmentMarketView
              game={game}
              summary={summary}
              language={lang}
              onBuyStock={onBuyStock}
              onSellStock={onSellStock}
              onBuyCrypto={onBuyCrypto}
              onSellCrypto={onSellCrypto}
              onInvestFixed={onInvestFixed}
              onRedeemFixed={onRedeemFixed}
              onWithdrawFixedAmount={onWithdrawFixedAmount}
              onWithdrawCategory={onWithdrawCategory}
              onBuyProperty={onBuyProperty}
              onSellProperty={onSellProperty}
              onNavigate={onChangeSection}
              onSheetOpenChange={setInvestmentSheetOpen}
            />
          )}
          {activeSection === 'properties' && (
            <PropertiesView
              game={game}
              summary={summary}
              language={lang}
              onBuyProperty={onBuyProperty}
              onSellProperty={onSellProperty}
            />
          )}
          {activeSection === 'businesses' && (
            <BusinessesView
              game={game}
              summary={summary}
              language={lang}
              onBuyBusiness={onBuyBusiness}
              onAutomateBusiness={onAutomateBusiness}
              onSellBusiness={onSellBusiness}
              onStartCustomBusiness={onStartCustomBusiness}
            />
          )}
          {(activeSection === 'loans' || activeSection === 'take_loan') && (
            <LoansView
              game={game}
              summary={summary}
              language={lang}
              mode={activeSection === 'take_loan' ? 'apply' : 'liabilities'}
              onApplyLoan={onApplyLoan}
              onRepayLoan={onRepayLoan}
            />
          )}
          {(activeSection === 'zakat' || activeSection === 'tax') && (
            <ZakatTaxView
              game={game}
              summary={summary}
              language={lang}
              mode={activeSection === 'zakat' ? 'zakat' : 'tax'}
              onPayZakat={onPayZakat}
              onPayIncomeTax={onPayIncomeTax}
            />
          )}
          {activeSection === 'events' && (
            <EventsView
              game={game}
              summary={summary}
              language={lang}
              ignoreEvents={Boolean(settings.ignoreEvents)}
              onResolveEvent={onResolveEvent}
              onDismissEvent={onDismissEvent}
              onIgnoreAllEvents={onIgnoreAllEvents}
              onToggleIgnoreEvents={onToggleIgnoreEvents}
            />
          )}
          {activeSection === 'reports' && (
            <ReportsView
              game={game}
              summary={summary}
              language={lang}
              onViewLastTurnSummary={onViewLastTurnSummary}
            />
          )}
          </main>
        </div>

        {/* MOBILE BOTTOM NAVIGATION BAR (< lg) matching Screenshot 3 (#1E2129 + Gold active icons) */}
        <nav
          aria-label={t.shell.allSections}
          className={`lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#1E2129] shadow-[0_-8px_20px_rgba(10,12,18,0.55)] grid grid-cols-4 pt-2 pb-[calc(18px+env(safe-area-inset-bottom,0px))] ${
            investmentSheetOpen ? 'max-sm:hidden' : ''
          }`}
        >
        {[
          { id: 'dashboard' as NavSection, label: t.nav.dashboard, icon: Gem },
          { id: 'investments' as NavSection, label: t.nav.investments, icon: PiggyBank },
          { id: 'events' as NavSection, label: t.nav.events, icon: Flame },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setMobileDrawerOpen(false);
                onChangeSection(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center min-h-[44px] px-0.5 text-[13.5px] font-medium transition-colors ${
                active ? 'text-[#F7CA44]' : 'text-[#8A90A0] hover:text-white'
              }`}
            >
              <Icon className="h-6 w-6 shrink-0" />
              <span className="mt-0.5 whitespace-nowrap leading-tight">{tab.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className={`flex flex-col items-center justify-center min-h-[44px] px-0.5 text-[13.5px] font-medium transition-colors ${
            isDrawerSectionActive ? 'text-[#F7CA44]' : 'text-[#8A90A0] hover:text-white'
          }`}
        >
          <Rocket className="h-6 w-6 shrink-0" />
          <span className="mt-0.5 whitespace-nowrap leading-tight">{t.common.more}</span>
        </button>
        </nav>
      </div>

      {/* FULL-PAGE ALL-SECTIONS NAVIGATION SCREEN (< lg) */}
      {mobileDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.shell.allSections}
          className="lg:hidden relative z-50 flex flex-col min-h-[100dvh] w-full bg-[#F6E7D7] text-[#26201C]"
        >
          {/* Sticky Top Header */}
          <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-[#E2CEB9] bg-[#F6E7D7] sticky top-0 z-10">
            <div>
              <h3 className="font-display text-xl font-bold text-[#26201C]">
                {translatedProfessionName}
              </h3>
              <div className="font-mono text-xs sm:text-sm text-[#665B53] mt-0.5">
                {formattedPeriod} · {formatCurrency(summary.cashAsset)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#EAD7C3] hover:bg-[#DFC6AC] text-[#26201C] transition-colors"
              aria-label={t.shell.closeMenuAria}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main Full-Page Sections Grid */}
          <div className="flex-1 px-5 py-5 flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#665B53]">
                {t.shell.allSections}
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                {mobileDrawerItems.map((item, idx) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  const isFullSpanOdd =
                    idx === mobileDrawerItems.length - 1 && mobileDrawerItems.length % 2 === 1;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onChangeSection(item.id);
                        setMobileDrawerOpen(false);
                      }}
                      className={`flex min-h-[84px] items-center rounded-2xl px-4 py-4 text-base font-bold transition-colors shadow-sm ${
                        isFullSpanOdd
                          ? 'col-span-2 justify-center text-center'
                          : 'justify-between text-left'
                      } ${
                        active
                          ? 'bg-[#F7CA44] text-[#26201C]'
                          : 'bg-white/90 text-[#26201C] hover:bg-white'
                      }`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <Icon className="h-5 w-5 shrink-0 text-[#26201C]" />
                        <span className="leading-snug">{item.label}</span>
                      </span>
                      {item.badge !== undefined && (
                        <span className="font-mono text-sm font-bold text-[#DC2626] ml-2 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-[#E2CEB9] pt-4 pb-[calc(18px+env(safe-area-inset-bottom,0px))] space-y-3">
              <div className="flex items-center justify-between gap-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenSettings();
                  }}
                  className="flex-1 min-h-[58px] inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white/90 hover:bg-white text-base font-bold text-[#26201C] shadow-sm transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  {t.settings}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onReturnToMenu();
                  }}
                  className="flex-1 min-h-[58px] inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white/90 hover:bg-white text-base font-bold text-[#26201C] shadow-sm transition-colors"
                >
                  <Home className="h-5 w-5" />
                  {t.victory.mainMenuBtn}
                </button>
              </div>

              <div className="flex justify-center pt-1">
                <PWAInstallButton language={lang} />
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmNextOpen}
        title={t.shell.confirmNextTitle}
        description={confirmNextDesc}
        confirmLabel={t.nextMonth}
        cancelLabel={t.common.cancel}
        closeLabel={t.common.close}
        tone="gold"
        onConfirm={() => {
          setConfirmNextOpen(false);
          onNextMonth();
        }}
        onCancel={() => setConfirmNextOpen(false)}
      />
    </div>
  );
};
