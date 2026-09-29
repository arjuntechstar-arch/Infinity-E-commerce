import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ActiveScheme } from '../types';

interface SchemeSuccessModalProps {
  scheme: ActiveScheme | null;
  onClose: () => void;
  onGoToLedger: () => void;
}

export const SchemeSuccessModal: React.FC<SchemeSuccessModalProps> = ({
  scheme,
  onClose,
  onGoToLedger,
}) => {
  useEffect(() => {
    if (scheme) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Confetti fallback
      }
    }
  }, [scheme]);

  if (!scheme) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Certificate Card Header */}
        <div className="p-6 bg-gradient-to-br from-primary via-primary-container to-surface-tint text-on-primary text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-surface-container-lowest/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-4xl text-tertiary-fixed">celebration</span>
          </div>

          <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-extrabold uppercase tracking-wider inline-block mb-2">
            Scheme Activated Successfully!
          </span>

          <h3 className="text-xl font-extrabold text-white">{scheme.schemeName}</h3>
          <p className="text-xs text-on-primary-container mt-1">
            Certificate & Mandate Ref: <strong className="text-white">{scheme.schemeCode}</strong>
          </p>
        </div>

        {/* Certificate Details */}
        <div className="p-5 space-y-3.5 text-xs">
          <div className="bg-surface-container-low p-4 rounded-2xl space-y-2 border border-outline-variant/20">
            <div className="flex justify-between">
              <span className="text-outline">Monthly Deposit:</span>
              <span className="font-bold text-on-surface">${scheme.monthlyDeposit}.00 / month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Tenure Duration:</span>
              <span className="font-bold text-on-surface">10 Months + 1 Month FREE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Guaranteed Free Bonus:</span>
              <span className="font-extrabold text-tertiary">+${scheme.monthlyDeposit}.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Total Maturity Shopping Credit:</span>
              <span className="font-extrabold text-primary text-sm">${scheme.monthlyDeposit * 11}.00</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-outline-variant/20">
              <span className="text-outline">Linked Bank Mandate:</span>
              <span className="font-semibold text-on-surface">
                {scheme.mandateBank} (*{scheme.mandateAccLast4})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low text-on-surface text-[11px]">
            <span className="material-symbols-outlined text-tertiary text-lg shrink-0">verified</span>
            <span>First automated deduction scheduled for {scheme.nextDebitDate}. You can withdraw or cancel anytime.</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={onClose}
              className="py-3 rounded-full bg-surface-container-high text-primary font-bold text-xs hover:bg-surface-container-highest transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={onGoToLedger}
              className="py-3 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md active:scale-95 transition-transform"
            >
              View in Ledger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
