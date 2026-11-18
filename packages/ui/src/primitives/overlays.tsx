import type { ReactNode } from "react";
import { Button } from "./forms";
import { Icon, type IconName } from "../icons/icons";
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

/** Zustand eines Dialogs (Parität zu `state` des UI5-Dialogs): Zeichen und Farbe am Titel. */
export type ModalTone = "info" | "positive" | "critical" | "negative";
export type ModalSize = "s" | "m" | "l";
type MitSchliessen = ReactNode | ((opts: { close: () => void }) => ReactNode);

export interface ModalProps {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Titel als Überschrift mit slot="title" (für aria-labelledby). */
  title?: ReactNode;
  /** Zeile unter dem Titel. */
  subtitle?: ReactNode;
  /** Inhalt; als Funktion mit `close`. Rollt, wenn er höher ist als der Dialog – Titel und Fußzeile bleiben stehen. */
  children?: MitSchliessen;
  /** Fußzeile mit den Aktionen (rechts), als Funktion mit `close`. */
  footer?: MitSchliessen;
  /** Links in der Fußzeile, z. B. Fortschritt oder Hinweis („3 von 10 erledigt“). */
  footerStart?: ReactNode;
  /** Zustand: Zeichen und Farbe am Titel. */
  tone?: ModalTone;
  /** Breite: s 420 px, m 560 px (Default), l 760 px. */
  size?: ModalSize;
  /** Klick auf Scrim schließt (Default true). */
  isDismissable?: boolean;
  /** Esc schließt nicht (z. B. während eine Aktion läuft). */
  isKeyboardDismissDisabled?: boolean;
  /** „Liquid Glass"-Optik (transluzent + Blur) statt opaker Fläche. */
  glass?: boolean;
  className?: string;
  /** Barrierefreier Name des Dialogs, wenn kein sichtbarer `title` gesetzt ist. */
  "aria-label"?: string;
  /** ID-Referenz für den barrierefreien Namen (Alternative zu `title`/`aria-label`). */
  "aria-labelledby"?: string;
  /** Rolle: `alertdialog` für Bestätigungen. Default `dialog`. */
  role?: "dialog" | "alertdialog";
  "data-testid"?: string;
}

const TON_ICON: Record<ModalTone, IconName> = { info: "bell", positive: "check", critical: "alert", negative: "alert" };

export function Modal({
  title,
  subtitle,
  children,
  footer,
  footerStart,
  tone,
  size = "m",
  className,
  isDismissable = true,
  isKeyboardDismissDisabled,
  glass,
  role,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "data-testid": testId,
  ...props
}: ModalProps) {
  const mitFuss = footer != null || footerStart != null;
  return (
    <ModalOverlay {...props} isDismissable={isDismissable} isKeyboardDismissDisabled={isKeyboardDismissDisabled} className="prn-modal-overlay">
      <RACModal className={cx("prn-modal", glass && "prn-glass prn-glass-overlay")} data-size={size}>
        <RACDialog
          className={cx("prn-dialog", mitFuss && "prn-dialog-mit-fuss", className)}
          aria-label={!title ? ariaLabel : undefined}
          aria-labelledby={ariaLabelledby}
          role={role}
          data-tone={tone}
          data-testid={testId}
        >
          {({ close }) => (
            <>
              {(title || subtitle) && (
                <div className="prn-dialog-head">
                  {title && (
                    <Heading slot="title" className="prn-dialog-title">
                      {tone && <span className="prn-dialog-tone" aria-hidden><Icon name={TON_ICON[tone]} size={18} /></span>}
                      {title}
                    </Heading>
                  )}
                  {subtitle != null && <div className="prn-dialog-subtitle">{subtitle}</div>}
                </div>
              )}
              <div className="prn-dialog-body">{typeof children === "function" ? children({ close }) : children}</div>
              {mitFuss && (
                <div className="prn-dialog-footer">
                  <div className="prn-dialog-footer-start">{footerStart}</div>
                  <div className="prn-dialog-footer-actions">{typeof footer === "function" ? footer({ close }) : footer}</div>
                </div>
              )}
            </>
          )}
        </RACDialog>
      </RACModal>
    </ModalOverlay>
  );
}

/* ---------------- ConfirmDialog ----------------
 * Bestätigungsvorlage (Parität zu MessageBox): Frage, Folgen, „Abbrechen“ und die Aktion; `destructive` färbt die Aktion rot.
 * `alertdialog`, Fokus startet auf „Abbrechen“ (nie versehentlich bestätigen). */

export interface ConfirmDialogProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  title: ReactNode;
  /** Was passiert, wenn bestätigt wird. */
  children?: ReactNode;
  confirmLabel: ReactNode;
  /** Default „Abbrechen“. */
  cancelLabel?: ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  tone?: ModalTone;
  destructive?: boolean;
  confirmTestId?: string;
  cancelTestId?: string;
  "data-testid"?: string;
}

export function ConfirmDialog({ title, children, confirmLabel, cancelLabel = "Abbrechen", onConfirm, onCancel, tone, destructive, confirmTestId, cancelTestId, "data-testid": testId, ...props }: ConfirmDialogProps) {
  return (
    <Modal {...props} title={title} tone={tone ?? (destructive ? "negative" : undefined)} size="s" role="alertdialog" isDismissable={false} data-testid={testId}
      footer={({ close }) => (
        <>
          <Button variant="plain" autoFocus onPress={() => { onCancel?.(); close(); }} data-testid={cancelTestId}>{cancelLabel}</Button>
          <Button variant="filled" className={destructive ? "prn-button-destructive" : undefined} onPress={() => { onConfirm(); close(); }} data-testid={confirmTestId}>{confirmLabel}</Button>
        </>
      )}>
      {children}
    </Modal>
  );
}

export { DialogTrigger };

/* ---------------- Menu ---------------- */

export interface MenuProps {
  /** Trigger-Element (z. B. <Button>). */
  trigger: ReactNode;
  children: ReactNode;
  /** „Liquid Glass"-Optik (transluzent + Blur) statt opaker Fläche. */
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
  /** „Liquid Glass"-Optik (transluzent + Blur) statt opaker Fläche. */
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
