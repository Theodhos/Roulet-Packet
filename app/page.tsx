"use client";

import { useState } from "react";
import RouletteWheel from "@/components/RouletteWheel";
import SpinButton from "@/components/SpinButton";
import ResultCard from "@/components/ResultCard";
import { calculateProbabilities, selectWeightedSection } from "@/lib/probability";
import { ENABLE_PACKAGE_DEPLETION, SECTION_THEMES, getSpinRotation, initialSections } from "@/lib/roulette";
import type { RouletteSection } from "@/types/roulette";

export default function Home() {
  const [sections, setSections] = useState<RouletteSection[]>(initialSections);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [pendingSection, setPendingSection] = useState<RouletteSection | null>(null);
  const [winner, setWinner] = useState<RouletteSection | null>(null);
  const [spinCount, setSpinCount] = useState(0);

  const hasAvailableSections = sections.some((section) => section.packageCount > 0);
  const probabilities = calculateProbabilities(sections);

  function handleSpin() {
    if (spinning || !hasAvailableSections) return;

    const selected = selectWeightedSection(sections);
    if (!selected) return;

    const sectionIndex = sections.findIndex((section) => section.id === selected.id);
    const nextRotation = getSpinRotation(rotation, sectionIndex);

    setWinner(null);
    setPendingSection(selected);
    setRotation(nextRotation);
    setSpinning(true);
  }

  function handleSpinEnd() {
    if (!pendingSection) return;

    const updatedCount = ENABLE_PACKAGE_DEPLETION
      ? Math.max(0, pendingSection.packageCount - 1)
      : pendingSection.packageCount;

    if (ENABLE_PACKAGE_DEPLETION) {
      setSections((prev) =>
        prev.map((section) =>
          section.id === pendingSection.id
            ? { ...section, packageCount: updatedCount }
            : section
        )
      );
    }

    setSpinning(false);
    setSpinCount((count) => count + 1);
    setWinner({ ...pendingSection, packageCount: updatedCount });
    setPendingSection(null);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 overflow-x-hidden px-4 py-8">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Package <span className="text-amber-300">Roulette</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Fewer packages left means better odds &mdash; spin to find out who wins.
        </p>
      </header>

      <RouletteWheel
        sections={sections}
        rotation={rotation}
        spinning={spinning}
        onSpinEnd={handleSpinEnd}
      />

      {hasAvailableSections ? (
        <SpinButton onClick={handleSpin} disabled={spinning} isSpinning={spinning} />
      ) : (
        <p className="rounded-full bg-rose-500/15 px-6 py-3 text-sm font-semibold text-rose-300">
          All packages have been distributed.
        </p>
      )}

      <p className="text-xs uppercase tracking-widest text-slate-500">Spins: {spinCount}</p>

      <ul className="grid w-full max-w-md grid-cols-2 gap-2 sm:grid-cols-3">
        {sections.map((section, index) => {
          const probability = probabilities.find((entry) => entry.id === section.id)?.probability ?? 0;
          const depleted = section.packageCount <= 0;
          return (
            <li
              key={section.id}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: depleted ? "#3a3f4d" : SECTION_THEMES[index % SECTION_THEMES.length].fill }}
              />
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-xs font-semibold ${depleted ? "text-slate-500" : "text-white"}`}>
                  {section.name}
                </span>
                <span className="block text-[11px] text-slate-400">
                  {depleted ? "sold out" : `${(probability * 100).toFixed(0)}% odds`}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {winner && (
        <ResultCard
          winner={winner}
          spinCount={spinCount}
          canSpinAgain={hasAvailableSections}
          onSpinAgain={handleSpin}
          onClose={() => setWinner(null)}
        />
      )}
    </main>
  );
}
