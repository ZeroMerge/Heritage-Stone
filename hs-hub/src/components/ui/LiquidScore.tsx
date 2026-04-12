/**
 * LiquidScore.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Animated liquid-fill health score. The fill height is proportional to the
 * score (0–100). On hover the water gets troubled — bigger waves, faster tempo.
 * The liquid colour is derived from `brandColour` so it always harmonises with
 * the card background and respects the app theme automatically.
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

/**
 * Blend brand colour toward white (or dark if bright) to produce a visible liquid tint
 */
function brandToLiquid(hex: string): { fill: string; wave: string; bg: string; outline: string } {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  if (isNaN(n)) return { fill: 'rgba(255,255,255,0.82)', wave: 'rgba(255,255,255,0.45)', bg: 'rgba(0,0,0,0.30)', outline: 'rgba(255,255,255,0.14)' };

  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  
  // Calculate relative luminance to determine if the base colour is "bright"
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const isBright = luminance > 0.7; // Threshold for bright colour

  const blend = 0.55;
  // Blend towards deep dark charcoal if bright, towards white if dark
  const target = isBright ? 20 : 255; 

  const lr = Math.round(r + (target - r) * blend);
  const lg = Math.round(g + (target - g) * blend);
  const lb = Math.round(b + (target - b) * blend);
  
  return {
    fill: `rgba(${lr},${lg},${lb},0.82)`,
    wave: `rgba(${lr},${lg},${lb},0.45)`,
    bg:   isBright ? `rgba(255,255,255,0.30)` : `rgba(0,0,0,0.30)`,
    outline: isBright ? `rgba(0,0,0,0.14)` : `rgba(255,255,255,0.14)`,
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
  // Keep refs so the hover handler can swap animation keyframes
  const anim1Ref = useRef<SVGAnimateElement | null>(null);
  const anim2Ref = useRef<SVGAnimateElement | null>(null);
  const troubledRef = useRef(false);

  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const text = String(clamped);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Remove any previous SVG on prop change
    container.querySelectorAll("svg").forEach((s) => s.remove());

    const uid = nextUid();
    const maskId = `${uid}M`;
    const anim1Id = `${uid}a1`;
    const anim2Id = `${uid}a2`;
    const colors = brandToLiquid(brandColour);

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

    const idle1 = [wp(false, 1), wp(true, 1), wp(false, 1)].join(";");
    const idle2 = [wp(true, 1), wp(false, 1), wp(true, 1)].join(";");
    const trouble1 = [wp(false, 3.2), wp(true, 3.5), wp(false, 2.8), wp(true, 3.2), wp(false, 3.2)].join(";");
    const trouble2 = [wp(true, 3.2), wp(false, 3.5), wp(true, 2.8), wp(false, 3.2), wp(true, 3.2)].join(";");

    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg") as SVGSVGElement;
    svg.setAttribute("width", String(W));
    svg.setAttribute("height", String(H));
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.style.cssText = "position:absolute;top:0;left:0;z-index:2;overflow:hidden;";

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

      <!-- Ghost outline — softly shows the full number shape -->
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
        <rect width="${W}" height="${H}" fill="${colors.bg}"/>
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

    // Store anim refs for hover handler
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
