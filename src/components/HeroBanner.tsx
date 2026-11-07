import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { 
  Flame, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Zap, 
  Gift
} from 'lucide-react';

interface HeroBannerProps {
  onShopDeals: () => void;
  onExploreAll: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopDeals, onExploreAll }) => {
  const { applyCoupon, showToast } = useCart();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Flash sale countdown timer (Hours, Minutes, Seconds)
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    applyCoupon(code);
    showToast(`Code "${code}" copied & applied to your cart! 🎁`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-700 text-white rounded-3xl mx-4 sm:mx-6 my-6 shadow-2xl">
      {/* Playful background decorative shapes */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-10 sm:py-14 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-5">
            {/* Promo Pill */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-200 border border-white/20 shadow-xs">
              <Flame className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
              <span>SPECIAL PUNJAB MEGA DISCOUNT CARNIVAL 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Unwrap Pure Joy at <br />
              <span className="text-amber-300 drop-shadow-md">
                Rehan Wining Toys
              </span>
            </h1>

            <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-xl font-normal leading-relaxed">
              Faqirwali&apos;s favorite toy destination! Discover top-speed 4WD RC rock crawlers, intelligent dancing robots, luxury dollhouses, and educational STEM sets with <strong className="text-amber-200 font-bold">up to 50% wholesale discounts</strong>.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onShopDeals}
                className="bg-amber-400 text-slate-950 hover:bg-amber-300 font-extrabold px-6 py-3.5 rounded-2xl shadow-lg shadow-amber-900/30 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base"
              >
                <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
                <span>Shop Mega Offers & Deals</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreAll}
                className="bg-white/15 hover:bg-white/25 text-white font-bold px-5 py-3.5 rounded-2xl backdrop-blur-md border border-white/20 transition-all cursor-pointer text-sm sm:text-base"
              >
                Browse All 100+ Toys
              </button>
            </div>

            {/* Trust Metrics */}
            <div className="pt-4 grid grid-cols-3 gap-2 border-t border-white/15 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="text-white/90">Free Delivery Rs. 3,000+</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="text-white/90">100% Inspected & Tested</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="text-white/90">Direct WhatsApp Confirm</span>
              </div>
            </div>
          </div>

          {/* Flash Deals & Coupon Voucher Card */}
          <div className="lg:col-span-5 space-y-4">
            {/* Flash Sale Countdown Card */}
            <div className="bg-slate-950/40 backdrop-blur-xl border border-white/20 p-5 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs sm:text-sm">
                  <Clock className="w-4 h-4 animate-spin-slow" />
                  <span>FLASH SALE ENDS IN:</span>
                </div>
                <span className="bg-rose-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Live Deals
                </span>
              </div>

              {/* Countdown Numbers */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10">
                  <span className="block text-2xl sm:text-3xl font-mono font-black text-amber-300">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-300">Hours</span>
                </div>
                <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10">
                  <span className="block text-2xl sm:text-3xl font-mono font-black text-amber-300">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-300">Minutes</span>
                </div>
                <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10">
                  <span className="block text-2xl sm:text-3xl font-mono font-black text-amber-300">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-300">Seconds</span>
                </div>
              </div>

              <div className="text-xs text-white/80 text-center font-medium">
                ⚡ Special prices applied automatically to marked items!
              </div>
            </div>

            {/* Click-to-Copy Coupons Box */}
            <div className="bg-white/95 text-slate-900 p-4 sm:p-5 rounded-3xl shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-rose-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  Available Promo Coupons
                </span>
                <span className="text-[11px] font-semibold text-slate-500">Tap to Copy & Apply</span>
              </div>

              <div className="space-y-2">
                {/* Coupon 1 */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/70 hover:bg-rose-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-rose-700 bg-rose-200/70 px-2 py-0.5 rounded">
                        REHAN10
                      </span>
                      <span className="text-xs font-bold text-slate-800">10% OFF</span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5">Min. Order Rs. 1,500 (All Toys)</p>
                  </div>
                  <button
                    onClick={() => handleCopyCoupon('REHAN10')}
                    className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedCode === 'REHAN10' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'REHAN10' ? 'Applied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Coupon 2 */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/70 hover:bg-amber-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded">
                        SUPERTOY
                      </span>
                      <span className="text-xs font-bold text-slate-800">Rs. 500 OFF</span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5">Min. Order Rs. 4,000</p>
                  </div>
                  <button
                    onClick={() => handleCopyCoupon('SUPERTOY')}
                    className="p-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedCode === 'SUPERTOY' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'SUPERTOY' ? 'Applied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
