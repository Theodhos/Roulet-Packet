import type { RouletteSection, SectionProbability } from "@/types/roulette";

function getAvailableSections(sections: RouletteSection[]): RouletteSection[] {
  return sections.filter((section) => section.packageCount > 0);
}

/**
 * Weight is inversely proportional to packageCount, so scarcer sections are
 * mathematically more likely to be picked without ever being guaranteed.
 */
export function calculateProbabilities(
  sections: RouletteSection[]
): SectionProbability[] {
  const available = getAvailableSections(sections);

  if (available.length === 0) {
    return sections.map((section) => ({ id: section.id, probability: 0 }));
  }

  const weights = available.map((section) => 1 / section.packageCount);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  const probabilityById = new Map<number, number>();
  available.forEach((section, index) => {
    probabilityById.set(section.id, weights[index] / totalWeight);
  });

  return sections.map((section) => ({
    id: section.id,
    probability: probabilityById.get(section.id) ?? 0,
  }));
}

/**
 * Picks a winning section at random, weighted so that the section with the
 * fewest remaining packages has the highest chance of winning. Depleted
 * sections (packageCount === 0) never participate. Returns null only when
 * every section is depleted.
 */
export function selectWeightedSection(
  sections: RouletteSection[]
): RouletteSection | null {
  const available = getAvailableSections(sections);

  if (available.length === 0) return null;
  if (available.length === 1) return available[0];

  const weights = available.map((section) => 1 / section.packageCount);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  const roll = Math.random() * totalWeight;

  let cumulative = 0;
  for (let i = 0; i < available.length; i++) {
    cumulative += weights[i];
    if (roll <= cumulative) {
      return available[i];
    }
  }

  // Guards against floating-point rounding leaving `roll` a hair above the
  // last cumulative total.
  return available[available.length - 1];
}
