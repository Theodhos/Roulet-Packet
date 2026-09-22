import type { RouletteSection as RouletteSectionData, SectionTheme } from "@/types/roulette";

interface RouletteSectionProps {
  section: RouletteSectionData;
  sectionNumber: number;
  theme: SectionTheme;
  wedgePath: string;
  labelTransform: string;
  badgeTransform: string;
  isDepleted: boolean;
}

export default function RouletteSection({
  section,
  sectionNumber,
  theme,
  wedgePath,
  labelTransform,
  badgeTransform,
  isDepleted,
}: RouletteSectionProps) {
  const gradientId = `wedge-gradient-${section.id}`;

  return (
    <g>
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor={theme.glow} />
          <stop offset="55%" stopColor={theme.fill} />
          <stop offset="100%" stopColor={theme.fill} />
        </radialGradient>
      </defs>

      <path
        d={wedgePath}
        fill={isDepleted ? "#2a2f3d" : `url(#${gradientId})`}
        stroke="#0b0e17"
        strokeWidth={3}
        opacity={isDepleted ? 0.6 : 1}
      />

      <g transform={labelTransform}>
        <text
          textAnchor="middle"
          y={-6}
          fontSize={19}
          fontWeight={800}
          fill={isDepleted ? "#7a8194" : "#0b0e17"}
          style={{ letterSpacing: "0.02em" }}
        >
          {section.name}
        </text>
        <text
          textAnchor="middle"
          y={18}
          fontSize={14}
          fontWeight={700}
          fill={isDepleted ? "#5b6072" : "#0b0e17cc"}
        >
          {isDepleted ? "SOLD OUT" : `${section.packageCount} left`}
        </text>
      </g>

      <g transform={badgeTransform}>
        <circle r={14} fill="#0b0e17" stroke="#ffffff33" strokeWidth={1.5} />
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={14}
          fontWeight={700}
          fill="#f5f5f7"
        >
          {sectionNumber}
        </text>
      </g>
    </g>
  );
}
