"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  SPIN_DURATION_MS,
  REDUCED_MOTION_DURATION_MS,
  buildSpinKeyframes,
  interpolateRotation,
  createSpinCurve,
} from "./spinAnimation";
import { usePrefersReducedMotion } from "./useReducedMotion";

interface UseWheelSpinArgs {
  spinning: boolean;
  rotation: number;
  /** 360 / segment count — drives both jitter math and tick detection. */
  sectionAngle: number;
  onSpinEnd: () => void;
  /** Optional element to give a small mechanical "tick" bounce on each segment crossed. */
  tickTargetRef?: RefObject<HTMLElement | null>;
}

/**
 * Drives a wheel's rotation via the Web Animations API with a physically
 * believable multi-phase curve (see lib/spinAnimation.ts), plus a
 * requestAnimationFrame loop that nudges `tickTargetRef` every time the
 * live rotation crosses a segment boundary. Shared by every wheel on the
 * page so the animation feel is identical everywhere.
 */
export function useWheelSpin({
  spinning,
  rotation,
  sectionAngle,
  onSpinEnd,
  tickTargetRef,
}: UseWheelSpinArgs) {
  const wheelRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const lastRotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastSegmentRef = useRef<number | null>(null);
  const [finalApproach, setFinalApproach] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!spinning) return;
    const wheelEl = wheelRef.current;
    if (!wheelEl) return;

    animationRef.current?.cancel();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setFinalApproach(false);

    const from = lastRotationRef.current;
    const to = rotation;
    const duration = reducedMotion ? REDUCED_MOTION_DURATION_MS : SPIN_DURATION_MS;
    // Fresh per spin so repeated spins never decelerate with an identical,
    // recognizable signature — see createSpinCurve's comment.
    const curve = reducedMotion ? null : createSpinCurve();

    const animation = wheelEl.animate(
      reducedMotion
        ? [{ transform: `rotate(${from}deg)` }, { transform: `rotate(${to}deg)` }]
        : buildSpinKeyframes(from, to, curve!),
      {
        duration,
        easing: reducedMotion ? "ease-out" : "linear",
        fill: "forwards",
      }
    );
    animationRef.current = animation;

    const finalApproachTimer = setTimeout(
      () => setFinalApproach(true),
      Math.max(duration - 900, duration * 0.82)
    );

    if (!reducedMotion) {
      lastSegmentRef.current = null;
      const tick = () => {
        const elapsed = animation.currentTime;
        const progress = typeof elapsed === "number" ? elapsed / duration : 1;
        const angleDeg = interpolateRotation(from, to, progress, curve!);
        const normalized = ((angleDeg % 360) + 360) % 360;
        const segment = Math.floor(normalized / sectionAngle);
        if (segment !== lastSegmentRef.current) {
          lastSegmentRef.current = segment;
          tickTargetRef?.current?.animate(
            [
              { transform: "translateX(-50%) scale(1) rotate(0deg)" },
              { transform: "translateX(-50%) scale(1.1) rotate(-3deg)" },
              { transform: "translateX(-50%) scale(1) rotate(0deg)" },
            ],
            { duration: 150, easing: "ease-out" }
          );
        }
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    }

    animation.finished
      .then(() => {
        animation.commitStyles();
        animation.cancel();
        lastRotationRef.current = to;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        // A physical settle bounce right as the wheel stops — like a real
        // pointer flexing against the peg it landed on — so the stop reads
        // as momentum running out, not a value snapping into place.
        tickTargetRef?.current?.animate(
          [
            { transform: "translateX(-50%) scale(1) rotate(0deg)" },
            { transform: "translateX(-50%) scale(1.22) rotate(-5deg)" },
            { transform: "translateX(-50%) scale(0.96) rotate(2deg)" },
            { transform: "translateX(-50%) scale(1) rotate(0deg)" },
          ],
          { duration: 260, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
        );
        onSpinEnd();
      })
      .catch(() => {
        // Animation was cancelled (e.g. fast unmount) — no result to report.
      });

    return () => {
      clearTimeout(finalApproachTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, rotation, reducedMotion, sectionAngle]);

  return { wheelRef, finalApproach, reducedMotion };
}
