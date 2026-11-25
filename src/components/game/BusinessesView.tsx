import React, { useState } from 'react';
import { Briefcase, Cog, PlusCircle } from 'lucide-react';
import { getT } from '../../data/i18n';
import { isBusinessMatchedForProfession } from '../../data/lifestyle';
import { localizeBusiness } from '../../data/localization';
import { BUSINESS_TEMPLATES } from '../../data/markets';
import { formatCurrency } from '../../engine/prng';
import { BusinessListing, FinancialSummary, GameState, LanguageCode } from '../../types/game';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface BusinessesViewProps {
  game: GameState;
  summary: FinancialSummary;
  language: LanguageCode;
  onBuyBusiness: (listing: BusinessListing) => void;
  onAutomateBusiness: (businessId: string) => void;
  onSellBusiness: (businessId: string) => void;
  onStartCustomBusiness: (templateIndex: number, customName: string) => void;
}

export const BusinessesView: React.FC<BusinessesViewProps> = ({
  game,
  summary,
  language,
  onBuyBusiness,
  onAutomateBusiness,
  onSellBusiness,
  onStartCustomBusiness,
}) => {
  const t = getT(language);
  const [filterMode, setFilterMode] = useState<'all' | 'existing' | 'startup'>('all');
  const [sellTargetId, setSellTargetId] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customTemplateIdx, setCustomTemplateIdx] = useState(5);
  const [customName, setCustomName] = useState('');

  const startupTemplates = BUSINESS_TEMPLATES.map((tpl, i) => ({ ...tpl, idx: i })).filter(
    (tpl) => tpl.mode === 'startup'
  );

  const listings = game.market.availableBusinesses.filter(
    (b) => filterMode === 'all' || b.mode === filterMode
  );
  const sellTarget = game.businesses.find((b) => b.id === sellTargetId);
  const sellTargetLoc = sellTarget
    ? localizeBusiness(sellTarget.name, sellTarget.category, undefined, language)
    : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-white text-center">
          {t.businesses.title}
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <div className="rounded-2xl bg-[#F6E7D7] px-4 py-2 text-center text-[#26201C] shadow">
            <div className="text-xs font-medium text-[#665B53]">
              {t.businesses.cashAvailable}
            </div>
            <div className="font-mono text-base font-bold text-[#169C5E] tabular-nums">
              {formatCurrency(summary.cashAsset)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCustomOpen((v) => !v)}
            className="min-h-[46px] inline-flex items-center gap-2 rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] px-4 py-2 text-xs sm:text-sm font-bold text-[#26201C] transition-colors whitespace-nowrap"
          >
            <PlusCircle className="h-4 w-4" />
            {t.businesses.launchVenture}
          </button>
        </div>
      </div>

      {customOpen && (
        <section className="rounded-3xl bg-[#F6E7D7] p-5 text-[#26201C] space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold">{t.businesses.startVentureTitle}</h3>
            <button
              type="button"
              onClick={() => setCustomOpen(false)}
              className="text-xs font-semibold text-[#665B53] hover:text-[#26201C]"
            >
              {t.common.close}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#665B53] mb-1.5">
                {t.businesses.businessModel}
              </label>
              <select
                value={customTemplateIdx}
                onChange={(e) => setCustomTemplateIdx(Number(e.target.value))}
                className="w-full min-h-[44px] rounded-xl border border-[#DFC9B4] bg-white px-3 text-sm font-semibold text-[#26201C] focus:outline-none"
              >
                {startupTemplates.map((tpl) => {
                  const locTpl = localizeBusiness(tpl.name, tpl.category, tpl.description, language);
                  return (
                    <option key={tpl.idx} value={tpl.idx}>
                      {locTpl.name} ({formatCurrency(tpl.purchasePrice)})
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#665B53] mb-1.5">
                {t.businesses.companyName}
              </label>
              <input
                type="text"
                placeholder={t.businesses.companyPlaceholder}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-[#DFC9B4] bg-white px-3 text-sm text-[#26201C] focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              {(() => {
                const customLaunchCost = BUSINESS_TEMPLATES[customTemplateIdx]?.purchasePrice ?? 0;
                const canLaunchCustom = summary.cashAsset >= customLaunchCost;
                return (
                  <button
                    type="button"
                    disabled={!canLaunchCustom}
                    onClick={() => {
                      onStartCustomBusiness(customTemplateIdx, customName);
                      setCustomName('');
                      setCustomOpen(false);
                    }}
                    className="w-full min-h-[44px] rounded-xl bg-[#F7CA44] hover:bg-[#EBBF36] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#F7CA44] px-4 text-sm font-bold text-[#26201C] transition-colors"
                  >
                    {t.businesses.launchBtn} ({formatCurrency(customLaunchCost)})
                  </button>
                );
              })()}
            </div>
          </div>
        </section>
      )}

      {/* Owned Businesses */}
      <section className="rounded-3xl bg-[#F6E7D7] p-5 sm:p-6 text-[#26201C] shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2CEB9] pb-4">
          <div>
            <h3 className="font-display text-lg font-bold">
              {t.businesses.ownedTitle} ({game.businesses.length})
            </h3>
            <p className="text-sm text-[#665B53] mt-0.5">
              {t.businesses.automatedRevLbl}{' '}
              <strong className="font-mono text-[#169C5E]">
                +{formatCurrency(summary.automatedBusinessIncome)}
                {t.common.perMonth}
              </strong>{' '}
              · {t.businesses.operatingExpLbl}{' '}
              <strong className="font-mono text-[#DC2626]">
                -{formatCurrency(summary.businessExpensesTotal)}
                {t.common.perMonth}
              </strong>
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#665B53]">{t.businesses.portfolioValuation}</div>
            <div className="font-mono text-lg font-bold tabular-nums">
              {formatCurrency(summary.businessesAsset)}
            </div>
          </div>
        </div>

        {game.businesses.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#665B53]">{t.businesses.emptyOwned}</div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {game.businesses.map((biz) => {
              const loc = localizeBusiness(biz.name, biz.category, undefined, language);
              const isFit = isBusinessMatchedForProfession(game.professionId, biz.category);
              const effectiveRev = isFit
                ? Math.round(biz.monthlyRevenue * 1.15)
                : biz.monthlyRevenue;
              const netProfit = effectiveRev - biz.monthlyOperatingExpenses;
              return (
                <div
                  key={biz.id}
                  className="rounded-2xl bg-white p-4 flex flex-col justify-between gap-3 shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 text-sm font-bold">
                          <span className="text-[#665B53]">{loc.category} · </span>
                          <span className={biz.isAutomated ? 'text-[#169C5E]' : 'text-[#D97706]'}>
                            {biz.isAutomated
                              ? t.businesses.automatedPassive
                              : t.businesses.ownerOperatedActive}
                          </span>
                        </div>
                        <h4 className="font-display text-lg font-bold text-[#26201C] mt-0.5">
                          {loc.name}
                        </h4>
                      </div>
                      <span
                        className={`font-mono text-base font-bold tabular-nums ${
                          netProfit >= 0 ? 'text-[#169C5E]' : 'text-[#DC2626]'
                        }`}
                      >
                        {formatCurrency(netProfit, true)}
                        {t.businesses.profitSuffix}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5 border-t border-[#F0E4D7] pt-3 text-sm font-mono tabular-nums">
                      <div>
                        <span className="text-[#665B53] block font-sans">
                          {t.businesses.valuation}
                        </span>
                        <span className="font-bold">{formatCurrency(biz.currentValue)}</span>
                      </div>
                      <div>
                        <span className="text-[#665B53] block font-sans">
                          {t.businesses.revenue}
                        </span>
                        <span className="text-[#169C5E]">+{formatCurrency(effectiveRev)}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[#665B53] block font-sans">
                          {t.businesses.expenses}
                        </span>
                        <span className="text-[#DC2626]">
                          -{formatCurrency(biz.monthlyOperatingExpenses)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#F0E4D7] pt-3">
                    {!biz.isAutomated && (
                      <button
                        type="button"
                        disabled={summary.cashAsset < (biz.automationUpgradeCost || 5000)}
                        onClick={() => onAutomateBusiness(biz.id)}
                        className="mr-auto min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-[#F7CA44] hover:bg-[#EBBF36] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#F7CA44] px-3.5 py-1.5 text-sm font-bold text-[#26201C] transition-colors"
                      >
                        <Cog className="h-4 w-4" />
                        {t.businesses.automateBtn} (
                        {formatCurrency(biz.automationUpgradeCost || 5000)})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSellTargetId(biz.id)}
                      className="min-h-[40px] rounded-xl bg-[#FEE2E2] hover:bg-[#FECACA] px-3.5 py-1.5 text-sm font-bold text-[#DC2626] transition-colors"
                    >
                      {t.businesses.sellBtn} ({formatCurrency(biz.currentValue)})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Marketplace */}
      <section className="space-y-4">
        <div className="flex flex-col items-center gap-3">
          <h3 className="font-display text-base sm:text-lg font-bold text-white text-center">
            {t.businesses.marketTitle}
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-1 rounded-2xl bg-[#F6E7D7] p-1">
            {(
              [
                { id: 'all', label: t.businesses.filterAll },
                { id: 'existing', label: t.businesses.filterExisting },
                { id: 'startup', label: t.businesses.filterStartup },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterMode(f.id)}
                className={`flex-1 sm:flex-initial min-h-[36px] rounded-xl px-3 py-1 text-xs font-bold transition-colors whitespace-nowrap ${
                  filterMode === f.id ? 'bg-[#F7CA44] text-[#26201C]' : 'text-[#665B53]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((item) => {
            const loc = localizeBusiness(item.name, item.category, item.description, language);
            const isFit = isBusinessMatchedForProfession(game.professionId, item.category);
            const effectiveRev = isFit
              ? Math.round(item.monthlyRevenue * 1.15)
              : item.monthlyRevenue;
            const netProfit = effectiveRev - item.monthlyOperatingExpenses;
            const canAffordBiz = summary.cashAsset >= item.purchasePrice;
            return (
              <div
                key={item.id}
                className={`rounded-3xl p-5 text-[#26201C] flex flex-col justify-between gap-4 shadow-lg transition-opacity ${
                  canAffordBiz ? 'bg-[#F6E7D7]' : 'bg-[#EAE0D3] opacity-55'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#D97706]">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 text-sm font-bold">
                          <span className="text-[#665B53]">
                            {item.mode === 'startup'
                              ? t.businesses.newStartup
                              : t.businesses.existingTag}{' '}
                            · {loc.category} ·{' '}
                          </span>
                          <span className={item.isAutomated ? 'text-[#169C5E]' : 'text-[#D97706]'}>
                            {item.isAutomated
                              ? t.businesses.automatedTag
                              : t.businesses.ownerOperatedTag}
                          </span>
                        </div>
                        <h4 className="font-display text-lg font-bold">{loc.name}</h4>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm text-[#665B53]">
                        {item.mode === 'startup' ? t.businesses.capital : t.businesses.price}
                      </div>
                      <div className="font-mono text-lg font-bold tabular-nums">
                        {formatCurrency(item.purchasePrice)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 rounded-2xl bg-white/80 p-3.5 text-sm font-mono tabular-nums">
                    <div>
                      <span className="text-[#665B53] block font-sans">{t.businesses.revenue}</span>
                      <span className="text-[#169C5E]">
                        +{formatCurrency(effectiveRev)}
                        {t.common.perMonth}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#665B53] block font-sans">
                        {t.businesses.operatingExp}
                      </span>
                      <span className="text-[#DC2626]">
                        -{formatCurrency(item.monthlyOperatingExpenses)}
                        {t.common.perMonth}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[#665B53] block font-sans">
                        {t.businesses.netProfit}
                      </span>
                      <span className="text-[#169C5E] font-bold">
                        +{formatCurrency(netProfit)}
                        {t.common.perMonth}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canAffordBiz}
                  onClick={() => onBuyBusiness(item)}
                  className="w-full min-h-[48px] rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#F7CA44] px-4 py-2 text-sm font-bold text-[#26201C] transition-colors"
                >
                  {item.mode === 'startup'
                    ? `${t.businesses.startBizBtn} (${formatCurrency(item.purchasePrice)})`
                    : `${t.businesses.acquireBizBtn} (${formatCurrency(item.purchasePrice)})`}
                </button>
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
            : t.businesses.sellDialogTitle
        }
        description={
          sellTarget
            ? `${t.businesses.sellDialogDesc} (${formatCurrency(sellTarget.currentValue)})`
            : ''
        }
        confirmLabel={t.businesses.sellConfirmBtn}
        cancelLabel={t.common.cancel}
        closeLabel={t.common.close}
        tone="gold"
        onConfirm={() => {
          if (sellTarget) onSellBusiness(sellTarget.id);
          setSellTargetId(null);
        }}
        onCancel={() => setSellTargetId(null)}
      />
    </div>
  );
};
