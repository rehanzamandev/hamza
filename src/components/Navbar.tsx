import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Menu, 
  X, 
  Sparkles,
  Flame,
  Truck
} from 'lucide-react';

interface NavbarProps {
  onOpenAdmin: () => void;
  onOpenTrackOrder: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onNavigatePromo: () => void;
  onNavigateAll: () => void;
  onNavigateContact: () => void;
  showWishlistOnly: boolean;
  onToggleWishlistFilter: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAdmin,
  onOpenTrackOrder,
  searchQuery,
  onSearchChange,
  onNavigatePromo,
  onNavigateAll,
  onNavigateContact,
  showWishlistOnly,
  onToggleWishlistFilter
}) => {
  const { cartCount, cartSubtotal, setIsCartOpen, wishlist } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm transition-all">
      {/* Top promotional announcement ticker */}
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white text-xs font-semibold py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-bold animate-pulse">
              HOT SALE
            </span>
            <span>
              🔥 Up to 50% OFF! Special Punjab Promo & Free Delivery on Orders Over Rs. 3,000! 🚚
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[11px] shrink-0 font-medium">
            <span className="flex items-center gap-1 opacity-95">
              <MapPin className="w-3.5 h-3.5 text-amber-200" />
              Faqirwali 124, Punjab
            </span>
            <a 
              href="tel:+923281509141" 
              className="flex items-center gap-1 hover:text-amber-200 transition-colors bg-white/10 px-2 py-0.5 rounded"
            >
              <Phone className="w-3.5 h-3.5 text-amber-200" />
              +92 328 1509141
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Brand Logo */}
          <button 
            onClick={onNavigateAll}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 animate-spin-slow text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-rose-600 transition-colors">
                  Rehan Wining
                </span>
                <span className="text-xl sm:text-2xl font-black text-rose-500">
                  Toys
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 flex items-center gap-1">
                <span>📍 Faqirwali 124, Punjab</span>
                <span className="hidden sm:inline text-amber-600">• Best Prices</span>
              </p>
            </div>
          </button>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search toys, RC cars, dollhouses, robots..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-full bg-slate-100/80 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>

          {/* Actions & Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Promo Offers Quick Button */}
            <button
              onClick={onNavigatePromo}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition-colors shadow-xs"
            >
              <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Offers & Deals</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onToggleWishlistFilter}
              className={`p-2 sm:px-3 sm:py-2 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showWishlistOnly 
                  ? 'bg-rose-500 text-white border-rose-500' 
                  : 'bg-white hover:bg-rose-50 text-slate-700 border-slate-200'
              }`}
              title="My Wishlist"
            >
              <Heart className={`w-4 h-4 ${showWishlistOnly || wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-600'} ${showWishlistOnly ? '!fill-white !text-white' : ''}`} />
              <span className="hidden sm:inline">Wishlist</span>
              {wishlist.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${showWishlistOnly ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'}`}>
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white px-3 sm:px-4 py-2 rounded-full shadow-md hover:from-amber-600 hover:to-rose-600 transition-all font-bold text-xs sm:text-sm cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-slate-900 text-white font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
              {cartSubtotal > 0 && (
                <span className="hidden md:inline font-mono text-xs bg-black/20 px-2 py-0.5 rounded-full">
                  Rs. {cartSubtotal.toLocaleString()}
                </span>
              )}
            </button>

            {/* Admin Shield Icon */}
            <button
              onClick={onOpenAdmin}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors cursor-pointer"
              title="Admin Portal"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-2.5 md:hidden relative">
          <input
            type="text"
            placeholder="Search all toys & models..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Bar (Desktop) */}
      <nav className="hidden md:block bg-slate-50/80 border-t border-slate-100 text-xs font-semibold text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between py-2">
          <div className="flex items-center gap-6">
            <button
              onClick={onNavigatePromo}
              className="flex items-center gap-1.5 text-rose-600 font-bold hover:text-rose-700 transition-colors"
            >
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              <span>Special Discounts & Offers</span>
              <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.2 rounded-full">
                SAVE 30%+
              </span>
            </button>

            <button
              onClick={onNavigateAll}
              className="hover:text-slate-900 transition-colors"
            >
              All Toys Collection
            </button>

            <button
              onClick={onOpenTrackOrder}
              className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-indigo-500" />
              Track Your Order
            </button>

            <button
              onClick={onNavigateContact}
              className="hover:text-slate-900 transition-colors"
            >
              Store Location & Contact
            </button>
          </div>

          <div className="text-slate-500 text-[11px] flex items-center gap-3">
            <span>⚡ Same-day dispatch across Punjab</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">WhatsApp Booking: 0328-1509141</span>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => {
              onNavigatePromo();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-sm"
          >
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 fill-rose-500 text-rose-500" />
              Discounts & Special Offers
            </span>
            <span className="text-xs bg-rose-200 px-2 py-0.5 rounded-full font-bold">SALE</span>
          </button>

          <button
            onClick={() => {
              onNavigateAll();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-2.5 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50"
          >
            All Toys Collection
          </button>

          <button
            onClick={() => {
              onOpenTrackOrder();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 p-2.5 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50"
          >
            <Truck className="w-4 h-4 text-indigo-500" />
            Track Order Status
          </button>

          <button
            onClick={() => {
              onNavigateContact();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 p-2.5 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50"
          >
            <MapPin className="w-4 h-4 text-amber-500" />
            Store Location (Faqirwali 124) & Phone
          </button>

          <button
            onClick={() => {
              onOpenAdmin();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 p-2.5 rounded-xl text-indigo-600 bg-indigo-50 font-semibold text-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            Admin Dashboard Portal
          </button>
        </div>
      )}
    </header>
  );
};
