import type { ReactNode } from "react";
import { Button } from "../primitives/forms";
import { cx } from "../utils";
import "./selectionbar.css";

/* ---------------- SelectionBar ----------------
 * Sammelleiste über einer Tabelle mit Mehrfachauswahl: Zahl der gewählten Zeilen, Hinweise, Sammelaktionen und
 * „Auswahl aufheben“. Erscheint, sobald etwas gewählt ist (oder `visible`). Mit `reserveSpace` bleibt ihr Platz
 * auch ohne Auswahl frei – die Tabelle springt beim ersten Haken nicht nach unten. */

export interface SelectionBarProps {
  /** Zahl der gewählten Zeilen. */
  count: number;
  /** Text zur Zahl. Default: „{count} ausgewählt“. */
  countLabel?: ReactNode;
  /** Weitere Angaben neben der Zahl (z. B. „davon 2 nicht möglich“). */
  info?: ReactNode;
  /** Fehler oder Grenze (wird mit `role="alert"` angesagt); blendet die Aktionen aus. */
  error?: ReactNode;
  /** Sammelaktionen (Buttons). */
  actions?: ReactNode;
  /** Auswahl aufheben; ohne Handler kein Knopf. */
  onClear?: () => void;
  /** Text des Aufheben-Knopfs. Default „Auswahl aufheben“. */
  clearLabel?: string;
  clearTestId?: string;
  /** Auch ohne Auswahl zeigen. */
  visible?: boolean;
  /** Platz der Leiste auch ohne Auswahl freihalten. */
  reserveSpace?: boolean;
  /** Name der Toolbar. Default „Sammelaktionen“. */
  "aria-label"?: string;
  "data-testid"?: string;
  className?: string;
}

export function SelectionBar({
  count,
  countLabel,
  info,
  error,
  actions,
  onClear,
  clearLabel = "Auswahl aufheben",
  clearTestId,
  visible,
  reserveSpace = false,
  "aria-label": ariaLabel = "Sammelaktionen",
  "data-testid": testId,
  className,
}: SelectionBarProps) {
  const da = visible ?? count > 0;
  const leiste = da ? (
    <div role="toolbar" aria-label={ariaLabel} className={cx("prn-selectionbar", className)} data-testid={testId}>
      <div className="prn-selectionbar-status" aria-live="polite">
        <span className="prn-selectionbar-count">{countLabel ?? `${count.toLocaleString("de-DE")} ausgewählt`}</span>
        {info != null && <span className="prn-selectionbar-info">{info}</span>}
        {error != null && <span className="prn-selectionbar-error" role="alert">{error}</span>}
      </div>
      <div className="prn-selectionbar-actions">
        {error == null && count > 0 && actions}
        {onClear && (
          <Button variant="plain" onPress={onClear} data-testid={clearTestId}>
            {clearLabel}
          </Button>
        )}
      </div>
    </div>
  ) : null;
  if (!reserveSpace) return leiste;
  return <div className="prn-selectionbar-space">{leiste}</div>;
}
