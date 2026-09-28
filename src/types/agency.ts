export type AdFormatNeeded = 'UGC Video' | 'Meta Feed & Reels' | 'TikTok Spark Ads' | 'Full Omnichannel';

export type LeadStatus = 'discovered' | 'audited' | 'pitched' | 'negotiating' | 'closed_won' | 'passed';

export interface LeadContact {
  name: string;
  role: string;
  email: string;
  avatar?: string;
}

export interface CreativeAudit {
  currentScore: number;
  primaryIssue: string;
  adFormatNeeded: AdFormatNeeded;
  suggestedOfferAngle: string;
  opportunityValue: number;
}

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  senderType: 'agent' | 'lead';
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'replied';
}

export interface UgcScriptScene {
  duration: string;
  visual: string;
  voiceover: string;
  onScreenText: string;
  vibe?: string;
}

export interface UgcScript {
  actorPersona: string;
  bRollNotes: string[];
  hookScene: UgcScriptScene;
  problemScene: UgcScriptScene;
  solutionScene: UgcScriptScene;
  socialProofScene: UgcScriptScene;
  ctaScene: UgcScriptScene;
}

export interface MetaAdCreative {
  primaryText: string;
  headline: string;
  description: string;
  callToAction: string;
  aspectRatio: string;
  visualConcept: string;
  badgeText: string;
  accentColor: string;
}

export interface TikTokAdCreative {
  trendingAudioStyle: string;
  pacingBPM: string;
  scriptHook: string;
  captionsStyle: string;
}

export interface AdCampaign {
  id: string;
  title: string;
  type: 'ugc' | 'meta_ads' | 'tiktok';
  targetAudience: string;
  hookType: string;
  ugcScript?: UgcScript;
  metaAd?: MetaAdCreative;
  tiktokAd?: TikTokAdCreative;
  createdAt: string;
}

export interface NegotiationTurn {
  id: string;
  speaker: 'agent' | 'lead';
  text: string;
  timestamp: string;
  tacticUsed?: string;
  offerAmount?: number;
}

export interface NegotiationSession {
  stage: 'initial_pitch' | 'discovery_response' | 'pricing_proposal' | 'objection_handling' | 'final_terms' | 'closed';
  turns: NegotiationTurn[];
  currentOffer: number;
  targetPrice: number;
  floorPrice: number;
  isClosed: boolean;
}

export interface ClosedDeal {
  dealId: string;
  leadId: string;
  brandName: string;
  domain: string;
  closedAmount: number; // in Indian Rupees
  dealPackage: string;
  contractDate: string;
  paymentTerms: string;
  clientSigner: string;
  deliverables: string[];
  notificationSent: boolean;
  notificationRecipient: string;
  summary: string;
  fampayId?: string;
  payeeName?: string;
  paymentMethod?: string;
  paymentStatus?: 'pending_remittance' | 'payment_verified';
  paymentReceivedAt?: string;
  upiUtr?: string;
  paymentNotificationSent?: boolean;
}

export interface Lead {
  id: string;
  brandName: string;
  domain: string;
  industry: string;
  estMonthlyAdSpend: string;
  contact: LeadContact;
  creativeAudit: CreativeAudit;
  status: LeadStatus;
  emailThread: EmailMessage[];
  adCampaigns: AdCampaign[];
  negotiation: NegotiationSession;
  closedDeal?: ClosedDeal;
  createdAt: string;
  lastUpdated: string;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  level: 'info' | 'action' | 'success' | 'alert';
  agentThought: string;
  actionTaken: string;
  brandTarget?: string;
}

export interface AgencyMetrics {
  totalPipelineValue: number;
  closedRevenue: number;
  activeNegotiations: number;
  emailsDispatched: number;
  adsProduced: number;
  closedDealsCount: number;
}
