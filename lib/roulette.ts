import type { RouletteSection, SectionTheme } from "@/types/roulette";

/** Flip to false to let packages be won infinitely without depleting stock. */
export const ENABLE_PACKAGE_DEPLETION = true;

export const TOTAL_SECTIONS = 6;
export const SECTION_ANGLE = 360 / TOTAL_SECTIONS;
export const SPIN_DURATION_MS = 5200;

export const initialSections: RouletteSection[] = [
  { id: 1, name: "Package 1", packageCount: 1 },
  { id: 2, name: "Package 2", packageCount: 2 },
  { id: 3, name: "Package 3", packageCount: 3 },
  { id: 4, name: "Package 4", packageCount: 4 },
  { id: 5, name: "Package 5", packageCount: 5 },
  { id: 6, name: "Package 6", packageCount: 6 },
];

export const SECTION_THEMES: SectionTheme[] = [
  { fill: "#f43f5e", glow: "#fda4af" },
  { fill: "#fb923c", glow: "#fed7aa" },
  { fill: "#facc15", glow: "#fef08a" },
  { fill: "#34d399", glow: "#a7f3d0" },
  { fill: "#38bdf8", glow: "#bae6fd" },
  { fill: "#a78bfa", glow: "#ddd6fe" },
];

const MIN_EXTRA_SPINS = 5;
const MAX_EXTRA_SPINS = 8;
// Keep the landing point away from wedge borders so it never looks ambiguous.
const CENTER_JITTER_LIMIT = SECTION_ANGLE / 2 - 8;

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Computes the next cumulative rotation (in degrees) for the wheel so that,
 * after several full spins, `sectionIndex` lands under the fixed top pointer.
 * `currentRotation` is never reset to 0 between spins — it keeps growing so
 * the wheel always turns forward, never teleports.
 */
export function getSpinRotation(
  currentRotation: number,
  sectionIndex: number
): number {
  const sectionCenter = sectionIndex * SECTION_ANGLE + SECTION_ANGLE / 2;
  const jitter = (Math.random() * 2 - 1) * CENTER_JITTER_LIMIT;
  const targetPoint = normalizeAngle(sectionCenter + jitter);

  // Rotating the wheel by R moves the point that sits at angle `a` to
  // normalize(a + R). We need the target point to land at 0deg (the pointer).
  const targetMod = normalizeAngle(360 - targetPoint);
  const currentMod = normalizeAngle(currentRotation);

  let delta = targetMod - currentMod;
  if (delta <= 0) delta += 360;

  const extraSpins =
    MIN_EXTRA_SPINS +
    Math.floor(Math.random() * (MAX_EXTRA_SPINS - MIN_EXTRA_SPINS + 1));

  return currentRotation + delta + extraSpins * 360;
}
