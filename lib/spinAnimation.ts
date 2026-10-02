/**
 * Presentation-layer animation curve for the wheel. Kept separate from
 * lib/roulette.ts (which computes *where* the wheel must land) and
 * lib/probability.ts (which computes *what* wins) — this file only knows
 * how to visualize a rotation that has already been decided.
 */

export const SPIN_DURATION_MS = 5600;
export const REDUCED_MOTION_DURATION_MS = 420;

export interface SpinCurve {
  /** Fraction of total time spent ramping up to cruise speed. */
  rampEnd: number;
  /** Fraction of total time at which the cruise ends and deceleration begins. */
  cruiseEnd: number;
}

function jitter(base: number, spread: number): number {
  return base + (Math.random() * 2 - 1) * spread;
}

/**
 * ∫(3u² − 2u³)du from 0 to x — the antiderivative of the classic Hermite
 * smoothstep, used below to turn a smoothstep *velocity* ramp into a
 * rotation *position*.
 */
function smoothstepIntegral(x: number): number {
  return x ** 3 - 0.5 * x ** 4;
}

/**
 * Generates one spin's ramp-up/cruise/ramp-down timing, jittered a little
 * each time so repeated spins don't share an identical, recognizable
 * signature.
 */
export function createSpinCurve(): SpinCurve {
  return {
    rampEnd: jitter(0.06, 0.015),
    cruiseEnd: jitter(0.55, 0.04),
  };
}

/**
 * The wheel's rotation fraction (0–1) at time fraction t (0–1), for a
 * velocity profile that ramps up to cruise speed, holds it, then ramps
 * back down to a dead stop — each transition shaped by a smoothstep, so
 * velocity (and its slope) is continuous everywhere, including at both
 * junctions and at the final landing (velocity is exactly 0 at t=1, so it
 * settles rather than snapping to a stop).
 *
 * This is the single source of truth for the curve's shape: both
 * buildSpinKeyframes (sampled into real keyframes) and the tick-detection
 * loop in useWheelSpin read it, so they can never disagree with each
 * other or — more importantly — contain a seam a careful eye could read
 * as "this was programmed to land here."
 */
export function curveFraction(t: number, curve: SpinCurve): number {
  const { rampEnd: a, cruiseEnd: c } = curve;
  const clamped = Math.min(1, Math.max(0, t));
  const v0 = 2 / (1 + c - a);

  if (clamped <= a) {
    return a <= 0 ? 0 : v0 * a * smoothstepIntegral(clamped / a);
  }

  const atRampEnd = v0 * a * 0.5;
  if (clamped <= c) {
    return atRampEnd + v0 * (clamped - a);
  }

  const atCruiseEnd = atRampEnd + v0 * (c - a);
  const decelSpan = 1 - c;
  const u = decelSpan <= 0 ? 1 : (clamped - c) / decelSpan;
  // Velocity here is v0 * (1 − S(u)) — ramping DOWN, unlike the ramp-up
  // branch above — so its integral is v0 * decelSpan * (u − smoothstepIntegral(u)),
  // not smoothstepIntegral(u) alone.
  return atCruiseEnd + v0 * decelSpan * (u - smoothstepIntegral(u));
}

const KEYFRAME_SAMPLES = 64;

/**
 * Samples curveFraction into enough keyframes that linear interpolation
 * between consecutive samples is visually indistinguishable from the true
 * smooth curve — avoiding the alternative of stitching together a few
 * keyframes with different per-segment easings, which leaves a velocity
 * discontinuity ("jerk") at every stitch.
 */
export function buildSpinKeyframes(fromDeg: number, toDeg: number, curve: SpinCurve): Keyframe[] {
  const delta = toDeg - fromDeg;
  return Array.from({ length: KEYFRAME_SAMPLES }, (_, i) => {
    const offset = i / (KEYFRAME_SAMPLES - 1);
    return {
      transform: `rotate(${fromDeg + delta * curveFraction(offset, curve)}deg)`,
      offset,
    };
  });
}

/**
 * Cheaply evaluates the wheel's rotation at a given overall animation
 * progress (0–1) for tick detection, without ever reading computed style
 * (which forces a synchronous layout/style recalc on every animation
 * frame — the main source of visible stutter during a spin).
 */
export function interpolateRotation(fromDeg: number, toDeg: number, progress: number, curve: SpinCurve): number {
  return fromDeg + (toDeg - fromDeg) * curveFraction(progress, curve);
}
