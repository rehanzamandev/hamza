import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { api } from '../services/api';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  discountAmount: number;
  shippingFee: number;
  cartTotal: number;
  couponCode: string;
  couponMessage: string;
  isCartOpen: boolean;
  wishlist: string[];
  toasts: Toast[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'rwt_cart_v1';
const WISHLIST_STORAGE_KEY = 'rwt_wishlist_v1';
const FREE_SHIPPING_THRESHOLD = 3000;
const STANDARD_SHIPPING_FEE = 200;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [items]);

  // Persist wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error saving wishlist to localStorage', e);
    }
  }, [wishlist]);

  // Calculate cart counts and totals
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Recalculate coupon if subtotal changes
  useEffect(() => {
    if (couponCode && cartSubtotal > 0) {
      api.validateCoupon(couponCode, cartSubtotal).then(res => {
        if (res.valid) {
          setDiscountAmount(res.discount);
          setCouponMessage(res.message);
        } else {
          setDiscountAmount(0);
          setCouponMessage(res.message);
        }
      });
    } else if (cartSubtotal === 0) {
      setDiscountAmount(0);
      setCouponMessage('');
    }
  }, [cartSubtotal, couponCode]);

  const shippingFee = cartSubtotal === 0 ? 0 : ((cartSubtotal - discountAmount) >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE);
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToCart = (product: Product, quantity = 1) => {
    if (product.stockQuantity <= 0) {
      showToast(`${product.name} is currently out of stock!`, 'error');
      return;
    }

    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stockQuantity) {
          showToast(`Only ${product.stockQuantity} items in stock!`, 'error');
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQty }
            : item
        );
      } else {
        return [...prev, { product, quantity: Math.min(quantity, product.stockQuantity) }];
      }
    });

    showToast(`Added "${product.name}" to your cart! 🛍️`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => {
      const item = prev.find(i => i.product.id === productId);
      if (item) {
        showToast(`Removed "${item.product.name}" from cart`, 'info');
      }
      return prev.filter(i => i.product.id !== productId);
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setItems(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stockQuantity) {
              showToast(`Cannot exceed available stock of ${item.product.stockQuantity}`, 'error');
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    setDiscountAmount(0);
    setCouponMessage('');
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      showToast('Please enter a coupon code', 'error');
      return false;
    }
    try {
      const res = await api.validateCoupon(code, cartSubtotal);
      if (res.valid) {
        setCouponCode(code.toUpperCase());
        setDiscountAmount(res.discount);
        setCouponMessage(res.message);
        showToast(`Coupon "${code.toUpperCase()}" applied successfully! 🎉`, 'success');
        return true;
      } else {
        setCouponMessage(res.message);
        showToast(res.message, 'error');
        return false;
      }
    } catch {
      showToast('Failed to validate coupon code', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountAmount(0);
    setCouponMessage('');
    showToast('Coupon removed', 'info');
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showToast('Removed from wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Added to your wishlist! ❤️', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        cartSubtotal,
        discountAmount,
        shippingFee,
        cartTotal,
        couponCode,
        couponMessage,
        isCartOpen,
        wishlist,
        toasts,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setIsCartOpen,
        applyCoupon,
        removeCoupon,
        toggleWishlist,
        isInWishlist,
        showToast,
        removeToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
