import type { ReactNode } from "react";
import {
  Table as RACTable,
  type TableProps as RACTableProps,
  TableHeader as RACTableHeader,
  type TableHeaderProps as RACTableHeaderProps,
  TableBody as RACTableBody,
  type TableBodyProps as RACTableBodyProps,
  Column as RACColumn,
  type ColumnProps as RACColumnProps,
  Row as RACRow,
  type RowProps as RACRowProps,
  Cell as RACCell,
  type CellProps as RACCellProps,
  Checkbox as RACCheckbox,
  type CheckboxProps as RACCheckboxProps,
  useTableOptions,
} from "react-aria-components";
import { cx } from "../utils";
import "./forms.css";
import "./table-aria.css";

/* ---------------- Table ---------------- */

export interface TableProps extends Omit<RACTableProps, "className"> {
  /** Header bleibt beim Scrollen oben kleben (Container muss eine feste Höhe haben). */
  stickyHeader?: boolean;
  className?: string;
}

export function Table({ stickyHeader, className, ...props }: TableProps) {
  return (
    <RACTable
      {...props}
      data-sticky={stickyHeader || undefined}
      className={cx("prn-table", className)}
    />
  );
}

/* ---------------- TableHeader ---------------- */

export interface TableHeaderProps<T extends object> extends Omit<RACTableHeaderProps<T>, "className"> {
  className?: string;
}

export function TableHeader<T extends object>({ className, children, ...props }: TableHeaderProps<T>) {
  const { selectionBehavior, selectionMode } = useTableOptions();
  // Bei statischen Kindern wird die Auswahl-Spalte automatisch vorangestellt; bei
  // dynamischen (Funktions-)Kindern reichen wir unverändert durch.
  if (typeof children === "function") {
    return <RACTableHeader {...props} className={cx("prn-table-header", className)}>{children}</RACTableHeader>;
  }
  return (
    <RACTableHeader {...props} className={cx("prn-table-header", className)}>
      {selectionBehavior === "toggle" && (
        <RACColumn className="prn-table-column prn-table-selection-cell">
          {selectionMode === "multiple" && <SelectionCheckbox slot="selection" />}
        </RACColumn>
      )}
      {children}
    </RACTableHeader>
  );
}

/* ---------------- TableBody ---------------- */

export interface TableBodyProps<T extends object> extends Omit<RACTableBodyProps<T>, "className"> {
  className?: string;
}

export function TableBody<T extends object>({ className, ...props }: TableBodyProps<T>) {
  return <RACTableBody {...props} className={cx("prn-table-body", className)} />;
}

/* ---------------- Column ---------------- */

export interface ColumnProps extends Omit<RACColumnProps, "className" | "children"> {
  children?: ReactNode;
  className?: string;
}

export function Column({ children, className, ...props }: ColumnProps) {
  return (
    <RACColumn {...props} className={cx("prn-table-column", className)}>
      {(renderProps) => (
        <span className="prn-table-column-inner">
          {children as ReactNode}
          {renderProps.allowsSorting && (
            <span aria-hidden className="prn-table-sort-indicator" data-direction={renderProps.sortDirection}>
              {renderProps.sortDirection === "ascending"
                ? "▲"
                : renderProps.sortDirection === "descending"
                  ? "▼"
                  : ""}
            </span>
          )}
        </span>
      )}
    </RACColumn>
  );
}

/* ---------------- Row ---------------- */

export interface RowProps<T extends object> extends Omit<RACRowProps<T>, "className"> {
  className?: string;
}

export function Row<T extends object>({ className, children, columns, ...props }: RowProps<T>) {
  const { selectionBehavior } = useTableOptions();
  // Dynamische (Funktions-)Kinder unverändert durchreichen; bei statischen Zellen
  // wird im Auswahl-Modus die Checkbox-Zelle vorangestellt.
  if (typeof children === "function") {
    return <RACRow {...props} columns={columns} className={cx("prn-table-row", className)}>{children}</RACRow>;
  }
  return (
    <RACRow {...props} columns={columns} className={cx("prn-table-row", className)}>
      {selectionBehavior === "toggle" && (
        <Cell className="prn-table-selection-cell">
          <SelectionCheckbox slot="selection" />
        </Cell>
      )}
      {children}
    </RACRow>
  );
}

/* ---------------- Cell ---------------- */

export interface CellProps extends Omit<RACCellProps, "className"> {
  className?: string;
}

export function Cell({ className, ...props }: CellProps) {
  return <RACCell {...props} className={cx("prn-table-cell", className)} />;
}

/* ---------------- Auswahl-Checkbox (Prince-Look, wie forms.tsx) ---------------- */

function SelectionCheckbox(props: Omit<RACCheckboxProps, "className">) {
  return (
    <RACCheckbox {...props} className="prn-checkbox prn-table-checkbox">
      <span className="prn-checkbox-box" aria-hidden>
        <svg viewBox="0 0 18 18" className="prn-checkbox-check">
          <polyline points="4,9 8,13 14,5" />
        </svg>
      </span>
    </RACCheckbox>
  );
}
