/**
 * Generic wheel math shared by every wheel on the page (the package wheel
 * and the spin-count wheel): polar coordinates, wedge paths, label
 * placement, and rotation targeting. None of this knows what a "package"
 * or a "spin count" is — it only knows how to point a wheel at a segment.
 */

// Rounded to a fixed precision so the server- and client-rendered markup is
// byte-identical — raw Math.sin/Math.cos output can differ in its last digit
// between JS engines, which otherwise causes a hydration mismatch.
function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function polarPoint(center: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: round(center + radius * Math.sin(rad)),
    y: round(center - radius * Math.cos(rad)),
  };
}

export function getWedgePath(
  center: number,
  outerRadius: number,
  sectionAngle: number,
  index: number
): string {
  const start = index * sectionAngle;
  const end = start + sectionAngle;
  const p1 = polarPoint(center, outerRadius, start);
  const p2 = polarPoint(center, outerRadius, end);
  return `M ${center} ${center} L ${p1.x} ${p1.y} A ${outerRadius} ${outerRadius} 0 0 1 ${p2.x} ${p2.y} Z`;
}

export function getLabelTransform(
  center: number,
  labelRadius: number,
  sectionAngle: number,
  index: number
): string {
  const centerAngle = index * sectionAngle + sectionAngle / 2;
  const { x, y } = polarPoint(center, labelRadius, centerAngle);
  // Flip the bottom half 180deg so radial labels never render upside-down.
  const rotation = centerAngle > 90 && centerAngle < 270 ? centerAngle - 180 : centerAngle;
  return `translate(${x} ${y}) rotate(${rotation})`;
}

/**
 * Greedily wraps a label into at most a few short lines so long prize
 * names fit inside a narrow wedge without being measured against any
 * particular font (SVG text doesn't wrap on its own).
 */
export function wrapLabel(text: string, maxLineLength = 13): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxLineLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

const MIN_EXTRA_SPINS = 5;
const MAX_EXTRA_SPINS = 8;

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Computes the next cumulative rotation (in degrees) for a wheel so that,
 * after several full spins, `sectionIndex` lands under the fixed top
 * pointer. `currentRotation` is never reset to 0 between spins — it keeps
 * growing so the wheel always turns forward, never teleports.
 */
export function getSpinRotation(
  currentRotation: number,
  sectionIndex: number,
  sectionAngle: number
): number {
  // Keep the landing point away from wedge borders so it never looks ambiguous.
  const centerJitterLimit = sectionAngle / 2 - 8;
  const sectionCenter = sectionIndex * sectionAngle + sectionAngle / 2;
  const jitter = (Math.random() * 2 - 1) * centerJitterLimit;
  const targetPoint = normalizeAngle(sectionCenter + jitter);

  // Rotating the wheel by R moves the point that sits at angle `a` to
  // normalize(a + R). We need the target point to land at 0deg (the pointer).
  const targetMod = normalizeAngle(360 - targetPoint);
  const currentMod = normalizeAngle(currentRotation);

  let delta = targetMod - currentMod;
  if (delta <= 0) delta += 360;

  const extraSpins =
    MIN_EXTRA_SPINS + Math.floor(Math.random() * (MAX_EXTRA_SPINS - MIN_EXTRA_SPINS + 1));

  return currentRotation + delta + extraSpins * 360;
}
