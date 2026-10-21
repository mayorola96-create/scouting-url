import React, { useState } from 'react';
import { getAndroidProjectFiles, AndroidFile } from '../android_source/androidCodebase';
import { downloadAndroidProjectZip } from '../utils/zipExporter';
import {
  Download,
  FileCode,
  Check,
  Copy,
  ExternalLink,
  Github,
  Terminal,
  FolderTree,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';

export const AndroidCodeViewer: React.FC = () => {
  const files = getAndroidProjectFiles();
  const [selectedPath, setSelectedPath] = useState<string>(
    'app/src/main/java/com/outreach/storebrowser/MainActivity.kt'
  );
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<{ percent: number; text: string }>({
    percent: 0,
    text: '',
  });
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const selectedFile = files.find(f => f.path === selectedPath) || files[0];

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      setZipProgress({ percent: 10, text: 'Packaging native Kotlin & XML files...' });
      await downloadAndroidProjectZip((pct, status) => {
        setZipProgress({ percent: pct, text: status });
      });
      setTimeout(() => {
        setIsZipping(false);
        setZipProgress({ percent: 0, text: '' });
      }, 1500);
    } catch (err) {
      console.error('Download error:', err);
      setIsZipping(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Hero Download Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-zinc-900 to-zinc-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>100% Production-Ready Native Android Codebase</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Android APK Project &amp; GitHub Auto-Builder
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Complete Kotlin source code with full WebView, JavaScript form injector, link scanner, local persistence, plus an automated GitHub Actions CI/CD workflow that compiles your installable <code className="text-emerald-400 font-mono bg-emerald-950/40 px-1 rounded">app-debug.apk</code> in the cloud with zero manual Android Studio configuration.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center sm:items-end">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer w-full sm:w-auto"
            >
              <Download className={`w-5 h-5 ${isZipping ? 'animate-bounce' : ''}`} />
              <span>Download Complete Android APK Source + Auto-Builder (.zip)</span>
            </button>

            {isZipping && (
              <div className="w-full mt-3 space-y-1">
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-200"
                    style={{ width: `${zipProgress.percent}%` }}
                  />
                </div>
                <div className="text-[11px] text-zinc-400 text-center font-mono">
                  {zipProgress.text}
                </div>
              </div>
            )}
            {!isZipping && (
              <span className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Includes Gradle 8.4 Wrapper + GitHub Actions Workflow</span>
              </span>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 3-Step Cloud Compile Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h3 className="font-bold text-sm text-white">Download the .ZIP</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Click the green button above to download the full Android project containing Kotlin source, Gradle build scripts, and XML layouts.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h3 className="font-bold text-sm text-white">Push to GitHub Repo</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Create a new free repository on GitHub and push the unzipped files. GitHub will immediately trigger the included <code className="text-indigo-300 font-mono">.github/workflows/build-apk.yml</code>.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h3 className="font-bold text-sm text-white">Install APK on Phone</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Under your repo's <strong>Actions</strong> tab, click the completed workflow run to download your compiled <code className="text-emerald-400 font-mono">app-debug.apk</code> directly!
          </p>
        </div>
      </div>

      {/* Live Interactive Source Code Browser */}
      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl">
        {/* Code Viewer Top Bar */}
        <div className="bg-zinc-900/90 border-b border-zinc-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-xs font-semibold text-white">
              {selectedFile.path}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-800 text-zinc-400">
              {selectedFile.language}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy File Content</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Navigator & Code Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
          {/* File Tree Sidebar */}
          <div className="lg:col-span-4 bg-zinc-900/40 border-r border-zinc-800/80 p-3 space-y-1 overflow-y-auto max-h-[580px]">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1 mb-1 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
              <span>Project Files ({files.length})</span>
            </div>

            {files.map(file => {
              const isSelected = file.path === selectedPath;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedPath(file.path)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-start gap-2.5 text-xs ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                      : 'hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-zinc-500'}`} />
                  <div className="min-w-0">
                    <div className="truncate font-mono">{file.path}</div>
                    <div className="text-[10px] text-zinc-500 truncate font-sans">
                      {file.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Syntax Code Editor Box */}
          <div className="lg:col-span-8 bg-zinc-950 p-4 overflow-x-auto max-h-[580px] overflow-y-auto">
            <pre className="font-mono text-xs text-zinc-200 leading-relaxed select-text whitespace-pre">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
