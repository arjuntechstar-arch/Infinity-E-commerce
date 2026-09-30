import React, { useState, useMemo } from 'react';
import { Product } from '../types';

interface SearchViewProps {
  products: Product[];
  initialCategory?: string;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, plan: 'full' | 'scheme') => void;
  onClose: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  products,
  initialCategory,
  onSelectProduct,
  onAddToCart,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [onlySchemeEligible, setOnlySchemeEligible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const brands = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.brand)));
    return ['all', ...list];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesScheme = !onlySchemeEligible || p.schemeEligible;
        const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;
        return matchesSearch && matchesCategory && matchesScheme && matchesBrand;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [products, searchTerm, selectedCategory, onlySchemeEligible, selectedBrand, sortBy]);

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (onlySchemeEligible ? 1 : 0) +
    (selectedBrand !== 'all' ? 1 : 0);

  return (
    <div className="flex flex-col w-full min-h-screen pb-24 px-4 pt-1 bg-surface">
      {/* Top Search Input with Close / Back Button */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:text-primary transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>

        <div className="relative flex-1 flex items-center bg-surface-container-high rounded-full shadow-sm focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary/20">
          <span className="material-symbols-outlined text-[20px] text-primary ml-3 mr-2 shrink-0">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search electronics, brands, models..."
            className="w-full bg-transparent py-2.5 text-xs sm:text-sm text-on-surface focus:outline-none placeholder:text-outline"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1.5 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
          <button className="p-1.5 mr-2 text-primary">
            <span className="material-symbols-outlined text-[20px]">mic</span>
          </button>
        </div>
      </div>

      {/* Horizontally Scrollable Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 mb-3">
        <button
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 shadow-sm transition-all ${
            showFilterDrawer
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-secondary-container text-white text-[10px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setOnlySchemeEligible(!onlySchemeEligible)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 shadow-sm transition-all ${
            onlySchemeEligible
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">
            {onlySchemeEligible ? 'check' : 'savings'}
          </span>
          <span>VoltFlex 10+1</span>
        </button>

        {['all', 'smartphones', 'tv-audio', 'appliances', 'laptops'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 shadow-sm transition-all ${
              selectedCategory === cat
                ? 'bg-primary-container text-on-primary font-bold'
                : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30'
            }`}
          >
            {cat === 'all'
              ? 'All Categories'
              : cat === 'tv-audio'
              ? 'TV & Audio'
              : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Expanded Filter Panel */}
      {showFilterDrawer && (
        <div className="bg-surface-container-lowest rounded-2xl p-4 mb-4 shadow-md border border-outline-variant/30 text-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-outline-variant/20">
            <span className="font-bold text-sm text-on-surface">Filter & Sort Options</span>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedBrand('all');
                setOnlySchemeEligible(false);
                setSortBy('featured');
              }}
              className="text-primary font-bold hover:underline"
            >
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-outline uppercase mb-1.5">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-surface-container-low py-2 px-3 rounded-xl text-on-surface font-semibold focus:outline-none"
              >
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b === 'all' ? 'All Brands' : b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-outline uppercase mb-1.5">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-surface-container-low py-2 px-3 rounded-xl text-on-surface font-semibold focus:outline-none"
              >
                <option value="featured">Featured Picks</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Scheme Savings Banner Callout */}
      <div className="rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary p-3 shadow-md flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-surface-container-lowest/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px] text-tertiary-fixed">savings</span>
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-tertiary-fixed block leading-none">
              VoltFlex Savings Guarantee
            </span>
            <p className="text-[11px] text-white/90 mt-0.5">
              Select any item below to view easy 0% monthly installment breakdowns.
            </p>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-on-surface-variant font-medium mb-3">
        Showing <strong>{filteredProducts.length}</strong> available devices & appliances
      </div>

      {/* Product Results Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-8 text-center border border-outline-variant/30">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
          <h4 className="text-base font-bold text-on-surface">No products match your search</h4>
          <p className="text-xs text-on-surface-variant mt-1 mb-4">
            Try adjusting your search terms or clearing active filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedBrand('all');
              setOnlySchemeEligible(false);
            }}
            className="px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => onSelectProduct(prod)}
              className="rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
            >
              <div>
                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-surface-container-low mb-2.5 flex items-center justify-center">
                  <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover" />
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
                </div>

                <div className="flex items-center justify-between text-[11px] text-outline mb-1">
                  <span className="uppercase font-bold tracking-wider">{prod.brand}</span>
                  <span className="text-tertiary font-semibold">{prod.hub}</span>
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
                    <span>Buy</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
