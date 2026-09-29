import React, { useState } from 'react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, plan: 'full' | 'scheme') => void;
  onDirectSchemeEnroll: (product: Product, monthlyDeposit: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onDirectSchemeEnroll,
}) => {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<'scheme' | 'full'>('scheme');
  const [schemeDeposit, setSchemeDeposit] = useState(product.monthlySchemePrice);

  const images = product.images.length > 0 ? product.images : [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD2UNZrugFeboUWO_txhMB8NskD755h6q_jixIFeYaOfJ_WTKtcFvw56mE5TQR4yL4cjfyBEaXzTgH9wZ3Lx5bLR2p1F6xmolqZTrTbudMu2GQQaYwyjqC_7GVbvnZ8bdbhQt8u_4aE7ps5SyGr5CRpEkVPiVurvY0QsykbUtskYOeI7VZdlO7J-jGIVITXal6-3ePUQ6aERgHAhsuVI4IXkc7Ug1V9DXwxSJQtnbq5gJmRI0tVpPXH'
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">{product.brand}</span>
            <span className="text-xs text-outline">•</span>
            <span className="text-xs text-outline">{product.sku}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* Main Gallery Image */}
          <div className="relative w-full h-64 rounded-2xl bg-surface-container-low overflow-hidden flex items-center justify-center">
            <img
              src={images[activeImageIndex] || images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 flex gap-1">
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-extrabold uppercase shadow-sm">
                {product.discountPercent}% OFF
              </span>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary text-[11px] font-extrabold shadow-sm">
                0% APR
              </span>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-12 rounded-xl p-0.5 transition-all overflow-hidden border-2 ${
                    activeImageIndex === idx ? 'border-primary shadow-sm scale-105' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover rounded-lg" />
                </button>
              ))}
            </div>
          )}

          {/* Title & Price */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface leading-tight">
              {product.title}
            </h2>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-extrabold text-on-surface">${product.price.toFixed(2)}</span>
              <span className="text-xs text-outline line-through">${product.originalPrice.toFixed(2)}</span>
              <span className="text-xs font-bold text-tertiary">Save ${(product.originalPrice - product.price).toFixed(2)}</span>
            </div>
          </div>

          {/* Live Store Hub Stock Alert */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20">
            <div className="w-9 h-9 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shrink-0">
              <span className="material-symbols-outlined text-[20px]">store</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                <span className="text-xs font-bold text-on-surface truncate">{product.hub}</span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                {product.stockCount} units available for instant 2-hour pickup or same-day delivery
              </p>
            </div>
          </div>

          {/* Purchase Option Toggle: Scheme Installment vs Buy Full */}
          <div className="bg-surface-container p-1 rounded-2xl flex text-xs font-bold">
            <button
              onClick={() => setSelectedPlan('scheme')}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                selectedPlan === 'scheme'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">savings</span>
              <span>VoltFlex Scheme (${product.monthlySchemePrice}/mo)</span>
            </button>

            <button
              onClick={() => setSelectedPlan('full')}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                selectedPlan === 'full'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">credit_card</span>
              <span>Buy Outright (${product.price})</span>
            </button>
          </div>

          {/* Scheme Breakdown Card */}
          {selectedPlan === 'scheme' ? (
            <div className="rounded-2xl bg-gradient-to-br from-primary via-primary-container to-surface-tint p-4 text-on-primary shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-tertiary-fixed">
                  VoltFlex 10+1 Smart Scheme
                </span>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-extrabold uppercase">
                  VIP 0% Down
                </span>
              </div>

              <p className="text-xs text-on-primary-container mb-3">
                Deposit 10 monthly payments of ${schemeDeposit}. VoltMart contributes the 11th installment (${schemeDeposit}) completely free on delivery!
              </p>

              <div className="bg-surface-container-lowest/15 backdrop-blur-md rounded-xl p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span>Monthly Installment:</span>
                  <span className="text-tertiary-fixed font-bold text-sm">${schemeDeposit}/month</span>
                </div>
                <input
                  type="range"
                  min={Math.max(25, Math.floor(product.monthlySchemePrice * 0.7))}
                  max={Math.ceil(product.monthlySchemePrice * 1.5)}
                  step="5"
                  value={schemeDeposit}
                  onChange={(e) => setSchemeDeposit(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-secondary-container"
                />
                <div className="flex justify-between text-[11px] text-white/90 pt-1">
                  <span>Your Deposit: ${schemeDeposit * 10}</span>
                  <span className="text-tertiary-fixed font-bold">VoltMart Bonus: +${schemeDeposit}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-surface-container-low p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-outline">Regular Retail Price:</span>
                <span className="line-through text-outline">${product.originalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Instant VoltMart Discount:</span>
                <span className="font-bold text-tertiary">-${(product.originalPrice - product.price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-outline-variant/30 text-sm font-bold text-on-surface">
                <span>Total Amount Due:</span>
                <span className="text-primary">${product.price.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Specifications Table */}
          <div>
            <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Specifications</h4>
            <div className="rounded-2xl bg-surface-container-low overflow-hidden divide-y divide-outline-variant/20 text-xs">
              {product.specs.map((sp, idx) => (
                <div key={idx} className="flex justify-between p-2.5">
                  <span className="text-outline font-medium">{sp.label}</span>
                  <span className="font-bold text-on-surface text-right max-w-[60%]">{sp.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Fixed CTA */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest shrink-0 flex items-center gap-2">
          {selectedPlan === 'scheme' ? (
            <button
              onClick={() => {
                onDirectSchemeEnroll(product, schemeDeposit);
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Enroll Scheme with ${schemeDeposit} Deposit</span>
            </button>
          ) : null}

          <button
            onClick={() => {
              onAddToCart(product, selectedPlan);
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span>Add to Cart ({selectedPlan === 'scheme' ? 'Scheme Plan' : 'Full Pay'})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
