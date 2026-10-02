import { wrapLabel } from "@/lib/wheelGeometry";
import type { Prize, PrizeTheme } from "@/types/roulette";

interface RouletteSectionProps {
  prize: Prize;
  theme: PrizeTheme;
  wedgePath: string;
  labelTransform: string;
  isWinner: boolean;
  reducedMotion: boolean;
}

const FONT_SIZE = 12.5;
const LINE_HEIGHT = 13;

export default function RouletteSection({
  prize,
  theme,
  wedgePath,
  labelTransform,
  isWinner,
  reducedMotion,
}: RouletteSectionProps) {
  const gradientId = `wedge-gradient-${prize.id}`;
  const lines = wrapLabel(prize.name);
  const startY = -((lines.length - 1) / 2) * LINE_HEIGHT;

  return (
    <g>
      <defs>
        <radialGradient id={gradientId} cx="42%" cy="32%" r="80%">
          <stop offset="0%" stopColor={theme.glow} />
          <stop offset="60%" stopColor={theme.fill} />
          <stop offset="100%" stopColor={theme.fill} />
        </radialGradient>
      </defs>

      <path
        d={wedgePath}
        fill={`url(#${gradientId})`}
        stroke="#090A0E"
        strokeWidth={2}
        className={isWinner && !reducedMotion ? "wedge-winner-glow" : undefined}
        style={isWinner ? { stroke: "#E7B65B", strokeWidth: 3 } : undefined}
      />

      <g transform={labelTransform}>
        {lines.map((line, i) => (
          <text
            key={line}
            y={startY + i * LINE_HEIGHT}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={FONT_SIZE}
            fontWeight={700}
            fill={theme.text}
            style={{ letterSpacing: "0.01em" }}
          >
            {line}
          </text>
        ))}
      </g>
    </g>
  );
}
