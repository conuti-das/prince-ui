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
import { Button, SegmentedControl, Segment, Notice } from "prince-ui";
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

  // latest callbacks in refs (avoid re-init on identity change)
  const cb = useRef({ onChange, onElementSelect, onDirtyChange });
  cb.current = { onChange, onElementSelect, onDirtyChange };

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

      const colors = getDiagramColors(colorScheme);
      const additionalModules: unknown[] = [
        lintModule,
        createAppleRendererModule(BpmnRenderer as new (...a: unknown[]) => unknown),
      ];
      if (propertiesPanel) {
        additionalModules.unshift(
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          CamundaPlatformPropertiesProviderModule,
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
        if (only?.id) {
          cb.current.onElementSelect?.({ id: only.id, name: only.businessObject?.name });
        } else {
          cb.current.onElementSelect?.(null);
        }
      });

      // changes → onChange + dirty
      eventBus.on("commandStack.changed", () => {
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
          (modeler.get("canvas") as { zoom(l: string): void }).zoom("fit-viewport");
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
    // re-init on theme/colorScheme/propertiesPanel; NOT on value (handled below)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeTick, colorScheme, propertiesPanel]);

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
      try {
        (modeler.get("canvas") as { zoom(l: string): void }).zoom("fit-viewport");
      } catch {
        /* ignore */
      }
    });
    return () => {
      cancelled = true;
    };
  }, [value, isControlled]);

  // ResizeObserver → fit-viewport
  useEffect(() => {
    if (!canvasRef.current) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const ro = new ResizeObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          (modelerRef.current?.get("canvas") as { zoom(l: string): void } | undefined)?.zoom(
            "fit-viewport",
          );
        } catch {
          /* ignore */
        }
      }, 150);
    });
    ro.observe(canvasRef.current);
    return () => {
      if (timer) clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

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
        cb.current.onDirtyChange?.(false);
      }
    } finally {
      setSaving(false);
    }
  }, [onSave, getXml]);

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
        <div className="prn-bpmn-editor-toolbar-spacer" />
        {actionsSlot}
        {onSave && (
          <Button variant="filled" onPress={() => void handleSave()} isDisabled={saving}>
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
              <BpmnTableView xml={tableXml} />
            </div>
          )}
        </div>

        {/* Properties-Panel-Container (vom Modeler befüllt) */}
        {propertiesPanel && view === "diagram" && (
          <div ref={propsRef} className="prn-bpmn-editor-properties" />
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
