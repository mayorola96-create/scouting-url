import React, { useState, useRef } from 'react';
import { StoreItem, parseUrlList, calculateMetrics } from '../utils/engine';
import { INITIAL_STORES } from '../data/mockStores';
import {
  ListOrdered,
  Plus,
  Upload,
  Download,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
  Store,
} from 'lucide-react';

interface QueueScreenProps {
  stores: StoreItem[];
  currentIndex: number;
  onUpdateStores: (stores: StoreItem[]) => void;
  onSelectStore: (index: number) => void;
  onStartCampaign: () => void;
}

export const QueueScreen: React.FC<QueueScreenProps> = ({
  stores,
  currentIndex,
  onUpdateStores,
  onSelectStore,
  onStartCampaign,
}) => {
  const [pasteText, setPasteText] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'skipped'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const metrics = calculateMetrics(stores);

  const handleAddUrls = () => {
    if (!pasteText.trim()) return;
    const updated = parseUrlList(pasteText, stores);
    onUpdateStores(updated);
    setPasteText('');
    setShowAddModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const updated = parseUrlList(content, stores);
        onUpdateStores(updated);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadDemoStores = () => {
    onUpdateStores(INITIAL_STORES);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all stores from the queue?')) {
      onUpdateStores([]);
    }
  };

  const handleResetStatuses = () => {
    const reset = stores.map(s => ({ ...s, status: 'pending' as const, contactedAt: undefined }));
    onUpdateStores(reset);
  };

  const handleRemoveStore = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateStores(stores.filter(s => s.id !== id));
  };

  const handleExportCsv = () => {
    const headers = ['Store Name', 'Domain', 'Clean URL', 'Status', 'Contacted At'];
    const rows = stores.map(s => [
      `"${s.storeName}"`,
      `"${s.domain}"`,
      `"${s.cleanUrl}"`,
      `"${s.status}"`,
      `"${s.contactedAt || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `store_outreach_queue_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStores = stores.filter(store => {
    if (filter !== 'all' && store.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        store.storeName.toLowerCase().includes(q) ||
        store.domain.toLowerCase().includes(q) ||
        store.cleanUrl.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-indigo-400" />
            <span>Store URL Queue</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage target e-commerce stores, upload batch domains, and launch semi-automated outreach.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add URLs</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/80 transition-colors cursor-pointer"
            title="Upload .txt or .csv"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span>Import CSV/TXT</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={onStartCampaign}
            disabled={stores.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Start Campaign</span>
          </button>
        </div>
      </div>

      {/* Real-Time Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 shadow-sm">
          <div className="text-[11px] font-semibold text-zinc-400 flex items-center justify-between">
            <span>Total Target Stores</span>
            <Store className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{metrics.total}</div>
          <div className="text-[10px] text-zinc-500 mt-1">In active database</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 shadow-sm">
          <div className="text-[11px] font-semibold text-emerald-400 flex items-center justify-between">
            <span>Contacted Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300 mt-1.5">{metrics.completed}</div>
          <div className="text-[10px] text-emerald-400/70 mt-1">{metrics.completionRate}% completion rate</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 shadow-sm">
          <div className="text-[11px] font-semibold text-amber-400 flex items-center justify-between">
            <span>Pending In Queue</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 mt-1.5">{metrics.pending}</div>
          <div className="text-[10px] text-amber-400/70 mt-1">Ready for browser visit</div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 shadow-sm">
          <div className="text-[11px] font-semibold text-rose-400 flex items-center justify-between">
            <span>Skipped / Inactive</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-300 mt-1.5">{metrics.skipped}</div>
          <div className="text-[10px] text-rose-400/70 mt-1">Bypassed or no form</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'completed', 'skipped'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab === 'all' ? `All (${stores.length})` : `${tab} (${stores.filter(s => s.status === tab).length})`}
            </button>
          ))}
        </div>

        {/* Search & Export Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search stores or domains..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleExportCsv}
            disabled={stores.length === 0}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 hover:text-white transition-colors border border-zinc-700/80"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetStatuses}
            disabled={stores.length === 0}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 hover:text-white transition-colors border border-zinc-700/80"
            title="Reset All Stores to Pending"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClearAll}
            disabled={stores.length === 0}
            className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 disabled:opacity-40 text-rose-300 transition-colors border border-rose-800/40"
            title="Clear Queue"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Store List Table / Cards */}
      {filteredStores.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
          <Store className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Stores Found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {stores.length === 0
              ? 'Your queue is empty. Paste a list of URLs or load our sample Shopify/WooCommerce stores.'
              : 'No stores match your search query or filter.'}
          </p>
          {stores.length === 0 && (
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={handleLoadDemoStores}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
              >
                Load Sample Stores
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                Paste Store URLs
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredStores.map((store, idx) => {
            const originalIndex = stores.findIndex(s => s.id === store.id);
            const isCurrent = originalIndex === currentIndex;

            return (
              <div
                key={store.id}
                onClick={() => onSelectStore(originalIndex)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-500/70 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/30'
                    : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80'
                }`}
              >
                {/* Store Icon & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      store.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : store.status === 'skipped'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : isCurrent
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {store.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : store.status === 'skipped' ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      originalIndex + 1
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white truncate">{store.storeName}</span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono truncate">{store.domain}</div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        store.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : store.status === 'skipped'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {store.status}
                    </span>
                    {store.contactedAt && (
                      <div className="text-[10px] text-zinc-500 mt-0.5">{store.contactedAt}</div>
                    )}
                  </div>

                  <button
                    onClick={e => handleRemoveStore(store.id, e)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paste URLs Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Add Store URLs to Queue</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Paste store URLs or domains (one per line or separated by commas). The app automatically normalizes them and extracts the store name.
            </p>

            <textarea
              rows={7}
              placeholder="allbirds.com&#10;https://gymshark.com&#10;colourpop.com&#10;veldt-coffee.com"
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              className="w-full p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() =>
                  setPasteText(
                    'nordicwear-studio.com\naurora-organics.shop\nveldt-coffee-roasters.com\nlumin-home-decor.com\napex-fitness-gear.myshopify.com'
                  )
                }
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Paste Example E-Commerce List</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddUrls}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
                >
                  Add to Queue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
