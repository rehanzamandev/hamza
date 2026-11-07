import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Product, Order, AdminStats, Category } from '../types';
import { useCart } from '../context/CartContext';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Plus, 
  Trash2, 
  Edit3, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  AlertTriangle, 
  LogOut, 
  ExternalLink, 
  Check, 
  Search,
  Filter,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshProducts: () => void;
}

const PRESET_TOY_IMAGES = [
  'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1597843797221-1b920bf8244f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80'
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, onRefreshProducts }) => {
  const { showToast } = useCart();
  
  // Auth state
  const [token, setToken] = useState<string>(() => localStorage.getItem('rwt_admin_token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'categories'>('overview');

  // Data state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState<string>('');

  // Product Modal (Add / Edit)
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Verify stored token on open
  useEffect(() => {
    if (isOpen && token) {
      api.verifyAdmin(token).then(valid => {
        setIsAuthenticated(valid);
        if (valid) {
          loadAdminData(token);
        } else {
          setToken('');
          localStorage.removeItem('rwt_admin_token');
        }
      });
    }
  }, [isOpen, token]);

  const loadAdminData = async (activeToken: string) => {
    try {
      const [statsData, ordersData, productsData, catData] = await Promise.all([
        api.getAdminStats(activeToken),
        api.getAdminOrders(activeToken),
        api.getProducts(),
        api.getCategories()
      ]);
      setStats(statsData);
      setOrders(ordersData);
      setProducts(productsData);
      setCategories(catData);
    } catch {
      showToast('Error loading admin records', 'error');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);

    try {
      const res = await api.adminLogin(passwordInput);
      setToken(res.token);
      localStorage.setItem('rwt_admin_token', res.token);
      setIsAuthenticated(true);
      setPasswordInput('');
      showToast('Welcome, Rehan! Admin Dashboard unlocked.', 'success');
      loadAdminData(res.token);
    } catch (err: any) {
      setAuthError(err.message || 'Incorrect password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('rwt_admin_token');
    setIsAuthenticated(false);
    showToast('Admin logged out', 'info');
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updated = await api.updateOrderStatus(orderId, newStatus, token);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      showToast(`Order #${orderId} marked as ${newStatus}`, 'success');
      if (stats) {
        api.getAdminStats(token).then(setStats);
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from store inventory?`)) return;

    try {
      await api.deleteProduct(id, token);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast(`Product "${name}" deleted`, 'info');
      onRefreshProducts();
      if (stats) api.getAdminStats(token).then(setStats);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.category || !editingProduct?.price) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setIsSavingProduct(true);
    try {
      if (editingProduct.id) {
        // Edit existing
        const updated = await api.updateProduct(editingProduct.id, editingProduct, token);
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        showToast('Product updated successfully! ✅', 'success');
      } else {
        // Create new
        const created = await api.createProduct(editingProduct, token);
        setProducts(prev => [created, ...prev]);
        showToast('New toy added to store! 🧸', 'success');
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
      onRefreshProducts();
      if (stats) api.getAdminStats(token).then(setStats);
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const openAddProductModal = () => {
    setEditingProduct({
      name: '',
      urduName: '',
      category: categories[0]?.id || 'rc-vehicles',
      price: 2500,
      originalPrice: 3200,
      stockQuantity: 15,
      description: '',
      features: ['Child-safe materials', 'Durable drop-resistant build'],
      ageGroup: '3+ Years',
      images: [PRESET_TOY_IMAGES[0]],
      isOffer: true,
      isFeatured: false,
      isFlashSale: false
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct({ ...product });
    setIsProductModalOpen(true);
  };

  if (!isOpen) return null;

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  const filteredProducts = products.filter(p => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-100 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                <span>Rehan Wining Toys</span>
                <span className="text-[10px] font-mono bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30">
                  ADMIN PORTAL
                </span>
              </h2>
              <p className="text-xs text-slate-400">Inventory, Orders & Real-time Database Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="p-2 text-rose-400 hover:text-white hover:bg-rose-900/40 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          /* Login Screen */
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full my-auto text-center space-y-6">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">Admin Security Login</h3>
              <p className="text-xs text-slate-500">
                Enter your secret store master password to manage inventory and view customer orders.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Master Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter admin password (e.g. rehan123)"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Default: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono font-bold">rehan123</code> (configured in server/.env)
                </span>
              </div>

              {authError && (
                <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{isLoggingIn ? 'Verifying...' : 'Unlock Admin Dashboard'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Tabs Bar */}
            <div className="bg-slate-100/80 px-6 py-2.5 border-b border-slate-200 flex gap-2 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Overview & Stats
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'orders' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Orders Management</span>
                {stats && stats.pendingOrders > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {stats.pendingOrders}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'products' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Product Inventory ({products.length})
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between opacity-80 text-xs font-bold mb-1">
                      <span>Total Revenue</span>
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-black font-mono">
                      Rs. {(stats?.totalRevenue || 0).toLocaleString()}
                    </div>
                    <span className="text-[10px] opacity-75">All confirmed orders</span>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between opacity-80 text-xs font-bold mb-1">
                      <span>Total Orders</span>
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-black font-mono">
                      {stats?.totalOrders || 0}
                    </div>
                    <span className="text-[10px] opacity-75">Registered in system</span>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500 to-amber-700 text-white p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between opacity-80 text-xs font-bold mb-1">
                      <span>Pending Orders</span>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-black font-mono">
                      {stats?.pendingOrders || 0}
                    </div>
                    <span className="text-[10px] opacity-75">Requires shop confirmation</span>
                  </div>

                  <div className="bg-gradient-to-br from-rose-500 to-rose-700 text-white p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between opacity-80 text-xs font-bold mb-1">
                      <span>Total Products</span>
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-black font-mono">
                      {stats?.totalProducts || 0}
                    </div>
                    <span className="text-[10px] opacity-75">{stats?.lowStockCount || 0} low in stock</span>
                  </div>
                </div>

                {/* Low Stock Alerts */}
                {stats && stats.lowStockProducts.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Low Stock Alert (Restock Recommended)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {stats.lowStockProducts.map(item => (
                        <div key={item.id} className="bg-white p-2 rounded-xl border border-rose-200 text-xs flex justify-between">
                          <span className="font-medium text-slate-800 truncate pr-2">{item.name}</span>
                          <span className="font-bold text-rose-600 shrink-0 font-mono">{item.stock} left</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Manage Store Catalog</h4>
                    <p className="text-xs text-slate-500">Add new toy models or review recent customer inquiries.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={openAddProductModal}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Toy</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-200 cursor-pointer"
                    >
                      View All Orders
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Orders */}
            {activeTab === 'orders' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Status Filter */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
                    {['all', 'Pending Confirmation', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'].map(st => (
                      <button
                        key={st}
                        onClick={() => setOrderFilter(st)}
                        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                          orderFilter === st ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st === 'all' ? 'All Orders' : st}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-slate-500 font-medium">
                    {filteredOrders.length} orders
                  </span>
                </div>

                {/* Orders List */}
                <div className="space-y-3">
                  {filteredOrders.length === 0 ? (
                    <p className="text-center py-10 text-xs text-slate-400">No orders match filter.</p>
                  ) : (
                    filteredOrders.map(order => (
                      <div key={order.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-indigo-600">{order.id}</span>
                            <span className="text-[11px] text-slate-400">• {order.orderDate}</span>
                          </div>

                          {/* Status Change Selector */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 font-medium">Status:</span>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                                order.status === 'Delivered'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : order.status === 'Pending Confirmation'
                                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                                  : 'bg-indigo-50 text-indigo-900 border-indigo-300'
                              }`}
                            >
                              <option value="Pending Confirmation">Pending Confirmation</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Dispatched">Dispatched</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        {/* Customer & Address Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block">Customer:</span>
                            <span className="font-bold text-slate-800">{order.customerName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Phone / WhatsApp:</span>
                            <a
                              href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalam o Alaikum ${order.customerName}, this is Rehan Wining Toys regarding your order #${order.id}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-emerald-600 hover:underline flex items-center gap-1 font-mono"
                            >
                              {order.customerPhone} <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Delivery Destination:</span>
                            <span className="font-medium text-slate-800">{order.deliveryAddress}, {order.city}</span>
                          </div>
                        </div>

                        {/* Ordered Items summary */}
                        <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-slate-700">
                              <span>{item.quantity}x {item.name}</span>
                              <span className="font-mono font-bold">Rs. {(item.quantity * item.price).toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-slate-900">
                            <span>Total (Subtotal - Discount + Shipping):</span>
                            <span className="font-mono text-rose-600 font-black">Rs. {order.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Products */}
            {activeTab === 'products' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <input
                      type="text"
                      placeholder="Search products by name or SKU..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <button
                    onClick={openAddProductModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Badges</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3 flex items-center gap-3">
                            <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                            <div>
                              <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                              <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                            </div>
                          </td>
                          <td className="p-3 text-slate-600 capitalize">{p.category.replace('-', ' ')}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">
                            <div>Rs. {p.price.toLocaleString()}</div>
                            {p.originalPrice > p.price && (
                              <span className="text-[10px] text-rose-500 line-through">Rs. {p.originalPrice.toLocaleString()}</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`font-mono font-bold ${p.stockQuantity <= 5 ? 'text-rose-600' : 'text-slate-700'}`}>
                              {p.stockQuantity}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1 flex-wrap">
                              {p.discountPercent > 0 && (
                                <span className="bg-rose-100 text-rose-700 text-[9px] px-1.5 py-0.2 rounded font-bold">
                                  -{p.discountPercent}%
                                </span>
                              )}
                              {p.isFlashSale && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.2 rounded font-bold">
                                  Flash
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => openEditProductModal(p)}
                              className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Modal: Add or Edit Product */}
        {isProductModalOpen && editingProduct && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">
                  {editingProduct.id ? 'Edit Toy Details' : 'Add New Toy to Inventory'}
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
                {/* Product Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    placeholder="e.g. 4WD High-Speed Stunt RC Car"
                  />
                </div>

                {/* Urdu Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Urdu Title (Optional)</label>
                  <input
                    type="text"
                    value={editingProduct.urduName || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, urduName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-urdu text-right"
                    placeholder="کھلونے کا نام اردو میں"
                  />
                </div>

                {/* Category & Age Group */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={editingProduct.category || 'rc-vehicles'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Recommended Age</label>
                    <input
                      type="text"
                      value={editingProduct.ageGroup || '3+ Years'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, ageGroup: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200"
                      placeholder="e.g. 3-8 Years"
                    />
                  </div>
                </div>

                {/* Price, Original Price, Stock */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sale Price (Rs.)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editingProduct.price || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Original Price (Rs.)</label>
                    <input
                      type="number"
                      min={1}
                      value={editingProduct.originalPrice || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editingProduct.stockQuantity || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                </div>

                {/* Image Selection */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={editingProduct.images?.[0] || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-[11px]"
                    placeholder="https://..."
                  />

                  {/* Preset Quick Images */}
                  <div className="mt-2">
                    <span className="text-[10px] text-slate-400 block mb-1">Or Pick a High-Res Toy Preset:</span>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {PRESET_TOY_IMAGES.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt=""
                          onClick={() => setEditingProduct({ ...editingProduct, images: [img] })}
                          className={`w-10 h-10 rounded-lg object-cover cursor-pointer border-2 transition-transform hover:scale-105 ${
                            editingProduct.images?.[0] === img ? 'border-indigo-600' : 'border-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    placeholder="Enter full toy description..."
                  />
                </div>

                {/* Toggles */}
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.isFlashSale)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isFlashSale: e.target.checked })}
                    />
                    <span>Flash Sale Offer</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.isFeatured)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                    />
                    <span>Featured Item</span>
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
                  >
                    {isSavingProduct ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
