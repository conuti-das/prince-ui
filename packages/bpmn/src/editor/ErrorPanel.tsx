/**
 * Validierungs-/Fehler-Panel (prince-ui). Listet bpmnlint-Befunde mit
 * kuratierten Hinweisen; Klick auf den Element-Link selektiert das Element,
 * optionaler KI-Fix-Button. Portiert aus maco `BpmnEditor/ErrorPanel.tsx`.
 */
import type { ReactNode } from "react";
import { Button, Link } from "@conuti-das/prince-ui";
import { lintHint } from "./lintHints";
import type { LintIssue } from "./lintConfig";
import "./editor.css";

export interface ErrorPanelProps {
  issues: LintIssue[];
  /** Auflösung Element-ID → Anzeigename. */
  elementName: (elementId: string | undefined) => string;
  onSelectElement: (elementId: string) => void;
  /** Optionaler KI-Fix (z. B. Prompt an einen Agenten). */
  onKiFix?: () => void;
  onClose: () => void;
  /** Optionale zusätzliche Aktionen (App-Slot), rechts neben KI-Fix. */
  actionsSlot?: ReactNode;
}

export function ErrorPanel({
  issues,
  elementName,
  onSelectElement,
  onKiFix,
  onClose,
  actionsSlot,
}: ErrorPanelProps) {
  return (
    <div className="prn-bpmn-errorpanel" role="region" aria-label="Validierung">
      <div className="prn-bpmn-errorpanel-head">
        <strong>Validierung — {issues.length} Befund(e)</strong>
        <div className="prn-bpmn-errorpanel-actions">
          {actionsSlot}
          {onKiFix && (
            <Button variant="tinted" onPress={onKiFix} data-testid="ki-fix-all">
              KI-Fix
            </Button>
          )}
          <Button variant="plain" aria-label="Schließen" onPress={onClose}>
            ✕
          </Button>
        </div>
      </div>
      <ul className="prn-bpmn-errorpanel-list">
        {issues.map((issue, idx) => {
          const hint = lintHint(issue.id);
          const name = elementName(issue.element);
          return (
            <li
              key={`${issue.id}-${issue.element}-${idx}`}
              className="prn-bpmn-errorpanel-item"
              data-category={issue.category}
            >
              <div className="prn-bpmn-errorpanel-title">
                <span className="prn-bpmn-errorpanel-icon" aria-hidden>
                  {issue.category === "error" ? "✕" : "⚠"}
                </span>
                <span>{hint.title}</span>
                {issue.element && (
                  <Link onPress={() => onSelectElement(issue.element as string)}>{name}</Link>
                )}
              </div>
              <p className="prn-bpmn-muted prn-bpmn-errorpanel-text">{hint.explanation}</p>
              <p className="prn-bpmn-errorpanel-text">➜ {hint.howto}</p>
              <p className="prn-bpmn-muted prn-bpmn-errorpanel-meta">
                {issue.message} ({issue.id})
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ErrorPanel;
