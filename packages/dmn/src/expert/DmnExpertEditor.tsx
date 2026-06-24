/**
 * ⑥ DmnExpertEditor — voller dmn-js-Funktionsumfang (DRD + decision-table +
 * literal-expression) als Experten-/Backup-Modus.
 *
 * - dmn-js wird **lazy via dynamic import** geladen (optionaler Peer).
 * - Die DRD-SVG-Ansicht wird über `getDiagramColors()` (Token-Bridge) gethemt;
 *   Theme-Wechsel über `onThemeChange` → Remount (`themeTick`).
 * - Ein dmn-js-Properties-Panel wird **optional** ergänzt (nur wenn die Pakete
 *   `dmn-js-properties-panel` + `@bpmn-io/properties-panel` vorhanden sind;
 *   sonst stiller Verzicht — sie sind kein harter Dep dieses Pakets).
 * - Save über `saveXML({ format: true })` → `onSave(xml)` / `onChange(xml)`.
 *
 * Teilt das dmn-moddle-Fundament mit ⑤ (gemeinsames XML), damit das Umschalten
 * verlustfrei bleibt.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "prince-ui";
import type { DiagramColorScheme } from "../types";
import { getDiagramColors, onThemeChange } from "../theme/diagram-theme";
import "./DmnExpertEditor.css";

interface DmnModelerInstance {
  importXML(xml: string): Promise<{ warnings: unknown[] }>;
  saveXML(opts?: { format?: boolean }): Promise<{ xml: string }>;
  getActiveViewer?: () => unknown;
  on(event: string, cb: (...args: unknown[]) => void): void;
  destroy(): void;
}

export interface DmnExpertEditorProps {
  /** Controlled DMN-XML. */
  value?: string;
  /** Uncontrolled Start-XML. */
  defaultValue?: string;
  /** Bei Änderungen (commandStack.changed) mit serialisiertem XML. */
  onChange?: (xml: string) => void;
  /** Speichern-Callback. */
  onSave?: (xml: string) => void | Promise<void>;
  /** Light/Dark-Steuerung (Default auto via data-theme). */
  colorScheme?: DiagramColorScheme;
  /** Zusätzliche Toolbar-Actions. */
  actionsSlot?: ReactNode;
  /** Umschalten zur Tabellenansicht (⑤). */
  onSwitchToTable?: () => void;
  /** Properties-Panel anzeigen, falls die Pakete vorhanden sind (Default true). */
  propertiesPanel?: boolean;
  className?: string;
}

export function DmnExpertEditor({
  value,
  defaultValue,
  onChange,
  onSave,
  colorScheme = "auto",
  actionsSlot,
  onSwitchToTable,
  propertiesPanel = true,
  className,
}: DmnExpertEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<DmnModelerInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasPanel, setHasPanel] = useState(false);
  const [themeTick, setThemeTick] = useState(0);

  const xml = value ?? defaultValue ?? "";

  // Theme-Wechsel → Remount des Modelers.
  useEffect(() => onThemeChange(() => setThemeTick((t) => t + 1)), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const boot = async () => {
      const container = canvasRef.current;
      if (!container) return;

      // Vorherige Instanz abbauen.
      if (modelerRef.current) {
        try {
          modelerRef.current.destroy();
        } catch {
          /* ignore */
        }
        modelerRef.current = null;
      }

      try {
        const mod = (await import("dmn-js/lib/Modeler")) as {
          default: new (opts: Record<string, unknown>) => DmnModelerInstance;
        };
        if (cancelled || !canvasRef.current) return;

        const colors = getDiagramColors(colorScheme);
        const opts: Record<string, unknown> = {
          container,
          drd: {
            drawCustom: false,
            bpmnRenderer: {
              defaultFillColor: colors.defaultFillColor,
              defaultStrokeColor: colors.defaultStrokeColor,
              defaultLabelColor: colors.defaultLabelColor,
            },
          },
        };

        // Properties-Panel optional ergänzen.
        let panelLoaded = false;
        if (propertiesPanel && panelRef.current) {
          const panelMods = await loadPropertiesPanel();
          if (panelMods && !cancelled) {
            opts.drd = {
              ...(opts.drd as object),
              propertiesPanel: { parent: panelRef.current },
              additionalModules: panelMods.modules,
            };
            opts.moddleExtensions = panelMods.moddleExtensions;
            panelLoaded = true;
          }
        }

        const Modeler = mod.default;
        const modeler = new Modeler(opts);
        modelerRef.current = modeler;
        if (!cancelled) setHasPanel(panelLoaded);

        if (xml.trim()) {
          await modeler.importXML(xml);
        }

        // Änderungen propagieren.
        if (onChange) {
          modeler.on("views.changed", () => emitChange());
          modeler.on("commandStack.changed", () => emitChange());
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const emitChange = () => {
      const m = modelerRef.current;
      if (!m || !onChange) return;
      m.saveXML({ format: true })
        .then(({ xml: out }) => onChange(out))
        .catch(() => {
          /* ignore transient serialize errors */
        });
    };

    void boot();
    return () => {
      cancelled = true;
    };
    // xml absichtlich nicht in deps: Re-Import würde Edits verwerfen. Theme-Tick
    // erzwingt Remount. Initiales xml wird beim Mount geladen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorScheme, propertiesPanel, themeTick]);

  // Cleanup beim Unmount.
  useEffect(() => {
    return () => {
      if (modelerRef.current) {
        try {
          modelerRef.current.destroy();
        } catch {
          /* ignore */
        }
        modelerRef.current = null;
      }
    };
  }, []);

  const handleSave = useCallback(async () => {
    const m = modelerRef.current;
    if (!m || !onSave) return;
    setSaving(true);
    try {
      const { xml: out } = await m.saveXML({ format: true });
      await onSave(out);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }, [onSave]);

  return (
    <div className={cls("prn-dmn-expert", className)} data-prn-dmn-expert>
      <div className="prn-dmn-toolbar">
        <span className="prn-dmn-title__name">DMN — Experten-Modus</span>
        <span className="prn-dmn-spacer" />
        <div className="prn-dmn-toolbar-group">
          {actionsSlot}
          {onSwitchToTable && (
            <Button variant="plain" onPress={onSwitchToTable}>
              Tabelle
            </Button>
          )}
          {onSave && (
            <Button
              variant="filled"
              isDisabled={saving || loading}
              onPress={() => void handleSave()}
            >
              {saving ? "Speichern…" : "Speichern"}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="prn-dmn-lint" data-tone="negative" role="alert">
          Fehler: {error}
        </div>
      )}

      <div className="prn-dmn-expert__stage">
        <div ref={canvasRef} className="prn-dmn-expert__canvas" />
        <div
          ref={panelRef}
          className="prn-dmn-expert__panel"
          data-visible={hasPanel ? "true" : "false"}
        />
        {loading && (
          <div className="prn-dmn-expert__loading" role="status">
            dmn-js wird geladen…
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Optionales Properties-Panel — nur laden, wenn die Pakete da sind.  *
 * ------------------------------------------------------------------ */

interface PanelModules {
  modules: unknown[];
  moddleExtensions: Record<string, unknown>;
}

// Indirektion über eine Variable verhindert, dass der Bundler die optionalen
// Pakete statisch aufzulösen versucht (sie sind kein Dep dieses Pakets).
const dynamicImport = (spec: string): Promise<unknown> =>
  import(/* @vite-ignore */ /* webpackIgnore: true */ spec);

async function loadPropertiesPanel(): Promise<PanelModules | null> {
  try {
    const [panel, provider, moddle] = await Promise.all([
      dynamicImport("@bpmn-io/properties-panel"),
      dynamicImport("dmn-js-properties-panel"),
      dynamicImport("camunda-dmn-moddle/resources/camunda.json").catch(
        () => null,
      ),
    ]);
    const pnl = panel as Record<string, unknown>;
    const prov = provider as Record<string, unknown>;
    const modules = [
      pnl.PropertiesPanelModule ?? panel,
      prov.DmnPropertiesPanelModule ?? prov.default,
      prov.CamundaPropertiesProviderModule,
    ].filter(Boolean);
    return {
      modules,
      moddleExtensions: moddle
        ? { camunda: (moddle as { default?: unknown }).default ?? moddle }
        : {},
    };
  } catch {
    // Pakete nicht installiert — Editor läuft ohne Panel weiter.
    return null;
  }
}

function cls(...parts: (string | undefined | false)[]): string {
  return parts.filter(Boolean).join(" ");
}
