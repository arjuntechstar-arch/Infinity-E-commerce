import React from 'react';
import { ActiveScheme, RefundRecord } from '../types';

interface PaymentsViewProps {
  activeSchemes: ActiveScheme[];
  refunds: RefundRecord[];
  onOpenWithdrawal: (scheme: ActiveScheme) => void;
  onOpenMandateSetup: () => void;
  onViewReceipt: (activeScheme?: ActiveScheme, refund?: RefundRecord) => void;
  onOpenSchemes: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  activeSchemes,
  refunds,
  onOpenWithdrawal,
  onOpenMandateSetup,
  onViewReceipt,
  onOpenSchemes,
}) => {
  const totalSavings = activeSchemes.reduce((sum, s) => sum + s.accumulatedSavings, 0);
  const totalBonus = activeSchemes.reduce((sum, s) => sum + s.bonusEarned, 0);

  return (
    <div className="flex flex-col w-full pb-24 px-4 pt-1">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-extrabold text-on-surface">Payments & Scheme Ledger</h2>
          <p className="text-xs text-on-surface-variant">Manage automated bank debits, refunds & bonuses</p>
        </div>
      </div>

      {/* Account Balance & Scheme Vault Hero Card */}
      <div className="rounded-3xl bg-gradient-to-tr from-primary to-primary-container p-5 text-on-primary shadow-xl mb-4 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none"></div>

        <div className="flex items-center justify-between text-xs text-on-primary-container mb-1">
          <span className="font-semibold uppercase tracking-wider">Total Scheme Deposit Vault</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-extrabold">
            <span className="material-symbols-outlined text-[13px]">lock</span>
            FDIC Insured
          </span>
        </div>

        <div className="text-3xl font-extrabold text-white tracking-tight">
          ${totalSavings.toFixed(2)}
        </div>

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/15 text-xs">
          <div>
            <span className="text-on-primary-container text-[11px] block">Maturity Bonus Earned</span>
            <span className="text-tertiary-fixed font-bold text-sm">+${totalBonus.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-on-primary-container text-[11px] block">Active Mandates</span>
            <span className="text-white font-bold text-sm">2 Bank Accounts</span>
          </div>
        </div>

        {/* Quick Action Buttons inside Card */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-2">
          <button
            onClick={onOpenMandateSetup}
            className="py-2.5 px-3 rounded-full bg-surface-container-lowest text-primary text-xs font-bold shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">account_balance</span>
            <span>Setup Autopay</span>
          </button>

          <button
            onClick={onOpenSchemes}
            className="py-2.5 px-3 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>New Scheme</span>
          </button>
        </div>
      </div>

      {/* Active Enrolled Schemes & Withdrawal Shortcuts */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-on-surface">Active Schemes in Vault</h3>
          <span className="text-xs text-outline">{activeSchemes.length} Active</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {activeSchemes.map((sch) => (
            <div
              key={sch.id}
              className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed/60 flex items-center justify-center text-primary font-bold">
                  <span className="material-symbols-outlined text-[22px]">savings</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">{sch.schemeName}</h4>
                  <p className="text-[11px] text-outline">
                    ${sch.monthlyDeposit}/mo • {sch.paidMonths}/{sch.totalMonths} Paid (${sch.accumulatedSavings})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onViewReceipt(sch)}
                  className="p-1.5 rounded-lg bg-surface-container-low text-primary hover:bg-surface-container transition-colors"
                  title="View Certificate"
                >
                  <span className="material-symbols-outlined text-[18px]">description</span>
                </button>
                <button
                  onClick={() => onOpenWithdrawal(sch)}
                  className="px-2.5 py-1.5 rounded-lg bg-error-container text-on-error-container text-[11px] font-bold active:scale-95 transition-transform"
                >
                  Withdraw
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Linked Bank Mandates */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-on-surface">Linked e-Mandates</h3>
          <button
            onClick={onOpenMandateSetup}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            <span>Add Bank</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface block">Chase Premier Checking</span>
                <span className="text-[11px] text-outline">**** 4821 • Recurring Limit $500/mo</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-extrabold">
              Active
            </span>
          </div>

          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface block">Wells Fargo Preferred</span>
                <span className="text-[11px] text-outline">**** 9012 • Recurring Limit $300/mo</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-extrabold">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Refunds & Settlement History */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-on-surface">Refund Settlements & Credits</h3>
          <span className="text-xs text-outline">{refunds.length} Settled</span>
        </div>

        {refunds.map((ref) => (
          <div
            key={ref.id}
            className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-on-surface block">{ref.schemeName}</span>
                <span className="text-[11px] text-outline">Ref: {ref.referenceNo}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-extrabold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                {ref.status}
              </span>
            </div>

            <div className="flex justify-between items-center bg-surface-container-low p-2 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-on-surface-variant block">Net Credited Payout</span>
                <span className="font-extrabold text-tertiary text-sm">${ref.netPayout.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-on-surface-variant block">To Account</span>
                <span className="font-bold text-on-surface">*{ref.accountEnding}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[11px] text-outline">UTR: {ref.utrNumber}</span>
              <button
                onClick={() => onViewReceipt(undefined, ref)}
                className="text-primary font-bold hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">receipt</span>
                <span>Settlement PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
