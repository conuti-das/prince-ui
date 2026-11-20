import type { ReactNode } from "react";
import {
  Toolbar as RACToolbar,
  Group as RACGroup,
  Separator as RACSeparator,
  ToggleButton as RACToggleButton,
  type ButtonProps as RACButtonProps,
  type ToggleButtonProps as RACToggleButtonProps,
} from "react-aria-components";
import { Button } from "./forms";
import { IconButton } from "./icon-button";
import { Tooltip } from "./overlays";
import { Icon, type IconName } from "../icons/icons";
import { useFieldSize, type FieldSize } from "./size";
import { cx } from "../utils";
import "./view-toolbar.css";

/* ---------------- Werkzeugleiste der Ansicht ----------------
 * Regelwerk „Ansichtssteuerung“: Zoom, Einpassen, Darstellung umschalten, Filter-Marken – neutral (grau), nie in der Leitfarbe,
 * direkt an der Ansicht, nie in der Aktionsleiste des Kopfes. Nichts davon geht an den Server.
 * Aufbau: ViewToolbar (role="toolbar", Pfeiltasten zwischen den Elementen) mit Gruppen; eine Gruppe mit `align="end"` steht rechts.
 * Die Leiste rollt nie: Was in der Breite nicht passt, bricht als ganze Gruppe in die nächste Zeile um (keine eigenen Rollbalken –
 * Lehre aus dem Prozessbild mit festen Rollbalken, E #153).
 */

export interface ViewToolbarProps {
  /** Pflicht: Name der Leiste für Vorleseprogramme, z. B. „Ansicht des Prozessbilds“. */
  "aria-label": string;
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function ViewToolbar({ children, className, ...props }: ViewToolbarProps) {
  return <RACToolbar {...props} className={cx("prn-vtb", className)}>{children}</RACToolbar>;
}

export interface ViewToolbarGroupProps {
  /** Name der Gruppe (z. B. „Legende“, „Zoom“). */
  "aria-label"?: string;
  /** `end`: Gruppe rechtsbündig (Zoom-Gruppe). */
  align?: "start" | "end";
  /** Elemente innerhalb der Gruppe dürfen umbrechen (Filter-Marken). Default: die Gruppe bleibt ganz in einer Zeile. */
  wrap?: boolean;
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function ViewToolbarGroup({ align = "start", wrap, children, className, ...props }: ViewToolbarGroupProps) {
  return (
    <RACGroup {...props} className={cx("prn-vtb-gruppe", className)} data-align={align} data-wrap={wrap || undefined}>
      {children}
    </RACGroup>
  );
}

/** Senkrechter Trenner zwischen Gruppen derselben Zeile. */
export function ViewToolbarSeparator() {
  return <RACSeparator orientation="vertical" className="prn-vtb-trenner" />;
}

/* ---- Knopf der Ansicht mit Text („Auf Pfad“, „Einpassen“): grau wie der IconButton, nie Leitfarbe ---- */
export interface ViewButtonProps extends Omit<RACButtonProps, "className" | "children"> {
  icon?: IconName;
  children: ReactNode;
  /** Tooltip (z. B. was „Auf Pfad“ genau zeigt). */
  tooltip?: string;
  size?: FieldSize;
  className?: string;
  "data-testid"?: string;
}

const ICON_GROESSE: Record<FieldSize, number> = { s: 14, m: 16, l: 18 };

export function ViewButton({ icon, children, tooltip, size, className, ...props }: ViewButtonProps) {
  const groesse = useFieldSize(size);
  const knopf = (
    <Button {...props} variant="plain" size={groesse} className={cx("prn-viewbutton", className)}>
      {icon && <Icon name={icon} size={ICON_GROESSE[groesse]} />}
      {children}
    </Button>
  );
  return tooltip ? <Tooltip trigger={knopf}>{tooltip}</Tooltip> : knopf;
}

/* ---- Filter-Marke zum Umschalten: hebt eine Teilmenge hervor oder filtert; gedrückt = aktiv (aria-pressed) ---- */
export interface FilterChipProps extends Omit<RACToggleButtonProps, "className" | "children"> {
  children: ReactNode;
  /** Anzahl der Einträge (Teil des Namens, z. B. „Fehler 3“). */
  count?: number;
  /** Farbmarke vor dem Text (z. B. Punkt der Legende); dekorativ. */
  mark?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function FilterChip({ children, count, mark, className, ...props }: FilterChipProps) {
  return (
    <RACToggleButton {...props} className={cx("prn-filterchip", className)}>
      {mark != null && <span className="prn-filterchip-marke" aria-hidden>{mark}</span>}
      <span className="prn-filterchip-text">{children}</span>
      {count != null && <span className="prn-filterchip-zahl">{count}</span>}
    </RACToggleButton>
  );
}

/* ---- Zoom-Gruppe: überall dieselbe Reihenfolge und dieselben Namen ----
 * [weitere Ansichtsknöpfe, z. B. „Auf Pfad“] · Einpassen · Verkleinern (−) · Vergrößern (+) · Info
 */
export interface ZoomGroupProps {
  onZoomOut: () => void;
  onZoomIn: () => void;
  /** Ganz einpassen („Einpassen“). Ohne Angabe fehlt der Knopf. */
  onFit?: () => void;
  canZoomOut?: boolean;
  canZoomIn?: boolean;
  fitLabel?: string;
  fitTooltip?: string;
  zoomOutLabel?: string;
  zoomInLabel?: string;
  /** Info zur Bedienung als letztes Element (grauer Icon-Knopf; Tooltip oder eigener Dialog über `onPress`). */
  info?: { label: string; tooltip?: string; onPress?: () => void; "data-testid"?: string };
  /** Name der Gruppe. Default „Zoom“. */
  "aria-label"?: string;
  /** Weitere Knöpfe der Ansicht vor „Einpassen“ (ViewButton, z. B. „Auf Pfad“). */
  children?: ReactNode;
  size?: FieldSize;
  fitTestId?: string;
  zoomOutTestId?: string;
  zoomInTestId?: string;
  "data-testid"?: string;
}

export function ZoomGroup({
  onZoomOut, onZoomIn, onFit, canZoomOut = true, canZoomIn = true, fitLabel = "Einpassen", fitTooltip, zoomOutLabel = "Verkleinern",
  zoomInLabel = "Vergrößern", info, "aria-label": ariaLabel = "Zoom", children, size, fitTestId, zoomOutTestId, zoomInTestId, "data-testid": testId,
}: ZoomGroupProps) {
  return (
    <ViewToolbarGroup aria-label={ariaLabel} align="end" data-testid={testId}>
      {children}
      {onFit && <ViewButton icon="fit" onPress={onFit} tooltip={fitTooltip} size={size} data-testid={fitTestId}>{fitLabel}</ViewButton>}
      <IconButton icon="zoom-out" label={zoomOutLabel} onPress={onZoomOut} isDisabled={!canZoomOut} size={size} data-testid={zoomOutTestId} />
      <IconButton icon="zoom-in" label={zoomInLabel} onPress={onZoomIn} isDisabled={!canZoomIn} size={size} data-testid={zoomInTestId} />
      {info && <IconButton icon="info" label={info.label} tooltip={info.tooltip} onPress={info.onPress} size={size} data-testid={info["data-testid"]} />}
    </ViewToolbarGroup>
  );
}
