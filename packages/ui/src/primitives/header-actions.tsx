import { Fragment, useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./forms";
import { IconButton } from "./icon-button";
import { Menu, MenuItem, MenuSection, MenuSeparator } from "./overlays";
import { Icon, type IconName } from "../icons/icons";
import { cx } from "../utils";
import "./header-actions.css";

/* ---------------- HeaderActions: Aktionsleiste im Kopf eines Objekts ----------------
 * Regelwerk „Aktion, Hilfsaktion, Navigation, Ansicht“ (entschieden 19.11.2026): rechts im Kopf, eine Zeile, feste Reihenfolge von links nach rechts:
 *   Rücknahme (rot getönt) · Sekundär (getönt) · Primär (gefüllt, höchstens eine) · Trenner · Hilfsaktionen (neutrale Icon-Knöpfe) · Menü „⋯“ (immer zuletzt).
 * Das Menü hat einen festen Aufbau: weitere Aktionen (dieselbe Farbcodierung) · Ansicht und Export · Hilfe.
 * Was nicht in die Breite passt, wandert ins Menü – in fester Reihenfolge: zuerst die Rücknahmen, dann die sekundären Aktionen (je von links), dann die
 * Hilfsaktionen; die primäre Aktion bleibt immer sichtbar. `layout="menu"`: alle Aktionen im Menü (Entwurf für die Entscheidung des Auftraggebers).
 * Die Leiste füllt die Breite, die ihr der Kopf gibt (`flex: 1 1 auto`, rechtsbündig) und misst darin.
 */

export type HeaderActionKind = "withdraw" | "secondary" | "primary";

export interface HeaderAction {
  id: string;
  label: string;
  /** Rolle: Rücknahme (rot), sekundär (getönt), primär (gefüllt; höchstens eine). */
  kind: HeaderActionKind;
  onAction: () => void;
  /** Icon vor dem Text, z. B. „send“ bei Wirkung beim Marktpartner. */
  icon?: IconName;
  isDisabled?: boolean;
  /** Grund, warum die Aktion deaktiviert ist – steht sichtbar daneben (Zusatzregel 1). */
  disabledReason?: string;
  "data-testid"?: string;
}

export interface HeaderHelper {
  id: string;
  /** Name für Vorleseprogramme und Tooltip (Pflicht). */
  label: string;
  icon: IconName;
  onAction: () => void;
  isDisabled?: boolean;
  "data-testid"?: string;
}

export type HeaderMenuSection = "actions" | "view" | "help";

export interface HeaderMenuEntry {
  id: string;
  label: string;
  /** Abschnitt im Menü: weitere Aktionen · Ansicht und Export · Hilfe. */
  section: HeaderMenuSection;
  /** nur im Abschnitt „actions“: Farbcodierung wie die Knöpfe. */
  kind?: HeaderActionKind;
  icon?: IconName;
  onAction: () => void;
  isDisabled?: boolean;
  "data-testid"?: string;
}

export interface HeaderActionsProps {
  actions?: HeaderAction[];
  helpers?: HeaderHelper[];
  /** feste Einträge des Menüs „⋯“ (zusätzlich zu dem, was aus der Zeile hineinwandert). */
  menu?: HeaderMenuEntry[];
  /** `row` (Default): Aktionen in der Zeile, Rest im Menü. `menu`: alle Aktionen im Menü, nur Hilfsaktionen und „⋯“ in der Zeile. */
  layout?: "row" | "menu";
  /** Name des Menüknopfs. Default „Weitere Aktionen“. */
  menuLabel?: string;
  /** Überschriften der Menüabschnitte. */
  sectionLabels?: Partial<Record<HeaderMenuSection, string>>;
  /** Name der Gruppe für Vorleseprogramme. Default „Aktionen“. */
  "aria-label"?: string;
  className?: string;
  "data-testid"?: string;
  /** data-testid des Menüknopfs „⋯“. Default `${data-testid}-menu` (bestehende testids einer Seite bleiben so erhalten). */
  menuTestId?: string;
}

const RANG: Record<HeaderActionKind, number> = { withdraw: 0, secondary: 1, primary: 2 };
const ABSCHNITTE: HeaderMenuSection[] = ["actions", "view", "help"];
const STANDARD_TITEL: Record<HeaderMenuSection, string> = { actions: "Weitere Aktionen", view: "Ansicht und Export", help: "Hilfe" };
const LUECKE = 8;

/** Aktionen in fester Reihenfolge; höchstens eine primäre (weitere werden sekundär, mit Warnung). */
export function ordneAktionen(actions: HeaderAction[]): HeaderAction[] {
  let primaer = 0;
  const geordnet = actions
    .map((a, i) => ({ a, i }))
    .sort((x, y) => RANG[x.a.kind] - RANG[y.a.kind] || x.i - y.i)
    .map(({ a }) => {
      if (a.kind !== "primary") return a;
      primaer += 1;
      return primaer === 1 ? a : { ...a, kind: "secondary" as const };
    });
  if (primaer > 1 && typeof console !== "undefined") console.warn(`HeaderActions: höchstens eine primäre Aktion je Ansicht (${primaer} übergeben) – weitere werden als sekundär gezeigt.`);
  // die herabgestufte steht nach den sekundären, vor der primären
  return geordnet.sort((x, y) => RANG[x.kind] - RANG[y.kind]);
}

/** Reihenfolge, in der Einträge der Zeile ins Menü wandern: Rücknahmen, sekundäre (je von links), dann Hilfsaktionen. Die primäre nie. */
export function ueberlaufReihenfolge(actions: HeaderAction[], helpers: HeaderHelper[]): string[] {
  return [...actions.filter((a) => a.kind === "withdraw"), ...actions.filter((a) => a.kind === "secondary")].map((a) => `a:${a.id}`).concat(helpers.map((h) => `h:${h.id}`));
}

/** Welche Einträge ins Menü müssen, damit die Zeile in `verfuegbar` px passt (Breiten je Schlüssel, Menüknopf und Trenner fest). */
export function berechneUeberlauf(o: { reihenfolge: string[]; breiten: Record<string, number>; feste: number; verfuegbar: number; schluessel: string[] }): Set<string> {
  const weg = new Set<string>();
  const summe = () => o.schluessel.filter((k) => !weg.has(k)).reduce((s, k) => s + (o.breiten[k] ?? 0) + LUECKE, 0) + o.feste;
  for (const k of o.reihenfolge) {
    if (summe() <= o.verfuegbar) break;
    weg.add(k);
  }
  return weg;
}

export function HeaderActions({ actions = [], helpers = [], menu = [], layout = "row", menuLabel = "Weitere Aktionen", sectionLabels, className, "aria-label": ariaLabel = "Aktionen", "data-testid": testId, menuTestId }: HeaderActionsProps) {
  const geordnet = ordneAktionen(actions);
  const ref = useRef<HTMLDivElement>(null);
  const breiten = useRef<Record<string, number>>({});
  const [weg, setWeg] = useState<Set<string>>(new Set());

  const schluessel = [...(layout === "menu" ? [] : geordnet.map((a) => `a:${a.id}`)), ...helpers.map((h) => `h:${h.id}`)];
  const signatur = schluessel.join("|") + geordnet.map((a) => a.label + (a.disabledReason ?? "")).join("|") + layout;

  const messen = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    for (const k of el.querySelectorAll<HTMLElement>("[data-hab-key]")) {
      const b = k.getBoundingClientRect().width;
      if (b > 0) breiten.current[k.dataset.habKey!] = b;
    }
    const menuKnopf = el.querySelector<HTMLElement>("[data-hab-menu]")?.getBoundingClientRect().width ?? 34;
    const trenner = el.querySelector<HTMLElement>("[data-hab-trenner]") ? 1 + 2 * LUECKE : 0;
    const neu = layout === "menu" ? new Set<string>() : berechneUeberlauf({
      reihenfolge: ueberlaufReihenfolge(geordnet, helpers), breiten: breiten.current, feste: menuKnopf + trenner, verfuegbar: el.clientWidth, schluessel,
    });
    setWeg((alt) => (alt.size === neu.size && [...neu].every((k) => alt.has(k)) ? alt : neu));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signatur]);

  // Neue Einträge stehen zuerst sichtbar und werden vor dem Zeichnen gemessen (Breiten je Schlüssel gemerkt, auch für ausgeblendete);
  // danach blendet die Leiste das Überzählige aus. messen() setzt den Zustand nur bei Änderung – das Messen nach jedem Zeichnen kommt zur Ruhe.
  useLayoutEffect(() => { messen(); });
  useLayoutEffect(() => {
    const el = ref.current;
    const ro = typeof ResizeObserver !== "undefined" && el ? new ResizeObserver(() => messen()) : null;
    if (ro && el) ro.observe(el);
    return () => ro?.disconnect();
  }, [messen]);

  const imMenu = layout === "menu" ? geordnet : geordnet.filter((a) => weg.has(`a:${a.id}`));
  const sichtbar = layout === "menu" ? [] : geordnet.filter((a) => !weg.has(`a:${a.id}`));
  const helferImMenu = helpers.filter((h) => weg.has(`h:${h.id}`));
  const helferSichtbar = helpers.filter((h) => !weg.has(`h:${h.id}`));

  const eintraege: Record<HeaderMenuSection, ReactNode[]> = { actions: [], view: [], help: [] };
  for (const a of imMenu) eintraege.actions.push(
    <MenuItem key={`a:${a.id}`} id={`a:${a.id}`} onAction={a.onAction} isDisabled={a.isDisabled} icon={a.icon} tone={a.kind === "withdraw" ? "danger" : "action"} data-testid={a["data-testid"]} data-kind={a.kind}>{a.label}</MenuItem>);
  for (const m of menu.filter((x) => x.section === "actions")) eintraege.actions.push(
    <MenuItem key={`m:${m.id}`} id={`m:${m.id}`} onAction={m.onAction} isDisabled={m.isDisabled} icon={m.icon} tone={m.kind === "withdraw" ? "danger" : m.kind ? "action" : undefined} data-testid={m["data-testid"]} data-kind={m.kind}>{m.label}</MenuItem>);
  for (const h of helferImMenu) eintraege.view.push(
    <MenuItem key={`h:${h.id}`} id={`h:${h.id}`} onAction={h.onAction} isDisabled={h.isDisabled} icon={h.icon} data-testid={h["data-testid"]}>{h.label}</MenuItem>);
  for (const m of menu.filter((x) => x.section !== "actions")) eintraege[m.section].push(
    <MenuItem key={`m:${m.id}`} id={`m:${m.id}`} onAction={m.onAction} isDisabled={m.isDisabled} icon={m.icon} data-testid={m["data-testid"]}>{m.label}</MenuItem>);
  const abschnitte = ABSCHNITTE.filter((s) => eintraege[s].length > 0);
  const mitMenu = abschnitte.length > 0;

  const gruende = sichtbar.filter((a) => a.isDisabled && a.disabledReason);
  return (
    <div ref={ref} role="group" aria-label={ariaLabel} className={cx("prn-hab", className)} data-layout={layout} data-testid={testId}>
      {gruende.length > 0 && <span className="prn-hab-grund">{gruende.map((a) => a.disabledReason).join(" · ")}</span>}
      {sichtbar.map((a) => (
        <span key={a.id} className="prn-hab-eintrag" data-hab-key={`a:${a.id}`}>
          <Button variant={a.kind === "primary" ? "filled" : "tinted"} destructive={a.kind === "withdraw"} onPress={a.onAction} isDisabled={a.isDisabled}
            data-kind={a.kind} data-testid={a["data-testid"]}>
            {a.icon ? <Icon name={a.icon} size={16} /> : null}{a.label}
          </Button>
        </span>
      ))}
      {/* Trenner zwischen Aktionen und Hilfsaktionen/Menü */}
      {sichtbar.length > 0 && (helferSichtbar.length > 0 || mitMenu) && <span className="prn-hab-trenner" data-hab-trenner aria-hidden />}
      {helferSichtbar.map((h) => (
        <span key={h.id} className="prn-hab-eintrag" data-hab-key={`h:${h.id}`}>
          <IconButton icon={h.icon} label={h.label} onPress={h.onAction} isDisabled={h.isDisabled} data-testid={h["data-testid"]} />
        </span>
      ))}
      {mitMenu && (
        <span className="prn-hab-eintrag" data-hab-menu>
          <Menu trigger={<IconButton icon="more" label={menuLabel} tooltip={menuLabel} data-testid={menuTestId ?? (testId ? `${testId}-menu` : undefined)} />}>
            {abschnitte.map((s, i) => (
              <Fragment key={s}>
                {i > 0 && <MenuSeparator />}
                <MenuSection title={sectionLabels?.[s] ?? STANDARD_TITEL[s]}>{eintraege[s]}</MenuSection>
              </Fragment>
            ))}
          </Menu>
        </span>
      )}
    </div>
  );
}
