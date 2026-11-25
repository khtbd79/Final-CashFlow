import React from 'react';
import { ArrowLeft, Database, ShieldCheck, TrendingUp } from 'lucide-react';
import { getT } from '../../data/i18n';
import { LanguageCode } from '../../types/game';

interface AboutScreenProps {
  language: LanguageCode;
  onBack: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ language, onBack }) => {
  const t = getT(language);

  return (
    <div className="min-h-screen bg-[#191C24] text-[#26201C]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#191C24] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl bg-white/12 border border-white/20 px-3.5 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {t.common.back}
          </button>
          <h1 className="font-display text-base sm:text-xl font-bold text-white text-center min-w-0">
            {t.aboutPage.headerTitle}
          </h1>
          <div className="hidden sm:block w-16 shrink-0" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-7 sm:px-6">
        <div className="rounded-3xl bg-[#F6E7D7] p-6 sm:p-8 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7CA44] text-[#26201C]">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-[#26201C]">
                {t.aboutPage.title}
              </h2>
            </div>
          </div>

          <p className="mt-4 text-sm text-[#5E544C] leading-relaxed">{t.aboutPage.body}</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#E2CEB9] pt-6">
            <div className="flex items-start gap-3 rounded-2xl bg-white/80 p-4">
              <Database className="h-5 w-5 text-[#169C5E] shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-[#26201C]">{t.aboutPage.localTitle}</div>
                <p className="text-xs text-[#665B53] mt-1">{t.aboutPage.localDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-white/80 p-4">
              <ShieldCheck className="h-5 w-5 text-[#D97706] shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-[#26201C]">{t.aboutPage.offlineTitle}</div>
                <p className="text-xs text-[#665B53] mt-1">{t.aboutPage.offlineDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
