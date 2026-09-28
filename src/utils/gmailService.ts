import { formatRupees, formatRupeesFull, FAMPAY_ID, PAYEE_NAME, NON_REFUNDABLE_POLICY, generateFamPayQrUrl } from './currency';
import { ClosedDeal, Lead } from '../types/agency';

/**
 * Encodes a string into a base64url-encoded string (RFC 4648 § 5)
 * compatible with the Gmail API's messages.send raw parameter.
 */
export function encodeBase64Url(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export interface SendEmailParams {
  accessToken: string;
  to: string;
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  fromName?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  threadId?: string;
  error?: string;
}

/**
 * Sends an email directly via the official Gmail REST API using the user's OAuth access token.
 */
export async function sendGmailMessage({
  accessToken,
  to,
  subject,
  bodyText,
  bodyHtml,
  fromName = 'Daksh Gupta - AdGenix',
}: SendEmailParams): Promise<SendEmailResult> {
  if (!accessToken) {
    throw new Error('No Google OAuth access token provided. Please sign in with Google first.');
  }

  // Construct standard MIME email message
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  
  const headers = [
    `To: <${to}>`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    `MIME-Version: 1.0`,
  ];

  let rawEmail = '';

  if (bodyHtml) {
    headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    const plainPart = bodyText || bodyHtml.replace(/<[^>]+>/g, ' ');
    
    rawEmail = `${headers.join('\r\n')}\r\n\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: text/plain; charset=UTF-8\r\n` +
      `Content-Transfer-Encoding: 7bit\r\n\r\n` +
      `${plainPart}\r\n\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: text/html; charset=UTF-8\r\n` +
      `Content-Transfer-Encoding: 7bit\r\n\r\n` +
      `${bodyHtml}\r\n\r\n` +
      `--${boundary}--`;
  } else {
    headers.push(`Content-Type: text/plain; charset=UTF-8`);
    rawEmail = `${headers.join('\r\n')}\r\n\r\n${bodyText || ''}`;
  }

  const encodedMessage = encodeBase64Url(rawEmail);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const errorMessage = errorJson?.error?.message || `Gmail API responded with status ${response.status}`;
    console.error('Gmail send error:', errorJson);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return {
    success: true,
    messageId: data.id,
    threadId: data.threadId,
  };
}

/**
 * Creates the high-fidelity Test Email specifically requested by the user for dakshgupta9156@gmail.com
 * Includes the official FamPay QR Code image and signs as Daksh Gupta.
 */
export async function sendAdGenixTestEmail(
  accessToken: string,
  recipientEmail: string = 'dakshgupta9156@gmail.com'
): Promise<SendEmailResult> {
  const subject = `🚀 [AdGenix Live Verification] Gmail API & Payment Gateway Connected!`;
  const qrUrl = generateFamPayQrUrl(35000, 'AdGenix Live Retainer');
  
  const bodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #374151; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center; }
    .badge { display: inline-block; background-color: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
    .card { background-color: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .price-tag { font-size: 28px; font-weight: 900; color: #34d399; margin: 8px 0; }
    .fampay-box { background-color: #1e1b4b; border: 2px solid #6366f1; border-radius: 14px; padding: 20px; margin: 20px 0; text-align: center; }
    .footer { border-top: 1px solid #1f2937; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; background-color: #0b0f19; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">● LIVE DISPATCH VERIFIED</div>
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">AdGenix Autonomous Agency</h1>
      <p style="color: #c7d2fe; margin: 6px 0 0; font-size: 13px;">Real-Time Performance Ad Agent & Price Closing Engine</p>
    </div>
    <div class="content">
      <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Test Email Successfully Delivered! ✅</h2>
      <p>Hello Daksh,</p>
      <p>This email confirms that <strong>AdGenix is now actively connected to your Gmail account</strong> via Google Workspace OAuth with verified permissions.</p>

      <div class="card">
        <h3 style="color: #ffffff; font-size: 15px; margin-top: 0;">⚡ How AdGenix Makes Money in Live Operation:</h3>
        <ol style="padding-left: 20px; margin-bottom: 0;">
          <li><strong>Autonomous Brand Discovery:</strong> Identifies active Indian & global D2C e-commerce brands running suboptimal creatives.</li>
          <li><strong>Custom Spec Ad Production:</strong> Instantly generates 5-scene viral UGC video scripts and high-CTR Meta ad copy tailored to the brand's niche.</li>
          <li><strong>Direct Cold Outreach:</strong> Dispatches high-converting email audits to founders & CMOs directly through this Gmail connection.</li>
          <li><strong>Dynamic Negotiation & Closing:</strong> Autonomous price closer locks in monthly retainers strictly bounded between <strong>₹20,000 and ₹50,000</strong>.</li>
          <li><strong>Instant FamPay / UPI Remittance:</strong> All closed deals are <strong>100% Non-Refundable</strong> with immediate payments collected via FamPay UPI.</li>
        </ol>
      </div>

      <div class="fampay-box">
        <div style="font-weight: 800; font-size: 13px; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
          ⚡ Official FamPay / UPI Payment QR Code
        </div>
        <p style="font-size: 12px; color: #cbd5e1; margin: 0 0 14px;">Scan with FamPay, Google Pay, PhonePe, Paytm, BHIM, or any UPI app</p>
        <div style="display: inline-block; padding: 10px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);">
          <img src="${qrUrl}" alt="FamPay / UPI QR Code" width="220" height="220" style="display: block; border-radius: 8px;" />
        </div>
        <div style="margin-top: 14px;">
          <div style="font-size: 18px; font-weight: bold; font-family: monospace; color: #38bdf8;">${FAMPAY_ID}</div>
          <div style="font-size: 13px; color: #f8fafc; font-weight: 600; margin-top: 3px;">Payee: <strong>${PAYEE_NAME}</strong> • Currency: <strong>Indian Rupees (INR / ₹)</strong></div>
          <div style="font-size: 11px; margin-top: 6px; color: #fca5a5; font-weight: bold;">Policy: ${NON_REFUNDABLE_POLICY}</div>
        </div>
      </div>

      <p style="margin-top: 24px;">Your autonomous agent is ready to hunt leads, generate high-ROAS creative packages, and close retainers!</p>
      
      <p style="margin-top: 28px; line-height: 1.6; margin-bottom: 0;">
        Best regards,<br>
        <strong style="color: #ffffff; font-size: 16px;">Daksh Gupta</strong><br>
        <span style="color: #94a3b8; font-size: 13px;">Founder & Performance Lead, AdGenix</span><br>
        <a href="mailto:dakshgupta9156@gmail.com" style="color: #818cf8; font-size: 12px; text-decoration: none; font-family: monospace;">dakshgupta9156@gmail.com</a>
      </p>
    </div>
    <div class="footer">
      Sent autonomously via AdGenix AI Performance Agency • Connected to ${recipientEmail}
    </div>
  </div>
</body>
</html>
  `;

  return sendGmailMessage({
    accessToken,
    to: recipientEmail,
    subject,
    bodyHtml,
    fromName: 'Daksh Gupta - AdGenix',
  });
}

/**
 * Dispatches a high-converting cold pitch email with spec ad review & FamPay QR to a prospect lead
 */
export async function sendLeadPitchEmail(
  accessToken: string,
  lead: Lead
): Promise<SendEmailResult> {
  const subject = `Quick ad creative audit for ${lead.brandName} (spotted a 35% ROAS leak)`;
  const qrUrl = generateFamPayQrUrl(lead.creativeAudit.opportunityValue || 35000, `AdGenix Retainer - ${lead.brandName}`);
  
  const bodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #374151; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { background: linear-gradient(135deg, #312e81, #4f46e5); padding: 28px 24px; text-align: center; }
    .content { padding: 28px 24px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
    .card { background-color: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 18px; margin: 18px 0; }
    .highlight { color: #38bdf8; font-weight: bold; }
    .footer { border-top: 1px solid #1f2937; padding: 16px; text-align: center; font-size: 11px; color: #6b7280; background-color: #0b0f19; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 11px; font-weight: bold; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.05em;">PERFORMANCE AD CREATIVE AUDIT</div>
      <h1 style="color: #ffffff; margin: 8px 0 0; font-size: 22px; font-weight: 800;">AdGenix Performance Labs</h1>
    </div>
    <div class="content">
      <p>Hey ${lead.contact.name.split(' ')[0] || 'there'},</p>
      <p>I was auditing <strong>${lead.brandName}</strong>'s current Meta and Reels ad presence and noticed your creatives are suffering from ad fatigue—cost per acquisition is likely climbing on your static lifestyle posts.</p>
      
      <div class="card">
        <div style="font-size: 13px; font-weight: bold; color: #ffffff; margin-bottom: 8px;">📊 Creative Audit Snapshot:</div>
        <div>• <strong>Primary Issue:</strong> ${lead.creativeAudit.primaryIssue}</div>
        <div>• <strong>Format Needed:</strong> <span class="highlight">${lead.creativeAudit.adFormatNeeded}</span></div>
        <div>• <strong>Recommended Hook Angle:</strong> ${lead.creativeAudit.suggestedOfferAngle}</div>
      </div>

      <p>Our autonomous studio at AdGenix pre-produced <strong>2 custom spec ad concepts</strong> for ${lead.brandName}—including a 15-second high-retention UGC storyboard and fresh direct-response copy angles mapped against high-converting D2C funnels.</p>

      <p>Would you be open to checking out the storyboard and ad mockups? Happy to send them right over—no strings attached.</p>

      <div style="background-color: #1e1b4b; border: 1px solid #4338ca; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
        <div style="font-size: 12px; font-weight: bold; color: #a5b4fc; margin-bottom: 6px;">AdGenix Retainers (Strictly ₹20,000 – ₹50,000/mo • 100% Non-Refundable)</div>
        <p style="font-size: 11px; color: #94a3b8; margin: 0 0 10px;">Payment settled in advance via FamPay UPI</p>
        <div style="display: inline-block; padding: 8px; background-color: #ffffff; border-radius: 10px;">
          <img src="${qrUrl}" alt="FamPay / UPI QR Code" width="160" height="160" style="display: block; border-radius: 6px;" />
        </div>
        <div style="font-family: monospace; font-size: 13px; font-weight: bold; color: #38bdf8; margin-top: 8px;">UPI ID: ${FAMPAY_ID}</div>
        <div style="font-size: 11px; color: #cbd5e1;">Payee: ${PAYEE_NAME}</div>
      </div>

      <p style="margin-top: 24px; line-height: 1.5;">Best regards,<br>
        <strong style="color: #ffffff; font-size: 15px;">Daksh Gupta</strong><br>
        <span style="color: #94a3b8; font-size: 13px;">Founder & Performance Lead, AdGenix</span><br>
        <a href="mailto:dakshgupta9156@gmail.com" style="color: #818cf8; font-size: 12px; text-decoration: none; font-family: monospace;">dakshgupta9156@gmail.com</a>
      </p>
    </div>
    <div class="footer">
      Sent directly via AdGenix Performance Labs • Daksh Gupta (dakshgupta9156@gmail.com)
    </div>
  </div>
</body>
</html>
  `;

  return sendGmailMessage({
    accessToken,
    to: lead.contact.email,
    subject,
    bodyHtml,
    fromName: 'Daksh Gupta - AdGenix',
  });
}

/**
 * Sends a real deal closing confirmation invoice to ownerEmail via Gmail
 * Includes the official FamPay QR Code image and signs as Daksh Gupta.
 */
export async function sendDealClosedInvoiceEmail(
  accessToken: string,
  recipientEmail: string,
  deal: ClosedDeal
): Promise<SendEmailResult> {
  const subject = `🎉 [DEAL CLOSED] ₹${deal.closedAmount.toLocaleString('en-IN')}/mo Retainer Won with ${deal.brandName}!`;
  const qrUrl = generateFamPayQrUrl(deal.closedAmount, `AdGenix Retainer - ${deal.brandName}`);
  
  const bodyHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #10b981; border-radius: 14px; padding: 24px;">
    <span style="background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 11px; font-weight: bold; padding: 3px 10px; border-radius: 12px;">DEAL CLOSED (NON-REFUNDABLE)</span>
    <h1 style="color: #ffffff; margin: 12px 0 6px;">${deal.brandName} Signed On!</h1>
    <h2 style="color: #10b981; margin: 0 0 16px;">₹${deal.closedAmount.toLocaleString('en-IN')} / month (Rupees ${formatRupeesFull(deal.closedAmount)})</h2>
    
    <div style="background: #1f2937; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 13px; line-height: 1.6;">
      <div><strong>Client Domain:</strong> ${deal.domain}</div>
      <div><strong>Authorized Signer:</strong> ${deal.clientSigner}</div>
      <div><strong>Package:</strong> ${deal.dealPackage}</div>
      <div><strong>Contract Date:</strong> ${deal.contractDate}</div>
      <div style="color: #f87171; font-weight: bold; margin-top: 6px;">Terms: 100% Non-Refundable (₹20,000 – ₹50,000 bound)</div>
      <div style="color: #fbbf24; font-weight: bold; margin-top: 4px;">Remit via FamPay UPI: ${FAMPAY_ID} (${PAYEE_NAME})</div>
    </div>

    <!-- Embedded FamPay QR Code -->
    <div style="text-align: center; margin: 20px 0; padding: 18px; background-color: #0f172a; border-radius: 12px; border: 1px solid #334155;">
      <div style="font-size: 13px; font-weight: bold; color: #34d399; margin-bottom: 8px;">Official FamPay / UPI Remittance QR Code:</div>
      <div style="display: inline-block; padding: 10px; background-color: #ffffff; border-radius: 12px;">
        <img src="${qrUrl}" alt="FamPay UPI QR Code" width="200" height="200" style="display: block; border-radius: 8px;" />
      </div>
      <div style="font-family: monospace; font-size: 15px; color: #fbbf24; margin-top: 10px; font-weight: bold;">${FAMPAY_ID}</div>
      <div style="font-size: 12px; color: #cbd5e1; margin-top: 2px;">Payee: <strong>${PAYEE_NAME}</strong> • 100% Non-Refundable</div>
    </div>

    <div style="margin-top: 16px; font-size: 13px;">
      <strong>Deliverables in Progress:</strong>
      <ul>
        ${deal.deliverables.map((d) => `<li>${d}</li>`).join('')}
      </ul>
    </div>

    <p style="margin-top: 24px; font-size: 13px; line-height: 1.6;">
      Best regards,<br>
      <strong style="color: #ffffff; font-size: 15px;">Daksh Gupta</strong><br>
      <span style="color: #94a3b8; font-size: 12px;">Founder & Agency Lead, AdGenix</span><br>
      <a href="mailto:dakshgupta9156@gmail.com" style="color: #818cf8; font-size: 12px; text-decoration: none; font-family: monospace;">dakshgupta9156@gmail.com</a>
    </p>
  </div>
</body>
</html>
  `;

  return sendGmailMessage({
    accessToken,
    to: recipientEmail,
    subject,
    bodyHtml,
    fromName: 'Daksh Gupta - AdGenix',
  });
}
