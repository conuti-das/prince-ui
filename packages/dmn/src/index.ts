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

// --- Komponenten (Phase 1) ---
// export { DmnTableEditor } from "./table/DmnTableEditor";    // ⑤ Stream B
// export { DmnExpertEditor } from "./expert/DmnExpertEditor"; // ⑥ Stream B
// export { DmnEditor } from "./DmnEditor";                    // Umschalter
// export { parseDmnModel, serializeDmnModel } from "./model/dmn-model";
// export { lintFeel } from "./model/feel-linter";
