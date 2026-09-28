import React, { useState } from 'react';
import { X, QrCode, Lock } from 'lucide-react';
import { FamPayPaymentCard } from './FamPayPaymentCard';
import { FAMPAY_ID, PAYEE_NAME, MIN_RETAINER_INR, MAX_RETAINER_INR, clampRetainerRupees, formatRupees } from '../utils/currency';

interface FamPayQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
}

export const FamPayQrModal: React.FC<FamPayQrModalProps> = ({ isOpen, onClose, initialAmount = 35000 }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(clampRetainerRupees(initialAmount));

  if (!isOpen) return null;

  const presets = [20000, 28000, 35000, 42000, 50000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl text-slate-100 relative">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">FamPay & UPI Official QR</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Non-Refundable
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Receive retainers in Indian Rupees (₹20,000 – ₹50,000 Range)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Amount Selector */}
        <div className="px-5 pt-4 pb-1">
          <div className="text-[11px] text-slate-400 mb-2 font-medium flex items-center justify-between">
            <span>Select Preset Invoice Amount:</span>
            <span className="text-amber-300 font-bold">{formatRupees(selectedAmount)}</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {presets.map((amt) => (
              <button
                key={amt}
                onClick={() => setSelectedAmount(amt)}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition border ${
                  selectedAmount === amt
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {formatRupees(amt)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          <FamPayPaymentCard
            amount={selectedAmount}
            brandName="Live Client Retainer"
            showConfirmButton={false}
          />
        </div>

        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400 text-[11px]">
            FamPay ID: <strong className="text-amber-400 font-mono">{FAMPAY_ID}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
