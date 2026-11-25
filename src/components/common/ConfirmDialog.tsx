import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  closeLabel?: string;
  tone?: 'danger' | 'primary' | 'gold';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  closeLabel,
  tone = 'gold',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const confirmClasses =
    tone === 'danger'
      ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white'
      : 'bg-[#F7CA44] hover:bg-[#EBBF36] text-[#26201C]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-3xl bg-[#F6E7D7] p-6 text-[#26201C] shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {tone === 'danger' && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-[#DC2626]">
                <AlertTriangle className="h-5 w-5" />
              </div>
            )}
            <h3 className="font-display text-lg font-bold text-[#26201C]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#665B53] hover:bg-[#EAD7C3] hover:text-[#26201C]"
            aria-label={closeLabel ?? cancelLabel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-[#5E544C] leading-relaxed">{description}</p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-2xl bg-[#EAD7C3] hover:bg-[#E0CBB4] px-4 py-2 text-sm font-semibold text-[#26201C] transition-colors whitespace-nowrap shrink-0"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-[44px] rounded-2xl px-5 py-2 text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
