import { useCallback, useId, useState } from "react";
import type { ReactNode } from "react";
import { cx } from "../utils";
import { Icon } from "../icons/icons";
import { Button } from "../primitives/forms";
import { Menu, MenuItem } from "../primitives/overlays";
import "./appshell.css";

/** Eintrag im Titel-Dropdown (analog UI5 `menuItems`). */
export interface AppShellMenuItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
}

/** Aktions-Item in der Shell-Bar (analog UI5 `ShellBarItem`). */
export interface AppShellItem {
  id: string;
  /** Monochromes Icon (z. B. `<Icon name="bell" />`). */
  icon: ReactNode;
  /** Zugängliches Label (Tooltip/aria-label, Overflow-Text). */
  label: string;
  /** Optionaler Zähler-Badge. */
  count?: ReactNode;
  onClick?: () => void;
}

export interface AppShellProps {
  /** App-Titel (Primärtitel). */
  title?: ReactNode;
  /** Untertitel — blendet auf schmalen Screens aus. */
  subtitle?: ReactNode;
  /** Marken-/Logo-Slot ganz links. */
  logo?: ReactNode;
  onLogoClick?: () => void;
  /** Macht den Titel zu einem Dropdown (analog UI5 `menuItems`). */
  menuItems?: AppShellMenuItem[];
  onMenuItemClick?: (id: string) => void;
  /** Globale Suche; kollabiert auf Mobile zu einem Icon (aufklappbar). */
  search?: ReactNode;
  /** Freie Aktionen rechts (Buttons o. Ä.). */
  actions?: ReactNode;
  /** Aktions-Items mit Icon/Count; wandern auf schmalen Screens ins „…"-Overflow-Menü. */
  items?: AppShellItem[];
  /** Benachrichtigungs-Glocke mit optionalem Zähler. */
  notifications?: boolean;
  notificationsCount?: ReactNode;
  onNotificationsClick?: () => void;
  /** Produkt-Wechsler (Grid-Icon). */
  productSwitch?: boolean;
  onProductSwitchClick?: () => void;
  /** User-/Account-Slot ganz rechts (Avatar). */
  user?: ReactNode;
  onProfileClick?: () => void;
  /** Slot ganz am Anfang der Bar (vor dem Menü-Toggle). */
  startButton?: ReactNode;
  /** Seitennavigation — typischerweise ein `<Sidebar/>` (ohne eigenes `glass`). */
  sidebar?: ReactNode;
  sidebarCollapsed?: boolean;
  defaultSidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  /** „Liquid Glass"-Optik auf Shell-Bar + Sidebar (Default: true). */
  glass?: boolean;
  toggleLabel?: string;
  children?: ReactNode;
  className?: string;
}

/** Icon-Button in der Shell-Bar (kein Menü-Trigger). */
function BarButton({
  label,
  count,
  onClick,
  className,
  children,
}: {
  label: string;
  count?: ReactNode;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cx("prn-shellbar-btn", className)}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
      {count != null && count !== "" && <span className="prn-shellbar-badge">{count}</span>}
    </button>
  );
}

/**
 * AppShell — Apple-orientierte App-Hülle mit voller ShellBar-Funktion
 * (vgl. SAP UI5 ShellBar): Logo, Titel + Untertitel + Titel-Dropdown, Suche
 * (auf Mobile kollabierbar), Aktions-Items mit Overflow, Benachrichtigungen,
 * Produkt-Wechsler, Profil — plus Sidebar (Off-canvas auf Mobile) und Content.
 *
 * Reine Optik/Layout/Komposition; Verhalten von Menüs/Overlays kommt aus den
 * React-Aria-Primitiven (`Menu`). Glas (Default) liegt auf Shell-Bar + Sidebar.
 * Responsives Verhalten über CSS-Breakpoints (Phone ≤767, Tablet ≤1024).
 */
export function AppShell({
  title,
  subtitle,
  logo,
  onLogoClick,
  menuItems,
  onMenuItemClick,
  search,
  actions,
  items,
  notifications,
  notificationsCount,
  onNotificationsClick,
  productSwitch,
  onProductSwitchClick,
  user,
  onProfileClick,
  startButton,
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
  // Auf Phone (≤767px) standardmäßig eingeklappt starten — sonst läge die
  // Off-canvas-Sidebar beim Laden über dem Content. Flash-frei via Lazy-Init.
  const [internal, setInternal] = useState(() => {
    if (defaultSidebarCollapsed) return true;
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 767px)").matches
    ) {
      return true;
    }
    return false;
  });
  const collapsed = isControlled ? sidebarCollapsed : internal;
  const [searchOpen, setSearchOpen] = useState(false);
  const sidebarId = useId();

  const setCollapsed = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternal(next);
      onSidebarCollapsedChange?.(next);
    },
    [isControlled, onSidebarCollapsedChange],
  );

  const hasItems = items != null && items.length > 0;

  const titleNode =
    menuItems != null && menuItems.length > 0 ? (
      <Menu
        trigger={
          <Button variant="plain" className="prn-shellbar-titlebtn">
            <span className="prn-shellbar-title">{title}</span>
            <Icon name="chevron-down" size={16} />
          </Button>
        }
      >
        {menuItems.map((mi) => (
          <MenuItem key={mi.id} onAction={() => onMenuItemClick?.(mi.id)}>
            {mi.icon}
            {mi.label}
          </MenuItem>
        ))}
      </Menu>
    ) : (
      title != null && <span className="prn-shellbar-title">{title}</span>
    );

  return (
    <div
      className={cx("prn-appshell", className)}
      data-collapsed={collapsed ? "" : undefined}
      data-search-open={searchOpen ? "" : undefined}
    >
      <header className={cx("prn-shellbar", glass && "prn-glass prn-glass-bar")}>
        {startButton}
        {sidebar != null && (
          <button
            type="button"
            className="prn-shellbar-toggle"
            aria-label={toggleLabel}
            aria-expanded={!collapsed}
            aria-controls={sidebarId}
            onClick={() => setCollapsed(!collapsed)}
          >
            <Icon name="menu" size={20} />
          </button>
        )}
        {logo != null &&
          (onLogoClick ? (
            <button type="button" className="prn-shellbar-logo prn-shellbar-logobtn" aria-label="Startseite" onClick={onLogoClick}>
              {logo}
            </button>
          ) : (
            <div className="prn-shellbar-logo">{logo}</div>
          ))}

        <div className="prn-shellbar-titles">
          {titleNode}
          {subtitle != null && <span className="prn-shellbar-subtitle">{subtitle}</span>}
        </div>

        {search != null && <div className="prn-shellbar-search">{search}</div>}

        <div className="prn-shellbar-spacer" />

        {hasItems && (
          <>
            <div className="prn-shellbar-items">
              {items!.map((it) => (
                <BarButton key={it.id} label={it.label} count={it.count} onClick={it.onClick}>
                  {it.icon}
                </BarButton>
              ))}
            </div>
            <div className="prn-shellbar-overflow">
              <Menu
                trigger={
                  <Button variant="plain" className="prn-shellbar-btn" aria-label="Weitere Aktionen">
                    <Icon name="more" size={20} />
                  </Button>
                }
              >
                {items!.map((it) => (
                  <MenuItem key={it.id} onAction={it.onClick}>
                    {it.icon}
                    {it.label}
                    {it.count != null && it.count !== "" ? ` (${it.count})` : ""}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          </>
        )}

        {search != null && (
          <button
            type="button"
            className="prn-shellbar-searchtoggle"
            aria-label="Suche umschalten"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((o) => !o)}
          >
            <Icon name={searchOpen ? "x" : "search"} size={20} />
          </button>
        )}

        {notifications && (
          <BarButton label="Benachrichtigungen" count={notificationsCount} onClick={onNotificationsClick}>
            <Icon name="bell" size={20} />
          </BarButton>
        )}
        {productSwitch && (
          <BarButton label="Produkte" className="prn-shellbar-productswitch" onClick={onProductSwitchClick}>
            <Icon name="grid" size={20} />
          </BarButton>
        )}

        {user != null &&
          (onProfileClick ? (
            <button type="button" className="prn-shellbar-user prn-shellbar-userbtn" aria-label="Konto" onClick={onProfileClick}>
              {user}
            </button>
          ) : (
            <div className="prn-shellbar-user">{user}</div>
          ))}

        {actions != null && <div className="prn-shellbar-actions">{actions}</div>}
      </header>

      {/* Mobile: aufgeklappte Suche als volle Zeile unter der Bar (nur wenn offen). */}
      {search != null && searchOpen && <div className="prn-shellbar-searchrow">{search}</div>}

      <div className="prn-appshell-body">
        {sidebar != null && (
          <>
            <div
              id={sidebarId}
              className={cx("prn-appshell-sidebar", glass && "prn-glass prn-glass-sidebar")}
            >
              {sidebar}
            </div>
            <div className="prn-appshell-scrim" onClick={() => setCollapsed(true)} aria-hidden />
          </>
        )}
        <main className="prn-appshell-content">{children}</main>
      </div>
    </div>
  );
}
