import React, { useState } from 'react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { 
  MapPin, 
  Phone, 
  MessageSquare, 
  Clock, 
  Send, 
  ExternalLink, 
  CheckCircle2, 
  Store
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { showToast } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      showToast('Please fill all required contact fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitContact({
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim()
      });
      setSubmitted(true);
      setName('');
      setPhone('');
      setMessage('');
      showToast('Message sent to Rehan! We will get back to you shortly.', 'success');
    } catch {
      showToast('Failed to send inquiry. Please call or WhatsApp directly.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=Faqirwali+Punjab+Pakistan';

  return (
    <section id="contact-section" className="max-w-7xl mx-auto px-4 sm:px-6 my-14">
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Store Info Column */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-8 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
                <Store className="w-3.5 h-3.5" />
                <span>VISIT OUR TOY SHOP</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Rehan Wining Toys
              </h3>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                We are a physical toy showroom and online distributor located in Punjab, Faqirwali 124. Parents, kids, and wholesale toy resellers are always welcome!
              </p>

              {/* Direct Details */}
              <div className="space-y-4 pt-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-amber-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-white font-bold">Store Address</strong>
                    <span className="text-slate-300">Punjab, Faqirwali 124, Pakistan</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-emerald-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-white font-bold">Phone / Direct Call</strong>
                    <a href="tel:+923281509141" className="text-emerald-400 hover:underline font-mono font-bold">
                      +92 328 1509141
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-emerald-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-white font-bold">WhatsApp Orders & Support</strong>
                    <a
                      href="https://wa.me/923281509141"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline font-mono font-bold"
                    >
                      +92 328 1509141
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-indigo-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-white font-bold">Opening Hours</strong>
                    <span className="text-slate-300">Monday - Sunday: 9:00 AM - 10:30 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps link button */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="tel:+923281509141"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-7 p-8 sm:p-10 space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-rose-600">
                GET IN TOUCH
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                Have a Question or Custom Toy Request?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Looking for a specific toy model, bulk gifts, or wholesale rates? Drop a message below and Rehan will respond promptly.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-black text-emerald-950">Message Sent Successfully!</h4>
                <p className="text-xs text-emerald-800">
                  Thank you! Shop owner Rehan will contact you shortly on your WhatsApp or phone number.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Asad Ullah"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Phone / WhatsApp Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 03281509141"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Your Message / Toy Inquiries <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what toy or discount offer you are interested in..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message to Shop Owner'}</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
