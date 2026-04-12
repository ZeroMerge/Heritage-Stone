/**
 * LiquidScore.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Animated liquid-fill health score. The fill height is proportional to the
 * score (0–100). On hover the water gets troubled — bigger waves, faster tempo.
 *
 * The liquid color is derived LUMINANCE-AWARE from `brandColour`:
 *   - Bright / light brand color  →  blend 55% toward  BLACK  (still readable)
 *   - Dark brand color            →  blend 55% toward  WHITE  (still readable)
 *
 * Drop into:
 *   Studio  →  src/components/ui-custom/LiquidScore.tsx
 *   HS-Hub  →  src/components/ui/LiquidScore.tsx
 *
 * Usage:
 *   <LiquidScore score={project.healthScore} brandColour={project.brandColour} fontSize={40} />
 */

import { useEffect, useRef } from "react";

interface LiquidScoreProps {
  score: number;           // 0 – 100
  brandColour: string;     // hex, e.g. "#B52A1C"
  fontSize?: number;       // px, default 40
  className?: string;
}

/** Parse hex to [r, g, b] 0–255 */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Relative luminance (WCAG 2.1), range 0–1.
 * > 0.35 = perceptually "light" (i.e. card background is bright)
 */
function luminance(r: number, g: number, b: number): number {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** Derive liquid tint from the brand color, blending toward black or white based on luminance */
function brandToLiquid(hex: string): { fill: string; wave: string; outline: string } {
  const [r, g, b] = hexToRgb(hex);
  const lum = luminance(r, g, b);

  // For bright colors (lum > 0.35), blend toward black so liquid is darker than card bg
  // For dark colors, blend toward white so liquid is lighter than card bg
  const isLight = lum > 0.35;
  const blend = 0.55;

  let lr: number, lg: number, lb: number;
  if (isLight) {
    // blend toward black (0,0,0)
    lr = Math.round(r * (1 - blend));
    lg = Math.round(g * (1 - blend));
    lb = Math.round(b * (1 - blend));
  } else {
    // blend toward white (255,255,255)
    lr = Math.round(r + (255 - r) * blend);
    lg = Math.round(g + (255 - g) * blend);
    lb = Math.round(b + (255 - b) * blend);
  }

  // Ghost outline: use brand color itself, slightly transparent
  const outline = `rgba(${r},${g},${b},0.22)`;

  return {
    fill:    `rgba(${lr},${lg},${lb},0.88)`,
    wave:    `rgba(${lr},${lg},${lb},0.48)`,
    outline,
  };
}

let _uidCounter = 0;
function nextUid() {
  return `ls${(++_uidCounter).toString(36)}`;
}

export function LiquidScore({
  score,
  brandColour,
  fontSize = 40,
  className,
}: LiquidScoreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const anim1Ref = useRef<SVGAnimateElement | null>(null);
  const anim2Ref = useRef<SVGAnimateElement | null>(null);
  const troubledRef = useRef(false);

  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const text = String(clamped);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.querySelectorAll("svg").forEach((s) => s.remove());

    const uid = nextUid();
    const maskId = `${uid}M`;
    const anim1Id = `${uid}a1`;
    const anim2Id = `${uid}a2`;
    const colors = brandToLiquid(brandColour || "#C9A96E");

    // Measure text with canvas
    const cv = document.createElement("canvas");
    const cx = cv.getContext("2d")!;
    cx.font = `900 ${fontSize}px 'Space Grotesk', sans-serif`;
    const W = Math.ceil(cx.measureText(text).width) + 10;
    const H = Math.ceil(fontSize * 1.12);

    container.style.width = `${W}px`;
    container.style.height = `${H}px`;

    const fillY = H * (1 - clamped / 100);
    const amp = clamped < 5 ? 1 : clamped > 96 ? 1.5 : 5;
    const lk = fontSize * -0.06;

    // ── Wave path builder ──────────────────────────────────────
    function wp(flip: boolean, turbulence: number): string {
      const a = amp * turbulence;
      const f = flip ? -1 : 1;
      return (
        `M${-W} ${fillY + a} ` +
        `Q${-W / 2} ${fillY - a * f} 0 ${fillY + a * f} ` +
        `Q${W / 2} ${fillY + a * 3 * f} ${W} ${fillY + a} ` +
        `Q${W * 1.5} ${fillY - a} ${W * 2} ${fillY + a} ` +
        `L${W * 2} ${H} L${-W} ${H} Z`
      );
    }

    const idle1    = [wp(false, 1),   wp(true, 1),   wp(false, 1)].join(";");
    const idle2    = [wp(true, 1),    wp(false, 1),  wp(true, 1)].join(";");
    const trouble1 = [wp(false, 3.2), wp(true, 3.5), wp(false, 2.8), wp(true, 3.2),  wp(false, 3.2)].join(";");
    const trouble2 = [wp(true, 3.2),  wp(false, 3.5),wp(true, 2.8),  wp(false, 3.2), wp(true, 3.2)].join(";");

    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg") as SVGSVGElement;
    svg.setAttribute("width", String(W));
    svg.setAttribute("height", String(H));
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.style.cssText = "position:absolute;top:0;left:0;z-index:2;overflow:hidden;";

    // The "letter window" background is transparent — so the card bg shows through
    // in the unfilled region, and liquid fills from the bottom.
    svg.innerHTML = `
      <defs>
        <mask id="${maskId}">
          <rect width="${W}" height="${H}" fill="black"/>
          <text
            x="${W / 2}" y="${H * 0.91}"
            text-anchor="middle"
            font-family="'Space Grotesk',sans-serif"
            font-weight="900"
            font-size="${fontSize}"
            letter-spacing="${lk}"
            fill="white"
          >${text}</text>
        </mask>
      </defs>

      <!-- Ghost outline: uses brand color so it adapts to any background -->
      <text
        x="${W / 2}" y="${H * 0.91}"
        text-anchor="middle"
        font-family="'Space Grotesk',sans-serif"
        font-weight="900"
        font-size="${fontSize}"
        letter-spacing="${lk}"
        fill="none"
        stroke="${colors.outline}"
        stroke-width="1.5"
      >${text}</text>

      <!-- Liquid clipped to letter shapes -->
      <g mask="url(#${maskId})">
        <path id="${uid}p1" fill="${colors.fill}">
          <animate id="${anim1Id}" attributeName="d"
            dur="3s" repeatCount="indefinite" calcMode="spline"
            keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
            values="${idle1}"/>
        </path>
        <path fill="${colors.wave}" opacity="0.55">
          <animate id="${anim2Id}" attributeName="d"
            dur="2.2s" repeatCount="indefinite" calcMode="spline"
            keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
            values="${idle2}"/>
        </path>
      </g>
    `;

    container.appendChild(svg);

    anim1Ref.current = svg.querySelector(`#${anim1Id}`) as SVGAnimateElement;
    anim2Ref.current = svg.querySelector(`#${anim2Id}`) as SVGAnimateElement;

    const setTroubled = (on: boolean) => {
      if (troubledRef.current === on) return;
      troubledRef.current = on;
      const a1 = anim1Ref.current;
      const a2 = anim2Ref.current;
      if (!a1 || !a2) return;
      if (on) {
        a1.setAttribute("values", trouble1);
        a1.setAttribute("dur", "0.85s");
        a2.setAttribute("values", trouble2);
        a2.setAttribute("dur", "0.65s");
      } else {
        a1.setAttribute("values", idle1);
        a1.setAttribute("dur", "3s");
        a2.setAttribute("values", idle2);
        a2.setAttribute("dur", "2.2s");
      }
      a1.beginElement?.();
      a2.beginElement?.();
    };

    const onEnter = () => setTroubled(true);
    const onLeave = () => setTimeout(() => setTroubled(false), 850);

    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);

    return () => {
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      svg.remove();
    };
  }, [score, brandColour, fontSize, clamped, text]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", display: "inline-block", cursor: "default", flexShrink: 0 }}
    />
  );
}
