import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getT } from '../../data/i18n';
import { localizeProfession } from '../../data/localization';
import { PROFESSIONS } from '../../data/professions';
import { LanguageCode } from '../../types/game';
import { ProfessionAvatar } from '../common/ProfessionAvatar';

interface ProfessionSelectScreenProps {
  language: LanguageCode;
  onBack: () => void;
  onSelectProfession: (professionId: string) => void;
}

export const ProfessionSelectScreen: React.FC<ProfessionSelectScreenProps> = ({
  language,
  onBack,
  onSelectProfession,
}) => {
  const [index, setIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const t = getT(language);
  const prof = PROFESSIONS[index] ?? PROFESSIONS[0];
  const locProf = localizeProfession(prof.id, language);

  const goPrev = () => setIndex((i) => (i === 0 ? PROFESSIONS.length - 1 : i - 1));
  const goNext = () => setIndex((i) => (i === PROFESSIONS.length - 1 ? 0 : i + 1));

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX === null) return;
    const endX = e.changedTouches[0]?.clientX ?? startX;
    const diff = endX - startX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goPrev();
      else goNext();
    }
  };

  return (
    <div
      className="relative min-h-screen bg-[#F6E7D7] text-[#26201C] flex flex-col justify-between px-5 pt-7 pb-9 sm:px-8 sm:pt-9 sm:pb-11 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Subtle Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="absolute left-3 top-5 sm:left-6 sm:top-7 inline-flex h-10 w-10 items-center justify-center rounded-full text-[#665B53]/70 hover:text-[#26201C] hover:bg-[#EAD7C3]/70 transition-colors"
        aria-label={t.common.back}
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      {/* Top Centered Heading */}
      <header className="pt-1 pb-2">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#413A35] text-center tracking-tight">
          {t.chooseProfession}
        </h1>
      </header>

      {/* Center One-by-One Profession Spotlight */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto py-4">
        <div className="relative w-full flex flex-col items-center">
          {/* Portrait with soft bottom fade into #F6E7D7 */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-end justify-center overflow-hidden">
            <ProfessionAvatar professionId={prof.id} className="w-full h-full" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#F6E7D7] via-[#F6E7D7]/80 to-transparent" />
          </div>

          {/* Left/Right Triangle Arrows + Profession Title overlaid on lower faded edge */}
          <div className="-mt-11 relative z-10 w-full flex items-center justify-between px-1 sm:px-3">
            <button
              type="button"
              onClick={goPrev}
              className="min-h-[52px] min-w-[52px] flex items-center justify-center rounded-2xl text-[#5F6CAF] hover:text-[#4C5899] active:scale-95 transition-all"
              aria-label={t.profSelect.prevAria}
            >
              <svg viewBox="0 0 28 32" className="w-7 h-8 fill-current" aria-hidden="true">
                <path d="M23.5 3.1C25.5 1.9 28 3.3 28 5.6V26.4C28 28.7 25.5 30.1 23.5 28.9L5.5 18.5C3.5 17.3 3.5 14.7 5.5 13.5L23.5 3.1Z" />
              </svg>
            </button>

            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#413A35] text-center px-2 leading-tight">
              {locProf.name}
            </h2>

            <button
              type="button"
              onClick={goNext}
              className="min-h-[52px] min-w-[52px] flex items-center justify-center rounded-2xl text-[#5F6CAF] hover:text-[#4C5899] active:scale-95 transition-all"
              aria-label={t.profSelect.nextAria}
            >
              <svg viewBox="0 0 28 32" className="w-7 h-8 fill-current" aria-hidden="true">
                <path d="M4.5 3.1C2.5 1.9 0 3.3 0 5.6V26.4C0 28.7 2.5 30.1 4.5 28.9L22.5 18.5C24.5 17.3 24.5 14.7 22.5 13.5L4.5 3.1Z" />
              </svg>
            </button>
          </div>
        </div>

        <p className="mt-4 max-w-xs sm:max-w-sm text-center text-base sm:text-lg text-[#7A6F67] leading-relaxed">
          {locProf.desc}
        </p>
      </main>

      {/* Bottom Golden-Yellow CTA */}
      <footer className="w-full max-w-sm mx-auto pt-2">
        <button
          type="button"
          onClick={() => onSelectProfession(prof.id)}
          className="w-full min-h-[56px] rounded-2xl bg-[#F7CA44] hover:bg-[#EBBF36] active:scale-[0.99] px-6 py-3.5 text-lg sm:text-xl font-bold text-[#3D352E] shadow-sm transition-all"
        >
          {t.playBtn}
        </button>
      </footer>
    </div>
  );
};

