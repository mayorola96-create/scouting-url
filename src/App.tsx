/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SenderProfile, StoreItem, calculateMetrics, generateAutoFillBookmarklet } from './utils/engine';
import { INITIAL_STORES, TEMPLATE_PRESETS } from './data/mockStores';
import { OutreachCockpit } from './components/OutreachCockpit';
import { SetupScreen } from './components/SetupScreen';
import { QueueScreen } from './components/QueueScreen';
import {
  Zap,
  Sliders,
  Layers,
  Sparkles,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Flame,
  Globe,
  Share2,
} from 'lucide-react';

const LOCAL_STORAGE_KEY_STORES = 'storescout_stores_v2';
const LOCAL_STORAGE_KEY_PROFILE = 'storescout_profile_v2';
const LOCAL_STORAGE_KEY_INDEX = 'storescout_index_v2';
const LOCAL_STORAGE_KEY_DAILY = 'storescout_daily_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<'cockpit' | 'queue' | 'setup'>('cockpit');

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

  const [dailyCount, setDailyCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_DAILY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_STORES, JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_INDEX, currentIndex.toString());
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_DAILY, dailyCount.toString());
  }, [dailyCount]);

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
    if (status === 'completed') {
      setDailyCount(prev => prev + 1);
    }
  };

  const handleSelectStore = (index: number) => {
    setCurrentIndex(index);
    setActiveTab('cockpit');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleStartCampaign = () => {
    const firstPending = stores.findIndex(s => s.status === 'pending');
    if (firstPending !== -1) {
      setCurrentIndex(firstPending);
    }
    setActiveTab('cockpit');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleTabChange = (tab: 'cockpit' | 'queue' | 'setup') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const bookmarkletCode = generateAutoFillBookmarklet(profile);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black font-black text-sm">
              <Zap className="w-4 h-4 fill-black text-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">StoreScout Web</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  LIVE OUTREACH
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 hidden md:block">
                Semi-automated browser store outreach &amp; form auto-filler
              </p>
            </div>
          </div>

          {/* Main 3 Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 p-1 rounded-2xl shadow-inner max-w-full overflow-x-auto">
            {/* View 3: Rapid Outreach Cockpit */}
            <button
              onClick={() => handleTabChange('cockpit')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'cockpit'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Outreach Cockpit</span>
            </button>

            {/* View 2: Bulk URL Queue & Importer */}
            <button
              onClick={() => handleTabChange('queue')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>URL Queue</span>
              {metrics.pending > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/50 ml-0.5">
                  {metrics.pending}
                </span>
              )}
            </button>

            {/* View 1: Sender & Pitch Setup */}
            <button
              onClick={() => handleTabChange('setup')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'setup'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Sender &amp; Pitch</span>
            </button>
          </nav>

          {/* Quick Copy Bookmarklet Button */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(bookmarkletCode);
                alert('⚡ StoreScout: Auto-Fill Bookmarklet code copied to clipboard! You can paste it into a bookmark or use the draggable button inside the Cockpit.');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all cursor-pointer"
              title="Copy Auto-Fill Bookmarklet code"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ Bookmarklet</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Views */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* VIEW 3: RAPID OUTREACH COCKPIT */}
        {activeTab === 'cockpit' && (
          <OutreachCockpit
            stores={stores}
            currentIndex={currentIndex}
            profile={profile}
            dailyCount={dailyCount}
            onSelectIndex={setCurrentIndex}
            onMarkStore={handleMarkStore}
            onOpenSetup={() => handleTabChange('setup')}
            onOpenQueue={() => handleTabChange('queue')}
          />
        )}

        {/* VIEW 2: BULK URL QUEUE & IMPORTER */}
        {activeTab === 'queue' && (
          <QueueScreen
            stores={stores}
            currentIndex={currentIndex}
            onUpdateStores={setStores}
            onSelectStore={handleSelectStore}
            onStartCampaign={handleStartCampaign}
          />
        )}

        {/* VIEW 1: SENDER & PITCH SETUP */}
        {activeTab === 'setup' && (
          <SetupScreen
            profile={profile}
            onSaveProfile={setProfile}
            currentStore={currentStore}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-4 px-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>StoreScout Web &bull; Rapid E-Commerce Outreach Cockpit &bull; GitHub Pages Ready</div>
          <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
            <span>Auto-Copies Pitch on Launch</span>
            <span>&bull;</span>
            <span>1-Click Bookmarklet Form Filler</span>
            <span>&bull;</span>
            <span>LocalStorage Persistence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
