import type { ReactNode } from "react";
import { DialogTrigger, Button as RACButton } from "react-aria-components";
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
  className,
  "aria-label": ariaLabel = "Filter",
}: FilterBarProps) {
  const hasActive = !!activeFilters && activeFilters.length > 0;

  return (
    <div className={cx("prn-filterbar", className)} role="search" aria-label={ariaLabel}>
      <div className="prn-filterbar-row">
        {children}

        {moreFields && (
          <FilterField label={" "}>
            <DialogTrigger>
              <Button variant="tinted">{moreLabel}</Button>
              <Popover placement="bottom start">
                <div className="prn-filter-more">{moreFields}</div>
              </Popover>
            </DialogTrigger>
          </FilterField>
        )}

        {actions && (
          <>
            <span className="prn-filterbar-spacer" />
            <div className="prn-filterbar-actions">{actions}</div>
          </>
        )}
      </div>

      {hasActive && (
        <div className="prn-filter-chips" aria-label="Aktive Filter">
          {activeFilters!.map((f) => (
            <span key={f.id} className="prn-filter-chip">
              {f.label && <span className="prn-filter-chip-label">{f.label}:</span>}
              <span className="prn-filter-chip-value">{f.value}</span>
              {onRemoveFilter && (
                <RACButton
                  className="prn-filter-chip-remove"
                  aria-label="Filter entfernen"
                  onPress={() => onRemoveFilter(f.id)}
                >
                  <span aria-hidden>×</span>
                </RACButton>
              )}
            </span>
          ))}
          {onClearAll && (
            <RACButton className="prn-filter-clear" onPress={onClearAll}>
              Zurücksetzen
            </RACButton>
          )}
        </div>
      )}
    </div>
  );
}
