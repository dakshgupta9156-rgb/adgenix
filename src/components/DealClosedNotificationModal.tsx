import React, { useState } from 'react';
import { ClosedDeal } from '../types/agency';
import { Award, CheckCircle2, Mail, ExternalLink, X, Sparkles, Volume2, ShieldCheck, QrCode, Lock, Clock, Check, AlertCircle, FileCheck } from 'lucide-react';
import { playDealClosedChime, playPaymentReceivedKaChing } from '../utils/audio';
import { formatRupees, formatRupeesFull, FAMPAY_ID, PAYEE_NAME, clampRetainerRupees } from '../utils/currency';
import { FamPayPaymentCard } from './FamPayPaymentCard';

interface DealClosedNotificationModalProps {
  deal: ClosedDeal | null;
  isOpen: boolean;
  onClose: () => void;
  ownerEmail: string;
  onSendGmailInvoice?: (deal: ClosedDeal) => void;
  onPaymentVerified?: (deal: ClosedDeal, utr: string) => void;
  onOpenAgreement?: (deal: ClosedDeal) => void;
}

export const DealClosedNotificationModal: React.FC<DealClosedNotificationModalProps> = ({
  deal,
  isOpen,
  onClose,
  ownerEmail,
  onSendGmailInvoice,
  onPaymentVerified,
  onOpenAgreement,
}) => {
  const [utrInput, setUtrInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(deal?.paymentStatus === 'payment_verified');
  const [notificationDispatched, setNotificationDispatched] = useState(deal?.paymentNotificationSent || false);

  if (!isOpen || !deal) return null;

  const validAmount = clampRetainerRupees(deal.closedAmount);

  const handleVerifyPayment = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/notify/owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal,
          ownerEmail,
          paymentVerified: true,
          upiUtr: utrInput.trim() || `UTR-${Date.now().toString().slice(-8)}`,
        }),
      });

      const data = await res.json();
      if (data.success && data.notified) {
        setIsVerified(true);
        setNotificationDispatched(true);
        playPaymentReceivedKaChing();
        if (onPaymentVerified) {
          onPaymentVerified(deal, utrInput.trim());
        }
      }
    } catch (e) {
      console.error('Failed to verify payment:', e);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl shadow-emerald-950/60 text-slate-100 relative">
        {/* Top Glow Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 border-b border-emerald-500/30 text-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 mx-auto mb-2 shadow-lg shadow-emerald-500/30">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-emerald-400">
              <Award className="w-7 h-7" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AUTONOMOUS DEAL CLOSED!
          </div>

          <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30">
              <Lock className="w-3 h-3" /> 100% NON-REFUNDABLE
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
              ₹20,000 – ₹50,000 BOUNDED
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {formatRupees(validAmount)}
            <span className="text-sm font-normal text-slate-300"> /month Retainer</span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-300 font-medium mt-1">
            {formatRupeesFull(validAmount)} • Client: <span className="text-white font-bold">{deal.brandName}</span> ({deal.domain})
          </p>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 md:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* FamPay Payment Card & QR Code */}
          <FamPayPaymentCard
            amount={validAmount}
            brandName={deal.brandName}
            showConfirmButton={true}
          />

          {/* Strict Payment Verification & Notification Flow (Only notifies when money comes) */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${isVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {isVerified ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span>Payment Status:</span>
                    {isVerified ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        MONEY RECEIVED & VERIFIED
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        AWAITING CLIENT REMITTANCE (NO MONEY RECEIVED YET)
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    {isVerified
                      ? `Confirmed credited to FamPay ID: ${FAMPAY_ID} (${PAYEE_NAME}). Payment notification alert dispatched to ${ownerEmail}.`
                      : `No email notification has been sent to you. Per your setting, notification is strictly blocked until client transfer is verified.`}
                  </p>
                </div>
              </div>

              {onSendGmailInvoice && (
                <button
                  onClick={() => onSendGmailInvoice(deal)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Mail className="w-3.5 h-3.5" /> Send Invoice to Client
                </button>
              )}
            </div>

            {/* Inflow Verification Action Box */}
            {!isVerified ? (
              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full">
                  <label className="text-[10px] text-slate-400 font-medium block mb-1">
                    Enter UPI Transaction / UTR ID from FamPay phone alert to verify:
                  </label>
                  <input
                    type="text"
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value)}
                    placeholder="e.g. 429182910283 or Phone Alert Ref"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  onClick={handleVerifyPayment}
                  disabled={isVerifying}
                  className="w-full sm:w-auto px-4 py-2 mt-4 sm:mt-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isVerifying ? 'Verifying...' : 'Confirm Money Came (Send Me Alert)'}
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span>✅ Notification alert sent to {ownerEmail}</span>
                <span className="font-mono text-[11px] text-slate-400">UTR: {utrInput || 'VERIFIED-INFLOW'}</span>
              </div>
            )}
          </div>

          {/* Agreement Breakdown */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Package Type:</span>
              <span className="font-semibold text-slate-200">{deal.dealPackage}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Authorized Signer:</span>
              <span className="font-semibold text-slate-200">{deal.clientSigner}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Monthly Retainer Amount:</span>
              <span className="font-bold text-emerald-400">{formatRupees(validAmount)} ({formatRupeesFull(validAmount)})</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Payment Channel:</span>
              <span className="font-semibold text-amber-300">FamPay / UPI ({FAMPAY_ID} - {PAYEE_NAME})</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Refund Terms:</span>
              <span className="font-bold text-rose-400">Strictly 100% Non-Refundable (₹20,000 - ₹50,000 Policy)</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Contract Execution Date:</span>
              <span className="font-semibold text-slate-200">{deal.contractDate}</span>
            </div>
          </div>

          {/* Deliverables List */}
          <div>
            <div className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Automated Deliverables Handover:
            </div>
            <div className="space-y-1.5">
              {deal.deliverables.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => playDealClosedChime()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
            >
              <Volume2 className="w-3.5 h-3.5" /> Replay Chime
            </button>

            {onOpenAgreement && (
              <button
                onClick={() => onOpenAgreement(deal)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-xs font-bold text-indigo-300 border border-indigo-500/30 transition"
              >
                <FileCheck className="w-3.5 h-3.5 text-indigo-400" /> View Agreement (SLA)
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition"
          >
            Awesome, Deal Won!
          </button>
        </div>
      </div>
    </div>
  );
};
