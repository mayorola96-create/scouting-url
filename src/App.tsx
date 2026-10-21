/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SenderProfile, StoreItem, calculateMetrics } from './utils/engine';
import { INITIAL_STORES, TEMPLATE_PRESETS } from './data/mockStores';
import { PhoneSimulator } from './components/PhoneSimulator';
import { SetupScreen } from './components/SetupScreen';
import { QueueScreen } from './components/QueueScreen';
import { AndroidCodeViewer } from './components/AndroidCodeViewer';
import { downloadAndroidProjectZip } from './utils/zipExporter';
import {
  Smartphone,
  Sliders,
  Layers,
  Download,
  Github,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Bot,
  Zap,
} from 'lucide-react';

const LOCAL_STORAGE_KEY_STORES = 'storereach_stores_v1';
const LOCAL_STORAGE_KEY_PROFILE = 'storereach_profile_v1';
const LOCAL_STORAGE_KEY_INDEX = 'storereach_index_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'browser' | 'setup' | 'queue' | 'android'>('browser');
  const [stores, setStores] = useState<StoreItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_STORES);
      return saved ? JSON.parse(saved) : INITIAL_STORES;
    } catch {
      return INITIAL_STORES;
    }
  });

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_INDEX);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [profile, setProfile] = useState<SenderProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      fullName: 'Alex Vance',
      email: 'alex@brandreach.io',
      phone: '+1 (555) 234-5678',
      subject: 'Partnership / Wholesale Inquiry for {store_name}',
      messageTemplate: TEMPLATE_PRESETS[0].message,
    };
  });

  const [isFullscreenPhone, setIsFullscreenPhone] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_STORES, JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_INDEX, currentIndex.toString());
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(profile));
  }, [profile]);

  const metrics = calculateMetrics(stores);
  const currentStore = stores[currentIndex];

  const handleMarkStore = (id: string, status: 'completed' | 'skipped') => {
    const timestamp = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setStores(prev =>
      prev.map(s => (s.id === id ? { ...s, status, contactedAt: timestamp } : s))
    );
  };

  const handleSelectStore = (index: number) => {
    setCurrentIndex(index);
    setActiveTab('browser');
  };

  const handleStartCampaign = () => {
    // Find first pending
    const firstPending = stores.findIndex(s => s.status === 'pending');
    if (firstPending !== -1) {
      setCurrentIndex(firstPending);
    }
    setActiveTab('browser');
  };

  const handleQuickDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      await downloadAndroidProjectZip();
      setTimeout(() => setIsDownloadingZip(false), 1200);
    } catch (e) {
      setIsDownloadingZip(false);
    }
  };

  const handleTabChange = (tab: 'browser' | 'setup' | 'queue' | 'android') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-black text-sm">
              <Zap className="w-4 h-4 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">StoreReach</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  ANDROID
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 hidden md:block">
                Semi-automated e-commerce contact form outreach browser
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 p-1 rounded-2xl shadow-inner max-w-full overflow-x-auto">
            <button
              onClick={() => handleTabChange('browser')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'browser'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Browser HUD</span>
            </button>

            <button
              onClick={() => handleTabChange('setup')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'setup'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Setup</span>
            </button>

            <button
              onClick={() => handleTabChange('queue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'queue'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Queue</span>
              {metrics.pending > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/50 ml-0.5">
                  {metrics.pending}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange('android')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'android'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-bold">Get APK</span>
            </button>
          </nav>

          {/* Quick Download Button */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={handleQuickDownloadZip}
              disabled={isDownloadingZip}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer"
              title="Download Android Studio Project (.zip) with GitHub Actions workflow"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloadingZip ? 'animate-bounce' : ''}`} />
              <span>{isDownloadingZip ? 'Packaging ZIP...' : 'Download APK Source (.zip)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Views */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'browser' && (
          <div className="space-y-4">
            {/* Quick summary banner above phone */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 max-w-3xl mx-auto text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>
                  Current Store: <strong className="text-white">{currentStore?.storeName || 'None'}</strong>{' '}
                  <span className="text-zinc-500 font-mono">({currentStore?.domain})</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-400">
                  Outreached Today: <strong className="text-emerald-400">{metrics.completed}</strong>
                </span>
                <span className="text-zinc-600">&bull;</span>
                <span className="text-zinc-400">
                  Pending: <strong className="text-amber-400">{metrics.pending}</strong>
                </span>
              </div>
            </div>

            {/* Mobile Browser Simulation */}
            <PhoneSimulator
              stores={stores}
              currentIndex={currentIndex}
              profile={profile}
              onSelectIndex={setCurrentIndex}
              onMarkStore={handleMarkStore}
              onOpenSetup={() => setActiveTab('setup')}
              onOpenQueue={() => setActiveTab('queue')}
              isFullscreen={isFullscreenPhone}
              onToggleFullscreen={() => setIsFullscreenPhone(!isFullscreenPhone)}
            />
          </div>
        )}

        {activeTab === 'setup' && (
          <SetupScreen
            profile={profile}
            onSaveProfile={setProfile}
            currentStore={currentStore}
          />
        )}

        {activeTab === 'queue' && (
          <QueueScreen
            stores={stores}
            currentIndex={currentIndex}
            onUpdateStores={setStores}
            onSelectStore={handleSelectStore}
            onStartCampaign={handleStartCampaign}
          />
        )}

        {activeTab === 'android' && <AndroidCodeViewer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-4 px-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>StoreReach &bull; Semi-Automated Store Outreach Browser &bull; Target Android SDK 34</div>
          <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
            <span>Dynamic JS Event Dispatching</span>
            <span>&bull;</span>
            <span>SharedPreferences Local Persistence</span>
            <span>&bull;</span>
            <span>GitHub Actions Cloud CI/CD</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
