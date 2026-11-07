import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Truck, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';

interface CartDrawerProps {
  onProceedCheckout: () => void;
  onExploreToys: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedCheckout, onExploreToys }) => {
  const {
    items,
    cartCount,
    cartSubtotal,
    discountAmount,
    shippingFee,
    cartTotal,
    couponCode,
    couponMessage,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 3000;
  const currentSubtotalAfterDiscount = cartSubtotal - discountAmount;
  const progressToFreeShipping = Math.min(100, (currentSubtotalAfterDiscount / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - currentSubtotalAfterDiscount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    setIsApplying(true);
    await applyCoupon(inputCoupon);
    setIsApplying(false);
    setInputCoupon('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Your Shopping Cart</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {cartCount} {cartCount === 1 ? 'toy item' : 'toy items'} selected
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress bar */}
          {items.length > 0 && (
            <div className="bg-amber-50/80 px-4 py-2.5 border-b border-amber-100 text-xs">
              <div className="flex items-center justify-between font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-amber-900">
                  <Truck className="w-4 h-4 text-amber-600" />
                  {remainingForFreeShipping === 0
                    ? '🎉 You unlocked FREE Delivery across Punjab!'
                    : `Add Rs. ${remainingForFreeShipping.toLocaleString()} more for FREE Delivery!`}
                </span>
                <span className="text-[10px] text-amber-700 font-mono">
                  {Math.round(progressToFreeShipping)}%
                </span>
              </div>
              <div className="w-full bg-amber-200/70 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}

          {/* Body: Items or Empty Message */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-400">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">Your Cart is Empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Looks like you haven&apos;t added any toys yet. Check out our special discounts and offers section!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onExploreToys();
                  }}
                  className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Explore Discount Toys</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(item => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 items-center justify-between"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate" title={item.product.name}>
                        {item.product.name}
                      </h4>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xs font-black text-rose-600">
                          Rs. {item.product.price.toLocaleString()}
                        </span>
                        {item.product.originalPrice > item.product.price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            Rs. {item.product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="p-1 text-slate-500 hover:bg-slate-100 rounded-l-lg cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="p-1 text-slate-500 hover:bg-slate-100 rounded-r-lg cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-[11px] font-bold text-slate-600">
                          = Rs. {(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white space-y-4">
              
              {/* Coupon input */}
              <div>
                {couponCode ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      Coupon <strong className="font-mono">{couponCode}</strong> applied (-Rs. {discountAmount.toLocaleString()})
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. REHAN10)"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                      className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isApplying ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponMessage && !couponCode && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{couponMessage}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-slate-900">
                    Rs. {cartSubtotal.toLocaleString()}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount Coupon ({couponCode})</span>
                    <span className="font-mono">-Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Punjab Delivery Fee</span>
                  <span className="font-mono font-bold text-slate-900">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 uppercase font-black text-[10px]">FREE</span>
                    ) : (
                      `Rs. ${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline text-sm font-black text-slate-900">
                  <span>Estimated Total</span>
                  <span className="text-lg text-rose-600 font-mono font-black">
                    Rs. {cartTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedCheckout();
                }}
                className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
              >
                <span>Proceed to WhatsApp Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Orders confirmed directly by Rehan Wining Toys Faqirwali</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
