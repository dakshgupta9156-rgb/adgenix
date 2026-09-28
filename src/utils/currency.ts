export const FAMPAY_ID = 'shivamagrawal18@fam';
export const PAYEE_NAME = 'SHIVAM AGRAWAL';

// Strict Pricing Bounds (Rupees 20,000 to 50,000 only)
export const MIN_RETAINER_INR = 20000;
export const MAX_RETAINER_INR = 50000;
export const NON_REFUNDABLE_POLICY = '100% Non-Refundable Retainer. Payable strictly in advance via FamPay / UPI.';

/**
 * Clamps any retainer amount strictly between ₹20,000 and ₹50,000
 */
export function clampRetainerRupees(amount: number | undefined): number {
  if (!amount || isNaN(amount)) return 25000;
  return Math.min(Math.max(Math.round(amount), MIN_RETAINER_INR), MAX_RETAINER_INR);
}

/**
 * Formats a numeric amount in Indian Rupees (INR)
 * Example: 45000 -> "₹45,000" or "Rupees 45,000"
 */
export function formatRupees(amount: number | string | undefined, includeSymbol: boolean = true): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
  const formatted = num.toLocaleString('en-IN');
  return includeSymbol ? `₹${formatted}` : `Rupees ${formatted}`;
}

export function formatRupeesFull(amount: number | string | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
  return `Rupees ${num.toLocaleString('en-IN')}`;
}

/**
 * Generates an official NPCI / UPI payment URI for scanning with any Indian UPI app
 * (FamPay, Google Pay, PhonePe, Paytm, BHIM, Cred)
 */
export function generateUpiUri(amount?: number, note: string = 'AdGenix Performance Ad Retainer'): string {
  const amtStr = amount ? `&am=${amount}` : '';
  const tnStr = encodeURIComponent(note);
  return `upi://pay?pa=${FAMPAY_ID}&pn=${encodeURIComponent(PAYEE_NAME)}${amtStr}&cu=INR&tn=${tnStr}`;
}

/**
 * Generates a clean QR code URL for FamPay / UPI payment
 */
export function generateFamPayQrUrl(amount?: number, note: string = 'AdGenix Retainer'): string {
  const upiUri = generateUpiUri(amount, note);
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(upiUri)}`;
}
