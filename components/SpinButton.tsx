interface SpinButtonProps {
  onClick: () => void;
  disabled: boolean;
  isSpinning: boolean;
  label?: string;
  size?: "large" | "medium";
}

export default function SpinButton({
  onClick,
  disabled,
  isSpinning,
  label = "SPIN",
  size = "large",
}: SpinButtonProps) {
  const isLarge = size === "large";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={isSpinning}
      className={`group relative rounded-full font-bold tracking-[0.08em] text-[#0B0C10] transition-all duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none enabled:hover:-translate-y-0.5 enabled:active:translate-y-0 enabled:active:scale-[0.97] ${
        isLarge ? "px-14 py-4 text-lg sm:px-16 sm:py-5 sm:text-xl" : "px-10 py-3.5 text-base"
      }`}
      style={{
        background: "linear-gradient(180deg, #F6DDA0 0%, #E7B65B 55%, #C4903A 100%)",
        boxShadow: disabled
          ? "none"
          : "0 1px 0 rgba(255,255,255,0.4) inset, 0 10px 24px -8px rgba(231,182,91,0.55)",
      }}
    >
      <span className="flex items-center justify-center gap-2.5">
        {isSpinning && (
          <span className="h-4 w-4 animate-spin rounded-full border-[2.5px] border-[#0B0C10]/25 border-t-[#0B0C10]" />
        )}
        {isSpinning ? "SPINNING…" : label}
      </span>
    </button>
  );
}
