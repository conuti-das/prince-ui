/**
 * Reine Logik für das Status/Historie-Highlighting des BpmnViewers.
 *
 * Ersetzt das fragile imperative SVG-Recoloring aus finops `BpmnDiagram.tsx`
 * durch pure, getestete Funktionen:
 *  - Activity↔Element-Matching (direkt, case-insensitive, Name-Matching für CallActivities)
 *  - Status-Ableitung aus History/Incidents/Runtime
 *  - Status→Token-Mapping
 *  - Sequenzfluss-„ausgeführt"-Erkennung
 *
 * Das DOM/Overlay-/Marker-Setup baut darauf auf (siehe `overlays.ts`).
 */

import type {
  ActivityStatus,
  HistoryActivityInstance,
  Incident,
} from "../types";

/** Minimaler Ausschnitt eines diagram-js-Elements, den die Logik braucht. */
export interface DiagramElementLike {
  id: string;
  type?: string;
  businessObject?: {
    id?: string;
    name?: string;
    $type?: string;
    sourceRef?: { id?: string };
    targetRef?: { id?: string };
  };
}

/** Status→prince-ui-Token (CSS-Custom-Property-Name). */
export const STATUS_TOKEN: Record<ActivityStatus, string> = {
  active: "--prn-blue",
  completed: "--prn-green",
  incident: "--prn-red",
  canceled: "--prn-orange",
};

/** Deutsche Kurzbezeichnung je Status (für Tooltips/Legende/A11y). */
export const STATUS_LABEL: Record<ActivityStatus, string> = {
  active: "Aktiv",
  completed: "Abgeschlossen",
  incident: "Fehler",
  canceled: "Abgebrochen",
};

/**
 * Baut eine Lookup-Map über alle Matching-Schlüssel einer Aktivität:
 * `activityId`, `id` und (lowercased) `activityName`. Mehrere History-Einträge
 * derselben `activityId` werden zusammengeführt (jüngster „gewinnt" beim Status).
 */
export function buildActivityMap(
  activities: HistoryActivityInstance[],
): Map<string, HistoryActivityInstance> {
  const map = new Map<string, HistoryActivityInstance>();
  for (const activity of activities) {
    if (activity.activityId) {
      map.set(activity.activityId, activity);
      if (activity.id && activity.id !== activity.activityId) {
        map.set(activity.id, activity);
      }
    } else if (activity.id) {
      map.set(activity.id, activity);
    }
    if (activity.activityName) {
      const key = activity.activityName.toLowerCase().trim();
      if (key && !map.has(key)) map.set(key, activity);
    }
  }
  return map;
}

/** Ermittelt, welche `activityId`s mehrfach durchlaufen wurden (Retry/Loop). */
export function findMultiExecutionIds(
  activities: HistoryActivityInstance[],
): Set<string> {
  const counts = new Map<string, number>();
  for (const a of activities) {
    if (a.activityId) counts.set(a.activityId, (counts.get(a.activityId) ?? 0) + 1);
  }
  const multi = new Set<string>();
  for (const [id, count] of counts) if (count > 1) multi.add(id);
  return multi;
}

/** Ist das Element ein Flow-Knoten (Task/Event/Gateway/CallActivity)? */
export function isFlowNode(element: DiagramElementLike): boolean {
  const type = element.type ?? element.businessObject?.$type ?? "";
  return (
    type.includes("Task") ||
    type.includes("Event") ||
    type.includes("Gateway") ||
    type.includes("CallActivity") ||
    type.includes("SubProcess")
  );
}

/** Ist das Element ein Sequenzfluss? */
export function isSequenceFlow(element: DiagramElementLike): boolean {
  const type = element.type ?? element.businessObject?.$type ?? "";
  return type === "bpmn:SequenceFlow";
}

/**
 * Matcht ein Diagramm-Element auf einen History-Eintrag.
 * Strategien (in Reihenfolge): direktes ID-Matching, case-insensitive,
 * Name-Matching für CallActivities.
 */
export function matchActivity(
  element: DiagramElementLike,
  map: Map<string, HistoryActivityInstance>,
): HistoryActivityInstance | null {
  const elementId = element.id ?? element.businessObject?.id;
  const boId = element.businessObject?.id ?? element.id;
  if (!elementId) return null;

  if (map.has(elementId)) return map.get(elementId)!;
  if (boId && map.has(boId)) return map.get(boId)!;

  const lowerId = elementId.toLowerCase();
  for (const [key, activity] of map) {
    if (
      key.toLowerCase() === lowerId ||
      activity.activityId?.toLowerCase() === lowerId
    ) {
      return activity;
    }
  }

  const type = element.type ?? element.businessObject?.$type ?? "";
  if (type.includes("CallActivity") || type.includes("Call")) {
    const name = element.businessObject?.name?.toLowerCase().trim();
    if (name) {
      if (map.has(name)) return map.get(name)!;
      for (const activity of map.values()) {
        if (
          activity.activityName?.toLowerCase().trim() === name ||
          activity.activityId?.toLowerCase().trim() === name
        ) {
          return activity;
        }
      }
    }
  }
  return null;
}

/** Liegt für die gegebenen IDs ein Incident vor? */
export function hasIncident(
  ids: Array<string | null | undefined>,
  incidents: Incident[],
): boolean {
  const set = new Set(ids.filter(Boolean) as string[]);
  if (set.size === 0) return false;
  return incidents.some(
    (i) =>
      (i.activityId != null && set.has(i.activityId)) ||
      (i.failedActivityId != null && set.has(i.failedActivityId)),
  );
}

export interface StatusContext {
  incidents: Incident[];
  runtimeActiveActivityIds?: Set<string>;
  multiExecutionIds?: Set<string>;
}

/**
 * Leitet den Status eines Elements aus History + Incidents + Runtime ab.
 * Priorität: Incident > Runtime-aktiv > abgeschlossen > History-aktiv > abgebrochen.
 * Gibt `null` für „nicht ausgeführt" zurück.
 */
export function deriveStatus(
  element: DiagramElementLike,
  activity: HistoryActivityInstance | null,
  ctx: StatusContext,
): { status: ActivityStatus; isMultiExecution: boolean } | null {
  const elementId = element.id ?? element.businessObject?.id ?? "";
  const activityId = activity?.activityId ?? undefined;
  const ids = [elementId, activityId];

  if (hasIncident(ids, ctx.incidents)) {
    return { status: "incident", isMultiExecution: false };
  }

  const runtimeActive =
    ctx.runtimeActiveActivityIds != null &&
    ids.some((id) => id != null && ctx.runtimeActiveActivityIds!.has(id));
  if (runtimeActive) return { status: "active", isMultiExecution: false };

  if (!activity) return null;

  const isCanceled = activity.cancelTime != null || activity.canceled === true;
  const isMultiExecution =
    (ctx.multiExecutionIds?.has(activity.activityId ?? elementId) ?? false);

  if (activity.startTime && activity.endTime && !isCanceled) {
    return { status: "completed", isMultiExecution };
  }
  if (activity.startTime && !activity.endTime && !isCanceled) {
    return { status: "active", isMultiExecution: false };
  }
  if (activity.startTime && isCanceled) {
    return { status: "canceled", isMultiExecution: false };
  }
  return null;
}

/**
 * Ein Sequenzfluss gilt als ausgeführt, wenn die Quell-Aktivität beendet
 * (und nicht abgebrochen) ist und die Ziel-Aktivität gestartet wurde.
 */
export function isSequenceFlowExecuted(
  element: DiagramElementLike,
  map: Map<string, HistoryActivityInstance>,
): boolean {
  const sourceId = element.businessObject?.sourceRef?.id;
  const targetId = element.businessObject?.targetRef?.id;
  if (!sourceId || !targetId) return false;

  const source = matchActivity({ id: sourceId, businessObject: { id: sourceId } }, map);
  const target = matchActivity({ id: targetId, businessObject: { id: targetId } }, map);

  return Boolean(
    source?.endTime && !source.cancelTime && target?.startTime,
  );
}

export interface ElementStatusEntry {
  elementId: string;
  status: ActivityStatus;
  token: string;
  label: string;
  isMultiExecution: boolean;
  activity: HistoryActivityInstance | null;
}

/**
 * Berechnet den Status aller Flow-Knoten aus den gegebenen Elementen.
 * Reines Mapping — kein DOM-Zugriff. Die Komponente übersetzt das Ergebnis
 * in diagram-js-Marker + Overlays.
 */
export function computeElementStatuses(
  elements: DiagramElementLike[],
  activities: HistoryActivityInstance[],
  options: {
    incidents?: Incident[];
    runtimeActiveActivityIds?: string[];
  } = {},
): ElementStatusEntry[] {
  const incidents = options.incidents ?? [];
  const runtimeActive = options.runtimeActiveActivityIds
    ? new Set(options.runtimeActiveActivityIds)
    : undefined;
  const map = buildActivityMap(activities);
  const multiExecutionIds = findMultiExecutionIds(activities);
  const ctx: StatusContext = { incidents, runtimeActiveActivityIds: runtimeActive, multiExecutionIds };

  const result: ElementStatusEntry[] = [];
  for (const element of elements) {
    if (!isFlowNode(element)) continue;
    const elementId = element.id ?? element.businessObject?.id;
    if (!elementId) continue;
    const activity = matchActivity(element, map);
    const derived = deriveStatus(element, activity, ctx);
    if (!derived) continue;
    result.push({
      elementId,
      status: derived.status,
      token: STATUS_TOKEN[derived.status],
      label: STATUS_LABEL[derived.status],
      isMultiExecution: derived.isMultiExecution,
      activity,
    });
  }
  return result;
}

/** Liefert die IDs aller ausgeführten Sequenzflüsse. */
export function computeExecutedFlows(
  elements: DiagramElementLike[],
  activities: HistoryActivityInstance[],
): string[] {
  const map = buildActivityMap(activities);
  const result: string[] = [];
  for (const element of elements) {
    if (!isSequenceFlow(element)) continue;
    const id = element.id ?? element.businessObject?.id;
    if (id && isSequenceFlowExecuted(element, map)) result.push(id);
  }
  return result;
}
