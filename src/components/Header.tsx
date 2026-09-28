import React, { useState } from 'react';
import { Bot, Zap, Bell, Settings, Sparkles, Award, CheckCircle2, QrCode, Mail, Smartphone, HelpCircle, FolderGit2, Calculator, Triangle } from 'lucide-react';
import { ClosedDeal } from '../types/agency';
import { formatRupees, FAMPAY_ID } from '../utils/currency';

interface HeaderProps {
  isAutopilotActive: boolean;
  onToggleAutopilot: () => void;
  onOpenDiscover: () => void;
  onOpenSettings: () => void;
  onOpenFamPayQr: () => void;
  onOpenGmailTest: () => void;
  onFindAndEmailLeadsLive?: () => void;
  onOpenMobileDeviceModal?: () => void;
  onOpenPaymentHelp?: () => void;
  onOpenGitHubSync?: () => void;
  onOpenDeployVercel?: () => void;
  onOpenRoiCalculator?: () => void;
  isGmailConnected: boolean;
  closedDeals: ClosedDeal[];
  onSelectDeal: (deal: ClosedDeal) => void;
  ownerEmail: string;
}

export const Header: React.FC<HeaderProps> = ({
  isAutopilotActive,
  onToggleAutopilot,
  onOpenDiscover,
  onOpenSettings,
  onOpenFamPayQr,
  onOpenGmailTest,
  onFindAndEmailLeadsLive,
  onOpenMobileDeviceModal,
  onOpenPaymentHelp,
  onOpenGitHubSync,
  onOpenDeployVercel,
  onOpenRoiCalculator,
  isGmailConnected,
  closedDeals,
  onSelectDeal,
  ownerEmail,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 p-0.5 shadow-lg shadow-indigo-600/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-black text-white tracking-tight">AdGenix</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                LIVE AGENT
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                ₹20,000 – ₹50,000 (Non-Refundable)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Lead Finder • UGC & Meta Ad Studio • Autonomous Price Closer • FamPay / UPI
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Gmail Dispatcher Trigger */}
          <button
            onClick={onOpenGmailTest}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition ${
              isGmailConnected
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/30'
            }`}
            title={isGmailConnected ? `Gmail Connected: Click to Send Test Email to ${ownerEmail}` : 'Connect Gmail to send emails'}
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isGmailConnected ? 'Gmail Active' : 'Connect Gmail'}
            </span>
          </button>

          {/* FamPay QR Trigger */}
          <button
            onClick={onOpenFamPayQr}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold shadow-sm transition"
            title={`FamPay ID: ${FAMPAY_ID}`}
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">FamPay QR</span>
          </button>

          {/* Real Rupee Inflow Help & Test Trigger */}
          {onOpenPaymentHelp && (
            <button
              onClick={onOpenPaymentHelp}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 text-xs font-semibold shadow-sm transition"
              title="Why haven't I received money yet? Live UPI flow & ₹1 test"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Rupee Help & Test</span>
            </button>
          )}

          {/* Phone / Tablet Remote Control Button */}
          {onOpenMobileDeviceModal && (
            <button
              onClick={onOpenMobileDeviceModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold shadow-sm transition"
              title="Control from Phone or Tablet / Download PWA"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Phone / Tablet</span>
            </button>
          )}

          {/* GitHub Hosting & Sync Button */}
          {onOpenGitHubSync && (
            <button
              onClick={onOpenGitHubSync}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition"
              title="Host Codebase on GitHub"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-white" />
              <span className="hidden md:inline">Host on GitHub</span>
            </button>
          )}

          {/* Vercel Deployment Button */}
          {onOpenDeployVercel && (
            <button
              onClick={onOpenDeployVercel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-slate-900 text-white border border-slate-700 text-xs font-bold shadow-sm transition"
              title="Deploy on Vercel"
            >
              <Triangle className="w-3.5 h-3.5 fill-white" />
              <span className="hidden lg:inline">Deploy on Vercel</span>
            </button>
          )}

          {/* ROI Calculator Trigger */}
          {onOpenRoiCalculator && (
            <button
              onClick={onOpenRoiCalculator}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/25 text-xs font-semibold shadow-sm transition"
              title="Client Retainer & ROAS Forecaster"
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline">ROAS Calculator</span>
            </button>
          )}

          {/* Find & Email Leads Live */}
          {onFindAndEmailLeadsLive && (
            <button
              onClick={onFindAndEmailLeadsLive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition"
              title="Scout fresh D2C leads and dispatch cold email pitches with FamPay QR signed by Daksh Gupta"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Find & Email Leads Live</span>
              <span className="sm:hidden">Email Leads</span>
            </button>
          )}

          {/* Autopilot Switch */}
          <button
            onClick={onToggleAutopilot}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-sm ${
              isAutopilotActive
                ? 'bg-emerald-600 text-white shadow-emerald-600/30 animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isAutopilotActive ? 'fill-white' : 'text-slate-400'}`} />
            <span className="hidden md:inline">
              {isAutopilotActive ? 'Autopilot: ON' : 'Autopilot: OFF'}
            </span>
          </button>

          {/* Discover Leads */}
          <button
            onClick={onOpenDiscover}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Leads</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition relative"
            >
              <Bell className="w-4 h-4" />
              {closedDeals.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-extrabold text-slate-950 flex items-center justify-center">
                  {closedDeals.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 px-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-400" /> Deal Won Notifications
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{ownerEmail}</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {closedDeals.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No closed deals yet. Start autopilot or negotiate with leads!
                    </div>
                  ) : (
                    closedDeals.map((deal) => (
                      <div
                        key={deal.dealId}
                        onClick={() => {
                          onSelectDeal(deal);
                          setShowNotifications(false);
                        }}
                        className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-white mb-0.5">
                          <span>{deal.brandName}</span>
                          <span className="text-emerald-400 font-extrabold">
                            {formatRupees(deal.closedAmount)}/mo
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{deal.dealPackage}</p>
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3 h-3" /> Dispatched to owner email & FamPay active
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
