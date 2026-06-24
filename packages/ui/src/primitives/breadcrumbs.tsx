import type { ReactNode } from "react";
import {
  Breadcrumbs as RACBreadcrumbs,
  type BreadcrumbsProps as RACBreadcrumbsProps,
  Breadcrumb as RACBreadcrumb,
  type BreadcrumbProps as RACBreadcrumbProps,
  Link as RACLink,
  type LinkProps as RACLinkProps,
} from "react-aria-components";
import { cx } from "../utils";
import "./breadcrumbs.css";

/* ---------------- Breadcrumbs ---------------- */

export interface BreadcrumbsProps<T extends object> extends Omit<RACBreadcrumbsProps<T>, "className"> {
  className?: string;
}

export function Breadcrumbs<T extends object>({ className, ...props }: BreadcrumbsProps<T>) {
  return <RACBreadcrumbs {...props} className={cx("prn-breadcrumbs", className)} />;
}

/* ---------------- Breadcrumb ---------------- */

export interface BreadcrumbProps extends Omit<RACBreadcrumbProps, "className"> {
  className?: string;
}

export function Breadcrumb({ className, ...props }: BreadcrumbProps) {
  return <RACBreadcrumb {...props} className={cx("prn-breadcrumb", className)} />;
}

/* ---------------- Link ---------------- */

export interface LinkProps extends Omit<RACLinkProps, "className"> {
  children?: ReactNode;
  className?: string;
}

export function Link({ className, ...props }: LinkProps) {
  return <RACLink {...props} className={cx("prn-link", className)} />;
}
