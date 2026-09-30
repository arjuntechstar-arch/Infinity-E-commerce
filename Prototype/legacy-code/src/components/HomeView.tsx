import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface HomeViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, plan: 'full' | 'scheme') => void;
  onOpenSchemes: () => void;
  onOpenSearch: (category?: string) => void;
  onEnrollSchemeDirect: (deposit: number) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onOpenSchemes,
  onOpenSearch,
  onEnrollSchemeDirect,
}) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [seconds, setSeconds] = useState(15);
  const [minutes, setMinutes] = useState(42);
  const [hours, setHours] = useState(8);
  const [quickDeposit, setQuickDeposit] = useState(50);

  // Timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev > 0) return prev - 1;
        setMinutes((m) => {
          if (m > 0) return m - 1;
          setHours((h) => (h > 0 ? h - 1 : 8));
          return 59;
        });
        return 59;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Banner rotation
  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBanner((prev) => (prev === 0 ? 1 : 0));
    }, 5500);
    return () => clearInterval(bannerInterval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  const categories = [
    { id: 'smartphones', name: 'Mobiles', icon: 'smartphone' },
    { id: 'tv-audio', name: 'Smart TVs', icon: 'tv' },
    { id: 'appliances', name: 'Appliances', icon: 'kitchen' },
    { id: 'laptops', name: 'Laptops', icon: 'laptop_mac' },
    { id: 'wearables', name: 'Wearables', icon: 'watch' },
  ];

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Search Bar Input Trigger */}
      <div className="px-4 pb-2 pt-1">
        <div
          onClick={() => onOpenSearch()}
          className="relative flex items-center bg-surface-container-high hover:bg-surface-container-highest rounded-full shadow-sm cursor-pointer transition-all px-4 py-2.5 group"
        >
          <span className="material-symbols-outlined text-primary mr-2 select-none">search</span>
          <span className="text-sm text-outline truncate flex-1">
            Search smartphones, 4K TVs, ACs, smart appliances...
          </span>
          <div className="flex items-center gap-1.5 shrink-0 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">mic</span>
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
          </div>
        </div>
      </div>

      {/* Perk Highlights */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[15px] text-secondary">payments</span>
            <span>0% Downpayment</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low text-primary text-xs font-bold shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[15px]">electric_bolt</span>
            <span>Pickup in 2 Hours</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[15px] text-tertiary">swap_horiz</span>
            <span>$120 Exchange Bonus</span>
          </div>
        </div>
      </div>

      {/* Dynamic Promotional Hero Carousel */}
      <div className="relative w-full px-4 my-2 overflow-hidden">
        <div className="relative w-full rounded-2xl overflow-hidden shadow-lg">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentBanner * 100}%)` }}
          >
            {/* Slide 1 */}
            <div className="w-full shrink-0 relative bg-gradient-to-r from-primary via-primary-container to-surface-tint p-5 text-on-primary min-h-[185px] flex flex-col justify-between">
              <div className="absolute -right-6 -bottom-8 w-44 h-44 rounded-full bg-surface-container-lowest/10 blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between z-10">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold tracking-wide uppercase shadow-sm">
                  Super Sale
                </span>
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/20 backdrop-blur-md text-surface-container-lowest text-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px]">timer</span>
                  <span>{pad(hours)}h : {pad(minutes)}m : {pad(seconds)}s</span>
                </div>
              </div>
              <div className="z-10 mt-2">
                <h2 className="text-xl sm:text-2xl font-extrabold leading-tight text-surface-container-lowest drop-shadow-sm">
                  Summer Mega Festive
                </h2>
                <p className="text-xs sm:text-sm text-on-primary-container mt-0.5">
                  Flat 40% Off + Instant $60 Bank Cashback on Flagship TVs & ACs
                </p>
              </div>
              <div className="flex items-center justify-between mt-3 z-10">
                <span className="text-xs font-medium text-primary-fixed">On Smart TVs, ACs & Refrig.</span>
                <button
                  onClick={() => onOpenSearch('tv-audio')}
                  className="px-4 py-1.5 rounded-full bg-surface-container-lowest text-primary text-xs font-bold shadow-md active:scale-95 transition-transform flex items-center gap-1"
                >
                  <span>Explore Now</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Slide 2 */}
            <div className="w-full shrink-0 relative bg-gradient-to-r from-secondary-container to-secondary p-5 text-on-secondary min-h-[185px] flex flex-col justify-between">
              <div className="absolute -right-4 -top-6 w-36 h-36 rounded-full bg-surface-container-lowest/15 blur-xl pointer-events-none"></div>
              <div className="flex items-center justify-between z-10">
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-secondary text-[11px] font-bold uppercase tracking-wide shadow-sm">
                  Flagship Easy EMI
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest/20 backdrop-blur-md text-surface-container-lowest text-xs font-semibold">
                  VoltScheme
                </span>
              </div>
              <div className="z-10 mt-2">
                <h2 className="text-xl sm:text-2xl font-extrabold leading-tight text-surface-container-lowest drop-shadow-sm">
                  iPhone 15 Pro & S24 Ultra
                </h2>
                <p className="text-xs sm:text-sm text-secondary-fixed mt-0.5">
                  Own flagship tech from just $49/month with zero hidden interest
                </p>
              </div>
              <div className="flex items-center justify-between mt-3 z-10">
                <span className="text-xs font-medium text-secondary-fixed">Zero Processing Fee</span>
                <button
                  onClick={onOpenSchemes}
                  className="px-4 py-1.5 rounded-full bg-surface-container-lowest text-secondary text-xs font-bold shadow-md active:scale-95 transition-transform flex items-center gap-1"
                >
                  <span>Check Eligibility</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Indicator dots */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
            <button
              onClick={() => setCurrentBanner(0)}
              className={`h-1.5 rounded-full transition-all ${
                currentBanner === 0 ? 'w-5 bg-surface-container-lowest' : 'w-1.5 bg-surface-container-lowest/40'
              }`}
            />
            <button
              onClick={() => setCurrentBanner(1)}
              className={`h-1.5 rounded-full transition-all ${
                currentBanner === 1 ? 'w-5 bg-surface-container-lowest' : 'w-1.5 bg-surface-container-lowest/40'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Categories Row */}
      <div className="mt-3 mb-2">
        <div className="px-4 flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-on-surface">Categories</h3>
          <button
            onClick={() => onOpenSearch()}
            className="text-xs font-bold text-primary flex items-center hover:underline"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto px-4 no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onOpenSearch(cat.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high group-hover:bg-primary-fixed flex items-center justify-center text-primary shadow-sm transition-colors">
                <span className="material-symbols-outlined text-[26px]">{cat.icon}</span>
              </div>
              <span className="text-xs font-medium text-on-surface">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* VoltFlex 10+1 Smart Gold Scheme Teaser */}
      <div className="px-4 my-3">
        <div className="rounded-3xl bg-gradient-to-br from-primary via-primary-container to-surface-tint p-4 text-on-primary shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-tertiary-fixed text-[20px]">savings</span>
              <span className="text-xs font-bold uppercase tracking-wider text-tertiary-fixed">VoltFlex 10+1 Scheme</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-extrabold uppercase">
              1 Month Free
            </span>
          </div>

          <h3 className="text-lg font-bold text-white leading-tight">Pay for 10 Mos, Get 11th Month Free!</h3>
          <p className="text-xs text-on-primary-container mt-1">
            Build your electronics budget with VoltMart. We deposit the final installment into your store wallet.
          </p>

          <div className="mt-3 bg-surface-container-lowest/15 backdrop-blur-md rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span>Monthly Deposit:</span>
              <span className="text-tertiary-fixed font-bold text-sm">${quickDeposit}/mo</span>
            </div>
            <input
              type="range"
              min="30"
              max="200"
              step="10"
              value={quickDeposit}
              onChange={(e) => setQuickDeposit(Number(e.target.value))}
              className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-secondary-container"
            />
            <div className="flex justify-between text-[11px] text-white/90 pt-1">
              <span>You save: ${quickDeposit * 10}</span>
              <span className="text-tertiary-fixed font-bold">VoltMart Bonus: +${quickDeposit}</span>
              <span className="text-white font-bold">Total: ${quickDeposit * 11}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => onEnrollSchemeDirect(quickDeposit)}
              className="flex-1 py-2.5 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1"
            >
              <span>Instant Enroll with ${quickDeposit}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
            <button
              onClick={onOpenSchemes}
              className="px-3.5 py-2.5 rounded-full bg-white/20 text-white font-semibold text-xs hover:bg-white/30 transition-colors"
            >
              Details
            </button>
          </div>
        </div>
      </div>

      {/* Trending Flagship Tech Grid */}
      <div className="px-4 mt-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-on-surface">Trending Electronics</h3>
            <p className="text-xs text-on-surface-variant">Eligible for 0% EMI & VoltFlex schemes</p>
          </div>
          <button
            onClick={() => onOpenSearch()}
            className="text-xs font-bold text-primary hover:underline"
          >
            See All ({products.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectProduct(prod)}
            >
              <div>
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-surface-container-low mb-2.5 flex items-center justify-center">
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container text-[10px] font-extrabold uppercase shadow-sm">
                      {prod.discountPercent}% OFF
                    </span>
                    {prod.schemeEligible && (
                      <span className="px-2 py-0.5 rounded-md bg-primary text-on-primary text-[10px] font-bold shadow-sm">
                        Scheme Ready
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-[11px] font-bold text-on-surface flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[14px] text-amber-500 fill-current">star</span>
                    <span>{prod.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-outline mb-1">
                  <span className="uppercase font-bold tracking-wider">{prod.brand}</span>
                  <span className="text-tertiary font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    {prod.stockCount} in stock
                  </span>
                </div>

                <h4 className="text-sm font-bold text-on-surface leading-snug line-clamp-2">
                  {prod.title}
                </h4>
              </div>

              <div className="mt-3 pt-2.5 border-t border-outline-variant/20">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-base font-extrabold text-on-surface">${prod.price}</span>
                    <span className="text-xs text-outline line-through ml-1.5">${prod.originalPrice}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-primary block">
                      ${prod.monthlySchemePrice}/mo
                    </span>
                    <span className="text-[10px] text-on-surface-variant block">on scheme</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onAddToCart(prod, 'scheme')}
                    className="py-2 px-2 rounded-xl bg-primary-container text-on-primary text-xs font-bold active:scale-95 transition-transform flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[15px]">savings</span>
                    <span>Scheme</span>
                  </button>

                  <button
                    onClick={() => onAddToCart(prod, 'full')}
                    className="py-2 px-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-bold hover:bg-surface-container-highest active:scale-95 transition-transform flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">shopping_bag</span>
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VoltMart Warranty Shield Card */}
      <div className="px-4 mt-6">
        <div className="rounded-2xl bg-surface-container-low p-4 flex items-center justify-between shadow-sm border border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div>
              <h5 className="text-sm font-bold text-on-surface">VoltMart Warranty Shield</h5>
              <p className="text-xs text-on-surface-variant">2-Year Official Brand Guarantee on All Gadgets</p>
            </div>
          </div>
          <button
            onClick={() => onOpenSearch()}
            className="px-3 py-1.5 rounded-full bg-surface-container-lowest text-primary text-xs font-bold shadow-sm active:scale-95 shrink-0"
          >
            Know More
          </button>
        </div>
      </div>
    </div>
  );
};
