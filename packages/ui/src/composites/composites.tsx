import type { ReactNode } from "react";
import { Button as RACButton } from "react-aria-components";
import { cx } from "../utils";
import "./composites.css";

/* ============================================================
 * L2-Komposita — Prince-Look. Aufbauend auf Tokens + L1-Primitives.
 * Tokens: prince-ui-tokens (immer var(--prn-*), nie Hex/rgb).
 * ============================================================ */

/* ---------------- Card ---------------- */

export interface CardProps {
  /** Optionaler Titel oben links (alternativ via `header` voll überschreibbar). */
  title?: ReactNode;
  /** Freier Header-Slot rechts (z. B. Aktionen) — neben dem Titel. */
  header?: ReactNode;
  /** Innenabstand-Variante. */
  padding?: "none" | "compact" | "regular" | "spacious";
  children?: ReactNode;
  className?: string;
}

export function Card({ title, header, padding = "regular", children, className }: CardProps) {
  const hasHeader = title != null || header != null;
  return (
    <section className={cx("prn-card", className)} data-padding={padding}>
      {hasHeader && (
        <header className="prn-card-head">
          {title != null && <h3 className="prn-card-title">{title}</h3>}
          {header != null && <div className="prn-card-head-slot">{header}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

/* ---------------- KpiCard ---------------- */

export type Trend = "up" | "down" | "flat";

export interface KpiCardProps {
  label: ReactNode;
  value: ReactNode;
  /** Delta-Text, z. B. "+12 %". */
  delta?: ReactNode;
  /** Richtung der Färbung. Wird `delta` ohne `trend` gesetzt, bleibt es neutral. */
  trend?: Trend;
  /** Optionales Leading-Icon (z. B. SVG/Emoji). */
  icon?: ReactNode;
  className?: string;
}

const TREND_GLYPH: Record<Trend, string> = { up: "↑", down: "↓", flat: "→" };

export function KpiCard({ label, value, delta, trend, icon, className }: KpiCardProps) {
  return (
    <section className={cx("prn-kpi", className)}>
      <div className="prn-kpi-top">
        {icon != null && (
          <span className="prn-kpi-icon" aria-hidden>
            {icon}
          </span>
        )}
        <span className="prn-kpi-label">{label}</span>
      </div>
      <div className="prn-kpi-value prn-tnum">{value}</div>
      {delta != null && (
        <div className="prn-kpi-delta" data-trend={trend ?? "flat"}>
          {trend != null && (
            <span className="prn-kpi-arrow" aria-hidden>
              {TREND_GLYPH[trend] ?? ""}
            </span>
          )}
          <span>{delta}</span>
        </div>
      )}
    </section>
  );
}

/* ---------------- Badge ---------------- */

export type BadgeTone =
  | "neutral"
  | "green"
  | "red"
  | "orange"
  | "blue"
  | "teal"
  | "gray";

export interface BadgeProps {
  tone?: BadgeTone;
  children?: ReactNode;
  className?: string;
}

export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span className={cx("prn-badge", className)} data-tone={tone}>
      {children}
    </span>
  );
}

/* ---------------- Amount ---------------- */

export interface AmountProps {
  value: number;
  /** ISO-Währungscode, z. B. "EUR". Ohne → reine Zahl. */
  currency?: string;
  /** BCP-47-Locale für Formatierung (Default "de-DE"). */
  locale?: string;
  /** Min/Max Nachkommastellen. */
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  /** Negativ rot / positiv grün einfärben. */
  colored?: boolean;
  /** Immer Vorzeichen anzeigen (auch +). */
  signed?: boolean;
  className?: string;
}

export function Amount({
  value,
  currency,
  locale = "de-DE",
  minimumFractionDigits,
  maximumFractionDigits,
  colored = false,
  signed = false,
  className,
}: AmountProps) {
  const formatted = new Intl.NumberFormat(locale, {
    ...(currency ? { style: "currency", currency } : {}),
    ...(minimumFractionDigits != null ? { minimumFractionDigits } : {}),
    ...(maximumFractionDigits != null ? { maximumFractionDigits } : {}),
    signDisplay: signed ? "exceptZero" : "auto",
  }).format(value);

  const sign: "pos" | "neg" | "zero" = value > 0 ? "pos" : value < 0 ? "neg" : "zero";

  return (
    <span
      className={cx("prn-amount prn-tnum", className)}
      data-colored={colored ? "" : undefined}
      data-sign={sign}
    >
      {formatted}
    </span>
  );
}

/* ---------------- List + ListRow ---------------- */

export interface ListProps {
  children?: ReactNode;
  /** Header-Beschriftung über der Liste (macOS-Gruppentitel). */
  label?: ReactNode;
  /** Eingerückte Trennlinien (wie iOS-Listen). */
  inset?: boolean;
  className?: string;
}

export function List({ children, label, inset = false, className }: ListProps) {
  return (
    <div className={cx("prn-list", className)} data-inset={inset ? "" : undefined}>
      {label != null && <div className="prn-list-label">{label}</div>}
      <div className="prn-list-rows" role="list">
        {children}
      </div>
    </div>
  );
}

export interface ListRowProps {
  /** Linkes Element (Icon/Avatar). */
  leading?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Rechtes Element (Wert, Badge, Chevron). */
  trailing?: ReactNode;
  /** Macht die Zeile pressbar (react-aria Button). */
  onPress?: () => void;
  /** Aktiver/ausgewählter Zustand. */
  isActive?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  onPress,
  isActive,
  isDisabled,
  className,
}: ListRowProps) {
  const inner = (
    <>
      {leading != null && <span className="prn-row-leading">{leading}</span>}
      <span className="prn-row-main">
        {title != null && <span className="prn-row-title">{title}</span>}
        {subtitle != null && <span className="prn-row-subtitle">{subtitle}</span>}
      </span>
      {trailing != null && <span className="prn-row-trailing">{trailing}</span>}
    </>
  );

  if (onPress) {
    return (
      <RACButton
        className={cx("prn-row prn-row-pressable", className)}
        onPress={onPress}
        isDisabled={isDisabled}
        data-active={isActive ? "" : undefined}
      >
        {inner}
      </RACButton>
    );
  }

  return (
    <div
      className={cx("prn-row", className)}
      role="listitem"
      data-active={isActive ? "" : undefined}
      aria-disabled={isDisabled || undefined}
    >
      {inner}
    </div>
  );
}

/* ---------------- Sidebar ---------------- */

export interface SidebarItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  /** Optionales Badge/Counter rechts. */
  trailing?: ReactNode;
}

export interface SidebarGroup {
  /** Gruppentitel (optional). */
  label?: ReactNode;
  items: SidebarItem[];
}

export interface SidebarProps {
  groups: SidebarGroup[];
  /** Aktive Item-ID. */
  selectedKey?: string;
  onSelect?: (id: string) => void;
  /** Kopfbereich (z. B. App-Titel/Logo). */
  header?: ReactNode;
  /** Fußbereich (z. B. Account). */
  footer?: ReactNode;
  className?: string;
}

export function Sidebar({
  groups,
  selectedKey,
  onSelect,
  header,
  footer,
  className,
}: SidebarProps) {
  return (
    <nav className={cx("prn-sidebar", className)} aria-label="Seitenleiste">
      {header != null && <div className="prn-sidebar-header">{header}</div>}
      <div className="prn-sidebar-scroll">
        {groups.map((group, gi) => (
          <div className="prn-sidebar-group" key={gi}>
            {group.label != null && (
              <div className="prn-sidebar-group-label">{group.label}</div>
            )}
            {group.items.map((item) => (
              <RACButton
                key={item.id}
                className="prn-sidebar-item"
                data-active={item.id === selectedKey ? "" : undefined}
                onPress={() => onSelect?.(item.id)}
              >
                {item.icon != null && (
                  <span className="prn-sidebar-item-icon" aria-hidden>
                    {item.icon}
                  </span>
                )}
                <span className="prn-sidebar-item-label">{item.label}</span>
                {item.trailing != null && (
                  <span className="prn-sidebar-item-trailing">{item.trailing}</span>
                )}
              </RACButton>
            ))}
          </div>
        ))}
      </div>
      {footer != null && <div className="prn-sidebar-footer">{footer}</div>}
    </nav>
  );
}

/* ---------------- Toolbar ---------------- */

export interface ToolbarProps {
  title?: ReactNode;
  /** Untertitel unter dem Titel. */
  subtitle?: ReactNode;
  /** Linker Slot (z. B. Zurück-Button) vor dem Titel. */
  leading?: ReactNode;
  /** Aktionen rechts. */
  actions?: ReactNode;
  className?: string;
}

export function Toolbar({ title, subtitle, leading, actions, className }: ToolbarProps) {
  return (
    <header className={cx("prn-toolbar", className)}>
      {leading != null && <div className="prn-toolbar-leading">{leading}</div>}
      <div className="prn-toolbar-titles">
        {title != null && <span className="prn-toolbar-title">{title}</span>}
        {subtitle != null && <span className="prn-toolbar-subtitle">{subtitle}</span>}
      </div>
      {actions != null && <div className="prn-toolbar-actions">{actions}</div>}
    </header>
  );
}

/* ---------------- EmptyState ---------------- */

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Aktions-Slot (z. B. <Button>). */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cx("prn-empty", className)}>
      {icon != null && (
        <div className="prn-empty-icon" aria-hidden>
          {icon}
        </div>
      )}
      <div className="prn-empty-title">{title}</div>
      {description != null && <div className="prn-empty-desc">{description}</div>}
      {action != null && <div className="prn-empty-action">{action}</div>}
    </div>
  );
}

/* ---------------- Notice ---------------- */

export type NoticeTone = "info" | "positive" | "critical" | "negative";

export interface NoticeProps {
  tone?: NoticeTone;
  title?: ReactNode;
  /** Optionales Leading-Icon (überschreibt Default-Glyph). */
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const NOTICE_GLYPH: Record<NoticeTone, string> = {
  info: "ℹ",
  positive: "✓",
  critical: "!",
  negative: "✕",
};

export function Notice({ tone = "info", title, icon, children, className }: NoticeProps) {
  return (
    <div className={cx("prn-notice", className)} data-tone={tone} role="status">
      <span className="prn-notice-icon" aria-hidden>
        {icon ?? NOTICE_GLYPH[tone] ?? ""}
      </span>
      <div className="prn-notice-body">
        {title != null && <div className="prn-notice-title">{title}</div>}
        {children != null && <div className="prn-notice-text">{children}</div>}
      </div>
    </div>
  );
}
