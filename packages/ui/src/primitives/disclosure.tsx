import type { ReactNode } from "react";
import {
  Disclosure as RACDisclosure,
  type DisclosureProps as RACDisclosureProps,
  DisclosureGroup as RACDisclosureGroup,
  type DisclosureGroupProps as RACDisclosureGroupProps,
  DisclosurePanel as RACDisclosurePanel,
  Heading,
  Button as RACButton,
} from "react-aria-components";
import { cx } from "../utils";
import "./forms.css";
import "./disclosure.css";

/* ---------------- Disclosure ---------------- */

export interface DisclosureProps extends Omit<RACDisclosureProps, "className" | "children"> {
  /** Beschriftung des Triggers (Kopfzeile). */
  title: ReactNode;
  /** Inhalt des aufklappbaren Panels. */
  children: ReactNode;
  className?: string;
}

export function Disclosure({ title, children, className, ...props }: DisclosureProps) {
  return (
    <RACDisclosure {...props} className={cx("prn-disclosure", className)}>
      <Heading className="prn-disclosure-heading">
        <RACButton slot="trigger" className="prn-disclosure-trigger">
          <span className="prn-disclosure-title">{title}</span>
          <svg viewBox="0 0 16 16" className="prn-disclosure-chevron" aria-hidden>
            <polyline points="6,4 10,8 6,12" />
          </svg>
        </RACButton>
      </Heading>
      <RACDisclosurePanel className="prn-disclosure-panel">{children}</RACDisclosurePanel>
    </RACDisclosure>
  );
}

/* ---------------- DisclosureGroup ---------------- */

export interface DisclosureGroupProps extends Omit<RACDisclosureGroupProps, "className"> {
  className?: string;
}

export function DisclosureGroup({ className, ...props }: DisclosureGroupProps) {
  return <RACDisclosureGroup {...props} className={cx("prn-disclosure-group", className)} />;
}
