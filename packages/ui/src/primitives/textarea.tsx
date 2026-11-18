import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { FieldError, Label, Text, TextArea as RACTextArea, TextField as RACTextField, type TextFieldProps as RACTextFieldProps } from "react-aria-components";
import { cx } from "../utils";
import { useFieldSize, type FieldSize } from "./size";
import "./forms.css";

/* ---------------- TextArea ----------------
 * Mehrzeiliges Textfeld (Parität zu UI5 TextArea): Label, Beschreibung, Fehler, Zeilen, wächst mit dem Inhalt bis `maxRows`,
 * Zähler „n / max“ bei `maxLength` (mit `showCount`). Für Begründungen, Kommentare, Vier-Augen-Texte. */

export interface TextAreaProps extends Omit<RACTextFieldProps, "className" | "children"> {
  label?: ReactNode;
  /** Hinweis unter dem Feld (z. B. „Mindestens 5 Zeichen“). */
  description?: ReactNode;
  errorMessage?: ReactNode;
  placeholder?: string;
  /** Sichtbare Zeilen. Default 3. */
  rows?: number;
  /** Wächst mit dem Inhalt bis zu so vielen Zeilen (danach rollt das Feld). Ohne Angabe: feste Höhe. */
  maxRows?: number;
  /** Zähler unter dem Feld (braucht `maxLength`). */
  showCount?: boolean;
  /** Text des Zählers. Default „{n} / {max}“. */
  countLabel?: (count: number, max: number) => string;
  size?: FieldSize;
  className?: string;
}

export function TextArea({ label, description, errorMessage, placeholder, rows = 3, maxRows, showCount, countLabel, size, className, value, defaultValue, onChange, maxLength, ...props }: TextAreaProps) {
  const resolvedSize = useFieldSize(size);
  const [intern, setIntern] = useState(defaultValue ?? "");
  const text = value ?? intern;
  const ref = useRef<HTMLTextAreaElement>(null);

  // Wachsen mit dem Inhalt: Höhe auf den Inhalt setzen, höchstens maxRows Zeilen
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !maxRows) return;
    const stil = getComputedStyle(el);
    const zeile = parseFloat(stil.lineHeight) || 22;
    const rand = parseFloat(stil.paddingTop) + parseFloat(stil.paddingBottom);
    el.style.height = "auto";
    const max = zeile * Math.max(rows, maxRows) + rand;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [text, rows, maxRows]);

  const zaehler = showCount && maxLength != null;
  return (
    <RACTextField
      {...props}
      value={text}
      maxLength={maxLength}
      onChange={(v) => {
        if (value === undefined) setIntern(v);
        onChange?.(v);
      }}
      data-size={resolvedSize}
      className={cx("prn-field prn-textarea-field", className)}
    >
      {label && <Label className="prn-field-label">{label}</Label>}
      <RACTextArea ref={ref} className="prn-input prn-textarea" placeholder={placeholder} rows={rows} />
      {(description || zaehler) && (
        <div className="prn-textarea-foot">
          {description ? <Text slot="description" className="prn-field-desc">{description}</Text> : <span />}
          {zaehler && (
            <span className="prn-textarea-count" data-full={text.length >= maxLength! || undefined} aria-hidden>
              {countLabel ? countLabel(text.length, maxLength!) : `${text.length} / ${maxLength}`}
            </span>
          )}
        </div>
      )}
      <FieldError className="prn-field-error">{errorMessage}</FieldError>
    </RACTextField>
  );
}
