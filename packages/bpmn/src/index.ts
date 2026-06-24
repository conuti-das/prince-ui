import "./styles/base.css";

// --- Foundation (Phase 0) ---
export type {
  ActivityStatus,
  HistoryActivityInstance,
  Incident,
  HistoryVariableInstance,
  BpmnElementClick,
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
// export { BpmnViewer } from "./viewer/BpmnViewer";   // ① Stream A
// export { BpmnEditor } from "./editor/BpmnEditor";   // ② Stream A
