"use client";

import { useRef } from "react";
import { SECTION_ANGLE, PRIZE_THEMES } from "@/lib/roulette";
import { getWedgePath, getLabelTransform } from "@/lib/wheelGeometry";
import { useWheelSpin } from "@/lib/useWheelSpin";
import type { Prize } from "@/types/roulette";
import RouletteSection from "./RouletteSection";
import ConfettiBurst from "./ConfettiBurst";

interface RouletteWheelProps {
  prizes: Prize[];
  rotation: number;
  spinning: boolean;
  winningIndex: number | null;
  onSpinEnd: () => void;
}

const VIEWBOX = 400;
const CENTER = VIEWBOX / 2;
const OUTER_RADIUS = 186;
const LABEL_RADIUS = 128;
const HUB_RADIUS = 30;

export default function RouletteWheel({
  prizes,
  rotation,
  spinning,
  winningIndex,
  onSpinEnd,
}: RouletteWheelProps) {
  const pointerRef = useRef<HTMLDivElement>(null);
  const { wheelRef, finalApproach, reducedMotion } = useWheelSpin({
    spinning,
    rotation,
    sectionAngle: SECTION_ANGLE,
    onSpinEnd,
    tickTargetRef: pointerRef,
  });

  return (
    <div aria-hidden className="relative aspect-square w-[min(88vw,440px)] select-none">
      {/* Fixed pointer */}
      <div
        ref={pointerRef}
        className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 drop-shadow-[0_3px_8px_rgba(0,0,0,0.55)]"
      >
        <svg width="34" height="42" viewBox="0 0 36 44">
          <path
            d="M18 40 L6.5 11 Q18 2.5 29.5 11 Z"
            fill="#F2F3F6"
            stroke="#0B0C10"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <circle cx="18" cy="11" r="5.5" fill="#E7B65B" stroke="#0B0C10" strokeWidth={1.25} />
        </svg>
      </div>

      {/* Outer shell: brushed bezel → recessed collar → wheel disc */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#3c3f49] via-[#1c1e26] to-[#08090c] shadow-[0_20px_44px_-14px_rgba(0,0,0,0.7)]" />
      <div className="absolute inset-[3px] rounded-full bg-gradient-to-b from-[#15171f] to-[#090a0e]" />
      <div className="absolute inset-[9px] rounded-full ring-1 ring-[#E7B65B]/25" />

      <div className="absolute inset-[13px] overflow-hidden rounded-full shadow-[inset_0_2px_14px_rgba(0,0,0,0.55)]">
        <svg
          ref={wheelRef}
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          className="h-full w-full"
          style={{ willChange: "transform" }}
        >
          <defs>
            <radialGradient id="hub-gradient" cx="38%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#3a3d47" />
              <stop offset="55%" stopColor="#1c1e26" />
              <stop offset="100%" stopColor="#0c0d11" />
            </radialGradient>
          </defs>

          {prizes.map((prize, index) => (
            <RouletteSection
              key={prize.id}
              prize={prize}
              theme={PRIZE_THEMES[index]}
              wedgePath={getWedgePath(CENTER, OUTER_RADIUS, SECTION_ANGLE, index)}
              labelTransform={getLabelTransform(CENTER, LABEL_RADIUS, SECTION_ANGLE, index)}
              isWinner={index === winningIndex}
              reducedMotion={reducedMotion}
            />
          ))}

          <circle
            cx={CENTER}
            cy={CENTER}
            r={HUB_RADIUS}
            fill="url(#hub-gradient)"
            stroke="#E7B65B"
            strokeOpacity={0.4}
            strokeWidth={1.5}
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={HUB_RADIUS - 9}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
          <circle cx={CENTER} cy={CENTER} r={3.5} fill="#E7B65B" />
        </svg>
      </div>

      {/* Final-approach focus: background settles, pointer zone gently lifts */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-full transition-opacity duration-500 ${
          finalApproach ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(circle at 50% 6%, rgba(231,182,91,0.14), rgba(231,182,91,0) 40%), radial-gradient(circle at 50% 52%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.32) 100%)",
        }}
      />

      {!reducedMotion && winningIndex !== null && (
        <ConfettiBurst
          key={winningIndex}
          seed={winningIndex * 97 + 11}
          anchorClassName="left-1/2 top-[6%] -translate-x-1/2"
        />
      )}
    </div>
  );
}
