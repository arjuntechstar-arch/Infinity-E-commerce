import React from 'react';
import { ActiveScheme, RefundRecord } from '../types';

interface ReceiptViewerModalProps {
  scheme?: ActiveScheme;
  refund?: RefundRecord;
  onClose: () => void;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  scheme,
  refund,
  onClose,
}) => {
  if (!scheme && !refund) return null;

  const isRefund = !!refund;
  const title = isRefund ? 'Settlement & Refund Payout Receipt' : 'Scheme Enrollment & Deposit Receipt';
  const refNumber = isRefund ? refund?.referenceNo : scheme?.schemeCode;
  const date = isRefund ? refund?.initiatedAt : scheme?.startDate;
  const amount = isRefund ? refund?.netPayout : scheme?.accumulatedSavings;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Action Bar */}
        <div className="p-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">picture_as_pdf</span>
            <span className="text-xs font-bold text-on-surface truncate">
              {refNumber}.pdf
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => alert(`Downloading ${refNumber}.pdf...`)}
              className="px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* PDF Simulated Sheet */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 text-slate-800 font-sans text-xs space-y-4 no-scrollbar">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative">
            {/* Watermark stamp */}
            <div className="absolute right-6 top-6 w-20 h-20 rounded-full border-4 border-emerald-600/30 text-emerald-700/40 flex flex-col items-center justify-center -rotate-12 pointer-events-none select-none">
              <span className="text-[10px] font-black tracking-widest uppercase">VOLTMART</span>
              <span className="text-[8px] font-bold">VERIFIED</span>
            </div>

            {/* Document Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <span className="text-lg font-black text-slate-900 tracking-tight">VoltMart</span>
                </div>
                <p className="text-[10px] text-slate-500">Retail & Scheme Services Hub</p>
                <p className="text-[10px] text-slate-500">428 Lexington Ave, New York, NY</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold uppercase text-slate-400 block tracking-wider">
                  Official Voucher
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 block mt-0.5">{refNumber}</span>
                <span className="text-[10px] text-slate-500 block">{date}</span>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center py-2">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">{title}</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Customer Copy • Authorized Transaction</p>
            </div>

            {/* Customer Details */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 my-3 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Beneficiary Name</span>
                <span className="font-bold text-slate-800">Alexander Rivera</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Customer Phone</span>
                <span className="font-semibold text-slate-800">+1 (555) 019-2834</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Payment Account</span>
                <span className="font-semibold text-slate-800">
                  {isRefund ? `${refund?.bankName} (*${refund?.accountEnding})` : `${scheme?.mandateBank} (*${scheme?.mandateAccLast4})`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Settlement Channel</span>
                <span className="font-semibold text-slate-800">Direct ACH / e-Mandate</span>
              </div>
            </div>

            {/* Itemized Table */}
            <table className="w-full text-[11px] my-4">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[9px] tracking-wider text-left">
                  <th className="pb-2">Description</th>
                  <th className="pb-2 text-center">Tenure / Code</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isRefund ? (
                  <>
                    <tr>
                      <td className="py-2 font-medium text-slate-800">{refund?.schemeName} Accumulated Deposits</td>
                      <td className="py-2 text-center text-slate-500 font-mono text-[10px]">{refund?.schemeCode}</td>
                      <td className="py-2 text-right font-bold text-slate-800">${refund?.grossDeposit.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-slate-800">Pre-closure Administrative Fee</td>
                      <td className="py-2 text-center text-slate-500 text-[10px]">Standard ACH</td>
                      <td className="py-2 text-right text-rose-600 font-semibold">-${refund?.penaltyFee.toFixed(2)}</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td className="py-2 font-medium text-slate-800">{scheme?.schemeName} Installments</td>
                      <td className="py-2 text-center text-slate-500 text-[10px]">
                        {scheme?.paidMonths} of {scheme?.totalMonths} Months
                      </td>
                      <td className="py-2 text-right font-bold text-slate-800">${scheme?.accumulatedSavings.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-emerald-700">VoltMart 11th Month Maturity Bonus</td>
                      <td className="py-2 text-center text-emerald-700 text-[10px]">Guaranteed Free</td>
                      <td className="py-2 text-right font-bold text-emerald-700">+${scheme?.bonusEarned.toFixed(2)}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>

            {/* Total Block */}
            <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-center text-xs">
              <span className="font-extrabold uppercase text-slate-900 tracking-wider">
                {isRefund ? 'Net Credited Amount' : 'Total Value on Maturity'}
              </span>
              <span className="text-base font-black text-blue-700">
                ${(isRefund ? refund?.netPayout : (scheme ? scheme.accumulatedSavings + scheme.bonusEarned : 0))?.toFixed(2)}
              </span>
            </div>

            {/* Barcode representation */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="h-6 flex items-center gap-0.5">
                  {[4, 2, 6, 2, 4, 1, 5, 2, 3, 2, 4, 1, 6, 3, 2, 5, 1, 3].map((w, i) => (
                    <div
                      key={i}
                      className="bg-slate-800 h-full"
                      style={{ width: `${w * 2}px` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[9px] text-slate-400">AUTH-SEC-{refNumber}</span>
              </div>

              <div className="text-right">
                <span className="text-[9px] text-slate-400 block">VoltMart Fiscal Ledger</span>
                <span className="text-[10px] font-bold text-emerald-600 block">Digitally Signed & Sealed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
