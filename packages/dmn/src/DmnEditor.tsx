/**
 * DmnEditor — Umschalter zwischen ⑤ Tabelle (einstiegsfreundlich) und ⑥
 * Experten-Modus (dmn-js). Default: 'table'.
 *
 * Beide Modi teilen dasselbe DMN-XML (controlled/uncontrolled) und das
 * dmn-moddle-Fundament, damit das Umschalten verlustfrei bleibt: der eine Modus
 * schreibt per `onChange` zurück, der andere liest es beim Mount.
 */

import { useState, type ReactNode } from "react";
import { SegmentedControl, Segment } from "@conuti-das/prince-ui";
import { DmnTableEditor, type DmnTableEditorProps } from "./table/DmnTableEditor";
import { DmnExpertEditor } from "./expert/DmnExpertEditor";
import type { DiagramColorScheme } from "./types";
import "./DmnEditor.css";

export type DmnEditorMode = "table" | "expert";

export interface DmnEditorProps {
  value?: string;
  defaultValue?: string;
  onChange?: (xml: string) => void;
  onSave?: (xml: string) => void | Promise<void>;
  /** Start-Modus (Default 'table'). */
  defaultMode?: DmnEditorMode;
  /** Controlled-Modus. */
  mode?: DmnEditorMode;
  onModeChange?: (mode: DmnEditorMode) => void;
  colorScheme?: DiagramColorScheme;
  title?: ReactNode;
  subtitle?: ReactNode;
  cellPlugins?: DmnTableEditorProps["cellPlugins"];
  actionsSlot?: ReactNode;
  decisionId?: string;
  className?: string;
}

export function DmnEditor({
  value,
  defaultValue,
  onChange,
  onSave,
  defaultMode = "table",
  mode: controlledMode,
  onModeChange,
  colorScheme,
  title,
  subtitle,
  cellPlugins,
  actionsSlot,
  decisionId,
  className,
}: DmnEditorProps) {
  const [internalMode, setInternalMode] = useState<DmnEditorMode>(defaultMode);
  const mode = controlledMode ?? internalMode;

  // Uncontrolled: das XML in einen lokalen Buffer spiegeln, damit beide Modi
  // beim Umschalten denselben (zuletzt editierten) Stand sehen.
  const [bufferXml, setBufferXml] = useState<string | undefined>(
    value ?? defaultValue,
  );
  const isControlled = value !== undefined;
  const currentXml = isControlled ? value : bufferXml;

  const setMode = (next: DmnEditorMode) => {
    if (controlledMode === undefined) setInternalMode(next);
    onModeChange?.(next);
  };

  const handleChange = (xml: string) => {
    if (!isControlled) setBufferXml(xml);
    onChange?.(xml);
  };

  const switcher = (
    <SegmentedControl
      aria-label="Editor-Modus"
      selectedKeys={new Set([mode])}
      onSelectionChange={(keys) => {
        const next = Array.from(keys as Set<string>)[0] as DmnEditorMode;
        if (next) setMode(next);
      }}
    >
      <Segment id="table">Tabelle</Segment>
      <Segment id="expert">Experte</Segment>
    </SegmentedControl>
  );

  return (
    <div className={cls("prn-dmn-editor", className)} data-prn-dmn-editor>
      {mode === "table" ? (
        <DmnTableEditor
          value={currentXml}
          onChange={handleChange}
          onSave={onSave}
          decisionId={decisionId}
          title={title}
          subtitle={subtitle}
          cellPlugins={cellPlugins}
          actionsSlot={
            <>
              {switcher}
              {actionsSlot}
            </>
          }
        />
      ) : (
        <DmnExpertEditor
          value={currentXml}
          onChange={handleChange}
          onSave={onSave}
          colorScheme={colorScheme}
          actionsSlot={
            <>
              {switcher}
              {actionsSlot}
            </>
          }
        />
      )}
    </div>
  );
}

function cls(...parts: (string | undefined | false)[]): string {
  return parts.filter(Boolean).join(" ");
}
