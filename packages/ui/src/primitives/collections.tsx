import type { ReactNode } from "react";
import {
  ListBox as RACListBox,
  type ListBoxProps as RACListBoxProps,
  ListBoxItem as RACListBoxItem,
  type ListBoxItemProps as RACListBoxItemProps,
  GridList as RACGridList,
  type GridListProps as RACGridListProps,
  GridListItem as RACGridListItem,
  type GridListItemProps as RACGridListItemProps,
  TagGroup as RACTagGroup,
  type TagGroupProps as RACTagGroupProps,
  TagList as RACTagList,
  type TagListProps as RACTagListProps,
  Tag as RACTag,
  type TagProps as RACTagProps,
  Label,
  Button as RACButton,
} from "react-aria-components";
import { cx } from "../utils";
import "./overlays.css";
import "./forms.css";
import "./collections.css";

/* ---------------- ListBox ---------------- */

export interface ListBoxProps<T extends object> extends Omit<RACListBoxProps<T>, "className"> {
  className?: string;
}

export function ListBox<T extends object>({ className, ...props }: ListBoxProps<T>) {
  return (
    <RACListBox {...props} className={cx("prn-listbox prn-listbox-standalone", className)} />
  );
}

export interface ListBoxOptionProps extends Omit<RACListBoxItemProps, "className"> {
  className?: string;
}

export function ListBoxOption({ className, ...props }: ListBoxOptionProps) {
  return <RACListBoxItem {...props} className={cx("prn-option", className)} />;
}

/* ---------------- GridList ---------------- */

export interface GridListProps<T extends object> extends Omit<RACGridListProps<T>, "className"> {
  className?: string;
}

export function GridList<T extends object>({ className, ...props }: GridListProps<T>) {
  return <RACGridList {...props} className={cx("prn-gridlist", className)} />;
}

export interface GridListItemProps extends Omit<RACGridListItemProps, "className"> {
  className?: string;
  children?: ReactNode;
}

export function GridListItem({ className, children, ...props }: GridListItemProps) {
  return (
    <RACGridListItem {...props} className={cx("prn-gridlist-item", className)}>
      {children}
    </RACGridListItem>
  );
}

/* ---------------- TagGroup ---------------- */

export interface TagGroupProps<T extends object>
  extends Omit<RACTagGroupProps, "className" | "children"> {
  /** Optionales Label über der Chip-Reihe. */
  label?: ReactNode;
  /** Tags als statische Children oder via items/renderTag. */
  children: ReactNode;
  /** Inhalt, wenn keine Tags vorhanden sind. */
  renderEmptyState?: RACTagListProps<T>["renderEmptyState"];
  /** Dynamische Item-Quelle für die TagList. */
  items?: RACTagListProps<T>["items"];
  className?: string;
}

export function TagGroup<T extends object>({
  label,
  children,
  renderEmptyState,
  items,
  className,
  ...props
}: TagGroupProps<T>) {
  return (
    <RACTagGroup {...props} className={cx("prn-taggroup", className)}>
      {label && <Label className="prn-field-label">{label}</Label>}
      <RACTagList className="prn-taglist" items={items} renderEmptyState={renderEmptyState}>
        {children}
      </RACTagList>
    </RACTagGroup>
  );
}

export interface TagProps extends Omit<RACTagProps, "className"> {
  children?: ReactNode;
  className?: string;
}

export function Tag({ children, className, textValue, ...props }: TagProps) {
  const derivedTextValue =
    textValue ?? (typeof children === "string" ? children : undefined);
  return (
    <RACTag {...props} textValue={derivedTextValue} className={cx("prn-tag", className)}>
      {({ allowsRemoving }) => (
        <>
          <span className="prn-tag-label">{children}</span>
          {allowsRemoving && (
            <RACButton slot="remove" className="prn-tag-remove" aria-label="Entfernen">
              <svg viewBox="0 0 14 14" aria-hidden className="prn-tag-remove-icon">
                <path d="M4 4 L10 10 M10 4 L4 10" />
              </svg>
            </RACButton>
          )}
        </>
      )}
    </RACTag>
  );
}
