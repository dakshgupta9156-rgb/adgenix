import React, { useState } from 'react';
import { Search, Sparkles, X, Check, Globe } from 'lucide-react';
import { Lead } from '../types/agency';
import { playAgentBeep } from '../utils/audio';

interface DiscoverLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadsDiscovered: (newLeads: Lead[]) => void;
}

export const DiscoverLeadsModal: React.FC<DiscoverLeadsModalProps> = ({
  isOpen,
  onClose,
  onLeadsDiscovered,
}) => {
  const [selectedNiche, setSelectedNiche] = useState('Clean Skincare & D2C Beauty');
  const [customQuery, setCustomQuery] = useState('');
  const [count, setCount] = useState(3);
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const niches = [
    'Clean Skincare & D2C Beauty',
    'Performance Gym Apparel & Footwear',
    'Health, Longevity & Hydration',
    'Smart Sleep & Biohacking Tech',
    'B2B SaaS & Growth Tools',
    'High-Ticket Luxury Goods',
  ];

  const handleRunDiscovery = async () => {
    setIsScanning(true);
    playAgentBeep();
    try {
      const response = await fetch('/api/leads/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: selectedNiche,
          customQuery: customQuery.trim() || undefined,
          count,
        }),
      });

      const data = await response.json();
      if (data.success && data.leads) {
        const formattedLeads: Lead[] = data.leads.map((l: any, i: number) => {
          const oppVal = typeof l.creativeAudit?.opportunityValue === 'number'
            ? l.creativeAudit.opportunityValue
            : 35000;

          return {
            id: `lead-scout-${Date.now()}-${i}`,
            brandName: l.brandName,
            domain: l.domain,
            industry: l.industry || selectedNiche,
            estMonthlyAdSpend: l.estMonthlyAdSpend || '₹1,50,000/mo',
            contact: l.contact || {
              name: 'Sarah Jenkins',
              role: 'Head of Growth',
              email: `growth@${l.domain}`,
            },
            creativeAudit: {
              currentScore: l.creativeAudit?.currentScore || 50,
              primaryIssue: l.creativeAudit?.primaryIssue || 'Fatigued ad creatives, low CTR',
              adFormatNeeded: l.creativeAudit?.adFormatNeeded || 'UGC Video',
              suggestedOfferAngle: l.creativeAudit?.suggestedOfferAngle || 'Viral comparison breakdown',
              opportunityValue: oppVal > 1000 ? oppVal : 35000,
            },
            status: 'discovered',
            emailThread: [],
            adCampaigns: [],
            negotiation: {
              stage: 'initial_pitch',
              turns: [],
              currentOffer: oppVal > 1000 ? oppVal : 35000,
              targetPrice: oppVal > 1000 ? oppVal : 35000,
              floorPrice: 22000,
              isClosed: false,
            },
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          };
        });

        onLeadsDiscovered(formattedLeads);
        onClose();
      }
    } catch (err) {
      console.error('Failed to discover leads:', err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl text-slate-100">
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Autonomous Lead Discovery Scout</h3>
              <p className="text-xs text-slate-400">Find brands with active ad spend & ROAS leaks in India & globally</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-2">Select Target Niche</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {niches.map((n) => (
                <button
                  key={n}
                  onClick={() => setSelectedNiche(n)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    selectedNiche === n
                      ? 'bg-indigo-950/60 border-indigo-500/60 text-white font-medium'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Custom Brand Search or Niche Override (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Sustainable sneaker brands spending >₹1,00,000/mo"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Batch Size</label>
            <div className="flex gap-2">
              {[2, 3, 4, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setCount(num)}
                  className={`px-4 py-1.5 rounded-lg border transition ${
                    count === num
                      ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {num} Brands
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
          >
            Cancel
          </button>

          <button
            onClick={handleRunDiscovery}
            disabled={isScanning}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
          >
            <Search className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning Ad Libraries...' : 'Scout & Audit Brands'}
          </button>
        </div>
      </div>
    </div>
  );
};
