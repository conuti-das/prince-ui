import type { ReactNode } from "react";
import {
  UNSTABLE_Toast as RACToast,
  UNSTABLE_ToastRegion as RACToastRegion,
  type ToastRegionProps as RACToastRegionProps,
  UNSTABLE_ToastContent as RACToastContent,
  UNSTABLE_ToastQueue as RACToastQueue,
  Button as RACButton,
} from "react-aria-components";
import { cx } from "../utils";
import "./forms.css";
import "./toast.css";

/* ---------------- Inhalt eines Toasts ---------------- */

export type ToastVariant = "default" | "success" | "warning" | "error";

/** Struktur, die ein Prince-Toast anzeigt. */
export interface AplToast {
  title: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
}

/* ---------------- Queue ---------------- */

/**
 * Globale Toast-Queue. Konsumenten rufen `toastQueue.add({ title, ... })`,
 * um einen Toast in der `<ToastRegion>` einzureihen.
 */
export const toastQueue = new RACToastQueue<AplToast>({
  maxVisibleToasts: 5,
});

/* ---------------- ToastRegion ---------------- */

export interface ToastRegionProps
  extends Omit<RACToastRegionProps<AplToast>, "className" | "children" | "queue"> {
  /** Eigene Queue (Standard: die exportierte `toastQueue`). */
  queue?: RACToastQueue<AplToast>;
  className?: string;
}

/**
 * Fixierte Region am unteren Rand, die eingereihte Toasts als erhöhte Karten
 * mit Slide-in-Animation und Schließen-Button rendert.
 */
export function ToastRegion({ queue = toastQueue, className, ...props }: ToastRegionProps) {
  return (
    <RACToastRegion
      {...props}
      queue={queue}
      className={cx("prn-toast-region", className)}
    >
      {({ toast }) => (
        <RACToast
          toast={toast}
          className="prn-toast"
          data-variant={toast.content.variant ?? "default"}
        >
          <RACToastContent className="prn-toast-content">
            <span className="prn-toast-title">{toast.content.title}</span>
            {toast.content.description && (
              <span className="prn-toast-desc">{toast.content.description}</span>
            )}
          </RACToastContent>
          <RACButton slot="close" className="prn-toast-close" aria-label="Schließen">
            <svg viewBox="0 0 14 14" aria-hidden className="prn-toast-close-icon">
              <path d="M3 3 L11 11 M11 3 L3 11" />
            </svg>
          </RACButton>
        </RACToast>
      )}
    </RACToastRegion>
  );
}
