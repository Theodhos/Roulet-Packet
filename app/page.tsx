"use client";

import { useEffect, useRef, useState } from "react";
import RouletteWheel from "@/components/RouletteWheel";
import SpinButton from "@/components/SpinButton";
import PrizeResult from "@/components/PrizeResult";
import { selectPrize } from "@/lib/probability";
import { getSpinRotation } from "@/lib/wheelGeometry";
import { PRIZES, SECTION_ANGLE } from "@/lib/roulette";
import type { Prize } from "@/types/roulette";

const RESULT_REVEAL_DELAY_MS = 550;

export default function Home() {
  // Whether we've confirmed (via /api/spin-status) that this device hasn't
  // already used its one spin. Gates rendering the SPIN button so it never
  // flashes before a returning visitor's past result replaces it.
  const [statusChecked, setStatusChecked] = useState(false);

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [pendingPrize, setPendingPrize] = useState<Prize | null>(null);
  const [winner, setWinner] = useState<Prize | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");

  const resultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/spin-status");
        const data: { prizeId?: number | null } = await response.json().catch(() => ({}));
        if (cancelled) return;
        const previousPrize = PRIZES.find((p) => p.id === data.prizeId) ?? null;
        if (previousPrize) {
          setWinner(previousPrize);
          setHasSpun(true);
          setShowResult(true);
        }
      } catch {
        // Fail open: if the check itself fails, treat this device as not having spun yet.
      } finally {
        if (!cancelled) setStatusChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSpin() {
    if (spinning || hasSpun) return;

    const selected = selectPrize(PRIZES);
    const index = PRIZES.findIndex((prize) => prize.id === selected.id);
    const nextRotation = getSpinRotation(rotation, index, SECTION_ANGLE);

    setWinner(null);
    setShowResult(false);
    setPendingPrize(selected);
    setRotation(nextRotation);
    setSpinning(true);
    setLiveMessage("Spinning the wheel.");
  }

  function handleSpinEnd() {
    if (!pendingPrize) return;
    const resolvedWinner = pendingPrize;

    setSpinning(false);
    setHasSpun(true);
    setWinner(resolvedWinner);
    setPendingPrize(null);
    setLiveMessage(`You won ${resolvedWinner.title}.`);

    fetch("/api/spins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prizeId: resolvedWinner.id }),
    }).catch((error) => console.error("Failed to save result:", error));

    resultTimeoutRef.current = setTimeout(() => setShowResult(true), RESULT_REVEAL_DELAY_MS);
  }

  function handleCloseResult() {
    setShowResult(false);
  }

  const winningIndex = winner ? PRIZES.findIndex((prize) => prize.id === winner.id) : null;
  const showSpinButton = statusChecked && !hasSpun;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 overflow-x-hidden px-4 py-10">
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

      <RouletteWheel
        prizes={PRIZES}
        rotation={rotation}
        spinning={spinning}
        winningIndex={winningIndex}
        onSpinEnd={handleSpinEnd}
      />

      {showSpinButton && (
        <SpinButton onClick={handleSpin} disabled={spinning} isSpinning={spinning} label="SPIN" />
      )}

      {winner && showResult && <PrizeResult prize={winner} onClose={handleCloseResult} />}
    </main>
  );
}
