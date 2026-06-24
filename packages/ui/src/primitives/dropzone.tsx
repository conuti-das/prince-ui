import type { ReactNode } from "react";
import {
  DropZone as RACDropZone,
  type DropZoneProps as RACDropZoneProps,
  FileTrigger as RACFileTrigger,
  type FileTriggerProps as RACFileTriggerProps,
  Button as RACButton,
} from "react-aria-components";
import { cx } from "../utils";
import "./forms.css";
import "./dropzone.css";

/* ---------------- DropZone ---------------- */

export interface DropZoneProps extends Omit<RACDropZoneProps, "className"> {
  /** Inhalt der Dropzone, z. B. ein Prompt-Text und ein FileTrigger. */
  children?: ReactNode;
  className?: string;
}

export function DropZone({ children, className, ...props }: DropZoneProps) {
  return (
    <RACDropZone {...props} className={cx("prn-dropzone", className)}>
      {children}
    </RACDropZone>
  );
}

/* ---------------- FileTrigger ---------------- */

export interface FileTriggerProps extends FileTriggerOwnProps {
  /** Button-Beschriftung; Standard „Datei wählen". */
  children?: ReactNode;
  className?: string;
}

type FileTriggerOwnProps = Omit<RACFileTriggerProps, "children">;

export function FileTrigger({ children = "Datei wählen", className, ...props }: FileTriggerProps) {
  return (
    <RACFileTrigger {...props}>
      <RACButton className={cx("prn-button", className)} data-variant="tinted">
        {children}
      </RACButton>
    </RACFileTrigger>
  );
}
