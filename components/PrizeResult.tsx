"use client";

import { useEffect, useRef } from "react";
import type { Prize } from "@/types/roulette";
import { buildWhatsAppClaimUrl } from "@/lib/whatsapp";
import ConfettiBurst from "./ConfettiBurst";

interface PrizeResultProps {
  prize: Prize;
  onClose: () => void;
}

export default function PrizeResult({ prize, onClose }: PrizeResultProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const claimUrl = buildWhatsAppClaimUrl(prize.title);
  const isGrand = prize.tier === "grand";

  useEffect(() => {
    cardRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prize-result-heading"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="animate-pop-in relative w-full max-w-sm overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-[#15161d] to-[#0b0c10] p-8 text-center shadow-[0_28px_80px_-20px_rgba(0,0,0,0.8)] outline-none"
      >
        <ConfettiBurst seed={prize.id} anchorClassName="left-1/2 top-[88px] -translate-x-1/2 -translate-y-1/2" />

        <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
          <span className="prize-badge-glow absolute inset-0 rounded-full" aria-hidden />
          <span
            className="relative flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              background: "linear-gradient(180deg, #3a3d47 0%, #1c1e26 55%, #0c0d11 100%)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.08) inset, 0 8px 20px -6px rgba(0,0,0,0.6)",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M8 3h8v2a4 4 0 0 1-4 4 4 4 0 0 1-4-4V3Z" fill="#E7B65B" />
              <path
                d="M8 4H5a2 2 0 0 0 2 3.5M16 4h3a2 2 0 0 1-2 3.5"
                stroke="#E7B65B"
                strokeWidth={1.4}
                fill="none"
                strokeLinecap="round"
              />
              <rect x="9" y="9" width="6" height="4" fill="#E7B65B" />
              <rect x="10.5" y="13" width="3" height="5" fill="#E7B65B" />
              <rect x="7" y="18" width="10" height="2" rx="1" fill="#E7B65B" />
            </svg>
          </span>
        </div>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#E7B65B]">
          {isGrand ? "Grand Prize" : "You Won"}
        </p>
        <h2 id="prize-result-heading" className="mt-2 text-2xl font-bold text-white">
          {prize.title}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">{prize.description}</p>

        {claimUrl ? (
          <>
            <a
              href={claimUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex w-full items-center justify-center rounded-full px-8 py-3.5 text-base font-bold tracking-wide text-[#0B0C10] transition-all duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0"
              style={{
                background: "linear-gradient(180deg, #F6DDA0 0%, #E7B65B 55%, #C4903A 100%)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 10px 24px -8px rgba(231,182,91,0.55)",
              }}
            >
              Claim Your Prize
            </a>
            <p className="mt-3 text-[11px] text-slate-500">
              Tap to open WhatsApp with your prize ready to send.
            </p>
          </>
        ) : (
          <p className="mt-7 text-sm text-slate-400">Contact us directly to claim this prize.</p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-300"
        >
          Close
        </button>
      </div>
    </div>
  );
}
