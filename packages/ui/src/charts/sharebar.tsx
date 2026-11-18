import type { ReactNode } from "react";
import { cx } from "../utils";
import "./sharebar.css";

/* ---------------- ShareBar ----------------
 * Anteilsbalken: ein waagrechter Balken aus Teilen einer Menge (z. B. Szenarien eines Testlaufs: bestanden, fehlgeschlagen,
 * offen), darunter die Legende mit Wort und Zahl – die Farbe trägt nie allein. `total` > Summe zeigt den Rest als leere Spur.
 * Der Balken ist ein Bild (`role="img"`) mit einem Namen, der alle Werte nennt. */

export type ShareTone = "green" | "orange" | "red" | "blue" | "teal" | "gray";

export interface SharePart {
  id: string;
  label: string;
  value: number;
  /** Farbe des Teils aus den Tokens. Default: Reihenfolge blue, teal, orange, gray. */
  tone?: ShareTone;
}

export interface ShareBarProps {
  parts: SharePart[];
  /** Gesamtmenge; größer als die Summe → Rest als leere Spur. Default: Summe der Teile. */
  total?: number;
  /** Höhe in px (4–12). Default 8. */
  height?: number;
  /** Alle Teile in Grautönen (in Zellen und Listen); Bedeutung nur über Wort und Zahl. */
  neutral?: boolean;
  /** Legende mit Wort und Zahl. Default true. */
  legend?: boolean;
  /** Teile mit 0 in der Legende zeigen. Default false. */
  showZero?: boolean;
  /** Zeile über dem Balken, z. B. „240 von 1.200“. */
  caption?: ReactNode;
  /** Name des Bildes; die Werte hängt die Komponente an („Szenarien: bestanden 12, offen 3“). */
  "aria-label": string;
  /** Zahlformat. Default de-DE. */
  locale?: string;
  className?: string;
  "data-testid"?: string;
}

const REIHE: ShareTone[] = ["blue", "teal", "orange", "gray"];
const NEUTRAL = ["var(--prn-label-2)", "var(--prn-label-3)", "var(--prn-fill-strong)"];
const TON: Record<ShareTone, string> = { green: "var(--prn-green)", orange: "var(--prn-orange)", red: "var(--prn-red)", blue: "var(--prn-blue)", teal: "var(--prn-teal)", gray: "var(--prn-label-3)" };

export function ShareBar({ parts, total, height = 8, neutral = false, legend = true, showZero = false, caption, "aria-label": name, locale = "de-DE", className, "data-testid": testId }: ShareBarProps) {
  const summe = parts.reduce((a, p) => a + Math.max(0, p.value), 0);
  const gesamt = Math.max(total ?? summe, summe);
  const h = Math.min(12, Math.max(4, height));
  const zahl = (n: number) => n.toLocaleString(locale);
  const farbe = (p: SharePart, i: number) => (neutral ? NEUTRAL[i % NEUTRAL.length] : TON[p.tone ?? REIHE[i % REIHE.length]!]);
  const aria = `${name}: ${parts.map((p) => `${p.label} ${zahl(p.value)}`).join(", ")}${total != null && total > summe ? `, ${zahl(total - summe)} offen von ${zahl(total)}` : ""}`;
  return (
    <div className={cx("prn-sharebar", className)} data-testid={testId}>
      {caption != null && <div className="prn-sharebar-caption">{caption}</div>}
      <div className="prn-sharebar-track" role="img" aria-label={aria} style={{ height: h, borderRadius: h / 2 }}>
        {gesamt > 0 &&
          parts.map((p, i) =>
            p.value > 0 ? <span key={p.id} className="prn-sharebar-part" data-part={p.id} style={{ width: `${(p.value / gesamt) * 100}%`, background: farbe(p, i) }} /> : null,
          )}
      </div>
      {legend && (
        <ul className="prn-sharebar-legend" aria-hidden>
          {parts.filter((p) => showZero || p.value > 0).map((p) => {
            const i = parts.indexOf(p);
            return (
              <li key={p.id}>
                <span className="prn-sharebar-dot" style={{ background: farbe(p, i) }} />
                <span className="prn-sharebar-label">{p.label}</span>
                <span className="prn-sharebar-value prn-tnum">{zahl(p.value)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
