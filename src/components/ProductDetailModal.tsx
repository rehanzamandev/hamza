import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { 
  X, 
  Star, 
  Heart, 
  ShoppingBag, 
  MessageSquare, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Check, 
  Plus, 
  Minus,
  Send
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  allProducts: Product[];
  onSelectRelated: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  allProducts,
  onSelectRelated
}) => {
  const { addToCart, wishlist, toggleWishlist, showToast } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Review Form state
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setQuantity(1);
      api.getReviews(product.id).then(setReviews);
    }
  }, [product]);

  if (!product) return null;

  const isWishlisted = wishlist.includes(product.id);
  const savings = product.originalPrice - product.price;

  // Related products in same category
  const related = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleWhatsAppOrder = () => {
    const total = product.price * quantity;
    const msg = `Assalam o Alaikum Rehan bhai, I want to order this toy from Rehan Wining Toys:\n*${product.name}*\nQuantity: ${quantity}\nPrice: Rs. ${product.price.toLocaleString()} each\nTotal: Rs. ${total.toLocaleString()}\nSKU: ${product.sku}\nPlease confirm stock and delivery to my location!`;
    const url = `https://wa.me/923281509141?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) {
      showToast('Please enter your name and review comment', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const newRev = await api.addReview({
        productId: product.id,
        authorName,
        rating,
        comment
      });
      setReviews(prev => [newRev, ...prev]);
      setAuthorName('');
      setComment('');
      showToast('Thank you! Your review has been published. ⭐', 'success');
    } catch {
      showToast('Failed to post review. Please try again.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          {/* Images Section */}
          <div className="p-6 bg-slate-50 flex flex-col justify-between">
            <div>
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-200/60 mb-3">
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discountPercent > 0 && (
                  <span className="absolute top-3 left-3 bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx ? 'border-rose-500 scale-105 shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Perks Strip */}
            <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-600 font-medium">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-rose-500" />
                <span>Punjab Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Quality Checked</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="w-4 h-4 text-amber-500" />
                <span>Fast WhatsApp Help</span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Wishlist */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                  {product.category.replace('-', ' ')}
                </span>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2 rounded-full border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    isWishlisted ? 'bg-rose-50 border-rose-300 text-rose-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span className="text-[11px]">{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                </button>
              </div>

              {/* Title & SKU */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 leading-snug">
                {product.name}
              </h1>
              {product.urduName && (
                <p className="text-sm text-slate-500 font-urdu mt-1 text-right">
                  {product.urduName}
                </p>
              )}
              <div className="text-xs text-slate-400 font-mono mt-1">
                SKU: {product.sku} • Age: <strong className="text-slate-700">{product.ageGroup}</strong>
              </div>

              {/* Ratings */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-black text-slate-800">{product.rating}</span>
                <span className="text-xs text-slate-400">({reviews.length} customer reviews)</span>
              </div>

              {/* Price Row */}
              <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-slate-400 line-through">
                        Rs. {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="text-xs font-bold text-rose-600 mt-0.5">
                      You Save Rs. {savings.toLocaleString()} ({product.discountPercent}% OFF)
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    product.stockQuantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity})` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Tabs: Details vs Reviews */}
              <div className="mt-6 border-b border-slate-200 flex gap-4 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'details' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Features & Details
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'reviews' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Customer Reviews ({reviews.length})
                </button>
              </div>

              {/* Tab 1: Details */}
              {activeTab === 'details' ? (
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p className="leading-relaxed">{product.description}</p>
                  {product.features && product.features.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                        Key Features:
                      </h4>
                      <ul className="space-y-1">
                        {product.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                /* Tab 2: Reviews */
                <div className="mt-4 space-y-4">
                  {/* Reviews List */}
                  <div className="max-h-48 overflow-y-auto space-y-3 pr-2">
                    {reviews.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No reviews yet. Be the first to review!</p>
                    ) : (
                      reviews.map(rev => (
                        <div key={rev.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{rev.authorName}</span>
                            <span className="text-[10px] text-slate-400">{rev.date}</span>
                          </div>
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                          <p className="text-slate-600">{rev.comment}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Review Form */}
                  <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                    <span className="text-xs font-bold text-slate-800 block">Write a Review</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Your name & city"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="bg-white p-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                        required
                      />
                      <div className="flex items-center gap-1 bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[11px] text-slate-400 mr-1">Rating:</span>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <Star className={`w-3.5 h-3.5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      placeholder="Share your experience with this toy..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                      className="w-full bg-white p-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isSubmittingReview ? 'Submitting...' : 'Post Review'}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              {/* Quantity selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-slate-200 rounded-l-xl text-slate-600 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold font-mono text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="p-2 hover:bg-slate-200 rounded-r-xl text-slate-600 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity <= 0}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Order on WhatsApp</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Related Toys Grid */}
        {related.length > 0 && (
          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
              Similar Toys You May Like
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {related.map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelectRelated(item)}
                  className="bg-white p-2.5 rounded-2xl border border-slate-200 hover:border-rose-400 transition-all cursor-pointer flex items-center gap-2.5"
                >
                  <img src={item.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs font-black text-rose-600">Rs. {item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
