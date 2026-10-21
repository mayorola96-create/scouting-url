import React, { useState } from 'react';
import {
  StoreItem,
  SenderProfile,
  compileTemplate,
  getStoreContactRoutes,
  generateAutoFillBookmarklet,
  calculateMetrics,
} from '../utils/engine';
import {
  ExternalLink,
  Search,
  Copy,
  Check,
  Sparkles,
  Zap,
  ArrowRight,
  SkipForward,
  CheckCircle2,
  Bookmark,
  HelpCircle,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  Share2,
  Mail,
  User,
  Tag,
  MessageSquare,
  Globe,
  AlertCircle,
} from 'lucide-react';

interface OutreachCockpitProps {
  stores: StoreItem[];
  currentIndex: number;
  profile: SenderProfile;
  dailyCount: number;
  onSelectIndex: (index: number) => void;
  onMarkStore: (id: string, status: 'completed' | 'skipped') => void;
  onOpenSetup: () => void;
  onOpenQueue: () => void;
}

export const OutreachCockpit: React.FC<OutreachCockpitProps> = ({
  stores,
  currentIndex,
  profile,
  dailyCount,
  onSelectIndex,
  onMarkStore,
  onOpenSetup,
  onOpenQueue,
}) => {
  const currentStore: StoreItem | undefined = stores[currentIndex];
  const metrics = calculateMetrics(stores);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBookmarkletHelp, setShowBookmarkletHelp] = useState<boolean>(false);
  const bookmarkletRef = React.useRef<HTMLAnchorElement>(null);

  const bookmarkletCode = generateAutoFillBookmarklet(profile);

  React.useEffect(() => {
    if (bookmarkletRef.current) {
      bookmarkletRef.current.setAttribute('href', bookmarkletCode);
    }
  }, [bookmarkletCode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`✓ Copied ${fieldName} to clipboard!`);
    setTimeout(() => {
      setCopiedField(prev => (prev === fieldName ? null : prev));
    }, 1800);
  };

  const compiledMessage = currentStore
    ? compileTemplate(profile.messageTemplate, {
        storeName: currentStore.storeName,
        domain: currentStore.domain,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
      })
    : '';

  const compiledSubject = currentStore
    ? compileTemplate(profile.subject, {
        storeName: currentStore.storeName,
        domain: currentStore.domain,
        fullName: profile.fullName,
      })
    : '';

  const contactRoutes = currentStore
    ? getStoreContactRoutes(currentStore.domain)
    : null;

  // AUTO-COPY ON LAUNCH: Copies pitch and opens target contact route
  const handleLaunchRoute = (url: string, routeLabel: string) => {
    if (!currentStore) return;

    // Automatically copy personalized pitch to clipboard
    navigator.clipboard.writeText(compiledMessage);
    setCopiedField('Pitch');
    showToast(`🚀 Copied ${currentStore.storeName} pitch & launched ${routeLabel}!`);

    // Open target store contact page in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // DONE & LAUNCH NEXT STORE
  const handleDoneAndLaunchNext = () => {
    if (!currentStore) return;

    // Mark current store completed
    onMarkStore(currentStore.id, 'completed');

    // Find next pending store
    let nextIdx = -1;
    for (let i = currentIndex + 1; i < stores.length; i++) {
      if (stores[i].status === 'pending') {
        nextIdx = i;
        break;
      }
    }
    if (nextIdx === -1) {
      for (let i = 0; i < currentIndex; i++) {
        if (stores[i].status === 'pending') {
          nextIdx = i;
          break;
        }
      }
    }

    if (nextIdx !== -1) {
      const nextStore = stores[nextIdx];
      const nextPitch = compileTemplate(profile.messageTemplate, {
        storeName: nextStore.storeName,
        domain: nextStore.domain,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
      });

      // Automatically copy next store pitch to clipboard
      navigator.clipboard.writeText(nextPitch);
      onSelectIndex(nextIdx);

      // Immediately launch next store's Shopify /pages/contact
      const nextRoutes = getStoreContactRoutes(nextStore.domain);
      window.open(nextRoutes.shopifyPagesContact, '_blank', 'noopener,noreferrer');
      showToast(`✓ Marked done! Loaded & opened ${nextStore.storeName} (pitch copied)`);
    } else {
      showToast(`🎉 Outstanding! All stores in the queue are completed.`);
    }
  };

  // SKIP STORE
  const handleSkipStore = () => {
    if (!currentStore) return;
    onMarkStore(currentStore.id, 'skipped');
    showToast(`Skipped ${currentStore.storeName}`);

    // Advance to next pending
    let nextIdx = -1;
    for (let i = currentIndex + 1; i < stores.length; i++) {
      if (stores[i].status === 'pending') {
        nextIdx = i;
        break;
      }
    }
    if (nextIdx === -1) {
      for (let i = 0; i < currentIndex; i++) {
        if (stores[i].status === 'pending') {
          nextIdx = i;
          break;
        }
      }
    }

    if (nextIdx !== -1) {
      onSelectIndex(nextIdx);
    }
  };

  if (!currentStore) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Queue is Empty</h2>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Add target store URLs to your queue to begin fast semi-automated outreach.
        </p>
        <button
          onClick={onOpenQueue}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all"
        >
          Open URL Queue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 select-text">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-zinc-950/95 border border-indigo-500/50 text-indigo-200 text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* TOP COCKPIT PROGRESS & STREAK BANNER */}
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
              STORE {currentIndex + 1} OF {stores.length}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                currentStore.status === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : currentStore.status === 'skipped'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {currentStore.status}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
              {currentStore.storeName}
            </h1>
            <a
              href={`https://${currentStore.domain}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-mono shrink-0"
              title="Visit store homepage"
            >
              <span>{currentStore.domain}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
              <span>{metrics.completed} / {metrics.total} Stores Contacted ({metrics.completionRate}%)</span>
              <span>{metrics.pending} Remaining</span>
            </div>
            <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${metrics.completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Daily Streak & Fast Jumpers */}
        <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800">
          <div className="text-right px-3 py-1.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Today</span>
            <span className="text-lg font-black text-emerald-400 leading-tight">
              {metrics.completed + dailyCount}
            </span>
            <span className="text-[10px] text-zinc-400 block">Outreached</span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 p-1 rounded-2xl">
            <button
              onClick={() => onSelectIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-2 rounded-xl text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous Store"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectIndex(Math.min(stores.length - 1, currentIndex + 1))}
              disabled={currentIndex === stores.length - 1}
              className="p-2 rounded-xl text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next Store"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: DIRECT CONTACT ROUTE LAUNCH BUTTONS */}
      <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Direct Contact Route Launchers</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Clicking any button <strong>automatically copies your personalized pitch</strong> and opens the store's contact form in a new tab.
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 self-start sm:self-auto flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-400" />
            <span>Auto-Copies Pitch on Launch</span>
          </span>
        </div>

        {contactRoutes && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. /pages/contact (Shopify Default) */}
            <button
              onClick={() => handleLaunchRoute(contactRoutes.shopifyPagesContact, '/pages/contact')}
              className="group p-4 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-zinc-900 to-zinc-900 hover:from-indigo-900/90 hover:to-indigo-950/70 border border-indigo-700/50 hover:border-indigo-500 text-left transition-all shadow-md active:scale-95 cursor-pointer flex flex-col justify-between min-h-[105px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                  Shopify Default
                </span>
                <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div>
                <div className="text-xs font-bold text-white font-mono">/pages/contact</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Most common Shopify route</div>
              </div>
            </button>

            {/* 2. /contact-us */}
            <button
              onClick={() => handleLaunchRoute(contactRoutes.contactUs, '/contact-us')}
              className="group p-4 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition-all shadow-sm active:scale-95 cursor-pointer flex flex-col justify-between min-h-[105px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">
                  WooCommerce / Custom
                </span>
                <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div>
                <div className="text-xs font-bold text-white font-mono">/contact-us</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Standard e-commerce slug</div>
              </div>
            </button>

            {/* 3. /contact */}
            <button
              onClick={() => handleLaunchRoute(contactRoutes.contact, '/contact')}
              className="group p-4 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition-all shadow-sm active:scale-95 cursor-pointer flex flex-col justify-between min-h-[105px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">
                  Root Contact
                </span>
                <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div>
                <div className="text-xs font-bold text-white font-mono">/contact</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Clean short contact path</div>
              </div>
            </button>

            {/* 4. Google Search Store Contact */}
            <button
              onClick={() => handleLaunchRoute(contactRoutes.googleSearch, 'Google Site Search')}
              className="group p-4 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-700/60 text-left transition-all shadow-sm active:scale-95 cursor-pointer flex flex-col justify-between min-h-[105px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  Fallback Finder
                </span>
                <Search className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-300">Google Site Search</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Finds unlinked / hidden forms</div>
              </div>
            </button>
          </div>
        )}

        {/* SECTION 2: GIANT ONE-TAP COPY CHIPS */}
        <div className="pt-2 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            One-Tap Copy Chips (Instant Clipboard)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Copy Email */}
            <button
              onClick={() => handleCopy(profile.email, 'Email')}
              className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-indigo-500 text-left transition-all active:scale-95 flex items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="min-w-0">
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Mail className="w-3 h-3 text-indigo-400" />
                  <span>Email</span>
                </div>
                <div className="text-xs font-semibold text-white truncate mt-0.5">
                  {profile.email || 'None'}
                </div>
              </div>
              <div className="shrink-0 p-1.5 rounded-lg bg-zinc-900 group-hover:bg-indigo-600 text-zinc-400 group-hover:text-white transition-colors">
                {copiedField === 'Email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </div>
            </button>

            {/* Copy Name */}
            <button
              onClick={() => handleCopy(profile.fullName, 'Name')}
              className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-indigo-500 text-left transition-all active:scale-95 flex items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="min-w-0">
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-400" />
                  <span>Name</span>
                </div>
                <div className="text-xs font-semibold text-white truncate mt-0.5">
                  {profile.fullName || 'None'}
                </div>
              </div>
              <div className="shrink-0 p-1.5 rounded-lg bg-zinc-900 group-hover:bg-indigo-600 text-zinc-400 group-hover:text-white transition-colors">
                {copiedField === 'Name' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </div>
            </button>

            {/* Copy Subject */}
            <button
              onClick={() => handleCopy(compiledSubject, 'Subject')}
              className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-indigo-500 text-left transition-all active:scale-95 flex items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="min-w-0">
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3 text-indigo-400" />
                  <span>Subject</span>
                </div>
                <div className="text-xs font-semibold text-white truncate mt-0.5">
                  {compiledSubject || 'None'}
                </div>
              </div>
              <div className="shrink-0 p-1.5 rounded-lg bg-zinc-900 group-hover:bg-indigo-600 text-zinc-400 group-hover:text-white transition-colors">
                {copiedField === 'Subject' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </div>
            </button>

            {/* Copy Pitch */}
            <button
              onClick={() => handleCopy(compiledMessage, 'Pitch')}
              className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-700/60 hover:border-indigo-400 text-left transition-all active:scale-95 flex items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="min-w-0">
                <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-indigo-400" />
                  <span>Personalized Pitch</span>
                </div>
                <div className="text-xs font-semibold text-indigo-200 truncate mt-0.5">
                  Ready ({currentStore.storeName})
                </div>
              </div>
              <div className="shrink-0 p-1.5 rounded-lg bg-indigo-900 group-hover:bg-indigo-600 text-indigo-300 group-hover:text-white transition-colors">
                {copiedField === 'Pitch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: 1-CLICK BROWSER AUTO-FILL BOOKMARKLET */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-zinc-900 to-zinc-900 border border-indigo-500/30 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Bookmark className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-sm text-white">
                1-Click Browser Auto-Fill Bookmarklet
              </h3>
              <button
                onClick={() => setShowBookmarkletHelp(!showBookmarkletHelp)}
                className="text-zinc-400 hover:text-white transition-colors"
                title="How to use this bookmarklet"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-300">
              Drag this button to your browser bookmarks bar. When you open any store's Contact Us page in another tab, click it to auto-fill every field and focus Submit!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Draggable Bookmarklet Link */}
            <a
              ref={bookmarkletRef}
              onClick={(e) => {
                // If clicked directly in app, copy code to clipboard
                e.preventDefault();
                navigator.clipboard.writeText(bookmarkletCode);
                showToast('⚡ Bookmarklet code copied! Drag to Bookmarks bar to install.');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-grab active:cursor-grabbing select-none"
              title="Drag this button to your Bookmarks Bar!"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>⚡ Auto-Fill Store Form</span>
            </a>

            <button
              onClick={() => {
                navigator.clipboard.writeText(bookmarkletCode);
                showToast('Bookmarklet script copied to clipboard!');
              }}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors border border-zinc-700"
              title="Copy Javascript Code"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Bookmarklet Guide */}
        {showBookmarkletHelp && (
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 space-y-2 font-sans">
            <div className="font-bold text-white flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>How to use the 1-Click Bookmarklet:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
              <li>Make sure your browser's bookmarks bar is visible (Press <code className="text-indigo-300 font-mono">Ctrl+Shift+B</code> or <code className="text-indigo-300 font-mono">Cmd+Shift+B</code>).</li>
              <li>Click and drag the orange <strong>⚡ Auto-Fill Store Form</strong> button directly into your bookmarks bar.</li>
              <li>When you click any store contact route above (e.g. <code className="text-indigo-300 font-mono">/pages/contact</code>), click the bookmarklet in your bookmarks bar.</li>
              <li>The bookmarklet automatically fills out your Name, Email, Phone, Subject, and personalized Pitch, fires React/Shopify change events, and scrolls the Submit button into view!</li>
            </ol>
          </div>
        )}
      </div>

      {/* SECTION 4: PREVIEW OF PERSONALIZED PITCH */}
      <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Active Message Pitch for {currentStore.storeName}</span>
          </span>

          <button
            onClick={() => handleCopy(compiledMessage, 'Full Pitch')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
          >
            {copiedField === 'Full Pitch' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Pitch</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto font-sans">
          {compiledMessage}
        </div>
      </div>

      {/* STICKY BOTTOM QUEUE NAVIGATION BAR */}
      <div className="sticky bottom-4 z-40 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-3xl p-3 shadow-2xl flex items-center justify-between gap-3">
        {/* Skip Store */}
        <button
          onClick={handleSkipStore}
          className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-800 text-rose-300 hover:text-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <SkipForward className="w-4 h-4 text-rose-400" />
          <span>Skip Store</span>
        </button>

        {/* Done & Launch Next Store (Primary Power Action) */}
        <button
          onClick={handleDoneAndLaunchNext}
          className="flex-2 sm:flex-1 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>Done &amp; Launch Next Store</span>
          <ArrowRight className="w-4 h-4 text-emerald-200 hidden sm:inline" />
        </button>
      </div>
    </div>
  );
};
