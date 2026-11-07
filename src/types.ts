export interface Product {
  id: string;
  name: string;
  urduName?: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  isOffer: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isFlashSale: boolean;
  stockQuantity: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  description: string;
  features: string[];
  ageGroup: string;
  sku: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  urduName?: string;
  icon: string;
  badge?: string;
  description: string;
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  description: string;
  validUntil: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  city: string;
  deliveryAddress: string;
  orderNotes?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  totalAmount: number;
  status: 'Pending Confirmation' | 'Confirmed' | 'Processing' | 'Dispatched' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockCount: number;
  lowStockProducts: { id: string; name: string; stock: number }[];
}
