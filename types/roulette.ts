export type PrizeTier = "low" | "medium" | "grand";

export interface Prize {
  id: number;
  /** Short label shown on the wheel wedge (narrow wedges can't fit the full title). */
  name: string;
  /** Full official prize title, shown in the win popup and sent in the claim message. */
  title: string;
  tier: PrizeTier;
  /** Fixed win chance for this exact prize (tier chance split evenly across its prizes). */
  probability: number;
  /** Full "you won" copy shown below the wheel once it lands on this prize. */
  description: string;
}

export interface PrizeTheme {
  /** Base wedge fill. */
  fill: string;
  /** Lighter tint used for the wedge's inner gradient highlight. */
  glow: string;
  /** Foreground color for labels rendered on this wedge. */
  text: string;
}
