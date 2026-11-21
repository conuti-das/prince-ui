import type { ReactNode } from "react";
import type { Key } from "react-aria-components";
import {
  Button as RACButton,
  type ButtonProps as RACButtonProps,
  TextField as RACTextField,
  type TextFieldProps as RACTextFieldProps,
  Label,
  Input,
  Text,
  FieldError,
  SearchField as RACSearchField,
  type SearchFieldProps as RACSearchFieldProps,
  Checkbox as RACCheckbox,
  type CheckboxProps as RACCheckboxProps,
  Switch as RACSwitch,
  type SwitchProps as RACSwitchProps,
  Select as RACSelect,
  type SelectProps as RACSelectProps,
  SelectValue,
  ListBox,
  ListBoxItem,
  type ListBoxItemProps,
  Popover,
} from "react-aria-components";
import { cx } from "../utils";
import { Icon, type IconName } from "../icons/icons";
import { useFieldSize, type FieldSize } from "./size";
import "./forms.css";

/* ---------------- Button ---------------- */

export interface ButtonProps extends Omit<RACButtonProps, "className"> {
  /** Prince-Varianten: gefüllt (Akzent), getönt (soft) oder schlicht. */
  variant?: "filled" | "tinted" | "plain";
  /**
   * Rolle „Rücknahme“ (ablehnen, stoppen, zurückziehen, verwerfen): rot statt Leitfarbe. Auf der Seite `tinted`;
   * `filled` nur als Bestätigung im Dialog (`ConfirmDialog destructive`). Deaktiviert bleibt der Knopf neutral.
   */
  destructive?: boolean;
  /** Größe: s (kompakt) | m (Default) | l. Ohne Angabe greift der PrinceSizeProvider-Context. */
  size?: FieldSize;
  /**
   * Icon im Knopf (dekorativ, aria-hidden), vor dem Text bzw. mit `iconPosition="end"` danach. Ohne sichtbaren Text braucht der Knopf `aria-label`
   * (für reine Icon-Knöpfe ist `IconButton` gedacht).
   */
  icon?: IconName;
  iconPosition?: "start" | "end";
  className?: string;
}

export function Button({ variant = "filled", destructive, size, icon, iconPosition = "start", className, children, ...props }: ButtonProps) {
  const resolvedSize = useFieldSize(size);
  const zeichen = icon ? <Icon name={icon} size={resolvedSize === "s" ? 14 : 16} className="prn-button-icon" /> : null;
  const inhalt: ButtonProps["children"] = !zeichen
    ? children
    : (rp) => {
        const text = typeof children === "function" ? children(rp) : children;
        return iconPosition === "end" ? <>{text}{zeichen}</> : <>{zeichen}{text}</>;
      };
  return (
    <RACButton {...props} data-variant={variant} data-destructive={destructive || undefined} data-size={resolvedSize} data-icon={icon ? iconPosition : undefined} className={cx("prn-button", className)}>
      {inhalt}
    </RACButton>
  );
}

/* ---------------- TextField ---------------- */

export interface TextFieldProps extends Omit<RACTextFieldProps, "className"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  placeholder?: string;
  /** Größe: s (kompakt) | m (Default) | l. Ohne Angabe greift der PrinceSizeProvider-Context. */
  size?: FieldSize;
  className?: string;
}

export function TextField({ label, description, errorMessage, placeholder, size, className, ...props }: TextFieldProps) {
  const resolvedSize = useFieldSize(size);
  return (
    <RACTextField {...props} data-size={resolvedSize} className={cx("prn-field", className)}>
      {label && <Label className="prn-field-label">{label}</Label>}
      <Input className="prn-input" placeholder={placeholder} />
      {description && <Text slot="description" className="prn-field-desc">{description}</Text>}
      <FieldError className="prn-field-error">{errorMessage}</FieldError>
    </RACTextField>
  );
}

/* ---------------- SearchField ---------------- */

export interface SearchFieldProps extends Omit<RACSearchFieldProps, "className"> {
  label?: ReactNode;
  placeholder?: string;
  /** Größe: s (kompakt) | m (Default) | l. Ohne Angabe greift der PrinceSizeProvider-Context. */
  size?: FieldSize;
  className?: string;
}

export function SearchField({ label, placeholder, size, className, ...props }: SearchFieldProps) {
  const resolvedSize = useFieldSize(size);
  return (
    <RACSearchField {...props} data-size={resolvedSize} className={cx("prn-field prn-searchfield", className)}>
      {label && <Label className="prn-field-label">{label}</Label>}
      <Input className="prn-input" placeholder={placeholder} />
    </RACSearchField>
  );
}

/* ---------------- Checkbox ---------------- */

export interface CheckboxProps extends Omit<RACCheckboxProps, "className"> {
  children?: ReactNode;
  className?: string;
}

export function Checkbox({ children, className, ...props }: CheckboxProps) {
  return (
    <RACCheckbox {...props} className={cx("prn-checkbox", className)}>
      <span className="prn-checkbox-box" aria-hidden>
        <svg viewBox="0 0 18 18" className="prn-checkbox-check" width="14" height="14"
          fill="none" stroke="currentColor">
          <polyline points="4,9 8,13 14,5" />
        </svg>
      </span>
      {children && <span className="prn-checkbox-label">{children}</span>}
    </RACCheckbox>
  );
}

/* ---------------- Switch ---------------- */

export interface SwitchProps extends Omit<RACSwitchProps, "className"> {
  children?: ReactNode;
  className?: string;
}

export function Switch({ children, className, ...props }: SwitchProps) {
  return (
    <RACSwitch {...props} className={cx("prn-switch", className)}>
      {children && <span className="prn-switch-label">{children}</span>}
      <span className="prn-switch-track" aria-hidden>
        <span className="prn-switch-handle" />
      </span>
    </RACSwitch>
  );
}

/* ---------------- Select ---------------- */

export interface SelectProps<T extends object> extends Omit<RACSelectProps<T>, "className" | "children"> {
  label?: ReactNode;
  /** Hinweis unter dem Feld (z. B. der Hinweis der gewählten Option). */
  description?: ReactNode;
  /** Fehlertext (mit `isInvalid` oder aus der Validierung). */
  errorMessage?: ReactNode;
  placeholder?: string;
  children: ReactNode | ((item: T) => ReactNode);
  /** Größe: s (kompakt) | m (Default) | l. Ohne Angabe greift der PrinceSizeProvider-Context. */
  size?: FieldSize;
  className?: string;
  /** Warum die Auswahl gesperrt ist: steht mit `isDisabled` unter dem Feld (statt `description`), nie nur im Tooltip. */
  disabledReason?: ReactNode;
}

/* Leere Kennung als Wahl („keiner“, „unbefristet“): React Aria braucht nicht-leere Schlüssel – ein Eintrag mit `id=""` ließe sich nicht wählen.
 * Select und SelectItem bilden "" deshalb intern auf einen eigenen Schlüssel ab; nach außen (`selectedKey`, `defaultSelectedKey`, `onSelectionChange`) bleibt es "". */
const LEER = "__prn-leer__";
const nachInnen = (k: Key | null | undefined) => (k === "" ? LEER : k);

export function Select<T extends object>({ label, description: beschreibung, errorMessage, placeholder, children, size, className, selectedKey, defaultSelectedKey, onSelectionChange, disabledReason, ...props }: SelectProps<T>) {
  const resolvedSize = useFieldSize(size);
  const description = props.isDisabled && disabledReason != null ? disabledReason : beschreibung;
  return (
    <RACSelect {...props} placeholder={placeholder}
      {...(selectedKey !== undefined ? { selectedKey: nachInnen(selectedKey) } : {})}
      {...(defaultSelectedKey !== undefined ? { defaultSelectedKey: nachInnen(defaultSelectedKey) } : {})}
      onSelectionChange={onSelectionChange ? (k) => onSelectionChange(k === LEER ? "" : k) : undefined} data-size={resolvedSize} className={cx("prn-field prn-select", className)}>
      {label && <Label className="prn-field-label">{label}</Label>}
      <RACButton className="prn-select-button">
        {/* Anzeige als Render-Funktion: ein festes Kind ersetzt die Anzeige immer (dann blieb „Bitte wählen“ stehen, auch nach der Wahl). Gezeigt wird der Text
            der gewählten Option (textValue) – ohne ihren Hinweis, der steht unter dem Feld (DecisionDialog) und sonst doppelt im Feld */}
        <SelectValue className="prn-select-value">{({ isPlaceholder, selectedText, defaultChildren }) => (isPlaceholder ? placeholder ?? defaultChildren
          : <span title={selectedText || undefined}>{selectedText || defaultChildren}</span>)}</SelectValue>
        <svg className="prn-select-chevron" viewBox="0 0 12 12" width="12" height="12" aria-hidden
          fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.75 4.5 6 7.75 9.25 4.5" />
        </svg>
      </RACButton>
      {description && <Text slot="description" className="prn-field-desc">{description}</Text>}
      <FieldError className="prn-field-error">{errorMessage}</FieldError>
      <Popover className="prn-popover prn-select-popover">
        <ListBox className="prn-listbox">{children}</ListBox>
      </Popover>
    </RACSelect>
  );
}

export interface SelectItemProps extends Omit<ListBoxItemProps, "className"> {
  className?: string;
  /** Hinweis zur Option (zweite Zeile, als Beschreibung vorgelesen), z. B. was die Antwort auslöst. */
  description?: ReactNode;
}

export function SelectItem({ className, description, children, textValue, id: rohId, ...rest }: SelectItemProps) {
  const props = { ...rest, id: rohId === "" ? LEER : rohId };
  if (description == null) return <ListBoxItem {...props} textValue={textValue} className={cx("prn-option", className)}>{children}</ListBoxItem>;
  return (
    <ListBoxItem {...props} textValue={textValue ?? (typeof children === "string" ? children : undefined)} data-description className={cx("prn-option", className)}>
      <span className="prn-option-text">
        <Text slot="label" className="prn-option-label">{children as ReactNode}</Text>
        <Text slot="description" className="prn-option-desc">{description}</Text>
      </span>
    </ListBoxItem>
  );
}
