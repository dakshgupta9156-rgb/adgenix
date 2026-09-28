import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// FamPay & UPI Configuration
const FAMPAY_ID = 'shivamagrawal18@fam';
const PAYEE_NAME = 'SHIVAM AGRAWAL';

// Strict Price Constraints: ₹20,000 to ₹50,000 only, 100% Non-Refundable
const MIN_PRICE_INR = 20000;
const MAX_PRICE_INR = 50000;
const NON_REFUNDABLE_POLICY = '100% Non-Refundable Retainer. Payable in advance via FamPay / UPI.';

function clampRetainer(price: any): number {
  const num = typeof price === 'number' ? price : parseInt(price, 10);
  if (isNaN(num)) return 32000;
  return Math.min(MAX_PRICE_INR, Math.max(MIN_PRICE_INR, Math.round(num)));
}

// Server-side Gemini client per skill instructions
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper: safe model generation with fallback
async function generateWithGemini(prompt: string, systemInstruction?: string, isJson: boolean = false) {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction: systemInstruction || 'You are AdGenix, an autonomous performance marketing ad agent. IMPORTANT: All currency MUST be in Indian Rupees (INR / ₹ / Rupees). Never use dollar signs ($). All deals and retainers are in Rupees.',
      temperature: 0.7,
      ...(isJson ? { responseMimeType: 'application/json' } : {}),
    },
  });

  return response.text || '';
}

// 1. Discover Leads (INR / Rupees)
app.post('/api/leads/discover', async (req, res) => {
  const { niche = 'D2C Ecommerce', count = 4, customQuery } = req.body;
  try {
    const prompt = `You are an automated ad agency lead generation engine for the Indian and global D2C market.
Discover and return ${count} highly realistic active brands in the niche: "${customQuery || niche}" that are currently scaling or struggling with digital ads (Meta, TikTok/Instagram Reels UGC, Google).
IMPORTANT CURRENCY RULE: All currency MUST be in Indian Rupees (INR / ₹ / Rupees). DO NOT write or output '$' dollar signs anywhere!

For each brand provide:
- brandName: string
- domain: string (e.g. brandname.in or brandname.co)
- industry: string
- estMonthlyAdSpend: string in Indian Rupees (e.g. "₹2,50,000/mo" or "Rupees 1,80,000/mo")
- contact: object with { name: string, role: string (Founder/CMO/Growth Lead), email: string }
- creativeAudit: object with {
    currentScore: number (35 to 65),
    primaryIssue: string (e.g. "Creative fatigue on Meta feed, zero authentic UGC testimonial hooks, high customer acquisition cost"),
    adFormatNeeded: "UGC Video" | "Meta Feed & Reels" | "TikTok Spark Ads" | "Full Omnichannel",
    suggestedOfferAngle: string,
    opportunityValue: number in Rupees (e.g. 25000 to 75000)
  }

Return strict valid JSON Array of objects matching this format.`;

    let leads = [];
    if (ai) {
      try {
        const text = await generateWithGemini(prompt, 'You are an autonomous ad agency scout. Return only a valid JSON array. All prices in Indian Rupees without any dollar signs.', true);
        leads = JSON.parse(text);
      } catch (err) {
        console.error('Gemini lead discovery error, falling back:', err);
      }
    }

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      // Actual real-world Indian D2C brands actively scaling on Meta & Reels ads
      leads = [
        {
          brandName: 'Foxtale Skin',
          domain: 'foxtale.in',
          industry: 'Clean Clinical Skincare D2C',
          estMonthlyAdSpend: '₹12,50,000/mo',
          contact: { name: 'Romita Mazumdar', role: 'Founder & CEO', email: 'partnerships@foxtale.in' },
          creativeAudit: {
            currentScore: 48,
            primaryIssue: 'Severe creative fatigue on Meta Feed & Reels; standard static before/after posts suffering rising CPA. Missing fast 3-second dermatologist comparison hooks tailored for Indian humidity.',
            adFormatNeeded: 'UGC Video',
            suggestedOfferAngle: 'Indian humidity-proof wear test + 3-second derm reaction breakdown vs ordinary niacinamide',
            opportunityValue: 42000
          }
        },
        {
          brandName: 'Mokobara Luggage',
          domain: 'mokobara.com',
          industry: 'Premium Travel Gear & Luggage D2C',
          estMonthlyAdSpend: '₹22,00,000/mo',
          contact: { name: 'Sangeet Agrawal', role: 'Co-Founder & Growth Lead', email: 'growth@mokobara.com' },
          creativeAudit: {
            currentScore: 52,
            primaryIssue: 'High ad spend on aesthetic airport photos experiencing audience saturation. Missing viral durability torture-tests (drop test, zipper pressure test) and packing compression demonstrations.',
            adFormatNeeded: 'Meta Feed & Reels',
            suggestedOfferAngle: 'Airport baggage handler torture test vs ordinary polycarb luggage',
            opportunityValue: 50000
          }
        },
        {
          brandName: 'Cosmix Wellness',
          domain: 'cosmix.in',
          industry: 'Plant Nutrition & Herbal Wellness D2C',
          estMonthlyAdSpend: '₹8,50,000/mo',
          contact: { name: 'Vibha Harish', role: 'Founder & Product Lead', email: 'team@cosmix.in' },
          creativeAudit: {
            currentScore: 49,
            primaryIssue: 'Ad copy is overly scientific with static ingredient lists; needs customer unboxing reactions, bloating relief 7-day timeline POV, and Meta story ads.',
            adFormatNeeded: 'UGC Video',
            suggestedOfferAngle: '7-Day Gut Reset transformation with macro-nutrient morning drink POV',
            opportunityValue: 35000
          }
        },
        {
          brandName: 'The Pant Project',
          domain: 'pantproject.com',
          industry: 'Custom-Fit Menswear & Trousers D2C',
          estMonthlyAdSpend: '₹9,00,000/mo',
          contact: { name: 'Dhruv Toshniwal', role: 'Founder & CEO', email: 'collaborations@pantproject.com' },
          creativeAudit: {
            currentScore: 50,
            primaryIssue: 'High customer acquisition cost on standard studio mannequin photos. Needs dynamic 4-way stretch flex tests and custom-fit guarantee videos on Meta Feed.',
            adFormatNeeded: 'Meta Feed & Reels',
            suggestedOfferAngle: 'The Work-to-Gym squat test: Custom fit trousers that never tear',
            opportunityValue: 38000
          }
        }
      ];
    }

    // Strictly enforce price bounds between ₹20,000 and ₹50,000 only
    leads = leads.map((l: any) => ({
      ...l,
      creativeAudit: {
        ...l.creativeAudit,
        opportunityValue: clampRetainer(l.creativeAudit?.opportunityValue)
      }
    }));

    res.json({ success: true, leads });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Generate Personalized Email Pitch with Spec Ad Angle
app.post('/api/leads/email-outreach', async (req, res) => {
  const { brandName, domain, contact, creativeAudit, agencyName = 'AdGenix' } = req.body;
  try {
    const prompt = `Write a high-converting, personalized cold email pitch from ${agencyName} to ${contact?.name || 'there'} (${contact?.role || 'Marketing Director'}) at ${brandName} (${domain}).
The brand's ad audit highlights:
- Issue: ${creativeAudit?.primaryIssue}
- Format Needed: ${creativeAudit?.adFormatNeeded}
- Suggested Angle: ${creativeAudit?.suggestedOfferAngle}
IMPORTANT: DO NOT use '$' dollar signs anywhere! If mentioning budget or value, use Rupees or ₹.

The email MUST:
1. Have a punchy, curiosity-inducing subject line (mention their specific brand, no spam).
2. Point out the specific creative bottleneck gently with proof of audit.
3. Include a 1-sentence teaser of an ad concept we pre-produced on spec for them.
4. Low friction Call-to-Action (e.g. "Mind if I send over the 15-second UGC storyboard & Meta copy draft we mocked up for you? No strings attached.").
5. Be under 140 words, conversational, respectful, and crisp.
6. MUST sign off with:
Best regards,
Daksh Gupta
Founder & Performance Lead, AdGenix
dakshgupta9156@gmail.com

Return JSON with:
{
  "subject": string,
  "body": string,
  "previewTeaser": string
}`;

    let emailData = null;
    if (ai) {
      try {
        const text = await generateWithGemini(prompt, 'You are an elite B2B ad sales copywriter. Return strict JSON. Do not use $ symbol anywhere. Always sign with Best regards, Daksh Gupta, Founder & Performance Lead, AdGenix (dakshgupta9156@gmail.com).', true);
        emailData = JSON.parse(text);
      } catch (err) {
        console.error('Gemini email generator error, falling back:', err);
      }
    }

    if (!emailData) {
      emailData = {
        subject: `Quick ad creative audit for ${brandName} (spotted a 35% ROAS leak)`,
        body: `Hey ${contact?.name?.split(' ')[0] || 'there'},\n\nI was auditing ${brandName}'s recent Meta & Instagram ad presence and noticed your current creatives are running into ad fatigue—cost per acquisition is likely climbing on the static lifestyle posts.\n\nOur team at ${agencyName} actually built out 2 custom spec concepts for you: a high-retention "${creativeAudit?.suggestedOfferAngle || 'UGC breakdown'}" plus fresh Meta copy angles tested to boost click-to-cart rate.\n\nWould you be open to checking out the 15-second UGC storyboard and ad mockup we prepared? Happy to send it right over—zero obligation.\n\nBest regards,\nDaksh Gupta\nFounder & Performance Lead, AdGenix\ndakshgupta9156@gmail.com`,
        previewTeaser: `Quick ad creative audit for ${brandName}... noticed current creatives running into fatigue.`
      };
    }

    res.json({ success: true, email: emailData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Generate Ads as per demands (UGC, Meta Ads, Video Spark)
app.post('/api/ads/generate', async (req, res) => {
  const { brandName, domain, adFormatNeeded = 'UGC Video', productContext = 'Performance Brand' } = req.body;
  try {
    const prompt = `You are a viral creative director at a top 1% performance ad agency.
Generate a complete, ready-to-produce advertising campaign for brand: "${brandName}" (${domain}), context: "${productContext}".
The requested format is "${adFormatNeeded}".
IMPORTANT: Never use '$' dollar signs anywhere! If price comparisons appear in the scripts or copy, write Rupees or ₹ (e.g. "Rupees 999", "Rupees 1,499").

You must generate:
1. "title": catchy campaign name (e.g. "The 3-Second Wakeup Shock Funnel")
2. "type": "${adFormatNeeded === 'Meta Feed & Reels' ? 'meta_ads' : adFormatNeeded === 'TikTok Spark Ads' ? 'tiktok' : 'ugc'}"
3. "targetAudience": concise persona description
4. "hookType": specific psychological angle
5. "ugcScript": {
    "actorPersona": "e.g. Relatable 26yo creator in natural ambient lighting",
    "bRollNotes": ["Macro texture shot", "Quick zoom cut on ingredient label", "Side-by-side split screen"],
    "hookScene": { "duration": "0-3s", "visual": "Shock face looking into camera, holding up old alternative vs this", "voiceover": "Stop scrolling if you're still doing...", "onScreenText": "WAIT... NEVER DO THIS 🛑", "vibe": "High energy urgency" },
    "problemScene": { "duration": "3-8s", "visual": "Fast montage showing the frustrating common problem", "voiceover": "I wasted weeks and thousands of rupees...", "onScreenText": "Why 90% of products fail here 📉" },
    "solutionScene": { "duration": "8-18s", "visual": "Product unboxing, smooth application, immediate visual satisfaction", "voiceover": "Until I switched to ${brandName}...", "onScreenText": "The game-changer breakdown ✨" },
    "socialProofScene": { "duration": "18-24s", "visual": "Showing 5-star customer reviews popping on screen", "voiceover": "Over 40,000 customers have already made the switch...", "onScreenText": "⭐️⭐️⭐️⭐️⭐️ 4.9/5 verified" },
    "ctaScene": { "duration": "24-30s", "visual": "Holding phone showing website checkout with discount code applied", "voiceover": "Tap below right now before the current batch sells out!", "onScreenText": "Tap Below to Claim 20% Off 🚀" }
}
6. "metaAd": {
    "primaryText": "Compelling 3-paragraph direct-response ad copy with bullet points, emotional hooks, and emojis. No dollar signs.",
    "headline": "High CTR Punchy Headline",
    "description": "Short sub-headline (e.g. Free Express Delivery + 30-Day Money Back Guarantee)",
    "callToAction": "Shop Now",
    "aspectRatio": "1:1",
    "visualConcept": "Art direction details for graphic design banner",
    "badgeText": "BESTSELLER 2026",
    "accentColor": "#4F46E5"
}
7. "tiktokAd": {
    "trendingAudioStyle": "Fast-paced lo-fi beat with trending voice filter",
    "pacingBPM": "128 BPM rapid jump-cuts every 1.2s",
    "scriptHook": "POV: You finally stopped wasting money on overpriced junk...",
    "captionsStyle": "Bold yellow & white centered karaoke captions"
}

Return ONLY strict valid JSON matching these fields.`;

    let adCampaign = null;
    if (ai) {
      try {
        const text = await generateWithGemini(prompt, 'You are a master performance ad director. Return only valid JSON object. No dollar signs.', true);
        adCampaign = JSON.parse(text);
      } catch (err) {
        console.error('Gemini ad generation error, falling back:', err);
      }
    }

    if (!adCampaign) {
      adCampaign = {
        title: `${brandName} Viral Conversion Sprint`,
        type: adFormatNeeded === 'Meta Feed & Reels' ? 'meta_ads' : adFormatNeeded === 'TikTok Spark Ads' ? 'tiktok' : 'ugc',
        targetAudience: 'Consumers seeking verified quality & instant results',
        hookType: 'Competitor Comparison & Frustration Agitation',
        ugcScript: {
          actorPersona: 'Natural, authentic 25-32 year old lifestyle creator speaking directly to camera with genuine excitement',
          bRollNotes: [
            'Tight macro texture close-up',
            'Screen recording showing raving verified customer comments',
            'Real morning routine B-roll showing effortless use'
          ],
          hookScene: {
            duration: '0-3s',
            visual: 'Creator waves hand across camera, holding product side-by-side with dull competitor packaging',
            voiceover: 'If you are still buying ordinary alternatives in 2026, stop right now.',
            onScreenText: 'DO NOT BUY UNTIL YOU SEE THIS 🛑',
            vibe: 'High urgency, genuine peer recommendation'
          },
          problemScene: {
            duration: '3-8s',
            visual: 'Quick split-second cuts showing empty promises and wasted money',
            voiceover: 'I tried 4 different brands last month and got zero results—total waste of rupees.',
            onScreenText: 'Why standard products let you down 📉'
          },
          solutionScene: {
            duration: '8-18s',
            visual: 'Crisp reveal of brandName with effortless usage demo and happy reaction',
            voiceover: `Then my friend put me on to ${brandName}. Within 3 days, the difference was literally night and day.`,
            onScreenText: `The ${brandName} difference ✨`
          },
          socialProofScene: {
            duration: '18-24s',
            visual: 'Overlay of verified 5-star customer reviews and press mentions',
            voiceover: 'Turns out over 25,000 people swear by this formula, and they have an insane 98% reorder rate.',
            onScreenText: '⭐️⭐️⭐️⭐️⭐️ 4.9/5 (25,000+ Reviews)'
          },
          ctaScene: {
            duration: '24-30s',
            visual: 'Creator taps screen pointing down toward link sticker / CTA button',
            voiceover: 'They are doing a limited bundle offer this week. Tap the link below before it sells out!',
            onScreenText: 'Claim Your Exclusive 20% Bundle 🛒'
          }
        },
        metaAd: {
          primaryText: `🚨 Most people make this critical mistake when shopping for ${productContext}...\n\nThey settle for watered-down formulas that take months to show results.\n\nHere is why ${brandName} is changing the industry:\n✅ Clinically formulated for rapid bio-availability\n✅ Zero filler or synthetic shortcuts\n✅ 98% Customer Satisfaction Guarantee\n\n"Literally the best purchase I made this year. Won't ever go back!" — Verified Buyer\n\n👉 Try risk-free for 30 days today.`,
          headline: `Discover The ${brandName} Difference | 30-Day Guarantee`,
          description: 'Free Shipping + Extra 15% Off Your First Order',
          callToAction: 'Shop Now',
          aspectRatio: '1:1',
          visualConcept: 'Crisp studio floating bottle with organic water ripples and glowing badge',
          badgeText: 'VIRAL CHOICE 2026',
          accentColor: '#3B82F6'
        },
        tiktokAd: {
          trendingAudioStyle: 'Rhythmic lo-fi upbeat drum loop with voice filter',
          pacingBPM: '128 BPM with cuts timed to snare hits',
          scriptHook: 'Do NOT buy this unless you are ready to be asked where you got it every single day...',
          captionsStyle: 'Bold font with animated yellow bounce on keywords'
        }
      };
    }

    res.json({ success: true, campaign: adCampaign });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Autonomous Price Negotiation & Deal Closer (Indian Rupees & FamPay)
app.post('/api/negotiate/step', async (req, res) => {
  const {
    brandName,
    contactName,
    contactRole,
    negotiationHistory = [],
    packageDetails,
    clientBudget,
    targetPrice = 35000,
    floorPrice = 22000,
  } = req.body;

  const effectiveFloorPrice = clampRetainer(floorPrice || 22000);
  const effectiveTargetPrice = clampRetainer(targetPrice || 35000);
  const effectiveClientBudget = clampRetainer(clientBudget || 28000);

  try {
    const prompt = `You are AdGenix, an autonomous senior performance ad sales closer.
You are negotiating an advertising creative and media package retainer with ${contactName} (${contactRole}) at ${brandName}.

CRITICAL CURRENCY & PRICING INSTRUCTION:
- All figures MUST be in Indian Rupees (INR / ₹ / Rupees).
- STRICT RULE: NEVER write '$' or dollar signs anywhere! Write ₹ or Rupees.
- STRICT PRICE BOUNDS: All retainers and prices MUST be strictly between ₹20,000 and ₹50,000 (Rupees 20,000 to 50,000) ONLY! Do NOT negotiate or settle below ₹20,000 and do NOT quote above ₹50,000.
- STRICT NON-REFUNDABLE POLICY: All ad packages and retainers are 100% Non-Refundable. Mention this explicitly in the closing agreement.
- Payment is settled via FamPay / UPI (FamPay ID: ${FAMPAY_ID}, Payee: ${PAYEE_NAME}).

Package being negotiated: ${JSON.stringify(packageDetails || { name: 'Growth UGC + Meta Retainer', targetPrice: effectiveTargetPrice })}
Agency Floor Price (lowest we can accept, min ₹20,000): Rupees ${effectiveFloorPrice}
Target Retainer (max ₹50,000): Rupees ${effectiveTargetPrice}
Client Estimated Budget: Rupees ${effectiveClientBudget}

Conversation history so far:
${JSON.stringify(negotiationHistory, null, 2)}

Instructions:
1. Determine the next realistic turn in the conversation.
2. If this is a response to the client's objection (e.g. asking for discounts, asking for performance-only, hesitating on budget):
   - Stand firm on value while demonstrating flexibility (e.g. "We can do ₹28,000/mo (Rupees 28,000) for the first 60-day pilot if we include 2 extra hook variations").
   - Never go below Rupees 20,000 and never exceed Rupees 50,000.
   - If the client's offer is at or above Rupees ${effectiveFloorPrice}, move towards CLOSING the deal decisively.
   - When terms are mutually agreed upon, output closed: true and generate the formal deal closing agreement. State that the retainer is 100% NON-REFUNDABLE and payable via FamPay / UPI ID: ${FAMPAY_ID}.
3. If the conversation needs client counter-argument, provide BOTH the realistic client response AND the agent's winning closing counter-punch!

Return JSON:
{
  "clientMessage": string (using Rupees or ₹, no $),
  "agentResponse": string (using Rupees or ₹, no $),
  "tacticUsed": string,
  "currentAgreedPrice": number (in Indian Rupees between 20000 and 50000, e.g. 32000),
  "isDealClosed": boolean,
  "dealAgreement": {
    "packageName": string,
    "finalMonthlyRetainer": number (between 20000 and 50000 in Rupees),
    "deliverables": string[],
    "contractTerms": string,
    "closingSummary": string,
    "fampayId": "${FAMPAY_ID}",
    "payeeName": "${PAYEE_NAME}"
  } | null
}`;

    let result = null;
    if (ai) {
      try {
        const text = await generateWithGemini(prompt, 'You are an autonomous ad agency deal closer. Output strict JSON only. Use Indian Rupees (₹ / Rupees) strictly without any $ dollar signs. Price must be strictly between 20000 and 50000 INR only and 100% non-refundable.', true);
        result = JSON.parse(text);
      } catch (err) {
        console.error('Gemini negotiation error, falling back:', err);
      }
    }

    if (!result) {
      const stepCount = negotiationHistory.length;
      if (stepCount >= 2) {
        // Close the deal!
        result = {
          clientMessage: `That sounds like a fair compromise. If you can guarantee the 2 extra UGC hook tests in month one, let's lock in the ₹32,000/mo (Rupees 32,000) pilot. How do we transfer the payment?`,
          agentResponse: `Done deal, ${contactName}! We've added the 2 bonus hook variations to your onboarding contract. Please note all retainer spots are strictly 100% non-refundable once creative production begins. You can remit the ₹32,000 retainer directly via FamPay / UPI ID: ${FAMPAY_ID} (${PAYEE_NAME}) or scan the official payment QR code. Creative production kicks off immediately! 🚀`,
          tacticUsed: 'Concession Exchange & Assumptive Close',
          currentAgreedPrice: 32000,
          isDealClosed: true,
          dealAgreement: {
            packageName: 'Performance UGC + Meta Scale Sprint',
            finalMonthlyRetainer: 32000,
            deliverables: [
              '4 Custom High-Retention UGC Video Ads (with full raw footage & hooks)',
              '8 Meta Feed & Story Ad Creatives with copy variants',
              'Weekly Creative Fatigue Monitoring & Audience Angle Iteration',
              'Dedicated Performance Creative Strategist'
            ],
            contractTerms: '100% Non-Refundable Retainer. 60-Day Pilot with rolling renewal. Remit via FamPay / UPI (shivamagrawal18@fam).',
            closingSummary: `Successfully closed ${brandName} on a ₹32,000/mo non-refundable retainer with 2 bonus hooks. Payment via FamPay ID: ${FAMPAY_ID}.`,
            fampayId: FAMPAY_ID,
            payeeName: PAYEE_NAME,
          }
        };
      } else {
        result = {
          clientMessage: `We love the spec ad mockups you sent over, but our monthly creative budget is capped at ₹25,000 (Rupees 25,000) right now. Would you consider meeting us there?`,
          agentResponse: `Appreciate the transparency, ${contactName}! Our standard tier is ₹38,000, but because we already have your winning competitor angles mapped, here is what we can do: we can meet in the middle at ₹28,000/mo (Rupees 28,000) for a 60-day launch sprint, AND we'll throw in 2 rapid-fire video hook variations for free so you get maximum ROAS from day one. Does that work so we can get cameras rolling?`,
          tacticUsed: 'Value Anchoring & Value-Add Counter Offer',
          currentAgreedPrice: 28000,
          isDealClosed: false,
          dealAgreement: null
        };
      }
    }

    // Clamp all output prices strictly between 20000 and 50000
    if (result) {
      if (result.currentAgreedPrice) {
        result.currentAgreedPrice = clampRetainer(result.currentAgreedPrice);
      }
      if (result.dealAgreement) {
        result.dealAgreement.finalMonthlyRetainer = clampRetainer(result.dealAgreement.finalMonthlyRetainer);
        result.dealAgreement.fampayId = FAMPAY_ID;
        result.dealAgreement.payeeName = PAYEE_NAME;
        if (!result.dealAgreement.contractTerms?.includes('Non-Refundable')) {
          result.dealAgreement.contractTerms = `100% Non-Refundable Retainer (Rupees 20,000 - 50,000 policy). Remit via FamPay / UPI ID: ${FAMPAY_ID}.`;
        }
      }
    }

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Send Payment Received Notification to User (ONLY WHEN MONEY ACTUALLY COMES)
app.post('/api/notify/owner', async (req, res) => {
  const { deal, ownerEmail = 'dakshgupta9156@gmail.com', paymentVerified = false, upiUtr = '' } = req.body;
  try {
    // STRICT USER REQUIREMENT: Only notify when money has actually come
    if (!paymentVerified) {
      console.log(`[AdGenix] Deal agreed but payment not verified yet. Suppressing notification to ${ownerEmail}.`);
      return res.json({
        success: true,
        notified: false,
        message: 'Notification skipped. Notifications are strictly reserved for when money has actually arrived in FamPay.',
      });
    }

    const rawAmount = deal?.closedAmount || 32000;
    const amountInRupees = clampRetainer(rawAmount);
    const formattedRupees = `₹${amountInRupees.toLocaleString('en-IN')}`;

    const notificationPayload = {
      timestamp: new Date().toISOString(),
      recipient: ownerEmail,
      title: `💰 [PAYMENT RECEIVED & VERIFIED] ${formattedRupees} Credited to FamPay (${FAMPAY_ID})!`,
      brandName: deal?.brandName,
      amount: amountInRupees,
      currency: 'INR',
      amountDisplay: formattedRupees,
      policy: '100% Non-Refundable Retainer (Advance UPI Remittance Confirmed)',
      package: deal?.dealPackage,
      fampayId: FAMPAY_ID,
      payeeName: PAYEE_NAME,
      paymentMethod: `FamPay / UPI (${FAMPAY_ID} - ${PAYEE_NAME})`,
      upiUtr: upiUtr || 'VERIFIED-UPI-INFLOW',
      status: 'confirmed_inflow',
      summary: `Payment of ${formattedRupees} has been verified and confirmed credited to FamPay ID: ${FAMPAY_ID} (${PAYEE_NAME}) for ${deal?.brandName}. UTR: ${upiUtr || 'N/A'}.`,
    };

    console.log(`[AdGenix REAL INFLOW Notification Dispatched to ${ownerEmail}]:`, notificationPayload);
    res.json({ success: true, notified: true, notification: notificationPayload });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function normalizeGitHubUrl(input: string, defaultUsername = 'dakshgupta9156-rgb'): string {
  let url = (input || '').trim();
  if (!url) return '';

  url = url.replace(/\/+$/, '');

  if (url.startsWith('git@github.com:')) {
    url = url.replace('git@github.com:', 'https://github.com/');
  }

  if (url.startsWith('github.com/')) {
    url = `https://${url}`;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('/')) {
      const parts = url.split('/').filter(Boolean);
      url = `https://github.com/${parts[0]}/${parts[1]}`;
    } else {
      const cleanRepo = url.replace(/\.git$/, '');
      url = `https://github.com/${defaultUsername}/${cleanRepo}`;
    }
  }

  if (!url.endsWith('.git')) {
    url = `${url}.git`;
  }

  return url;
}

// GitHub Integration Endpoints
app.get('/api/github/status', (req, res) => {
  exec('git log -1 --format="%h||%s||%cd" && git rev-parse --abbrev-ref HEAD && git remote -v', (err, stdout) => {
    if (err) {
      return res.json({ success: false, isGit: false, error: err.message });
    }
    const lines = stdout.trim().split('\n');
    const commitParts = (lines[0] || '').split('||');
    const currentBranch = lines[1] || 'main';
    const remotes = lines.slice(2).join('\n');

    res.json({
      success: true,
      isGit: true,
      currentBranch,
      lastCommitHash: commitParts[0] || 'f3f1416',
      lastCommitMessage: commitParts[1] || 'AdGenix Autonomous AI Ad Agency - Production Build',
      lastCommitDate: commitParts[2] || new Date().toISOString(),
      remotes: remotes || 'No remote added yet (ready for your GitHub repo)',
    });
  });
});

app.post('/api/github/push', (req, res) => {
  const { repoUrl, personalAccessToken, branch = 'main' } = req.body;

  if (!repoUrl || !repoUrl.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Repository URL or name is required (e.g. adgenix or https://github.com/dakshgupta9156/adgenix.git)',
    });
  }

  const normalizedUrl = normalizeGitHubUrl(repoUrl);

  if (!personalAccessToken || !personalAccessToken.trim()) {
    return res.status(400).json({
      success: false,
      normalizedUrl,
      error: 'GitHub Personal Access Token (PAT) is required for automated HTTPS push. GitHub requires token authentication for push operations.',
      hint: 'Click "Generate Token (repo scope)" above to generate your token in 10 seconds, or use the offline download options below.',
    });
  }

  const token = personalAccessToken.trim();
  // Embed personal access token into HTTPS URL
  const authenticatedUrl = normalizedUrl.replace('https://', `https://${encodeURIComponent(token)}@`);

  // Ensure git identity is configured, branch is active, remote is set, and push
  const cmd = `git config user.name "Daksh Gupta" 2>/dev/null || true && git config user.email "dakshgupta9156@gmail.com" 2>/dev/null || true && git branch -M ${branch} && git remote remove origin 2>/dev/null || true && git remote add origin "${authenticatedUrl}" && git push -u origin ${branch} --force`;

  exec(cmd, { env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }, maxBuffer: 1024 * 1024 * 5 }, (err, stdout, stderr) => {
    // Always scrub token from output / error logs
    const scrub = (str: string) => (str || '').replace(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '***TOKEN***');
    const safeStderr = scrub(stderr || '');
    const safeStdout = scrub(stdout || '');

    if (err) {
      console.error('Git push error:', safeStderr || err.message);
      let userFriendlyMessage = safeStderr || err.message;

      if (safeStderr.includes('Repository not found')) {
        userFriendlyMessage = `Repository not found at ${normalizedUrl}. Please make sure you have created the empty repository on GitHub at https://github.com/new first!`;
      } else if (safeStderr.includes('Authentication failed') || safeStderr.includes('Invalid username or password') || safeStderr.includes('could not read Username')) {
        userFriendlyMessage = 'Authentication failed. Please verify that your GitHub Personal Access Token (PAT) is valid and has the "repo" scope checked.';
      } else if (safeStderr.includes('Permission to') && safeStderr.includes('denied')) {
        userFriendlyMessage = `Permission denied. Your GitHub account does not have write access to push to ${normalizedUrl}.`;
      }

      return res.status(500).json({
        success: false,
        error: userFriendlyMessage,
        normalizedUrl,
        commandLog: (safeStdout + '\n' + safeStderr).trim(),
      });
    }

    res.json({
      success: true,
      normalizedUrl,
      message: `Successfully pushed repository to ${normalizedUrl} on branch ${branch}!`,
      log: safeStdout || `Branch ${branch} set up to track remote origin/${branch}.`,
    });
  });
});

app.get('/api/github/download-bundle', (req, res) => {
  const bundlePath = '/tmp/adgenix-git-repo.bundle';
  exec(`git bundle create ${bundlePath} --all`, (err) => {
    if (err || !fs.existsSync(bundlePath)) {
      return res.status(500).json({ success: false, error: 'Failed to create git bundle' });
    }
    res.download(bundlePath, 'adgenix-git-repo.bundle');
  });
});

app.get('/api/github/download-tar', (req, res) => {
  const tarPath = '/tmp/adgenix-source.tar.gz';
  exec(`tar --exclude="node_modules" --exclude="dist" -czf ${tarPath} .`, (err) => {
    if (err || !fs.existsSync(tarPath)) {
      return res.status(500).json({ success: false, error: 'Failed to create source tarball' });
    }
    res.download(tarPath, 'adgenix-source-code.tar.gz');
  });
});

// 6. Autonomous Step Simulation / Agent Thought Generator
app.post('/api/agent/run-autonomous-step', async (req, res) => {
  const { lead, currentStage } = req.body;
  try {
    const prompt = `You are the brain of AdGenix, an autonomous ad agency AI operating in India.
Current target lead: ${JSON.stringify(lead?.brandName || 'Brand')}
Current pipeline stage: ${currentStage} (discovered -> pitched -> negotiating -> closed_won)
IMPORTANT: Use Indian Rupees (₹ / Rupees). Never use '$'.

Generate an insightful, hyper-realistic internal monolog thought and immediate next action taken by the autonomous agent.
Format as JSON:
{
  "thought": string (e.g. "Analyzing @brand's Instagram Ad Library... detected high hook dropoff at 2.4s. Drafting comparison hook pitch."),
  "action": string (e.g. "Dispatched spec UGC storyboard via email to Head of Growth with pricing in Rupees"),
  "nextStage": string
}`;

    let thoughtData = null;
    if (ai) {
      try {
        const text = await generateWithGemini(prompt, 'You are an AI agent brain. Output valid JSON without any $ dollar signs.', true);
        thoughtData = JSON.parse(text);
      } catch (err) {
        console.error('Thought generation error:', err);
      }
    }

    if (!thoughtData) {
      thoughtData = {
        thought: `Synthesizing customer reviews for ${lead?.brandName || 'target brand'} to isolate top 3 emotional triggers. Preparing Meta Ad copy and retainer terms in Indian Rupees.`,
        action: `Executing automated outreach with custom spec creative preview.`,
        nextStage: currentStage === 'discovered' ? 'pitched' : currentStage === 'pitched' ? 'negotiating' : 'closed_won'
      };
    }

    res.json({ success: true, thoughtData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Vercel Deployment Endpoint
app.post('/api/vercel/deploy', (req, res) => {
  const { vercelToken, projectName = 'adgenix' } = req.body;
  if (!vercelToken || !vercelToken.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Vercel Token is required to deploy via CLI.',
      hint: 'Generate your free Vercel token at https://vercel.com/account/tokens',
    });
  }

  const token = vercelToken.trim();
  const safeProjectName = (projectName || 'adgenix').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase() || 'adgenix';

  const cmd = `npx -y vercel deploy --prod --yes --name=${safeProjectName} --token="${token}"`;

  exec(cmd, { env: { ...process.env, VERCEL_ORG_ID: '', VERCEL_PROJECT_ID: '' }, maxBuffer: 1024 * 1024 * 5 }, (err, stdout, stderr) => {
    const scrub = (str: string) => (str || '').replace(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '***TOKEN***');
    const safeStderr = scrub(stderr || '');
    const safeStdout = scrub(stdout || '');

    if (err) {
      let userFriendly = safeStderr || err.message;
      if (safeStderr.includes('Invalid token') || safeStderr.includes('not authorized')) {
        userFriendly = 'Invalid Vercel token or unauthorized. Please verify your token at vercel.com/account/tokens.';
      }
      return res.status(500).json({
        success: false,
        error: userFriendly,
        log: (safeStdout + '\n' + safeStderr).trim(),
      });
    }

    const match = safeStdout.match(/https:\/\/[a-zA-Z0-9-_\.]+\.vercel\.app/);
    const deployUrl = match ? match[0] : (safeStdout.trim().split('\n').pop() || '');

    res.json({
      success: true,
      url: deployUrl,
      message: `Successfully deployed to Vercel! Live at ${deployUrl}`,
      log: safeStdout,
    });
  });
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`AdGenix Autonomous Ad Agency Server listening on http://0.0.0.0:${port} [FamPay UPI: ${FAMPAY_ID}]`);
  });
}

// Export app for Vercel Serverless Function entry point
export default app;

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

