import React from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Flame, Sparkles, ShoppingBag, Eye, Zap, MessageSquare, Percent } from 'lucide-react';

interface PromoOffersSectionProps {
  products: Product[];
  onOpenProduct: (product: Product) => void;
}

export const PromoOffersSection: React.FC<PromoOffersSectionProps> = ({ products, onOpenProduct }) => {
  const { addToCart } = useCart();

  // Filter products with significant discounts or marked as flash sale
  const discountProducts = products
    .filter(p => p.discountPercent >= 25 || p.isFlashSale)
    .slice(0, 4);

  const handleWhatsAppBuy = (product: Product) => {
    const msg = `Assalam o Alaikum Rehan bhai, I want to order this discount offer item:\n*${product.name}*\nSale Price: Rs. ${product.price.toLocaleString()} (Original: Rs. ${product.originalPrice.toLocaleString()} - Save ${product.discountPercent}%)\nSKU: ${product.sku}\nPlease confirm stock and delivery to my city!`;
    const url = `https://wa.me/923281509141?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="promo-section" className="max-w-7xl mx-auto px-4 sm:px-6 my-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 fill-rose-600 text-rose-600 animate-bounce" />
            <span>DISCOUNTS & SPECIAL OFFERS HUB</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Mega Sale & Flash Discounts
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Exclusive price drops on top-rated RC toys, STEM kits, and dollhouses. Limited stock available!
          </p>
        </div>

        {/* Promo stats badges */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-xl border border-amber-200">
            ⚡ Up to 50% OFF
          </span>
          <span className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200">
            🚚 Free Punjab Delivery 3k+
          </span>
        </div>
      </div>

      {/* Featured Discount Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {discountProducts.map(product => {
          const savings = product.originalPrice - product.price;

          return (
            <div
              key={product.id}
              className="group bg-white rounded-3xl border-2 border-rose-100 hover:border-rose-400 p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Discount Tag */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                <span className="bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  {product.discountPercent}% OFF
                </span>
                {product.isFlashSale && (
                  <span className="bg-slate-900 text-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                    ⚡ FLASH DEAL
                  </span>
                )}
              </div>

              {/* Image Container with Hover Zoom */}
              <div 
                onClick={() => onOpenProduct(product)}
                className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 cursor-pointer mb-3"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenProduct(product);
                  }}
                  className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-bold"
                >
                  <Eye className="w-4 h-4" /> Quick View
                </button>
              </div>

              {/* Content */}
              <div className="space-y-2 flex-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {product.category.replace('-', ' ')}
                </div>

                <h3 
                  onClick={() => onOpenProduct(product)}
                  className="font-bold text-slate-900 text-sm line-clamp-2 hover:text-rose-600 transition-colors cursor-pointer"
                  title={product.name}
                >
                  {product.name}
                </h3>

                {/* Price Matrix */}
                <div className="pt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-rose-600">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      Rs. {product.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
                    Save Rs. {savings.toLocaleString()}!
                  </div>
                </div>

                {/* Stock meter */}
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                    <span>Available Stock:</span>
                    <span className="font-bold text-rose-600">{product.stockQuantity} left</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(15, (product.stockQuantity / 30) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="pt-4 grid grid-cols-2 gap-2 mt-auto">
                <button
                  onClick={() => addToCart(product, 1)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add Cart</span>
                </button>

                <button
                  onClick={() => handleWhatsAppBuy(product)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  title="Direct WhatsApp Order"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Special Bulk & Wholesale Offer Banner */}
      <div className="mt-8 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-6 rounded-3xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <h4 className="font-black text-lg text-slate-950">
              Wholesale & Birthday Gift Packages Available!
            </h4>
            <p className="text-xs sm:text-sm text-slate-900 font-medium">
              School events, bulk party return gifts, or retail reseller orders: Get extra special carton discounts directly from Rehan.
            </p>
          </div>
        </div>
        <a
          href="https://wa.me/923281509141?text=Assalam%20o%20Alaikum%20Rehan%20bhai%2C%20I%20want%20wholesale%20rates%20for%20toys%20bulk%20order."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-950 hover:bg-slate-900 text-amber-300 font-extrabold px-5 py-3 rounded-2xl text-xs sm:text-sm shrink-0 flex items-center gap-2 shadow-md"
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>Inquire Wholesale Rates</span>
        </a>
      </div>
    </section>
  );
};
