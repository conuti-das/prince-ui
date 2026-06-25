/**
 * `<BpmnEditor>` — vollwertiger bpmn-js-Modeler im Apple-Look.
 *
 * - `bpmn-js/lib/Modeler` + Properties-Panel (eigener Container) +
 *   bpmnlint (Regeln lazy geladen, ErrorPanel) + camunda-moddle.
 * - Apple-Look-Custom-Renderer (`additionalModules`, `super(eventBus, 1500)`),
 *   delegiert an `BpmnRenderer`, passt nur Optik an.
 * - Original-bpmn.io-Icons in Palette/Context-Pad bleiben erhalten
 *   (über `bpmn-font` aus `base.css`).
 * - Controlled (`value`/`onChange`) **oder** uncontrolled (`defaultValue`),
 *   `onSave` via `saveXML({ format: true })`.
 * - `BpmnTableView` als Tabellen-Umschaltung integriert.
 * - Theme-Wechsel (`data-theme`) → Remount mit frischer Renderer-Config.
 *
 * Alle Engines werden per Dynamic Import geladen — der Paket-Entry bleibt
 * frei von bpmn-js-Top-Level-Imports (Code-Splitting).
 */

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { Button, SegmentedControl, Segment, Notice, Icon } from "@conuti-das/prince-ui";
import type { DiagramColorScheme } from "../types";
import { getDiagramColors, onThemeChange } from "../theme/diagram-theme";
import { buildRendererConfig, createAppleRendererModule } from "../theme/apple-renderer";
import {
  buildLintConfig,
  DEFAULT_LINT_RULES,
  type LintIssue,
  type LintRuleConfig,
} from "./lintConfig";
import { ErrorPanel } from "./ErrorPanel";
import { BpmnTableView } from "./BpmnTableView";
import "./editor.css";

export interface BpmnEditorProps {
  /** Controlled BPMN-XML. Bei gesetztem `value` ist die Komponente controlled. */
  value?: string;
  /** Uncontrolled Initial-XML. */
  defaultValue?: string;
  /** Wird bei jeder Modell-Änderung mit dem aktuellen XML aufgerufen. */
  onChange?: (xml: string) => void;
  /** Speichern (z. B. ⌘S / Toolbar-Button) → erhält `saveXML({format:true})`. */
  onSave?: (xml: string) => void | Promise<void>;
  /** bpmnlint-Regeln (Default: 4 MaKo-Regeln). */
  lintRules?: LintRuleConfig;
  /** Element-Selektion (ID + Name). */
  onElementSelect?: (selection: { id: string; name?: string } | null) => void;
  /** Dirty-State (ungespeicherte Änderungen). */
  onDirtyChange?: (dirty: boolean) => void;
  /** App-Slot für Zusatzaktionen in der Toolbar (z. B. KI-Button). */
  actionsSlot?: ReactNode;
  /** App-Slot im ErrorPanel (z. B. KI-Fix-Handler stellt eigenen Button bereit). */
  onKiFix?: (issues: LintIssue[]) => void;
  /** Light/Dark. Default `auto`. */
  colorScheme?: DiagramColorScheme;
  /** Properties-Panel anzeigen. Default `true`. */
  propertiesPanel?: boolean;
  /** Minimap (Übersichtskarte) anzeigen. Default `true`. */
  minimap?: boolean;
  /** Camunda-Element-Templates (JSON-Array) — im Properties-Panel anwendbar. */
  elementTemplates?: unknown[];
  /** Höhe des Editors. Default `"100%"`. */
  height?: string | number;
  /** Klassennamen-Override. */
  className?: string;
}

interface ModelerInstance {
  importXML(xml: string): Promise<{ warnings: string[] }>;
  saveXML(opts?: { format?: boolean }): Promise<{ xml: string }>;
  destroy(): void;
  get(service: string): unknown;
}

export function BpmnEditor({
  value,
  defaultValue,
  onChange,
  onSave,
  lintRules = DEFAULT_LINT_RULES,
  onElementSelect,
  onDirtyChange,
  actionsSlot,
  onKiFix,
  colorScheme = "auto",
  propertiesPanel = true,
  minimap = true,
  elementTemplates,
  height = "100%",
  className,
}: BpmnEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<ModelerInstance | null>(null);
  const isControlled = value !== undefined;

  const [error, setError] = useState<string | null>(null);
  const [lintIssues, setLintIssues] = useState<LintIssue[]>([]);
  const [errorPanelOpen, setErrorPanelOpen] = useState(false);
  const [view, setView] = useState<"diagram" | "table">("diagram");
  const [tableXml, setTableXml] = useState("");
  const [saving, setSaving] = useState(false);
  const [themeTick, setThemeTick] = useState(0);
  // Ungespeicherte Änderungen (Command-Stack) → Speichern-Button gaten (B10).
  const [dirty, setDirty] = useState(false);
  // Properties-Panel sichtbar (schließbar via X, B11).
  const [propsOpen, setPropsOpen] = useState(true);
  // Aktuell selektiertes Element (für Tabellen-Highlight, B9).
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  // latest callbacks in refs (avoid re-init on identity change)
  const cb = useRef({ onChange, onElementSelect, onDirtyChange });
  cb.current = { onChange, onElementSelect, onDirtyChange };
  // Element-Templates per Ref → Update ohne Modeler-Remount.
  const templatesRef = useRef(elementTemplates);
  templatesRef.current = elementTemplates;

  useEffect(() => onThemeChange(() => setThemeTick((t) => t + 1)), []);

  const getXml = useCallback(async (): Promise<string | null> => {
    if (!modelerRef.current) return null;
    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      return xml;
    } catch {
      return null;
    }
  }, []);

  // Fit mit Inset: nach fit-viewport leicht auszoomen und nach rechts/unten
  // verschieben, damit die linke Palette & Toolbar keine Elemente überdecken.
  const fitWithPadding = useCallback(() => {
    const canvas = modelerRef.current?.get("canvas") as
      | {
          zoom(level: string | number, center?: unknown): void;
          viewbox(): { scale: number };
          scroll(delta: { dx: number; dy: number }): void;
        }
      | undefined;
    if (!canvas) return;
    try {
      canvas.zoom("fit-viewport", "auto");
      const vb = canvas.viewbox();
      const padded = Math.min(vb.scale * 0.92, 1.5);
      canvas.zoom(padded, "auto");
      canvas.scroll({ dx: 90, dy: 24 }); // Palette (48px@left20) freihalten
    } catch {
      /* ignore */
    }
  }, []);

  // The initial XML to load: controlled value wins, else defaultValue.
  const initialXml = isControlled ? value : defaultValue;
  // We only re-import on controlled `value` change, not on every onChange echo.
  const lastImportedRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    const init = async () => {
      if (!canvasRef.current) return;
      // destroy previous
      if (modelerRef.current) {
        try {
          modelerRef.current.destroy();
        } catch {
          /* ignore */
        }
        modelerRef.current = null;
      }

      const [
        { default: BpmnModeler },
        propsPanel,
        { default: CamundaModdle },
        { default: lintModule },
        { default: BpmnRenderer },
        { default: MinimapModule },
        elementTemplatesMod,
        labelRequired,
        noComplexGateway,
        noDisconnected,
        noImplicitSplit,
      ] = await Promise.all([
        import(/* @vite-ignore */ "bpmn-js/lib/Modeler"),
        import(/* @vite-ignore */ "bpmn-js-properties-panel"),
        import(/* @vite-ignore */ "camunda-bpmn-moddle/resources/camunda.json"),
        import(/* @vite-ignore */ "bpmn-js-bpmnlint"),
        import(/* @vite-ignore */ "bpmn-js/lib/draw/BpmnRenderer"),
        import(/* @vite-ignore */ "diagram-js-minimap"),
        import(/* @vite-ignore */ "bpmn-js-element-templates"),
        import(/* @vite-ignore */ "bpmnlint/rules/label-required"),
        import(/* @vite-ignore */ "bpmnlint/rules/no-complex-gateway"),
        import(/* @vite-ignore */ "bpmnlint/rules/no-disconnected"),
        import(/* @vite-ignore */ "bpmnlint/rules/no-implicit-split"),
      ]);

      if (cancelled || !canvasRef.current) return;

      const {
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        CamundaPlatformPropertiesProviderModule,
      } = propsPanel as Record<string, unknown>;

      const lintConfig = buildLintConfig(
        {
          "bpmnlint/label-required": (labelRequired as { default: unknown }).default,
          "bpmnlint/no-complex-gateway": (noComplexGateway as { default: unknown }).default,
          "bpmnlint/no-disconnected": (noDisconnected as { default: unknown }).default,
          "bpmnlint/no-implicit-split": (noImplicitSplit as { default: unknown }).default,
        },
        lintRules,
      );

      const { ElementTemplatesPropertiesProviderModule } =
        elementTemplatesMod as Record<string, unknown>;

      const colors = getDiagramColors(colorScheme);
      const additionalModules: unknown[] = [
        lintModule,
        createAppleRendererModule(BpmnRenderer as new (...a: unknown[]) => unknown),
      ];
      if (minimap) additionalModules.push(MinimapModule);
      if (propertiesPanel) {
        additionalModules.unshift(
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          CamundaPlatformPropertiesProviderModule,
          ElementTemplatesPropertiesProviderModule,
        );
      }

      const modeler = new BpmnModeler({
        container: canvasRef.current,
        ...(propertiesPanel && propsRef.current
          ? { propertiesPanel: { parent: propsRef.current } }
          : {}),
        linting: { bpmnlint: lintConfig, active: true },
        ...buildRendererConfig(colors),
        additionalModules,
        moddleExtensions: { camunda: CamundaModdle },
      }) as unknown as ModelerInstance;
      modelerRef.current = modeler;

      // Element-Templates anwenden (falls übergeben).
      if (Array.isArray(templatesRef.current)) {
        try {
          (modeler.get("elementTemplates") as { set(t: unknown[]): void }).set(
            templatesRef.current,
          );
        } catch {
          /* ignore */
        }
      }
      // Minimap initial geöffnet zeigen.
      if (minimap) {
        try {
          (modeler.get("minimap") as { open(): void }).open();
        } catch {
          /* ignore */
        }
      }

      const eventBus = modeler.get("eventBus") as {
        on(event: string, cb: (e: Record<string, unknown>) => void): void;
      };

      eventBus.on("linting.completed", (e) => {
        const results = (e as { issues?: Record<string, { message: string; category?: string; id?: string; rule?: string }[]> }).issues ?? {};
        const flat: LintIssue[] = [];
        for (const [elId, issues] of Object.entries(results)) {
          for (const issue of issues) {
            flat.push({
              id: issue.rule ?? issue.id ?? elId,
              message: issue.message,
              category: (issue.category as "error" | "warning") ?? "warning",
              element: elId,
            });
          }
        }
        setLintIssues(flat);
      });

      eventBus.on("selection.changed", (e) => {
        const sel = (e as { newSelection?: { id?: string; businessObject?: { name?: string } }[] }).newSelection ?? [];
        const only = sel.length === 1 ? sel[0] : undefined;
        setSelectedId(only?.id);
        if (only?.id) {
          cb.current.onElementSelect?.({ id: only.id, name: only.businessObject?.name });
          // Auswahl eines Elements öffnet das Properties-Panel wieder (B11/B9).
          setPropsOpen(true);
        } else {
          cb.current.onElementSelect?.(null);
        }
      });

      // changes → onChange + dirty
      eventBus.on("commandStack.changed", () => {
        setDirty(true);
        cb.current.onDirtyChange?.(true);
        if (cb.current.onChange) {
          void modeler.saveXML({ format: true }).then(({ xml }) => {
            lastImportedRef.current = xml;
            cb.current.onChange?.(xml);
          });
        }
      });

      // import initial XML
      if (initialXml && initialXml.trim()) {
        try {
          await modeler.importXML(initialXml);
          lastImportedRef.current = initialXml;
          // Initialer Import zählt nicht als ungespeicherte Änderung (B10).
          setDirty(false);
          cb.current.onDirtyChange?.(false);
          fitWithPadding();
        } catch (err) {
          if (!cancelled) setError((err as Error).message);
        }
      }
    };

    void init();
    return () => {
      cancelled = true;
      if (modelerRef.current) {
        try {
          modelerRef.current.destroy();
        } catch {
          /* ignore */
        }
        modelerRef.current = null;
      }
    };
    // re-init on theme/colorScheme/propertiesPanel/minimap; NOT on value (below)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeTick, colorScheme, propertiesPanel, minimap]);

  // Controlled: re-import when external value changes (and differs from our echo).
  useEffect(() => {
    if (!isControlled || value === undefined) return;
    if (value === lastImportedRef.current) return;
    const modeler = modelerRef.current;
    if (!modeler || !value.trim()) return;
    let cancelled = false;
    void modeler.importXML(value).then(() => {
      if (cancelled) return;
      lastImportedRef.current = value;
      // Externer Reimport (anderes Artefakt) ist kein Dirty-State (B10).
      setDirty(false);
      cb.current.onDirtyChange?.(false);
      fitWithPadding();
    });
    return () => {
      cancelled = true;
    };
  }, [value, isControlled, fitWithPadding]);

  // KEIN ResizeObserver-Re-Fit mehr: diagram-js behält die Viewbox bei
  // Container-Resize von selbst bei. Das frühere zoom("fit-viewport") bei jedem
  // Resize ließ das Diagramm bei jeder Änderung (Lint-Leiste ein/aus →
  // Höhenänderung) neu zentrieren/springen. Fit passiert nur noch beim
  // initialen Import / Controlled-Reimport (fitWithPadding).

  const elementName = useCallback((elementId: string | undefined): string => {
    if (!elementId) return "(unbenannt)";
    const reg = modelerRef.current?.get("elementRegistry") as
      | { get(id: string): { businessObject?: { name?: string } } | undefined }
      | undefined;
    return reg?.get(elementId)?.businessObject?.name || elementId;
  }, []);

  const selectElement = useCallback((elementId: string) => {
    const reg = modelerRef.current?.get("elementRegistry") as
      | { get(id: string): unknown }
      | undefined;
    const el = reg?.get(elementId);
    if (!el) return;
    try {
      (modelerRef.current?.get("selection") as { select(e: unknown): void } | undefined)?.select(el);
      (modelerRef.current?.get("canvas") as { scrollToElement(e: unknown): void } | undefined)?.scrollToElement(el);
    } catch {
      /* ignore */
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      const xml = await getXml();
      if (xml != null) {
        await onSave(xml);
        setDirty(false);
        cb.current.onDirtyChange?.(false);
      }
    } finally {
      setSaving(false);
    }
  }, [onSave, getXml]);

  // Suchfeld (bpmn-js SearchPad) öffnen — via Toolbar-Button oder ⌘/Ctrl+F.
  const handleSearch = useCallback(() => {
    const m = modelerRef.current;
    if (!m) return;
    try {
      (m.get("editorActions") as { trigger(a: string): void }).trigger("find");
    } catch {
      try {
        (m.get("searchPad") as { toggle(): void }).toggle();
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Zoom relativ zur aktuellen Skala (Zoom-In/-Out, B6). Zentrum bleibt erhalten.
  const zoomBy = useCallback((factor: number) => {
    const canvas = modelerRef.current?.get("canvas") as
      | { zoom(level: number | string, center?: unknown): void; viewbox(): { scale: number } }
      | undefined;
    if (!canvas) return;
    try {
      const next = Math.max(0.2, Math.min(4, canvas.viewbox().scale * factor));
      canvas.zoom(next);
    } catch {
      /* ignore */
    }
  }, []);

  // Element-Templates aktualisieren, ohne den Modeler neu zu bauen.
  useEffect(() => {
    const m = modelerRef.current;
    if (!m) return;
    try {
      (m.get("elementTemplates") as { set(t: unknown[]): void }).set(
        Array.isArray(elementTemplates) ? elementTemplates : [],
      );
    } catch {
      /* ignore */
    }
  }, [elementTemplates]);

  const handleToggleView = useCallback(
    async (next: "diagram" | "table") => {
      if (next === "table") {
        const xml = await getXml();
        setTableXml(xml ?? initialXml ?? "");
      }
      setView(next);
    },
    [getXml, initialXml],
  );

  const errors = lintIssues.filter((i) => i.category === "error");
  const warnings = lintIssues.filter((i) => i.category === "warning");

  return (
    <div
      className={["prn-bpmn", "prn-bpmn-editor", className].filter(Boolean).join(" ")}
      data-color-scheme={colorScheme}
      style={{ height }}
    >
      {/* Toolbar */}
      <div className="prn-bpmn-editor-toolbar" role="toolbar" aria-label="BPMN-Editor-Aktionen">
        <SegmentedControl
          aria-label="Ansicht"
          selectedKeys={new Set([view])}
          onSelectionChange={(keys) => {
            const next = [...(keys as Set<string>)][0] as "diagram" | "table";
            if (next) void handleToggleView(next);
          }}
        >
          <Segment id="diagram">Diagramm</Segment>
          <Segment id="table">Tabelle</Segment>
        </SegmentedControl>
        {view === "diagram" && (
          <>
            <Button variant="plain" onPress={handleSearch} aria-label="Element suchen">
              <Icon name="search" />
            </Button>
            <div className="prn-bpmn-editor-zoom" role="group" aria-label="Zoom">
              <Button variant="plain" onPress={() => zoomBy(1.2)} aria-label="Vergrößern">
                <Icon name="plus" />
              </Button>
              <Button variant="plain" onPress={() => zoomBy(1 / 1.2)} aria-label="Verkleinern">
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12h14" />
                </svg>
              </Button>
              <Button variant="plain" onPress={fitWithPadding} aria-label="Auf Breite anpassen">
                <Icon name="maximize" />
              </Button>
            </div>
          </>
        )}
        <div className="prn-bpmn-editor-toolbar-spacer" />
        {actionsSlot}
        {onSave && (
          <Button
            variant="filled"
            onPress={() => void handleSave()}
            isDisabled={saving || !dirty}
          >
            {saving ? "Speichern…" : "Speichern"}
          </Button>
        )}
      </div>

      {error && (
        <Notice tone="negative" title="Fehler">
          {error}
        </Notice>
      )}

      {/* Hauptbereich */}
      <div className="prn-bpmn-editor-main">
        <div className="prn-bpmn-editor-stage">
          {/* Canvas — immer im DOM, bei Tabellenansicht versteckt */}
          <div
            ref={canvasRef}
            className="prn-bpmn-canvas"
            style={{ display: view === "table" ? "none" : "block" }}
          />
          {view === "table" && (
            <div className="prn-bpmn-editor-table">
              <BpmnTableView
                xml={tableXml}
                selectedId={selectedId}
                onRowSelect={selectElement}
              />
            </div>
          )}
        </div>

        {/* Properties-Panel (vom Modeler befüllt). Immer im DOM, damit der
            bpmn-js-Panel-Container nicht verwaist; schließbar (B11) und auch in
            der Tabellenansicht sichtbar (B9). */}
        {propertiesPanel && (
          <div
            className="prn-bpmn-editor-properties"
            style={propsOpen ? undefined : { display: "none" }}
          >
            <div className="prn-bpmn-editor-properties-head">
              <span className="prn-bpmn-editor-properties-title">Eigenschaften</span>
              <Button
                variant="plain"
                onPress={() => setPropsOpen(false)}
                aria-label="Eigenschaften-Panel schließen"
              >
                <Icon name="x" />
              </Button>
            </div>
            <div ref={propsRef} className="prn-bpmn-editor-properties-body" />
          </div>
        )}
      </div>

      {/* Linter-Footer */}
      {lintIssues.length > 0 && !errorPanelOpen && (
        <button
          type="button"
          className="prn-bpmn-editor-lintbar"
          onClick={() => setErrorPanelOpen(true)}
          data-testid="lint-footer-toggle"
        >
          {errors.length > 0 && (
            <span className="prn-bpmn-lint-error">✕ {errors.length} Fehler</span>
          )}
          {warnings.length > 0 && (
            <span className="prn-bpmn-lint-warning">⚠ {warnings.length} Warnungen</span>
          )}
          <span className="prn-bpmn-muted">— Details anzeigen</span>
        </button>
      )}

      {lintIssues.length > 0 && errorPanelOpen && (
        <ErrorPanel
          issues={lintIssues}
          elementName={elementName}
          onSelectElement={selectElement}
          onKiFix={onKiFix ? () => onKiFix(lintIssues) : undefined}
          onClose={() => setErrorPanelOpen(false)}
        />
      )}
    </div>
  );
}

export default BpmnEditor;
