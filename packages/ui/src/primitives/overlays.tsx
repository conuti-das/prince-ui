import type { ReactNode } from "react";
import {
  ModalOverlay,
  Modal as RACModal,
  Dialog as RACDialog,
  Heading,
  DialogTrigger,
  MenuTrigger,
  Menu as RACMenu,
  MenuItem as RACMenuItem,
  type MenuItemProps,
  Popover as RACPopover,
  type PopoverProps,
  TooltipTrigger,
  Tooltip as RACTooltip,
  OverlayArrow,
} from "react-aria-components";
import { cx } from "../utils";
import "./overlays.css";

/* ---------------- Modal / Dialog ----------------
 * Fokus-Trap, Escape-Schließen und Fokus-Rückgabe übernimmt React Aria
 * (FocusScope) — kein handgeschriebener Trap mehr nötig. */

export interface ModalProps {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Titel als Überschrift mit slot="title" (für aria-labelledby). */
  title?: ReactNode;
  children?: ReactNode;
  /** Klick auf Scrim schließt (Default true). */
  isDismissable?: boolean;
  /** Transluzente Glas-Optik (Blur) statt opaker Fläche. */
  glass?: boolean;
  className?: string;
}

export function Modal({ title, children, className, isDismissable = true, glass, ...props }: ModalProps) {
  return (
    <ModalOverlay {...props} isDismissable={isDismissable} className="prn-modal-overlay">
      <RACModal className={cx("prn-modal", glass && "prn-glass prn-glass-overlay")}>
        <RACDialog className={cx("prn-dialog", className)}>
          {title && <Heading slot="title" className="prn-dialog-title">{title}</Heading>}
          {children}
        </RACDialog>
      </RACModal>
    </ModalOverlay>
  );
}

export { DialogTrigger };

/* ---------------- Menu ---------------- */

export interface MenuProps {
  /** Trigger-Element (z. B. <Button>). */
  trigger: ReactNode;
  children: ReactNode;
  /** Transluzente Glas-Optik (Blur) statt opaker Fläche. */
  glass?: boolean;
  className?: string;
}

export function Menu({ trigger, children, glass, className }: MenuProps) {
  return (
    <MenuTrigger>
      {trigger}
      <RACPopover className={cx("prn-popover", glass && "prn-glass prn-glass-overlay")}>
        <RACMenu className={cx("prn-menu", className)}>{children}</RACMenu>
      </RACPopover>
    </MenuTrigger>
  );
}

export interface MenuItemPropsExt extends Omit<MenuItemProps, "className"> {
  className?: string;
}

export function MenuItem({ className, ...props }: MenuItemPropsExt) {
  return <RACMenuItem {...props} className={cx("prn-menu-item", className)} />;
}

/* ---------------- Popover (frei) ---------------- */

export interface AplPopoverProps extends Omit<PopoverProps, "className"> {
  /** Transluzente Glas-Optik (Blur) statt opaker Fläche. */
  glass?: boolean;
  className?: string;
}

export function Popover({ glass, className, children, ...props }: AplPopoverProps) {
  return (
    <RACPopover
      {...props}
      className={cx("prn-popover", glass && "prn-glass prn-glass-overlay", className)}
    >
      {children}
    </RACPopover>
  );
}

/* ---------------- Tooltip ---------------- */

export interface TooltipProps {
  /** Element, das den Tooltip auslöst. */
  trigger: ReactNode;
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function Tooltip({ trigger, children, delay = 600, className }: TooltipProps) {
  return (
    <TooltipTrigger delay={delay}>
      {trigger}
      <RACTooltip className={cx("prn-tooltip", className)}>
        <OverlayArrow className="prn-tooltip-arrow">
          <svg width={8} height={8} viewBox="0 0 8 8"><path d="M0 0 L4 4 L8 0" /></svg>
        </OverlayArrow>
        {children}
      </RACTooltip>
    </TooltipTrigger>
  );
}
