import type { ReactNode } from "react";
import { Badge, type BadgeTone } from "./composites";
import { Icon, type IconName } from "../icons/icons";
import { cx } from "../utils";
import "./stepbar.css";

/* ---------------- StepBar: Stufenleiste für einen Weg ----------------
 * Regelwerk (E, GESTALTUNGSREGELN.md, „Was prince-ui dafür braucht“): Stufenleiste nach der Vorlage des Massenauftrags
 * (E `ui/src/prince/AuftragDetail.tsx`, `<ol class="p-au-stufen">`). Zeigt, wo ein Objekt auf seinem Weg steht
 * (z. B. angelegt → freigegeben → läuft → abgeschlossen). Ohne `onSelect` reine Anzeige; keine Leitfarbe.
 * Mit `onSelect` (Assistent mit Schritten) wird jede Stufe ein Knopf; die Prüfung vor dem Wechsel macht die Anwendung, gesperrte Stufen tragen `isDisabled`.
 * Der Zustand steht immer auch als Text da (nie nur Farbe); die aktuelle Stufe trägt `aria-current="step"`.
 */

export type StepState = "done" | "current" | "upcoming" | "warning" | "problem" | "rejected" | "skipped";

export interface Step {
  id: string;
  label: ReactNode;
  /** Zweite Zeile (Datum, Person, Zahl). */
  detail?: ReactNode;
  state: StepState;
  /** Abweichender Text des Zustands für diese Stufe (z. B. „überfällig“). */
  stateLabel?: string;
  /** Nur mit `onSelect`: Stufe nicht wählbar (z. B. erst nach den vorigen Schritten). */
  isDisabled?: boolean;
  "data-testid"?: string;
}

export interface StepBarProps {
  steps: Step[];
  /** Pflicht: Name der Liste für Vorleseprogramme, z. B. „Stufen des Auftrags“. */
  "aria-label": string;
  /** Texte der Zustände (für `t()`); fehlende nehmen den Default. */
  stateLabels?: Partial<Record<StepState, string>>;
  /** `compact`: ohne zweite Zeile und ohne Zustandsmarke (nur Nummer/Zeichen und Name; der Zustand bleibt für Vorleseprogramme). */
  density?: "regular" | "compact";
  /** Stufen wählbar (Assistent): jede Stufe wird ein Knopf und ruft `onSelect(id)`; ohne bleibt die Leiste reine Anzeige. */
  onSelect?: (id: string) => void;
  className?: string;
  "data-testid"?: string;
}

export const STEP_STATE_LABELS: Record<StepState, string> = {
  done: "erledigt",
  current: "aktuell",
  upcoming: "folgt",
  warning: "mit Hinweis",
  problem: "mit Problem",
  rejected: "abgelehnt",
  skipped: "nicht durchlaufen",
};

const TON: Record<StepState, BadgeTone> = {
  done: "green", current: "blue", upcoming: "gray", warning: "orange", problem: "red", rejected: "red", skipped: "neutral",
};
const ZEICHEN: Partial<Record<StepState, IconName>> = { done: "check", problem: "octagon-alert", rejected: "x-circle", warning: "alert" };

export function StepBar({ steps, stateLabels, density = "regular", onSelect, className, ...props }: StepBarProps) {
  const text = (s: Step) => s.stateLabel ?? stateLabels?.[s.state] ?? STEP_STATE_LABELS[s.state];
  const inhalt = (s: Step, i: number, zeichen: IconName | undefined) => (
    <>
      <span className="prn-step-marke" aria-hidden>{zeichen ? <Icon name={zeichen} size={14} /> : i + 1}</span>
      <span className="prn-step-text">
        <span className="prn-step-name">{s.label}</span>
        {density === "regular" && s.detail != null && <span className="prn-step-detail">{s.detail}</span>}
      </span>
      {density === "regular"
        ? <Badge tone={TON[s.state]} className="prn-step-zustand">{text(s)}</Badge>
        : <span className="prn-step-sr">{text(s)}</span>}
    </>
  );
  return (
    <ol {...props} className={cx("prn-stepbar", className)} data-density={density}>
      {steps.map((s, i) => {
        const zeichen = ZEICHEN[s.state];
        return (
          <li key={s.id} className="prn-step" data-state={s.state} data-step={s.id} data-selectable={onSelect ? "" : undefined} aria-current={onSelect ? undefined : s.state === "current" ? "step" : undefined} data-testid={s["data-testid"]}>
            {onSelect ? (
              <button type="button" className="prn-step-knopf" disabled={s.isDisabled} aria-current={s.state === "current" ? "step" : undefined} onClick={() => onSelect(s.id)}>
                {inhalt(s, i, zeichen)}
              </button>
            ) : inhalt(s, i, zeichen)}
          </li>
        );
      })}
    </ol>
  );
}
