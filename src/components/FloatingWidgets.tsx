import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone, ArrowUp } from 'lucide-react';

export const FloatingWidgets: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappUrl = 'https://wa.me/923281509141?text=Assalam%20o%20Alaikum%20Rehan%20bhai%2C%20I%20am%20browsing%20Rehan%20Wining%20Toys%20and%20want%20to%20inquire%20about%20toys!';

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-12 h-12 bg-white text-slate-700 hover:text-slate-950 rounded-full shadow-lg border border-slate-200 flex items-center justify-center transition-all transform hover:-translate-y-1 cursor-pointer"
          title="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Direct Phone Call Button */}
      <a
        href="tel:+923281509141"
        className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all transform hover:-translate-y-1 cursor-pointer"
        title="Call Shop Owner: +923281509141"
      >
        <Phone className="w-5 h-5" />
      </a>

      {/* Floating WhatsApp Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative group w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-xl shadow-emerald-500/30 flex items-center justify-center transition-all transform hover:scale-105 cursor-pointer"
        title="Chat on WhatsApp (+923281509141)"
      >
        {/* Pulsing online badge */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full animate-ping" />
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full" />
        
        <MessageSquare className="w-7 h-7 fill-white" />

        {/* Tooltip on hover */}
        <div className="absolute left-16 bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
          Chat with Rehan (0328-1509141)
        </div>
      </a>
    </div>
  );
};
