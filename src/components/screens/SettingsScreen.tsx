import React, { useState } from 'react';
import { ArrowLeft, Download, Globe, Smartphone, Volume2, VolumeX } from 'lucide-react';
import { getT } from '../../data/i18n';
import {
  exportOfflineBatLauncher,
  exportWebIntoAppZip,
} from '../../storage/db';
import { GameSettings, LanguageCode } from '../../types/game';

interface SettingsScreenProps {
  settings: GameSettings;
  onUpdateSettings: (next: GameSettings) => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onBack,
}) => {
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);
  const [batDownloading, setBatDownloading] = useState(false);
  const [zipDownloading, setZipDownloading] = useState(false);
  const t = getT(settings.language);

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
            {t.settingsPage.headerTitle}
          </h1>
          <div className="hidden sm:block w-16 shrink-0" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-7 sm:px-6 space-y-6">
        {statusMsg && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
              statusMsg.type === 'ok'
                ? 'bg-[#DCFCE7] text-[#14532D]'
                : 'bg-[#FEE2E2] text-[#7F1D1D]'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        {/* Preferences Card */}
        <section className="rounded-3xl bg-[#F6E7D7] divide-y divide-[#E4D1BD] shadow-lg overflow-hidden">
          <div className="p-5 sm:px-6">
            <h2 className="font-display text-lg font-bold text-[#26201C]">
              {t.settingsPage.prefsTitle}
            </h2>
          </div>

          <div className="flex items-center justify-between gap-4 p-5 sm:px-6">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="h-5 w-5 text-[#169C5E]" />
              ) : (
                <VolumeX className="h-5 w-5 text-[#8A7E74]" />
              )}
              <div className="text-sm font-semibold text-[#26201C]">
                {t.settingsPage.soundTitle}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })
              }
              className={`min-h-[40px] min-w-[76px] rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                settings.soundEnabled
                  ? 'bg-[#F7CA44] text-[#26201C]'
                  : 'bg-[#E5D3BF] text-[#5E544C]'
              }`}
            >
              {settings.soundEnabled ? t.common.on : t.common.off}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 p-5 sm:px-6">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-[#686CA8]" />
              <div className="text-sm font-semibold text-[#26201C]">
                {t.settingsPage.langTitle}
              </div>
            </div>
            <select
              value={settings.language === 'bn' ? 'bn' : 'en'}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  language: e.target.value as LanguageCode,
                })
              }
              className="min-h-[42px] rounded-xl border border-[#DFC9B4] bg-white px-3 py-2 text-sm font-semibold text-[#26201C] focus:outline-none"
            >
              <option value="bn">{t.common.langBanglaLabel}</option>
              <option value="en">{t.common.langEnglishLabel}</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4 p-5 sm:px-6">
            <div className="text-sm font-semibold text-[#26201C]">
              {t.settingsPage.confirmNextTitle}
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  confirmNextMonth: !settings.confirmNextMonth,
                })
              }
              className={`min-h-[40px] min-w-[76px] rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                settings.confirmNextMonth
                  ? 'bg-[#F7CA44] text-[#26201C]'
                  : 'bg-[#E5D3BF] text-[#5E544C]'
              }`}
            >
              {settings.confirmNextMonth ? t.common.on : t.common.off}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 p-5 sm:px-6">
            <div>
              <div className="text-sm font-semibold text-[#26201C]">
                {t.settingsPage.ignoreEventsTitle}
              </div>
              <div className="text-xs text-[#665B53] mt-0.5">
                {t.settingsPage.ignoreEventsDesc}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  ignoreEvents: !settings.ignoreEvents,
                })
              }
              className={`min-h-[40px] min-w-[76px] shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                settings.ignoreEvents
                  ? 'bg-[#F7CA44] text-[#26201C]'
                  : 'bg-[#E5D3BF] text-[#5E544C]'
              }`}
            >
              {settings.ignoreEvents ? t.common.on : t.common.off}
            </button>
          </div>
        </section>

        {/* Save Data Management */}
        <section className="rounded-3xl bg-[#F6E7D7] p-5 sm:p-6 space-y-4 shadow-lg">
          <h2 className="font-display text-lg font-bold text-[#26201C]">
            {t.settingsPage.saveTitle}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={batDownloading}
              onClick={async () => {
                if (batDownloading) return;
                setBatDownloading(true);
                try {
                  await exportOfflineBatLauncher();
                  setStatusMsg({ text: t.settingsPage.offlineBatOk, type: 'ok' });
                } catch {
                  setStatusMsg({ text: t.settingsPage.importErrRead, type: 'err' });
                } finally {
                  setBatDownloading(false);
                }
              }}
              className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors ${
                batDownloading
                  ? 'cursor-wait bg-white/60 text-[#665B53]'
                  : 'bg-white hover:bg-white/80 text-[#26201C]'
              }`}
            >
              <Download className="h-4 w-4 shrink-0 text-[#169C5E]" />
              {t.settingsPage.offlineBatBtn}
            </button>

            <button
              type="button"
              disabled={zipDownloading}
              onClick={async () => {
                if (zipDownloading) return;
                setZipDownloading(true);
                try {
                  await exportWebIntoAppZip();
                  setStatusMsg({ text: t.settingsPage.webIntoAppZipOk, type: 'ok' });
                } catch {
                  setStatusMsg({ text: t.settingsPage.importErrRead, type: 'err' });
                } finally {
                  setZipDownloading(false);
                }
              }}
              className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors ${
                zipDownloading
                  ? 'cursor-wait bg-white/60 text-[#665B53]'
                  : 'bg-white hover:bg-white/80 text-[#26201C]'
              }`}
            >
              <Smartphone className="h-4 w-4 shrink-0 text-[#686CA8]" />
              {t.settingsPage.webIntoAppZipBtn}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
