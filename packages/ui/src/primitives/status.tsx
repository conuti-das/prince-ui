import type { ReactNode } from "react";
import {
  ProgressBar as RACProgressBar,
  type ProgressBarProps as RACProgressBarProps,
  Meter as RACMeter,
  type MeterProps as RACMeterProps,
  Separator as RACSeparator,
  type SeparatorProps as RACSeparatorProps,
  Group as RACGroup,
  type GroupProps as RACGroupProps,
  Label,
} from "react-aria-components";
import { cx } from "../utils";
import "./forms.css";
import "./status.css";

/* ---------------- ProgressBar ---------------- */

export interface ProgressBarProps extends Omit<RACProgressBarProps, "className" | "children"> {
  /** Sichtbares Label oberhalb des Balkens. */
  label?: ReactNode;
  /** Formatierten Wert (z. B. „60 %") neben dem Label anzeigen. */
  showValue?: boolean;
  className?: string;
}

export function ProgressBar({ label, showValue = true, className, ...props }: ProgressBarProps) {
  return (
    <RACProgressBar {...props} className={cx("prn-progressbar", className)}>
      {({ percentage, valueText, isIndeterminate }) => (
        <>
          {(label || showValue) && (
            <div className="prn-progressbar-head">
              {label && <Label className="prn-field-label">{label}</Label>}
              {showValue && !isIndeterminate && (
                <span className="prn-progressbar-value">{valueText}</span>
              )}
            </div>
          )}
          <div className="prn-progressbar-track">
            <div
              className="prn-progressbar-fill"
              data-indeterminate={isIndeterminate || undefined}
              style={isIndeterminate ? undefined : { width: `${percentage ?? 0}%` }}
            />
          </div>
        </>
      )}
    </RACProgressBar>
  );
}

/* ---------------- Meter ---------------- */

export interface MeterProps extends Omit<RACMeterProps, "className" | "children"> {
  /** Sichtbares Label oberhalb des Meters. */
  label?: ReactNode;
  /** Formatierten Wert neben dem Label anzeigen. */
  showValue?: boolean;
  /** Farbbänder nach Auslastung (grün/orange/rot) statt Akzentfarbe. */
  bands?: boolean;
  className?: string;
}

function bandFor(percentage: number): "low" | "medium" | "high" {
  if (percentage >= 85) return "high";
  if (percentage >= 60) return "medium";
  return "low";
}

export function Meter({ label, showValue = true, bands = false, className, ...props }: MeterProps) {
  return (
    <RACMeter {...props} className={cx("prn-meter", className)}>
      {({ percentage, valueText }) => (
        <>
          {(label || showValue) && (
            <div className="prn-meter-head">
              {label && <Label className="prn-field-label">{label}</Label>}
              {showValue && <span className="prn-meter-value">{valueText}</span>}
            </div>
          )}
          <div className="prn-meter-track">
            <div
              className="prn-meter-fill"
              data-band={bands ? bandFor(percentage) : undefined}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </>
      )}
    </RACMeter>
  );
}

/* ---------------- Separator ---------------- */

export interface SeparatorProps extends Omit<RACSeparatorProps, "className"> {
  className?: string;
}

export function Separator({ className, ...props }: SeparatorProps) {
  return <RACSeparator {...props} className={cx("prn-separator", className)} />;
}

/* ---------------- Group ---------------- */

export interface GroupProps extends Omit<RACGroupProps, "className"> {
  className?: string;
}

export function Group({ className, ...props }: GroupProps) {
  return <RACGroup {...props} className={cx("prn-group", className)} />;
}
