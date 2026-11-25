import React from 'react';
import { ArrowLeft, Award, Building2, DollarSign, Landmark, LineChart, ShieldAlert } from 'lucide-react';
import { getT } from '../../data/i18n';
import { LanguageCode } from '../../types/game';

interface HowToPlayScreenProps {
  language: LanguageCode;
  onBack: () => void;
}

const SECTION_ICONS = [DollarSign, Landmark, Award, LineChart, Building2, ShieldAlert];

export const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({ language, onBack }) => {
  const t = getT(language);

  return (
    <div className="min-h-screen bg-[#191C24] text-[#26201C]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#191C24] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl bg-white/12 border border-white/20 px-3.5 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {t.common.back}
          </button>
          <h1 className="font-display text-base sm:text-xl font-bold text-white text-center min-w-0">
            {t.howToPlayPage.headerTitle}
          </h1>
          <div className="hidden sm:block w-16 shrink-0" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6 space-y-6">
        <div className="rounded-3xl bg-[#F6E7D7] p-6 sm:p-8 shadow-lg">
          <h2 className="font-display text-2xl font-bold text-[#26201C]">
            {t.howToPlayPage.heroTitle}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#5E544C] leading-relaxed max-w-3xl">
            {t.howToPlayPage.heroBodyPrefix}
            <strong className="text-[#169C5E]">{t.howToPlayPage.heroPassiveWord}</strong>
            {t.howToPlayPage.heroBodyMid}
            <strong className="text-[#DC2626]">{t.howToPlayPage.heroExpenseWord}</strong>
            {t.howToPlayPage.heroBodySuffix}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {t.howToPlayPage.sections.map((sec, idx) => {
            const Icon = SECTION_ICONS[idx % SECTION_ICONS.length];
            return (
              <div
                key={sec.title}
                className="rounded-3xl bg-[#F6E7D7] p-6 flex flex-col justify-between gap-4 shadow-md"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#26201C]">
                      <Icon className="h-5 w-5 text-[#D97706]" />
                    </div>
                    <h3 className="font-display text-base font-bold text-[#26201C]">{sec.title}</h3>
                  </div>
                  <p className="mt-3 text-sm text-[#5E544C] leading-relaxed">{sec.body}</p>
                </div>
                <div className="rounded-2xl bg-white/80 px-3.5 py-2.5 text-xs text-[#169C5E] font-mono font-medium">
                  {sec.example}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
