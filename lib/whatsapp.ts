const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

/**
 * Builds a wa.me deep link pre-filled with the win-claim message. Returns
 * null when NEXT_PUBLIC_WHATSAPP_NUMBER isn't configured, so the UI can
 * hide the claim button instead of linking to a broken chat.
 */
export function buildWhatsAppClaimUrl(prizeName: string): string | null {
  if (!WHATSAPP_NUMBER) return null;
  const message = `Hi I just won ${prizeName} on the spin wheel. I'd like to claim it.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
