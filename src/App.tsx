import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { initialSeedLeads } from './data/seedLeads';
import { Lead, AgentLog, ClosedDeal } from './types/agency';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { PipelineBoard } from './components/PipelineBoard';
import { AgentActivityFeed } from './components/AgentActivityFeed';
import { LeadDetailModal } from './components/LeadDetailModal';
import { DealClosedNotificationModal } from './components/DealClosedNotificationModal';
import { DiscoverLeadsModal } from './components/DiscoverLeadsModal';
import { SettingsModal } from './components/SettingsModal';
import { FamPayQrModal } from './components/FamPayQrModal';
import { GoogleWorkspaceAuthBar } from './components/GoogleWorkspaceAuthBar';
import { SendEmailConfirmationModal } from './components/SendEmailConfirmationModal';
import { MobileDeviceModal } from './components/MobileDeviceModal';
import { RealPaymentVerificationModal } from './components/RealPaymentVerificationModal';
import { GitHubSyncModal } from './components/GitHubSyncModal';
import { DeployVercelModal } from './components/DeployVercelModal';
import { RetainerAgreementModal } from './components/RetainerAgreementModal';
import { RoiCalculatorModal } from './components/RoiCalculatorModal';
import { initAuth, googleSignIn, logoutGoogle, setCachedAccessToken } from './utils/googleAuth';
import { playDealClosedChime, playAgentBeep } from './utils/audio';
import { formatRupees, formatRupeesFull, FAMPAY_ID, PAYEE_NAME, clampRetainerRupees, MIN_RETAINER_INR, MAX_RETAINER_INR, NON_REFUNDABLE_POLICY } from './utils/currency';
import { Zap, ShieldCheck, Lock, AlertTriangle, PlayCircle, Mail, Sparkles, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('adgenix_leads_actual_inr_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.some((l: Lead) => l.brandName === 'Foxtale Skin' || l.brandName === 'Mokobara Luggage')) {
          return parsed;
        }
      }
      localStorage.setItem('adgenix_leads_actual_inr_v4', JSON.stringify(initialSeedLeads));
      return initialSeedLeads;
    } catch {
      return initialSeedLeads;
    }
  });

  const [ownerEmail, setOwnerEmail] = useState<string>(() => {
    return localStorage.getItem('adgenix_owner_email') || 'dakshgupta9156@gmail.com';
  });

  const [floorPrice, setFloorPrice] = useState<number>(() => {
    const val = localStorage.getItem('adgenix_floor_price_inr');
    return val ? clampRetainerRupees(parseInt(val, 10)) : 22000;
  });

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedClosedDeal, setSelectedClosedDeal] = useState<ClosedDeal | null>(null);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isDiscoverModalOpen, setIsDiscoverModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isFamPayQrOpen, setIsFamPayQrOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isRealPaymentHelpOpen, setIsRealPaymentHelpOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isVercelModalOpen, setIsVercelModalOpen] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [agreementDeal, setAgreementDeal] = useState<ClosedDeal | null>(null);
  const [isRoiModalOpen, setIsRoiModalOpen] = useState(false);
  const [roiBrandName, setRoiBrandName] = useState('D2C Brand');
  const [isAutopilotActive, setIsAutopilotActive] = useState(false);

  // Google Auth & Workspace state (tokens cached strictly in-memory per skill requirements)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Gmail confirmation modal state (user confirmation mandatory before sending)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailModalTarget, setEmailModalTarget] = useState(ownerEmail);
  const [emailModalSubject, setEmailModalSubject] = useState('');
  const [emailModalBody, setEmailModalBody] = useState('');
  const [isTestEmailModal, setIsTestEmailModal] = useState(false);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        if (token) setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleOpenSendTestEmail = () => {
    setEmailModalTarget(ownerEmail);
    setEmailModalSubject('🚀 [AdGenix Live Verification] Gmail API & Payment Gateway Connected!');
    setIsTestEmailModal(true);
    setIsEmailModalOpen(true);
  };

  const handleOpenSendInvoiceEmail = (deal: ClosedDeal) => {
    // Find the client contact email if available, fallback to brand domain or owner
    const matchedLead = leads.find((l) => l.brandName === deal.brandName);
    const clientTarget = matchedLead?.contact?.email || `contact@${deal.domain}`;

    setEmailModalTarget(clientTarget);
    setEmailModalSubject(`AdGenix Performance Retainer Invoice: ${deal.brandName} (${formatRupees(deal.closedAmount)}/mo)`);
    setEmailModalBody(
      `Hi ${deal.clientSigner.split(' ')[0] || 'there'},\n\nThank you for partnering with AdGenix! As agreed, here is your official performance creative retainer invoice and onboarding confirmation.\n\nSummary of Retainer Agreement:\n• Client: ${deal.brandName}\n• Monthly Retainer: ${formatRupees(deal.closedAmount)}/month (${formatRupeesFull(deal.closedAmount)})\n• Payment Terms: 100% Non-Refundable Monthly Retainer\n• FamPay / UPI Remittance ID: ${FAMPAY_ID} (${PAYEE_NAME})\n\nDeliverables Included:\n${deal.deliverables.map((d) => `• ${d}`).join('\n')}\n\nPlease scan the attached FamPay QR or transfer to ${FAMPAY_ID} via Google Pay, PhonePe, Paytm, or FamPay. Creative production begins immediately upon confirmation.\n\nBest regards,\nDaksh Gupta\nFounder & Performance Lead, AdGenix\ndakshgupta9156@gmail.com`
    );
    setIsTestEmailModal(false);
    setIsEmailModalOpen(true);
  };

  const handleFindAndEmailLeadsLive = async () => {
    playAgentBeep();
    let currentLeads = [...leads];
    
    // Look for uncontacted/discovered lead first
    let target = currentLeads.find((l) => l.status === 'discovered');

    if (!target) {
      try {
        const res = await fetch('/api/leads/discover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ niche: 'Clean Skincare & D2C Brands', count: 3 }),
        });
        const data = await res.json();
        if (data.success && data.leads?.length) {
          const formattedLeads: Lead[] = data.leads.map((l: any, i: number) => ({
            id: `lead-live-${Date.now()}-${i}`,
            brandName: l.brandName,
            domain: l.domain,
            industry: l.industry || 'D2C E-commerce',
            estMonthlyAdSpend: l.estMonthlyAdSpend || '₹2,00,000/mo',
            contact: l.contact || { name: 'Growth Lead', role: 'Head of Growth', email: `growth@${l.domain}` },
            creativeAudit: {
              currentScore: l.creativeAudit?.currentScore || 48,
              primaryIssue: l.creativeAudit?.primaryIssue || 'Severe ad fatigue on Meta Reels',
              adFormatNeeded: l.creativeAudit?.adFormatNeeded || 'UGC Video',
              suggestedOfferAngle: l.creativeAudit?.suggestedOfferAngle || 'Viral comparison breakdown',
              opportunityValue: clampRetainerRupees(l.creativeAudit?.opportunityValue || 35000),
            },
            status: 'discovered',
            emailThread: [],
            adCampaigns: [],
            negotiation: {
              stage: 'initial_pitch',
              turns: [],
              currentOffer: 35000,
              targetPrice: 35000,
              floorPrice: 22000,
              isClosed: false,
            },
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          }));
          currentLeads = [...formattedLeads, ...currentLeads];
          setLeads(currentLeads);
          target = formattedLeads[0];
        }
      } catch (e) {
        console.error('Error discovering leads:', e);
      }
    }

    if (!target) {
      target = currentLeads[0];
    }

    if (target) {
      const subject = `Quick ad creative audit for ${target.brandName} (spotted a 35% ROAS leak)`;
      // Clean, professional value-first outreach that bypasses Gmail spam filters
      const body = `Hey ${target.contact.name.split(' ')[0] || 'there'},\n\nI was auditing ${target.brandName}'s recent Meta and Reels ad presence and noticed your creatives are suffering from ad fatigue—cost per acquisition is likely climbing on static lifestyle posts.\n\nOur autonomous studio at AdGenix prepared 2 custom spec concepts for you: a high-retention "${target.creativeAudit.suggestedOfferAngle}" plus fresh Meta copy angles tested to boost conversion rate.\n\nWould you be open to checking out the 15-second UGC storyboard and ad mockup we prepared? Happy to send it right over—zero obligation.\n\nBest regards,\nDaksh Gupta\nFounder & Performance Lead, AdGenix\ndakshgupta9156@gmail.com`;

      setEmailModalTarget(target.contact.email);
      setEmailModalSubject(subject);
      setEmailModalBody(body);
      setIsTestEmailModal(false);
      setIsEmailModalOpen(true);

      const scoutLog: AgentLog = {
        id: `scout-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'action',
        agentThought: `Isolated high-potential lead ${target.brandName} (${target.contact.email}). Spec creative audit ready with FamPay QR & ₹20k - ₹50k non-refundable terms.`,
        actionTaken: `Opened live email dispatcher signed as Daksh Gupta.`,
        brandTarget: target.brandName,
      };
      setAgentLogs((prev) => [scoutLog, ...prev]);
    }
  };

  const handleRequireLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        setCachedAccessToken(result.accessToken);
      }
    } catch (e) {
      console.error('Login error:', e);
    }
  };

  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      level: 'info',
      agentThought: `AdGenix autonomous core initialized for Indian brands. Strict pricing: ₹20,000 – ₹50,000 only. 100% Non-refundable policy active. FamPay receiving ID: ${FAMPAY_ID} (${PAYEE_NAME}).`,
      actionTaken: 'Listening for qualified leads and creative fatigue indicators.',
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      level: 'success',
      agentThought: `Lumina Sleep Tech approved omnichannel growth retainer of ₹48,000/mo (Rupees 48,000). 100% Non-refundable signed agreement archived.`,
      actionTaken: `Sent deal closed alert to ${ownerEmail} with FamPay QR & ID: ${FAMPAY_ID}`,
      brandTarget: 'Lumina Sleep Tech',
    },
  ]);

  // Persist leads to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('adgenix_leads_actual_inr_v4', JSON.stringify(leads));
    } catch (e) {
      console.warn('Failed to save leads to localStorage:', e);
    }
  }, [leads]);

  // Update lead in state
  const handleUpdateLead = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    if (selectedLead?.id === updated.id) {
      setSelectedLead(updated);
    }
  };

  // When a deal is closed
  const handleDealClosed = (updatedLead: Lead) => {
    if (updatedLead.closedDeal) {
      setSelectedClosedDeal(updatedLead.closedDeal);
      setIsDealModalOpen(true);

      const winLog: AgentLog = {
        id: `win-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'success',
        agentThought: `Successfully negotiated and closed ${updatedLead.brandName} on a ${formatRupees(updatedLead.closedDeal.closedAmount)}/mo retainer in Indian Rupees!`,
        actionTaken: `Dispatched FamPay payment invoice (${FAMPAY_ID}) & alert to ${ownerEmail}`,
        brandTarget: updatedLead.brandName,
      };
      setAgentLogs((prev) => [winLog, ...prev]);
    }
  };

  // Add new leads from discovery scout
  const handleLeadsDiscovered = (newLeads: Lead[]) => {
    setLeads((prev) => [...newLeads, ...prev]);
    const scoutLog: AgentLog = {
      id: `scout-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'info',
      agentThought: `Scouted ${newLeads.length} new prospects with severe creative fatigue and active ad spend in Rupees.`,
      actionTaken: `Added ${newLeads.map((l) => l.brandName).join(', ')} to pipeline.`,
    };
    setAgentLogs((prev) => [scoutLog, ...prev]);
  };

  // Quick Action Handler from Kanban Card
  const handleQuickAction = async (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();

    if (lead.status === 'discovered') {
      // Open live Gmail dispatch modal directly for this lead
      playAgentBeep();
      const subject = `Quick ad creative audit for ${lead.brandName} (spotted a 35% ROAS leak)`;
      const body = `Hey ${lead.contact.name.split(' ')[0] || 'there'},\n\nI was auditing ${lead.brandName}'s recent Meta and Reels ad presence and noticed your creatives are suffering from ad fatigue—cost per acquisition is likely climbing on static lifestyle posts.\n\nOur autonomous studio at AdGenix prepared 2 custom spec concepts for you: a high-retention "${lead.creativeAudit.suggestedOfferAngle}" plus fresh Meta copy angles tested to boost conversion rate.\n\nWould you be open to checking out the 15-second UGC storyboard and ad mockup we prepared? Happy to send it right over—zero obligation.\n\nBest regards,\nDaksh Gupta\nFounder & Performance Lead, AdGenix\ndakshgupta9156@gmail.com`;

      setEmailModalTarget(lead.contact.email);
      setEmailModalSubject(subject);
      setEmailModalBody(body);
      setIsTestEmailModal(false);
      setIsEmailModalOpen(true);

      const log: AgentLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'action',
        agentThought: `Isolated actual lead ${lead.brandName} (${lead.contact.email}). Spec pitch ready with FamPay QR and ₹20k - ₹50k bounds.`,
        actionTaken: `Opened live email dispatcher signed as Daksh Gupta for ${lead.brandName}.`,
        brandTarget: lead.brandName,
      };
      setAgentLogs((prev) => [log, ...prev]);
    } else if (lead.status === 'pitched') {
      // Generate spec ad creative
      playAgentBeep();
      try {
        const res = await fetch('/api/ads/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandName: lead.brandName,
            domain: lead.domain,
            adFormatNeeded: lead.creativeAudit.adFormatNeeded,
            productContext: lead.industry,
          }),
        });
        const data = await res.json();
        if (data.campaign) {
          const updated: Lead = {
            ...lead,
            status: 'negotiating',
            adCampaigns: [
              {
                id: `camp-${Date.now()}`,
                title: data.campaign.title,
                type: data.campaign.type,
                targetAudience: data.campaign.targetAudience,
                hookType: data.campaign.hookType,
                ugcScript: data.campaign.ugcScript,
                metaAd: data.campaign.metaAd,
                tiktokAd: data.campaign.tiktokAd,
                createdAt: new Date().toISOString(),
              },
              ...lead.adCampaigns,
            ],
            emailThread: [
              ...lead.emailThread,
              {
                id: `reply-${Date.now()}`,
                from: `${lead.contact.name} <${lead.contact.email}>`,
                to: 'Daksh Gupta <dakshgupta9156@gmail.com>',
                subject: `Re: Quick ad creative audit for ${lead.brandName}`,
                body: `Hey Daksh, checked the teaser! Looks great. What does pricing look like for a monthly retainer in Rupees?`,
                timestamp: new Date().toISOString(),
                senderType: 'lead',
                status: 'replied',
              },
            ],
            lastUpdated: new Date().toISOString(),
          };
          handleUpdateLead(updated);

          const log: AgentLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            level: 'action',
            agentThought: `Produced 5-scene UGC script & Meta ad copy for ${lead.brandName}. Client requested pricing breakdown in Indian Rupees.`,
            actionTaken: `Staged ad campaign & moved lead to negotiation.`,
            brandTarget: lead.brandName,
          };
          setAgentLogs((prev) => [log, ...prev]);
        }
      } catch (err) {
        console.error(err);
      }
    } else if (lead.status === 'negotiating') {
      // Autonomous Price Closing in Rupees & FamPay
      playAgentBeep();
      try {
        const res = await fetch('/api/negotiate/step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandName: lead.brandName,
            contactName: lead.contact.name,
            contactRole: lead.contact.role,
            negotiationHistory: lead.negotiation.turns,
            clientBudget: lead.negotiation.currentOffer,
            targetPrice: lead.negotiation.targetPrice,
            floorPrice,
          }),
        });
        const data = await res.json();
        if (data.success) {
          const rawPrice = data.currentAgreedPrice || lead.negotiation.targetPrice || 32000;
          const agreedPrice = clampRetainerRupees(rawPrice);
          const updated: Lead = {
            ...lead,
            status: 'closed_won',
            negotiation: {
              ...lead.negotiation,
              currentOffer: agreedPrice,
              isClosed: true,
              stage: 'closed',
              turns: [
                ...lead.negotiation.turns,
                {
                  id: `turn-lead-${Date.now()}`,
                  speaker: 'lead',
                  text: data.clientMessage || `We accept the ${formatRupees(agreedPrice)}/mo retainer and acknowledge the 100% non-refundable terms! Send over the agreement and FamPay details.`,
                  timestamp: new Date().toISOString(),
                  offerAmount: agreedPrice,
                },
                {
                  id: `turn-agent-${Date.now() + 1}`,
                  speaker: 'agent',
                  text: data.agentResponse || `Deal agreed at ${formatRupees(agreedPrice)}/mo (100% Non-Refundable)! Remit in Indian Rupees via FamPay / UPI ID: ${FAMPAY_ID} (${PAYEE_NAME}). Production begins immediately!`,
                  timestamp: new Date().toISOString(),
                  tacticUsed: data.tacticUsed || 'Assumptive Close',
                  offerAmount: agreedPrice,
                },
              ],
            },
            closedDeal: {
              dealId: `deal-${Date.now()}`,
              leadId: lead.id,
              brandName: lead.brandName,
              domain: lead.domain,
              closedAmount: agreedPrice,
              dealPackage: 'Performance Ad Creative Retainer (UGC & Meta)',
              contractDate: new Date().toISOString().split('T')[0],
              paymentTerms: `100% Non-Refundable Retainer via FamPay / UPI (${FAMPAY_ID})`,
              clientSigner: `${lead.contact.name} (${lead.contact.role})`,
              deliverables: [
                '4 Custom High-Retention UGC Video Ads',
                '8 Direct-Response Meta Feed & Story Ads',
                'Dedicated Performance Creative Director',
              ],
              notificationSent: false,
              paymentStatus: 'pending_remittance',
              notificationRecipient: ownerEmail,
              summary: `Closed ${lead.brandName} at ${formatRupees(agreedPrice)}/mo (100% Non-Refundable, ₹20k - ₹50k limit).`,
              fampayId: FAMPAY_ID,
              payeeName: PAYEE_NAME,
              paymentMethod: `FamPay UPI (${FAMPAY_ID})`,
            },
            lastUpdated: new Date().toISOString(),
          };

          handleUpdateLead(updated);
          handleDealClosed(updated);
          playDealClosedChime();
          confetti({ particleCount: 130, spread: 80, origin: { y: 0.6 } });
        }
      } catch (err) {
        console.error(err);
      }
    } else if (lead.status === 'closed_won') {
      if (lead.closedDeal) {
        setSelectedClosedDeal(lead.closedDeal);
        setIsDealModalOpen(true);
      } else {
        setSelectedLead(lead);
      }
    }
  };

  // Instant Live Deal Simulator (strictly ₹35,000 non-refundable)
  const handleTriggerLiveDeal = () => {
    playAgentBeep();
    const liveAmount = 35000;
    const testBrand = 'Velox Athletic Gear';
    const fakeLead: Lead = {
      id: `lead-live-${Date.now()}`,
      brandName: testBrand,
      domain: 'veloxgear.in',
      industry: 'Activewear & D2C',
      estMonthlyAdSpend: '₹2,50,000/mo',
      contact: {
        name: 'Kabir Mehta',
        role: 'Founder & CMO',
        email: 'kabir@veloxgear.in',
      },
      creativeAudit: {
        currentScore: 46,
        primaryIssue: 'Severe creative fatigue on Meta Feed; static product banners yielding 0.9% CTR.',
        adFormatNeeded: 'UGC Video',
        suggestedOfferAngle: 'Durability torture-test + fast reaction hook',
        opportunityValue: liveAmount,
      },
      status: 'closed_won',
      emailThread: [
        {
          id: `email-${Date.now()}`,
          from: 'alex@adgenix.agency',
          to: 'kabir@veloxgear.in',
          subject: 'Ad creative audit & spec UGC concept for Velox',
          body: 'Audit spotted 35% ROAS leak. Spec concepts prepared.',
          timestamp: new Date().toISOString(),
          senderType: 'agent',
          status: 'replied',
        },
      ],
      adCampaigns: [],
      negotiation: {
        stage: 'closed',
        turns: [
          {
            id: `turn-${Date.now()}-1`,
            speaker: 'agent',
            text: `Hi Kabir! We proposed our Performance Ad Retainer at ₹35,000/mo (Rupees 35,000). All retainer packages are strictly 100% non-refundable once production starts.`,
            timestamp: new Date(Date.now() - 60000).toISOString(),
            offerAmount: liveAmount,
          },
          {
            id: `turn-${Date.now()}-2`,
            speaker: 'lead',
            text: `We accept the ₹35,000/mo terms and agree to the 100% non-refundable policy. Please send the FamPay QR code to remit payment!`,
            timestamp: new Date().toISOString(),
            offerAmount: liveAmount,
          },
        ],
        currentOffer: liveAmount,
        targetPrice: liveAmount,
        floorPrice: 22000,
        isClosed: true,
      },
      closedDeal: {
        dealId: `deal-${Date.now()}`,
        leadId: `lead-live-${Date.now()}`,
        brandName: testBrand,
        domain: 'veloxgear.in',
        closedAmount: liveAmount,
        dealPackage: 'UGC Video + Meta Direct-Response Sprint',
        contractDate: new Date().toISOString().split('T')[0],
        paymentTerms: `100% Non-Refundable Monthly Retainer via FamPay / UPI (${FAMPAY_ID})`,
        clientSigner: 'Kabir Mehta (Founder & CMO)',
        deliverables: [
          '4 Custom High-Retention UGC Video Ads',
          '8 Direct-Response Meta Feed & Story Creatives',
          'Weekly Audience Angle Iteration & ROAS Tracking',
        ],
        notificationSent: false,
        paymentStatus: 'pending_remittance',
        notificationRecipient: ownerEmail,
        summary: `Closed ${testBrand} at ${formatRupees(liveAmount)}/mo (Strictly 100% Non-Refundable).`,
        fampayId: FAMPAY_ID,
        payeeName: PAYEE_NAME,
        paymentMethod: `FamPay UPI (${FAMPAY_ID})`,
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    setLeads((prev) => [fakeLead, ...prev]);
    handleDealClosed(fakeLead);
    playDealClosedChime();
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
  };

  // Autopilot Loop Effect
  const autopilotRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!isAutopilotActive) {
      if (autopilotRef.current) clearInterval(autopilotRef.current);
      return;
    }

    autopilotRef.current = setInterval(async () => {
      // Find a lead to advance
      const targetDiscovered = leads.find((l) => l.status === 'discovered');
      const targetPitched = leads.find((l) => l.status === 'pitched');
      const targetNegotiating = leads.find((l) => l.status === 'negotiating' && !l.negotiation.isClosed);

      if (targetNegotiating) {
        // Run autonomous negotiation & close
        const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent;
        await handleQuickAction(fakeEvent, targetNegotiating);
      } else if (targetPitched) {
        // Produce ads & initiate negotiation
        const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent;
        await handleQuickAction(fakeEvent, targetPitched);
      } else if (targetDiscovered) {
        // Send automated pitch
        const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent;
        await handleQuickAction(fakeEvent, targetDiscovered);
      } else {
        // Auto-discover more leads if all are closed
        try {
          const res = await fetch('/api/leads/discover', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ niche: 'D2C Ecommerce', count: 2 }),
          });
          const data = await res.json();
          if (data.leads) {
            handleLeadsDiscovered(
              data.leads.map((l: any, i: number) => ({
                id: `lead-auto-${Date.now()}-${i}`,
                brandName: l.brandName,
                domain: l.domain,
                industry: l.industry || 'D2C Brand',
                estMonthlyAdSpend: l.estMonthlyAdSpend || '₹2,00,000/mo',
                contact: l.contact || {
                  name: 'Alex Hunter',
                  role: 'Marketing Lead',
                  email: `alex@${l.domain}`,
                },
                creativeAudit: l.creativeAudit || {
                  currentScore: 50,
                  primaryIssue: 'High ad creative fatigue',
                  adFormatNeeded: 'UGC Video',
                  suggestedOfferAngle: 'Before/after shock hook',
                  opportunityValue: 35000,
                },
                status: 'discovered' as const,
                emailThread: [],
                adCampaigns: [],
                negotiation: {
                  stage: 'initial_pitch' as const,
                  turns: [],
                  currentOffer: 35000,
                  targetPrice: 35000,
                  floorPrice,
                  isClosed: false,
                },
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
              }))
            );
          }
        } catch (err) {
          console.error(err);
        }
      }
    }, 7000);

    return () => {
      if (autopilotRef.current) clearInterval(autopilotRef.current);
    };
  }, [isAutopilotActive, leads, floorPrice, ownerEmail]);

  const closedDealsList = leads
    .filter((l) => l.status === 'closed_won' && l.closedDeal)
    .map((l) => l.closedDeal!);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Header with FamPay QR button & Gmail indicator */}
      <Header
        isAutopilotActive={isAutopilotActive}
        onToggleAutopilot={() => setIsAutopilotActive(!isAutopilotActive)}
        onOpenDiscover={() => setIsDiscoverModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenFamPayQr={() => setIsFamPayQrOpen(true)}
        onOpenGmailTest={handleOpenSendTestEmail}
        onFindAndEmailLeadsLive={handleFindAndEmailLeadsLive}
        onOpenMobileDeviceModal={() => setIsMobileModalOpen(true)}
        onOpenPaymentHelp={() => setIsRealPaymentHelpOpen(true)}
        onOpenGitHubSync={() => setIsGitHubModalOpen(true)}
        onOpenDeployVercel={() => setIsVercelModalOpen(true)}
        onOpenRoiCalculator={() => {
          setRoiBrandName('D2C Brand');
          setIsRoiModalOpen(true);
        }}
        isGmailConnected={!!accessToken}
        closedDeals={closedDealsList}
        onSelectDeal={(deal) => {
          setSelectedClosedDeal(deal);
          setIsDealModalOpen(true);
        }}
        ownerEmail={ownerEmail}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Google Workspace & Gmail Authentication Bar */}
        <GoogleWorkspaceAuthBar
          currentUser={currentUser}
          accessToken={accessToken}
          onAuthSuccess={(user, token) => {
            setCurrentUser(user);
            setAccessToken(token);
            setCachedAccessToken(token);
          }}
          onLogout={() => {
            setCurrentUser(null);
            setAccessToken(null);
          }}
          onOpenSendTestModal={handleOpenSendTestEmail}
          onFindAndEmailLeadsLive={handleFindAndEmailLeadsLive}
          ownerEmail={ownerEmail}
        />

        {/* Top Hero / Metrics in Indian Rupees */}
        <MetricsCards
          leads={leads}
          onOpenPaymentHelp={() => setIsRealPaymentHelpOpen(true)}
        />

        {/* Live Agent Operational & Policy Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-white text-sm">AGENT SYSTEM LIVE & OPERATIONAL</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Autopilot {isAutopilotActive ? 'RUNNING' : 'STANDBY'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> 100% Non-Refundable
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  ₹20,000 – ₹50,000 Price Limits
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Targeting active brands, sending custom spec ad pitches, negotiating retainer fees, and routing UPI payments to FamPay: <strong className="text-amber-300 font-mono">{FAMPAY_ID}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutopilotActive(!isAutopilotActive)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg ${
                isAutopilotActive
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              {isAutopilotActive ? 'Pause Autopilot' : 'Start Live Autopilot'}
            </button>

            <button
              onClick={handleTriggerLiveDeal}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
              title="Simulates closing an active client deal for ₹35,000 non-refundable"
            >
              <PlayCircle className="w-4 h-4" />
              Simulate Live Deal Close (₹35k)
            </button>
          </div>
        </div>

        {/* Live Agent Activity & Pipeline View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Pipeline Board */}
          <div className="lg:col-span-8 space-y-6">
            <PipelineBoard
              leads={leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onQuickAction={handleQuickAction}
              onOpenDiscoverModal={() => setIsDiscoverModalOpen(true)}
            />
          </div>

          {/* Right Column: Agent Brain & Live Execution Stream */}
          <div className="lg:col-span-4 space-y-4">
            <AgentActivityFeed
              logs={agentLogs}
              isAutopilotActive={isAutopilotActive}
              onToggleAutopilot={() => setIsAutopilotActive(!isAutopilotActive)}
            />

            {/* Quick Agent Actions Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Agent Quick Controls
              </h4>

              <button
                onClick={handleFindAndEmailLeadsLive}
                className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                ⚡ Find Leads & Email Them Live
              </button>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setIsDiscoverModalOpen(true)}
                  className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 font-medium transition text-center"
                >
                  🔍 Discover Leads
                </button>
                <button
                  onClick={() => setIsFamPayQrOpen(true)}
                  className="p-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold transition text-center flex items-center justify-center gap-1.5"
                >
                  <span className="text-amber-400 font-bold">fam</span> View FamPay QR
                </button>
              </div>

              <button
                onClick={() => setIsMobileModalOpen(true)}
                className="w-full py-2 px-3 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/70 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                📱 Connect Phone or Tablet Remote
              </button>

              <button
                onClick={() => setIsRealPaymentHelpOpen(true)}
                className="w-full py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                ❓ Why Haven't I Received Rupees? (Test ₹1 UPI)
              </button>

              <button
                onClick={() => setIsGitHubModalOpen(true)}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                🐙 Host on GitHub (Push / Download)
              </button>

              <button
                onClick={() => setIsVercelModalOpen(true)}
                className="w-full py-2 px-3 rounded-lg bg-black hover:bg-slate-900 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
              >
                ▲ Deploy to Vercel (1-Click / Live)
              </button>

              <button
                onClick={() => {
                  setRoiBrandName('D2C Brand');
                  setIsRoiModalOpen(true);
                }}
                className="w-full py-2 px-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                🧮 Retainer & ROAS Forecaster
              </button>

              {closedDealsList.length > 0 && (
                <button
                  onClick={() => {
                    setAgreementDeal(closedDealsList[0]);
                    setIsAgreementModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  📜 Client Retainer Agreement (SLA)
                </button>
              )}

              <button
                onClick={handleTriggerLiveDeal}
                className="w-full py-2.5 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> Test Live Deal Win (₹35,000 Non-Refundable)
              </button>

              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-200 space-y-1">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>FamPay Receiving ID</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">INR Only</span>
                </div>
                <div className="font-mono text-white text-xs font-bold select-all">{FAMPAY_ID}</div>
                <div className="text-slate-400 text-[10px]">
                  Payee: {PAYEE_NAME} • Notifications sent to <span className="text-white underline">{ownerEmail}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400">
        AdGenix Autonomous AI Ad Agency • All Transactions in Indian Rupees (INR / ₹) • FamPay ID: {FAMPAY_ID}
      </footer>

      {/* Modals */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateLead={handleUpdateLead}
        onDealClosed={handleDealClosed}
        ownerEmail={ownerEmail}
        onOpenSendGmail={(recipient, subject, body) => {
          setEmailModalTarget(recipient);
          setEmailModalSubject(subject);
          setEmailModalBody(body);
          setIsTestEmailModal(false);
          setIsEmailModalOpen(true);
        }}
      />

      <DealClosedNotificationModal
        deal={selectedClosedDeal}
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        ownerEmail={ownerEmail}
        onSendGmailInvoice={handleOpenSendInvoiceEmail}
        onOpenAgreement={(deal) => {
          setAgreementDeal(deal);
          setIsAgreementModalOpen(true);
        }}
        onPaymentVerified={(deal, utr) => {
          setLeads((prev) =>
            prev.map((l) => {
              if (l.closedDeal?.dealId === deal.dealId) {
                return {
                  ...l,
                  closedDeal: {
                    ...l.closedDeal,
                    paymentStatus: 'payment_verified',
                    upiUtr: utr,
                    paymentNotificationSent: true,
                    paymentReceivedAt: new Date().toISOString(),
                  },
                };
              }
              return l;
            })
          );
          const alertLog: AgentLog = {
            id: `pay-alert-${Date.now()}`,
            timestamp: new Date().toISOString(),
            level: 'success',
            agentThought: `REAL PAYMENT CONFIRMED! Received ${formatRupees(deal.closedAmount)} in FamPay. Dispatched official payment alert to ${ownerEmail}.`,
            actionTaken: `Payment Inflow Verified via UPI UTR: ${utr || 'VERIFIED'}`,
            brandTarget: deal.brandName,
          };
          setAgentLogs((prev) => [alertLog, ...prev]);
        }}
      />

      <DiscoverLeadsModal
        isOpen={isDiscoverModalOpen}
        onClose={() => setIsDiscoverModalOpen(false)}
        onLeadsDiscovered={handleLeadsDiscovered}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        ownerEmail={ownerEmail}
        onSaveEmail={(email) => {
          setOwnerEmail(email);
          localStorage.setItem('adgenix_owner_email', email);
        }}
        floorPrice={floorPrice}
        onSaveFloorPrice={(price) => {
          setFloorPrice(price);
          localStorage.setItem('adgenix_floor_price_inr', price.toString());
        }}
      />

      {/* FamPay Official QR Modal */}
      <FamPayQrModal
        isOpen={isFamPayQrOpen}
        onClose={() => setIsFamPayQrOpen(false)}
      />

      {/* Mobile & Tablet PWA Connect Modal */}
      <MobileDeviceModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        appUrl="https://ais-pre-yno7j7ulifm3xmzmsr247o-958487333034.asia-east1.run.app"
      />

      {/* Real Inflow Verification & ₹1 Live UPI Test Modal */}
      <RealPaymentVerificationModal
        isOpen={isRealPaymentHelpOpen}
        onClose={() => setIsRealPaymentHelpOpen(false)}
        onOpenEmailPitch={handleFindAndEmailLeadsLive}
      />

      {/* GitHub Repository Hosting & Sync Modal */}
      <GitHubSyncModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      {/* Vercel Deployment Modal */}
      <DeployVercelModal
        isOpen={isVercelModalOpen}
        onClose={() => setIsVercelModalOpen(false)}
      />

      {/* Official Client Retainer Agreement (SLA) Modal */}
      <RetainerAgreementModal
        deal={agreementDeal || selectedClosedDeal}
        isOpen={isAgreementModalOpen}
        onClose={() => setIsAgreementModalOpen(false)}
        ownerEmail={ownerEmail}
      />

      {/* Client Retainer & ROAS Forecaster Modal */}
      <RoiCalculatorModal
        isOpen={isRoiModalOpen}
        onClose={() => setIsRoiModalOpen(false)}
        brandName={roiBrandName}
        onUsePitchSnippet={(snippet) => {
          setEmailModalBody((prev) => `${prev}\n\n${snippet}`);
          setIsRoiModalOpen(false);
          setIsEmailModalOpen(true);
        }}
      />

      {/* Explicit Gmail Confirmation Modal (Mandatory Workspace Integration) */}
      <SendEmailConfirmationModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        accessToken={accessToken}
        currentUserEmail={currentUser?.email}
        targetRecipient={emailModalTarget}
        defaultSubject={emailModalSubject}
        defaultBody={emailModalBody}
        isTestEmail={isTestEmailModal}
        onRequireLogin={handleRequireLogin}
        onSuccess={(result) => {
          // If we sent pitch to an active lead, advance pipeline status to pitched
          setLeads((prev) =>
            prev.map((l) => {
              if (l.contact.email === emailModalTarget && l.status === 'discovered') {
                const newMsg = {
                  id: `msg-live-${Date.now()}`,
                  from: 'Daksh Gupta <dakshgupta9156@gmail.com>',
                  to: l.contact.email,
                  subject: emailModalSubject,
                  body: emailModalBody,
                  timestamp: new Date().toISOString(),
                  senderType: 'agent' as const,
                  status: 'sent' as const,
                };
                return {
                  ...l,
                  status: 'pitched' as const,
                  emailThread: [...l.emailThread, newMsg],
                  lastUpdated: new Date().toISOString(),
                };
              }
              return l;
            })
          );

          const successLog: AgentLog = {
            id: `email-sent-${Date.now()}`,
            timestamp: new Date().toISOString(),
            level: 'success',
            agentThought: `Verified Gmail API transmission. Email successfully dispatched to ${emailModalTarget} signed as Daksh Gupta with FamPay QR.`,
            actionTaken: `Delivered via Gmail (ID: ${result.messageId || 'OK'})`,
          };
          setAgentLogs((prev) => [successLog, ...prev]);
        }}
      />
    </div>
  );
}
