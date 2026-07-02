/**
 * ⑤ DmnTableEditor — einstiegsfreundliche Entscheidungstabelle auf prince-ui
 * `AnalyticalTable` mit Inline-Edit, Spaltenverwaltung, FEEL-Editor (Modal,
 * Live-Lint) und verlustfreier dmn-moddle-Serialisierung.
 *
 * Persistenz nur über Callbacks (`value`/`defaultValue` (XML) + `onChange` +
 * `onSave(xml)`). Domänen-Erweiterungen (z. B. Prüfi-Autocomplete) über den
 * optionalen `cellPlugins`-Slot — Default ohne MaCo-Abhängigkeit.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AnalyticalTable,
  type AnalyticalColumn,
  Button,
  Select,
  SelectItem,
  TextField,
  Modal,
  PrinceSizeProvider,
} from "@conuti-das/prince-ui";
import type {
  Aggregation,
  DmnCellPlugin,
  DmnColumn,
  DmnRow,
  DmnTableModel,
  HitPolicy,
} from "../types";
import {
  parseDmnModel,
  serializeDmnModel,
  addColumn as addColumnOp,
  addRow as addRowOp,
  deleteColumn as deleteColumnOp,
  deleteRow as deleteRowOp,
  moveRow as moveRowOp,
  setHitPolicy as setHitPolicyOp,
  updateAnnotation as updateAnnotationOp,
  updateCell as updateCellOp,
  updateColumn as updateColumnOp,
} from "../model/dmn-model";
import { lintFeel, type FeelLintTypedResult } from "../model/feel-linter";
import "./DmnTableEditor.css";

const HIT_POLICIES: HitPolicy[] = [
  "UNIQUE",
  "FIRST",
  "PRIORITY",
  "ANY",
  "COLLECT",
  "RULE ORDER",
  "OUTPUT ORDER",
];
const AGGREGATIONS: Aggregation[] = ["SUM", "MIN", "MAX", "COUNT"];
const TYPE_REFS = ["string", "number", "boolean", "date"];

const FEEL_SNIPPETS = [
  'not("X")',
  "[1..100]",
  '>= 0',
  '"Ja","Nein"',
  'date("2026-01-01")',
];

export interface DmnTableEditorProps {
  /** Controlled DMN-XML. */
  value?: string;
  /** Uncontrolled Start-XML. */
  defaultValue?: string;
  /** Wird bei jeder Modelländerung mit serialisiertem XML aufgerufen. */
  onChange?: (xml: string) => void;
  /** ⌘S / Speichern-Button. */
  onSave?: (xml: string) => void | Promise<void>;
  /** Wählt die zu editierende Decision (Default: erste mit Table). */
  decisionId?: string;
  /** Anzeigename (z. B. Prüfprozess-Code). */
  title?: ReactNode;
  /** Untertitel/Metadaten. */
  subtitle?: ReactNode;
  /** Umschalten zum Experten-Modus (⑥). */
  onSwitchToExpert?: () => void;
  /** Optionale Zell-Plugins (z. B. Prüfi-Autocomplete). Default: leer. */
  cellPlugins?: DmnCellPlugin[];
  /** Zusätzliche Toolbar-Actions (z. B. KI-Fix). */
  actionsSlot?: ReactNode;
  /** Schreibschutz. */
  readOnly?: boolean;
  className?: string;
}

interface EditingCell {
  rowId: string;
  colId: string;
}

interface FeelState {
  rowId: string;
  colId: string;
  column: DmnColumn;
  value: string;
}

interface RowView {
  row: DmnRow;
  index: number;
}

/* ------------------------------------------------------------------ */

export function DmnTableEditor({
  value,
  defaultValue,
  onChange,
  onSave,
  decisionId,
  title,
  subtitle,
  onSwitchToExpert,
  cellPlugins = [],
  actionsSlot,
  readOnly = false,
  className,
}: DmnTableEditorProps) {
  const isControlled = value !== undefined;
  const sourceXml = isControlled ? value : defaultValue;

  const [model, setModel] = useState<DmnTableModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingCell | null>(null);
  const [feel, setFeel] = useState<FeelState | null>(null);
  const [columnDialog, setColumnDialog] = useState<string | null>(null);
  const [addColumnDialog, setAddColumnDialog] = useState<DmnColumn["kind"] | null>(
    null,
  );

  // Original-XML für verlustfreie Serialisierung (bewahrt andere Decisions/DI).
  const originalXmlRef = useRef<string | undefined>(sourceXml);

  /* --- Parse Source -> Model --- */
  useEffect(() => {
    let cancelled = false;
    if (!sourceXml) {
      setModel(null);
      setError(null);
      return;
    }
    originalXmlRef.current = sourceXml;
    parseDmnModel(sourceXml, decisionId ? { decisionId } : {})
      .then((m) => {
        if (!cancelled) {
          setModel(m);
          setError(null);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message);
          setModel(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [sourceXml, decisionId]);

  /* --- Modelländerung -> onChange(xml) --- */
  const commitModel = useCallback(
    (next: DmnTableModel) => {
      setModel(next);
      if (onChange) {
        void serializeDmnModel(next, originalXmlRef.current).then((xml) => {
          // Folge-Schreiboperationen behalten dasselbe Originaldokument.
          originalXmlRef.current = xml;
          onChange(xml);
        });
      }
    },
    [onChange],
  );

  /* --- Lint --- */
  const lintMap = useMemo(() => {
    const map: Record<string, FeelLintTypedResult> = {};
    if (!model) return map;
    for (const row of model.rows) {
      for (const col of model.columns) {
        map[`${row.id}:${col.id}`] = lintFeel(row.cells[col.id] ?? "", col);
      }
    }
    return map;
  }, [model]);

  const errorCount = useMemo(
    () => Object.values(lintMap).filter((r) => !r.valid).length,
    [lintMap],
  );

  /* --- Save --- */
  const handleSave = useCallback(async () => {
    if (!model || !onSave || readOnly) return;
    setSaving(true);
    try {
      const xml = await serializeDmnModel(model, originalXmlRef.current);
      originalXmlRef.current = xml;
      await onSave(xml);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }, [model, onSave, readOnly]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  /* --- Cell-Ops --- */
  const setCell = useCallback(
    (rowId: string, colId: string, val: string) => {
      if (!model) return;
      commitModel(updateCellOp(model, rowId, colId, val));
    },
    [model, commitModel],
  );

  const findPlugin = useCallback(
    (col: DmnColumn) => cellPlugins.find((p) => p.matches(col)),
    [cellPlugins],
  );

  /* --- Spalten als AnalyticalTable-Columns --- */
  const columns = useMemo<AnalyticalColumn<RowView>[]>(() => {
    if (!model) return [];
    const idxCol: AnalyticalColumn<RowView> = {
      id: "__index",
      header: "#",
      width: "44px",
      align: "end",
      sortable: false,
      cellRender: ({ index }) => <span className="prn-dmn-index">{index + 1}</span>,
    };

    const dataCols: AnalyticalColumn<RowView>[] = model.columns.map((col) => ({
      id: col.id,
      sortable: false,
      header: (
        <ColumnHeader
          column={col}
          readOnly={readOnly}
          onEdit={() => setColumnDialog(col.id)}
          onRename={(label) => commitModel(updateColumnOp(model, col.id, { label }))}
        />
      ),
      cellRender: ({ row }) => {
        const cellVal = row.cells[col.id] ?? "";
        const lint = lintMap[`${row.id}:${col.id}`];
        const isEditing =
          editing?.rowId === row.id && editing?.colId === col.id;
        const plugin = findPlugin(col);

        if (isEditing && !readOnly) {
          if (plugin) {
            return plugin.renderEditor({
              value: cellVal,
              onChange: (next) => setCell(row.id, col.id, next),
              onCommit: () => setEditing(null),
              onCancel: () => setEditing(null),
              column: col,
            });
          }
          return (
            <InlineInput
              value={cellVal}
              onCommit={(v) => {
                setCell(row.id, col.id, v);
                setEditing(null);
              }}
              onCancel={() => setEditing(null)}
            />
          );
        }

        return (
          <div
            className="prn-dmn-cell"
            data-invalid={lint && !lint.valid ? "true" : undefined}
            title={lint && !lint.valid ? lint.message : undefined}
            onClick={() => {
              if (!readOnly) setEditing({ rowId: row.id, colId: col.id });
            }}
            onDoubleClick={() => {
              if (!readOnly)
                setFeel({
                  rowId: row.id,
                  colId: col.id,
                  column: col,
                  value: cellVal,
                });
            }}
          >
            {cellVal ? (
              <span>{cellVal}</span>
            ) : (
              <span className="prn-dmn-cell__empty">–</span>
            )}
            {lint && !lint.valid && <span className="prn-dmn-cell__warn">⚠</span>}
          </div>
        );
      },
    }));

    const annotationCol: AnalyticalColumn<RowView> = {
      id: "__annotation",
      header: "Annotation",
      sortable: false,
      minWidth: 140,
      cellRender: ({ row }) => {
        const isEditing =
          editing?.rowId === row.id && editing?.colId === "__annotation";
        if (isEditing && !readOnly) {
          return (
            <InlineInput
              value={row.annotation ?? ""}
              onCommit={(v) => {
                if (model) commitModel(updateAnnotationOp(model, row.id, v));
                setEditing(null);
              }}
              onCancel={() => setEditing(null)}
            />
          );
        }
        return (
          <div
            className="prn-dmn-cell"
            onClick={() => {
              if (!readOnly)
                setEditing({ rowId: row.id, colId: "__annotation" });
            }}
          >
            {row.annotation ? (
              <span>{row.annotation}</span>
            ) : (
              <span className="prn-dmn-cell__empty">–</span>
            )}
          </div>
        );
      },
    };

    return [idxCol, ...dataCols, annotationCol];
    // setColumnDialog ist stabil (useState-Setter); model/lint/editing treiben.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, lintMap, editing, readOnly, findPlugin, setCell, commitModel]);

  const rowsView = useMemo<RowView[]>(
    () => (model ? model.rows.map((row, index) => ({ row, index })) : []),
    [model],
  );

  /* --- Render --- */
  if (error) {
    return (
      <div className={cls("prn-dmn-table", className)}>
        <div className="prn-dmn-lint" data-tone="negative">
          Fehler: {error}
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className={cls("prn-dmn-table", className)}>
        <div className="prn-dmn-lint">Kein DMN-Dokument geladen.</div>
      </div>
    );
  }

  return (
    <PrinceSizeProvider size="s">
    <div className={cls("prn-dmn-table", className)} data-prn-dmn-table>
      {/* Toolbar */}
      <div className="prn-dmn-toolbar">
        <div className="prn-dmn-title">
          {title && <span className="prn-dmn-title__name">{title}</span>}
          {subtitle && <span className="prn-dmn-title__meta">{subtitle}</span>}
          {!title && (
            <InlineEditableText
              className="prn-dmn-title__name"
              value={model.name || model.id}
              readOnly={readOnly}
              ariaLabel="Decision-Name bearbeiten"
              onCommit={(v) => commitModel({ ...model, name: v })}
            />
          )}
        </div>

        <div className="prn-dmn-toolbar-group">
          <Select
            aria-label="Hit-Policy"
            selectedKey={model.hitPolicy}
            isDisabled={readOnly}
            onSelectionChange={(key) =>
              commitModel(
                setHitPolicyOp(model, key as HitPolicy, model.aggregation),
              )
            }
          >
            {HIT_POLICIES.map((p) => (
              <SelectItem key={p} id={p} textValue={p}>
                {p}
              </SelectItem>
            ))}
          </Select>
          {model.hitPolicy === "COLLECT" && (
            <Select
              aria-label="Aggregation"
              selectedKey={model.aggregation ?? "SUM"}
              isDisabled={readOnly}
              onSelectionChange={(key) =>
                commitModel(
                  setHitPolicyOp(model, "COLLECT", key as Aggregation),
                )
              }
            >
              {AGGREGATIONS.map((a) => (
                <SelectItem key={a} id={a} textValue={a}>
                  {a}
                </SelectItem>
              ))}
            </Select>
          )}
        </div>

        <span className="prn-dmn-spacer" />

        <div className="prn-dmn-toolbar-group">
          {actionsSlot}
          {onSwitchToExpert && (
            <Button variant="plain" onPress={onSwitchToExpert}>
              Experte
            </Button>
          )}
          {onSave && (
            <Button
              variant="filled"
              isDisabled={saving || readOnly}
              onPress={() => void handleSave()}
            >
              {saving ? "Speichern…" : "Speichern"}
            </Button>
          )}
        </div>
      </div>

      {/* Lint-Banner */}
      <div
        className="prn-dmn-lint"
        data-tone={errorCount === 0 ? "positive" : "negative"}
        role="status"
      >
        {errorCount === 0
          ? `✓ Alle ${model.rows.length} Regeln valide`
          : `⚠ ${errorCount} ungültige Zelle(n)`}
      </div>

      {/* Sub-Toolbar: Spalten & Regeln */}
      {!readOnly && (
        <div className="prn-dmn-toolbar prn-dmn-toolbar--sub">
          <span className="prn-dmn-title__meta">
            Regeln ({model.rows.length})
          </span>
          <span className="prn-dmn-spacer" />
          <div className="prn-dmn-toolbar-group">
            <Button variant="plain" onPress={() => setAddColumnDialog("input")}>
              + Input
            </Button>
            <Button variant="plain" onPress={() => setAddColumnDialog("output")}>
              + Output
            </Button>
            <Button variant="tinted" onPress={() => commitModel(addRowOp(model))}>
              + Zeile
            </Button>
            <Button
              variant="plain"
              isDisabled={!selectedRowId}
              onPress={() => {
                if (selectedRowId) {
                  commitModel(moveRowOp(model, selectedRowId, -1));
                }
              }}
            >
              ↑
            </Button>
            <Button
              variant="plain"
              isDisabled={!selectedRowId}
              onPress={() => {
                if (selectedRowId) {
                  commitModel(moveRowOp(model, selectedRowId, 1));
                }
              }}
            >
              ↓
            </Button>
            <Button
              variant="plain"
              isDisabled={!selectedRowId}
              onPress={() => {
                if (selectedRowId) {
                  commitModel(deleteRowOp(model, selectedRowId));
                  setSelectedRowId(null);
                }
              }}
            >
              Zeile löschen
            </Button>
          </div>
        </div>
      )}

      {/* Tabelle */}
      <div className="prn-dmn-table__body">
        <AnalyticalTable<RowView>
          data={rowsView}
          columns={columns}
          getRowId={(r) => r.row.id}
          selectionMode={readOnly ? "none" : "single"}
          selectionBehavior="rowSelector"
          selectedKeys={new Set(selectedRowId ? [selectedRowId] : [])}
          onSelectionChange={(keys) => {
            const arr = Array.from(keys as Set<string>);
            setSelectedRowId(arr[0] ?? null);
          }}
        />
      </div>

      {/* FEEL-Editor-Modal */}
      {feel && (
        <Modal
          isOpen
          title={`FEEL — ${feel.column.label || feel.column.expression}`}
          onOpenChange={(open) => {
            if (!open) setFeel(null);
          }}
        >
          <FeelEditor
            initial={feel.value}
            column={feel.column}
            onCancel={() => setFeel(null)}
            onApply={(v) => {
              setCell(feel.rowId, feel.colId, v);
              setFeel(null);
            }}
          />
        </Modal>
      )}

      {/* Spalte-bearbeiten-Modal */}
      {columnDialog && (
        <ColumnDialog
          column={model.columns.find((c) => c.id === columnDialog)!}
          onClose={() => setColumnDialog(null)}
          onApply={(patch) => {
            commitModel(updateColumnOp(model, columnDialog, patch));
            setColumnDialog(null);
          }}
          onDelete={() => {
            commitModel(deleteColumnOp(model, columnDialog));
            setColumnDialog(null);
          }}
        />
      )}

      {/* Spalte-hinzufügen-Modal */}
      {addColumnDialog && (
        <ColumnDialog
          kind={addColumnDialog}
          onClose={() => setAddColumnDialog(null)}
          onApply={(patch) => {
            commitModel(addColumnOp(model, addColumnDialog, patch));
            setAddColumnDialog(null);
          }}
        />
      )}
    </div>
    </PrinceSizeProvider>
  );
}

/* ------------------------------------------------------------------ *
 * Subkomponenten                                                     *
 * ------------------------------------------------------------------ */

function ColumnHeader({
  column,
  readOnly,
  onEdit,
  onRename,
}: {
  column: DmnColumn;
  readOnly: boolean;
  onEdit: () => void;
  onRename: (label: string) => void;
}) {
  return (
    <div className="prn-dmn-colhead" data-kind={column.kind}>
      <div className="prn-dmn-colhead__top">
        <span className="prn-dmn-colhead__kind">
          {column.kind === "input" ? "Input" : "Output"} · {column.typeRef}
        </span>
        {!readOnly && (
          <Button
            className="prn-dmn-colhead__edit"
            variant="plain"
            onPress={onEdit}
            aria-label="Spalte bearbeiten"
          >
            ⚙
          </Button>
        )}
      </div>
      <InlineEditableText
        className="prn-dmn-colhead__label"
        value={column.label || column.expression}
        readOnly={readOnly}
        ariaLabel="Spaltentitel bearbeiten"
        onCommit={onRename}
      />
      {column.label && column.expression && column.label !== column.expression && (
        <span className="prn-dmn-colhead__expr">{column.expression}</span>
      )}
    </div>
  );
}

function InlineInput({
  value,
  onCommit,
  onCancel,
}: {
  value: string;
  onCommit: (v: string) => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  const committed = useRef(false);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  const commit = () => {
    if (committed.current) return;
    committed.current = true;
    onCommit(v);
  };
  return (
    <input
      ref={ref}
      className="prn-dmn-cell__input"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          commit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          committed.current = true;
          onCancel();
        }
      }}
    />
  );
}

function FeelEditor({
  initial,
  column,
  onApply,
  onCancel,
}: {
  initial: string;
  column: DmnColumn;
  onApply: (v: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(initial);
  const lint = lintFeel(text, column);
  return (
    <div className="prn-dmn-feel">
      <textarea
        autoFocus
        className="prn-dmn-feel__editor"
        data-valid={lint.valid ? "true" : "false"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && lint.valid) {
            onApply(text);
          }
          if (e.key === "Escape") onCancel();
        }}
      />
      <div className="prn-dmn-feel__status" data-valid={lint.valid ? "true" : "false"}>
        <span>{lint.valid ? "✓ Valide" : "✗ Ungültig"}</span>
        {lint.message && <span>{lint.message}</span>}
        {lint.type && <span className="prn-dmn-feel__type">{lint.type}</span>}
      </div>
      <div className="prn-dmn-feel__snippets">
        {FEEL_SNIPPETS.map((s) => (
          <Button key={s} variant="plain" onPress={() => setText(s)}>
            {s}
          </Button>
        ))}
      </div>
      {column.inputValues && column.inputValues.length > 0 && (
        <div className="prn-dmn-feel__hint">
          Erlaubte Werte:{" "}
          <code>{column.inputValues.map((v) => `"${v}"`).join(", ")}</code>
        </div>
      )}
      <div className="prn-dmn-feel__footer">
        <Button variant="plain" onPress={onCancel}>
          Abbrechen
        </Button>
        <Button variant="filled" isDisabled={!lint.valid} onPress={() => onApply(text)}>
          Übernehmen
        </Button>
      </div>
    </div>
  );
}

function ColumnDialog({
  column,
  kind,
  onApply,
  onDelete,
  onClose,
}: {
  column?: DmnColumn;
  kind?: DmnColumn["kind"];
  onApply: (patch: Partial<Omit<DmnColumn, "id" | "kind">>) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState(column?.label ?? "");
  const [expression, setExpression] = useState(column?.expression ?? "");
  const [typeRef, setTypeRef] = useState(column?.typeRef ?? "string");
  const [inputValues, setInputValues] = useState(
    (column?.inputValues ?? []).join(", "),
  );
  const effectiveKind = column?.kind ?? kind ?? "input";

  return (
    <Modal
      isOpen
      title={column ? "Spalte bearbeiten" : `Neue ${effectiveKind === "input" ? "Input" : "Output"}-Spalte`}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <div className="prn-dmn-feel prn-dmn-feel--dialog">
        <TextField label="Label" value={label} onChange={setLabel} />
        <TextField
          label={effectiveKind === "input" ? "FEEL-Expression" : "Output-Name"}
          value={expression}
          onChange={setExpression}
        />
        <Select
          label="Typ"
          selectedKey={typeRef}
          onSelectionChange={(k) => setTypeRef(String(k))}
        >
          {TYPE_REFS.map((t) => (
            <SelectItem key={t} id={t} textValue={t}>
              {t}
            </SelectItem>
          ))}
        </Select>
        <TextField
          label="Erlaubte Werte (kommagetrennt)"
          value={inputValues}
          onChange={setInputValues}
          description='z. B. Ja, Nein'
        />
        <div className="prn-dmn-feel__footer">
          {onDelete && (
            <Button variant="plain" onPress={onDelete}>
              Löschen
            </Button>
          )}
          <Button variant="plain" onPress={onClose}>
            Abbrechen
          </Button>
          <Button
            variant="filled"
            onPress={() =>
              onApply({
                label,
                expression,
                typeRef,
                inputValues: inputValues
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean),
              })
            }
          >
            {column ? "Speichern" : "Anlegen"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** Inline editierbarer Text (Klick → Input), wie der dmn-js-Experten-Editor
 *  seine Header/Namen editiert. Enter/Blur speichert, Escape verwirft. */
function InlineEditableText({
  value,
  onCommit,
  readOnly,
  className,
  ariaLabel,
}: {
  value: string;
  onCommit: (v: string) => void;
  readOnly?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (editing) {
      ref.current?.focus();
      ref.current?.select();
    }
  }, [editing]);
  if (readOnly) return <span className={className}>{value}</span>;
  if (editing) {
    return (
      <input
        ref={ref}
        className={cls(className, "prn-dmn-inline-edit")}
        value={draft}
        aria-label={ariaLabel}
        onChange={(e) => setDraft(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onBlur={() => {
          setEditing(false);
          if (draft !== value) onCommit(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          } else if (e.key === "Escape") {
            e.preventDefault();
            setDraft(value);
            setEditing(false);
          }
        }}
      />
    );
  }
  return (
    <button
      type="button"
      className={cls(className, "prn-dmn-inline-trigger")}
      title="Zum Bearbeiten klicken"
      onClick={(e) => {
        e.stopPropagation();
        setDraft(value);
        setEditing(true);
      }}
    >
      {value}
    </button>
  );
}

function cls(...parts: (string | undefined | false)[]): string {
  return parts.filter(Boolean).join(" ");
}
