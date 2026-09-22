import type { RouletteSection } from "@/types/roulette";

interface ResultCardProps {
  winner: RouletteSection;
  spinCount: number;
  canSpinAgain: boolean;
  onSpinAgain: () => void;
  onClose: () => void;
}

export default function ResultCard({
  winner,
  spinCount,
  canSpinAgain,
  onSpinAgain,
  onClose,
}: ResultCardProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="animate-pop-in w-full max-w-sm rounded-3xl border border-amber-300/30 bg-gradient-to-b from-[#171b2b] to-[#0b0e17] p-8 text-center shadow-[0_0_60px_rgba(245,201,75,0.35)]"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
          Spin #{spinCount}
        </p>
        <h2 className="mt-2 text-3xl font-extrabold text-white">🎉 Congratulations!</h2>

        <div className="mt-6 rounded-2xl bg-white/5 p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
            Winner
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-300">{winner.name}</p>
          <p className="mt-3 text-sm text-slate-300">
            Available packages:{" "}
            <span className="font-semibold text-white">{winner.packageCount}</span>
          </p>
        </div>

        {canSpinAgain ? (
          <button
            type="button"
            onClick={onSpinAgain}
            className="mt-7 w-full rounded-full px-8 py-4 text-lg font-extrabold tracking-wider text-[#0b0e17] transition-transform duration-200 hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(180deg, #ffe27a 0%, #f5c94b 55%, #d99f1f 100%)",
              boxShadow: "0 0 30px rgba(245, 201, 75, 0.5)",
            }}
          >
            SPIN AGAIN
          </button>
        ) : (
          <p className="mt-7 rounded-full bg-rose-500/15 px-6 py-3 text-sm font-semibold text-rose-300">
            All packages have been distributed.
          </p>
        )}
      </div>
    </div>
  );
}
