import React, { useState } from 'react';
import { CartItem } from '../types';

interface CartModalProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedCheckout: (voucherApplied: boolean, voucherDiscount: number) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
}) => {
  if (!isOpen) return null;

  const [voucherCode, setVoucherCode] = useState('VOLT50');
  const [voucherApplied, setVoucherApplied] = useState(true);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');

  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.plan === 'scheme' ? item.product.monthlySchemePrice : item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const voucherDiscount = voucherApplied && subtotal > 50 ? 50 : 0;
  const deliveryFee = deliveryType === 'delivery' ? 0 : 0; // Free delivery promo
  const total = Math.max(0, subtotal - voucherDiscount + deliveryFee);

  const handleApplyVoucher = () => {
    if (voucherCode.toUpperCase().trim() === 'VOLT50') {
      setVoucherApplied(true);
    } else {
      alert('Invalid code. Try "VOLT50" for $50 off!');
      setVoucherApplied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">shopping_cart</span>
            <h2 className="text-base font-bold text-on-surface">Your Cart ({items.length})</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-outline mb-2">shopping_bag</span>
              <h3 className="text-base font-bold text-on-surface">Your cart is currently empty</h3>
              <p className="text-xs text-on-surface-variant mt-1 mb-4">
                Explore our electronics and enroll in 0% EMI schemes!
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-xs font-bold"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <>
              {/* Item Cards */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex gap-3 items-center"
                  >
                    <div className="w-16 h-16 rounded-xl bg-surface-container overflow-hidden shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold text-outline uppercase">{item.product.brand}</span>
                        {item.plan === 'scheme' ? (
                          <span className="px-1.5 py-0.2 rounded bg-primary text-on-primary text-[9px] font-extrabold uppercase">
                            VoltFlex Scheme
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant text-[9px] font-bold uppercase">
                            Outright
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-on-surface truncate">{item.product.title}</h4>

                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs font-extrabold text-primary">
                          {item.plan === 'scheme' ? (
                            <span>${item.product.monthlySchemePrice}/mo (1st Deposit)</span>
                          ) : (
                            <span>${item.product.price}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center text-xs font-bold shadow-sm"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center text-xs font-bold shadow-sm"
                          >
                            +
                          </button>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-error hover:text-error-container ml-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Choice */}
              <div className="bg-surface-container-low p-3 rounded-2xl">
                <span className="text-xs font-bold text-outline uppercase tracking-wider block mb-2">
                  Fulfillment Method
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                      deliveryType === 'delivery'
                        ? 'border-primary bg-primary-fixed/30 font-bold text-primary'
                        : 'border-outline-variant/30 bg-surface-container-lowest text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] mb-1">local_shipping</span>
                    <span>Express Home Delivery</span>
                    <span className="text-[10px] text-tertiary font-bold">FREE Today</span>
                  </button>

                  <button
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                      deliveryType === 'pickup'
                        ? 'border-primary bg-primary-fixed/30 font-bold text-primary'
                        : 'border-outline-variant/30 bg-surface-container-lowest text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] mb-1">store</span>
                    <span>Downtown Hub Pickup</span>
                    <span className="text-[10px] text-tertiary font-bold">Ready in 2h</span>
                  </button>
                </div>
              </div>

              {/* Promo Voucher */}
              <div className="bg-surface-container-low p-3 rounded-2xl flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">redeem</span>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="Enter Promo Code"
                  className="bg-transparent flex-1 text-xs font-bold uppercase text-on-surface focus:outline-none"
                />
                <button
                  onClick={handleApplyVoucher}
                  className="px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold shadow-sm"
                >
                  {voucherApplied ? 'Applied ✓' : 'Apply'}
                </button>
              </div>

              {/* Price Breakdown */}
              <div className="p-3 rounded-2xl bg-surface-container-low text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-outline">Subtotal:</span>
                  <span className="font-semibold text-on-surface">${subtotal.toFixed(2)}</span>
                </div>
                {voucherApplied && voucherDiscount > 0 && (
                  <div className="flex justify-between text-tertiary font-bold">
                    <span>Welcome Bonus Voucher (VOLT50):</span>
                    <span>-${voucherDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-outline">Delivery / Pickup:</span>
                  <span className="font-bold text-tertiary">FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-outline-variant/30 text-sm font-extrabold text-on-surface">
                  <span>Total Due Today:</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer CTA */}
        {items.length > 0 && (
          <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest shrink-0">
            <button
              onClick={() => onProceedCheckout(voucherApplied, voucherDiscount)}
              className="w-full py-3.5 px-4 rounded-full bg-primary text-on-primary font-bold text-xs shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <span>Place Order (${total.toFixed(2)})</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
