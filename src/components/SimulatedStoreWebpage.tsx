import React, { useState, useEffect, useRef } from 'react';
import { StoreItem } from '../utils/engine';
import { Send, CheckCircle2, MapPin, Mail, Phone, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface SimulatedStoreWebpageProps {
  store: StoreItem;
  isContactPage: boolean;
  onNavigateToContact: () => void;
  onFormSubmitted?: () => void;
  lastFilledTimestamp?: number;
}

export const SimulatedStoreWebpage: React.FC<SimulatedStoreWebpageProps> = ({
  store,
  isContactPage,
  onNavigateToContact,
  onFormSubmitted,
  lastFilledTimestamp,
}) => {
  const [formSent, setFormSent] = useState(false);
  const [highlightPulse, setHighlightPulse] = useState(false);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  // Reset submitted state when store changes
  useEffect(() => {
    setFormSent(false);
  }, [store.id]);

  // Visual pulse indicator when auto-filled
  useEffect(() => {
    if (lastFilledTimestamp) {
      setHighlightPulse(true);
      const timer = setTimeout(() => setHighlightPulse(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [lastFilledTimestamp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    onFormSubmitted?.();
  };

  return (
    <div className="w-full min-h-full bg-stone-900 text-stone-100 font-sans pb-24 select-text">
      {/* Simulated Store Announcement Bar */}
      <div className="bg-indigo-950/80 border-b border-indigo-800/40 text-indigo-200 text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Spring 2026 Collection Live &bull; Free Global Shipping Over $150</span>
      </div>

      {/* Store Header */}
      <header className="sticky top-0 z-10 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-sm shadow-sm">
            {store.storeName.charAt(0)}
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white leading-tight">
              {store.storeName}
            </h1>
            <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
              Verified Merchant &bull; {store.domain}
            </span>
          </div>
        </div>

        {/* Store Nav Links (Used by Contact Scanner) */}
        <nav className="flex items-center gap-3 text-xs">
          <span className="text-stone-400 hidden sm:inline hover:text-white cursor-pointer">Shop</span>
          <span className="text-stone-400 hidden sm:inline hover:text-white cursor-pointer">About</span>
          <button
            type="button"
            onClick={onNavigateToContact}
            className={`px-2.5 py-1 rounded-md transition-colors text-xs font-medium ${
              isContactPage
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                : 'bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-white'
            }`}
            data-href="/pages/contact"
          >
            Contact Us
          </button>
        </nav>
      </header>

      {/* Main Content: Either Home or Contact Us */}
      {!isContactPage ? (
        /* Store Homepage with Hero and Contact Prompts */
        <div className="p-4 space-y-5">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-stone-800 via-stone-800/80 to-stone-900 border border-stone-800 p-6 text-center shadow-lg">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
              Official Storefront
            </span>
            <h2 className="text-xl font-bold text-white mb-2">
              Welcome to {store.storeName}
            </h2>
            <p className="text-xs text-stone-400 max-w-sm mx-auto mb-4">
              Explore our artisan products designed for modern living. Questions, wholesale, or corporate inquiries? Reach our team anytime.
            </p>

            <button
              onClick={onNavigateToContact}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-transform active:scale-95"
            >
              <span>Get In Touch / Contact Us</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Featured Highlights */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-stone-800/50 border border-stone-800/80">
              <div className="text-xs font-semibold text-stone-200 mb-1">Catalog &amp; Wholesale</div>
              <p className="text-[11px] text-stone-400">Available across 240+ premier independent retailers.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-800/50 border border-stone-800/80">
              <div className="text-xs font-semibold text-stone-200 mb-1">Press &amp; Collabs</div>
              <p className="text-[11px] text-stone-400">Featured in Vogue, GQ, and Architectural Digest.</p>
            </div>
          </div>

          {/* Footer contact link */}
          <footer className="pt-6 border-t border-stone-800/80 text-center">
            <p className="text-[11px] text-stone-500 mb-2">&copy; 2026 {store.storeName}. All rights reserved.</p>
            <div className="flex justify-center gap-4 text-xs text-stone-400">
              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); onNavigateToContact(); }}
                className="hover:text-indigo-400 underline underline-offset-2"
              >
                Contact Customer Support
              </a>
              <span>&bull;</span>
              <a
                href="#wholesale"
                onClick={(e) => { e.preventDefault(); onNavigateToContact(); }}
                className="hover:text-indigo-400 underline underline-offset-2"
              >
                Wholesale Portal
              </a>
            </div>
          </footer>
        </div>
      ) : (
        /* Store Contact Us Form Page */
        <div className="p-4 max-w-md mx-auto space-y-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-medium">
            <span className="hover:text-stone-300 cursor-pointer">Home</span>
            <span>/</span>
            <span className="text-indigo-400">Pages</span>
            <span>/</span>
            <span className="text-white font-semibold">Contact Us</span>
          </div>

          <div className="border-b border-stone-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Contact {store.storeName}</span>
              {highlightPulse && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                  Auto-Filled!
                </span>
              )}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Have a partnership inquiry or need assistance? Fill out the form below and our team will get back to you within 24 hours.
            </p>
          </div>

          {/* Quick info cards */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-300">
            <div className="flex items-center gap-1.5 bg-stone-800/40 border border-stone-800 rounded-lg p-2">
              <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>Response: &lt; 24h</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-800/40 border border-stone-800 rounded-lg p-2">
              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>HQ &bull; Verified</span>
            </div>
          </div>

          {/* The Contact Form */}
          {formSent ? (
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-white">Inquiry Sent Successfully!</h3>
              <p className="text-xs text-stone-300">
                Thank you for reaching out to {store.storeName}. Tap <strong>Done &amp; Next</strong> in the bottom bar to advance to the next store.
              </p>
            </div>
          ) : (
            <form
              id="storeContactForm"
              onSubmit={handleSubmit}
              className={`space-y-3.5 p-4 rounded-2xl bg-stone-800/30 border transition-all duration-300 ${
                highlightPulse
                  ? 'border-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                  : 'border-stone-800'
              }`}
            >
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-medium text-stone-300 mb-1" htmlFor="contact-name">
                  Full Name <span className="text-indigo-400">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="contact[name]"
                  placeholder="e.g. Alex Vance"
                  required
                  className={`w-full px-3 py-2 rounded-xl bg-stone-900 border text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    highlightPulse ? 'border-indigo-400 bg-stone-900/90' : 'border-stone-700/80'
                  }`}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-medium text-stone-300 mb-1" htmlFor="contact-email">
                  Email Address <span className="text-indigo-400">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="contact[email]"
                  placeholder="name@company.com"
                  required
                  className={`w-full px-3 py-2 rounded-xl bg-stone-900 border text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    highlightPulse ? 'border-indigo-400 bg-stone-900/90' : 'border-stone-700/80'
                  }`}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-medium text-stone-300 mb-1" htmlFor="contact-phone">
                  Phone Number
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  name="contact[phone]"
                  placeholder="+1 (555) 000-0000"
                  className={`w-full px-3 py-2 rounded-xl bg-stone-900 border text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    highlightPulse ? 'border-indigo-400 bg-stone-900/90' : 'border-stone-700/80'
                  }`}
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-medium text-stone-300 mb-1" htmlFor="contact-subject">
                  Subject Line <span className="text-indigo-400">*</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  name="contact[subject]"
                  placeholder="Partnership inquiry"
                  required
                  className={`w-full px-3 py-2 rounded-xl bg-stone-900 border text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    highlightPulse ? 'border-indigo-400 bg-stone-900/90' : 'border-stone-700/80'
                  }`}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-medium text-stone-300 mb-1" htmlFor="contact-message">
                  Your Message <span className="text-indigo-400">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="contact[body]"
                  rows={4}
                  placeholder="Tell us about your brand or proposal..."
                  required
                  className={`w-full px-3 py-2 rounded-xl bg-stone-900 border text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    highlightPulse ? 'border-indigo-400 bg-stone-900/90' : 'border-stone-700/80'
                  }`}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  ref={submitBtnRef}
                  type="submit"
                  id="store-submit-btn"
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-xs text-white flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95 ${
                    highlightPulse
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-600 ring-4 ring-indigo-500/40 shadow-indigo-500/25'
                      : 'bg-stone-100 hover:bg-white text-stone-900'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message to {store.storeName}</span>
                </button>
                <p className="text-[10px] text-stone-500 text-center mt-2">
                  Tap to submit, then tap <strong>Done &amp; Next</strong> in the bottom bar below.
                </p>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
