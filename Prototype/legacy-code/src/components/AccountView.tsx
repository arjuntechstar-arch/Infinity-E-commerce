import React, { useState } from 'react';
import { WarrantyItem, Order } from '../types';

interface AccountViewProps {
  warranties: WarrantyItem[];
  orders: Order[];
  onOpenWarranties: () => void;
  onOpenOrders: () => void;
  onOpenKyc: () => void;
  onChangePhone: () => void;
  kycVerified: boolean;
}

export const AccountView: React.FC<AccountViewProps> = ({
  warranties,
  orders,
  onOpenWarranties,
  onOpenOrders,
  onOpenKyc,
  onChangePhone,
  kycVerified,
}) => {
  const [pushAlerts, setPushAlerts] = useState(true);
  const [autoApplyVoucher, setAutoApplyVoucher] = useState(true);
  const [activeAddress, setActiveAddress] = useState('428 Lexington Ave, Apt 9B, New York, NY 10017');

  return (
    <div className="flex flex-col w-full pb-24 px-4 pt-1">
      {/* Profile Header Card */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm border border-outline-variant/30 flex items-center gap-4 mb-4">
        <div className="relative">
          <img
            alt="Customer Portrait"
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwuTddeus_W4dNvVH5Ncv3NblDJ52Cqa9aBSEdyS9OH-_FZCSNfyHOBlVOKodxEBb8zNmVsV24siXXyMideH8hvFAQ27nOMPjRJheuADpc05YB4D1UzBC9xN95MVK9iaGSlkE0SymVnAX0MsUqEUttsX3CEnq6MH-0nQRMjUPBKHIZXyyKHf_MWUGwW4-dCFquC3sGTeMs76yIqzVCXMOCMmLYtq5o5pHIzrFQUZo0p7TzbVAOONPA"
          />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-tertiary text-white flex items-center justify-center text-[12px] shadow-sm">
            <span className="material-symbols-outlined text-[13px]">verified</span>
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-on-surface truncate">Alexander Rivera</h3>
            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-extrabold uppercase">
              Gold Tier
            </span>
          </div>
          <p className="text-xs text-on-surface-variant truncate">alexander.rivera@example.com</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-outline font-semibold">+1 (555) 019-2834</span>
            <button
              onClick={onChangePhone}
              className="text-[11px] font-bold text-primary hover:underline"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Primary Retail Service Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={onOpenOrders}
          className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-sm text-left flex flex-col justify-between hover:shadow-md transition-shadow active:scale-95"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary-fixed/60 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            </div>
            {orders.filter((o) => o.status !== 'Delivered').length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-extrabold">
                1 Active
              </span>
            )}
          </div>
          <div>
            <span className="text-xs font-bold text-on-surface block">Orders & Tracking</span>
            <span className="text-[11px] text-outline">Live van dispatch map</span>
          </div>
        </button>

        <button
          onClick={onOpenWarranties}
          className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-sm text-left flex flex-col justify-between hover:shadow-md transition-shadow active:scale-95"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-tertiary-fixed/60 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary text-[10px] font-extrabold">
              {warranties.length} Cards
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-on-surface block">Digital Warranty Vault</span>
            <span className="text-[11px] text-outline">2-Yr official guarantee</span>
          </div>
        </button>
      </div>

      {/* KYC Verification Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-sm mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                kycVerified
                  ? 'bg-tertiary-fixed text-tertiary'
                  : 'bg-secondary-fixed text-secondary'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {kycVerified ? 'badge' : 'pending_actions'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface">Scheme KYC Status</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    kycVerified
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                      : 'bg-secondary-fixed text-on-secondary-fixed'
                  }`}
                >
                  {kycVerified ? 'Verified Approved' : 'Action Required'}
                </span>
              </div>
              <p className="text-[11px] text-outline mt-0.5">
                {kycVerified
                  ? 'Identity ID verified for 0% EMI schemes & zero deposit loans.'
                  : 'Upload National ID/Driver License to unlock higher scheme credit.'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenKyc}
          className="w-full mt-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-bold text-xs transition-colors flex items-center justify-center gap-1"
        >
          <span>{kycVerified ? 'View KYC Documents' : 'Complete Verification'}</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>

      {/* Delivery Addresses */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-on-surface">Default Delivery Address</span>
          <span className="text-[11px] font-bold text-primary">Primary</span>
        </div>
        <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
          {activeAddress}
        </p>
        <button
          onClick={() => {
            const newAddr = prompt('Update primary shipping address:', activeAddress);
            if (newAddr) setActiveAddress(newAddr);
          }}
          className="mt-2 text-xs font-bold text-primary hover:underline"
        >
          Change Shipping Address
        </button>
      </div>

      {/* App Preferences */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-sm">
        <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Preferences</h4>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-on-surface block">Auto-debit Reminder Alerts</span>
              <span className="text-[11px] text-outline">SMS & Push 24 hours prior to mandate</span>
            </div>
            <input
              type="checkbox"
              checked={pushAlerts}
              onChange={(e) => setPushAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-primary accent-primary"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
            <div>
              <span className="font-bold text-on-surface block">Auto-apply Welcome Voucher</span>
              <span className="text-[11px] text-outline">Automatically discount $50 on checkout</span>
            </div>
            <input
              type="checkbox"
              checked={autoApplyVoucher}
              onChange={(e) => setAutoApplyVoucher(e.target.checked)}
              className="w-4 h-4 rounded text-primary accent-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
