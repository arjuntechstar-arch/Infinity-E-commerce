import React from 'react';

export type TabType = 'home' | 'schemes' | 'payments' | 'account' | 'search';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenAssistant: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenAssistant,
}) => {
  return (
    <>
      {/* Floating 24/7 Concierge Chat Expert FAB */}
      <div className="fixed right-4 bottom-20 z-30">
        <button
          id="storeAssistantFab"
          onClick={onOpenAssistant}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-on-primary shadow-xl shadow-primary/30 active:scale-95 transition-all hover:bg-primary-container"
        >
          <span className="material-symbols-outlined text-[20px]">support_agent</span>
          <span className="font-label-md text-xs font-bold">Scheme Concierge</span>
          <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping"></span>
        </button>
      </div>

      {/* Floating Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full z-40 pb-safe pointer-events-none px-4">
        <div className="pointer-events-auto mx-auto max-w-md mb-2 rounded-full bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_10px_25px_-4px_rgba(37,99,235,0.18),0_4px_10px_-2px_rgba(15,23,42,0.06)] border border-outline-variant/20 px-2 py-1 flex items-center justify-around">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[46px] px-2 py-1 rounded-full transition-all duration-200 active:scale-95 ${
              currentTab === 'home'
                ? 'text-primary bg-primary-fixed/60 font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">storefront</span>
            <span className="text-[11px] font-semibold mt-0.5">Home</span>
          </button>

          <button
            onClick={() => onSelectTab('schemes')}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[46px] px-2 py-1 rounded-full transition-all duration-200 active:scale-95 ${
              currentTab === 'schemes'
                ? 'text-primary bg-primary-fixed/60 font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
            <span className="text-[11px] font-semibold mt-0.5">Schemes</span>
          </button>

          <button
            onClick={() => onSelectTab('payments')}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[46px] px-2 py-1 rounded-full transition-all duration-200 active:scale-95 ${
              currentTab === 'payments'
                ? 'text-primary bg-primary-fixed/60 font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">credit_card</span>
            <span className="text-[11px] font-semibold mt-0.5">Ledger</span>
          </button>

          <button
            onClick={() => onSelectTab('account')}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[46px] px-2 py-1 rounded-full transition-all duration-200 active:scale-95 ${
              currentTab === 'account'
                ? 'text-primary bg-primary-fixed/60 font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">person</span>
            <span className="text-[11px] font-semibold mt-0.5">Account</span>
          </button>
        </div>
      </nav>
    </>
  );
};
