import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Order } from '../types';
import confetti from 'canvas-confetti';
import { 
  X, 
  MessageSquare, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  Building2, 
  ArrowRight,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted?: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderCompleted }) => {
  const {
    items,
    cartSubtotal,
    discountAmount,
    shippingFee,
    cartTotal,
    couponCode,
    clearCart,
    showToast
  } = useCart();

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [city, setCity] = useState('Faqirwali');
  const [customCity, setCustomCity] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen) return null;

  const finalCity = city === 'Other' ? customCity : city;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      showToast('Please enter a valid Pakistani mobile number (e.g. 03281509141)', 'error');
      return;
    }
    if (!deliveryAddress.trim()) {
      showToast('Please enter complete delivery address', 'error');
      return;
    }
    if (city === 'Other' && !customCity.trim()) {
      showToast('Please specify your city name', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        city: finalCity.trim(),
        deliveryAddress: deliveryAddress.trim(),
        orderNotes: orderNotes.trim() || undefined,
        couponCode: couponCode || undefined,
        items: items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity
        }))
      };

      const result = await api.createOrder(payload);

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // fallback if confetti canvas fails
      }

      setCompletedOrder(result.order);
      setWhatsappUrl(result.whatsappUrl);
      clearCart();
      if (onOrderCompleted) onOrderCompleted(result.order);

      showToast(`Order #${result.order.id} registered! Opening WhatsApp to send details...`, 'success');

      // Automatically launch WhatsApp with pre-filled message
      setTimeout(() => {
        if (result.whatsappUrl) {
          window.open(result.whatsappUrl, '_blank');
        }
      }, 800);

    } catch (err: any) {
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyOrderId = () => {
    if (completedOrder) {
      navigator.clipboard.writeText(completedOrder.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      showToast('Order ID copied to clipboard!', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white p-5 sm:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black">
              {completedOrder ? 'Order Details & WhatsApp Confirmation' : 'Secure Checkout & WhatsApp Order'}
            </h2>
            <p className="text-xs text-amber-100 mt-0.5">
              Rehan Wining Toys • Punjab, Faqirwali 124 (+923281509141)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Completed Order State */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex items-start gap-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-black text-emerald-950">
                  Order Successfully Registered in Store System!
                </h3>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  Your order has been recorded into our database with Reference ID{' '}
                  <strong className="font-mono text-emerald-950 font-black">{completedOrder.id}</strong>.
                </p>
              </div>
            </div>

            {/* Crucial Store Confirmation Notice */}
            <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 space-y-1">
                <strong className="block font-black text-sm text-amber-900">
                  Important Store Policy Note:
                </strong>
                <p className="leading-relaxed">
                  As per store policy, <strong>your order is pending shop owner confirmation</strong>. Please click the green button below to send your pre-filled order receipt directly to shop owner Rehan on WhatsApp (+923281509141). The order is confirmed once Rehan confirms stock and delivery schedule.
                </p>
              </div>
            </div>

            {/* Order Receipt Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs">
                <span className="text-slate-500 font-bold">Order Reference:</span>
                <div className="flex items-center gap-1.5 font-mono font-black text-slate-900">
                  <span>{completedOrder.id}</span>
                  <button
                    onClick={handleCopyOrderId}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Customer:</span>
                  <span className="font-bold text-slate-800">{completedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone:</span>
                  <span className="font-bold text-slate-800">{completedOrder.customerPhone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Delivery Address:</span>
                  <span className="font-bold text-slate-800">{completedOrder.deliveryAddress}, {completedOrder.city}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="border-t border-slate-200 pt-2 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Items Ordered ({completedOrder.items.length}):
                </span>
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-medium text-slate-700">
                    <span className="truncate pr-2">{item.quantity}x {item.name}</span>
                    <span className="font-mono font-bold shrink-0">Rs. {(item.quantity * item.price).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline text-sm font-black text-slate-900">
                <span>Total Payable:</span>
                <span className="text-rose-600 font-mono text-base">
                  Rs. {completedOrder.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Launch WhatsApp Button */}
            <div className="space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm sm:text-base transition-all transform hover:-translate-y-0.5"
              >
                <MessageSquare className="w-5 h-5 fill-white" />
                <span>Open WhatsApp to Confirm Order</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={onClose}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Done / Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Disclaimer box */}
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Please fill in accurate delivery info. After submitting, your order is saved in our system and pre-filled in WhatsApp (+923281509141) for owner confirmation.
              </span>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-500" />
                <span>Full Name <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Muhammad Ahmad"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Mobile / WhatsApp Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>Mobile / WhatsApp Number <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 03281509141 or 03001234567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                We will contact you on this WhatsApp number for confirmation.
              </span>
            </div>

            {/* City Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>City / Town (Punjab) <span className="text-rose-500">*</span></span>
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50 focus:bg-white cursor-pointer"
                >
                  <option value="Faqirwali">Faqirwali (Local Shop Area)</option>
                  <option value="Haroonabad">Haroonabad</option>
                  <option value="Bahawalnagar">Bahawalnagar</option>
                  <option value="Chishtian">Chishtian</option>
                  <option value="Fort Abbas">Fort Abbas</option>
                  <option value="Bahawalpur">Bahawalpur</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Multan">Multan</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Other">Other City / Area in Pakistan</option>
                </select>
              </div>

              {city === 'Other' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specify Your City / District <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter city name"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50 focus:bg-white"
                  />
                </div>
              )}
            </div>

            {/* Complete Delivery Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Complete Delivery Address (House / Street / Mohallah) <span className="text-rose-500">*</span></span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Ward #4, Mohallah Ghaziabad, Near Jamia Masjid, Faqirwali"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Order Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Special Instructions / Notes (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Birthday gift packing, deliver after 3 PM, etc."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Order Review Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-800 block">Order Financial Summary</span>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({items.length} toys)</span>
                <span className="font-mono font-bold">Rs. {cartSubtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({couponCode})</span>
                  <span className="font-mono">-Rs. {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Punjab Delivery Fee</span>
                <span className="font-mono font-bold">
                  {shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `Rs. ${shippingFee}`}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black text-sm text-slate-900">
                <span>Final Payable Amount:</span>
                <span className="text-rose-600 font-mono text-base font-black">
                  Rs. {cartTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm sm:text-base transition-all cursor-pointer disabled:opacity-50"
            >
              <MessageSquare className="w-5 h-5 fill-white" />
              <span>{isSubmitting ? 'Registering Order...' : 'Submit Order & Open WhatsApp'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-slate-400 text-center">
              Rehan Wining Toys • Faqirwali 124 • WhatsApp: +92 328 1509141
            </p>

          </form>
        )}
      </div>
    </div>
  );
};
