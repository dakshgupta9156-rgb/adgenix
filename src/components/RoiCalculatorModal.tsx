import React, { useState } from 'react';
import {
  X,
  Calculator,
  TrendingUp,
  Sparkles,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatRupees, formatRupeesFull, FAMPAY_ID, MIN_RETAINER_INR, MAX_RETAINER_INR } from '../utils/currency';

interface RoiCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName?: string;
  onUsePitchSnippet?: (snippet: string) => void;
}

export const RoiCalculatorModal: React.FC<RoiCalculatorModalProps> = ({
  isOpen,
  onClose,
  brandName = 'D2C Brand',
  onUsePitchSnippet,
}) => {
  const [adSpend, setAdSpend] = useState<number>(300000); // ₹3,00,000 / mo
  const [currentRoas, setCurrentRoas] = useState<number>(2.0); // 2.0x
  const [retainerTier, setRetainerTier] = useState<number>(35000); // ₹35,000 / mo
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Math:
  // Current revenue = adSpend * currentRoas
  const currentRevenue = adSpend * currentRoas;
  // With AdGenix direct-response creative, conservatively +35% ROAS improvement
  const expectedRoas = +(currentRoas * 1.35).toFixed(2);
  const projectedRevenue = Math.round(adSpend * expectedRoas);
  const incrementalRevenue = projectedRevenue - currentRevenue;
  const netClientProfit = incrementalRevenue - retainerTier;
  const roiMultiplier = +(incrementalRevenue / retainerTier).toFixed(1);

  const pitchSnippet = `Based on your current ~${formatRupees(adSpend)}/mo Meta spend at ${currentRoas}x ROAS: By deploying AdGenix high-hook UGC creatives, we project lifting ROAS to ${expectedRoas}x. That delivers +${formatRupees(incrementalRevenue)}/mo in additional revenue for an investment of ${formatRupees(retainerTier)}/mo (${roiMultiplier}x ROI on the retainer).`;

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(pitchSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onUsePitchSnippet) {
      onUsePitchSnippet(pitchSnippet);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-100 relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Client Retainer & ROAS Forecaster</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {brandName}
                </span>
              </div>
              <p className="text-xs text-slate-400">Calculate economic justification for ₹20,000 - ₹50,000 retainers</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Sliders / Inputs */}
          <div className="space-y-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
            {/* Ad Spend */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-300 font-semibold">Client Current Monthly Ad Spend:</span>
                <span className="text-white font-mono font-bold text-sm">{formatRupees(adSpend)}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="2500000"
                step="25000"
                value={adSpend}
                onChange={(e) => setAdSpend(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>₹50,000/mo</span>
                <span>₹10,00,000/mo</span>
                <span>₹25,00,000/mo</span>
              </div>
            </div>

            {/* Current ROAS */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-300 font-semibold">Current Blended ROAS:</span>
                <span className="text-indigo-400 font-mono font-bold text-sm">{currentRoas}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="4.5"
                step="0.1"
                value={currentRoas}
                onChange={(e) => setCurrentRoas(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1.0x (Break-even)</span>
                <span>2.5x (Average)</span>
                <span>4.5x (High Scale)</span>
              </div>
            </div>

            {/* Retainer Selection */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-300 font-semibold">Proposed AdGenix Retainer Tier:</span>
                <span className="text-emerald-400 font-mono font-bold text-sm">{formatRupees(retainerTier)}/mo</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[20000, 35000, 50000].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setRetainerTier(tier)}
                    className={`py-2 px-3 rounded-lg font-bold text-xs transition border ${
                      retainerTier === tier
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {formatRupees(tier)}/mo
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Forecasted Impact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">Target ROAS Lift</div>
              <div className="text-xl font-bold text-indigo-400 flex items-baseline gap-1">
                {expectedRoas}x <span className="text-xs text-emerald-400 font-normal">(+35%)</span>
              </div>
              <div className="text-[10px] text-slate-500">Eliminates creative ad fatigue</div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
              <div className="text-[10px] uppercase font-bold text-emerald-400">Extra Monthly Revenue</div>
              <div className="text-xl font-bold text-emerald-300">
                +{formatRupees(incrementalRevenue)}
              </div>
              <div className="text-[10px] text-emerald-400/80">Direct top-line addition</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">Return on Retainer</div>
              <div className="text-xl font-bold text-amber-400">
                {roiMultiplier}x ROI
              </div>
              <div className="text-[10px] text-slate-500">Net gain: +{formatRupees(netClientProfit)}</div>
            </div>
          </div>

          {/* Copyable Pitch Snippet */}
          <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Value-First Pitch Script for Cold Email:
              </span>
              <button
                onClick={handleCopyPitch}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 font-bold text-[10px] transition border border-indigo-500/30"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied to Clipboard' : 'Copy Pitch Snippet'}
              </button>
            </div>
            <p className="text-slate-300 bg-slate-900/80 p-3 rounded-lg font-mono text-[11px] leading-relaxed border border-slate-800">
              "{pitchSnippet}"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
