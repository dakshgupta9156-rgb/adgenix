import React, { useState } from 'react';
import { Settings, X, Mail, Volume2, Bell, Check, Sparkles, QrCode, Lock, AlertTriangle } from 'lucide-react';
import { playDealClosedChime } from '../utils/audio';
import { FAMPAY_ID, PAYEE_NAME, formatRupees, formatRupeesFull, MIN_RETAINER_INR, MAX_RETAINER_INR, clampRetainerRupees } from '../utils/currency';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerEmail: string;
  onSaveEmail: (email: string) => void;
  floorPrice: number;
  onSaveFloorPrice: (price: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  ownerEmail,
  onSaveEmail,
  floorPrice,
  onSaveFloorPrice,
}) => {
  const [emailInput, setEmailInput] = useState(ownerEmail);
  const [floorInput, setFloorInput] = useState(clampRetainerRupees(floorPrice));
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const clampedFloor = clampRetainerRupees(floorInput);
    onSaveEmail(emailInput);
    onSaveFloorPrice(clampedFloor);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleTestAlert = () => {
    playDealClosedChime();
    fetch('/api/notify/owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deal: {
          brandName: 'Test Brand India',
          closedAmount: 32000,
          dealPackage: 'Growth UGC + Meta Sprint',
        },
        ownerEmail: emailInput,
      }),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-slate-100">
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Agency & FamPay Settings</h3>
              <p className="text-xs text-slate-400">Manage owner deal alerts & Indian Rupee pricing</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* FamPay Account Box */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" /> FamPay / UPI Receiving Account
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold">
                ACTIVE
              </span>
            </div>
            <div className="text-slate-300">
              FamPay ID: <span className="font-mono text-white font-bold select-all">{FAMPAY_ID}</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Name: <span className="text-slate-200 font-semibold">{PAYEE_NAME}</span> (All client payments in INR)
            </div>
          </div>

          {/* Strict Non-Refundable & 20k-50k Rule Callout */}
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-[11px] text-rose-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-300">
              <Lock className="w-3.5 h-3.5" /> Strict Policy: 100% Non-Refundable Retainer
            </div>
            <p className="text-rose-200/80 leading-relaxed">
              Agency policy strictly enforces retainers between <strong>₹20,000 and ₹50,000 only</strong>. All payments are non-refundable once creative production begins.
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              Owner Notification Email
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Where the autonomous agent dispatches instant alerts whenever a deal closes.
            </p>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 transition font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="font-bold text-emerald-400 text-sm">₹</span>
                Minimum Floor Price (₹20,000 to ₹50,000)
              </label>
              <span className="text-[10px] text-amber-400 font-semibold">Strict INR Cap</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Lowest retainer the autonomous agent is permitted to accept. Constrained between ₹20,000 and ₹50,000 only.
            </p>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">₹</span>
              <input
                type="number"
                min={MIN_RETAINER_INR}
                max={MAX_RETAINER_INR}
                step={1000}
                value={floorInput}
                onChange={(e) => setFloorInput(clampRetainerRupees(parseInt(e.target.value, 10)))}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 transition font-mono"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
              <span>Current floor: {formatRupees(floorInput)}</span>
              <span>Allowed: ₹20,000 – ₹50,000</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestAlert}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center justify-center gap-2 transition"
            >
              <Volume2 className="w-4 h-4 text-emerald-400" />
              Test Deal-Won Sound & Dispatch Alert (Rupees)
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : null}
            {saved ? 'Saved Settings!' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};
