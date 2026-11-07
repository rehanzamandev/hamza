import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { 
  ArrowUpDown, 
  Filter, 
  SearchX, 
  Sparkles, 
  Flame, 
  Percent,
  CheckCircle2
} from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  sortBy: string;
  onSortChange: (sort: string) => void;
  offerFilter: boolean;
  onToggleOfferFilter: () => void;
  flashSaleFilter: boolean;
  onToggleFlashSaleFilter: () => void;
  inStockFilter: boolean;
  onToggleInStockFilter: () => void;
  onOpenDetail: (product: Product) => void;
  onResetFilters: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  sortBy,
  onSortChange,
  offerFilter,
  onToggleOfferFilter,
  flashSaleFilter,
  onToggleFlashSaleFilter,
  inStockFilter,
  onToggleInStockFilter,
  onOpenDetail,
  onResetFilters
}) => {
  return (
    <section id="all-toys" className="max-w-7xl mx-auto px-4 sm:px-6 my-8">
      {/* Grid Filter and Sorting Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>

          <button
            onClick={onToggleOfferFilter}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              offerFilter
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Percent className="w-3 h-3" />
            <span>Discounts Only</span>
          </button>

          <button
            onClick={onToggleFlashSaleFilter}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              flashSaleFilter
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>Flash Deals</span>
          </button>

          <button
            onClick={onToggleInStockFilter}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              inStockFilter
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>In Stock Only</span>
          </button>
        </div>

        {/* Right: Product Count & Sort Selector */}
        <div className="flex items-center justify-between md:justify-end gap-3">
          <span className="text-xs text-slate-500 font-semibold">
            Showing <strong className="text-slate-900">{products.length}</strong> toys
          </span>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured & Best Deals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Highest Discount %</option>
              <option value="rating">Top Customer Rated</option>
              <option value="newest">New Arrivals First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold">Loading toys catalogue...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">No toys found matching criteria</h3>
          <p className="text-sm text-slate-500">
            Try adjusting your search keyword or clearing the applied category and discount filters.
          </p>
          <button
            onClick={onResetFilters}
            className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      )}
    </section>
  );
};
