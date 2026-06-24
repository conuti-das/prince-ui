/**
 * Kanonische Camunda-7-Datenshapes, die die BPMN-Komponenten direkt konsumieren.
 * Quelle: finops `backend/app/models.py` / `frontend/src/.../api.ts`.
 * Bewusste Entscheidung (Brainstorming): Komponenten nehmen Camunda-Shapes direkt
 * statt eines abstrahierten Modells.
 */

/** Status einer Aktivität, abgeleitet aus der Camunda-Historie. */
export type ActivityStatus =
  | "active"
  | "completed"
  | "incident"
  | "canceled";

/** Eintrag aus `GET /history/activity-instance`. */
export interface HistoryActivityInstance {
  id: string;
  activityId: string;
  activityName?: string | null;
  activityType?: string | null;
  processInstanceId?: string;
  executionId?: string;
  startTime?: string | null;
  endTime?: string | null;
  cancelTime?: string | null;
  durationInMillis?: number | null;
  /** gesetzt, wenn die Aktivität ein CallActivity ist */
  calledProcessInstanceId?: string | null;
  canceled?: boolean;
  completeScope?: boolean;
}

/** Eintrag aus `GET /incident`. */
export interface Incident {
  id: string;
  incidentType?: string;
  activityId?: string | null;
  failedActivityId?: string | null;
  incidentMessage?: string | null;
  processInstanceId?: string;
  rootCauseIncidentId?: string | null;
  causeIncidentId?: string | null;
  incidentTimestamp?: string | null;
}

/** Eintrag aus `GET /history/variable-instance`. */
export interface HistoryVariableInstance {
  id: string;
  name: string;
  type?: string;
  value?: unknown;
  activityInstanceId?: string;
  processInstanceId?: string;
}

/** Daten, die ein Klick auf ein Diagramm-Element liefert. */
export interface BpmnElementClick {
  elementId: string;
  elementType: string;
  businessObject: unknown;
  /** Bildschirmposition (für Popover/Intervention) */
  screenPosition?: { x: number; y: number };
}

/** Light/Dark-Steuerung der Diagramm-Komponenten. */
export type DiagramColorScheme = "auto" | "light" | "dark";
