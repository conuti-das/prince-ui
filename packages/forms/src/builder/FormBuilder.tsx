import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import {
  Button,
  Card,
  Checkbox,
  EmptyState,
  Notice,
  NumberField,
  SegmentedControl,
  Segment,
  Select,
  SelectItem,
  TextField,
} from "prince-ui";
import type { FormField, FormFieldOption, FormSchema } from "../types";
import { FormRenderer } from "../renderer/FormRenderer";
import {
  BUILDER_FIELD_TYPES,
  FIELD_TYPE_LABELS,
  type BuilderFieldType,
  createField,
  emptySchema,
  hasOptions,
  insertField,
  isPresentational,
  moveField,
  removeFieldAt,
  updateFieldAt,
} from "./builder-model";
import "./FormBuilder.css";

export type { BuilderFieldType } from "./builder-model";

export type FormBuilderMode = "design" | "expert";

export interface FormBuilderProps {
  /** Kontrolliertes Schema. */
  value?: FormSchema;
  /** Ungesteuertes Anfangs-Schema. */
  defaultValue?: FormSchema;
  /** Schema-Änderungen. */
  onChange?: (schema: FormSchema) => void;
  /** Persistenz-Callback (z. B. ⌘S in der App). */
  onSave?: (schema: FormSchema) => void | Promise<void>;
  /** Editor-Modus: nativer Designer oder form-js-Experten-Fallback. */
  mode?: FormBuilderMode;
  onModeChange?: (mode: FormBuilderMode) => void;
  /** Beschränkt/erweitert die Palette (Default: alle Builder-Feldtypen). */
  fieldTypes?: readonly BuilderFieldType[];
  className?: string;
}

const DND_MIME = "application/x-prn-field-type";

export function FormBuilder({
  value,
  defaultValue,
  onChange,
  onSave,
  mode,
  onModeChange,
  fieldTypes = BUILDER_FIELD_TYPES,
  className,
}: FormBuilderProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<FormSchema>(
    () => value ?? defaultValue ?? emptySchema(),
  );
  const schema = isControlled ? value : internal;

  const [modeInternal, setModeInternal] = useState<FormBuilderMode>(mode ?? "design");
  const activeMode = mode ?? modeInternal;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const commit = useCallback(
    (next: FormSchema) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const setMode = useCallback(
    (m: FormBuilderMode) => {
      if (mode === undefined) setModeInternal(m);
      onModeChange?.(m);
    },
    [mode, onModeChange],
  );

  /* ---- Drag & Drop ---- */
  const dragFrom = useRef<number | null>(null);

  const onPaletteDragStart = (e: DragEvent, type: BuilderFieldType) => {
    e.dataTransfer.setData(DND_MIME, type);
    e.dataTransfer.effectAllowed = "copy";
    dragFrom.current = null;
  };

  const onCanvasItemDragStart = (e: DragEvent, index: number) => {
    e.dataTransfer.setData(DND_MIME, "__move__");
    e.dataTransfer.effectAllowed = "move";
    dragFrom.current = index;
  };

  const onDropAt = (e: DragEvent, index: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData(DND_MIME);
    setDropIndex(null);
    if (dragFrom.current != null) {
      const next = moveField(schema, dragFrom.current, index);
      commit(next);
      setSelectedIndex(index);
      dragFrom.current = null;
      return;
    }
    if (data && data !== "__move__") {
      const field = createField(data as BuilderFieldType);
      commit(insertField(schema, field, index));
      setSelectedIndex(index);
    }
  };

  const onDropEnd = (e: DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData(DND_MIME);
    setDropIndex(null);
    if (dragFrom.current != null) {
      commit(moveField(schema, dragFrom.current, schema.components.length - 1));
      dragFrom.current = null;
      return;
    }
    if (data && data !== "__move__") {
      const field = createField(data as BuilderFieldType);
      commit(insertField(schema, field));
      setSelectedIndex(schema.components.length);
    }
  };

  const selectedField =
    selectedIndex != null ? schema.components[selectedIndex] : undefined;

  const patchSelected = useCallback(
    (patch: Partial<FormField>) => {
      if (selectedIndex == null) return;
      commit(updateFieldAt(schema, selectedIndex, patch));
    },
    [selectedIndex, schema, commit],
  );

  const deleteSelected = useCallback(() => {
    if (selectedIndex == null) return;
    commit(removeFieldAt(schema, selectedIndex));
    setSelectedIndex(null);
  }, [selectedIndex, schema, commit]);

  return (
    <div className={cx("prn-form-builder", className)} data-mode={activeMode}>
      <div className="prn-fb-toolbar">
        <SegmentedControl
          aria-label="Builder-Modus"
          selectedKeys={new Set([activeMode])}
          onSelectionChange={(keys) => {
            const next = [...keys][0] as FormBuilderMode | undefined;
            if (next) setMode(next);
          }}
        >
          <Segment id="design">Designer</Segment>
          <Segment id="expert">Experte (form-js)</Segment>
        </SegmentedControl>
        {onSave && (
          <Button variant="filled" onPress={() => onSave(schema)}>
            Speichern
          </Button>
        )}
      </div>

      {activeMode === "expert" ? (
        <ExpertEditor schema={schema} onChange={commit} />
      ) : (
        <div className="prn-fb-grid">
          {/* Palette */}
          <Card title="Felder" className="prn-fb-palette">
            <div className="prn-fb-palette-list">
              {fieldTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className="prn-fb-palette-item"
                  draggable
                  onDragStart={(e) => onPaletteDragStart(e, type)}
                  onClick={() => {
                    commit(insertField(schema, createField(type)));
                    setSelectedIndex(schema.components.length);
                  }}
                >
                  <span className="prn-fb-palette-glyph" aria-hidden>
                    {GLYPH[type] ?? "▦"}
                  </span>
                  {FIELD_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </Card>

          {/* Canvas */}
          <Card title="Formular" className="prn-fb-canvas">
            <div
              className="prn-fb-canvas-drop"
              onDragOver={(e) => {
                e.preventDefault();
                setDropIndex(schema.components.length);
              }}
              onDrop={onDropEnd}
            >
              {schema.components.length === 0 ? (
                <EmptyState
                  title="Leeres Formular"
                  description="Felder aus der Palette hierher ziehen oder anklicken."
                />
              ) : (
                <ul className="prn-fb-canvas-list" role="list">
                  {schema.components.map((field, index) => (
                    <li
                      key={field.id ?? index}
                      className="prn-fb-canvas-item"
                      data-selected={selectedIndex === index || undefined}
                      data-dropbefore={dropIndex === index || undefined}
                      draggable
                      onDragStart={(e) => onCanvasItemDragStart(e, index)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDropIndex(index);
                      }}
                      onDrop={(e) => {
                        e.stopPropagation();
                        onDropAt(e, index);
                      }}
                      onClick={() => setSelectedIndex(index)}
                    >
                      <span className="prn-fb-item-type">
                        {FIELD_TYPE_LABELS[field.type as BuilderFieldType] ?? field.type}
                      </span>
                      <span className="prn-fb-item-label">
                        {isPresentational(field.type)
                          ? field.text ?? "—"
                          : field.label ?? field.key ?? "—"}
                      </span>
                      <Button
                        variant="plain"
                        className="prn-fb-item-remove"
                        aria-label="Feld entfernen"
                        onPress={() => {
                          commit(removeFieldAt(schema, index));
                          if (selectedIndex === index) setSelectedIndex(null);
                        }}
                      >
                        ✕
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {/* Properties */}
          <Card title="Eigenschaften" className="prn-fb-props">
            {selectedField ? (
              <PropertiesPanel
                field={selectedField}
                onPatch={patchSelected}
                onDelete={deleteSelected}
              />
            ) : (
              <p className="prn-fb-props-empty">Kein Feld ausgewählt.</p>
            )}
          </Card>

          {/* Live-Vorschau */}
          <Card title="Vorschau" className="prn-fb-preview">
            {schema.components.length === 0 ? (
              <p className="prn-fb-props-empty">Noch keine Felder.</p>
            ) : (
              <FormRenderer schema={schema} submitLabel={null} />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

const GLYPH: Partial<Record<BuilderFieldType, string>> = {
  textfield: "T",
  textarea: "¶",
  number: "#",
  checkbox: "☑",
  checklist: "▤",
  radio: "◉",
  select: "▾",
  datetime: "📅",
  taglist: "🏷",
  text: "𝐀",
  separator: "—",
  spacer: "␣",
};

/* ---------------- Properties Panel ---------------- */

function PropertiesPanel({
  field,
  onPatch,
  onDelete,
}: {
  field: FormField;
  onPatch: (patch: Partial<FormField>) => void;
  onDelete: () => void;
}) {
  const presentational = isPresentational(field.type);
  const optioned = hasOptions(field.type);

  return (
    <div className="prn-fb-props-form">
      {presentational ? (
        field.type === "text" && (
          <TextField
            label="Text"
            value={field.text ?? ""}
            onChange={(v) => onPatch({ text: v })}
          />
        )
      ) : (
        <>
          <TextField
            label="Label"
            value={field.label ?? ""}
            onChange={(v) => onPatch({ label: v })}
          />
          <TextField
            label="Key (Datenbindung)"
            value={field.key ?? ""}
            onChange={(v) => onPatch({ key: v })}
          />
          <TextField
            label="Beschreibung"
            value={field.description ?? ""}
            onChange={(v) => onPatch({ description: v })}
          />

          {/* Validierung */}
          <Checkbox
            isSelected={Boolean(field.validate?.required)}
            onChange={(v) => onPatch({ validate: { ...field.validate, required: v } })}
          >
            Pflichtfeld
          </Checkbox>

          {field.type === "number" && (
            <div className="prn-fb-props-row">
              <NumberField
                label="Min"
                value={field.validate?.min ?? Number.NaN}
                onChange={(v) =>
                  onPatch({
                    validate: { ...field.validate, min: Number.isNaN(v) ? undefined : v },
                  })
                }
              />
              <NumberField
                label="Max"
                value={field.validate?.max ?? Number.NaN}
                onChange={(v) =>
                  onPatch({
                    validate: { ...field.validate, max: Number.isNaN(v) ? undefined : v },
                  })
                }
              />
            </div>
          )}

          {(field.type === "textfield" || field.type === "textarea") && (
            <div className="prn-fb-props-row">
              <NumberField
                label="Min. Länge"
                value={field.validate?.minLength ?? Number.NaN}
                onChange={(v) =>
                  onPatch({
                    validate: {
                      ...field.validate,
                      minLength: Number.isNaN(v) ? undefined : v,
                    },
                  })
                }
              />
              <NumberField
                label="Max. Länge"
                value={field.validate?.maxLength ?? Number.NaN}
                onChange={(v) =>
                  onPatch({
                    validate: {
                      ...field.validate,
                      maxLength: Number.isNaN(v) ? undefined : v,
                    },
                  })
                }
              />
            </div>
          )}

          {field.type === "textfield" && (
            <TextField
              label="Pattern (RegEx)"
              value={field.validate?.pattern ?? ""}
              onChange={(v) =>
                onPatch({ validate: { ...field.validate, pattern: v || undefined } })
              }
            />
          )}

          <TextField
            label="Sichtbar wenn versteckt (conditional.hide)"
            description='FEEL-nah, z. B. role = "user"'
            value={field.conditional?.hide ?? ""}
            onChange={(v) => onPatch({ conditional: { hide: v || undefined } })}
          />

          {optioned && (
            <OptionsEditor
              options={field.values ?? []}
              onChange={(values) => onPatch({ values })}
            />
          )}
        </>
      )}

      <Button variant="tinted" onPress={onDelete} className="prn-fb-delete">
        Feld löschen
      </Button>
    </div>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: FormFieldOption[];
  onChange: (options: FormFieldOption[]) => void;
}) {
  const update = (i: number, patch: Partial<FormFieldOption>) =>
    onChange(options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  return (
    <div className="prn-fb-options">
      <div className="prn-fb-options-head">Optionen</div>
      {options.map((o, i) => (
        <div key={i} className="prn-fb-props-row">
          <TextField
            label="Label"
            value={o.label}
            onChange={(v) => update(i, { label: v })}
          />
          <TextField
            label="Wert"
            value={o.value}
            onChange={(v) => update(i, { value: v })}
          />
          <Button
            variant="plain"
            aria-label="Option entfernen"
            onPress={() => onChange(options.filter((_, idx) => idx !== i))}
          >
            ✕
          </Button>
        </div>
      ))}
      <Button
        variant="tinted"
        onPress={() =>
          onChange([
            ...options,
            { label: `Option ${options.length + 1}`, value: `option${options.length + 1}` },
          ])
        }
      >
        Option hinzufügen
      </Button>
    </div>
  );
}

/* ---------------- Expert (form-js) fallback ---------------- */

function ExpertEditor({
  schema,
  onChange,
}: {
  schema: FormSchema;
  onChange: (schema: FormSchema) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<unknown>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Schema beim Mount einmal übernehmen; spätere Sync über getSchema() bei Save.
  const initialSchema = useRef(schema);

  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el) return;
    setStatus("loading");
    setErrorMsg(null);

    (async () => {
      try {
        // Optionaler Peer — dynamischer Import (Code-Splitting + graceful fallback).
        const mod = (await import(
          /* @vite-ignore */ "@bpmn-io/form-js"
        )) as unknown as {
          FormEditor: new (opts: { container: HTMLElement }) => {
            importSchema: (s: unknown) => Promise<unknown>;
            getSchema: () => FormSchema;
            on: (event: string, cb: () => void) => void;
            destroy: () => void;
            _container?: HTMLElement;
          };
        };
        if (cancelled) return;
        const editor = new mod.FormEditor({ container: el });
        editorRef.current = editor;
        // form-js erzeugt einen internen div.fjs-container ohne Höhe → 100% setzen.
        if (editor._container) {
          editor._container.style.height = "100%";
          editor._container.style.width = "100%";
        }
        await editor.importSchema(initialSchema.current);
        editor.on("changed", () => {
          try {
            onChange(editor.getSchema());
          } catch {
            /* ignore */
          }
        });
        if (!cancelled) setStatus("ready");
      } catch (e) {
        if (!cancelled) {
          setErrorMsg((e as Error)?.message ?? String(e));
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      const editor = editorRef.current as { destroy?: () => void } | null;
      try {
        editor?.destroy?.();
      } catch {
        /* ignore */
      }
      editorRef.current = null;
    };
    // Nur einmal mounten; Schema-Bridge bewusst über initialSchema-Ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="prn-fb-expert">
      {status === "error" && (
        <Notice tone="negative" title="form-js nicht verfügbar">
          Der Experten-Editor (`@bpmn-io/form-js`) konnte nicht geladen werden.
          Stellen Sie sicher, dass das optionale Peer-Paket installiert ist.
          {errorMsg ? ` (${errorMsg})` : ""}
        </Notice>
      )}
      <div
        ref={containerRef}
        className="prn-fb-expert-host"
        data-status={status}
        // form-js Carbon-CSS best effort über --prn-* übertünchen (nicht pixelgleich).
      />
    </div>
  );
}

/* ---------------- utils ---------------- */

function cx(...parts: (string | false | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
