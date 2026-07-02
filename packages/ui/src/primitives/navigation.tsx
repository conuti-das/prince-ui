import type { ReactNode } from "react";
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

export function TabBar({ className, ...props }: Omit<TabListProps<object>, "className"> & { className?: string }) {
  return <TabList {...props} className={cx("prn-tablist", className)} />;
}

export function Tab({ className, ...props }: Omit<TabProps, "className"> & { className?: string }) {
  return <RACTab {...props} className={cx("prn-tab", className)} />;
}

export function TabPanel({ className, ...props }: Omit<TabPanelProps, "className"> & { className?: string; children?: ReactNode }) {
  return <RACTabPanel {...props} className={cx("prn-tabpanel", className)} />;
}
