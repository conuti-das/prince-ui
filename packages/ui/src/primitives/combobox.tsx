import type { ReactNode } from "react";
import {
  ComboBox as RACComboBox, type ComboBoxProps as RACComboBoxProps,
  Label, Input, Button as RACButton, Popover, ListBox, ListBoxItem,
  type ListBoxItemProps, Text, FieldError,
} from "react-aria-components";
import { cx } from "../utils";
import { useFieldSize, type FieldSize } from "./size";
import "./forms.css";
import "./overlays.css";
import "./combobox.css";

export interface ComboBoxProps<T extends object>
  extends Omit<RACComboBoxProps<T>, "className" | "children"> {
  label?: ReactNode; placeholder?: string; description?: ReactNode; errorMessage?: ReactNode;
  children: ReactNode | ((item: T) => ReactNode);
  /** Größe: s (kompakt) | m (Default) | l. Ohne Angabe greift der PrinceSizeProvider-Context. */
  size?: FieldSize; className?: string;
}
export function ComboBox<T extends object>({ label, placeholder, description, errorMessage, children, size, className, ...props }: ComboBoxProps<T>) {
  const resolvedSize = useFieldSize(size);
  return (
    <RACComboBox {...props} data-size={resolvedSize} className={cx("prn-field prn-combobox", className)}>
      {label && <Label className="prn-field-label">{label}</Label>}
      <div className="prn-combobox-control">
        <Input className="prn-input prn-combobox-input" placeholder={placeholder} />
        <RACButton className="prn-combobox-button">
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden fill="none"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.75 4.5 6 7.75 9.25 4.5" />
          </svg>
        </RACButton>
      </div>
      {description && <Text slot="description" className="prn-field-desc">{description}</Text>}
      <FieldError className="prn-field-error">{errorMessage}</FieldError>
      <Popover className="prn-popover prn-combobox-popover">
        <ListBox className="prn-listbox">{children}</ListBox>
      </Popover>
    </RACComboBox>
  );
}

export interface ComboBoxItemProps extends Omit<ListBoxItemProps, "className"> { className?: string; }
export function ComboBoxItem({ className, ...props }: ComboBoxItemProps) {
  return <ListBoxItem {...props} className={cx("prn-option", className)} />;
}
