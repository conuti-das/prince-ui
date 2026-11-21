import { cx } from "../utils";
import { Icon, type IconName } from "../icons/icons";
import "./status-glyph.css";

/* ============================================================================
 * StatusGlyph / StatusGlyphRow — kleine, feste Zustandszeichen in einer Reihe (z. B. je Dimension einer Datei: Versand · Bestätigung ·
 * technische und fachliche Prüfung). Zeichen = Zustand, Farbe = Folge für den Betrachter, das Wort steht im Namen der Reihe.
 * Nicht bedienbar: die Reihe ist ein Bild (role="img") mit vollständigem Text; auf dem Telefon unverändert klein.
 * ========================================================================== */

export type StatusGlyphTone = "positive" | "negative" | "critical" | "info" | "neutral";

export interface StatusGlyphProps {
  /** Zeichen des Zustands; ohne Zeichen bleibt das Kästchen leer. */
  icon?: IconName;
  /** Folge für den Betrachter (Farbe von Rahmen und Zeichen). */
  tone?: StatusGlyphTone;
  /** `empty` = kein Wert (gestrichelter Rahmen), `filled` = getönte Fläche. */
  variant?: "outline" | "filled" | "empty";
  /** Kantenlänge in px (Vorgabe 22). */
  size?: number;
  className?: string;
  [key: `data-${string}`]: string | number | boolean | undefined;
}

/** Ein Zustandszeichen (dekorativ; den Zustand nennt der Name der umgebenden Reihe bzw. ein Text daneben). */
export function StatusGlyph({ icon, tone = "neutral", variant = "outline", size = 22, className, ...rest }: StatusGlyphProps) {
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) if (k.startsWith("data-")) data[k] = v;
  return (
    <span
      className={cx("prn-glyph", className)}
      data-tone={tone}
      data-variant={variant}
      style={{ width: size, height: size }}
      aria-hidden
      {...data}
    >
      {icon ? <Icon name={icon} size={Math.round(size * 0.56)} /> : null}
    </span>
  );
}

export interface StatusGlyphItem extends Omit<StatusGlyphProps, "className" | "size"> {
  id: string;
}

export interface StatusGlyphRowProps {
  items: StatusGlyphItem[];
  /** Vollständiger Text der Reihe (Pflicht), z. B. „Versand: zugestellt, Bestätigung: ausstehend, …“. */
  "aria-label": string;
  size?: number;
  className?: string;
  [key: `data-${string}`]: string | number | boolean | undefined;
}

/** Feste Reihe aus Zustandszeichen als ein Bild mit vollständigem Namen. */
export function StatusGlyphRow({ items, "aria-label": ariaLabel, size, className, ...rest }: StatusGlyphRowProps) {
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) if (k.startsWith("data-")) data[k] = v;
  return (
    <span className={cx("prn-glyph-row", className)} role="img" aria-label={ariaLabel} {...data}>
      {items.map(({ id, ...g }) => (
        <StatusGlyph key={id} data-id={id} size={size} {...g} />
      ))}
    </span>
  );
}
