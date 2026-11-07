import { Router, Request, Response, NextFunction } from 'express';
import { db } from './db.ts';

export const apiRouter = Router();

// Middleware: Admin Protection
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-admin-token'] as string);

  if (!token || !db.isValidAdminToken(token)) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
  }
  next();
};

// ==================== AUTH ====================
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (db.verifyAdminPassword(password)) {
    const token = db.createAdminSession();
    return res.json({ success: true, token, message: 'Admin logged in successfully' });
  }

  return res.status(401).json({ error: 'Invalid admin password' });
});

apiRouter.get('/admin/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-admin-token'] as string);

  if (token && db.isValidAdminToken(token)) {
    return res.json({ authenticated: true });
  }
  return res.json({ authenticated: false });
});

apiRouter.post('/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-admin-token'] as string);
  db.logoutAdmin(token);
  res.json({ success: true });
});

// ==================== PRODUCTS ====================
apiRouter.get('/products', (req: Request, res: Response) => {
  try {
    const { search, category, sort, offerOnly, featuredOnly, flashSaleOnly } = req.query;
    const products = db.getProducts({
      search: typeof search === 'string' ? search : undefined,
      category: typeof category === 'string' ? category : undefined,
      sort: typeof sort === 'string' ? sort : undefined,
      offerOnly: offerOnly === 'true',
      featuredOnly: featuredOnly === 'true',
      flashSaleOnly: flashSaleOnly === 'true'
    });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch products' });
  }
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

apiRouter.post('/products', requireAdmin, (req: Request, res: Response) => {
  const { name, urduName, category, price, originalPrice, stockQuantity, images, description, features, ageGroup, sku, isOffer, isFeatured, isFlashSale } = req.body;

  if (!name || !category || price === undefined || price <= 0) {
    return res.status(400).json({ error: 'Name, category, and valid price are required' });
  }

  const numPrice = Number(price);
  const numOrigPrice = Number(originalPrice) || numPrice;
  const discountPercent = numOrigPrice > numPrice ? Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100) : 0;

  const product = db.createProduct({
    name: String(name).trim(),
    urduName: urduName ? String(urduName).trim() : undefined,
    category: String(category).trim(),
    price: numPrice,
    originalPrice: numOrigPrice,
    discountPercent,
    isOffer: Boolean(isOffer || discountPercent > 0),
    isFeatured: Boolean(isFeatured),
    isNewArrival: true,
    isFlashSale: Boolean(isFlashSale),
    stockQuantity: Number(stockQuantity) || 0,
    rating: 5.0,
    reviewsCount: 0,
    images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80'],
    description: String(description || '').trim(),
    features: Array.isArray(features) ? features : [],
    ageGroup: String(ageGroup || '3+ Years'),
    sku: String(sku || `RWT-${Math.floor(100 + Math.random() * 900)}`)
  });

  res.status(201).json(product);
});

apiRouter.put('/products/:id', requireAdmin, (req: Request, res: Response) => {
  const id = req.params.id;
  const existing = db.getProductById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const body = req.body;
  const updates: any = { ...body };

  if (body.price !== undefined || body.originalPrice !== undefined) {
    const price = body.price !== undefined ? Number(body.price) : existing.price;
    const orig = body.originalPrice !== undefined ? Number(body.originalPrice) : existing.originalPrice;
    updates.price = price;
    updates.originalPrice = orig;
    updates.discountPercent = orig > price ? Math.round(((orig - price) / orig) * 100) : 0;
    updates.isOffer = updates.discountPercent > 0;
  }

  const updated = db.updateProduct(id, updates);
  res.json(updated);
});

apiRouter.delete('/products/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ success: true, message: 'Product deleted successfully' });
});

// ==================== CATEGORIES ====================
apiRouter.get('/categories', (_req: Request, res: Response) => {
  res.json(db.getCategories());
});

apiRouter.post('/categories', requireAdmin, (req: Request, res: Response) => {
  const { name, urduName, icon, badge, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cat = db.createCategory({
    id,
    name,
    urduName,
    icon: icon || 'Sparkles',
    badge,
    description: description || ''
  });
  res.status(201).json(cat);
});

// ==================== PROMOS & COUPONS ====================
apiRouter.get('/promos', (_req: Request, res: Response) => {
  res.json(db.getPromos());
});

apiRouter.post('/promos/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: 'Coupon code required' });
  }
  const result = db.validateCoupon(code, Number(subtotal) || 0);
  res.json(result);
});

// ==================== ORDERS ====================
apiRouter.post('/orders', (req: Request, res: Response) => {
  const { customerName, customerPhone, city, deliveryAddress, orderNotes, items, couponCode } = req.body;

  if (!customerName || !customerPhone || !city || !deliveryAddress) {
    return res.status(400).json({ error: 'Please provide full name, phone number, city, and delivery address' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty. Please select products to order' });
  }

  try {
    const result = db.createOrder({
      customerName,
      customerPhone,
      city,
      deliveryAddress,
      orderNotes,
      items,
      couponCode
    });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit order' });
  }
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

apiRouter.get('/admin/orders', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getOrders());
});

apiRouter.patch('/admin/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { status } = req.body;
  const validStatuses = ['Pending Confirmation', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }
  const updated = db.updateOrderStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(updated);
});

// ==================== STATS ====================
apiRouter.get('/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getStats());
});

// ==================== REVIEWS ====================
apiRouter.get('/reviews/:productId', (req: Request, res: Response) => {
  res.json(db.getReviews(req.params.productId));
});

apiRouter.post('/reviews', (req: Request, res: Response) => {
  const { productId, authorName, rating, comment } = req.body;
  if (!productId || !authorName || !rating || !comment) {
    return res.status(400).json({ error: 'Product ID, name, rating, and comment are required' });
  }
  const review = db.addReview({
    productId,
    authorName,
    rating: Number(rating),
    comment
  });
  res.status(201).json(review);
});

// ==================== CONTACT ====================
apiRouter.post('/contact', (req: Request, res: Response) => {
  const { name, phone, email, subject, message } = req.body;
  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Name, phone number, and message are required' });
  }
  const msg = db.addMessage({ name, phone, email, subject: subject || 'General Inquiry', message });
  res.status(201).json({ success: true, message: 'Message received! Shop owner Rehan will contact you soon.', data: msg });
});

apiRouter.get('/admin/messages', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getMessages());
});

// ==================== SETTINGS ====================
apiRouter.get('/settings', (_req: Request, res: Response) => {
  res.json(db.getSettings());
});

apiRouter.put('/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});
