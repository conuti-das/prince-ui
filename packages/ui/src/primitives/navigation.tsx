import { useEffect, useRef, type ReactNode } from "react";
import {
  ToggleButtonGroup,
  type ToggleButtonGroupProps,
  ToggleButton,
  type ToggleButtonProps,
  Tabs as RACTabs,
  type TabsProps as RACTabsProps,
  TabList,
  type TabListProps,
  Tab as RACTab,
  type TabProps,
  TabPanel as RACTabPanel,
  type TabPanelProps,
} from "react-aria-components";
import { cx } from "../utils";
import { useFieldSize, type FieldSize } from "./size";
import "./navigation.css";

/* ---------------- SegmentedControl ----------------
 * Einfachauswahl (Prince-Segmented). Auf ToggleButtonGroup. */

export interface SegmentedControlProps extends Omit<ToggleButtonGroupProps, "className" | "selectionMode"> {
  className?: string;
  /** Feldgröße (s|m|l). Ohne Angabe erbt sie vom PrinceSizeProvider (Default m). */
  size?: FieldSize;
}

export function SegmentedControl({ className, disallowEmptySelection = true, size, ...props }: SegmentedControlProps) {
  const resolvedSize = useFieldSize(size);
  return (
    <ToggleButtonGroup
      {...props}
      selectionMode="single"
      disallowEmptySelection={disallowEmptySelection}
      data-size={resolvedSize}
      className={cx("prn-segmented", className)}
    />
  );
}

export interface SegmentProps extends Omit<ToggleButtonProps, "className"> {
  className?: string;
}

export function Segment({ className, ...props }: SegmentProps) {
  return <ToggleButton {...props} className={cx("prn-segment", className)} />;
}

/* ---------------- Tabs ---------------- */

export interface TabsProps extends Omit<RACTabsProps, "className"> {
  className?: string;
}
export function Tabs({ className, ...props }: TabsProps) {
  return <RACTabs {...props} className={cx("prn-tabs", className)} />;
}

/** Rand, an dem die Leiste noch Reiter verbirgt: "start", "end", "both" oder keiner. */
function ueberlauf(el: HTMLElement): "start" | "end" | "both" | undefined {
  const start = el.scrollLeft > 1;
  const ende = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
  return start && ende ? "both" : start ? "start" : ende ? "end" : undefined;
}

/** Rollt die Leiste waagrecht so, dass der gewählte Reiter ganz sichtbar ist (die Seite selbst rollt nicht). */
function gewaehltenZeigen(el: HTMLElement) {
  const tab = el.querySelector<HTMLElement>('[role="tab"][data-selected]');
  if (!tab) return;
  const r = tab.getBoundingClientRect(), l = el.getBoundingClientRect();
  const links = r.left - l.left + el.scrollLeft, rechts = links + r.width; // Lage im Rollbereich, unabhängig vom offsetParent
  const rand = 24; // Platz für den Randverlauf
  if (links - rand < el.scrollLeft) el.scrollLeft = Math.max(0, links - rand);
  else if (rechts + rand > el.scrollLeft + el.clientWidth) el.scrollLeft = rechts + rand - el.clientWidth;
}

/**
 * Reiterleiste. Passt sie nicht in die Breite, rollt sie waagrecht; ein Verlauf am Rand zeigt, dass dort weitere Reiter
 * liegen (`data-overflow="start|end|both"`), und der gewählte Reiter rollt beim Öffnen und bei jedem Wechsel in Sicht.
 */
export function TabBar({ className, ...props }: Omit<TabListProps<object>, "className"> & { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const setzen = () => {
      const u = ueberlauf(el);
      if (u) el.setAttribute("data-overflow", u);
      else el.removeAttribute("data-overflow");
    };
    // Leiste und jeder Reiter: Reiter werden breiter, wenn die Schrift nachlädt oder sich eine Zahl ändert
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => { gewaehltenZeigen(el); setzen(); }) : null;
    const beobachten = () => { ro?.observe(el); el.querySelectorAll('[role="tab"]').forEach((t) => ro?.observe(t)); };
    gewaehltenZeigen(el);
    setzen();
    beobachten();
    el.addEventListener("scroll", setzen, { passive: true });
    // Wechsel des gewählten Reiters (Maus, Tastatur oder von außen über selectedKey), neue Reiter
    const mo = new MutationObserver(() => { beobachten(); gewaehltenZeigen(el); setzen(); });
    mo.observe(el, { subtree: true, attributes: true, attributeFilter: ["data-selected"], childList: true });
    return () => { el.removeEventListener("scroll", setzen); ro?.disconnect(); mo.disconnect(); };
  }, []);
  return <TabList {...props} ref={ref} className={cx("prn-tablist", className)} />;
}

export function Tab({ className, ...props }: Omit<TabProps, "className"> & { className?: string }) {
  return <RACTab {...props} className={cx("prn-tab", className)} />;
}

export function TabPanel({ className, ...props }: Omit<TabPanelProps, "className"> & { className?: string; children?: ReactNode }) {
  return <RACTabPanel {...props} className={cx("prn-tabpanel", className)} />;
}
