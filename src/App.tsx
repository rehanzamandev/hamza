import React, { useState, useEffect, useCallback } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { api } from './services/api';
import { Product, Category } from './types';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { PromoOffersSection } from './components/PromoOffersSection';
import { CategoryBar } from './components/CategoryBar';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ContactSection } from './components/ContactSection';
import { ToastContainer } from './components/ToastContainer';
import { FloatingWidgets } from './components/FloatingWidgets';
import { Footer } from './components/Footer';

function MainStore() {
  const { wishlist } = useCart();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [offerFilter, setOfferFilter] = useState<boolean>(false);
  const [flashSaleFilter, setFlashSaleFilter] = useState<boolean>(false);
  const [inStockFilter, setInStockFilter] = useState<boolean>(false);
  const [showWishlistOnly, setShowWishlistOnly] = useState<boolean>(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState<boolean>(false);

  // Fetch products with backend filters
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getProducts({
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sort: sortBy,
        offerOnly: offerFilter,
        flashSaleOnly: flashSaleFilter
      });
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy, offerFilter, flashSaleFilter]);

  // Initial categories fetch
  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Reload products whenever filters change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Client-side wishlist & in-stock post-filters
  let displayProducts = [...products];
  if (showWishlistOnly) {
    displayProducts = displayProducts.filter(p => wishlist.includes(p.id));
  }
  if (inStockFilter) {
    displayProducts = displayProducts.filter(p => p.stockQuantity > 0);
  }

  // Smooth scroll helpers
  const scrollToPromo = () => {
    setShowWishlistOnly(false);
    const el = document.getElementById('promo-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAllToys = () => {
    setShowWishlistOnly(false);
    setSelectedCategory('all');
    setOfferFilter(false);
    const el = document.getElementById('all-toys');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = () => {
    const el = document.getElementById('contact-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('featured');
    setOfferFilter(false);
    setFlashSaleFilter(false);
    setInStockFilter(false);
    setShowWishlistOnly(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Main Navigation Bar */}
      <Navbar
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onNavigatePromo={scrollToPromo}
        onNavigateAll={scrollToAllToys}
        onNavigateContact={scrollToContact}
        showWishlistOnly={showWishlistOnly}
        onToggleWishlistFilter={() => setShowWishlistOnly(!showWishlistOnly)}
      />

      <main className="flex-1">
        {/* Wishlist Active Notification Banner */}
        {showWishlistOnly && (
          <div className="bg-rose-50 border-b border-rose-200 py-3 px-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-bold text-rose-700">
              <span>Showing your saved wishlist items ({displayProducts.length})</span>
              <button
                onClick={() => setShowWishlistOnly(false)}
                className="underline hover:text-rose-900 cursor-pointer"
              >
                Back to All Toys
              </button>
            </div>
          </div>
        )}

        {/* Hero Banner with flash timer & coupons */}
        {!showWishlistOnly && !searchQuery && (
          <HeroBanner
            onShopDeals={scrollToPromo}
            onExploreAll={scrollToAllToys}
          />
        )}

        {/* Dedicated Discounts & Offers Hub Section */}
        {!showWishlistOnly && !searchQuery && (
          <PromoOffersSection
            products={products}
            onOpenProduct={(prod) => setSelectedProduct(prod)}
          />
        )}

        {/* Categories Bar */}
        <CategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            setShowWishlistOnly(false);
          }}
        />

        {/* Product Catalog Grid */}
        <ProductGrid
          products={displayProducts}
          isLoading={isLoading}
          sortBy={sortBy}
          onSortChange={setSortBy}
          offerFilter={offerFilter}
          onToggleOfferFilter={() => setOfferFilter(!offerFilter)}
          flashSaleFilter={flashSaleFilter}
          onToggleFlashSaleFilter={() => setFlashSaleFilter(!flashSaleFilter)}
          inStockFilter={inStockFilter}
          onToggleInStockFilter={() => setInStockFilter(!inStockFilter)}
          onOpenDetail={(prod) => setSelectedProduct(prod)}
          onResetFilters={handleResetFilters}
        />

        {/* Store Location & Contact Form Section */}
        <ContactSection />
      </main>

      {/* Floating Action Buttons (WhatsApp, Call, Top) */}
      <FloatingWidgets />

      {/* Footer */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
        onNavigatePromo={scrollToPromo}
        onNavigateAll={scrollToAllToys}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        onProceedCheckout={() => setIsCheckoutOpen(true)}
        onExploreToys={scrollToPromo}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        allProducts={products}
        onSelectRelated={(related) => setSelectedProduct(related)}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
      />

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onRefreshProducts={loadProducts}
      />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <MainStore />
    </CartProvider>
  );
}
