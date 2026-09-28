import React from 'react';
import { Lead } from '../types/agency';
import { LeadCard } from './LeadCard';
import { Search, Mail, MessageSquare, Award, Plus, Sparkles, Filter } from 'lucide-react';
import { formatRupees } from '../utils/currency';

interface PipelineBoardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onQuickAction: (e: React.MouseEvent, lead: Lead) => void;
  onOpenDiscoverModal: () => void;
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  leads,
  onSelectLead,
  onQuickAction,
  onOpenDiscoverModal,
}) => {
  const discoveredLeads = leads.filter((l) => l.status === 'discovered' || l.status === 'audited');
  const pitchedLeads = leads.filter((l) => l.status === 'pitched');
  const negotiatingLeads = leads.filter((l) => l.status === 'negotiating');
  const closedLeads = leads.filter((l) => l.status === 'closed_won');

  const columns = [
    {
      id: 'discovered',
      title: 'Discovered & Audited',
      icon: Search,
      count: discoveredLeads.length,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      leads: discoveredLeads,
      description: 'Brands identified with high creative fatigue & ROAS leak',
    },
    {
      id: 'pitched',
      title: 'Pitched (Spec Sent)',
      icon: Mail,
      count: pitchedLeads.length,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      leads: pitchedLeads,
      description: 'Personalized cold audit & teaser hook storyboard delivered',
    },
    {
      id: 'negotiating',
      title: 'Negotiating Pricing',
      icon: MessageSquare,
      count: negotiatingLeads.length,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20',
      leads: negotiatingLeads,
      description: 'Agent handling budget resistance & finalizing package terms',
    },
    {
      id: 'closed',
      title: 'Closed Won Retainers',
      icon: Award,
      count: closedLeads.length,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      leads: closedLeads,
      description: 'Contracts signed, monthly retainer active & owner alerted',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Board Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="font-semibold text-white">Autonomous Ad Pipeline:</span>
          <span>{leads.length} Active Targets</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-medium">
            {formatRupees(closedLeads.reduce((acc, l) => acc + (l.closedDeal?.closedAmount || 0), 0))}/mo Won
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDiscoverModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Discover New Leads
          </button>
        </div>
      </div>

      {/* 4-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const Icon = col.icon;
          return (
            <div
              key={col.id}
              className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col min-h-[540px]"
            >
              {/* Column Header */}
              <div className="p-2 mb-2 flex items-center justify-between border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${col.bgColor} ${col.color} border ${col.borderColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                      {col.title}
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-semibold">
                        {col.count}
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-tight">{col.description}</p>
                  </div>
                </div>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {col.leads.length === 0 ? (
                  <div className="h-40 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-xs text-slate-400">No leads in this stage</p>
                    {col.id === 'discovered' && (
                      <button
                        onClick={onOpenDiscoverModal}
                        className="mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium"
                      >
                        Scan & Discover Brands
                      </button>
                    )}
                  </div>
                ) : (
                  col.leads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onSelect={onSelectLead}
                      onQuickAction={onQuickAction}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
