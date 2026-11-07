import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Truck, 
  Heart,
  Flame
} from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenTrackOrder: () => void;
  onNavigatePromo: () => void;
  onNavigateAll: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onOpenTrackOrder,
  onNavigatePromo,
  onNavigateAll
}) => {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & About */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5 text-amber-100" />
              </div>
              <div>
                <span className="text-xl font-black text-white">Rehan Wining Toys</span>
                <span className="block text-xs text-amber-400 font-semibold">Punjab, Faqirwali 124</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Punjab&apos;s leading online and retail toy hub. We specialize in high-speed 4WD remote control monster trucks, STEM educational learning kits, luxury dolls, ride-ons, and family board games at unbeatable wholesale and promotional discount prices.
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Toys
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-amber-400" /> Punjab Delivery
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Explore Store
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <button
                  onClick={onNavigatePromo}
                  className="hover:text-rose-400 transition-colors flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  <span>Discounts & Offers Section</span>
                </button>
              </li>
              <li>
                <button onClick={onNavigateAll} className="hover:text-white transition-colors">
                  All Toys & Models
                </button>
              </li>
              <li>
                <button onClick={onOpenTrackOrder} className="hover:text-indigo-400 transition-colors">
                  Track Existing Order
                </button>
              </li>
              <li>
                <button onClick={onOpenAdmin} className="hover:text-amber-400 transition-colors">
                  Store Admin Management
                </button>
              </li>
            </ul>
          </div>

          {/* Store Location & Contact */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Direct Contact & Address
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Shop Address: Punjab, Faqirwali 124, Pakistan</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+923281509141" className="hover:text-white font-mono font-bold">
                  +92 328 1509141
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/923281509141"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white font-mono font-bold"
                >
                  WhatsApp: +92 328 1509141
                </a>
              </p>
            </div>
            <p className="text-[11px] text-slate-500 pt-2">
              ⚠️ Store Notice: Orders placed through the website are submitted to the database and forwarded to WhatsApp for owner confirmation before dispatch.
            </p>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Rehan Wining Toys. All Rights Reserved. Faqirwali 124, Punjab.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> for Pakistani Kids & Families
          </p>
        </div>
      </div>
    </footer>
  );
};
