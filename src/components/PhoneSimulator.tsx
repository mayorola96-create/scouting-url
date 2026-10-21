import React, { useState, useEffect, useRef } from 'react';
import { StoreItem, SenderProfile, compileTemplate } from '../utils/engine';
import { SimulatedStoreWebpage } from './SimulatedStoreWebpage';
import {
  Search,
  Wand2,
  SkipForward,
  CheckCircle,
  RotateCw,
  Sliders,
  Layers,
  Lock,
  Wifi,
  Battery,
  Terminal,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface PhoneSimulatorProps {
  stores: StoreItem[];
  currentIndex: number;
  profile: SenderProfile;
  onSelectIndex: (index: number) => void;
  onMarkStore: (id: string, status: 'completed' | 'skipped') => void;
  onOpenSetup: () => void;
  onOpenQueue: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

interface LogEntry {
  id: string;
  time: string;
  type: 'info' | 'success' | 'warn' | 'action';
  message: string;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  stores,
  currentIndex,
  profile,
  onSelectIndex,
  onMarkStore,
  onOpenSetup,
  onOpenQueue,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const currentStore: StoreItem | undefined = stores[currentIndex];
  const [isContactPage, setIsContactPage] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [lastFilledTimestamp, setLastFilledTimestamp] = useState<number | undefined>(undefined);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [
      { id: `log_${Date.now()}_${Math.random()}`, time, type, message },
      ...prev.slice(0, 40),
    ]);
  };

  const showToast = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => {
      setActiveToast(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  // When store changes, simulate page load
  useEffect(() => {
    if (!currentStore) return;
    setIsLoading(true);
    setLoadingProgress(20);

    // Default to contact page if URL has /contact, otherwise check root
    const hasContactInUrl = currentStore.cleanUrl.toLowerCase().includes('contact');
    setIsContactPage(hasContactInUrl);

    addLog(`[WebView] Navigating to: ${currentStore.cleanUrl}`, 'info');

    const t1 = setTimeout(() => setLoadingProgress(70), 200);
    const t2 = setTimeout(() => {
      setLoadingProgress(100);
      setIsLoading(false);
      addLog(`[WebView] Page Loaded: 200 OK (${currentStore.domain})`, 'success');

      // If already on contact page, auto run fill after brief delay
      if (hasContactInUrl) {
        addLog(`[Scanner] Auto-detected contact page endpoint. Preparing auto-fill...`, 'info');
        setTimeout(() => {
          handleAutoFill(false);
        }, 500);
      } else {
        addLog(`[Scanner] Root domain loaded. Click [Find Contact] or let auto-scanner find links.`, 'warn');
      }
    }, 450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [currentIndex, currentStore?.id]);

  // ACTION 1: Find Contact
  const handleFindContact = () => {
    if (!currentStore) return;
    setIsLoading(true);
    setLoadingProgress(40);
    addLog(`[Scanner] Scanning DOM for <a> tags matching ['contact', 'get-in-touch', 'support']...`, 'action');

    setTimeout(() => {
      setIsContactPage(true);
      setLoadingProgress(100);
      setIsLoading(false);
      addLog(`[Scanner] Found match: https://${currentStore.domain}/pages/contact`, 'success');
      showToast(`Navigated to Contact Page for ${currentStore.storeName}`);

      // Run auto-fill automatically after navigating
      setTimeout(() => {
        handleAutoFill(false);
      }, 400);
    }, 400);
  };

  // ACTION 2: Auto-Fill Now
  const handleAutoFill = (notify = true) => {
    if (!currentStore) return;

    if (!isContactPage) {
      handleFindContact();
      return;
    }

    addLog(`[AutoFill] Injecting form filler script with profile data...`, 'action');

    const compiledMessage = compileTemplate(profile.messageTemplate, {
      storeName: currentStore.storeName,
      domain: currentStore.domain,
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
    });

    const compiledSubject = compileTemplate(profile.subject, {
      storeName: currentStore.storeName,
      domain: currentStore.domain,
      fullName: profile.fullName,
    });

    // Directly update DOM elements in simulated view
    const nameInput = document.getElementById('contact-name') as HTMLInputElement | null;
    const emailInput = document.getElementById('contact-email') as HTMLInputElement | null;
    const phoneInput = document.getElementById('contact-phone') as HTMLInputElement | null;
    const subjectInput = document.getElementById('contact-subject') as HTMLInputElement | null;
    const messageInput = document.getElementById('contact-message') as HTMLTextAreaElement | null;
    const submitBtn = document.getElementById('store-submit-btn') as HTMLButtonElement | null;

    let filledCount = 0;

    if (nameInput && profile.fullName) {
      nameInput.value = profile.fullName;
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      filledCount++;
    }

    if (emailInput && profile.email) {
      emailInput.value = profile.email;
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('change', { bubbles: true }));
      filledCount++;
    }

    if (phoneInput && profile.phone) {
      phoneInput.value = profile.phone;
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
      filledCount++;
    }

    if (subjectInput && compiledSubject) {
      subjectInput.value = compiledSubject;
      subjectInput.dispatchEvent(new Event('input', { bubbles: true }));
      subjectInput.dispatchEvent(new Event('change', { bubbles: true }));
      filledCount++;
    }

    if (messageInput && compiledMessage) {
      messageInput.value = compiledMessage;
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      messageInput.dispatchEvent(new Event('change', { bubbles: true }));
      filledCount++;
    }

    if (submitBtn) {
      submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      addLog(`[DOM] Scrolled Submit button to center viewport`, 'info');
    }

    setLastFilledTimestamp(Date.now());
    addLog(`[AutoFill] Dispatched 'input' & 'change' events to ${filledCount} fields`, 'success');
    if (notify) {
      showToast(`Auto-filled ${filledCount} fields & centered Submit button!`);
    }
  };

  // ACTION 3: Skip Store
  const handleSkipStore = () => {
    if (!currentStore) return;
    addLog(`[Queue] Store marked as SKIPPED: ${currentStore.domain}`, 'warn');
    onMarkStore(currentStore.id, 'skipped');
    showToast(`Skipped ${currentStore.storeName}`);
    advanceQueue();
  };

  // ACTION 4: Done & Next Store
  const handleDoneNext = () => {
    if (!currentStore) return;
    addLog(`[Queue] Store marked as COMPLETED: ${currentStore.domain}`, 'success');
    onMarkStore(currentStore.id, 'completed');
    showToast(`✓ Marked ${currentStore.storeName} as contacted!`);
    advanceQueue();
  };

  const advanceQueue = () => {
    if (stores.length === 0) return;
    // Look for next pending
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
    } else {
      addLog(`[Queue] All stores in the queue are processed!`, 'success');
      showToast('🎉 All stores in this queue completed!');
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setLoadingProgress(30);
    addLog(`[WebView] Reloading current page...`, 'info');
    setTimeout(() => {
      setLoadingProgress(100);
      setIsLoading(false);
      showToast('Page reloaded');
    }, 350);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">CONTACTED</span>;
      case 'skipped':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">SKIPPED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PENDING</span>;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center w-full transition-all duration-300 ${isFullscreen ? 'h-full' : 'py-0 sm:py-1'}`}>
      {/* Phone Hardware Mockup Frame */}
      <div
        className={`relative flex flex-col bg-stone-950 border border-stone-800/80 shadow-2xl transition-all duration-300 overflow-hidden ${
          isFullscreen
            ? 'w-full h-full rounded-none border-none'
            : 'w-full max-w-[400px] h-[640px] sm:h-[680px] max-h-[82vh] rounded-2xl sm:rounded-[38px] sm:ring-8 sm:ring-stone-900 sm:ring-offset-2 sm:ring-offset-stone-950'
        }`}
      >
        {/* Device Status Bar */}
        <div className="bg-stone-950 text-stone-300 px-6 pt-3 pb-1 flex items-center justify-between text-xs select-none z-30">
          <span className="font-semibold text-[11px] font-mono">09:41</span>

          {/* Notch / Dynamic Island */}
          <div className="w-24 h-4 bg-stone-900 rounded-full flex items-center justify-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-stone-950 border border-stone-800"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40"></div>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <Wifi className="w-3.5 h-3.5 text-stone-300" />
            <span className="font-mono">5G</span>
            <Battery className="w-4 h-4 text-stone-300" />
          </div>
        </div>

        {/* Top App Header & Browser Bar */}
        <div className="bg-stone-900 border-b border-stone-800 px-3 py-2.5 z-20 shadow-md">
          <div className="flex items-center justify-between gap-2">
            {/* Open Queue Sheet */}
            <button
              onClick={onOpenQueue}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors flex items-center gap-1"
              title="Open URL Queue"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span className="text-[11px] font-medium hidden sm:inline">Queue</span>
            </button>

            {/* Store Title & Queue Tracker */}
            <div className="flex-1 min-w-0 text-center px-1">
              <div className="flex items-center justify-center gap-1.5 truncate">
                <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-white truncate">
                  {currentStore?.storeName || 'No Store Selected'}
                </span>
                {getStatusBadge(currentStore?.status)}
              </div>
              <div className="text-[10px] text-stone-400 font-mono truncate">
                {currentStore?.domain || 'empty queue'} &bull; Store {stores.length > 0 ? currentIndex + 1 : 0} of {stores.length}
              </div>
            </div>

            {/* Right Action Icons: Reload, Setup, Viewport */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleReload}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                title="Reload Store Page"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
              </button>

              <button
                onClick={onOpenSetup}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                title="Setup Profile &amp; Templates"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              </button>

              <button
                onClick={onToggleFullscreen}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Expand Phone View'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Loading Progress Bar */}
        <div className="h-0.5 w-full bg-stone-800 overflow-hidden z-20">
          {isLoading && (
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          )}
        </div>

        {/* Main WebView Simulator Content */}
        <div ref={containerRef} className="flex-1 overflow-y-auto relative bg-stone-900 select-text">
          {currentStore ? (
            <SimulatedStoreWebpage
              store={currentStore}
              isContactPage={isContactPage}
              onNavigateToContact={handleFindContact}
              onFormSubmitted={() => {
                addLog(`[Store] Contact form submitted by user!`, 'success');
                showToast(`Form submitted! Tap "Done & Next" to continue.`);
              }}
              lastFilledTimestamp={lastFilledTimestamp}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-stone-400">
              <Layers className="w-12 h-12 text-stone-600 mb-3" />
              <h3 className="font-bold text-white text-sm mb-1">Queue is Empty</h3>
              <p className="text-xs text-stone-500 mb-4 max-w-xs">
                Add store URLs in the Queue tab or load sample stores to start semi-automated outreach.
              </p>
              <button
                onClick={onOpenQueue}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
              >
                Open URL Queue
              </button>
            </div>
          )}

          {/* Floating Android Toast Banner */}
          {activeToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full bg-stone-950/95 border border-indigo-500/40 text-indigo-200 text-xs shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-md whitespace-nowrap pointer-events-none">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{activeToast}</span>
            </div>
          )}

          {/* JS Logs Drawer Toggle Button */}
          <div className="sticky bottom-2 right-2 flex justify-end px-3 pointer-events-none z-30">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="pointer-events-auto px-2 py-1 rounded-md bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 text-[10px] font-mono text-stone-300 flex items-center gap-1.5 shadow-md backdrop-blur-sm"
            >
              <Terminal className="w-3 h-3 text-emerald-400" />
              <span>Android JS Log ({logs.length})</span>
              {showLogs ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          </div>

          {/* Collapsible JS Execution & Android Bridge Logcat */}
          {showLogs && (
            <div className="absolute bottom-0 inset-x-0 max-h-48 bg-stone-950/95 border-t border-stone-800 z-30 p-2.5 overflow-y-auto text-[10px] font-mono backdrop-blur-md">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-800 text-stone-400">
                <span className="flex items-center gap-1 font-semibold text-stone-300">
                  <Terminal className="w-3 h-3 text-emerald-400" />
                  WebView JavaScript Injection Logcat
                </span>
                <button
                  onClick={() => setLogs([])}
                  className="text-[9px] hover:text-stone-200 text-stone-500"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {logs.length === 0 ? (
                  <div className="text-stone-500 italic">No events logged yet.</div>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="leading-tight flex items-start gap-1.5">
                      <span className="text-stone-500 shrink-0">{log.time}</span>
                      <span
                        className={
                          log.type === 'success'
                            ? 'text-emerald-400'
                            : log.type === 'warn'
                            ? 'text-amber-400'
                            : log.type === 'action'
                            ? 'text-indigo-400'
                            : 'text-stone-300'
                        }
                      >
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM STICKY CONTROL BAR (The 4 user-requested buttons) */}
        <div className="bg-stone-950/95 backdrop-blur-md border-t border-stone-800/80 px-2.5 py-2.5 z-20">
          <div className="grid grid-cols-4 gap-1.5">
            {/* 1. Find Contact */}
            <button
              onClick={handleFindContact}
              className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-95 border border-stone-800 text-stone-200 transition-all shadow-sm"
              title="Scans page links for 'contact', 'about', or 'support'"
            >
              <Search className="w-4 h-4 text-stone-400" />
              <span className="text-[10px] font-semibold tracking-tight">Find Contact</span>
            </button>

            {/* 2. Auto-Fill Now */}
            <button
              onClick={() => handleAutoFill(true)}
              className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 active:scale-95 border border-indigo-700/60 text-indigo-200 transition-all shadow-sm"
              title="Re-runs form auto-fill script and dispatches change events"
            >
              <Wand2 className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-semibold tracking-tight">Auto-Fill</span>
            </button>

            {/* 3. Skip Store */}
            <button
              onClick={handleSkipStore}
              className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 active:scale-95 border border-rose-800/50 text-rose-300 transition-all shadow-sm"
              title="Marks store as skipped/broken and loads next"
            >
              <SkipForward className="w-4 h-4 text-rose-400" />
              <span className="text-[10px] font-semibold tracking-tight">Skip Store</span>
            </button>

            {/* 4. Done & Next */}
            <button
              onClick={handleDoneNext}
              className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-95 text-white transition-all shadow-md shadow-emerald-900/30"
              title="Marks store completed, updates daily counter, loads next"
            >
              <CheckCircle className="w-4 h-4 text-white" />
              <span className="text-[10px] font-bold tracking-tight">Done &amp; Next</span>
            </button>
          </div>
        </div>

        {/* Android Virtual Bottom Home Bar */}
        <div className="bg-stone-950 py-1.5 flex justify-center z-20">
          <div className="w-32 h-1 bg-stone-700/80 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
