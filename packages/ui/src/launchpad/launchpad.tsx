import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  GridList as RACGridList,
  GridListItem as RACGridListItem,
  Button as RACButton,
  DropIndicator,
  useDragAndDrop,
} from "react-aria-components";
import { cx } from "../utils";
import { Icon } from "../icons/icons";
import { Card, KpiCard, List, ListRow } from "../composites/composites";
import { Modal } from "../primitives/overlays";
import { Sparkline, AreaChart } from "../charts/charts";
import "./launchpad.css";

/* ============================================================
 *  Launchpad — Apple-orientiertes App-/Card-Dashboard
 *
 *  Struktur (Fiori-analog, reduziert): Launchpad → Section → Card.
 *  Card ist polymorph über `kind` (Plug-in-Contract). `editable`
 *  schaltet Drag-Reorder frei (react-aria GridList + Drop-Indikator);
 *  ohne `editable` eine schlichte, barrierearme `role="list"`-Fläche
 *  mit pressbaren Kacheln. Cards mit `detail`/`trend` öffnen ein
 *  Drill-down-Popup mit der Voll-Visualisierung.
 *
 *  Bekannte Einschränkung: Beim Reorder wird die neue Grid-Position
 *  nicht FLIP-animiert (das Layout springt). Drag-„Aufgreifen" (Scale +
 *  Schatten) und die wandernde Einfügelinie geben Feedback; ein echtes
 *  Reflow-Easing wäre eine spätere Ausbaustufe.
 * ============================================================ */

export type LaunchpadSpan = 1 | 2 | 3 | 4;
type Trend = "up" | "down" | "flat";
type Tone = "positive" | "critical" | "negative";

interface BaseCard {
  id: string;
  span?: LaunchpadSpan;
}

export interface LpNavCard extends BaseCard {
  kind: "nav";
  title: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  onPress?: () => void;
}
export interface LpKpiCard extends BaseCard {
  kind: "kpi";
  title: ReactNode;
  value: ReactNode;
  delta?: ReactNode;
  trend?: Trend;
  tone?: Tone;
  icon?: ReactNode;
  accent?: boolean;
  onPress?: () => void;
}
export interface LpTrendCard extends BaseCard {
  kind: "trend";
  title: ReactNode;
  value?: ReactNode;
  delta?: ReactNode;
  trend?: Trend;
  data: number[];
  /** Voll-Visualisierung im Drill-down-Popup (Default: großer AreaChart). */
  detail?: ReactNode;
}
export interface LpListRowModel {
  id: string;
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
}
export interface LpListCard extends BaseCard {
  kind: "list";
  title: ReactNode;
  icon?: ReactNode;
  count?: ReactNode;
  rows: LpListRowModel[];
  /** Max. sichtbare Zeilen (Rest im Popup). Default 4. */
  maxRows?: number;
  onShowAll?: () => void;
  detail?: ReactNode;
}
export interface LpCustomCard extends BaseCard {
  kind: "custom";
  title?: ReactNode;
  icon?: ReactNode;
  render: () => ReactNode;
  detail?: ReactNode;
}
export type LaunchpadCard =
  | LpNavCard
  | LpKpiCard
  | LpTrendCard
  | LpListCard
  | LpCustomCard;

export interface LaunchpadSection {
  id: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  cards: LaunchpadCard[];
}

export interface LaunchpadProps {
  sections: LaunchpadSection[];
  /** Aktiviert Drag-&-Drop-Reorder (react-aria, Tastatur + Pointer). */
  editable?: boolean;
  onReorder?: (sectionId: string, orderedCardIds: string[]) => void;
  className?: string;
}

function asLabel(node: ReactNode, fallback: string): string {
  return typeof node === "string" ? node : fallback;
}
function cardLabel(card: LaunchpadCard): string {
  const t = "title" in card ? card.title : undefined;
  return asLabel(t, "Karte");
}
function trendLabel(t?: Trend): string | undefined {
  return t === "up" ? "steigend" : t === "down" ? "fallend" : t === "flat" ? "unverändert" : undefined;
}

function ExpandButton({ onPress }: { onPress: () => void }) {
  return (
    <RACButton className="prn-lp-expand" aria-label="Vergrößern" onPress={onPress}>
      <Icon name="maximize" size={15} />
    </RACButton>
  );
}

/**
 * Innerer Card-Inhalt je `kind`. nav/kpi sind pressbar (Composite-Button mit
 * Hover-Lift/Press-State), trend/list/custom sind Inhaltscards mit eigenen
 * inneren Aktionen (Vergrößern, Zeilen, „Alle anzeigen").
 */
function CardBody({
  card,
  onExpand,
}: {
  card: LaunchpadCard;
  onExpand: (card: LaunchpadCard) => void;
}) {
  switch (card.kind) {
    case "nav":
      return (
        <Card className="prn-lp-card prn-lp-nav" onPress={card.onPress}>
          {card.icon != null && <div className="prn-lp-nav-icon">{card.icon}</div>}
          <div className="prn-lp-nav-title">{card.title}</div>
          {card.description != null && (
            <div className="prn-lp-nav-desc">{card.description}</div>
          )}
          {card.badge != null && <div className="prn-lp-nav-badge">{card.badge}</div>}
        </Card>
      );
    case "kpi":
      return (
        <KpiCard
          className="prn-lp-card"
          label={card.title}
          value={card.value}
          delta={card.delta}
          trend={card.trend}
          tone={card.tone}
          icon={card.icon}
          accent={card.accent}
          onPress={card.onPress}
        />
      );
    case "trend":
      return (
        <Card
          className="prn-lp-card prn-lp-trend"
          title={card.title}
          header={<ExpandButton onPress={() => onExpand(card)} />}
        >
          <div className="prn-lp-trend-head">
            {card.value != null && <span className="prn-lp-trend-value">{card.value}</span>}
            {card.delta != null && (
              <span className={cx("prn-lp-delta", card.trend && `is-${card.trend}`)}>
                {card.trend === "up" && <Icon name="chevron-up" size={13} title={trendLabel("up")} />}
                {card.trend === "down" && <Icon name="chevron-down" size={13} title={trendLabel("down")} />}
                {card.delta}
              </span>
            )}
          </div>
          <div className="prn-lp-trend-chart">
            <Sparkline data={card.data} width={260} height={48} />
          </div>
        </Card>
      );
    case "list":
      return (
        <Card
          className="prn-lp-card prn-lp-list"
          title={
            <span className="prn-lp-list-title">
              {card.icon}
              {card.title}
              {card.count != null && <span className="prn-lp-list-count">{card.count}</span>}
            </span>
          }
          header={card.detail != null ? <ExpandButton onPress={() => onExpand(card)} /> : undefined}
        >
          <List>
            {card.rows.slice(0, card.maxRows ?? 4).map((r) => (
              <ListRow
                key={r.id}
                leading={r.leading}
                title={r.title}
                subtitle={r.subtitle}
                trailing={r.trailing}
                onPress={r.onPress}
              />
            ))}
          </List>
          {card.onShowAll && (
            <RACButton className="prn-lp-showall" onPress={card.onShowAll} slot={null}>
              Alle anzeigen <Icon name="chevron-right" size={14} />
            </RACButton>
          )}
        </Card>
      );
    case "custom":
      return (
        <Card
          className="prn-lp-card prn-lp-custom"
          title={card.title}
          header={card.detail != null ? <ExpandButton onPress={() => onExpand(card)} /> : undefined}
        >
          {card.render()}
        </Card>
      );
    default:
      return null;
  }
}

function reorder(
  current: string[],
  known: (id: string) => boolean,
  movedKeys: string[],
  targetKey: string,
  position: "before" | "after" | "on",
): string[] {
  const base = current.filter(known);
  const rest = base.filter((id) => !movedKeys.includes(id));
  const tgt = rest.indexOf(targetKey);
  const at = tgt < 0 ? rest.length : position === "before" ? tgt : tgt + 1;
  rest.splice(at, 0, ...movedKeys);
  return rest;
}

function useSectionItems(section: LaunchpadSection) {
  const byId = useMemo(() => new Map(section.cards.map((c) => [c.id, c])), [section.cards]);
  const [order, setOrder] = useState<string[]>(() => section.cards.map((c) => c.id));
  const items = useMemo(() => {
    const known = order.filter((id) => byId.has(id));
    const fresh = section.cards.map((c) => c.id).filter((id) => !known.includes(id));
    return [...known, ...fresh].map((id) => byId.get(id)!).filter(Boolean);
  }, [order, byId, section.cards]);
  return { byId, order, setOrder, items };
}

/** Editierbare Section mit Drag-Reorder (react-aria GridList). */
function EditableSection({
  section,
  onReorder,
  onExpand,
}: {
  section: LaunchpadSection;
  onReorder?: (sectionId: string, orderedCardIds: string[]) => void;
  onExpand: (card: LaunchpadCard) => void;
}) {
  const { byId, order, setOrder, items } = useSectionItems(section);

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => [...keys].map((k) => ({ "text/plain": String(k) })),
    renderDropIndicator: (target) => <DropIndicator target={target} className="prn-lp-drop" />,
    onReorder(e) {
      const moved = [...e.keys].map(String);
      const next = reorder(order, (id) => byId.has(id), moved, String(e.target.key), e.target.dropPosition);
      setOrder(next);
      onReorder?.(section.id, next);
    },
  });

  return (
    <RACGridList
      aria-label={asLabel(section.title, "Karten")}
      items={items}
      layout="grid"
      selectionMode="none"
      className="prn-lp-grid"
      dragAndDropHooks={dragAndDropHooks}
    >
      {(card: LaunchpadCard) => (
        <RACGridListItem
          id={card.id}
          textValue={cardLabel(card)}
          className="prn-lp-cell"
          data-span={card.span ?? 1}
        >
          <CardBody card={card} onExpand={onExpand} />
        </RACGridListItem>
      )}
    </RACGridList>
  );
}

/** Statische Section ohne Reorder — schlichte, barrierearme Liste von Kacheln. */
function StaticSection({
  section,
  onExpand,
}: {
  section: LaunchpadSection;
  onExpand: (card: LaunchpadCard) => void;
}) {
  return (
    <ul className="prn-lp-grid" role="list" aria-label={asLabel(section.title, "Karten")}>
      {section.cards.map((card) => (
        <li key={card.id} className="prn-lp-cell" data-span={card.span ?? 1}>
          <CardBody card={card} onExpand={onExpand} />
        </li>
      ))}
    </ul>
  );
}

/** Voll-Visualisierung im Drill-down-Popup. */
function CardDetail({ card }: { card: LaunchpadCard }) {
  if ("detail" in card && card.detail != null) return <>{card.detail}</>;
  if (card.kind === "trend") {
    return (
      <div className="prn-lp-detail">
        <div className="prn-lp-trend-head">
          {card.value != null && <span className="prn-lp-trend-value">{card.value}</span>}
          {card.delta != null && (
            <span className={cx("prn-lp-delta", card.trend && `is-${card.trend}`)}>
              {card.trend === "up" && <Icon name="chevron-up" size={13} title={trendLabel("up")} />}
              {card.trend === "down" && <Icon name="chevron-down" size={13} title={trendLabel("down")} />}
              {card.delta}
            </span>
          )}
        </div>
        <AreaChart data={card.data} width={520} height={260} showAxes />
      </div>
    );
  }
  return null;
}

/**
 * Launchpad — komponiert Sections aus polymorphen Cards (`kind`).
 * `editable` schaltet Drag-Reorder frei; Cards mit `detail`/`trend`
 * öffnen ein Drill-down-Popup mit der Voll-Visualisierung.
 */
export function Launchpad({ sections, editable = false, onReorder, className }: LaunchpadProps) {
  const [expanded, setExpanded] = useState<LaunchpadCard | null>(null);
  const onExpand = useCallback((c: LaunchpadCard) => setExpanded(c), []);

  return (
    <div className={cx("prn-launchpad", className)} data-editable={editable ? "" : undefined}>
      {sections.map((s) => (
        <section className="prn-lp-section" key={s.id}>
          {(s.title != null || s.subtitle != null) && (
            <header className="prn-lp-section-head">
              {s.icon != null && <span className="prn-lp-section-icon">{s.icon}</span>}
              {s.title != null && <h2 className="prn-lp-section-title">{s.title}</h2>}
              {s.subtitle != null && <span className="prn-lp-section-sub">{s.subtitle}</span>}
            </header>
          )}
          {editable ? (
            <EditableSection section={s} onReorder={onReorder} onExpand={onExpand} />
          ) : (
            <StaticSection section={s} onExpand={onExpand} />
          )}
        </section>
      ))}

      {expanded != null && (
        <Modal
          isOpen
          onOpenChange={(o) => !o && setExpanded(null)}
          title={cardLabel(expanded)}
          className="prn-lp-modal"
        >
          <CardDetail card={expanded} />
        </Modal>
      )}
    </div>
  );
}
