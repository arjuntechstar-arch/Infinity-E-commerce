import React, { useState } from 'react';

interface KycModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const KycModal: React.FC<KycModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [idType, setIdType] = useState('Driver License');
  const [idNumber, setIdNumber] = useState('DL-9081247-NY');
  const [dob, setDob] = useState('1994-06-18');
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifiedDone, setVerifiedDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setVerifiedDone(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
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
        <div className="p-4 bg-primary text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
            <div>
              <h3 className="text-sm font-bold leading-none">Scheme KYC Verification</h3>
              <span className="text-[11px] text-on-primary-container">Instant Digital Verification</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-white/80 hover:text-white">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {verifiedDone ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary mb-3 animate-bounce">
              <span className="material-symbols-outlined text-3xl">check</span>
            </div>
            <h4 className="text-base font-bold text-on-surface">KYC Verification Approved!</h4>
            <p className="text-xs text-on-surface-variant mt-1">
              Your profile has been verified for 0% EMI schemes and zero-downpayment purchases.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-on-surface-variant mb-1">Select Identity Document</label>
              <div className="grid grid-cols-3 gap-2">
                {['Driver License', 'Passport', 'National ID'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setIdType(t)}
                    className={`py-2 px-1 rounded-xl text-center border font-semibold transition-all ${
                      idType === t
                        ? 'border-primary bg-primary-fixed/40 text-primary font-bold'
                        : 'border-outline-variant/30 text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-on-surface-variant mb-1">Document / ID Number</label>
              <input
                type="text"
                required
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Enter Document ID"
                className="w-full bg-surface-container-low py-2.5 px-3 rounded-xl text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface-variant mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-surface-container-low py-2.5 px-3 rounded-xl text-on-surface font-semibold focus:outline-none"
              />
            </div>

            {/* Document Upload Area Simulation */}
            <div>
              <label className="block font-bold text-on-surface-variant mb-1">Upload ID Document (Front Photo)</label>
              <div className="border-2 border-dashed border-outline-variant/60 rounded-2xl p-3 flex flex-col items-center justify-center bg-surface-container-low/50 text-center">
                <span className="material-symbols-outlined text-2xl text-primary mb-1">document_scanner</span>
                <span className="font-semibold text-on-surface">driver_license_front.jpg</span>
                <span className="text-[10px] text-tertiary font-bold mt-0.5">Scanned & AI OCR Verified ✓</span>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="pt-1 flex items-start gap-2">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 rounded text-primary accent-primary mt-0.5 shrink-0"
              />
              <span className="text-[11px] text-on-surface-variant leading-snug">
                I hereby consent to VoltMart authenticating my identity and accessing credit assessment for scheme eligibility.
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Validating with Credit Bureau...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Verify KYC</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
