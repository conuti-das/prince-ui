import "./styles/base.css";

// --- Foundation (Phase 0) ---
export type {
  HitPolicy,
  Aggregation,
  DmnColumnKind,
  DmnColumn,
  DmnRow,
  DmnTableModel,
  FeelLintResult,
  DmnCellPlugin,
  DiagramColorScheme,
} from "./types";

export {
  getDiagramColors,
  isDarkMode,
  onThemeChange,
  readToken,
  type DiagramColors,
} from "./theme/diagram-theme";

// --- Model-Layer (Phase 1, Stream B) ---
export {
  parseDmnModel,
  serializeDmnModel,
  listDecisions,
  makeId,
  emptyRow,
  addRow,
  deleteRow,
  moveRow,
  updateCell,
  updateAnnotation,
  setHitPolicy,
  addColumn,
  updateColumn,
  deleteColumn,
  type ParseOptions,
  type DmnDecisionRef,
} from "./model/dmn-model";

export {
  lintFeel,
  parseInputValues,
  type FeelValueType,
  type FeelLintTypedResult,
} from "./model/feel-linter";

// --- Komponenten (Phase 1) ---
export { DmnTableEditor, type DmnTableEditorProps } from "./table/DmnTableEditor"; // ⑤
export { DmnExpertEditor, type DmnExpertEditorProps } from "./expert/DmnExpertEditor"; // ⑥
export { DmnEditor, type DmnEditorProps, type DmnEditorMode } from "./DmnEditor"; // Umschalter
