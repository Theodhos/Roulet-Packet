interface SpinButtonProps {
  onClick: () => void;
  disabled: boolean;
  isSpinning: boolean;
}

export default function SpinButton({ onClick, disabled, isSpinning }: SpinButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative rounded-full px-16 py-5 text-2xl font-extrabold tracking-widest text-[#0b0e17] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:scale-105 enabled:active:scale-95"
      style={{
        background: "linear-gradient(180deg, #ffe27a 0%, #f5c94b 55%, #d99f1f 100%)",
        boxShadow: disabled
          ? "none"
          : "0 0 40px rgba(245, 201, 75, 0.55), 0 8px 20px rgba(0,0,0,0.45)",
      }}
    >
      <span className="flex items-center gap-3">
        {isSpinning && (
          <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-[#0b0e17]/30 border-t-[#0b0e17]" />
        )}
        {isSpinning ? "SPINNING..." : "SPIN"}
      </span>
    </button>
  );
}
