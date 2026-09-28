import React, { useState } from 'react';
import { Lead, AdFormatNeeded, AdCampaign } from '../types/agency';
import { AdMockupViewer } from './AdMockupViewer';
import { NegotiationRoom } from './NegotiationRoom';
import {
  X,
  Sparkles,
  Mail,
  Video,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Send,
  Bot,
  RefreshCw,
  FileText,
  User,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { playAgentBeep } from '../utils/audio';
import { formatRupees, formatRupeesFull, FAMPAY_ID } from '../utils/currency';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (updated: Lead) => void;
  onDealClosed: (lead: Lead) => void;
  ownerEmail: string;
  onOpenSendGmail?: (recipient: string, subject: string, body: string) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  isOpen,
  onClose,
  onUpdateLead,
  onDealClosed,
  ownerEmail,
  onOpenSendGmail,
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'email' | 'ads' | 'negotiate'>('audit');
  const [isGeneratingAds, setIsGeneratingAds] = useState(false);
  const [isDraftingEmail, setIsDraftingEmail] = useState(false);

  if (!isOpen || !lead) return null;

  // Generate Ad Campaign if empty
  const handleGenerateAds = async () => {
    setIsGeneratingAds(true);
    playAgentBeep();
    try {
      const response = await fetch('/api/ads/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: lead.brandName,
          domain: lead.domain,
          adFormatNeeded: lead.creativeAudit.adFormatNeeded,
          productContext: lead.industry,
        }),
      });

      const data = await response.json();
      if (data.success && data.campaign) {
        const newCampaign: AdCampaign = {
          id: `ad-${Date.now()}`,
          title: data.campaign.title,
          type: data.campaign.type,
          targetAudience: data.campaign.targetAudience,
          hookType: data.campaign.hookType,
          ugcScript: data.campaign.ugcScript,
          metaAd: data.campaign.metaAd,
          tiktokAd: data.campaign.tiktokAd,
          createdAt: new Date().toISOString(),
        };

        const updatedLead: Lead = {
          ...lead,
          adCampaigns: [newCampaign, ...lead.adCampaigns],
          lastUpdated: new Date().toISOString(),
        };

        onUpdateLead(updatedLead);
        setActiveTab('ads');
      }
    } catch (err) {
      console.error('Failed to generate ads:', err);
    } finally {
      setIsGeneratingAds(false);
    }
  };

  // Generate Email Outreach
  const handleDraftOutreach = async () => {
    setIsDraftingEmail(true);
    playAgentBeep();
    try {
      const response = await fetch('/api/leads/email-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: lead.brandName,
          domain: lead.domain,
          contact: lead.contact,
          creativeAudit: lead.creativeAudit,
          agencyName: 'AdGenix',
        }),
      });

      const data = await response.json();
      if (data.success && data.email) {
        const newEmail = {
          id: `msg-${Date.now()}`,
          from: 'Daksh Gupta <dakshgupta9156@gmail.com>',
          to: lead.contact.email,
          subject: data.email.subject,
          body: data.email.body,
          timestamp: new Date().toISOString(),
          senderType: 'agent' as const,
          status: 'sent' as const,
        };

        const updatedLead: Lead = {
          ...lead,
          status: lead.status === 'discovered' ? 'pitched' : lead.status,
          emailThread: [...lead.emailThread, newEmail],
          lastUpdated: new Date().toISOString(),
        };

        onUpdateLead(updatedLead);
        setActiveTab('email');
      }
    } catch (err) {
      console.error('Failed to draft email:', err);
    } finally {
      setIsDraftingEmail(false);
    }
  };

  // Simulate Client Inbound Email Reply
  const handleSimulateClientReply = () => {
    const replies = [
      `Hey Daksh, this is interesting timing! Our Meta cost per purchase spiked 35% this month and we're urgently trying to test fresh UGC hooks. Can you show me the full 30-second storyboard and explain your monthly retainer in Rupees?`,
      `Hi Daksh, thanks for reaching out. We actually love the competitor comparison angle you suggested. Our main concern is turnaround time and budget. What are your pricing packages in Rupees?`,
      `Hey Daksh! Checked out the teaser concept. Very clean. We have an upcoming product launch in 2 weeks. How fast can you get 4 UGC videos produced and what does the contract look like?`,
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];

    const clientMsg = {
      id: `msg-${Date.now()}`,
      from: `${lead.contact.name} <${lead.contact.email}>`,
      to: 'Daksh Gupta <dakshgupta9156@gmail.com>',
      subject: `Re: Quick ad creative audit for ${lead.brandName}`,
      body: randomReply,
      timestamp: new Date().toISOString(),
      senderType: 'lead' as const,
      status: 'replied' as const,
    };

    const updatedLead: Lead = {
      ...lead,
      status: 'negotiating',
      emailThread: [...lead.emailThread, clientMsg],
      lastUpdated: new Date().toISOString(),
    };

    onUpdateLead(updatedLead);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 shadow-md">
              <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center font-bold text-white text-base">
                {lead.brandName.slice(0, 2).toUpperCase()}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{lead.brandName}</h2>
                <a
                  href={`https://${lead.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                >
                  {lead.domain} <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {lead.industry}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Contact: <span className="text-slate-200 font-medium">{lead.contact.name}</span> ({lead.contact.role}) • Est. Ad Spend:{' '}
                <span className="text-emerald-400 font-medium">{lead.estMonthlyAdSpend}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Pipeline Stage</div>
              <div className="text-xs font-bold capitalize text-indigo-400">
                {lead.status.replace('_', ' ')}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'audit'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> Creative Audit & ROAS Leak
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'email'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-4 h-4" /> Outreach Thread ({lead.emailThread.length})
            </button>

            <button
              onClick={() => setActiveTab('ads')}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'ads'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-4 h-4" /> Ad Creative Studio ({lead.adCampaigns.length})
            </button>

            <button
              onClick={() => setActiveTab('negotiate')}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'negotiate'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="font-bold">₹</span> Price Negotiator & Closer
            </button>
          </div>

          <div className="pb-2 hidden md:block">
            {lead.status === 'closed_won' ? (
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                🏆 Deal Closed ({formatRupees(lead.closedDeal?.closedAmount || 32000)}/mo)
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                Opportunity: {formatRupees(lead.creativeAudit.opportunityValue)}/mo
              </span>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Ad Creative Health Score
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-amber-400">
                      {lead.creativeAudit.currentScore}
                    </span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${lead.creativeAudit.currentScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Suffering creative fatigue and above-average CPA.
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Primary Demand / Format
                  </div>
                  <div className="text-base font-bold text-indigo-400">
                    {lead.creativeAudit.adFormatNeeded}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Recommended fix: Fast-paced creator reactions & hook testing.
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Retainer Value Potential (INR)
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    {formatRupees(lead.creativeAudit.opportunityValue)}
                    <span className="text-xs font-normal text-slate-400">/mo</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Estimated 3.2x ROAS lift on ad spend.
                  </p>
                </div>
              </div>

              {/* Deep Diagnosis */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Identified Creative Bottleneck
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
                  {lead.creativeAudit.primaryIssue}
                </p>

                <h4 className="text-sm font-bold text-white flex items-center gap-2 pt-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Strategic Pitch & Angle Proposal
                </h4>
                <p className="text-xs text-indigo-200 leading-relaxed bg-indigo-950/30 p-3.5 rounded-lg border border-indigo-500/20">
                  {lead.creativeAudit.suggestedOfferAngle}
                </p>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleDraftOutreach}
                  disabled={isDraftingEmail}
                  className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                >
                  <Mail className="w-4 h-4" />
                  {lead.emailThread.length > 0 ? 'Send Follow-up Email' : 'Autonomous Email Pitch'}
                </button>

                <button
                  onClick={handleGenerateAds}
                  disabled={isGeneratingAds}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition"
                >
                  <Video className="w-4 h-4 text-amber-400" />
                  {isGeneratingAds ? 'AI Generating Ad Creatives...' : 'Generate Spec UGC & Meta Ads'}
                </button>

                <button
                  onClick={() => setActiveTab('negotiate')}
                  className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition ml-auto"
                >
                  <span className="font-bold">₹</span>
                  Open Price Negotiator & Closer
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL OUTREACH */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Outreach Pipeline & Dialogue</h3>
                  <p className="text-xs text-slate-400">
                    Recipient: <span className="text-slate-200 font-mono">{lead.contact.email}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSimulateClientReply}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
                  >
                    Simulate Client Reply 💬
                  </button>
                  {onOpenSendGmail && (
                    <button
                      onClick={() =>
                        onOpenSendGmail(
                          lead.contact.email,
                          `Quick ad creative audit for ${lead.brandName} (spotted a 35% ROAS leak)`,
                          `Hey ${lead.contact.name.split(' ')[0] || 'there'},\n\nI was auditing ${lead.brandName}'s recent Meta and Reels ad presence and noticed your creatives are suffering from ad fatigue—cost per acquisition is likely climbing on your static lifestyle posts.\n\nOur team at AdGenix prepared 2 custom spec concepts for you: a high-retention "${lead.creativeAudit.suggestedOfferAngle}" plus fresh Meta copy angles tested to boost conversion rate.\n\nRetainers are strictly ₹20,000 – ₹50,000/mo (100% Non-Refundable, payable via FamPay / UPI ID: ${FAMPAY_ID}).\n\nWould you be open to checking out the 15-second UGC storyboard and ad mockup we prepared? Happy to send it right over—zero obligation.\n\nBest regards,\nDaksh Gupta\nFounder & Performance Lead, AdGenix\ndakshgupta9156@gmail.com`
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow"
                    >
                      <Mail className="w-3.5 h-3.5 text-emerald-400" /> Dispatch Real Gmail
                    </button>
                  )}
                  <button
                    onClick={handleDraftOutreach}
                    disabled={isDraftingEmail}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                  >
                    <Send className="w-3.5 h-3.5" /> Send AI Pitch
                  </button>
                </div>
              </div>

              {lead.emailThread.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/60 rounded-xl border border-slate-800 p-6">
                  <Mail className="w-10 h-10 text-indigo-400 mx-auto mb-2 opacity-70" />
                  <h4 className="text-sm font-semibold text-white mb-1">No Emails Sent Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                    The autonomous agent can craft a high-converting cold email tailored specifically to {lead.brandName}'s creative flaws.
                  </p>
                  <button
                    onClick={handleDraftOutreach}
                    disabled={isDraftingEmail}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 mx-auto shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" /> Draft & Dispatch AI Pitch
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {lead.emailThread.map((msg) => {
                    const isAgent = msg.senderType === 'agent';
                    return (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-xl border text-xs space-y-2 ${
                          isAgent
                            ? 'bg-slate-950/80 border-indigo-500/30'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isAgent
                                  ? 'bg-indigo-500/20 text-indigo-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {isAgent ? 'SENT BY ADGENIX' : 'CLIENT INBOUND'}
                            </span>
                            <span className="font-semibold text-slate-200">{msg.from}</span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(msg.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <div className="font-bold text-slate-100 text-xs">{msg.subject}</div>
                        <p className="whitespace-pre-line text-slate-300 leading-relaxed font-sans">
                          {msg.body}
                        </p>

                        {isAgent && onOpenSendGmail && (
                          <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                            <button
                              onClick={() => onOpenSendGmail(lead.contact.email, msg.subject, msg.body)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition"
                            >
                              <Mail className="w-3 h-3 text-indigo-400" /> Send this Pitch via Gmail (OAuth)
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AD CREATIVE STUDIO */}
          {activeTab === 'ads' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Generated Ad Creatives</h3>
                  <p className="text-xs text-slate-400">
                    High-converting UGC scripts, Meta feeds & TikTok spark concepts.
                  </p>
                </div>

                <button
                  onClick={handleGenerateAds}
                  disabled={isGeneratingAds}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAds ? 'animate-spin' : ''}`} />
                  {isGeneratingAds ? 'Generating...' : 'Generate New Campaign Angle'}
                </button>
              </div>

              {lead.adCampaigns.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/60 rounded-xl border border-slate-800 p-6">
                  <Video className="w-10 h-10 text-amber-400 mx-auto mb-2 opacity-70" />
                  <h4 className="text-sm font-semibold text-white mb-1">No Ad Campaigns Generated Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                    The agent can produce complete 30-second UGC scripts, actor briefs, Meta ad copy, and mobile mockups for {lead.brandName}.
                  </p>
                  <button
                    onClick={handleGenerateAds}
                    disabled={isGeneratingAds}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 mx-auto shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" /> Generate Spec UGC & Meta Ad Now
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {lead.adCampaigns.map((camp) => (
                    <AdMockupViewer key={camp.id} campaign={camp} brandName={lead.brandName} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NEGOTIATE & CLOSE */}
          {activeTab === 'negotiate' && (
            <NegotiationRoom
              lead={lead}
              onUpdateLead={onUpdateLead}
              onDealClosed={onDealClosed}
              ownerEmail={ownerEmail}
            />
          )}
        </div>
      </div>
    </div>
  );
};
