import type { ReactNode } from "react";
import {
  Tree as RACTree,
  type TreeProps as RACTreeProps,
  TreeItem as RACTreeItem,
  type TreeItemProps as RACTreeItemProps,
  TreeItemContent as RACTreeItemContent,
  Button as RACButton,
  Checkbox as RACCheckbox,
} from "react-aria-components";
import { cx } from "../utils";
import "./forms.css";
import "./tree.css";

/* ---------------- Tree ---------------- */

export interface TreeProps<T extends object> extends Omit<RACTreeProps<T>, "className"> {
  className?: string;
}

export function Tree<T extends object>({ className, ...props }: TreeProps<T>) {
  return <RACTree {...props} className={cx("prn-tree", className)} />;
}

/* ---------------- TreeItem ---------------- */

export interface TreeItemProps extends Omit<RACTreeItemProps, "className" | "children" | "textValue"> {
  /** Beschriftung der Zeile; dient zugleich als textValue für Typeahead. */
  title: ReactNode;
  /** Optionaler textValue, falls title kein reiner String ist. */
  textValue?: string;
  /** Verschachtelte TreeItems. */
  children?: ReactNode;
  className?: string;
}

export function TreeItem({ title, textValue, children, className, ...props }: TreeItemProps) {
  const resolvedTextValue = textValue ?? (typeof title === "string" ? title : "");
  return (
    <RACTreeItem
      {...props}
      textValue={resolvedTextValue}
      className={cx("prn-tree-item", className)}
    >
      <RACTreeItemContent>
        {({ hasChildItems, selectionMode }) => (
          <div className="prn-tree-row">
            {selectionMode !== "none" && (
              <RACCheckbox slot="selection" className="prn-tree-check">
                <span className="prn-tree-check-box" aria-hidden>
                  <svg viewBox="0 0 18 18" className="prn-tree-check-mark">
                    <polyline points="4,9 8,13 14,5" />
                  </svg>
                </span>
              </RACCheckbox>
            )}
            {hasChildItems ? (
              <RACButton slot="chevron" className="prn-tree-chevron" aria-label="Aufklappen">
                <svg viewBox="0 0 16 16" aria-hidden>
                  <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </RACButton>
            ) : (
              <span className="prn-tree-chevron prn-tree-chevron-spacer" aria-hidden />
            )}
            <span className="prn-tree-label">{title}</span>
          </div>
        )}
      </RACTreeItemContent>
      {children}
    </RACTreeItem>
  );
}
