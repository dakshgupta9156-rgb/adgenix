import React, { useState } from 'react';
import { Lead } from '../types/agency';
import { Send, CheckCircle2, ShieldAlert, Award, ArrowRight, Zap, Bot, User, Sparkles, QrCode, Lock, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playDealClosedChime } from '../utils/audio';
import { formatRupees, formatRupeesFull, FAMPAY_ID, PAYEE_NAME, clampRetainerRupees, MIN_RETAINER_INR, MAX_RETAINER_INR, NON_REFUNDABLE_POLICY } from '../utils/currency';
import { FamPayPaymentCard } from './FamPayPaymentCard';

interface NegotiationRoomProps {
  lead: Lead;
  onUpdateLead: (updated: Lead) => void;
  onDealClosed: (lead: Lead) => void;
  ownerEmail: string;
}

export const NegotiationRoom: React.FC<NegotiationRoomProps> = ({
  lead,
  onUpdateLead,
  onDealClosed,
  ownerEmail,
}) => {
  const [customMsg, setCustomMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetFloor, setTargetFloor] = useState(clampRetainerRupees(lead.negotiation.floorPrice || 22000));

  const turns = lead.negotiation.turns;
  const isClosed = lead.negotiation.isClosed;

  const runNegotiationStep = async (promptOverride?: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/negotiate/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: lead.brandName,
          contactName: lead.contact.name,
          contactRole: lead.contact.role,
          negotiationHistory: turns,
          clientBudget: clampRetainerRupees(lead.negotiation.currentOffer),
          targetPrice: clampRetainerRupees(lead.negotiation.targetPrice),
          floorPrice: targetFloor,
          promptOverride,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const newTurns = [...turns];
        const safePrice = clampRetainerRupees(data.currentAgreedPrice);

        // If clientMessage provided
        if (data.clientMessage) {
          newTurns.push({
            id: `turn-lead-${Date.now()}`,
            speaker: 'lead',
            text: data.clientMessage,
            timestamp: new Date().toISOString(),
            offerAmount: safePrice,
          });
        }

        // Agent counter response
        if (data.agentResponse) {
          newTurns.push({
            id: `turn-agent-${Date.now() + 1}`,
            speaker: 'agent',
            text: data.agentResponse,
            timestamp: new Date().toISOString(),
            tacticUsed: data.tacticUsed,
            offerAmount: safePrice,
          });
        }

        let updatedLead: Lead = {
          ...lead,
          status: data.isDealClosed ? 'closed_won' : 'negotiating',
          negotiation: {
            ...lead.negotiation,
            turns: newTurns,
            currentOffer: safePrice,
            isClosed: !!data.isDealClosed,
            stage: data.isDealClosed ? 'closed' : 'objection_handling',
          },
          lastUpdated: new Date().toISOString(),
        };

        if (data.isDealClosed && data.dealAgreement) {
          updatedLead.closedDeal = {
            dealId: `deal-${Date.now()}`,
            leadId: lead.id,
            brandName: lead.brandName,
            domain: lead.domain,
            closedAmount: safePrice,
            dealPackage: data.dealAgreement.packageName || 'Growth UGC + Meta Retainer',
            contractDate: new Date().toISOString().split('T')[0],
            paymentTerms: `100% Non-Refundable Monthly Retainer via FamPay / UPI (${FAMPAY_ID})`,
            clientSigner: `${lead.contact.name} (${lead.contact.role})`,
            deliverables: data.dealAgreement.deliverables || [
              '4 Custom High-Converting UGC Video Ads',
              '8 Meta Feed & Story Creatives',
              'Audience Hook Testing Framework',
            ],
            notificationSent: false,
            notificationRecipient: ownerEmail,
            summary: data.dealAgreement.closingSummary || `Closed ${lead.brandName} at ${formatRupees(safePrice)}/mo (100% Non-Refundable).`,
            fampayId: FAMPAY_ID,
            payeeName: PAYEE_NAME,
            paymentMethod: `FamPay UPI (${FAMPAY_ID})`,
            paymentStatus: 'pending_remittance',
          };

          // Play sound and trigger confetti
          playDealClosedChime();
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });

          onDealClosed(updatedLead);
        }

        onUpdateLead(updatedLead);
      }
    } catch (err) {
      console.error('Failed to run negotiation step:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInstantClose = () => {
    const rawAmount = lead.negotiation.currentOffer || lead.negotiation.targetPrice;
    const agreedAmount = clampRetainerRupees(rawAmount);
    const finalTurns = [
      ...turns,
      {
        id: `turn-lead-${Date.now()}`,
        speaker: 'lead' as const,
        text: `We accept the ${formatRupees(agreedAmount)}/mo terms and acknowledge the 100% non-refundable retainer policy! Send over the agreement and FamPay payment QR code so we can start right away.`,
        timestamp: new Date().toISOString(),
        offerAmount: agreedAmount,
      },
      {
        id: `turn-agent-${Date.now() + 1}`,
        speaker: 'agent' as const,
        text: `Awesome, ${lead.contact.name}! Digital onboarding contract has been generated. Please note all retainer spots are strictly 100% non-refundable once production commences. You can remit the ${formatRupees(agreedAmount)} retainer directly in Rupees via FamPay / UPI ID: ${FAMPAY_ID} (${PAYEE_NAME}) or scan the official QR code below. Creative production kicks off immediately. Welcome to AdGenix! 🥂`,
        timestamp: new Date().toISOString(),
        tacticUsed: 'Instant Agreement Execution',
        offerAmount: agreedAmount,
      },
    ];

    const updatedLead: Lead = {
      ...lead,
      status: 'closed_won',
      negotiation: {
        ...lead.negotiation,
        turns: finalTurns,
        currentOffer: agreedAmount,
        isClosed: true,
        stage: 'closed',
      },
      closedDeal: {
        dealId: `deal-${Date.now()}`,
        leadId: lead.id,
        brandName: lead.brandName,
        domain: lead.domain,
        closedAmount: agreedAmount,
        dealPackage: 'Performance Ad Retainer (UGC & Meta Ads)',
        contractDate: new Date().toISOString().split('T')[0],
        paymentTerms: `100% Non-Refundable Monthly Retainer via FamPay / UPI (${FAMPAY_ID})`,
        clientSigner: `${lead.contact.name} (${lead.contact.role})`,
        deliverables: [
          '4 Custom UGC Video Ads with Tested Hooks',
          '8 Meta Direct-Response Ad Creatives',
          'Dedicated Creative Director & Ad Fatigue Monitoring',
        ],
        notificationSent: true,
        notificationRecipient: ownerEmail,
        summary: `Instant deal close with ${lead.brandName} for ${formatRupees(agreedAmount)}/mo (${formatRupeesFull(agreedAmount)}). Strictly non-refundable.`,
        fampayId: FAMPAY_ID,
        payeeName: PAYEE_NAME,
        paymentMethod: `FamPay UPI (${FAMPAY_ID})`,
      },
      lastUpdated: new Date().toISOString(),
    };

    fetch('/api/notify/owner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deal: updatedLead.closedDeal,
        ownerEmail,
      }),
    });

    playDealClosedChime();
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 },
    });

    onUpdateLead(updatedLead);
    onDealClosed(updatedLead);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-slate-100">
      {/* Top Banner */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-sm">
              ₹
            </span>
            <h3 className="font-bold text-white text-base">Autonomous Negotiation & Deal Closer</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" /> NON-REFUNDABLE
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
              ₹20k – ₹50k BOUNDS
            </span>
            {isClosed ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> DEAL CLOSED & WON
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1 animate-pulse">
                <Bot className="w-3.5 h-3.5" /> AGENT NEGOTIATING
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Negotiating in Indian Rupees with <span className="text-white font-medium">{lead.contact.name}</span> ({lead.contact.role}) at {lead.brandName} • All retainers strictly non-refundable
          </p>
        </div>

        {/* Pricing Range Meters */}
        <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
          <div className="px-2 text-center">
            <div className="text-[10px] text-slate-400 uppercase">Target Price</div>
            <div className="font-bold text-white text-sm">{formatRupees(clampRetainerRupees(lead.negotiation.targetPrice))}/mo</div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="px-2 text-center">
            <div className="text-[10px] text-slate-400 uppercase">Current Offer</div>
            <div className="font-bold text-emerald-400 text-sm">{formatRupees(clampRetainerRupees(lead.negotiation.currentOffer))}/mo</div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="px-2 text-center">
            <div className="text-[10px] text-slate-400 uppercase">Floor Limit</div>
            <div className="font-bold text-slate-300 text-sm">{formatRupees(targetFloor)}/mo</div>
          </div>
        </div>
      </div>

      {/* Negotiation History Chat */}
      <div className="p-6 space-y-4 max-h-[460px] overflow-y-auto bg-slate-950/40">
        {turns.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/60 rounded-xl border border-slate-800 p-6">
            <Bot className="w-10 h-10 text-indigo-400 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-semibold text-white mb-1">Negotiation Session Ready</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              The prospect has viewed the spec ad proposal. Click below to allow the AdGenix autonomous closer agent to negotiate retainer pricing in Indian Rupees.
            </p>
            <button
              onClick={() => runNegotiationStep()}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 mx-auto shadow-lg shadow-indigo-600/30 transition"
            >
              <Sparkles className="w-4 h-4" /> Start Autonomous Price Discussion
            </button>
          </div>
        ) : (
          turns.map((turn) => {
            const isAgent = turn.speaker === 'agent';
            return (
              <div
                key={turn.id}
                className={`flex gap-3 max-w-2xl ${isAgent ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isAgent
                      ? 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs space-y-1.5 ${
                    isAgent
                      ? 'bg-indigo-950/70 border border-indigo-500/30 text-slate-100 rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 font-medium">
                    <span>{isAgent ? 'Daksh Gupta (AdGenix Closer)' : lead.contact.name}</span>
                    <span>{new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <p className="leading-relaxed whitespace-pre-line text-slate-200">{turn.text}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {turn.tacticUsed && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                        Tactics: {turn.tacticUsed}
                      </span>
                    )}
                    {turn.offerAmount && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                        Offer: {formatRupees(turn.offerAmount)}/mo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 p-3 bg-indigo-950/30 rounded-xl border border-indigo-500/20 animate-pulse">
            <Bot className="w-4 h-4 animate-spin" />
            <span>AdGenix agent is evaluating client price resistance in Rupees & computing psychological counter-offer...</span>
          </div>
        )}

        {/* FamPay Payment Card displayed when deal is closed */}
        {isClosed && (
          <div className="pt-2">
            <FamPayPaymentCard
              amount={lead.negotiation.currentOffer}
              brandName={lead.brandName}
              showConfirmButton={false}
            />
          </div>
        )}
      </div>

      {/* Objections Quick Prompts */}
      {!isClosed && (
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/80 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 font-medium">Test Specific Objection:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => runNegotiationStep(`Client says: 'Your price of ${formatRupees(lead.negotiation.targetPrice)} is too high for our current cashflow. Can you do ${formatRupees(targetFloor)} (Rupees ${targetFloor.toLocaleString('en-IN')})?'`)}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              "Too Expensive"
            </button>
            <button
              onClick={() => runNegotiationStep("Client asks: 'Can we pay in bi-weekly installments via FamPay / UPI instead of full monthly upfront?'")}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              "FamPay Installments"
            </button>
            <button
              onClick={() => runNegotiationStep(`Client says: 'If you include 2 free bonus UGC hook variations, we will sign today at ${formatRupees(Math.round(lead.negotiation.targetPrice * 0.85))}/mo.'`)}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              "Bonus Hooks Counter"
            </button>
          </div>
        </div>
      )}

      {/* Control Actions & Closing Deck */}
      <div className="p-4 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
        {!isClosed ? (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={() => runNegotiationStep()}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
              >
                <Bot className="w-4 h-4" />
                {turns.length === 0 ? 'Start Negotiation' : '🤖 Agent: Counter & Close'}
              </button>

              <button
                onClick={handleInstantClose}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
              >
                <Zap className="w-4 h-4" />
                ⚡️ Finalize & Sign Deal in Rupees
              </button>
            </div>

            <div className="text-xs text-slate-400">
              FamPay ID: <span className="text-amber-400 font-mono font-bold">{FAMPAY_ID}</span> • Alert to <span className="text-indigo-400 underline">{ownerEmail}</span>
            </div>
          </>
        ) : (
          <div className="w-full bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Contract Signed & Retainer Active</h4>
                <p className="text-xs text-emerald-300">
                  Closed at <span className="font-bold text-white">{formatRupees(lead.negotiation.currentOffer)}/mo</span> with {lead.brandName}.
                  Remit to FamPay ID: <span className="font-mono text-white font-bold">{FAMPAY_ID}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                ✅ Deliverables Scheduled for Launch
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
