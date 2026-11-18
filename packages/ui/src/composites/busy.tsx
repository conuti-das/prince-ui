import { useEffect, useState, type ReactNode } from "react";
import { cx } from "../utils";
import "./busy.css";

/* ---------------- Spinner / BusyArea ----------------
 * Lade-Indikator (Parität zu BusyIndicator): `Spinner` allein oder `BusyArea` über einem Bereich.
 * BusyArea legt während `busy` eine halbtransparente Fläche mit Spinner über den Inhalt, setzt `aria-busy`
 * und sperrt Eingaben darunter (`inert`). Erst nach `delay` ms sichtbar – kurze Ladevorgänge flackern nicht. */

export type SpinnerSize = "s" | "m" | "l";

export interface SpinnerProps {
  size?: SpinnerSize;
  /** Zugänglicher Text und – mit `showLabel` – sichtbare Zeile unter dem Spinner. Default „Wird geladen“. */
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export function Spinner({ size = "m", label = "Wird geladen", showLabel = false, className }: SpinnerProps) {
  return (
    <span className={cx("prn-spinner", className)} data-size={size} role="status">
      <span className="prn-spinner-ring" aria-hidden />
      <span className={showLabel ? "prn-spinner-label" : "prn-spinner-sr"}>{label}</span>
    </span>
  );
}

export interface BusyAreaProps {
  busy: boolean;
  /** Text des Spinners. Default „Wird geladen“. */
  label?: string;
  /** Text sichtbar unter dem Spinner. */
  showLabel?: boolean;
  /** Verzögerung in ms, bevor der Indikator erscheint. Default 300. */
  delay?: number;
  size?: SpinnerSize;
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function BusyArea({ busy, label, showLabel, delay = 300, size = "m", children, className, "data-testid": testId }: BusyAreaProps) {
  const [sichtbar, setSichtbar] = useState(busy && delay <= 0);
  useEffect(() => {
    if (!busy) { setSichtbar(false); return; }
    if (delay <= 0) { setSichtbar(true); return; }
    const t = window.setTimeout(() => setSichtbar(true), delay);
    return () => window.clearTimeout(t);
  }, [busy, delay]);
  return (
    <div className={cx("prn-busyarea", className)} aria-busy={busy || undefined} data-testid={testId}>
      {/* inert als Attribut (React 18 kennt es nicht als Prop): sperrt Fokus und Klicks im Inhalt, solange er lädt */}
      <div className="prn-busyarea-content" {...(busy ? ({ inert: "" } as Record<string, string>) : {})}>{children}</div>
      {busy && sichtbar && (
        <div className="prn-busyarea-overlay">
          <Spinner size={size} label={label} showLabel={showLabel} />
        </div>
      )}
    </div>
  );
}
