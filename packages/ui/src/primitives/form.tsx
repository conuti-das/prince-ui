import {
  Form as RACForm, type FormProps as RACFormProps,
  FieldError as RACFieldError, type FieldErrorProps as RACFieldErrorProps,
} from "react-aria-components";
import { cx } from "../utils";
import "./forms.css";
import "./form.css";

export interface FormProps extends Omit<RACFormProps, "className"> { className?: string; }
export function Form({ className, ...props }: FormProps) {
  return <RACForm {...props} className={cx("prn-form", className)} />;
}

export interface FieldErrorProps extends Omit<RACFieldErrorProps, "className"> { className?: string; }
export function FieldError({ className, ...props }: FieldErrorProps) {
  return <RACFieldError {...props} className={cx("prn-field-error", className)} />;
}
