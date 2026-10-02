import type { Prize, PrizeTheme, PrizeTier } from "@/types/roulette";

export const TOTAL_SECTIONS = 8;
export const SECTION_ANGLE = 360 / TOTAL_SECTIONS;

/** Total win chance for each tier — must sum to 1. */
export const TIER_CHANCE: Record<PrizeTier, number> = {
  low: 0.6,
  medium: 0.3,
  grand: 0.1,
};

/**
 * The 8 wedges, in wheel order. Each prize's `probability` is its tier's
 * total chance split evenly across however many prizes share that tier —
 * low: 0.6 / 3, medium: 0.3 / 3, grand: 0.1 / 2. `description` is the exact
 * "You won ..." copy shown in the win popup.
 */
export const PRIZES: Prize[] = [
  {
    id: 0,
    name: "Full Marketing Review",
    title: "Full Business Marketing Overview",
    tier: "grand",
    probability: TIER_CHANCE.grand / 2,
    description:
      "You won the Grand Prize — a Full Business Marketing Overview. A 60-90 minute multi-channel review covering social media, ads, email, LinkedIn, SEO, and funnels. We find what's working, where money is leaking, and build you a specific action plan to keep.",
  },
  {
    id: 1,
    name: "3 Free Posts",
    title: "3 Free Posts",
    tier: "low",
    probability: TIER_CHANCE.low / 3,
    description:
      "You won 3 free posts for your business. Three branded social posts, designed and written, ready to publish.",
  },
  {
    id: 2,
    name: "3 Free Reels",
    title: "3 Free Reels",
    tier: "medium",
    probability: TIER_CHANCE.medium / 3,
    description:
      "You won 3 free reels. If you have real video footage, all three are fully free. If you don't, you cover only the Higgsfield credits per reel and we handle the rest.",
  },
  {
    id: 3,
    name: "1 Free Reel",
    title: "1 Free Reel",
    tier: "low",
    probability: TIER_CHANCE.low / 3,
    description:
      "You won 1 free reel. If you have real video footage, we produce it fully free. If you don't, you cover only the Higgsfield AI credits & we handle edit, captions and effects.",
  },
  {
    id: 4,
    name: "1 Month Free Ads",
    title: "Meta Ads Management, 1 Month Free",
    tier: "grand",
    probability: TIER_CHANCE.grand / 2,
    description:
      "You won the Grand Prize — Meta Ads Management, 1 month free. You provide the ad creatives and text. We manage the campaign structure, audiences, pixel, optimisation and consult you weekly on what to improve. Only pay ad spend directly to Meta.",
  },
  {
    id: 5,
    name: "1-Week Content Plan",
    title: "1 Week Social Media Content Plan + Calendar",
    tier: "medium",
    probability: TIER_CHANCE.medium / 3,
    description:
      "You won a 1 Week Social Media Content Plan + Calendar. Post ideas, formats, hooks, themes, and posting times built around your business. Yours to execute or hand to anyone.",
  },
  {
    id: 6,
    name: "20% Off Marketing",
    title: "20% Off Social Media Marketing / Meta Ads",
    tier: "low",
    probability: TIER_CHANCE.low / 3,
    description:
      "You won 20% off your first month of Social Media Marketing or Meta Ads Management. Your choice. New engagements only.",
  },
  {
    id: 7,
    name: "Strategy Session",
    title: "Email Marketing / LinkedIn Outreach Strategy + Planning Session",
    tier: "medium",
    probability: TIER_CHANCE.medium / 3,
    description:
      "You won a 60-90 minute strategy session. Your choice: Email Marketing or LinkedIn Outreach based on your business niche and we map the plan live.",
  },
];

/** Wedge color communicates rarity: every prize in a tier shares its tier's theme. */
const THEME_BY_TIER: Record<PrizeTier, PrizeTheme> = {
  low: { fill: "#2E6B8C", glow: "#6CAFCC", text: "#F5F6FA" },
  medium: { fill: "#6C5AB0", glow: "#A192D8", text: "#F5F6FA" },
  grand: { fill: "#C9962F", glow: "#F7D698", text: "#17140C" },
};

export const PRIZE_THEMES: PrizeTheme[] = PRIZES.map((prize) => THEME_BY_TIER[prize.tier]);
