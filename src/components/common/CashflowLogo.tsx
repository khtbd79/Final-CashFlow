import React from 'react';
import { getT } from '../../data/i18n';
import { LanguageCode } from '../../types/game';

/**
 * Stylized handwritten/display wordmark matching the user's Main Menu reference.
 * Switches cleanly between "Cashflow" and "ক্যাশফ্লো" depending on selected language.
 */
export const CashflowLogo: React.FC<{
  className?: string;
  language?: LanguageCode;
}> = ({ className = 'w-64 h-20', language = 'en' }) => {
  const t = getT(language);
  const isBangla = language === 'bn';

  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 360 110"
        className="w-full h-full drop-shadow-[0_6px_18px_rgba(0,0,0,0.65)]"
        aria-label={t.logoText}
      >
        <text
          x="180"
          y={isBangla ? '72' : '74'}
          textAnchor="middle"
          fill="#FFFFFF"
          style={
            isBangla
              ? {
                  fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif",
                  fontWeight: 800,
                  fontSize: '58px',
                  letterSpacing: '0px',
                }
              : {
                  fontFamily: "'Brush Script MT', 'Segoe Script', 'Snell Roundhand', Georgia, serif",
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: '72px',
                  letterSpacing: '-1px',
                }
          }
        >
          {t.logoText}
        </text>
      </svg>
    </div>
  );
};
