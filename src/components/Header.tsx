import React, { useState } from 'react';
import { STORE_HUBS } from '../data/mockData';

interface HeaderProps {
  currentHub: string;
  onSelectHub: (hub: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAccount: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenPrototypes: () => void;
  unreadNotifications: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentHub,
  onSelectHub,
  cartCount,
  onOpenCart,
  onOpenAccount,
  onOpenSearch,
  onOpenNotifications,
  onOpenPrototypes,
  unreadNotifications,
}) => {
  const [hubDropdownOpen, setHubDropdownOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-40 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-4xl mx-auto">
        {/* Brand & Store Hub */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center shadow-md shadow-primary/20 text-on-primary shrink-0">
            <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">VoltMart</span>
              <span className="text-xs text-on-surface-variant font-body-sm leading-none">•</span>
              <span className="font-label-sm text-label-sm text-secondary font-bold">0% EMI</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setHubDropdownOpen(!hubDropdownOpen)}
                className="flex items-center gap-0.5 text-left text-xs font-semibold text-on-surface hover:text-primary transition-colors focus:outline-none max-w-[170px] sm:max-w-xs"
              >
                <span className="truncate">{currentHub}</span>
                <span className="material-symbols-outlined text-[16px] text-primary shrink-0">
                  {hubDropdownOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
                </span>
              </button>

              {hubDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Select Nearest VoltMart Hub
                  </div>
                  {STORE_HUBS.map((hub) => (
                    <button
                      key={hub}
                      onClick={() => {
                        onSelectHub(hub);
                        setHubDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-container transition-colors ${
                        currentHub === hub ? 'font-bold text-primary bg-primary-fixed/40' : 'text-on-surface'
                      }`}
                    >
                      <span>{hub}</span>
                      {currentHub === hub && (
                        <span className="material-symbols-outlined text-sm text-primary">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action icons: Prototypes Directory, Search, Cart, Notifications, Account */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onOpenPrototypes}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold shadow-sm active:scale-95 transition-all hover:bg-secondary-fixed-dim"
            title="Explore all 16+ implemented prototype screens"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">widgets</span>
            <span className="hidden sm:inline">16 Screens</span>
          </button>

          <button
            type="button"
            aria-label="Search"
            onClick={onOpenSearch}
            className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          <button
            aria-label="Cart"
            onClick={onOpenCart}
            className="relative w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-secondary-container text-on-secondary font-label-sm text-[10px] font-bold leading-none flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          <button
            aria-label="Notifications"
            onClick={onOpenNotifications}
            className="relative w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary-container ring-2 ring-surface"></span>
            )}
          </button>

          <button
            aria-label="Account Profile"
            onClick={onOpenAccount}
            className="w-9 h-9 flex items-center justify-center rounded-full p-0.5 focus:outline-none active:scale-95 transition-transform"
          >
            <img
              alt="Profile"
              className="w-7 h-7 rounded-full object-cover ring-2 ring-primary-fixed"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwuTddeus_W4dNvVH5Ncv3NblDJ52Cqa9aBSEdyS9OH-_FZCSNfyHOBlVOKodxEBb8zNmVsV24siXXyMideH8hvFAQ27nOMPjRJheuADpc05YB4D1UzBC9xN95MVK9iaGSlkE0SymVnAX0MsUqEUttsX3CEnq6MH-0nQRMjUPBKHIZXyyKHf_MWUGwW4-dCFquC3sGTeMs76yIqzVCXMOCMmLYtq5o5pHIzrFQUZo0p7TzbVAOONPA"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
