import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import "./glass.css";

/** Einsatzort der Glasfläche — bestimmt Kanten, Radius und Schatten. */
export type GlassVariant = "bar" | "sidebar" | "overlay" | "card" | "floating";

export interface GlassSurfaceProps extends HTMLAttributes<HTMLElement> {
  /** Wo die Fläche sitzt (Default: `"card"`). */
  variant?: GlassVariant;
  /** Optionaler Branding-Tint (rgba/hex), wird unter das Glas gelegt. */
  tintColor?: string;
  /** Gerendertes Element (Default: `"div"`). */
  as?: ElementType;
  children?: ReactNode;
}

/**
 * GlassSurface — dünne, transluzente Glas-Optik-Schicht (reines CSS, kein Verhalten).
 *
 * Sparsam und nur auf der „Navigationsebene" über dem Content einsetzen
 * (Top-Bar, Sidebar, Overlays, schwebende Controls, Übersichtskarten).
 * NICHT für datendichte Tabellen/Listen, Eingabefelder oder Fließtext —
 * dort haben Lesbarkeit/Performance Vorrang. Glas nie stapeln.
 *
 * Der Effekt nutzt `backdrop-filter`; ohne Support oder bei
 * `prefers-reduced-transparency` fällt die Fläche automatisch auf opak zurück.
 */
export function GlassSurface({
  variant = "card",
  tintColor,
  as,
  className,
  style,
  children,
  ...rest
}: GlassSurfaceProps) {
  const Component = (as ?? "div") as ElementType;
  const mergedStyle: CSSProperties | undefined = tintColor
    ? ({ "--prn-glass-tint": tintColor, ...style } as CSSProperties)
    : style;
  return (
    <Component
      className={cx("prn-glass", `prn-glass-${variant}`, className)}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Component>
  );
}
