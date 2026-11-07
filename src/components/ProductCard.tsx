import React from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  MessageSquare, 
  Eye, 
  Flame, 
  Percent,
  Check
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const isWishlisted = wishlist.includes(product.id);

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = `Assalam o Alaikum Rehan bhai, I want to order this toy:\n*${product.name}*\nPrice: Rs. ${product.price.toLocaleString()}\nSKU: ${product.sku}\nPlease confirm availability and delivery charges for my address!`;
    const url = `https://wa.me/923281509141?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div 
      onClick={() => onOpenDetail(product)}
      className="group bg-white rounded-3xl border border-slate-200 hover:border-amber-400 p-3 sm:p-4 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
    >
      {/* Top Badges & Wishlist */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-3">
        {/* Badges container */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {product.discountPercent > 0 && (
            <span className="bg-rose-600 text-white font-black text-[11px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
              <Percent className="w-3 h-3" />
              {product.discountPercent}% OFF
            </span>
          )}
          {product.isFlashSale && (
            <span className="bg-slate-950 text-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
              DEAL
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-indigo-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isWishlisted 
              ? 'bg-rose-500 text-white shadow-md' 
              : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500 shadow-xs'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Product Image */}
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Hover Quick View overlay */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white text-slate-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> View Details
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="space-y-1.5 flex-1">
        {/* Category & Age Group */}
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>{product.category.replace('-', ' ')}</span>
          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-semibold normal-case">
            {product.ageGroup}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-rose-600 transition-colors">
          {product.name}
        </h3>

        {/* Urdu subtitle if available */}
        {product.urduName && (
          <p className="text-xs text-slate-500 font-urdu line-clamp-1 text-right">
            {product.urduName}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <div className="flex items-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
          </div>
          <span className="text-xs font-black text-slate-800">{product.rating}</span>
          <span className="text-[11px] text-slate-400 font-medium">({product.reviewsCount})</span>
        </div>

        {/* Price Row */}
        <div className="pt-1 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-black text-slate-900">
            Rs. {product.price.toLocaleString()}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-slate-400 line-through">
              Rs. {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock status indicator */}
        <div className="text-[11px] font-medium pt-0.5 flex items-center gap-1">
          {product.stockQuantity > 5 ? (
            <span className="text-emerald-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> In Stock ({product.stockQuantity})
            </span>
          ) : product.stockQuantity > 0 ? (
            <span className="text-rose-600 font-bold">
              Only {product.stockQuantity} left!
            </span>
          ) : (
            <span className="text-slate-400 font-bold">Out of Stock</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3.5 grid grid-cols-2 gap-2 mt-auto">
        <button
          onClick={handleAddToCart}
          disabled={product.stockQuantity <= 0}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            product.stockQuantity <= 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>

        <button
          onClick={handleWhatsAppOrder}
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          title="Direct WhatsApp Order"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
