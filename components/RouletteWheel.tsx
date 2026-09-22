"use client";

import { SECTION_ANGLE, SECTION_THEMES, SPIN_DURATION_MS } from "@/lib/roulette";
import type { RouletteSection as RouletteSectionData } from "@/types/roulette";
import RouletteSection from "./RouletteSection";

interface RouletteWheelProps {
  sections: RouletteSectionData[];
  rotation: number;
  spinning: boolean;
  onSpinEnd: () => void;
}

const VIEWBOX = 400;
const CENTER = VIEWBOX / 2;
const OUTER_RADIUS = 188;
const LABEL_RADIUS = 118;
const BADGE_RADIUS = 168;

// Rounded to a fixed precision so the server- and client-rendered markup is
// byte-identical — raw Math.sin/Math.cos output can differ in its last digit
// between JS engines, which otherwise causes a hydration mismatch.
function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function polarPoint(radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: round(CENTER + radius * Math.sin(rad)),
    y: round(CENTER - radius * Math.cos(rad)),
  };
}

function getWedgePath(index: number): string {
  const start = index * SECTION_ANGLE;
  const end = start + SECTION_ANGLE;
  const p1 = polarPoint(OUTER_RADIUS, start);
  const p2 = polarPoint(OUTER_RADIUS, end);
  return `M ${CENTER} ${CENTER} L ${p1.x} ${p1.y} A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 0 1 ${p2.x} ${p2.y} Z`;
}

function getLabelTransform(index: number): string {
  const centerAngle = index * SECTION_ANGLE + SECTION_ANGLE / 2;
  const { x, y } = polarPoint(LABEL_RADIUS, centerAngle);
  // Flip the bottom half 180deg so radial labels never render upside-down.
  const rotation = centerAngle > 90 && centerAngle < 270 ? centerAngle - 180 : centerAngle;
  return `translate(${x} ${y}) rotate(${rotation})`;
}

function getBadgeTransform(index: number): string {
  const centerAngle = index * SECTION_ANGLE + SECTION_ANGLE / 2;
  const { x, y } = polarPoint(BADGE_RADIUS, centerAngle);
  return `translate(${x} ${y})`;
}

export default function RouletteWheel({
  sections,
  rotation,
  spinning,
  onSpinEnd,
}: RouletteWheelProps) {
  return (
    <div className="relative aspect-square w-[min(86vw,440px)] select-none">
      {/* Fixed pointer */}
      <div className="absolute -top-2 left-1/2 z-20 -translate-x-1/2 drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
        <svg width="40" height="46" viewBox="0 0 40 46">
          <polygon points="20,40 3,4 37,4" fill="#f5c94b" stroke="#8a6a12" strokeWidth={1.5} />
          <circle cx="20" cy="8" r="6" fill="#f5c94b" stroke="#8a6a12" strokeWidth={1.5} />
        </svg>
      </div>

      {/* Outer bezel / glow ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-200 via-amber-500 to-amber-800 shadow-[0_0_60px_10px_rgba(250,204,21,0.25)]" />
      <div className="absolute inset-[10px] rounded-full bg-[#0b0e17] shadow-inner" />

      <div className="absolute inset-[14px] overflow-hidden rounded-full shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <svg
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          className="h-full w-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.36, 0.03, 0.2, 1)`
              : "none",
          }}
          onTransitionEnd={(event) => {
            if (event.propertyName === "transform") onSpinEnd();
          }}
        >
          {sections.map((section, index) => (
            <RouletteSection
              key={section.id}
              section={section}
              sectionNumber={index + 1}
              theme={SECTION_THEMES[index % SECTION_THEMES.length]}
              wedgePath={getWedgePath(index)}
              labelTransform={getLabelTransform(index)}
              badgeTransform={getBadgeTransform(index)}
              isDepleted={section.packageCount <= 0}
            />
          ))}

          <circle cx={CENTER} cy={CENTER} r={26} fill="#0b0e17" stroke="#f5c94b" strokeWidth={3} />
          <circle cx={CENTER} cy={CENTER} r={10} fill="#f5c94b" opacity={0.9} />
        </svg>
      </div>
    </div>
  );
}
