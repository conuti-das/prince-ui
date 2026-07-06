import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  Disclosure as RACDisclosure,
  DisclosurePanel as RACDisclosurePanel,
  Heading,
  Button as RACButton,
} from "react-aria-components";
import { cx } from "../utils";
import { useFieldSize, type FieldSize } from "../primitives/size";
import { Badge, DescriptionList, Field, EmptyState } from "../composites/composites";
import "./timeline.css";

/* ============================================================
 * Timeline (Feed) — L3-Datenschicht.
 * Generische Ereignis-/Activity-Timeline: Audit-Trail, Verlauf,
 * Status-Tracking, Kommentare, System-Events. Gruppierbar nach
 * Tag oder Marktpartner. Tokens: prince-ui-tokens (nur var(--prn-*)).
 * ============================================================ */

export type TimelineStatus = "success" | "info" | "warning" | "error" | "pending";

/** Richtung eines Events gegenüber einem Marktpartner/Gegenüber. */
export type TimelineDir = "in" | "out" | "internal";

export interface TimelineActor {
  /** Anzeigename (z. B. „Lena Vogt" oder „System"). */
  name: string;
  /** Initialen fürs Avatar. Ohne → werden aus `name` abgeleitet. */
  initials?: string;
}

export interface TimelineAttr {
  label: ReactNode;
  value: ReactNode;
}

export interface TimelinePartner {
  id: string;
  name: ReactNode;
  /** Marktrolle o. Ä. (z. B. „MSB", „NB", „intern"). */
  role?: ReactNode;
  /** Fachlicher Code (z. B. Marktpartner-ID). */
  code?: ReactNode;
  /**
   * Beliebiger CSS-Farbwert für die Partner-Kodierung — bevorzugt ein Token,
   * z. B. `"var(--prn-chart-4)"`. Ohne → neutral. (Zweiter Kanal neben Status.)
   */
  color?: string;
}

export interface TimelineEvent {
  id: string;
  /** Zeitpunkt (Date, ms-Epoch oder ISO-String). */
  ts: string | number | Date;
  /** Endzeit → Event ist ein Zeitraum (Dauer wird angezeigt). Ohne → Zeitpunkt. */
  endTs?: string | number | Date;
  title: ReactNode;
  /** Ein-/Mehrzeiler; eingeklappt einzeilig, aufgeklappt vollständig. */
  description?: ReactNode;
  /** Statusfarbe + Glyph. Default `"info"`. */
  status?: TimelineStatus;
  /** Freitext-Kategorie-Chip (z. B. „system", „user"). */
  category?: ReactNode;
  /** Zuordnung zu einem Marktpartner (→ `partners`). */
  partnerId?: string;
  /** Richtung ggü. Marktpartner (Icon ↓/↑/·). */
  dir?: TimelineDir;
  actor?: TimelineActor;
  /** Optionales Leading-Glyph (überschreibt den Status-Glyph im Node nicht, sitzt im Kopf). */
  icon?: ReactNode;
  /** Detail-Attribute, im aufgeklappten Panel als Label/Wert-Liste. */
  attrs?: TimelineAttr[];
}

export interface TimelineProps {
  events: TimelineEvent[];
  /** Marktpartner-Registry für `groupBy="partner"` und die Partner-Kodierung. */
  partners?: TimelinePartner[];
  /** Gruppierung. Default `"day"`. */
  groupBy?: "day" | "partner" | "none";
  /** Sortierrichtung nach Zeit. Default `"asc"` (älteste zuerst). */
  order?: "asc" | "desc";
  /** Kontrolliert ausgewähltes Event (Hervorhebung). */
  selectedId?: string;
  onSelectEvent?: (id: string) => void;
  /** Kontrollierte aufgeklappte Events. */
  expandedIds?: string[];
  /** Initial aufgeklappte Events (unkontrolliert). */
  defaultExpandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  /** Dichte (s|m|l). Ohne → Context/Default. */
  size?: FieldSize;
  /** BCP-47-Locale für Datums-/Zeitformatierung. Default „de-DE". */
  locale?: string;
  /** Leerzustand-Titel, wenn `events` leer ist. */
  emptyLabel?: ReactNode;
  className?: string;
}

/* ---------------- Helfer ---------------- */

const STATUS_GLYPH: Record<TimelineStatus, string> = {
  success: "✓",
  info: "•",
  warning: "!",
  error: "✕",
  pending: "○",
};

const STATUS_LABEL: Record<TimelineStatus, string> = {
  success: "Erfolg",
  info: "Info",
  warning: "Warnung",
  error: "Fehler",
  pending: "Ausstehend",
};

const DIR_GLYPH: Record<TimelineDir, string> = { in: "↓", out: "↑", internal: "·" };
const DIR_LABEL: Record<TimelineDir, string> = {
  in: "eingehend",
  out: "ausgehend",
  internal: "intern",
};

function toDate(v: string | number | Date): Date {
  return v instanceof Date ? v : new Date(v);
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function initialsOf(actor: TimelineActor): string {
  if (actor.initials) return actor.initials;
  const parts = actor.name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

/** Deterministische Chart-Farbe (1..8) aus einem String — für Actor-Avatare. */
function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return `var(--prn-chart-${(h % 8) + 1})`;
}

function formatDuration(startMs: number, endMs: number): string | null {
  const mins = Math.round((endMs - startMs) / 60000);
  if (mins <= 0) return null;
  if (mins < 60) return `${mins} Min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} Std` : `${h} Std ${m} Min`;
}

interface TimelineGroup {
  key: string;
  /** Kopf-Inhalt: Tages-Label oder Partner. */
  day?: { label: string };
  partner?: TimelinePartner | null;
  events: TimelineEvent[];
}

/* ---------------- Row ---------------- */

function TimelineRow({
  event,
  timeFmt,
  fullFmt,
  partner,
  showPartnerChip = true,
  selected,
  expanded,
  onToggle,
  onSelect,
}: {
  event: TimelineEvent;
  timeFmt: Intl.DateTimeFormat;
  fullFmt: Intl.DateTimeFormat;
  partner?: TimelinePartner;
  /** Partner-Chip in der Zeile zeigen. In `groupBy="partner"` redundant → aus. */
  showPartnerChip?: boolean;
  selected: boolean;
  expanded: boolean;
  onToggle: (open: boolean) => void;
  onSelect?: () => void;
}) {
  const status: TimelineStatus = event.status ?? "info";
  const start = toDate(event.ts);
  const end = event.endTs != null ? toDate(event.endTs) : null;
  const isRange = end != null;
  const duration = isRange ? formatDuration(start.getTime(), end!.getTime()) : null;

  const partnerColor = partner?.color ?? "var(--prn-neutral)";
  const hasDetail =
    event.description != null || (event.attrs != null && event.attrs.length > 0) || isRange;

  return (
    <div
      className="prn-tl-item"
      data-status={status}
      data-range={isRange ? "" : undefined}
      data-selected={selected ? "" : undefined}
      style={{ "--prn-tl-partner": partnerColor } as CSSProperties}
    >
      <time className="prn-tl-time prn-tnum" dateTime={start.toISOString()}>
        {timeFmt.format(start)}
      </time>

      <span className="prn-tl-node-col" aria-hidden>
        <span className="prn-tl-node" data-status={status}>
          <span className="prn-tl-node-glyph">{STATUS_GLYPH[status]}</span>
        </span>
      </span>

      <RACDisclosure
        className="prn-tl-disc"
        isExpanded={expanded}
        onExpandedChange={onToggle}
      >
        <Heading className="prn-tl-heading">
          <RACButton
            slot="trigger"
            className="prn-tl-trigger"
            onPress={() => onSelect?.()}
          >
            <span className="prn-tl-main">
              <span className="prn-tl-headline">
                {event.icon != null && (
                  <span className="prn-tl-lead" aria-hidden>
                    {event.icon}
                  </span>
                )}
                <span className="prn-tl-title">{event.title}</span>
                {event.dir != null && (
                  <span
                    className="prn-tl-dir"
                    data-dir={event.dir}
                    title={DIR_LABEL[event.dir]}
                    aria-label={DIR_LABEL[event.dir]}
                  >
                    {DIR_GLYPH[event.dir]}
                  </span>
                )}
                {event.category != null && (
                  <Badge tone="gray" className="prn-tl-chip">
                    {event.category}
                  </Badge>
                )}
                {partner != null && showPartnerChip && (
                  <Badge color={partner.color} className="prn-tl-chip prn-tl-partner-chip">
                    {partner.role != null && (
                      <span className="prn-tl-partner-role">{partner.role}</span>
                    )}
                    {partner.name}
                  </Badge>
                )}
              </span>
              {event.description != null && (
                <span className="prn-tl-sub">{event.description}</span>
              )}
            </span>

            {event.actor != null && (
              <span
                className="prn-tl-avatar"
                style={{ "--prn-tl-avatar": avatarColor(event.actor.name) } as CSSProperties}
                title={event.actor.name}
                aria-hidden
              >
                {initialsOf(event.actor)}
              </span>
            )}

            {hasDetail && (
              <svg viewBox="0 0 16 16" className="prn-tl-chevron" aria-hidden>
                <polyline points="6,4 10,8 6,12" />
              </svg>
            )}
          </RACButton>
        </Heading>

        {hasDetail && (
          <RACDisclosurePanel className="prn-tl-panel">
            {event.description != null && (
              <p className="prn-tl-panel-desc">{event.description}</p>
            )}
            <DescriptionList layout="inline" className="prn-tl-attrs">
              <Field
                label="Zeit"
                value={
                  <span className="prn-tnum">
                    {fullFmt.format(start)}
                    {isRange && (
                      <>
                        {" – "}
                        {fullFmt.format(end!)}
                        {duration != null && ` · ${duration}`}
                      </>
                    )}
                  </span>
                }
              />
              {event.actor != null && <Field label="Ausgelöst von" value={event.actor.name} />}
              {partner != null && (
                <Field
                  label="Marktpartner"
                  value={
                    <>
                      {partner.name}
                      {partner.role != null && ` · ${partner.role as string}`}
                      {partner.code != null && (
                        <span className="prn-tnum"> · {partner.code}</span>
                      )}
                    </>
                  }
                />
              )}
              {event.dir != null && <Field label="Richtung" value={DIR_LABEL[event.dir]} />}
              {event.attrs?.map((a, i) => (
                <Field key={i} label={a.label} value={a.value} />
              ))}
            </DescriptionList>
          </RACDisclosurePanel>
        )}
      </RACDisclosure>
    </div>
  );
}

/* ---------------- Timeline ---------------- */

export function Timeline({
  events,
  partners,
  groupBy = "day",
  order = "asc",
  selectedId,
  onSelectEvent,
  expandedIds,
  defaultExpandedIds,
  onExpandedChange,
  size,
  locale = "de-DE",
  emptyLabel = "Keine Ereignisse",
  className,
}: TimelineProps) {
  const resolvedSize = useFieldSize(size);

  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(
    () => new Set(defaultExpandedIds ?? []),
  );
  const isControlled = expandedIds != null;
  const expandedSet = useMemo(
    () => (isControlled ? new Set(expandedIds) : internalExpanded),
    [isControlled, expandedIds, internalExpanded],
  );

  const toggle = (id: string, open: boolean) => {
    const next = new Set(expandedSet);
    if (open) next.add(id);
    else next.delete(id);
    if (!isControlled) setInternalExpanded(next);
    onExpandedChange?.([...next]);
  };

  const timeFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }),
    [locale],
  );
  const dayFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "long" }),
    [locale],
  );
  const fullFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }),
    [locale],
  );

  const partnerById = useMemo(() => {
    const m = new Map<string, TimelinePartner>();
    (partners ?? []).forEach((p) => m.set(p.id, p));
    return m;
  }, [partners]);

  const groups = useMemo<TimelineGroup[]>(() => {
    const dir = order === "desc" ? -1 : 1;
    const byTime = (a: TimelineEvent, b: TimelineEvent) =>
      (toDate(a.ts).getTime() - toDate(b.ts).getTime()) * dir;

    if (groupBy === "none") {
      return [{ key: "all", events: [...events].sort(byTime) }];
    }

    if (groupBy === "partner") {
      const list = partners ?? [];
      const knownIds = new Set(list.map((p) => p.id));
      const out: TimelineGroup[] = [];
      list.forEach((p) => {
        const evs = events.filter((e) => e.partnerId === p.id).sort(byTime);
        if (evs.length) out.push({ key: `p:${p.id}`, partner: p, events: evs });
      });
      const orphan = events
        .filter((e) => e.partnerId == null || !knownIds.has(e.partnerId))
        .sort(byTime);
      if (orphan.length) out.push({ key: "p:__none", partner: null, events: orphan });
      return out;
    }

    // groupBy === "day"
    const byDay = new Map<string, { date: Date; events: TimelineEvent[] }>();
    events.forEach((e) => {
      const d = toDate(e.ts);
      const k = dayKey(d);
      const bucket = byDay.get(k);
      if (bucket) bucket.events.push(e);
      else byDay.set(k, { date: d, events: [e] });
    });
    return [...byDay.values()]
      .sort((a, b) => (a.date.getTime() - b.date.getTime()) * dir)
      .map((b) => ({
        key: `d:${dayKey(b.date)}`,
        day: { label: dayFmt.format(b.date) },
        events: b.events.sort(byTime),
      }));
  }, [events, groupBy, order, partners, dayFmt]);

  if (events.length === 0) {
    return (
      <div className={cx("prn-timeline", className)} data-size={resolvedSize}>
        <EmptyState title={emptyLabel} />
      </div>
    );
  }

  return (
    <section
      className={cx("prn-timeline", className)}
      data-size={resolvedSize}
      data-group={groupBy}
    >
      {groups.map((g) => {
        const partner = g.partner;
        const headStyle =
          partner?.color != null
            ? ({ "--prn-tl-partner": partner.color } as CSSProperties)
            : undefined;
        return (
          <section key={g.key} className="prn-tl-group" style={headStyle}>
            {g.day != null && (
              <header className="prn-tl-group-head" data-kind="day">
                <span className="prn-tl-day-label">{g.day.label}</span>
                <span className="prn-tl-count prn-tnum">{g.events.length}</span>
              </header>
            )}
            {(partner != null || g.partner === null) && (
              <header className="prn-tl-group-head" data-kind="partner">
                <span className="prn-tl-swatch" aria-hidden />
                <span className="prn-tl-partner-name">{partner ? partner.name : "Ohne Partner"}</span>
                {partner?.role != null && (
                  <span className="prn-tl-partner-role-pill">{partner.role}</span>
                )}
                {partner?.code != null && (
                  <span className="prn-tl-partner-code prn-tnum">{partner.code}</span>
                )}
                <span className="prn-tl-count prn-tnum">{g.events.length}</span>
              </header>
            )}

            <div className="prn-tl-items">
              {g.events.map((e) => (
                <TimelineRow
                  key={e.id}
                  event={e}
                  timeFmt={timeFmt}
                  fullFmt={fullFmt}
                  partner={e.partnerId != null ? partnerById.get(e.partnerId) : undefined}
                  showPartnerChip={groupBy !== "partner"}
                  selected={selectedId === e.id}
                  expanded={expandedSet.has(e.id)}
                  onToggle={(open) => toggle(e.id, open)}
                  onSelect={onSelectEvent ? () => onSelectEvent(e.id) : undefined}
                />
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
}
