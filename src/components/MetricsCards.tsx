import React from 'react';
import { Award, MessageSquare, Video, TrendingUp, HelpCircle } from 'lucide-react';
import { Lead } from '../types/agency';
import { formatRupees } from '../utils/currency';

interface MetricsCardsProps {
  leads: Lead[];
  onOpenPaymentHelp?: () => void;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ leads, onOpenPaymentHelp }) => {
  const closedLeads = leads.filter((l) => l.status === 'closed_won');
  const negotiatingLeads = leads.filter((l) => l.status === 'negotiating');
  const totalClosedMonthly = closedLeads.reduce(
    (acc, l) => acc + (l.closedDeal?.closedAmount || 0),
    0
  );

  const pipelineValue = leads
    .filter((l) => l.status !== 'closed_won')
    .reduce((acc, l) => acc + l.creativeAudit.opportunityValue, 0);

  const totalAdsProduced = leads.reduce((acc, l) => acc + l.adCampaigns.length, 0);

  const metrics = [
    {
      title: 'Contracted Retainer Value',
      value: `${formatRupees(totalClosedMonthly)}/mo`,
      subtext: `${closedLeads.length} agreed retainers (FamPay QR issued)`,
      icon: Award,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      highlight: true,
      hasHelp: true,
    },
    {
      title: 'Active Pipeline Value',
      value: `${formatRupees(pipelineValue)}/mo`,
      subtext: `${leads.length - closedLeads.length} qualified brand leads`,
      icon: TrendingUp,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
    },
    {
      title: 'Autonomous Negotiations',
      value: negotiatingLeads.length.toString(),
      subtext: 'Handling pricing & objections in Rupees',
      icon: MessageSquare,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Spec Ad Campaigns Produced',
      value: totalAdsProduced.toString(),
      subtext: 'UGC Scripts & Meta Mocks',
      icon: Video,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={i}
              className={`p-4 rounded-xl border bg-slate-900/80 shadow-md flex items-center justify-between gap-3 ${
                m.highlight ? 'border-emerald-500/40 bg-gradient-to-br from-slate-900 to-emerald-950/20' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <span>{m.title}</span>
                  {m.hasHelp && onOpenPaymentHelp && (
                    <button
                      onClick={onOpenPaymentHelp}
                      className="text-amber-400 hover:text-amber-300 transition"
                      title="Why haven't I received rupees yet? Click for explanation & ₹1 test"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="text-xl font-extrabold text-white mt-0.5 tracking-tight">
                  {m.value}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{m.subtext}</div>
              </div>

              <div className={`p-3 rounded-xl ${m.bgColor} ${m.color} border ${m.borderColor} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Real Inflow Clarification Bar */}
      {onOpenPaymentHelp && (
        <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 flex flex-wrap items-center justify-between gap-2">
          <span>
            💡 <strong>Haven't received money on your phone yet?</strong> Payments arrive in your FamPay/bank app only when real clients scan your QR code.
          </span>
          <button
            onClick={onOpenPaymentHelp}
            className="text-amber-300 hover:text-white underline font-semibold transition"
          >
            How Real UPI Money Works / Test ₹1 Ping →
          </button>
        </div>
      )}
    </div>
  );
};

