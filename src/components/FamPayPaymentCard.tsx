import React, { useState } from 'react';
import { FAMPAY_ID, PAYEE_NAME, formatRupees, clampRetainerRupees, NON_REFUNDABLE_POLICY, generateUpiUri, generateFamPayQrUrl, MIN_RETAINER_INR, MAX_RETAINER_INR } from '../utils/currency';
import { Copy, Check, QrCode, Smartphone, ExternalLink, ShieldCheck, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';

interface FamPayPaymentCardProps {
  amount?: number;
  brandName?: string;
  onPaymentConfirmed?: () => void;
  showConfirmButton?: boolean;
}

export const FamPayPaymentCard: React.FC<FamPayPaymentCardProps> = ({
  amount,
  brandName = 'Ad Retainer',
  onPaymentConfirmed,
  showConfirmButton = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const clampedAmount = amount ? clampRetainerRupees(amount) : undefined;
  const qrUrl = generateFamPayQrUrl(clampedAmount, `AdGenix Retainer - ${brandName}`);
  const upiUri = generateUpiUri(clampedAmount, `AdGenix Retainer - ${brandName}`);

  const handleCopyId = () => {
    navigator.clipboard.writeText(FAMPAY_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    setIsPaid(true);
    if (onPaymentConfirmed) {
      onPaymentConfirmed();
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-amber-500/30 rounded-2xl p-5 shadow-2xl text-slate-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with FamPay & UPI Badges */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-md">
            fam
          </div>
          <div>
            <div className="font-extrabold text-white text-sm flex items-center gap-2">
              FamPay & UPI Payment
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                INR Only
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Non-Refundable
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Strictly ₹20,000 – ₹50,000 Range • FamPay / UPI Remittance</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>NPCI / UPI 2.0</span>
        </div>
      </div>

      {/* Strict Non-Refundable & Pricing Range Banner */}
      <div className="mb-4 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>Non-Refundable Policy:</strong> Retainer is strictly non-refundable once creative production begins.
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold whitespace-nowrap">
          ₹20k - ₹50k Cap
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center relative z-10">
        {/* QR Code Container */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-slate-800">
          <div className="relative p-2 bg-white rounded-xl shadow-lg">
            <img
              src={qrUrl}
              alt={`FamPay QR Code for ${FAMPAY_ID}`}
              className="w-44 h-44 object-contain rounded-lg"
            />
            {/* Center FamPay emblem */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-9 h-9 rounded-full bg-slate-950 border-2 border-white flex items-center justify-center shadow-lg">
                <span className="text-[10px] font-black text-amber-400">fam</span>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 font-medium flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5 text-amber-400" /> Scan via GPay, PhonePe, Paytm, FamPay
          </span>
        </div>

        {/* Payment Details & FamX Card Mock */}
        <div className="md:col-span-7 space-y-3.5">
          {/* Amount Display */}
          {clampedAmount && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Payable in Indian Rupees</div>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  100% Non-Refundable
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-400 flex items-baseline gap-1.5 mt-1">
                {formatRupees(clampedAmount)}
                <span className="text-xs font-normal text-slate-400">({formatRupees(clampedAmount, false)})</span>
              </div>
            </div>
          )}

          {/* FamPay ID Copy Box */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>FamPay / UPI ID</span>
              <span className="text-amber-400 font-bold">Verified Business</span>
            </div>

            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs">
              <span className="text-white font-bold select-all">{FAMPAY_ID}</span>
              <button
                onClick={handleCopyId}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition shrink-0"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy ID'}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Account Holder:</span>
              <span className="text-slate-200 font-bold">{PAYEE_NAME}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href={upiUri}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition text-center"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Pay with UPI App
            </a>

            {showConfirmButton && (
              <button
                onClick={handleConfirm}
                className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition ${
                  isPaid
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {isPaid ? 'Payment Confirmed' : 'Mark as Paid'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
