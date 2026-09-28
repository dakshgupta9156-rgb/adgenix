import React from 'react';
import { Lead } from '../types/agency';
import { Mail, Video, Award, ChevronRight, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';
import { formatRupees } from '../utils/currency';

interface LeadCardProps {
  lead: Lead;
  onSelect: (lead: Lead) => void;
  onQuickAction: (e: React.MouseEvent, lead: Lead) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onSelect, onQuickAction }) => {
  const isClosed = lead.status === 'closed_won';

  return (
    <div
      onClick={() => onSelect(lead)}
      className="group bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-all duration-200 shadow-md hover:shadow-xl relative overflow-hidden flex flex-col justify-between"
    >
      {/* Top Accent Strip */}
      {isClosed && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
      )}

      <div>
        {/* Brand & Industry */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition flex items-center gap-1.5">
              {lead.brandName}
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
            </h4>
            <div className="text-[11px] text-slate-400">{lead.domain}</div>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0 font-medium">
            {lead.industry}
          </span>
        </div>

        {/* Audit Bottleneck Highlight */}
        <div className="my-2.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-medium text-slate-300">Format Needed:</span>
            <span className="text-indigo-400 font-bold">{lead.creativeAudit.adFormatNeeded}</span>
          </div>
          <p className="text-slate-400 line-clamp-2 leading-relaxed">
            {lead.creativeAudit.primaryIssue}
          </p>
        </div>

        {/* Contact info & Spend in Rupees */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 py-1 border-t border-slate-800/60">
          <span>{lead.contact.name} ({lead.contact.role})</span>
          <span className="text-emerald-400 font-semibold">{lead.estMonthlyAdSpend}</span>
        </div>
      </div>

      {/* Footer & Quick Trigger */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
        <div>
          {isClosed ? (
            <div className="text-xs font-black text-emerald-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {formatRupees(lead.closedDeal?.closedAmount || 32000)}/mo RET
            </div>
          ) : (
            <div className="text-[11px] text-slate-400">
              Est. Deal: <span className="text-white font-bold">{formatRupees(lead.creativeAudit.opportunityValue)}/mo</span>
            </div>
          )}
        </div>

        <button
          onClick={(e) => onQuickAction(e, lead)}
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition ${
            lead.status === 'discovered'
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
              : lead.status === 'pitched'
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : lead.status === 'negotiating'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          {lead.status === 'discovered' && (
            <>
              <Mail className="w-3 h-3" /> Auto Pitch
            </>
          )}
          {lead.status === 'pitched' && (
            <>
              <Video className="w-3 h-3" /> Gen Ads
            </>
          )}
          {lead.status === 'negotiating' && (
            <>
              <span className="font-bold">₹</span> Close Deal
            </>
          )}
          {lead.status === 'closed_won' && (
            <>
              <Award className="w-3 h-3" /> View Retainer
            </>
          )}
        </button>
      </div>
    </div>
  );
};
