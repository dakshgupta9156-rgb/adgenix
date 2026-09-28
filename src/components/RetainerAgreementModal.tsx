import React, { useState } from 'react';
import { ClosedDeal } from '../types/agency';
import {
  X,
  FileCheck,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Download,
  Building2,
  Calendar,
  Lock,
  Sparkles,
} from 'lucide-react';
import { formatRupees, formatRupeesFull, FAMPAY_ID, PAYEE_NAME, NON_REFUNDABLE_POLICY } from '../utils/currency';

interface RetainerAgreementModalProps {
  deal: ClosedDeal | null;
  isOpen: boolean;
  onClose: () => void;
  ownerEmail: string;
}

export const RetainerAgreementModal: React.FC<RetainerAgreementModalProps> = ({
  deal,
  isOpen,
  onClose,
  ownerEmail,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !deal) return null;

  const agreementDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const contractReference = `ADG-RET-${deal.dealId.slice(-6).toUpperCase()}-${new Date().getFullYear()}`;

  const contractFullText = `========================================================================
OFFICIAL CLIENT PERFORMANCE RETAINER AGREEMENT (SLA)
Ref: ${contractReference}
Date of Effective Agreement: ${agreementDate}
========================================================================

PARTIES:
1. SERVICE PROVIDER:
   AdGenix Performance Studio
   Founder & Performance Lead: Daksh Gupta
   Official Email: ${ownerEmail}

2. CLIENT ENTITY:
   Brand Name: ${deal.brandName}
   Primary Domain: ${deal.domain}
   Authorized Signer: ${deal.clientSigner}

------------------------------------------------------------------------
1. SCOPE OF SERVICES & DELIVERABLES:
The Service Provider agrees to deliver high-converting direct-response ad creatives on an ongoing monthly basis:
${deal.deliverables.map((d, i) => `${i + 1}. ${d}`).join('\n')}

2. RETAINER COMPENSATION & PAYMENT TERMS:
• Monthly Retainer Fee: ${formatRupees(deal.closedAmount)} / month (${formatRupeesFull(deal.closedAmount)})
• Payment Terms: ${NON_REFUNDABLE_POLICY}.
• Remittance Channel: FamPay UPI Remittance ID: ${FAMPAY_ID} (${PAYEE_NAME})
• Billing Cycle: Billed 30 days in advance of production deployment.

3. INTELLECTUAL PROPERTY & USAGE RIGHTS:
Upon receipt of the monthly retainer, Client receives full commercial advertising rights across Meta, Instagram Reels, Google Ads, and owned media channels.

4. CONFIDENTIALITY:
Both parties agree to treat all ad performance data, target CPA, and proprietary creative hooks with strict commercial confidentiality.

------------------------------------------------------------------------
DIGITALLY EXECUTED BY:
Daksh Gupta (Founder, AdGenix)                    ${deal.clientSigner} (${deal.brandName})
Verified Date: ${agreementDate}                   Status: Agreed & Active
========================================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(contractFullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-100 relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Client Retainer Agreement (SLA)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 font-mono">
                  {contractReference}
                </span>
              </div>
              <p className="text-xs text-slate-400">Formal contract between AdGenix and {deal.brandName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-semibold flex items-center gap-1.5"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-semibold flex items-center gap-1.5"
              title="Copy Contract Text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Contract Layout */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 bg-slate-950 font-sans text-xs text-slate-300">
          {/* Document Masthead */}
          <div className="border-b border-slate-800 pb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                  ADGENIX PERFORMANCE STUDIO
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Autonomous Creative & Growth Architecture</div>
              <div className="text-[11px] text-slate-400">Daksh Gupta • {ownerEmail}</div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Agreement Reference</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">{contractReference}</div>
              <div className="text-[11px] text-slate-400 mt-1">Date: {agreementDate}</div>
            </div>
          </div>

          {/* Parties Involved */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">Service Provider</div>
              <div className="font-bold text-white text-sm">AdGenix</div>
              <div className="text-slate-300">Founder & Performance Lead: Daksh Gupta</div>
              <div className="text-slate-400 text-[11px]">Primary Contact: {ownerEmail}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">Client Partner</div>
              <div className="font-bold text-white text-sm">{deal.brandName}</div>
              <div className="text-slate-300">Authorized Signer: {deal.clientSigner}</div>
              <div className="text-slate-400 text-[11px]">Domain: {deal.domain}</div>
            </div>
          </div>

          {/* Financial Retainer Terms Card */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
                Monthly Retainer Compensation
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                100% NON-REFUNDABLE
              </span>
            </div>
            <div className="text-2xl font-black text-white">
              {formatRupees(deal.closedAmount)} <span className="text-sm text-slate-400 font-normal">/ month</span>
            </div>
            <div className="text-xs text-emerald-200">
              {formatRupeesFull(deal.closedAmount)}
            </div>
            <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
              <div>
                Remittance Account: <span className="text-white font-mono font-bold">{FAMPAY_ID}</span> ({PAYEE_NAME})
              </div>
              <div className="text-slate-400">Billed in advance every 30 days</div>
            </div>
          </div>

          {/* Scope & Deliverables */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              1. Monthly Deliverables & Scope
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {deal.deliverables.map((deliv, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 flex items-start gap-2"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{deliv}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Clauses */}
          <div className="space-y-3 pt-2 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800">
            <div>
              <strong className="text-slate-200 block mb-0.5">2. Retainer Policy & Non-Refundability:</strong>
              As creative talent and computational GPU resources are allocated exclusively upon onboarding, all monthly retainer fees are strictly 100% non-refundable under any circumstance once dispatched.
            </div>
            <div>
              <strong className="text-slate-200 block mb-0.5">3. Commercial Licensing:</strong>
              The Client holds exclusive, royalty-free commercial rights to deploy and scale all finalized assets across Meta (Facebook & Instagram), TikTok, YouTube, and digital advertising ecosystems.
            </div>
            <div>
              <strong className="text-slate-200 block mb-0.5">4. Governing Law:</strong>
              This Service Level Agreement is executed in accordance with the laws of India. Any payment remittances shall be executed via UPI / FamPay.
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            <div className="space-y-2">
              <div className="text-[10px] text-slate-500 uppercase font-bold">AdGenix Executive Signature</div>
              <div className="font-serif italic text-lg text-emerald-400 border-b border-slate-700 pb-1">
                Daksh Gupta
              </div>
              <div className="text-[10px] text-slate-400">Founder & Performance Lead</div>
              <div className="text-[9px] text-slate-500 font-mono">Digital ID: VERIFIED-DG-9156</div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Client Authorized Signature</div>
              <div className="font-serif italic text-lg text-indigo-400 border-b border-slate-700 pb-1">
                {deal.clientSigner}
              </div>
              <div className="text-[10px] text-slate-400">{deal.brandName} Executive</div>
              <div className="text-[9px] text-slate-500 font-mono">Status: Formally Ratified</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Legally Binding Performance Retainer Document
          </div>
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
