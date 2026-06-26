import type { ReactNode } from "react";
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
import { useFieldSize, type FieldSize } from "./size";
import "./forms.css";

/* ---------------- Button ---------------- */

export interface ButtonProps extends Omit<RACButtonProps, "className"> {
  /** Prince-Varianten: gefüllt (Akzent), getönt (soft) oder schlicht. */
  variant?: "filled" | "tinted" | "plain";
  /** Größe: s (kompakt) | m (Default) | l. Ohne Angabe greift der PrinceSizeProvider-Context. */
  size?: FieldSize;
  className?: string;
}

export function Button({ variant = "filled", size, className, ...props }: ButtonProps) {
  const resolvedSize = useFieldSize(size);
  return <RACButton {...props} data-variant={variant} data-size={resolvedSize} className={cx("prn-button", className)} />;
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
  placeholder?: string;
  children: ReactNode | ((item: T) => ReactNode);
  /** Größe: s (kompakt) | m (Default) | l. Ohne Angabe greift der PrinceSizeProvider-Context. */
  size?: FieldSize;
  className?: string;
}

export function Select<T extends object>({ label, placeholder, children, size, className, ...props }: SelectProps<T>) {
  const resolvedSize = useFieldSize(size);
  return (
    <RACSelect {...props} data-size={resolvedSize} className={cx("prn-field prn-select", className)}>
      {label && <Label className="prn-field-label">{label}</Label>}
      <RACButton className="prn-select-button">
        <SelectValue className="prn-select-value">{placeholder}</SelectValue>
        <svg className="prn-select-chevron" viewBox="0 0 12 12" width="12" height="12" aria-hidden
          fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.75 4.5 6 7.75 9.25 4.5" />
        </svg>
      </RACButton>
      <Popover className="prn-popover prn-select-popover">
        <ListBox className="prn-listbox">{children}</ListBox>
      </Popover>
    </RACSelect>
  );
}

export interface SelectItemProps extends Omit<ListBoxItemProps, "className"> {
  className?: string;
}

export function SelectItem({ className, ...props }: SelectItemProps) {
  return <ListBoxItem {...props} className={cx("prn-option", className)} />;
}
