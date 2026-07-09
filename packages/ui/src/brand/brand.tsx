import type { CSSProperties, HTMLAttributes, ReactNode, SVGProps } from "react";
import { useId } from "react";
import { cx } from "../utils";
import "./brand.css";

/* ============================================================
 *  CONUTI Corporate Elements (Brandguide „Look & Feel")
 *
 *  Circle Dot, Fine Lines und Resonance Field sind die grafischen
 *  Leitelemente der CONUTI-Markensprache. Sie sind token-getrieben
 *  (--prn-*) und funktionieren daher in jedem Theme — im C3U-Theme
 *  spielen sie die Marke aber voll aus (Pulse Blue / Deep Azure,
 *  Core-Black-Canvas, konzentrische Wellen der Bildsprache).
 * ============================================================ */

/* ---------------- CircleDot ----------------
 * Das zentrale Corporate Element: ein umgebender Kreis (Vernetzung,
 * Ganzheitlichkeit) mit Punkt im Zentrum (Ausgangspunkt / Fokus).
 * Einsatz: Bullet, Einstiegselement vor Headlines, Markenmarker. */

export interface CircleDotProps extends Omit<SVGProps<SVGSVGElement>, "className"> {
  /** Kantenlänge in px. Default 16. */
  size?: number;
  /** `"current"` erbt die Textfarbe (Default), `"accent"` nutzt `--prn-accent`. */
  tone?: "current" | "accent";
  /** Barrierefreier Name. Ohne Angabe ist der Dot dekorativ (`aria-hidden`). */
  label?: string;
  className?: string;
}

export function CircleDot({ size = 16, tone = "current", label, className, ...props }: CircleDotProps) {
  const decorative = label == null;
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cx("prn-circledot", tone === "accent" && "prn-circledot--accent", className)}
      role={decorative ? undefined : "img"}
      aria-label={label}
      aria-hidden={decorative || undefined}
    >
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.25" fill="currentColor" />
    </svg>
  );
}

/* ---------------- FineLine ----------------
 * Die feinen Linien stehen für Vernetzung und Orientierung. Als reine
 * Trennlinie (Separator) oder als Verbinder mit zentralem Knoten
 * (Muster „Technologie —●— Menschen"). */

export interface FineLineProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  /** Ausrichtung der Linie. Default `"horizontal"`. */
  orientation?: "horizontal" | "vertical";
  /** Zentraler Knoten (Verbinder-Muster). `true` → CircleDot in Akzentfarbe. */
  node?: boolean | ReactNode;
  /** Rein dekorativ (`aria-hidden`) statt semantischer Separator. */
  decorative?: boolean;
  className?: string;
}

export function FineLine({ orientation = "horizontal", node, decorative = false, className, ...props }: FineLineProps) {
  const nodeContent = node === true ? <CircleDot tone="accent" size={14} /> : node;
  return (
    <div
      {...props}
      className={cx("prn-fineline", `prn-fineline--${orientation}`, className)}
      role={decorative ? undefined : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      aria-hidden={decorative || undefined}
    >
      <span className="prn-fineline__seg" />
      {node ? (
        <>
          <span className="prn-fineline__node">{nodeContent}</span>
          <span className="prn-fineline__seg" />
        </>
      ) : null}
    </div>
  );
}

/* ---------------- ResonanceField ----------------
 * Signatur-Hintergrund der Bildsprache: der Marken-Gradient
 * (`--prn-bento-bg`, „Tidal Field") plus optionale, aus einem Noise-Feld
 * gebogene Feldlinien (Resonanz-/Frequenz-Motiv, kein Sonar-Ring). Rein
 * präsentativ — Inhalte tragen die Semantik. */

export interface ResonanceFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  /** Resonanz-Feldlinien einblenden. Default `true`. */
  waves?: boolean;
  /** Ursprung der Wellen als CSS-Position. Default rechts oben (`82% / 12%`). */
  origin?: { x: string; y: string };
  className?: string;
  children?: ReactNode;
}

export function ResonanceField({ waves = true, origin, className, children, style, ...props }: ResonanceFieldProps) {
  const cssVars = origin
    ? ({ "--prn-resonance-x": origin.x, "--prn-resonance-y": origin.y } as CSSProperties)
    : undefined;
  return (
    <div {...props} className={cx("prn-resonance", className)} style={{ ...cssVars, ...style }}>
      {waves ? <ResonanceWaves /> : null}
      <div className="prn-resonance__content">{children}</div>
    </div>
  );
}

/** „Field Lines" (dekorativ): waagerechte Hairlines, die über EIN kohärentes
 *  fractalNoise-Feld (feTurbulence → feDisplacementMap) zu Äquipotential-/
 *  Feldlinien gebogen werden — geordnet statt zufällig, „als würde sich Energie
 *  geordnet ausbreiten". Eine radiale Maske zieht Dichte/Fokus auf EINEN Punkt
 *  (Circle-Dot-Ursprung). Farbe = `currentColor` (= `--prn-accent`). Die IDs
 *  werden per `useId` isoliert, damit mehrere Felder pro Seite nicht kollidieren. */
function ResonanceWaves() {
  const uid = useId().replace(/:/g, "");
  const warp = `prn-field-warp-${uid}`;
  const focus = `prn-field-focus-${uid}`;
  const maskId = `prn-field-mask-${uid}`;
  const lines = Array.from({ length: 21 }, (_, i) => 20 + i * 18);
  return (
    <svg
      className="prn-resonance__waves"
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <filter id={warp} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.014" numOctaves="2" seed="9" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="38" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <radialGradient id={focus} cx="82%" cy="16%" r="78%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="48%" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={maskId}>
          <rect width="600" height="400" fill={`url(#${focus})`} />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <g filter={`url(#${warp})`} fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5">
          {lines.map((y) => (
            <line key={y} x1="-40" y1={y} x2="640" y2={y} />
          ))}
        </g>
      </g>
    </svg>
  );
}
