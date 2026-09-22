export interface RouletteSection {
  id: number;
  name: string;
  packageCount: number;
}

export interface SectionProbability {
  id: number;
  probability: number;
}

export interface SectionTheme {
  fill: string;
  glow: string;
}
