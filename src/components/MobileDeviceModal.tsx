import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Tablet,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Download,
  Share2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface MobileDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
}

export const MobileDeviceModal: React.FC<MobileDeviceModalProps> = ({
  isOpen,
  onClose,
  appUrl = 'https://ais-pre-yno7j7ulifm3xmzmsr247o-958487333034.asia-east1.run.app',
}) => {
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [activeDeviceTab, setActiveDeviceTab] = useState<'scan' | 'ios' | 'android'>('scan');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallSuccess(true);
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(
    appUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-100 relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Mobile & Tablet Controller</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> PWA Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">Control AdGenix live from your phone or tablet</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveDeviceTab('scan')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeDeviceTab === 'scan'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> Scan QR to Connect
          </button>
          <button
            onClick={() => setActiveDeviceTab('ios')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeDeviceTab === 'ios'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" /> iPhone / iPad (iOS)
          </button>
          <button
            onClick={() => setActiveDeviceTab('android')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeDeviceTab === 'android'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Android Phone & Tablet
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 md:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: SCAN QR CODE */}
          {activeDeviceTab === 'scan' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-lg shrink-0">
                  <img
                    src={qrCodeUrl}
                    alt="Scan to open AdGenix on Phone or Tablet"
                    className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-md"
                  />
                  <div className="text-[10px] text-slate-900 font-bold mt-1">Scan with Camera</div>
                </div>

                {/* Information */}
                <div className="space-y-3 flex-1 text-left">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] border border-indigo-500/30">
                    <Sparkles className="w-3 h-3 text-amber-300" /> INSTANT MOBILE LINK
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    Open Camera on iPhone, iPad, or Android
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Point your device's camera at the QR code to launch the live AdGenix control dashboard instantly.
                  </p>

                  <div className="pt-1 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Control lead finding and live email outreach</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Remit & view FamPay / UPI payment invoices</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Installs as standalone full-screen web app</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Link Copy Box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Live Device Control Link</span>
                  <span className="text-indigo-400 font-medium">SSL Secure / Cloud Run</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-black/70 border border-slate-800 font-mono text-[11px] text-slate-300">
                  <span className="truncate flex-1 select-all">{appUrl}</span>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Install PWA Prompt if supported */}
              {isInstallable && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-emerald-400" /> Install AdGenix App
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Add to this device's home screen / desktop with one click
                    </p>
                  </div>
                  <button
                    onClick={handleTriggerInstall}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition shrink-0"
                  >
                    Install Now
                  </button>
                </div>
              )}

              {installSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>AdGenix successfully added to your device home screen!</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: iOS / iPAD INSTRUCTIONS */}
          {activeDeviceTab === 'ios' && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Tablet className="w-4 h-4 text-indigo-400" />
                  How to Install on iPhone & iPad
                </div>
                <p className="text-slate-300 text-xs">
                  Apple iOS / iPadOS allows you to install AdGenix directly onto your Home Screen with zero App Store friction:
                </p>

                <ol className="space-y-3 pt-1">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <div>
                      <strong className="text-white">Open in Safari:</strong>
                      <p className="text-slate-400 text-[11px]">
                        Scan the QR code or open{' '}
                        <a
                          href={appUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 underline font-mono"
                        >
                          {appUrl}
                        </a>{' '}
                        in the Safari browser.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <div>
                      <strong className="text-white">Tap the Share Button:</strong>
                      <p className="text-slate-400 text-[11px]">
                        At the bottom of Safari on iPhone (or top bar on iPad), tap the{' '}
                        <Share2 className="w-3.5 h-3.5 inline text-indigo-400" /> Share icon (rectangle with arrow pointing up).
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <div>
                      <strong className="text-white">Select "Add to Home Screen":</strong>
                      <p className="text-slate-400 text-[11px]">
                        Scroll down the share sheet and tap <strong>"Add to Home Screen"</strong> (with the plus icon).
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      4
                    </span>
                    <div>
                      <strong className="text-white">Tap "Add":</strong>
                      <p className="text-slate-400 text-[11px]">
                        AdGenix will now appear with its custom app icon on your home screen and open in full-screen standalone mode!
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: ANDROID INSTRUCTIONS */}
          {activeDeviceTab === 'android' && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  How to Install on Android Phone & Tablet
                </div>
                <p className="text-slate-300 text-xs">
                  Android devices support full Progressive Web App (PWA) installation:
                </p>

                <ol className="space-y-3 pt-1">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <div>
                      <strong className="text-white">Open in Chrome:</strong>
                      <p className="text-slate-400 text-[11px]">
                        Scan the QR code or open{' '}
                        <a
                          href={appUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 underline font-mono"
                        >
                          {appUrl}
                        </a>{' '}
                        in Google Chrome.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <div>
                      <strong className="text-white">Tap Menu (⋮) or "Install":</strong>
                      <p className="text-slate-400 text-[11px]">
                        Chrome usually displays an "Install AdGenix" bar at the bottom. If not, tap the three dots in the top right.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <div>
                      <strong className="text-white">Select "Install App" / "Add to Home Screen":</strong>
                      <p className="text-slate-400 text-[11px]">
                        Confirm the prompt. AdGenix installs like a native Android APK and appears in your app drawer and home screen.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Quick Features Available on Mobile */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Synced in real time across phone, tablet & desktop
            </span>
            <span className="text-amber-400 font-mono text-[10px]">₹20k – ₹50k Cap</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <a
            href={appUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Open in New Window <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Link Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
