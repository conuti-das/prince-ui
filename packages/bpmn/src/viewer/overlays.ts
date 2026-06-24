/**
 * Overlay-/Marker-Aufbau für das Status-Highlighting.
 *
 * Statt der Hauptform imperativ ein `fill` zu setzen (fragil, bricht bei
 * Theme/Renderer-Wechsel), arbeiten wir deklarativ:
 *  - ein diagram-js *Marker* (CSS-Klasse `prn-bpmn-status-<status>`) auf dem
 *    Element → CSS in `viewer.css` färbt Kontur/Füllung tokenbasiert,
 *  - ein optionales *Overlay* (kleiner Status-Punkt) oben rechts am Element.
 *
 * Die Funktionen hier sind rein bis auf das Erzeugen von DOM-Knoten über ein
 * injiziertes `Document` — dadurch in jsdom testbar.
 */

import type { ActivityStatus } from "../types";
import { STATUS_LABEL } from "./status";

/** CSS-Klasse, die als diagram-js-Marker gesetzt wird. */
export function statusMarker(status: ActivityStatus): string {
  return `prn-bpmn-status-${status}`;
}

/** Marker für mehrfach durchlaufene (heller dargestellte) Elemente. */
export const MULTI_EXECUTION_MARKER = "prn-bpmn-status-multi";

/** Marker für ausgeführte Sequenzflüsse. */
export const FLOW_EXECUTED_MARKER = "prn-bpmn-flow-executed";

/** Alle möglichen Marker-Klassen (für sauberes Aufräumen vor Re-Apply). */
export function allStatusMarkers(): string[] {
  const statuses: ActivityStatus[] = ["active", "completed", "incident", "canceled"];
  return [...statuses.map(statusMarker), MULTI_EXECUTION_MARKER];
}

/**
 * Baut den DOM-Knoten für das kleine Status-Overlay (Punkt + a11y-Label).
 * `doc` wird injiziert, damit die Funktion in jsdom getestet werden kann.
 */
export function buildStatusOverlay(
  status: ActivityStatus,
  doc: Document = document,
): HTMLElement {
  const el = doc.createElement("div");
  el.className = `prn-bpmn-overlay prn-bpmn-overlay-${status}`;
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", STATUS_LABEL[status]);
  el.title = STATUS_LABEL[status];
  return el;
}

/** Standardposition des Status-Overlays relativ zum Element (oben rechts). */
export const STATUS_OVERLAY_POSITION = { top: -6, right: -6 } as const;
