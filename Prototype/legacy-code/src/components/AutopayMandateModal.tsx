import React, { useState } from 'react';

interface AutopayMandateModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyDeposit?: number;
  schemeTitle?: string;
  onSuccess: (bankName: string, accountLast4: string) => void;
}

export const AutopayMandateModal: React.FC<AutopayMandateModalProps> = ({
  isOpen,
  onClose,
  monthlyDeposit = 100,
  schemeTitle = 'VoltFlex Scheme',
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [bank, setBank] = useState('Chase Premier Checking');
  const [accountNumber, setAccountNumber] = useState('981249821');
  const [routingNumber, setRoutingNumber] = useState('021000021');
  const [debitDay, setDebitDay] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const last4 = accountNumber.slice(-4) || '4821';
      onSuccess(bank, last4);
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
        <div className="p-4 bg-primary text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px]">account_balance</span>
            <div>
              <h3 className="text-sm font-bold leading-none">Setup Autopay Mandate</h3>
              <span className="text-[11px] text-on-primary-container">{schemeTitle}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-white/80 hover:text-white">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="p-3 bg-surface-container-low rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-outline block">Recurring Monthly Debit</span>
              <span className="text-base font-extrabold text-primary">${monthlyDeposit}.00 / month</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">
              0% Fee
            </span>
          </div>

          <div>
            <label className="block font-bold text-on-surface-variant mb-1">Select Bank</label>
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="w-full bg-surface-container-low py-2.5 px-3 rounded-xl text-on-surface font-semibold focus:outline-none"
            >
              <option value="Chase Premier Checking">JPMorgan Chase Bank</option>
              <option value="Bank of America Advantage">Bank of America</option>
              <option value="Wells Fargo Preferred">Wells Fargo</option>
              <option value="Citibank Priority Checking">Citibank N.A.</option>
              <option value="Capital One 360">Capital One</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-on-surface-variant mb-1">Account Number</label>
            <input
              type="password"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-surface-container-low py-2.5 px-3 rounded-xl text-on-surface font-semibold focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-on-surface-variant mb-1">Routing Number</label>
              <input
                type="text"
                required
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value)}
                className="w-full bg-surface-container-low py-2.5 px-3 rounded-xl text-on-surface font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-on-surface-variant mb-1">Monthly Debit Day</label>
              <select
                value={debitDay}
                onChange={(e) => setDebitDay(Number(e.target.value))}
                className="w-full bg-surface-container-low py-2.5 px-3 rounded-xl text-on-surface font-semibold focus:outline-none"
              >
                <option value={5}>5th of every month</option>
                <option value={10}>10th of every month</option>
                <option value={15}>15th of every month</option>
                <option value={20}>20th of every month</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-2xl text-[11px] text-on-surface-variant leading-relaxed">
            By clicking Authorize Mandate, you instruct VoltMart and your bank to debit ${monthlyDeposit} automatically on the {debitDay}th of each month. Cancel or pause anytime in app settings.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Connecting to Bank Gateway...</span>
              </>
            ) : (
              <>
                <span>Authorize & Sign Mandate</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
