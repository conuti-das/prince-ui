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

// --- ① BpmnViewer (Stream A) ---
export { BpmnViewer, default as BpmnViewerDefault } from "./viewer/BpmnViewer";
export type { BpmnViewerProps } from "./viewer/BpmnViewer";
export {
  computeElementStatuses,
  computeExecutedFlows,
  buildActivityMap,
  matchActivity,
  deriveStatus,
  STATUS_TOKEN,
  STATUS_LABEL,
  type ElementStatusEntry,
} from "./viewer/status";

// --- ② BpmnEditor (Stream A) ---
export { BpmnEditor, default as BpmnEditorDefault } from "./editor/BpmnEditor";
export type { BpmnEditorProps } from "./editor/BpmnEditor";
export type { LintIssue, LintRuleConfig } from "./editor/lintConfig";
export { lintHint, type LintHint } from "./editor/lintHints";
export { BpmnTableView, type BpmnTableViewProps } from "./editor/BpmnTableView";
