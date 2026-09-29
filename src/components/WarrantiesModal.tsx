import React from 'react';
import { WarrantyItem } from '../types';

interface WarrantiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  warranties: WarrantyItem[];
  onFileClaim: (warranty: WarrantyItem) => void;
}

export const WarrantiesModal: React.FC<WarrantiesModalProps> = ({
  isOpen,
  onClose,
  warranties,
  onFileClaim,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-tertiary text-on-tertiary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px]">verified</span>
            <div>
              <h3 className="text-sm font-bold leading-none">VoltMart Digital Warranty Vault</h3>
              <span className="text-[11px] text-tertiary-fixed">Official Brand Protection</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-white/80 hover:text-white">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3.5 text-xs no-scrollbar">
          <div className="p-3 bg-surface-container-low rounded-2xl flex items-center gap-2.5 text-on-surface">
            <span className="material-symbols-outlined text-tertiary text-2xl">shield</span>
            <div className="text-[11px]">
              <span className="font-bold block">100% Genuine Manufacturer Guarantee</span>
              <span>All repairs and panel replacements performed by certified OEM technicians.</span>
            </div>
          </div>

          {warranties.map((war) => (
            <div
              key={war.id}
              className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                    {war.brand} • {war.coverageYears}-Year Guarantee
                  </span>
                  <h4 className="text-xs font-bold text-on-surface mt-0.5">{war.productName}</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-extrabold">
                  {war.status}
                </span>
              </div>

              <div className="bg-surface-container-low p-2.5 rounded-xl space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-outline">Serial Number:</span>
                  <span className="font-mono font-bold text-on-surface">{war.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Invoice Number:</span>
                  <span className="font-semibold text-on-surface">{war.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Valid Until:</span>
                  <span className="font-bold text-tertiary">{war.expiryDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onFileClaim(war)}
                  className="flex-1 py-2 px-3 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">handyman</span>
                  <span>File Free Claim</span>
                </button>
                <button
                  onClick={() => alert(`Downloading official warranty certificate for ${war.productName}...`)}
                  className="py-2 px-3 rounded-xl bg-surface-container-high text-on-surface font-semibold text-xs hover:bg-surface-container-highest transition-colors"
                >
                  Download Card
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
