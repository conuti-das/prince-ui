import { useState, type CSSProperties, type ReactNode } from "react";
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
  /** Glas-Optik: halbtransparenter Hintergrund + Blur (Light & Dark). */
  translucent?: boolean;
  /** Macht die Karte klickbar (react-aria Button) mit Hover-Lift — wie KpiCard. */
  onPress?: () => void;
  /** Inline-Styles (z. B. App-lokale Maße/Status-Border) auf das Card-Element. */
  style?: CSSProperties;
  children?: ReactNode;
  className?: string;
}

export function Card({
  title,
  header,
  padding = "regular",
  translucent = false,
  onPress,
  style,
  children,
  className,
}: CardProps) {
  const hasHeader = title != null || header != null;
  const inner = (
    <>
      {hasHeader && (
        <header className="prn-card-head">
          {title != null && <h3 className="prn-card-title">{title}</h3>}
          {header != null && <div className="prn-card-head-slot">{header}</div>}
        </header>
      )}
      {children}
    </>
  );

  if (onPress) {
    return (
      <RACButton
        className={cx("prn-card", "prn-card-pressable", className)}
        style={style}
        data-padding={padding}
        data-translucent={translucent ? "" : undefined}
        onPress={onPress}
      >
        {inner}
      </RACButton>
    );
  }

  return (
    <section
      className={cx("prn-card", className)}
      style={style}
      data-padding={padding}
      data-translucent={translucent ? "" : undefined}
    >
      {inner}
    </section>
  );
}

/* ---------------- KpiCard ---------------- */

export type Trend = "up" | "down" | "flat";

/** Färbung des KPI-Werts (Drill-down-Semantik). */
export type KpiTone = "positive" | "critical" | "negative";

export interface KpiCardProps {
  label: ReactNode;
  value: ReactNode;
  /** Delta-Text, z. B. "+12 %". */
  delta?: ReactNode;
  /** Richtung der Färbung. Wird `delta` ohne `trend` gesetzt, bleibt es neutral. */
  trend?: Trend;
  /** Färbt den Wert semantisch (grün/orange/rot). */
  tone?: KpiTone;
  /** Macht die Kachel klickbar (react-aria Button) mit Hover-Lift. */
  onPress?: () => void;
  /** Akzent-„Hero"-Kachel: Vollflächen-Akzent mit dunkler Schrift. */
  accent?: boolean;
  /** Optionales Leading-Icon (z. B. SVG/Emoji). */
  icon?: ReactNode;
  className?: string;
}

const TREND_GLYPH: Record<Trend, string> = { up: "↑", down: "↓", flat: "→" };

export function KpiCard({
  label,
  value,
  delta,
  trend,
  tone,
  onPress,
  accent = false,
  icon,
  className,
}: KpiCardProps) {
  const inner = (
    <>
      <div className="prn-kpi-top">
        {icon != null && (
          <span className="prn-kpi-icon" aria-hidden>
            {icon}
          </span>
        )}
        <span className="prn-kpi-label">{label}</span>
      </div>
      <div className="prn-kpi-value prn-tnum" data-tone={tone}>
        {value}
      </div>
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
    </>
  );

  if (onPress) {
    return (
      <RACButton
        className={cx("prn-kpi prn-kpi-pressable", className)}
        data-accent={accent ? "" : undefined}
        onPress={onPress}
      >
        {inner}
      </RACButton>
    );
  }

  return (
    <section className={cx("prn-kpi", className)} data-accent={accent ? "" : undefined}>
      {inner}
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
  /** Optionales Leading-Icon (SVG/Emoji/ReactNode), links vom Text. */
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Badge({ tone = "neutral", icon, children, className }: BadgeProps) {
  return (
    <span className={cx("prn-badge", className)} data-tone={tone}>
      {icon != null && (
        <span className="prn-badge-icon" aria-hidden>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}

/* ---------------- Amount ---------------- */

export interface AmountProps {
  /**
   * Zahl → wird i18n-formatiert. Bereits formatierter String → wird unverändert
   * angezeigt (String-Modus; `currency`/`locale`/`fractionDigits` werden ignoriert).
   */
  value: number | string;
  /** ISO-Währungscode, z. B. "EUR". Ohne → reine Zahl. (Nur Zahl-Modus.) */
  currency?: string;
  /** BCP-47-Locale für Formatierung (Default "de-DE"). (Nur Zahl-Modus.) */
  locale?: string;
  /** Min/Max Nachkommastellen. (Nur Zahl-Modus.) */
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  /** Negativ rot / positiv grün einfärben. */
  colored?: boolean;
  /** Immer Vorzeichen anzeigen (auch +). (Nur Zahl-Modus.) */
  signed?: boolean;
  /**
   * Optische Abschwächung der Nachkommastellen (Tail leiser/kleiner).
   * Erkennt das Dezimaltrennzeichen der Ausgabe und dämpft alles dahinter.
   */
  dimDecimals?: boolean;
  className?: string;
}

/** Trennt eine formatierte Zahl in Integer-Kopf + Dezimal-Tail (inkl. Trenner). */
function splitDecimals(text: string): { head: string; tail: string | null } {
  // letztes "," oder "." gefolgt von Ziffern bis Stringende (lässt Währungssuffix zu)
  const match = text.match(/^(.*[\d\s])([.,]\d+)(\D*)$/);
  if (!match) return { head: text, tail: null };
  const [, head = "", dec = "", suffix = ""] = match;
  return { head, tail: dec + suffix };
}

export function Amount({
  value,
  currency,
  locale = "de-DE",
  minimumFractionDigits,
  maximumFractionDigits,
  colored = false,
  signed = false,
  dimDecimals = false,
  className,
}: AmountProps) {
  const isString = typeof value === "string";

  const formatted = isString
    ? value
    : new Intl.NumberFormat(locale, {
        ...(currency ? { style: "currency", currency } : {}),
        ...(minimumFractionDigits != null ? { minimumFractionDigits } : {}),
        ...(maximumFractionDigits != null ? { maximumFractionDigits } : {}),
        signDisplay: signed ? "exceptZero" : "auto",
      }).format(value);

  const sign: "pos" | "neg" | "zero" = isString
    ? value.trimStart().startsWith("-")
      ? "neg"
      : "pos"
    : value > 0
      ? "pos"
      : value < 0
        ? "neg"
        : "zero";

  const { head, tail } = dimDecimals
    ? splitDecimals(formatted)
    : { head: formatted, tail: null };

  return (
    <span
      className={cx("prn-amount prn-tnum", className)}
      data-colored={colored ? "" : undefined}
      data-sign={sign}
    >
      {tail != null ? (
        <>
          {head}
          <span className="prn-amount-dec" aria-hidden={false}>
            {tail}
          </span>
        </>
      ) : (
        formatted
      )}
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
  /** Macht die Gruppe auf-/zuklappbar (Chevron, klickbarer Titel). Braucht `label`. */
  collapsible?: boolean;
  /** Startzustand zugeklappt (nur bei `collapsible`). */
  defaultCollapsed?: boolean;
}

/** Eine Sidebar-Gruppe; verwaltet bei `collapsible` ihren Auf-/Zuklapp-Zustand. */
function SidebarGroupView({
  group,
  selectedKey,
  onSelect,
}: {
  group: SidebarGroup;
  selectedKey?: string;
  onSelect?: (id: string) => void;
}) {
  const collapsible = group.collapsible === true && group.label != null;
  const [collapsed, setCollapsed] = useState(
    collapsible ? group.defaultCollapsed === true : false,
  );

  const items = (
    <div className="prn-sidebar-group-items" role={collapsible ? "group" : undefined} hidden={collapsed}>
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
  );

  return (
    <div className="prn-sidebar-group" data-collapsible={collapsible ? "" : undefined}>
      {group.label != null &&
        (collapsible ? (
          <RACButton
            className="prn-sidebar-group-label prn-sidebar-group-toggle"
            aria-expanded={!collapsed}
            data-collapsed={collapsed ? "" : undefined}
            onPress={() => setCollapsed((c) => !c)}
          >
            <span className="prn-sidebar-group-chevron" aria-hidden>
              ›
            </span>
            <span className="prn-sidebar-group-label-text">{group.label}</span>
          </RACButton>
        ) : (
          <div className="prn-sidebar-group-label">{group.label}</div>
        ))}
      {items}
    </div>
  );
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
          <SidebarGroupView
            key={gi}
            group={group}
            selectedKey={selectedKey}
            onSelect={onSelect}
          />
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

/* ---------------- DescriptionList + Field ---------------- */

export interface DescriptionListProps {
  children?: ReactNode;
  /**
   * Layout der Label/Wert-Paare:
   * - `stacked` (Default): Label über dem Wert.
   * - `inline`: Label links, Wert rechts (zweispaltig).
   */
  layout?: "stacked" | "inline";
  className?: string;
}

/** Schlanke read-only Label/Wert-Liste (semantisches `<dl>`). */
export function DescriptionList({
  children,
  layout = "stacked",
  className,
}: DescriptionListProps) {
  return (
    <dl className={cx("prn-dl", className)} data-layout={layout}>
      {children}
    </dl>
  );
}

export interface FieldProps {
  label: ReactNode;
  /** Anzuzeigender Wert (read-only). */
  value?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Ein read-only Label/Wert-Paar (`<dt>`/`<dd>`) für `DescriptionList`. */
export function Field({ label, value, children, className }: FieldProps) {
  return (
    <div className={cx("prn-field", className)}>
      <dt className="prn-field-label">{label}</dt>
      <dd className="prn-field-value">{value ?? children}</dd>
    </div>
  );
}
