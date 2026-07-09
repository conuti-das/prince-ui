import type { CSSProperties, HTMLAttributes, ReactNode, SVGProps } from "react";
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
 * (`--prn-bento-bg`, Deep-Azure→Core-Black) plus optionale
 * konzentrische Resonanz-Wellen (Wasser/Frequenz-Motiv). Rein
 * präsentativ — Inhalte tragen die Semantik. */

export interface ResonanceFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  /** Konzentrische Resonanz-Wellen einblenden. Default `true`. */
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

/** Konzentrische Wellen (dekorativ). Die Farbe kommt aus `currentColor`
 *  (via `.prn-resonance__waves` = `--prn-accent`), die Ringe verblassen nach außen. */
function ResonanceWaves() {
  const rings = [40, 80, 120, 160, 200, 240, 280];
  return (
    <svg
      className="prn-resonance__waves"
      viewBox="0 0 600 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {rings.map((r, i) => (
        <circle
          key={r}
          cx="300"
          cy="300"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity={Math.max(0.04, 0.18 - i * 0.02)}
        />
      ))}
    </svg>
  );
}
