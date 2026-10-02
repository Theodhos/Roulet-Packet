"use client";

import { useMemo } from "react";

const PARTICLE_COUNT = 14;

// Deterministic, stateless hash so each particle gets its own jitter without
// any mutable/carried PRNG state (safe to call repeatedly during render).
function hash(n: number): number {
  const x = Math.sin(n) * 43758.5453123;
  return x - Math.floor(x);
}

interface ConfettiBurstProps {
  seed: number;
  /** Positioning classes for the burst's origin point. */
  anchorClassName?: string;
}

export default function ConfettiBurst({
  seed,
  anchorClassName = "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
}: ConfettiBurstProps) {
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const base = seed + i * 7.13;
      const angle = (360 / PARTICLE_COUNT) * i + (hash(base) * 20 - 10);
      const distance = 70 + hash(base + 1.7) * 60;
      const delay = hash(base + 3.1) * 90;
      const size = 4 + hash(base + 4.9) * 4;
      return { angle, distance, delay, size, id: i };
    });
  }, [seed]);

  return (
    <div className={`pointer-events-none absolute ${anchorClassName}`}>
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle-burst absolute rounded-full"
          style={
            {
              width: p.size,
              height: p.size,
              background: p.id % 2 === 0 ? "#E7B65B" : "#F5F5F7",
              animationDelay: `${p.delay}ms`,
              "--angle": `${p.angle}deg`,
              "--distance": `${p.distance}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
