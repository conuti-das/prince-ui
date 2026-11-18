import { useId, useState, type ReactNode } from "react";
import { Button } from "../primitives/forms";
import { Icon } from "../icons/icons";
import { cx } from "../utils";
import "./listreport.css";

/* ---------------- ListReportPage ----------------
 * Seitenfloorplan für Listen und Dashboards (Parität zur DynamicPage aus SAP Fiori):
 *  - Titelzeile: Krumen, Titel (Überschrift), Inhalt neben dem Titel (z. B. Zähler, Badge), Untertitel, Aktionen
 *  - Kopfbereich (`header`, typisch die FilterBar), optional einklappbar
 *  - Inhalt (`children`: Reiter, Sammelleiste, Tabelle)
 *  - Fußleiste (`footer`), klebt unten, nur wenn gesetzt
 * Die Seite rollt im umgebenden Container; `stickyTitle` hält Titel und Kopf beim Rollen oben. */

export interface ListReportPageLabels {
  /** Knopf zum Einklappen des Kopfbereichs. Default „Kopfbereich ausblenden“. */
  collapseHeader?: string;
  /** Knopf zum Aufklappen. Default „Kopfbereich einblenden“. */
  expandHeader?: string;
}

export interface ListReportPageProps {
  title: ReactNode;
  /** Ebene der Überschrift. Default 1. */
  titleLevel?: 1 | 2;
  /** Neben dem Titel (Zähler, Badge, Zustand). */
  titleContent?: ReactNode;
  subtitle?: ReactNode;
  /** Krumen über dem Titel. */
  breadcrumbs?: ReactNode;
  /** Aktionen rechts in der Titelzeile; brechen auf schmalen Breiten unter den Titel. */
  actions?: ReactNode;
  /** Kopfbereich unter dem Titel (FilterBar, Kennzahlen). */
  header?: ReactNode;
  /** Kopfbereich über einen Knopf ein- und ausklappbar. */
  headerCollapsible?: boolean;
  /** Kopfbereich sichtbar (gesteuert). */
  headerExpanded?: boolean;
  /** Anfangszustand (ungesteuert). Default `true`. */
  defaultHeaderExpanded?: boolean;
  onHeaderExpandedChange?: (expanded: boolean) => void;
  /** Fußleiste mit Aktionen (z. B. Speichern, Erledigen), klebt am unteren Rand. */
  footer?: ReactNode;
  /** Titel und Kopf kleben beim Rollen oben. */
  stickyTitle?: boolean;
  labels?: ListReportPageLabels;
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function ListReportPage({
  title,
  titleLevel = 1,
  titleContent,
  subtitle,
  breadcrumbs,
  actions,
  header,
  headerCollapsible = false,
  headerExpanded,
  defaultHeaderExpanded = true,
  onHeaderExpandedChange,
  footer,
  stickyTitle = false,
  labels,
  children,
  className,
  "data-testid": testId,
}: ListReportPageProps) {
  const [intern, setIntern] = useState(defaultHeaderExpanded);
  const offen = !headerCollapsible || (headerExpanded ?? intern);
  const kopfId = useId();
  const H = titleLevel === 2 ? "h2" : "h1";
  const umschalten = () => {
    if (headerExpanded === undefined) setIntern(!offen);
    onHeaderExpandedChange?.(!offen);
  };
  return (
    <div className={cx("prn-listreport", className)} data-testid={testId} data-sticky={stickyTitle || undefined}>
      <div className="prn-listreport-top">
        {breadcrumbs != null && <div className="prn-listreport-breadcrumbs">{breadcrumbs}</div>}
        <div className="prn-listreport-titlebar">
          <div className="prn-listreport-titles">
            <div className="prn-listreport-titleline">
              <H className="prn-listreport-title">{title}</H>
              {titleContent}
            </div>
            {subtitle != null && <div className="prn-listreport-subtitle">{subtitle}</div>}
          </div>
          {(actions != null || (headerCollapsible && header != null)) && (
            <div className="prn-listreport-actions">
              {actions}
              {headerCollapsible && header != null && (
                <Button
                  variant="plain"
                  className="prn-listreport-headertoggle"
                  aria-expanded={offen}
                  aria-controls={kopfId}
                  aria-label={offen ? labels?.collapseHeader ?? "Kopfbereich ausblenden" : labels?.expandHeader ?? "Kopfbereich einblenden"}
                  onPress={umschalten}
                >
                  <Icon name={offen ? "chevron-up" : "chevron-down"} size={18} />
                </Button>
              )}
            </div>
          )}
        </div>
        {header != null && (
          <div id={kopfId} className="prn-listreport-header" hidden={!offen}>
            {header}
          </div>
        )}
      </div>
      <div className="prn-listreport-content">{children}</div>
      {footer != null && <div className="prn-listreport-footer" role="toolbar">{footer}</div>}
    </div>
  );
}
