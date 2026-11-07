import React, { useState } from 'react';
import { api } from '../services/api';
import { Order } from '../types';
import { 
  X, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  MessageSquare, 
  AlertCircle 
} from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose }) => {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = orderIdInput.trim().toUpperCase();
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setOrder(null);

    const formattedId = query.startsWith('RWT-') ? query : `RWT-${query}`;

    try {
      const data = await api.getOrderById(formattedId);
      setOrder(data);
    } catch {
      setError(`No order found matching "${formattedId}". Please check your order ID or contact Rehan on WhatsApp.`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Pending Confirmation':
        return {
          icon: <Clock className="w-4 h-4 text-amber-500" />,
          color: 'bg-amber-100 text-amber-900 border-amber-300',
          desc: 'Waiting for shop owner Rehan to confirm item availability & delivery schedule.'
        };
      case 'Confirmed':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-indigo-500" />,
          color: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          desc: 'Order confirmed by Rehan Wining Toys! Preparing for packaging.'
        };
      case 'Processing':
        return {
          icon: <Package className="w-4 h-4 text-blue-500" />,
          color: 'bg-blue-100 text-blue-900 border-blue-300',
          desc: 'Your toys are quality-inspected, packed, and boxed.'
        };
      case 'Dispatched':
        return {
          icon: <Truck className="w-4 h-4 text-purple-500" />,
          color: 'bg-purple-100 text-purple-900 border-purple-300',
          desc: 'Handed over to courier / local delivery rider in Punjab.'
        };
      case 'Delivered':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
          color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          desc: 'Successfully delivered to customer.'
        };
      case 'Cancelled':
      default:
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
          color: 'bg-rose-100 text-rose-900 border-rose-300',
          desc: 'Order cancelled.'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Track Order Status</h2>
              <p className="text-xs text-slate-500 font-medium">Rehan Wining Toys Punjab</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input form */}
        <form onSubmit={handleTrack} className="p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Enter Order ID (e.g. RWT-10842)"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="flex-1 bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Searching...' : 'Track'}</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">
            Tip: Your Order ID was shown on checkout and in the pre-filled WhatsApp message.
          </p>
        </form>

        {/* Results */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {order && (
            <div className="space-y-4">
              {/* Status Header */}
              {(() => {
                const badge = getStatusBadge(order.status);
                return (
                  <div className={`p-4 rounded-2xl border ${badge.color} space-y-1`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Current Status</span>
                      <div className="flex items-center gap-1.5 font-black text-xs">
                        {badge.icon}
                        <span>{order.status}</span>
                      </div>
                    </div>
                    <p className="text-xs pt-1">{badge.desc}</p>
                  </div>
                );
              })()}

              {/* Order Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-400">Order ID:</span>
                  <span className="font-mono font-black text-slate-900">{order.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-400">Order Date:</span>
                  <span className="font-medium text-slate-800">{order.orderDate}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-400">Customer Name:</span>
                  <span className="font-medium text-slate-800">{order.customerName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-400">Destination:</span>
                  <span className="font-medium text-slate-800">{order.deliveryAddress}, {order.city}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Total Payable:</span>
                  <span className="font-mono font-black text-rose-600 text-sm">
                    Rs. {order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Contact Shop on WhatsApp */}
              <a
                href={`https://wa.me/923281509141?text=${encodeURIComponent(`Assalam o Alaikum Rehan bhai, I want an update regarding my order ID: ${order.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Chat with Rehan about Order {order.id}</span>
              </a>
            </div>
          )}

          {!order && !error && (
            <div className="text-center py-6 text-slate-400 text-xs space-y-1">
              <Truck className="w-8 h-8 mx-auto text-slate-300" />
              <p>Enter your order ID above to see live status updates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
