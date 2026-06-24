import type { ReactNode } from "react";
import {
  DateField as RACDateField,
  type DateFieldProps as RACDateFieldProps,
  TimeField as RACTimeField,
  type TimeFieldProps as RACTimeFieldProps,
  DateInput,
  DateSegment,
  Label,
  Text,
  FieldError,
  type DateValue,
  type TimeValue,
} from "react-aria-components";
import { cx } from "../utils";
import "./forms.css";
import "./datefields.css";

/* ---------------- DateField ---------------- */

export interface DateFieldProps<T extends DateValue>
  extends Omit<RACDateFieldProps<T>, "className"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  className?: string;
}

export function DateField<T extends DateValue>({
  label,
  description,
  errorMessage,
  className,
  ...props
}: DateFieldProps<T>) {
  return (
    <RACDateField {...props} className={cx("prn-field", className)}>
      {label && <Label className="prn-field-label">{label}</Label>}
      <DateInput className="prn-dateinput">
        {(segment) => <DateSegment segment={segment} className="prn-datesegment" />}
      </DateInput>
      {description && (
        <Text slot="description" className="prn-field-desc">
          {description}
        </Text>
      )}
      <FieldError className="prn-field-error">{errorMessage}</FieldError>
    </RACDateField>
  );
}

/* ---------------- TimeField ---------------- */

export interface TimeFieldProps<T extends TimeValue>
  extends Omit<RACTimeFieldProps<T>, "className"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  className?: string;
}

export function TimeField<T extends TimeValue>({
  label,
  description,
  errorMessage,
  className,
  ...props
}: TimeFieldProps<T>) {
  return (
    <RACTimeField {...props} className={cx("prn-field", className)}>
      {label && <Label className="prn-field-label">{label}</Label>}
      <DateInput className="prn-dateinput">
        {(segment) => <DateSegment segment={segment} className="prn-datesegment" />}
      </DateInput>
      {description && (
        <Text slot="description" className="prn-field-desc">
          {description}
        </Text>
      )}
      <FieldError className="prn-field-error">{errorMessage}</FieldError>
    </RACTimeField>
  );
}
