import type { ReactNode } from "react";
import {
  ColorField as RACColorField,
  type ColorFieldProps as RACColorFieldProps,
  ColorSwatch as RACColorSwatch,
  type ColorSwatchProps as RACColorSwatchProps,
  ColorSwatchPicker as RACColorSwatchPicker,
  type ColorSwatchPickerProps as RACColorSwatchPickerProps,
  ColorSwatchPickerItem as RACColorSwatchPickerItem,
  type ColorSwatchPickerItemProps as RACColorSwatchPickerItemProps,
  Label,
  Input,
  Text,
  FieldError,
} from "react-aria-components";
import { cx } from "../utils";
import "./forms.css";
import "./color.css";

export { parseColor } from "react-aria-components";

/* ---------------- ColorField ---------------- */

export interface ColorFieldProps extends Omit<RACColorFieldProps, "className"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  placeholder?: string;
  className?: string;
}

export function ColorField({
  label,
  description,
  errorMessage,
  placeholder,
  className,
  ...props
}: ColorFieldProps) {
  return (
    <RACColorField {...props} className={cx("prn-field", className)}>
      {label && <Label className="prn-field-label">{label}</Label>}
      <Input className="prn-input prn-colorfield-input" placeholder={placeholder} />
      {description && (
        <Text slot="description" className="prn-field-desc">
          {description}
        </Text>
      )}
      <FieldError className="prn-field-error">{errorMessage}</FieldError>
    </RACColorField>
  );
}

/* ---------------- ColorSwatch ---------------- */

export interface ColorSwatchProps extends Omit<RACColorSwatchProps, "className"> {
  className?: string;
}

export function ColorSwatch({ className, ...props }: ColorSwatchProps) {
  return <RACColorSwatch {...props} className={cx("prn-colorswatch", className)} />;
}

/* ---------------- ColorSwatchPicker ---------------- */

export interface ColorSwatchPickerProps
  extends Omit<RACColorSwatchPickerProps, "className"> {
  className?: string;
}

export function ColorSwatchPicker({
  className,
  children,
  ...props
}: ColorSwatchPickerProps) {
  return (
    <RACColorSwatchPicker {...props} className={cx("prn-colorswatch-picker", className)}>
      {children}
    </RACColorSwatchPicker>
  );
}

export interface ColorSwatchPickerItemProps
  extends Omit<RACColorSwatchPickerItemProps, "className"> {
  className?: string;
}

export function ColorSwatchPickerItem({
  className,
  ...props
}: ColorSwatchPickerItemProps) {
  return (
    <RACColorSwatchPickerItem
      {...props}
      className={cx("prn-colorswatch-picker-item", className)}
    >
      <ColorSwatch />
    </RACColorSwatchPickerItem>
  );
}
