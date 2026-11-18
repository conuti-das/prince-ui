import { useId, useState, type ReactNode } from "react";
import { DialogTrigger, Button as RACButton } from "react-aria-components";
import { Icon } from "../icons/icons";
import { Button } from "../primitives/forms";
import { Popover } from "../primitives/overlays";
import { cx } from "../utils";
import "./data.css";

/* ---------------- FilterField ----------------
 * Label + frei wählbarer Control-Slot (z. B. <Select>, <TextField>, <SearchField>).
 * Domänenfrei — der Konsument liefert das eigentliche Control als children. */

export interface FilterFieldProps {
  /** Sichtbares Label über dem Control. */
  label?: ReactNode;
  /** Das Eingabe-Control (Select, TextField, …). */
  children: ReactNode;
  className?: string;
}

export function FilterField({ label, children, className }: FilterFieldProps) {
  return (
    <div className={cx("prn-filter-field", className)}>
      {label && <span className="prn-filter-field-label">{label}</span>}
      <div className="prn-filter-field-control">{children}</div>
    </div>
  );
}

/* ---------------- aktive-Filter-Chips ---------------- */

export interface ActiveFilter {
  /** Stabile ID des Filters (z. B. Feldname). */
  id: string;
  /** Label, z. B. "Sparte". */
  label?: ReactNode;
  /** Aktiver Wert, z. B. "Strom". */
  value: ReactNode;
}

/* ---------------- FilterBar ---------------- */

/** Feste Texte der FilterBar – für Anwendungen mit eigener Sprache oder eigenen Begriffen. */
export interface FilterBarLabels {
  /** aria-label der Entfernen-Schaltfläche am Chip. Default „Filter entfernen“. */
  removeFilter?: string;
  /** aria-label der Chip-Gruppe. Default „Aktive Filter“. */
  activeFilters?: string;
  /** Text der Zurücksetzen-Aktion (`onClearAll`). Default „Zurücksetzen“. */
  clearAll?: string;
  /** Text des Umschalters bei `collapsible`. Default „Filter“. */
  toggle?: string;
}

export interface FilterBarProps {
  /** Direkt sichtbare Filter-Felder (`FilterField`). */
  children: ReactNode;
  /** In den "Mehr Filter"-Überlauf ausgelagerte Felder. */
  moreFields?: ReactNode;
  /** Beschriftung des Überlauf-Buttons. */
  moreLabel?: ReactNode;
  /** Aktuell aktive Filter → werden als Chips gezeigt. */
  activeFilters?: ActiveFilter[];
  /** Einzelnen Filter entfernen (X am Chip). */
  onRemoveFilter?: (id: string) => void;
  /** Alle Filter zurücksetzen ("Zurücksetzen"-Aktion, nur bei aktiven Filtern). */
  onClearAll?: () => void;
  /** Zusätzliche Aktionen rechts (z. B. "Anwenden", Suche). */
  actions?: ReactNode;
  /**
   * Kompakte Darstellung (z. B. Telefon): die Felder (`children`, `moreFields`, `actions`) liegen in einem
   * aufklappbaren Bereich hinter einem Umschalter mit der Zahl der aktiven Filter; `moreFields` stehen dort
   * direkt unter den Feldern statt im Popover. Die Chips bleiben sichtbar.
   */
  collapsible?: boolean;
  /** Immer sichtbar neben dem Umschalter, auch eingeklappt (typisch: die Suche). Nur mit `collapsible`. */
  pinned?: ReactNode;
  /** Aufgeklappt (gesteuert). Nur mit `collapsible`. */
  expanded?: boolean;
  /** Anfangszustand (ungesteuert). Default `false`. */
  defaultExpanded?: boolean;
  /** Wechsel auf-/zugeklappt. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Feste Texte überschreiben. */
  labels?: FilterBarLabels;
  className?: string;
  "aria-label"?: string;
}

export function FilterBar({
  children,
  moreFields,
  moreLabel = "Mehr Filter",
  activeFilters,
  onRemoveFilter,
  onClearAll,
  actions,
  collapsible = false,
  pinned,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  labels,
  className,
  "aria-label": ariaLabel = "Filter",
}: FilterBarProps) {
  const hasActive = !!activeFilters && activeFilters.length > 0;
  const [internal, setInternal] = useState(defaultExpanded);
  const open = expanded ?? internal;
  const panelId = useId();
  const toggle = () => {
    if (expanded === undefined) setInternal(!open);
    onExpandedChange?.(!open);
  };
  const count = activeFilters?.length ?? 0;

  const actionsBlock = actions && (
    <>
      <span className="prn-filterbar-spacer" />
      <div className="prn-filterbar-actions">{actions}</div>
    </>
  );

  return (
    <div className={cx("prn-filterbar", className)} role="search" aria-label={ariaLabel} data-collapsible={collapsible || undefined}>
      {collapsible ? (
        <>
          <div className="prn-filterbar-row prn-filterbar-head">
            {pinned && <div className="prn-filterbar-pinned">{pinned}</div>}
            <Button
              variant="tinted"
              className="prn-filterbar-toggle"
              aria-expanded={open}
              aria-controls={panelId}
              onPress={toggle}
            >
              <span>{labels?.toggle ?? "Filter"}</span>
              {count > 0 && <span className="prn-filterbar-count">{count}</span>}
              <Icon name="chevron-down" size={16} className="prn-filterbar-chevron" />
            </Button>
          </div>
          <div id={panelId} className="prn-filterbar-panel" hidden={!open}>
            <div className="prn-filterbar-row">
              {children}
              {actionsBlock}
            </div>
            {moreFields && <div className="prn-filterbar-row prn-filterbar-more-inline">{moreFields}</div>}
          </div>
        </>
      ) : (
        <div className="prn-filterbar-row">
          {children}

          {moreFields && (
            <FilterField label={"\u00a0"} className="prn-filterbar-more">
              <DialogTrigger>
                <Button variant="tinted">{moreLabel}</Button>
                <Popover placement="bottom start">
                  <div className="prn-filter-more">{moreFields}</div>
                </Popover>
              </DialogTrigger>
            </FilterField>
          )}

          {actionsBlock}
        </div>
      )}

      {hasActive && (
        <div className="prn-filter-chips" role="group" aria-label={labels?.activeFilters ?? "Aktive Filter"}>
          {activeFilters!.map((f) => (
            <span key={f.id} className="prn-filter-chip">
              {f.label && <span className="prn-filter-chip-label">{f.label}:</span>}
              <span className="prn-filter-chip-value">{f.value}</span>
              {onRemoveFilter && (
                <RACButton
                  className="prn-filter-chip-remove"
                  aria-label={labels?.removeFilter ?? "Filter entfernen"}
                  onPress={() => onRemoveFilter(f.id)}
                >
                  <span aria-hidden>×</span>
                </RACButton>
              )}
            </span>
          ))}
          {onClearAll && (
            <RACButton className="prn-filter-clear" onPress={onClearAll}>
              {labels?.clearAll ?? "Zurücksetzen"}
            </RACButton>
          )}
        </div>
      )}
    </div>
  );
}
