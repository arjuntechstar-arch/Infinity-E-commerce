import React, { useState } from 'react';

interface ChangePhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPhone: string) => void;
}

export const ChangePhoneModal: React.FC<ChangePhoneModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('otp');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onSuccess(phone);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col p-5 animate-in zoom-in-95 duration-200 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-on-surface">Update Phone Number</h3>
          <button onClick={onClose} className="p-1 rounded-full text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {step === 'input' ? (
          <form onSubmit={handleSendOtp} className="space-y-3">
            <p className="text-on-surface-variant leading-relaxed">
              Enter your new mobile number. We will send an SMS with a 4-digit code to update your 0% EMI mandate alerts.
            </p>
            <div>
              <label className="block font-bold text-on-surface-variant mb-1">New Mobile Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-surface-container-low py-2.5 px-3 rounded-xl text-on-surface font-semibold focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md active:scale-95 transition-transform"
            >
              Send OTP Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-3.5">
            <p className="text-on-surface-variant leading-relaxed">
              Enter the 4-digit verification code sent to <strong>{phone}</strong>.
            </p>
            <div className="flex justify-center gap-2 my-2">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  required
                  value={otp[idx] || ''}
                  onChange={(e) => {
                    const next = [...otp];
                    next[idx] = e.target.value;
                    setOtp(next);
                  }}
                  className="w-12 h-12 text-center text-lg font-bold bg-surface-container-low rounded-xl border border-outline-variant/40 focus:border-primary focus:outline-none"
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md active:scale-95 transition-transform"
            >
              {isVerifying ? 'Verifying Code...' : 'Confirm & Update'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
