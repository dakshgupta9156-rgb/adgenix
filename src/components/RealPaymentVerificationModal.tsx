import React, { useState } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  QrCode,
  Smartphone,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { FAMPAY_ID, PAYEE_NAME, formatRupees, generateFamPayQrUrl, generateUpiUri } from '../utils/currency';

interface RealPaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGmailConnect?: () => void;
  onOpenEmailPitch?: () => void;
}

export const RealPaymentVerificationModal: React.FC<RealPaymentVerificationModalProps> = ({
  isOpen,
  onClose,
  onOpenGmailConnect,
  onOpenEmailPitch,
}) => {
  const [testAmount, setTestAmount] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const testQrUrl = generateFamPayQrUrl(testAmount, 'FamPay Real UPI Test Ping');
  const testUpiUri = generateUpiUri(testAmount, 'FamPay Real UPI Test Ping');

  const handleCopyId = () => {
    navigator.clipboard.writeText(FAMPAY_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-100 relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Why Haven't You Received Real Money Yet?</h3>
              </div>
              <p className="text-xs text-slate-400">Understanding how real UPI transactions flow to your phone</p>
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
          {/* Honest Explanation Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
              This Web App is a Sales Agent & Outreach Tool, Not a Bank
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              AdGenix finds real D2C brand leads, audits their ads, and writes high-converting cold pitches with your <strong>FamPay QR code</strong>.
              However, <strong>websites cannot magically create money in your bank account</strong>. Real rupees only arrive when a client opens their banking app (Google Pay, PhonePe, Paytm) and approves a UPI payment to your FamPay ID.
            </p>
          </div>

          {/* Real Steps to Receive Money */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> 3 Steps Required for Real Money to Hit Your Bank
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <div className="font-bold text-white text-xs">Send Real Pitches</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Use your connected Gmail (<span className="text-slate-200 underline">dakshgupta9156@gmail.com</span>) to dispatch the spec pitches to actual brands (Foxtale, Mokobara, etc.).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <div className="font-bold text-white text-xs">Client Approves Retainer</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  When a brand replies to your pitch and agrees to the retainer terms (₹20,000 – ₹50,000 Non-Refundable), you send them your FamPay invoice.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <div className="font-bold text-emerald-400 text-xs">Client Scans QR & Pays</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  The client enters their UPI PIN in GPay/PhonePe. The funds instantly arrive in the FamPay app on your phone.
                </p>
              </div>
            </div>
          </div>

          {/* Test Real UPI Connectivity Tool (₹1 Test) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  Test Live UPI Connectivity (Self-Test ₹1)
                </div>
                <p className="text-[11px] text-slate-400">
                  Scan this QR code with your own Google Pay or PhonePe right now to verify that your FamPay ID receives real money and gives an instant phone notification.
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setTestAmount(1)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                    testAmount === 1
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  ₹1 Test
                </button>
                <button
                  onClick={() => setTestAmount(10)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                    testAmount === 10
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  ₹10 Test
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="p-3 bg-white rounded-xl shadow-lg shrink-0 flex flex-col items-center">
                <img
                  src={testQrUrl}
                  alt="Scan ₹1 Test UPI QR"
                  className="w-36 h-36 object-contain rounded"
                />
                <div className="text-[10px] text-slate-900 font-bold mt-1">Scan via GPay / PhonePe / Paytm</div>
              </div>

              <div className="space-y-3 flex-1 text-left">
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Destination FamPay Account:</div>
                  <div className="p-2 rounded-lg bg-black/60 border border-slate-800 flex items-center justify-between font-mono text-xs">
                    <span className="text-white font-bold select-all">{FAMPAY_ID}</span>
                    <button
                      onClick={handleCopyId}
                      className="px-2.5 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] transition flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Payee Name: <strong className="text-white">{PAYEE_NAME}</strong>
                  </div>
                </div>

                <div className="pt-1">
                  <a
                    href={testUpiUri}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Open UPI App on this Phone
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400">
            Real payments deposit into your phone's FamPay account, not in browser cookies.
          </div>

          <div className="flex items-center gap-2">
            {onOpenEmailPitch && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEmailPitch();
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                Send Pitch to Real Brand <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
