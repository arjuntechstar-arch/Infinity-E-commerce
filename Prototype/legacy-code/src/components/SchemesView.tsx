import React, { useState } from 'react';
import { Scheme, ActiveScheme } from '../types';

interface SchemesViewProps {
  schemes: Scheme[];
  activeSchemes: ActiveScheme[];
  onEnrollScheme: (scheme: Scheme, monthlyDeposit: number) => void;
  onRequestWithdrawal: (activeScheme: ActiveScheme) => void;
  onViewReceipt: (activeScheme: ActiveScheme) => void;
}

export const SchemesView: React.FC<SchemesViewProps> = ({
  schemes,
  activeSchemes,
  onEnrollScheme,
  onRequestWithdrawal,
  onViewReceipt,
}) => {
  const [sliderVal, setSliderVal] = useState(50);
  const [selectedEmiTenure, setSelectedEmiTenure] = useState(6);
  const [tradeInValuation, setTradeInValuation] = useState(250);
  const [activeTab, setActiveTab] = useState<'available' | 'enrolled'>('available');

  const goldScheme = schemes[0];

  return (
    <div className="flex flex-col w-full pb-24 px-4 pt-1">
      {/* Schemes Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-extrabold text-on-surface">VoltFlex Schemes</h2>
          <p className="text-xs text-on-surface-variant">Revolutionary retail savings & 0% installments</p>
        </div>

        {/* Tab Toggle: Available vs Enrolled */}
        <div className="flex bg-surface-container rounded-full p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-3 py-1 rounded-full transition-all ${
              activeTab === 'available'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
              activeTab === 'enrolled'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant'
            }`}
          >
            <span>My Schemes</span>
            {activeSchemes.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
                {activeSchemes.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'available' ? (
        <div className="flex flex-col gap-4">
          {/* Hero Feature: VoltFlex 10+1 Smart Gold Scheme Card */}
          <div className="rounded-3xl bg-gradient-to-br from-primary via-primary-container to-surface-tint p-5 text-on-primary shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/20 backdrop-blur-md text-xs font-bold">
                <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">savings</span>
                VoltFlex 10+1 Smart Scheme
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-extrabold uppercase">
                100% Free 11th Mo
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-white leading-tight">
              Pay 10 Installments, We Give You the 11th FREE!
            </h3>
            <p className="text-xs text-on-primary-container mt-1.5">
              Accumulate funds for your dream OLED TV, laptop, or refrigerator. Get a guaranteed free month credit from VoltMart upon maturity!
            </p>

            {/* Interactive Slider Calculator */}
            <div className="mt-4 bg-surface-container-lowest/15 backdrop-blur-md rounded-2xl p-4 flex flex-col gap-3 border border-white/10">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Select Monthly Deposit</span>
                <span className="text-tertiary-fixed font-extrabold text-base" id="sliderValLabel">
                  ${sliderVal} / mo
                </span>
              </div>

              <input
                id="flexSlider"
                type="range"
                min="30"
                max="200"
                step="10"
                value={sliderVal}
                onChange={(e) => setSliderVal(Number(e.target.value))}
                className="w-full h-2 bg-on-primary/30 rounded-lg appearance-none cursor-pointer accent-secondary-container"
              />

              <div className="flex items-center justify-between text-xs text-on-primary-container pt-1">
                <span>You pay: <strong className="text-white">${sliderVal * 10}</strong> (10 mos)</span>
                <span>Free Bonus: <strong className="text-tertiary-fixed">+${sliderVal}</strong></span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-on-primary/20 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">account_balance_wallet</span>
                  <span className="text-xs font-bold text-white">Total Shopping Credit:</span>
                </div>
                <span className="text-lg font-extrabold text-tertiary-fixed">
                  ${(sliderVal * 11).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Perks list */}
            <div className="mt-3.5 space-y-1 text-xs text-white/90">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-tertiary-fixed">check_circle</span>
                <span>Zero pre-closure penalty after 6 completed installments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-tertiary-fixed">check_circle</span>
                <span>Redeemable on any brand (Apple, Samsung, Sony, LG)</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => onEnrollScheme(goldScheme, sliderVal)}
                className="w-full py-3 px-4 rounded-full font-bold text-sm text-on-secondary bg-secondary-container shadow-lg shadow-secondary-container/40 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <span>Enroll Now with ${sliderVal}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Scheme 2: Zero-Cost Smartphone EMI */}
          <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm border border-outline-variant/30 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">smartphone</span>
                INSTANT APPROVAL
              </span>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary text-[10px] font-extrabold">
                0% APR
              </span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-on-surface">Zero-Cost Smartphone EMI</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Upgrade to iPhone 15 Pro or Galaxy S24 Ultra with $0 down payment and zero hidden interest.
                </p>
              </div>
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqLkv8at_KjJQTepWEZ7KbWKTKO2MXgb-vWofPutooXXHocqV_N3MKrB_f1dqF-Y9-pmxnKSDvYXlYi4RBEl1L18AMP6bTXRBsdcyMmz4TvGJe8pOB8MQe3S6ERsBr2MhiecSbUr5QZBDmRk1RhhDXbceuJx8m7uU1v9wOQWJ3bH7PbxFOgyZDXKc4qXUun1TCGhOBN04MQDGhE_I-twaq_shIZ490w1nAfDQ4d90TeOde3glZwGlR"
                  alt="Smartphones"
                />
              </div>
            </div>

            {/* Tenure selector */}
            <div className="grid grid-cols-4 gap-2 my-3">
              {[
                { months: 3, label: 'No Cost' },
                { months: 6, label: 'Popular' },
                { months: 9, label: 'Zero Fee' },
                { months: 12, label: 'Low EMI' },
              ].map((t) => (
                <button
                  key={t.months}
                  onClick={() => setSelectedEmiTenure(t.months)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all ${
                    selectedEmiTenure === t.months
                      ? 'bg-primary text-on-primary shadow-sm font-bold'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="text-sm font-bold">{t.months} Mo</span>
                  <span className="text-[10px] opacity-80">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low text-on-surface mb-3 text-xs">
              <span className="material-symbols-outlined text-secondary-container text-[18px]">verified_user</span>
              <span className="flex-1">Complimentary 1-year front screen replacement warranty included.</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[11px] text-on-surface-variant block">From</span>
                <span className="text-lg font-extrabold text-primary">
                  $49<span className="text-xs font-normal text-on-surface-variant">/mo</span>
                </span>
              </div>
              <button
                onClick={() => onEnrollScheme(schemes[1], 49)}
                className="px-4 py-2 rounded-full bg-primary-container text-on-primary text-xs font-bold shadow-md active:scale-95 transition-transform flex items-center gap-1"
              >
                <span>Check Eligibility</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Scheme 3: Appliance Exchange & Upgrade Bonanza */}
          <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm border border-outline-variant/30 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary-container text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">published_with_changes</span>
                TOP VALUE TRADE-IN
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-extrabold">
                +15% Bonus
              </span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-on-surface">Appliance Exchange Bonanza</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Trade in any old refrigerator, television, or washing machine for instant guaranteed credit.
                </p>
              </div>
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuACmam7p5Budvrc70amH3KvIXhWwEHHLZtrlRZErHrcSrYp473ryaO76ECyOrc9U9BiJgv7FpIIl3dkNtGfKMGv4tbsQ_sdO5bSfy0QGMdkpQRhcVkm5WbUVcf_W0cd1qnNN-MLfMspYAg4QSORR7FLJ6lVjKloJQ1Eh0mbIJ7S7pUDxBywQRMz5lx1gy3QQIZ7bC-FQ8Q-vlM0FnXh8zbrplUvzcsyA9ZgxhP3OoSZN6cOWoAl3R8V"
                  alt="Appliances"
                />
              </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-surface-container-low flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <span>Estimated Trade-in Bonus:</span>
                <span className="text-primary font-bold text-sm">${tradeInValuation}.00</span>
              </div>
              <input
                type="range"
                min="100"
                max="350"
                step="25"
                value={tradeInValuation}
                onChange={(e) => setTradeInValuation(Number(e.target.value))}
                className="w-full h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[11px] text-outline">
                <span>Min: $100</span>
                <span>Max: $350 Trade-In</span>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                onClick={() => onEnrollScheme(schemes[2], 60)}
                className="px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold shadow-md active:scale-95 transition-transform flex items-center gap-1"
              >
                <span>Book Free Home Pickup</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Enrolled Schemes Tab */
        <div className="flex flex-col gap-3">
          {activeSchemes.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl p-8 text-center border border-outline-variant/30">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">savings</span>
              <h4 className="text-base font-bold text-on-surface">No active schemes yet</h4>
              <p className="text-xs text-on-surface-variant mt-1 mb-4">
                Enroll in a VoltFlex scheme to save smart and earn bonus credits on gadgets!
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold"
              >
                Explore Schemes
              </button>
            </div>
          ) : (
            activeSchemes.map((sch) => {
              const progressPct = Math.round((sch.paidMonths / sch.totalMonths) * 100);
              return (
                <div
                  key={sch.id}
                  className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm border border-outline-variant/30 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-on-surface">{sch.schemeName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-extrabold">
                          {sch.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-outline">Code: {sch.schemeCode}</span>
                    </div>
                    <button
                      onClick={() => onViewReceipt(sch)}
                      className="px-2.5 py-1 rounded-lg bg-surface-container-low text-primary text-xs font-semibold flex items-center gap-1 hover:bg-surface-container"
                    >
                      <span className="material-symbols-outlined text-sm">receipt_long</span>
                      <span>Receipt</span>
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>
                        Installment: {sch.paidMonths} of {sch.totalMonths} Paid
                      </span>
                      <span className="text-primary font-bold">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-2.5 rounded-xl text-center text-xs">
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">Accumulated</span>
                      <span className="font-extrabold text-on-surface">${sch.accumulatedSavings}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">Bonus Credit</span>
                      <span className="font-extrabold text-tertiary">+${sch.bonusEarned}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">Next Debit</span>
                      <span className="font-bold text-on-surface">{sch.nextDebitDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-outline-variant/20">
                    <span className="text-outline">
                      Autopay: {sch.mandateBank} (*{sch.mandateAccLast4})
                    </span>
                    <button
                      onClick={() => onRequestWithdrawal(sch)}
                      className="text-secondary font-bold text-xs hover:underline flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">cancel</span>
                      <span>Withdraw Early</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
