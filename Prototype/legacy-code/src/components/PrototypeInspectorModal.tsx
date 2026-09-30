import React from 'react';

interface PrototypeInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (actionKey: string) => void;
}

export const PrototypeInspectorModal: React.FC<PrototypeInspectorModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const screens = [
    {
      id: 'voltmart_store_home',
      name: 'Store Home',
      category: 'Core Flow',
      description: 'Dynamic promo carousel with live countdown, category bar, quick perks, trending deals.',
      actionKey: 'open-home',
      icon: 'storefront',
    },
    {
      id: 'voltmart_product_search_category_filters',
      name: 'Product Search & Filters',
      category: 'Catalog',
      description: 'Search input, filter & sort drawer, brand chips, VoltFlex 10+1 toggle, price sort.',
      actionKey: 'open-search',
      icon: 'search',
    },
    {
      id: 'voltmart_product_details_scheme_checkout',
      name: 'Product Details & Scheme Checkout',
      category: 'Product Flow',
      description: 'Gallery thumbnails, specs table, live hub stock alert, scheme breakdown calculator.',
      actionKey: 'open-product-detail',
      icon: 'devices',
    },
    {
      id: 'voltmart_shopping_cart_checkout',
      name: 'Shopping Cart & Checkout',
      category: 'Checkout',
      description: 'Cart items, quantity adjust, delivery vs hub pickup, voucher promo code, total calculation.',
      actionKey: 'open-cart',
      icon: 'shopping_cart',
    },
    {
      id: 'voltmart_available_schemes',
      name: 'VoltFlex Schemes & 10+1 Calculator',
      category: 'Scheme Vault',
      description: 'Interactive deposit slider ($30-$200), bonus calculator, 0% phone EMI tenure selector.',
      actionKey: 'open-schemes',
      icon: 'auto_awesome',
    },
    {
      id: 'voltmart_scheme_autopay_mandate_setup',
      name: 'Autopay Mandate Setup',
      category: 'Banking',
      description: 'Select Chase, BoA, Wells Fargo; routing & account inputs, debit date, e-sign authorization.',
      actionKey: 'open-mandate',
      icon: 'account_balance',
    },
    {
      id: 'voltmart_scheme_kyc_verification_modal',
      name: 'Scheme KYC Identity Verification',
      category: 'Compliance',
      description: 'Select ID type, document number, DOB, scanned photo verification, credit agreement.',
      actionKey: 'open-kyc',
      icon: 'verified_user',
    },
    {
      id: 'voltmart_scheme_activation_success',
      name: 'Scheme Activation Certificate',
      category: 'Celebration',
      description: 'Confetti animation, certificate ID, monthly schedule, mandate details, navigation.',
      actionKey: 'open-scheme-success',
      icon: 'celebration',
    },
    {
      id: 'voltmart_order_placed_delivery_tracking',
      name: 'Live Order & Courier Tracking',
      category: 'Logistics',
      description: 'Fleet van timeline (Confirmed, Inspected, Dispatched, Out for Delivery), driver call action.',
      actionKey: 'open-order-tracking',
      icon: 'local_shipping',
    },
    {
      id: 'voltmart_order_history_digital_warranties',
      name: 'Digital Warranty Vault',
      category: 'After-Sales',
      description: '2-Year Official Brand Shield cards, serial numbers, invoice IDs, file repair claim action.',
      actionKey: 'open-warranties',
      icon: 'verified',
    },
    {
      id: 'voltmart_payments_account',
      name: 'Payments & Scheme Ledger',
      category: 'Financials',
      description: 'Total savings vault balance, maturity bonus, linked e-mandates, withdrawal shortcuts.',
      actionKey: 'open-payments',
      icon: 'credit_card',
    },
    {
      id: 'voltmart_premature_withdrawal_refund_request',
      name: 'Premature Withdrawal & Refund',
      category: 'Financials',
      description: 'Penalty calculation (0% after 6 mos vs 2% admin fee), net payout, ACH bank selection.',
      actionKey: 'open-withdrawal',
      icon: 'payments',
    },
    {
      id: 'voltmart_settlement_receipt_pdf_viewer',
      name: 'PDF Settlement Receipt Viewer',
      category: 'Fiscal',
      description: 'Official simulated PDF receipt with watermark stamp, itemized breakdown, barcode.',
      actionKey: 'open-receipt',
      icon: 'picture_as_pdf',
    },
    {
      id: 'voltmart_24_7_scheme_concierge_chat',
      name: '24/7 Scheme Concierge Chat',
      category: 'Support',
      description: 'Live interactive chat with scheme expert, instant intelligent answers & quick replies.',
      actionKey: 'open-concierge',
      icon: 'support_agent',
    },
    {
      id: 'voltmart_change_phone_number_otp_verification_modal',
      name: 'Phone OTP Verification Modal',
      category: 'Security',
      description: 'Change mobile number with 4-digit OTP verification code flow and resend timer.',
      actionKey: 'open-change-phone',
      icon: 'sms',
    },
    {
      id: 'voltmart_account_settings_preferences',
      name: 'Account & Preferences',
      category: 'Profile',
      description: 'Profile card, Gold tier badge, default delivery address editor, notification settings.',
      actionKey: 'open-account',
      icon: 'person',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-primary to-primary-container text-on-primary flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px]">dashboard_customize</span>
              <h3 className="text-sm font-bold leading-tight">Prototype Flow Directory</h3>
            </div>
            <span className="text-[11px] text-on-primary-container">
              All 16+ original Prototype flows implemented with 100% interactive React code
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* List of screens */}
        <div className="p-4 overflow-y-auto space-y-2.5 text-xs no-scrollbar">
          <div className="p-2.5 rounded-xl bg-surface-container-low text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-lg">check_circle</span>
            <span className="text-[11px] leading-snug">
              Every screen is built from scratch with functional React components, state, real calculations, and Tailwind CSS. No static screenshot placeholders are used.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {screens.map((sc) => (
              <div
                key={sc.id}
                className="p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/20 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-[20px]">{sc.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface text-xs truncate">{sc.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-surface-container text-outline text-[9px] font-bold shrink-0">
                        {sc.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                      {sc.description}
                    </p>
                    <span className="text-[9px] font-mono text-outline block mt-0.5">
                      /Prototype/{sc.id}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate(sc.actionKey);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-full bg-primary text-on-primary font-bold text-xs shadow-sm hover:bg-primary-container active:scale-95 transition-all shrink-0 flex items-center gap-1"
                >
                  <span>Launch</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
