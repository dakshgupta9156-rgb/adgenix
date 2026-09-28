import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink, Sparkles, UserCheck } from 'lucide-react';
import { sendGmailMessage, sendAdGenixTestEmail, SendEmailResult } from '../utils/gmailService';
import { FAMPAY_ID, PAYEE_NAME } from '../utils/currency';

interface SendEmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  currentUserEmail?: string | null;
  targetRecipient: string;
  defaultSubject?: string;
  defaultBody?: string;
  isTestEmail?: boolean;
  onSuccess?: (result: SendEmailResult) => void;
  onRequireLogin: () => void;
}

export const SendEmailConfirmationModal: React.FC<SendEmailConfirmationModalProps> = ({
  isOpen,
  onClose,
  accessToken,
  currentUserEmail,
  targetRecipient,
  defaultSubject = 'AdGenix Performance Ad Audit & Spec Creative',
  defaultBody,
  isTestEmail = false,
  onSuccess,
  onRequireLogin,
}) => {
  const [subject, setSubject] = useState(defaultSubject);
  const [recipient, setRecipient] = useState(targetRecipient || 'dakshgupta9156@gmail.com');
  const [body, setBody] = useState(
    defaultBody ||
      `Hey there,\n\nOur team at AdGenix audited your digital ad creatives and noticed significant creative fatigue on Meta Feed & Reels.\n\nWe prepared 2 spec high-converting UGC concepts and copy angles tailored to boost your ROAS.\n\nMonthly retainers are ₹20,000 – ₹50,000 (100% Non-refundable), settled via FamPay / UPI ID: ${FAMPAY_ID}.\n\nWould you like us to send the 15-second storyboard?\n\nBest regards,\nDaksh Gupta\nFounder & Performance Lead, AdGenix\ndakshgupta9156@gmail.com`
  );
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [sentMessageId, setSentMessageId] = useState('');

  // Keep state in sync when target recipient or default body changes
  React.useEffect(() => {
    if (targetRecipient) setRecipient(targetRecipient);
  }, [targetRecipient]);

  React.useEffect(() => {
    if (defaultSubject) setSubject(defaultSubject);
  }, [defaultSubject]);

  React.useEffect(() => {
    if (defaultBody) setBody(defaultBody);
  }, [defaultBody]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!accessToken) {
      onRequireLogin();
      return;
    }

    setIsSending(true);
    setStatus('sending');
    setErrorMessage('');

    try {
      let res: SendEmailResult;
      if (isTestEmail) {
        res = await sendAdGenixTestEmail(accessToken, recipient);
      } else {
        res = await sendGmailMessage({
          accessToken,
          to: recipient,
          subject,
          bodyText: body,
          fromName: 'Daksh Gupta - AdGenix',
        });
      }

      if (res.success) {
        setStatus('success');
        setSentMessageId(res.messageId || 'SENT_OK');
        if (onSuccess) onSuccess(res);
      } else {
        setStatus('error');
        setErrorMessage(res.error || 'Failed to dispatch email via Gmail API.');
      }
    } catch (err: any) {
      console.error('Error sending email:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Error communicating with Gmail API. Check OAuth permissions.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-100 relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {isTestEmail ? 'Send Live Test Email via Gmail' : 'Confirm Email Dispatch'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Gmail API
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Action requires your explicit confirmation before transmitting via Gmail
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Auth Status Notification */}
          {!accessToken ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <AlertTriangle className="w-4 h-4" />
                Google Authentication Required
              </div>
              <p className="text-slate-300 text-xs">
                To send emails on your behalf via Gmail, you must connect your Google account with the Gmail Send scope.
              </p>
              <button
                onClick={onRequireLogin}
                className="mt-1 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition"
              >
                Sign in with Google Now
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-medium">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Connected as: <strong className="text-white font-mono">{currentUserEmail || 'Google User'}</strong></span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                Gmail Scope Active
              </span>
            </div>
          )}

          {/* Confirmation Notice */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> User Confirmation Details
            </div>
            <p className="text-slate-300">
              The following email will be dispatched directly through your Gmail mailbox to <strong className="text-white font-mono">{recipient}</strong>.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Recipient Email (To:)
              </label>
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                placeholder="dakshgupta9156@gmail.com"
              />
              {recipient === currentUserEmail && (
                <div className="mt-1.5 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-start gap-1.5">
                  <span className="shrink-0">ℹ️</span>
                  <span>
                    You are sending this to your own address (<strong className="text-white font-mono">{currentUserEmail}</strong>). It will appear in your Gmail inbox marked as <strong>"me"</strong>.
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Email Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isTestEmail}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Email Content Preview
              </label>
              {isTestEmail ? (
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 text-xs space-y-2 max-h-56 overflow-y-auto font-sans">
                  <div className="font-semibold text-emerald-400">
                    🚀 [AdGenix Live Verification] Gmail API & Payment Gateway Connected!
                  </div>
                  <p>
                    Confirms active Gmail API connection, outlines autonomous client discovery, creative ad generation, dynamic negotiation (strictly ₹20,000 – ₹50,000, 100% non-refundable), and FamPay / UPI payment remittance to <strong className="text-amber-300 font-mono">{FAMPAY_ID}</strong> ({PAYEE_NAME}).
                  </p>
                  <div className="p-2 rounded bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-[11px] flex items-center justify-between">
                    <span>⚡ Embedded FamPay & UPI QR Code Image</span>
                    <span className="font-mono text-white text-[10px]">{FAMPAY_ID}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-slate-400">
                    Best regards,<br />
                    <strong className="text-white font-semibold">Daksh Gupta</strong><br />
                    Founder & Performance Lead, AdGenix<br />
                    <span className="text-indigo-400 font-mono">dakshgupta9156@gmail.com</span>
                  </div>
                </div>
              ) : (
                <textarea
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                />
              )}
            </div>
          </div>

          {/* Status Feedback */}
          {status === 'success' && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Email Successfully Dispatched via Gmail!
              </div>
              <p className="text-[11px] text-emerald-200">
                Delivered to <strong>{recipient}</strong>. Gmail Message ID: <span className="font-mono text-white text-[10px]">{sentMessageId}</span>
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-white">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Failed to Send Email
              </div>
              <p className="text-[11px] text-rose-200">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Footer with Explicit Confirm/Cancel */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!accessToken ? (
              <button
                onClick={onRequireLogin}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
              >
                Sign in with Google First
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={isSending || status === 'sending'}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isSending ? 'Sending via Gmail...' : 'Confirm & Send Email'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
