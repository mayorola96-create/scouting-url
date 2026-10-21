import React, { useState } from 'react';
import { SenderProfile, compileTemplate, StoreItem } from '../utils/engine';
import { TEMPLATE_PRESETS } from '../data/mockStores';
import { Save, User, Mail, Phone, Tag, MessageSquare, Check, Sparkles, BookOpen, Copy } from 'lucide-react';

interface SetupScreenProps {
  profile: SenderProfile;
  onSaveProfile: (profile: SenderProfile) => void;
  currentStore?: StoreItem;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  profile,
  onSaveProfile,
  currentStore,
}) => {
  const [formData, setFormData] = useState<SenderProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);

  const handleChange = (field: keyof SenderProfile, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onSaveProfile(updated);
  };

  const handleInsertToken = (token: string) => {
    const updated = {
      ...formData,
      messageTemplate: formData.messageTemplate + token,
    };
    setFormData(updated);
    onSaveProfile(updated);
  };

  const handleApplyPreset = (preset: typeof TEMPLATE_PRESETS[0]) => {
    const updated = {
      ...formData,
      subject: preset.subject,
      messageTemplate: preset.message,
    };
    setFormData(updated);
    onSaveProfile(updated);
  };

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const compiledPreview = compileTemplate(formData.messageTemplate, {
    storeName: currentStore?.storeName || 'Nordicwear Studio',
    domain: currentStore?.domain || 'nordicwear-studio.com',
    fullName: formData.fullName || 'Alex Vance',
    email: formData.email || 'alex@brandreach.io',
    phone: formData.phone || '+1 (555) 234-5678',
  });

  const compiledSubject = compileTemplate(formData.subject, {
    storeName: currentStore?.storeName || 'Nordicwear Studio',
    domain: currentStore?.domain || 'nordicwear-studio.com',
    fullName: formData.fullName || 'Alex Vance',
  });

  const copyPreview = () => {
    navigator.clipboard.writeText(compiledPreview);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <span>Sender Profile &amp; Outreach Templates</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Configure your contact details and message templates. The app automatically substitutes dynamic variables for each visited store.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-5">
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Your Contact Information</span>
            </h3>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="setup-name">
                Full Name <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="setup-name"
                  type="text"
                  value={formData.fullName}
                  onChange={e => handleChange('fullName', e.target.value)}
                  placeholder="e.g. Alex Vance"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="setup-email">
                  Email Address <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="setup-email"
                    type="email"
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="alex@company.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="setup-phone">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <input
                    id="setup-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Outreach Message & Template */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Outreach Message Template</span>
              </h3>
            </div>

            {/* Template Presets */}
            <div>
              <span className="block text-[11px] font-medium text-zinc-400 mb-1.5">Load Template Preset:</span>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-medium border border-zinc-700/80 transition-colors flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3 h-3 text-indigo-400" />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="setup-subject">
                Subject Line <span className="text-indigo-400">*</span>
              </label>
              <input
                id="setup-subject"
                type="text"
                value={formData.subject}
                onChange={e => handleChange('subject', e.target.value)}
                placeholder="Partnership inquiry for {store_name}"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Variable Tokens Helper */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-zinc-400">Click to insert dynamic variable:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: '{store_name}', desc: 'Store Name' },
                  { tag: '{domain}', desc: 'Domain' },
                  { tag: '{full_name}', desc: 'Your Name' },
                  { tag: '{email}', desc: 'Your Email' },
                  { tag: '{phone}', desc: 'Your Phone' },
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleInsertToken(item.tag)}
                    className="px-2 py-1 rounded-md bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-300 text-[11px] font-mono transition-colors active:scale-95 flex items-center gap-1"
                    title={`Insert ${item.desc}`}
                  >
                    <Tag className="w-2.5 h-2.5 text-indigo-400" />
                    <span>{item.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="setup-template">
                Outreach Message Pitch <span className="text-indigo-400">*</span>
              </label>
              <textarea
                id="setup-template"
                rows={9}
                value={formData.messageTemplate}
                onChange={e => handleChange('messageTemplate', e.target.value)}
                placeholder="Hi {store_name} Team..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed"
              />
            </div>
          </div>
        </form>

        {/* Live Interpolated Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-4 p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Outreach Preview</span>
              </h3>
              <button
                type="button"
                onClick={copyPreview}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                title="Copy preview text"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedPreview ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="text-[11px] text-zinc-400 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between">
              <span>Previewing for store:</span>
              <strong className="text-indigo-300 font-mono">
                {currentStore?.storeName || 'Nordicwear Studio'}
              </strong>
            </div>

            {/* Subject Preview */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Subject</span>
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 font-medium">
                {compiledSubject || <span className="text-zinc-600 italic">No subject specified</span>}
              </div>
            </div>

            {/* Message Preview */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Message Content</span>
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto font-sans">
                {compiledPreview || <span className="text-zinc-600 italic">No message template entered</span>}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-300 space-y-1">
              <div className="font-semibold text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Zero-Friction In-App Workflow</span>
              </div>
              <p className="text-indigo-300/80 leading-normal">
                When you visit stores in the built-in browser, the Android app injects these exact details, fires input change events, and centers the submit button for instant 1-tap submission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
