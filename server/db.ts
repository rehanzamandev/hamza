import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Product,
  Category,
  PromoCode,
  Order,
  Review,
  ContactMessage,
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_PROMOS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS
} from './seedData.ts';

interface StoreSchema {
  products: Product[];
  categories: Category[];
  promos: PromoCode[];
  orders: Order[];
  reviews: Review[];
  messages: ContactMessage[];
  siteSettings: {
    storeName: string;
    tagline: string;
    phone: string;
    whatsapp: string;
    location: string;
    city: string;
    province: string;
    freeShippingThreshold: number;
    standardShippingFee: number;
    bannerNotice: string;
    flashSaleActive: boolean;
    flashSaleEndsAt: string;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_SETTINGS = {
  storeName: 'Rehan Wining Toys',
  tagline: 'Punjab\'s Premier Toy Store - Wholesale & Retail',
  phone: '+923281509141',
  whatsapp: '+923281509141',
  location: 'Punjab, Faqirwali 124, Pakistan',
  city: 'Faqirwali',
  province: 'Punjab',
  freeShippingThreshold: 3000,
  standardShippingFee: 200,
  bannerNotice: '🎉 Mega Discount Festival! Upto 50% OFF on RC Cars, STEM Toys & Dolls! Free delivery on orders over Rs. 3,000 across Punjab! 🚚',
  flashSaleActive: true,
  // 3 days from now
  flashSaleEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
};

// In-memory cache
let inMemoryDb: StoreSchema | null = null;

function loadDatabase(): StoreSchema {
  if (inMemoryDb) return inMemoryDb;

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      inMemoryDb = JSON.parse(raw);
      return inMemoryDb!;
    }
  } catch (err) {
    console.error('Error reading db.json, re-initializing from seeds:', err);
  }

  // Initialize with seed data
  const initialDb: StoreSchema = {
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    promos: INITIAL_PROMOS,
    orders: INITIAL_ORDERS,
    reviews: INITIAL_REVIEWS,
    messages: [],
    siteSettings: DEFAULT_SETTINGS
  };

  saveDatabase(initialDb);
  inMemoryDb = initialDb;
  return inMemoryDb;
}

function saveDatabase(data: StoreSchema) {
  inMemoryDb = data;
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  try {
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving db.json:', err);
    if (fs.existsSync(tempFile)) {
      try { fs.unlinkSync(tempFile); } catch { /* ignore */ }
    }
  }
}

// Active admin sessions in-memory with expiration
const activeAdminTokens = new Set<string>();

export const db = {
  // PRODUCTS
  getProducts(filters?: {
    search?: string;
    category?: string;
    sort?: string;
    offerOnly?: boolean;
    featuredOnly?: boolean;
    flashSaleOnly?: boolean;
  }): Product[] {
    const data = loadDatabase();
    let result = [...data.products];

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) ||
             (p.urduName && p.urduName.includes(q)) ||
             p.category.toLowerCase().includes(q) ||
             p.description.toLowerCase().includes(q) ||
             p.sku.toLowerCase().includes(q)
      );
    }

    if (filters?.category && filters.category !== 'all') {
      result = result.filter(p => p.category === filters.category);
    }

    if (filters?.offerOnly) {
      result = result.filter(p => p.isOffer || (p.discountPercent && p.discountPercent > 0));
    }

    if (filters?.featuredOnly) {
      result = result.filter(p => p.isFeatured);
    }

    if (filters?.flashSaleOnly) {
      result = result.filter(p => p.isFlashSale);
    }

    if (filters?.sort) {
      switch (filters.sort) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'discount':
          result.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'featured':
        default:
          result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }
    }

    return result;
  },

  getProductById(id: string): Product | undefined {
    const data = loadDatabase();
    return data.products.find(p => p.id === id);
  },

  createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Product {
    const data = loadDatabase();
    const newId = `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
      createdAt: new Date().toISOString()
    };
    data.products.unshift(newProduct);
    saveDatabase(data);
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const data = loadDatabase();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    data.products[index] = {
      ...data.products[index],
      ...updates
    };
    saveDatabase(data);
    return data.products[index];
  },

  deleteProduct(id: string): boolean {
    const data = loadDatabase();
    const initialLen = data.products.length;
    data.products = data.products.filter(p => p.id !== id);
    if (data.products.length < initialLen) {
      saveDatabase(data);
      return true;
    }
    return false;
  },

  // CATEGORIES
  getCategories(): Category[] {
    const data = loadDatabase();
    return data.categories;
  },

  createCategory(cat: Category): Category {
    const data = loadDatabase();
    data.categories.push(cat);
    saveDatabase(data);
    return cat;
  },

  // PROMOS
  getPromos(): PromoCode[] {
    const data = loadDatabase();
    return data.promos;
  },

  validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; promo?: PromoCode; message: string } {
    const data = loadDatabase();
    const cleanCode = code.trim().toUpperCase();
    const promo = data.promos.find(p => p.code.toUpperCase() === cleanCode);

    if (!promo) {
      return { valid: false, discount: 0, message: 'Invalid coupon code. Try REHAN10 or SUPERTOY!' };
    }

    if (subtotal < promo.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Coupon requires minimum order of Rs. ${promo.minOrderAmount.toLocaleString()}`
      };
    }

    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = Math.round((subtotal * promo.discountValue) / 100);
    } else {
      discount = Math.min(promo.discountValue, subtotal);
    }

    return {
      valid: true,
      discount,
      promo,
      message: `Coupon applied: Rs. ${discount.toLocaleString()} savings!`
    };
  },

  // ORDERS
  getOrders(): Order[] {
    const data = loadDatabase();
    return [...data.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getOrderById(id: string): Order | undefined {
    const data = loadDatabase();
    return data.orders.find(o => o.id.toLowerCase() === id.toLowerCase());
  },

  createOrder(orderInput: {
    customerName: string;
    customerPhone: string;
    city: string;
    deliveryAddress: string;
    orderNotes?: string;
    items: { productId: string; quantity: number }[];
    couponCode?: string;
  }): { order: Order; whatsappUrl: string } {
    const data = loadDatabase();
    
    // Validate and resolve items
    const resolvedItems: Order['items'] = [];
    let subtotal = 0;

    for (const item of orderInput.items) {
      const prod = data.products.find(p => p.id === item.productId);
      if (prod) {
        const itemTotal = prod.price * item.quantity;
        subtotal += itemTotal;
        resolvedItems.push({
          productId: prod.id,
          name: prod.name,
          price: prod.price,
          quantity: item.quantity,
          image: prod.images[0] || ''
        });

        // Reduce stock safely
        prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
      }
    }

    // Calculate discount
    let discount = 0;
    if (orderInput.couponCode) {
      const validation = this.validateCoupon(orderInput.couponCode, subtotal);
      if (validation.valid) {
        discount = validation.discount;
      }
    }

    const freeThreshold = data.siteSettings.freeShippingThreshold || 3000;
    const shippingFee = (subtotal - discount) >= freeThreshold ? 0 : (data.siteSettings.standardShippingFee || 200);
    const totalAmount = Math.max(0, subtotal - discount + shippingFee);

    // Generate unique order ID
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderId = `RWT-${randomDigits}`;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder: Order = {
      id: orderId,
      orderDate: formattedDate,
      customerName: orderInput.customerName.trim(),
      customerPhone: orderInput.customerPhone.trim(),
      city: orderInput.city.trim(),
      deliveryAddress: orderInput.deliveryAddress.trim(),
      orderNotes: orderInput.orderNotes?.trim() || '',
      items: resolvedItems,
      subtotal,
      discount,
      couponCode: orderInput.couponCode ? orderInput.couponCode.toUpperCase() : undefined,
      shippingFee,
      totalAmount,
      status: 'Pending Confirmation',
      createdAt: now.toISOString()
    };

    data.orders.unshift(newOrder);
    saveDatabase(data);

    // Build complete WhatsApp pre-filled message
    let itemsText = '';
    resolvedItems.forEach((item, idx) => {
      itemsText += `${idx + 1}. *${item.name}*\n   Qty: ${item.quantity} x Rs. ${item.price.toLocaleString()} = Rs. ${(item.quantity * item.price).toLocaleString()}\n`;
    });

    const msg = 
`🧸 *NEW ORDER REQUEST - REHAN WINING TOYS*
📍 *Location:* Faqirwali 124, Punjab
─────────────────────────
📋 *Order ID:* ${orderId}
👤 *Customer Name:* ${newOrder.customerName}
📞 *Mobile / WhatsApp:* ${newOrder.customerPhone}
🏙️ *City:* ${newOrder.city}
🏠 *Delivery Address:* ${newOrder.deliveryAddress}
${newOrder.orderNotes ? `📝 *Order Notes:* ${newOrder.orderNotes}\n` : ''}─────────────────────────
🛒 *Ordered Toys:*
${itemsText}─────────────────────────
💰 *Subtotal:* Rs. ${subtotal.toLocaleString()}
${discount > 0 ? `🏷️ *Coupon Discount (${newOrder.couponCode}):* -Rs. ${discount.toLocaleString()}\n` : ''}🚚 *Delivery Charges:* ${shippingFee === 0 ? 'FREE (Special Offer)' : `Rs. ${shippingFee}`}
💵 *TOTAL AMOUNT PAYABLE:* Rs. ${totalAmount.toLocaleString()}
─────────────────────────
⚠️ *Notice:* This order is registered on the store system (Pending Confirmation). Please confirm stock availability and share estimated delivery time. Shukriya!`;

    const whatsappTargetPhone = '923281509141';
    const whatsappUrl = `https://wa.me/${whatsappTargetPhone}?text=${encodeURIComponent(msg)}`;

    return { order: newOrder, whatsappUrl };
  },

  updateOrderStatus(orderId: string, status: Order['status']): Order | null {
    const data = loadDatabase();
    const order = data.orders.find(o => o.id === orderId);
    if (!order) return null;
    order.status = status;
    saveDatabase(data);
    return order;
  },

  // REVIEWS
  getReviews(productId?: string): Review[] {
    const data = loadDatabase();
    if (productId) {
      return data.reviews.filter(r => r.productId === productId);
    }
    return data.reviews;
  },

  addReview(reviewInput: { productId: string; authorName: string; rating: number; comment: string }): Review {
    const data = loadDatabase();
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId: reviewInput.productId,
      authorName: reviewInput.authorName.trim(),
      rating: Math.max(1, Math.min(5, reviewInput.rating)),
      comment: reviewInput.comment.trim(),
      date: new Date().toISOString().split('T')[0],
      verifiedPurchase: true
    };
    data.reviews.unshift(newReview);

    // Update product rating and count
    const prod = data.products.find(p => p.id === reviewInput.productId);
    if (prod) {
      const prodReviews = data.reviews.filter(r => r.productId === prod.id);
      const totalScore = prodReviews.reduce((sum, r) => sum + r.rating, 0);
      prod.rating = parseFloat((totalScore / prodReviews.length).toFixed(1));
      prod.reviewsCount = prodReviews.length;
    }

    saveDatabase(data);
    return newReview;
  },

  // CONTACT MESSAGES
  addMessage(msg: { name: string; phone: string; email?: string; subject: string; message: string }): ContactMessage {
    const data = loadDatabase();
    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      ...msg,
      date: new Date().toISOString(),
      read: false
    };
    data.messages.unshift(newMsg);
    saveDatabase(data);
    return newMsg;
  },

  getMessages(): ContactMessage[] {
    const data = loadDatabase();
    return data.messages;
  },

  // SITE SETTINGS
  getSettings() {
    const data = loadDatabase();
    return data.siteSettings;
  },

  updateSettings(settings: Partial<StoreSchema['siteSettings']>) {
    const data = loadDatabase();
    data.siteSettings = {
      ...data.siteSettings,
      ...settings
    };
    saveDatabase(data);
    return data.siteSettings;
  },

  // ADMIN STATS
  getStats() {
    const data = loadDatabase();
    const totalProducts = data.products.length;
    const totalOrders = data.orders.length;
    const totalRevenue = data.orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = data.orders.filter(o => o.status === 'Pending Confirmation').length;
    const lowStockProducts = data.products.filter(p => p.stockQuantity <= 5);

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.map(p => ({ id: p.id, name: p.name, stock: p.stockQuantity }))
    };
  },

  // AUTH
  verifyAdminPassword(password: string): boolean {
    const adminPass = process.env.ADMIN_PASSWORD || 'rehan123';
    return password === adminPass;
  },

  createAdminSession(): string {
    const token = crypto.randomBytes(32).toString('hex');
    activeAdminTokens.add(token);
    return token;
  },

  isValidAdminToken(token?: string): boolean {
    if (!token) return false;
    return activeAdminTokens.has(token);
  },

  logoutAdmin(token?: string) {
    if (token) {
      activeAdminTokens.delete(token);
    }
  }
};
