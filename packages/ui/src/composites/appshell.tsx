import { useCallback, useId, useState } from "react";
import type { ReactNode } from "react";
import { cx } from "../utils";
import "./appshell.css";

export interface AppShellProps {
  /** App-Titel in der Shell-Bar. */
  title?: ReactNode;
  /** Marken-/Logo-Slot ganz links (vor dem Titel). */
  logo?: ReactNode;
  /** Globale Suche o. Ä. (mittig in der Shell-Bar). */
  search?: ReactNode;
  /** Aktionen rechts (Buttons/Icons). */
  actions?: ReactNode;
  /** User-/Account-Slot ganz rechts (Avatar/Menu). */
  user?: ReactNode;
  /** Seitennavigation — typischerweise ein `<Sidebar/>` (ohne eigenes `glass`). */
  sidebar?: ReactNode;
  /** Sidebar eingeklappt — kontrolliert. */
  sidebarCollapsed?: boolean;
  /** Start-Einklappzustand — unkontrolliert (Default: ausgeklappt). */
  defaultSidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  /** „Liquid Glass"-Optik auf Shell-Bar + Sidebar (Default: true). */
  glass?: boolean;
  /** Aria-Label des Menü-Toggles. */
  toggleLabel?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * AppShell — Apple-orientierte App-Hülle (vgl. Fiori ShellBar / Carbon UI Shell).
 *
 * Gibt das Grundlayout vor: sticky Shell-Bar (oben), Sidebar (links) und
 * scrollbarer Content (`<main>`). Reine Optik/Layout — kein Routing; der
 * Auswahl-State bleibt bei der übergebenen `Sidebar` (`selectedKey`).
 *
 * Glas (Default an) liegt auf Shell-Bar und Sidebar. Auf schmalen Screens
 * wird die Sidebar zum Off-canvas-Overlay mit Scrim (Toggle öffnet/schließt).
 */
export function AppShell({
  title,
  logo,
  search,
  actions,
  user,
  sidebar,
  sidebarCollapsed,
  defaultSidebarCollapsed = false,
  onSidebarCollapsedChange,
  glass = true,
  toggleLabel = "Navigation umschalten",
  children,
  className,
}: AppShellProps) {
  const isControlled = sidebarCollapsed !== undefined;
  const [internal, setInternal] = useState(defaultSidebarCollapsed);
  const collapsed = isControlled ? sidebarCollapsed : internal;
  const sidebarId = useId();

  const setCollapsed = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternal(next);
      onSidebarCollapsedChange?.(next);
    },
    [isControlled, onSidebarCollapsedChange],
  );

  return (
    <div
      className={cx("prn-appshell", className)}
      data-collapsed={collapsed ? "" : undefined}
    >
      <header className={cx("prn-shellbar", glass && "prn-glass prn-glass-bar")}>
        {sidebar != null && (
          <button
            type="button"
            className="prn-shellbar-toggle"
            aria-label={toggleLabel}
            aria-expanded={!collapsed}
            aria-controls={sidebarId}
            onClick={() => setCollapsed(!collapsed)}
          >
            <span className="prn-shellbar-toggle-icon" aria-hidden>
              ☰
            </span>
          </button>
        )}
        {logo != null && <div className="prn-shellbar-logo">{logo}</div>}
        {title != null && <span className="prn-shellbar-title">{title}</span>}
        {search != null && <div className="prn-shellbar-search">{search}</div>}
        <div className="prn-shellbar-spacer" />
        {actions != null && <div className="prn-shellbar-actions">{actions}</div>}
        {user != null && <div className="prn-shellbar-user">{user}</div>}
      </header>

      <div className="prn-appshell-body">
        {sidebar != null && (
          <>
            <div
              id={sidebarId}
              className={cx("prn-appshell-sidebar", glass && "prn-glass prn-glass-sidebar")}
            >
              {sidebar}
            </div>
            {/* Scrim — nur auf Mobile sichtbar, wenn die Sidebar offen ist. */}
            <div
              className="prn-appshell-scrim"
              onClick={() => setCollapsed(true)}
              aria-hidden
            />
          </>
        )}
        <main className="prn-appshell-content">{children}</main>
      </div>
    </div>
  );
}
