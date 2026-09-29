import React, { useState } from 'react';
import { ActiveScheme } from '../types';

interface RefundWithdrawalModalProps {
  scheme: ActiveScheme | null;
  onClose: () => void;
  onConfirmWithdrawal: (
    scheme: ActiveScheme,
    gross: number,
    penalty: number,
    net: number,
    bankName: string,
    accountEnding: string
  ) => void;
}

export const RefundWithdrawalModal: React.FC<RefundWithdrawalModalProps> = ({
  scheme,
  onClose,
  onConfirmWithdrawal,
}) => {
  if (!scheme) return null;

  const [acknowledgedTerms, setAcknowledgedTerms] = useState(false);
  const [selectedBank, setSelectedBank] = useState(scheme.mandateBank);
  const [isProcessing, setIsProcessing] = useState(false);

  const gross = scheme.accumulatedSavings;
  // If paid >= 6 months, 0 penalty! Otherwise 2% administrative fee
  const penalty = scheme.paidMonths >= 6 ? 0 : Math.round(gross * 0.02 * 100) / 100;
  const net = gross - penalty;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acknowledgedTerms) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmWithdrawal(
        scheme,
        gross,
        penalty,
        net,
        selectedBank,
        scheme.mandateAccLast4
      );
      onClose();
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-error text-on-error flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px]">payments</span>
            <div>
              <h3 className="text-sm font-bold leading-none">Premature Scheme Withdrawal</h3>
              <span className="text-[11px] text-error-container">Refund & Payout Settlement</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-white/80 hover:text-white">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleWithdraw} className="p-5 space-y-3.5 text-xs">
          <div className="p-3 bg-surface-container-low rounded-2xl">
            <span className="text-[11px] text-outline block">Selected Enrolled Scheme</span>
            <span className="font-bold text-sm text-on-surface block">{scheme.schemeName}</span>
            <span className="text-[10px] text-outline">Code: {scheme.schemeCode}</span>
          </div>

          {/* Breakdown Card */}
          <div className="p-4 rounded-2xl bg-surface-container-low space-y-2 border border-outline-variant/30">
            <div className="flex justify-between">
              <span className="text-outline">Gross Installments Paid ({scheme.paidMonths} mos):</span>
              <span className="font-bold text-on-surface">${gross.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">
                Premature Pre-closure Fee ({scheme.paidMonths >= 6 ? '0% after 6 mos' : '2% admin fee'}):
              </span>
              <span className={`font-bold ${penalty === 0 ? 'text-tertiary' : 'text-error'}`}>
                {penalty === 0 ? 'FREE ($0.00)' : `-$${penalty.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Forfeited Maturity Bonus:</span>
              <span className="text-outline line-through">${scheme.bonusEarned}.00</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-outline-variant/30 text-sm font-extrabold text-on-surface">
              <span>Net Refund Credited to Bank:</span>
              <span className="text-primary text-base">${net.toFixed(2)}</span>
            </div>
          </div>

          {/* Bank destination */}
          <div>
            <label className="block font-bold text-on-surface-variant mb-1">
              Select Payout Bank Account
            </label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full bg-surface-container-low py-2.5 px-3 rounded-xl text-on-surface font-semibold focus:outline-none"
            >
              <option value="Chase Premier Checking">
                Chase Premier Checking (*{scheme.mandateAccLast4})
              </option>
              <option value="Wells Fargo Preferred">Wells Fargo Preferred (*9012)</option>
            </select>
          </div>

          {/* Acknowledgment */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              required
              checked={acknowledgedTerms}
              onChange={(e) => setAcknowledgedTerms(e.target.checked)}
              className="w-4 h-4 rounded text-error accent-error mt-0.5 shrink-0"
            />
            <span className="text-[11px] text-on-surface-variant leading-snug">
              I understand that closing this scheme will forfeit the 11th free month bonus and cancel the linked auto-debit mandate. The refund will be credited in 24 hours.
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing || !acknowledgedTerms}
              className="w-full py-3 rounded-full bg-error text-on-error font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Initiating ACH Refund Payout...</span>
                </>
              ) : (
                <>
                  <span>Confirm Withdrawal & Payout (${net.toFixed(2)})</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
