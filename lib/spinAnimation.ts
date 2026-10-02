/**
 * Presentation-layer animation curve for the wheel. Kept separate from
 * lib/roulette.ts (which computes *where* the wheel must land) and
 * lib/probability.ts (which computes *what* wins) — this file only knows
 * how to visualize a rotation that has already been decided.
 */

export const SPIN_DURATION_MS = 5600;
export const REDUCED_MOTION_DURATION_MS = 420;

export interface CurveStop {
  offset: number;
  fraction: number;
  easing?: string;
}

function jitter(base: number, spread: number): number {
  return base + (Math.random() * 2 - 1) * spread;
}

/**
 * Generates one spin's five-stage rotation curve — quick spin-up,
 * sustained high-speed cruise, early deceleration, then a slow, precise
 * final approach — as (time offset, rotation fraction) stops, with each
 * breakpoint jittered by a few percent.
 *
 * The jitter is purely cosmetic (it never changes the final landing
 * angle, only the shape of the deceleration getting there) but it matters:
 * a fixed curve replayed on every spin leaves an identical, recognizable
 * "signature" deceleration that repeat testing exposes as programmed.
 * Generating a fresh curve per spin — passed to both buildSpinKeyframes
 * and interpolateRotation so the two never drift apart — makes every spin
 * decelerate slightly differently, like a real wheel would.
 */
export function createSpinCurve(): CurveStop[] {
  return [
    { offset: 0, fraction: 0, easing: "cubic-bezier(0.55, 0, 0.85, 0.35)" }, // spin-up
    { offset: jitter(0.16, 0.02), fraction: jitter(0.22, 0.02), easing: "linear" }, // high-speed cruise
    {
      offset: jitter(0.58, 0.03),
      fraction: jitter(0.62, 0.02),
      easing: "cubic-bezier(0.24, 0.7, 0.3, 1)",
    }, // controlled deceleration
    {
      offset: jitter(0.9, 0.02),
      fraction: jitter(0.93, 0.015),
      easing: "cubic-bezier(0.1, 0.6, 0.15, 1)",
    }, // final approach, near-crawl
    { offset: 1, fraction: 1 },
  ];
}

/**
 * Builds the keyframes for a single Element.animate() call that feels like
 * a real flywheel losing momentum rather than a linear or single-easing
 * tween.
 */
export function buildSpinKeyframes(fromDeg: number, toDeg: number, curve: CurveStop[]): Keyframe[] {
  const delta = toDeg - fromDeg;
  return curve.map(({ offset, fraction, easing }) => ({
    transform: `rotate(${fromDeg + delta * fraction}deg)`,
    offset,
    ...(easing ? { easing } : {}),
  }));
}

/**
 * Cheaply approximates the wheel's rotation at a given overall animation
 * progress (0–1) by linearly interpolating between the same curve stops
 * used above. Deliberately ignores each stop's micro cubic-bezier easing —
 * tick detection only needs to know roughly when a segment boundary was
 * crossed, not a frame-perfect angle, and this avoids ever reading
 * computed style (which forces a synchronous layout/style recalc on every
 * animation frame — the main source of visible stutter during a spin).
 */
export function interpolateRotation(fromDeg: number, toDeg: number, progress: number, curve: CurveStop[]): number {
  const delta = toDeg - fromDeg;
  const p = Math.min(1, Math.max(0, progress));

  for (let i = 1; i < curve.length; i++) {
    const prev = curve[i - 1];
    const curr = curve[i];
    if (p <= curr.offset) {
      const span = curr.offset - prev.offset;
      const localT = span === 0 ? 0 : (p - prev.offset) / span;
      const fraction = prev.fraction + (curr.fraction - prev.fraction) * localT;
      return fromDeg + delta * fraction;
    }
  }
  return toDeg;
}
