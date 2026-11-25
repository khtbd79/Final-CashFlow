import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { getT } from '../../data/i18n';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { LanguageCode } from '../../types/game';

export const PWAInstallButton: React.FC<{
  variant?: 'compact' | 'full';
  language?: LanguageCode;
}> = ({ variant = 'compact', language = 'en' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const t = getT(language);

  if (
    isInstalled ||
    (typeof window !== 'undefined' && window.location.protocol === 'file:') ||
    (typeof document !== 'undefined' && !document.querySelector('link[rel="manifest"]'))
  ) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={
          variant === 'full'
            ? 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#F7CA44] hover:bg-[#EBBF36] px-4 py-2.5 text-sm font-bold text-[#26201C] transition-colors whitespace-nowrap shrink-0 min-h-[44px]'
            : 'inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/12 backdrop-blur-md border border-white/25 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 transition-colors whitespace-nowrap shrink-0 min-h-[40px]'
        }
      >
        <Download className="w-4 h-4 text-[#F7CA44]" />
        {t.pwa.installOffline}
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/12 backdrop-blur-md border border-white/25 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
        >
          <Download className="w-4 h-4 text-[#F7CA44]" />
          {t.pwa.installIos}
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#F6E7D7] p-6 text-[#26201C] shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{t.pwa.iosTitle}</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#665B53] hover:bg-[#EAD7C3]"
                  aria-label={t.common.close}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-3 text-sm text-[#5E544C] leading-relaxed">
                {t.pwa.iosStep1Prefix}
                <strong className="text-[#26201C]">{t.pwa.iosShareWord}</strong>
                {t.pwa.iosStep1Suffix}
                <br />
                {t.pwa.iosStep2Prefix}
                <strong className="text-[#26201C]">{t.pwa.iosAddWord}</strong>
                {t.pwa.iosStep2Suffix}
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full min-h-[44px] rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] py-2.5 text-sm font-bold text-[#26201C] transition-colors"
              >
                {t.pwa.gotIt}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
