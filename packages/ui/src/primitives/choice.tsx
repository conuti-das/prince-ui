import type { ReactNode } from "react";
import {
  RadioGroup as RACRadioGroup, type RadioGroupProps as RACRadioGroupProps,
  Radio as RACRadio, type RadioProps as RACRadioProps,
  CheckboxGroup as RACCheckboxGroup, type CheckboxGroupProps as RACCheckboxGroupProps,
  Label, Text, FieldError,
} from "react-aria-components";
import { cx } from "../utils";
import "./forms.css";
import "./choice.css";

export interface RadioGroupProps extends Omit<RACRadioGroupProps, "className"> {
  label?: ReactNode; description?: ReactNode; errorMessage?: ReactNode;
  children: ReactNode; className?: string;
}
export function RadioGroup({ label, description, errorMessage, children, className, ...props }: RadioGroupProps) {
  return (
    <RACRadioGroup {...props} className={cx("prn-field prn-radiogroup", className)}>
      {label && <Label className="prn-field-label">{label}</Label>}
      <div className="prn-radiogroup-items">{children}</div>
      {description && <Text slot="description" className="prn-field-desc">{description}</Text>}
      <FieldError className="prn-field-error">{errorMessage}</FieldError>
    </RACRadioGroup>
  );
}

export interface RadioProps extends Omit<RACRadioProps, "className"> { children?: ReactNode; className?: string; }
export function Radio({ children, className, ...props }: RadioProps) {
  return (
    <RACRadio {...props} className={cx("prn-radio", className)}>
      <span className="prn-radio-dot" aria-hidden />
      {children && <span className="prn-radio-label">{children}</span>}
    </RACRadio>
  );
}

export interface CheckboxGroupProps extends Omit<RACCheckboxGroupProps, "className"> {
  label?: ReactNode; description?: ReactNode; errorMessage?: ReactNode;
  children: ReactNode; className?: string;
}
export function CheckboxGroup({ label, description, errorMessage, children, className, ...props }: CheckboxGroupProps) {
  return (
    <RACCheckboxGroup {...props} className={cx("prn-field prn-checkboxgroup", className)}>
      {label && <Label className="prn-field-label">{label}</Label>}
      <div className="prn-checkboxgroup-items">{children}</div>
      {description && <Text slot="description" className="prn-field-desc">{description}</Text>}
      <FieldError className="prn-field-error">{errorMessage}</FieldError>
    </RACCheckboxGroup>
  );
}
