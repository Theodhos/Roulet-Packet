import type { Prize } from "@/types/roulette";

/**
 * Draws the winning prize for the (single) spin using the wheel's fixed
 * odds — see the `probability` on each entry in lib/roulette.ts. Pure
 * client-side randomness: this is a promotional wheel, not a
 * fairness-audited draw.
 */
export function selectPrize(prizes: Prize[]): Prize {
  const roll = Math.random();
  let cumulative = 0;
  for (const prize of prizes) {
    cumulative += prize.probability;
    if (roll <= cumulative) return prize;
  }
  // Guards against floating-point rounding leaving `roll` a hair above 1.
  return prizes[prizes.length - 1];
}
