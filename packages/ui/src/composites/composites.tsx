import { useId, useState, type CSSProperties, type ReactNode, type SyntheticEvent } from "react";
import { Button as RACButton, Link as RACLink } from "react-aria-components";
import { cx } from "../utils";
import { Icon } from "../icons/icons";
import "./composites.css";

/* ============================================================
 * L2-Komposita — Prince-Look. Aufbauend auf Tokens + L1-Primitives.
 * Tokens: prince-ui-tokens (immer var(--prn-*), nie Hex/rgb).
 * ============================================================ */

/* ---------------- Card ---------------- */

/** data-* am äußeren Element (testid und Merkmale für Tests und Stile). */
export type DataAttributes = { [key: `data-${string}`]: string | number | boolean | undefined };
/** nur die data-*-Schlüssel aus den restlichen Props */
const nurDaten = (rest: Record<string, unknown>): DataAttributes => Object.fromEntries(Object.entries(rest).filter(([k]) => k.startsWith("data-"))) as DataAttributes;

export interface CardProps extends DataAttributes {
  /** Optionaler Titel oben links (alternativ via `header` voll überschreibbar). */
  title?: ReactNode;
  /** Zahl neben dem Titel (z. B. Anzahl der Einträge der Karte). */
  count?: ReactNode;
  /** Zeile unter dem Titel. */
  subtitle?: ReactNode;
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
  count,
  subtitle,
  ...rest
}: CardProps) {
  const daten = nurDaten(rest);
  const hasHeader = title != null || header != null;
  const inner = (
    <>
      {hasHeader && (
        <header className="prn-card-head">
          {title != null && (count != null || subtitle != null ? (
            <div className="prn-card-titles">
              <h3 className="prn-card-title">{title}{count != null && <span className="prn-card-count prn-tnum">{count}</span>}</h3>
              {subtitle != null && <p className="prn-card-subtitle">{subtitle}</p>}
            </div>
          ) : <h3 className="prn-card-title">{title}</h3>)}
          {header != null && <div className="prn-card-head-slot">{header}</div>}
        </header>
      )}
      {children}
    </>
  );

  if (onPress) {
    return (
      <RACButton
        {...daten}
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
      {...daten}
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
  /** Grundlage der Zahl unter dem Label (z. B. „offen · alle Mandanten“). */
  subtitle?: ReactNode;
  /** Einheit hinter dem Wert (kleiner gesetzt). */
  unit?: ReactNode;
  /** Zustandswort zum Wert (z. B. „überfällig“) – in der Farbe von `tone`; Farbe trägt nie allein. */
  status?: ReactNode;
  /** Bis zu drei Nebenwerte rechts vom Wert (Label, Wert, optional Ton). */
  sideValues?: KpiSideValue[];
  /** Inhalt unter dem Wert (z. B. ein Diagramm oder Anteilsbalken). Nicht interaktiv, wenn `onPress` gesetzt ist. */
  children?: ReactNode;
  /** Zugänglicher Name der Kachel (Default: Inhalt). */
  "aria-label"?: string;
  "data-testid"?: string;
  className?: string;
}

/** Nebenwert einer KpiCard. */
export interface KpiSideValue {
  label: ReactNode;
  value: ReactNode;
  tone?: KpiTone;
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
  subtitle,
  unit,
  status,
  sideValues,
  children,
  "aria-label": ariaLabel,
  "data-testid": testId,
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
      {subtitle != null && <div className="prn-kpi-subtitle">{subtitle}</div>}
      <div className="prn-kpi-main">
        <div className="prn-kpi-value prn-tnum" data-tone={tone}>
          {value}
          {unit != null && <span className="prn-kpi-unit">{unit}</span>}
        </div>
        {sideValues && sideValues.length > 0 && (
          <dl className="prn-kpi-side">
            {sideValues.slice(0, 3).map((v, i) => (
              <div key={i} className="prn-kpi-side-item">
                <dt>{v.label}</dt>
                <dd className="prn-tnum" data-tone={v.tone}>{v.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {status != null && <div className="prn-kpi-status" data-tone={tone}>{status}</div>}
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
      {children != null && <div className="prn-kpi-content">{children}</div>}
    </>
  );

  if (onPress) {
    return (
      <RACButton
        className={cx("prn-kpi prn-kpi-pressable", className)}
        data-accent={accent ? "" : undefined}
        onPress={onPress}
        aria-label={ariaLabel}
        data-testid={testId}
      >
        {inner}
      </RACButton>
    );
  }

  return (
    <section className={cx("prn-kpi", className)} data-accent={accent ? "" : undefined} aria-label={ariaLabel} data-testid={testId}>
      {inner}
    </section>
  );
}

/* ---------------- Badge ---------------- */

/* ---------------- KpiGrid ----------------
 * Raster für KpiCards: so viele Spalten, wie Platz ist (auto-fit), höchstens `columns`; 4er-Reihe mit schmaleren Karten. Auf dem Telefon eine Spalte. */

export interface KpiGridProps extends DataAttributes {
  /** höchstens so viele Spalten (Default 3). */
  columns?: 2 | 3 | 4;
  children?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function KpiGrid({ columns = 3, children, className, "aria-label": ariaLabel, ...rest }: KpiGridProps) {
  return <div {...nurDaten(rest)} className={cx("prn-kpi-grid", className)} data-columns={columns} role={ariaLabel ? "group" : undefined} aria-label={ariaLabel}>{children}</div>;
}

/* ---------------- CellStack ----------------
 * Zelle mit Hauptwert und kleinem Zweitwert darunter (Tabellen, Listen). Kürzt je Zeile mit „…“ (voller Text als `title`) oder bricht um (`wrap`, z. B. Kennungen). */

export interface CellStackProps extends DataAttributes {
  primary: ReactNode;
  secondary?: ReactNode;
  /** Hauptwert fett. */
  emphasized?: boolean;
  /** Zweitwert in Festbreitenschrift (Kennungen). */
  mono?: boolean;
  /** umbrechen statt kürzen. */
  wrap?: boolean;
  /** voller Text als Tooltip (beim Kürzen). */
  title?: string;
  className?: string;
}

export function CellStack({ primary, secondary, emphasized, mono, wrap, title, className, ...rest }: CellStackProps) {
  return (
    <span {...nurDaten(rest)} className={cx("prn-cell-stack", className)} data-wrap={wrap ? "" : undefined} title={title}>
      <span className="prn-cell-stack-primary" data-emphasized={emphasized ? "" : undefined}>{primary}</span>
      {secondary != null && secondary !== "" && <span className="prn-cell-stack-secondary" data-mono={mono ? "" : undefined}>{secondary}</span>}
    </span>
  );
}

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
  /** Soft = getönt (Default), solid = vollflächig gefüllt. */
  variant?: "soft" | "solid";
  /** Optionales Leading-Icon (SVG/Emoji/ReactNode), links vom Text. */
  icon?: ReactNode;
  /** Beliebige Markenfarbe (überschreibt `tone`). Z. B. Team-Farbe. */
  color?: string;
  /** Textfarbe bei `color` (Default: Weiß für solid, `color` selbst für soft). */
  textColor?: string;
  /** Escape-Hatch: Inline-Styles (z. B. fixe Größe/Radius/Font für Tabellen-Chips). */
  style?: CSSProperties;
  /**
   * Langes Wort darf umbrechen statt einzeilig zu bleiben (z. B. Zustandswörter unter einem Listentext oder in schmalen Spalten);
   * der Radius passt sich an, die Pille wird zum abgerundeten Block.
   */
  wrap?: boolean;
  children?: ReactNode;
  className?: string;
}

export function Badge({
  tone = "neutral",
  variant = "soft",
  icon,
  color,
  textColor,
  style,
  wrap,
  children,
  className,
}: BadgeProps) {
  const mergedStyle = {
    ...(color != null ? { "--prn-badge-color": color } : {}),
    ...(textColor != null ? { "--prn-badge-text-color": textColor } : {}),
    ...style,
  } as CSSProperties;
  return (
    <span
      className={cx("prn-badge", className)}
      data-tone={tone}
      data-variant={variant}
      data-custom-color={color != null ? "" : undefined}
      data-wrap={wrap ? "" : undefined}
      style={mergedStyle}
    >
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

export type ListRowDataAttributes = { [key: `data-${string}`]: string | number | boolean | undefined };

export interface ListRowProps extends ListRowDataAttributes {
  /** Linkes Element (Icon/Avatar). */
  leading?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Rechtes Element (Wert, Badge, Chevron). */
  trailing?: ReactNode;
  /** Macht die Zeile pressbar (react-aria Button; mit `href` zusätzlich zur Navigation aufgerufen). */
  onPress?: () => void;
  /**
   * Ziel als Link: die Zeile wird ein `<a href>` (React-Aria `Link`) statt eines Knopfs – Strg-/⌘-/Mittelklick öffnen einen
   * neuen Tab, „Link kopieren“ geht. Für Client-Routing die Anwendung in React-Arias `RouterProvider` hüllen.
   */
  href?: string;
  /** Name der Zeile für Screenreader, wenn der sichtbare Inhalt nicht genügt (sonst ergibt er sich aus dem Inhalt). */
  "aria-label"?: string;
  /** Aktiver/ausgewählter Zustand. */
  isActive?: boolean;
  isDisabled?: boolean;
  /** Hervorhebung als Randstrich links (nur mit Wort im Inhalt, z. B. einem Badge – Farbe allein trägt keine Bedeutung). */
  tone?: "critical" | "negative";
  /** Trailing neben dem Text (Standard) oder darunter – für schmale Breiten, auf denen dem Text sonst keine Breite bleibt. */
  trailingPlacement?: "end" | "below";
  /** Titel und Untertitel brechen um statt mit „…“ abzuschneiden. */
  wrap?: boolean;
  className?: string;
}

export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  onPress,
  href,
  "aria-label": ariaLabel,
  isActive,
  isDisabled,
  tone,
  trailingPlacement = "end",
  wrap = false,
  className,
  ...rest
}: ListRowProps) {
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) if (k.startsWith("data-")) data[k] = v;
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
  const zustand = {
    "data-active": isActive ? "" : undefined,
    "data-tone": tone,
    "data-trailing": trailingPlacement === "below" ? "below" : undefined,
    "data-wrap": wrap ? "" : undefined,
  };

  if (onPress || href != null) {
    // Interaktiv: Listeneintrag (role=listitem, trägt testid und data-*) mit Knopf bzw. Link über die ganze Zeile
    const gemeinsam = { className: cx("prn-row prn-row-pressable", className), onPress, isDisabled, "aria-label": ariaLabel, ...zustand };
    return (
      <div className="prn-row-item" role="listitem" {...data} {...(href != null ? browserKlick : undefined)}>
        {href != null ? <RACLink {...gemeinsam} href={href}>{inner}</RACLink> : <RACButton {...gemeinsam}>{inner}</RACButton>}
      </div>
    );
  }

  return (
    <div
      className={cx("prn-row", className)}
      role="listitem"
      aria-label={ariaLabel}
      aria-disabled={isDisabled || undefined}
      {...zustand}
      {...data}
    >
      {inner}
    </div>
  );
}

/**
 * Geänderte Klicks auf eine Link-Zeile (Strg/⌘/Umschalt oder Mittelklick) gehören dem Browser: neuer Tab bzw. Fenster. Die Ereignisse werden in der
 * Capture-Phase vor dem Press-Handling von React-Aria angehalten (kein preventDefault), sonst ging der neue Tab in einem Teil der Fälle verloren.
 */
const geaendert = (e: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; button: number }) => e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1;
const anhalten = (e: SyntheticEvent & { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; button: number }) => { if (geaendert(e)) e.stopPropagation(); };
const browserKlick = {
  onPointerDownCapture: anhalten,
  onPointerUpCapture: anhalten,
  onMouseDownCapture: anhalten,
  onMouseUpCapture: anhalten,
  onClickCapture: anhalten,
  onAuxClickCapture: anhalten,
};

/* ---------------- Sidebar ---------------- */

export interface SidebarItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  /** Optionales Badge/Counter rechts. */
  trailing?: ReactNode;
  /**
   * Ziel als Link: der Eintrag wird ein `<a href>` (React-Aria `Link`) statt eines Knopfs –
   * Strg-/⌘-/Mittelklick öffnen einen neuen Tab, „Link kopieren" geht. Für Client-Routing
   * die Anwendung in React-Arias `RouterProvider` hüllen (`navigate`, optional `useHref`).
   * `onSelect` wird zusätzlich aufgerufen.
   */
  href?: string;
  /** Test-Kennung am Eintrag (`data-testid`). */
  "data-testid"?: string;
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
  const itemsId = useId();

  const items = (
    <div id={itemsId} className="prn-sidebar-group-items" role={collapsible ? "group" : undefined} hidden={collapsed}>
      {group.items.map((item) => {
        const active = item.id === selectedKey;
        const inhalt = (
          <>
            {item.icon != null && (
              <span className="prn-sidebar-item-icon" aria-hidden>
                {item.icon}
              </span>
            )}
            <span className="prn-sidebar-item-label">{item.label}</span>
            {item.trailing != null && (
              <span className="prn-sidebar-item-trailing">{item.trailing}</span>
            )}
          </>
        );
        const gemeinsam = {
          className: "prn-sidebar-item",
          "data-active": active ? "" : undefined,
          "aria-current": active ? ("page" as const) : undefined,
          "data-testid": item["data-testid"],
          onPress: () => onSelect?.(item.id),
        };
        return item.href != null ? (
          <RACLink key={item.id} {...gemeinsam} href={item.href}>
            {inhalt}
          </RACLink>
        ) : (
          <RACButton key={item.id} {...gemeinsam}>
            {inhalt}
          </RACButton>
        );
      })}
    </div>
  );

  return (
    <div className="prn-sidebar-group" data-collapsible={collapsible ? "" : undefined}>
      {group.label != null &&
        (collapsible ? (
          <RACButton
            className="prn-sidebar-group-label prn-sidebar-group-toggle"
            aria-expanded={!collapsed}
            aria-controls={itemsId}
            data-collapsed={collapsed ? "" : undefined}
            onPress={() => setCollapsed((c) => !c)}
          >
            <span className="prn-sidebar-group-chevron" aria-hidden>
              <Icon name="chevron-right" size={14} />
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
  /** „Liquid Glass"-Optik (transluzent + Blur). Nur über Content sinnvoll. */
  glass?: boolean;
  /** Zugänglicher Name der Navigation (Landmark). Default „Seitenleiste". */
  "aria-label"?: string;
  /** Test-Kennung an der Navigation (`data-testid`). */
  "data-testid"?: string;
  className?: string;
}

export function Sidebar({
  groups,
  selectedKey,
  onSelect,
  header,
  footer,
  glass,
  "aria-label": ariaLabel = "Seitenleiste",
  "data-testid": testId,
  className,
}: SidebarProps) {
  return (
    <nav
      className={cx("prn-sidebar", glass && "prn-glass prn-glass-sidebar", className)}
      aria-label={ariaLabel}
      data-testid={testId}
    >
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
  /** „Liquid Glass"-Optik (transluzent + Blur). Nur über Content sinnvoll. */
  glass?: boolean;
  className?: string;
}

export function Toolbar({ title, subtitle, leading, actions, glass, className }: ToolbarProps) {
  return (
    <header className={cx("prn-toolbar", glass && "prn-glass prn-glass-bar", className)}>
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

/** Illustrationen des Leerzustands (Parität zu IllustratedMessage: NoData, NoSearchResults, UnableToLoad, NoTasks). */
export type EmptyStateIllustration = "no-data" | "no-results" | "error" | "done";
export type EmptyStateSize = "s" | "m" | "l";

/* Linienbilder aus Tokens: Fläche --prn-fill, Linie --prn-label-3, Akzent --prn-accent (Fehler: --prn-red, erledigt: --prn-green). */
const ILLUSTRATION: Record<EmptyStateIllustration, ReactNode> = {
  "no-data": (
    <>
      <rect x="22" y="30" width="76" height="46" rx="10" className="prn-ill-fill" />
      <path d="M22 54h20l6 9h24l6-9h20" className="prn-ill-line" />
      <path d="M38 20h44M46 12h28" className="prn-ill-line prn-ill-soft" />
    </>
  ),
  "no-results": (
    <>
      <circle cx="54" cy="44" r="24" className="prn-ill-fill" />
      <circle cx="54" cy="44" r="24" className="prn-ill-line" />
      <path d="m72 62 18 18" className="prn-ill-line prn-ill-thick" />
      <path d="m46 36 16 16M62 36 46 52" className="prn-ill-accent" />
    </>
  ),
  error: (
    <>
      <path d="M36 70h50a16 16 0 0 0 2-32 22 22 0 0 0-42-6 18 18 0 0 0-10 38Z" className="prn-ill-fill" />
      <path d="M36 70h50a16 16 0 0 0 2-32 22 22 0 0 0-42-6 18 18 0 0 0-10 38Z" className="prn-ill-line" />
      <path d="M60 40v14M60 61v.5" className="prn-ill-accent prn-ill-negative" />
    </>
  ),
  done: (
    <>
      <circle cx="60" cy="44" r="28" className="prn-ill-fill" />
      <circle cx="60" cy="44" r="28" className="prn-ill-line" />
      <path d="m47 45 9 9 18-19" className="prn-ill-accent prn-ill-positive" />
    </>
  ),
};

export interface EmptyStateProps extends DataAttributes {
  icon?: ReactNode;
  /** Illustration statt Icon (Linienbild in den Farben des Themes). */
  illustration?: EmptyStateIllustration;
  /** Größe: s in Tabellen und Spalten, m Standard, l für ganze Seiten. Default „m“. */
  size?: EmptyStateSize;
  title: ReactNode;
  description?: ReactNode;
  /** Aktions-Slot (z. B. <Button>). */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, illustration, size = "m", title, description, action, className, ...rest }: EmptyStateProps) {
  return (
    <div {...nurDaten(rest)} className={cx("prn-empty", className)} data-size={size}>
      {illustration != null ? (
        <svg className="prn-empty-illustration" viewBox="0 0 120 90" aria-hidden focusable="false" data-illustration={illustration}>
          {ILLUSTRATION[illustration]}
        </svg>
      ) : (
        icon != null && (
          <div className="prn-empty-icon" aria-hidden>
            {icon}
          </div>
        )
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
  /** Aktionen rechts (z. B. „Erneut laden“). */
  actions?: ReactNode;
  /** Schließen-Knopf; ohne Handler keiner. */
  onClose?: () => void;
  /** Name des Schließen-Knopfs. Default „Hinweis schließen“. */
  closeLabel?: string;
  /** Rolle: `alert` für Fehler, die sofort angesagt werden sollen. Default `status`. */
  role?: "status" | "alert";
  "data-testid"?: string;
  className?: string;
}

const NOTICE_GLYPH: Record<NoticeTone, string> = {
  info: "ℹ",
  positive: "✓",
  critical: "!",
  negative: "✕",
};

export function Notice({ tone = "info", title, icon, children, actions, onClose, closeLabel = "Hinweis schließen", role = "status", "data-testid": testId, className }: NoticeProps) {
  return (
    <div className={cx("prn-notice", className)} data-tone={tone} role={role} data-testid={testId}>
      <span className="prn-notice-icon" aria-hidden>
        {icon ?? NOTICE_GLYPH[tone] ?? ""}
      </span>
      <div className="prn-notice-body">
        {title != null && <div className="prn-notice-title">{title}</div>}
        {children != null && <div className="prn-notice-text">{children}</div>}
      </div>
      {actions != null && <div className="prn-notice-actions">{actions}</div>}
      {onClose && (
        <RACButton className="prn-notice-close" aria-label={closeLabel} onPress={onClose}>
          <Icon name="x" size={16} />
        </RACButton>
      )}
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
