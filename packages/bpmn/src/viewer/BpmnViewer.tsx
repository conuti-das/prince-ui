/**
 * `<BpmnViewer>` — read-only BPMN-Anzeige mit Status/Historie-Highlighting.
 *
 * Kapselt `bpmn-js/lib/NavigatedViewer` (per Dynamic Import — der Paket-Entry
 * bleibt frei von bpmn-js-Top-Level-Imports). Status wird **deklarativ** über
 * diagram-js-Marker (CSS-Klassen, tokenbasiert in `viewer.css`) + Overlays
 * gesetzt — kein imperatives SVG-Recoloring mehr.
 *
 * Theming läuft über die Renderer-Config (`getDiagramColors`), nicht über CSS;
 * `data-theme`-Wechsel triggert via `onThemeChange` einen Remount.
 *
 * Die Komponente bringt ihre eigene Höhe + `ResizeObserver` mit — der Canvas
 * darf nie in einen auto-höhenden Container gewickelt werden.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "prince-ui";
import type {
  BpmnElementClick,
  DiagramColorScheme,
  HistoryActivityInstance,
  Incident,
} from "../types";
import { getDiagramColors, onThemeChange } from "../theme/diagram-theme";
import { buildRendererConfig, createAppleRendererModule } from "../theme/apple-renderer";
import {
  computeElementStatuses,
  computeExecutedFlows,
  type DiagramElementLike,
} from "./status";
import {
  statusMarker,
  buildStatusOverlay,
  allStatusMarkers,
  MULTI_EXECUTION_MARKER,
  FLOW_EXECUTED_MARKER,
  STATUS_OVERLAY_POSITION,
} from "./overlays";
import "./viewer.css";

export interface BpmnViewerProps {
  /** Das anzuzeigende BPMN 2.0 XML. */
  xml: string;
  /** Camunda-7-History-Einträge zur Status-Färbung. */
  activityHistory?: HistoryActivityInstance[];
  /** Camunda-7-Incidents (färben das betroffene Element rot). */
  incidents?: Incident[];
  /** IDs der zur Laufzeit aktiven Aktivitäten (überschreiben History → blau). */
  runtimeActiveActivityIds?: string[];
  /** Light/Dark-Steuerung. Default `auto` (folgt `data-theme`). */
  colorScheme?: DiagramColorScheme;
  /** Klick auf ein Element. */
  onElementClick?: (event: BpmnElementClick) => void;
  /** Bei Container-Resize automatisch neu einpassen. Default `true`. */
  fitOnResize?: boolean;
  /** Zoom-Steuerung (Buttons) anzeigen. Default `true`. */
  showZoomControls?: boolean;
  /** Höhe des Containers. Default `"100%"`. Canvas braucht eine feste Höhe. */
  height?: string | number;
  /** Optionaler Klassennamen-Override für den äußeren Container. */
  className?: string;
}

interface ViewerInstance {
  importXML(xml: string): Promise<{ warnings: string[] }>;
  destroy(): void;
  get(service: string): unknown;
}

/**
 * Apple-styled, read-only BPMN-Viewer mit deklarativem Status-Highlighting.
 */
export function BpmnViewer({
  xml,
  activityHistory,
  incidents,
  runtimeActiveActivityIds,
  colorScheme = "auto",
  onElementClick,
  fitOnResize = true,
  showZoomControls = true,
  height = "100%",
  className,
}: BpmnViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ViewerInstance | null>(null);
  const overlayIdsRef = useRef<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [themeTick, setThemeTick] = useState(0);

  // latest props in refs so the highlight-effect can reuse the loaded viewer
  // without re-importing the XML.
  const onElementClickRef = useRef(onElementClick);
  onElementClickRef.current = onElementClick;

  useEffect(() => onThemeChange(() => setThemeTick((t) => t + 1)), []);

  /** Marker + Overlays aus den puren Status-Funktionen anwenden. */
  const applyHighlighting = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    try {
      const elementRegistry = viewer.get("elementRegistry") as {
        getAll(): DiagramElementLike[];
        get(id: string): unknown;
      };
      const canvas = viewer.get("canvas") as {
        addMarker(id: string, cls: string): void;
        removeMarker(id: string, cls: string): void;
      };
      const overlays = viewer.get("overlays") as {
        add(id: string, cfg: unknown): string;
        remove(id: string): void;
      };

      // 1. Aufräumen: alte Marker + Overlays entfernen.
      const all = elementRegistry.getAll();
      const markers = [...allStatusMarkers(), FLOW_EXECUTED_MARKER];
      for (const el of all) {
        if (!el.id) continue;
        for (const m of markers) canvas.removeMarker(el.id, m);
      }
      for (const oid of overlayIdsRef.current) {
        try {
          overlays.remove(oid);
        } catch {
          /* ignore */
        }
      }
      overlayIdsRef.current = [];

      // 2. Status-Marker + Overlays setzen.
      const statuses = computeElementStatuses(all, activityHistory ?? [], {
        incidents,
        runtimeActiveActivityIds,
      });
      const doc = containerRef.current?.ownerDocument ?? document;
      for (const entry of statuses) {
        canvas.addMarker(entry.elementId, statusMarker(entry.status));
        if (entry.isMultiExecution) {
          canvas.addMarker(entry.elementId, MULTI_EXECUTION_MARKER);
        }
        try {
          const id = overlays.add(entry.elementId, {
            position: STATUS_OVERLAY_POSITION,
            html: buildStatusOverlay(entry.status, doc),
          });
          overlayIdsRef.current.push(id);
        } catch {
          /* element may not be on canvas — ignore */
        }
      }

      // 3. Ausgeführte Sequenzflüsse markieren.
      const flows = computeExecutedFlows(all, activityHistory ?? []);
      for (const id of flows) canvas.addMarker(id, FLOW_EXECUTED_MARKER);
    } catch {
      /* highlighting is best-effort — never crash the viewer */
    }
  }, [activityHistory, incidents, runtimeActiveActivityIds]);

  // Viewer-Init + XML-Import. Remount bei xml/colorScheme/themeTick.
  useEffect(() => {
    let cancelled = false;
    setError(null);

    const init = async () => {
      if (!containerRef.current || !xml || !xml.trim()) return;

      // alten Viewer wegräumen
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch {
          /* ignore */
        }
        viewerRef.current = null;
      }
      overlayIdsRef.current = [];

      const [{ default: NavigatedViewer }, { default: BpmnRenderer }] = await Promise.all([
        import(/* @vite-ignore */ "bpmn-js/lib/NavigatedViewer"),
        import(/* @vite-ignore */ "bpmn-js/lib/draw/BpmnRenderer"),
      ]);
      if (cancelled || !containerRef.current) return;

      const colors = getDiagramColors(colorScheme);
      const viewer = new NavigatedViewer({
        container: containerRef.current,
        additionalModules: [
          createAppleRendererModule(BpmnRenderer as new (...a: unknown[]) => unknown),
        ],
        ...buildRendererConfig(colors),
      }) as unknown as ViewerInstance;
      viewerRef.current = viewer;

      try {
        await viewer.importXML(xml);
        if (cancelled) return;

        // Klick-Handler
        const eventBus = viewer.get("eventBus") as {
          on(event: string, cb: (e: Record<string, unknown>) => void): void;
        };
        eventBus.on("element.click", (e) => {
          const element = e.element as DiagramElementLike | undefined;
          const original = e.originalEvent as MouseEvent | undefined;
          if (!element) return;
          const handler = onElementClickRef.current;
          if (!handler) return;
          handler({
            elementId: element.id ?? element.businessObject?.id ?? "",
            elementType: element.type ?? element.businessObject?.$type ?? "",
            businessObject: element.businessObject,
            screenPosition: original
              ? { x: original.clientX, y: original.clientY }
              : undefined,
          });
        });

        // Fit + Highlighting
        const canvas = viewer.get("canvas") as { zoom(level: string | number): void };
        if (
          containerRef.current &&
          containerRef.current.clientWidth > 0 &&
          containerRef.current.clientHeight > 0
        ) {
          canvas.zoom("fit-viewport");
        }
        applyHighlighting();
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    };

    void init();
    return () => {
      cancelled = true;
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch {
          /* ignore */
        }
        viewerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xml, colorScheme, themeTick]);

  // Re-Highlight bei Status-Datenänderung ohne Remount.
  useEffect(() => {
    applyHighlighting();
  }, [applyHighlighting]);

  // ResizeObserver → fit-viewport.
  useEffect(() => {
    if (!fitOnResize || !containerRef.current) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const ro = new ResizeObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          (viewerRef.current?.get("canvas") as { zoom(l: string): void } | undefined)?.zoom(
            "fit-viewport",
          );
        } catch {
          /* ignore */
        }
      }, 150);
    });
    ro.observe(containerRef.current);
    return () => {
      if (timer) clearTimeout(timer);
      ro.disconnect();
    };
  }, [fitOnResize]);

  const zoom = useCallback((factor: number | "fit") => {
    const canvas = viewerRef.current?.get("canvas") as
      | { zoom(level?: string | number): number }
      | undefined;
    if (!canvas) return;
    try {
      if (factor === "fit") canvas.zoom("fit-viewport");
      else canvas.zoom(canvas.zoom() * factor);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div
      className={["prn-bpmn", "prn-bpmn-viewer", className].filter(Boolean).join(" ")}
      data-color-scheme={colorScheme}
      style={{ height }}
    >
      {showZoomControls && (
        <div className="prn-bpmn-zoom" role="group" aria-label="Zoom">
          <Button variant="tinted" aria-label="Hineinzoomen" onPress={() => zoom(1.2)}>
            <span className="bpmn-icon-screen-fullscreen" aria-hidden>+</span>
          </Button>
          <Button variant="tinted" aria-label="Herauszoomen" onPress={() => zoom(0.8)}>
            <span aria-hidden>−</span>
          </Button>
          <Button variant="tinted" aria-label="Einpassen" onPress={() => zoom("fit")}>
            <span aria-hidden>⤢</span>
          </Button>
        </div>
      )}
      <div className="prn-bpmn-canvas" ref={containerRef} />
      {error && (
        <div className="prn-bpmn-error" role="alert">
          BPMN konnte nicht geladen werden: {error}
        </div>
      )}
    </div>
  );
}

export default BpmnViewer;
