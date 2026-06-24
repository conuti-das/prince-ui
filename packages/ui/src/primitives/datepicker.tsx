import type { ReactNode } from "react";
import {
  DatePicker as RACDatePicker,
  type DatePickerProps as RACDatePickerProps,
  DateRangePicker as RACDateRangePicker,
  type DateRangePickerProps as RACDateRangePickerProps,
  type DateValue,
  Group,
  DateInput,
  DateSegment,
  Label,
  Text,
  FieldError,
  Button as RACButton,
  Popover,
  Dialog,
  Calendar,
  RangeCalendar,
  CalendarGrid,
  CalendarGridHeader,
  CalendarGridBody,
  CalendarHeaderCell,
  CalendarCell,
  Heading,
} from "react-aria-components";
import { cx } from "../utils";
import "./forms.css";
import "./overlays.css";
import "./datepicker.css";

/* ---------------- gemeinsamer Kalender-Korpus ---------------- */

function CalendarBody() {
  return (
    <>
      <header className="prn-cal-header">
        <RACButton slot="previous" className="prn-cal-nav" aria-label="Vorheriger Monat">
          ‹
        </RACButton>
        <Heading className="prn-cal-heading" />
        <RACButton slot="next" className="prn-cal-nav" aria-label="Nächster Monat">
          ›
        </RACButton>
      </header>
      <CalendarGrid className="prn-cal-grid">
        <CalendarGridHeader className="prn-cal-grid-header">
          {(day) => <CalendarHeaderCell className="prn-cal-weekday">{day}</CalendarHeaderCell>}
        </CalendarGridHeader>
        <CalendarGridBody className="prn-cal-grid-body">
          {(date) => <CalendarCell date={date} className="prn-cal-cell" />}
        </CalendarGridBody>
      </CalendarGrid>
    </>
  );
}

/* ---------------- DatePicker ---------------- */

export interface DatePickerProps<T extends DateValue>
  extends Omit<RACDatePickerProps<T>, "className"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  className?: string;
}

export function DatePicker<T extends DateValue>({
  label,
  description,
  errorMessage,
  className,
  ...props
}: DatePickerProps<T>) {
  return (
    <RACDatePicker {...props} className={cx("prn-field prn-datepicker", className)}>
      {label && <Label className="prn-field-label">{label}</Label>}
      <Group className="prn-dateinput">
        <DateInput className="prn-dateinput-segments">
          {(segment) => <DateSegment segment={segment} className="prn-date-segment" />}
        </DateInput>
        <RACButton className="prn-dateinput-trigger" aria-label="Kalender öffnen">
          <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden fill="none"
            stroke="var(--prn-accent-strong)" strokeWidth="1.4" strokeLinecap="round">
            <rect x="2.25" y="3.25" width="11.5" height="10.5" rx="2.5" />
            <path d="M2.25 6.5h11.5M5 2v2.2M11 2v2.2" />
          </svg>
        </RACButton>
      </Group>
      {description && (
        <Text slot="description" className="prn-field-desc">
          {description}
        </Text>
      )}
      <FieldError className="prn-field-error">{errorMessage}</FieldError>
      <Popover className="prn-popover prn-cal-popover">
        <Dialog className="prn-cal-dialog">
          <Calendar className="prn-calendar">
            <CalendarBody />
          </Calendar>
        </Dialog>
      </Popover>
    </RACDatePicker>
  );
}

/* ---------------- DateRangePicker ---------------- */

export interface DateRangePickerProps<T extends DateValue>
  extends Omit<RACDateRangePickerProps<T>, "className"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  className?: string;
}

export function DateRangePicker<T extends DateValue>({
  label,
  description,
  errorMessage,
  className,
  ...props
}: DateRangePickerProps<T>) {
  return (
    <RACDateRangePicker {...props} className={cx("prn-field prn-daterangepicker", className)}>
      {label && <Label className="prn-field-label">{label}</Label>}
      <Group className="prn-dateinput prn-daterange-group">
        <DateInput slot="start" className="prn-dateinput-segments">
          {(segment) => <DateSegment segment={segment} className="prn-date-segment" />}
        </DateInput>
        <span aria-hidden className="prn-daterange-sep">
          –
        </span>
        <DateInput slot="end" className="prn-dateinput-segments">
          {(segment) => <DateSegment segment={segment} className="prn-date-segment" />}
        </DateInput>
        <RACButton className="prn-dateinput-trigger" aria-label="Kalender öffnen">
          <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden fill="none"
            stroke="var(--prn-accent-strong)" strokeWidth="1.4" strokeLinecap="round">
            <rect x="2.25" y="3.25" width="11.5" height="10.5" rx="2.5" />
            <path d="M2.25 6.5h11.5M5 2v2.2M11 2v2.2" />
          </svg>
        </RACButton>
      </Group>
      {description && (
        <Text slot="description" className="prn-field-desc">
          {description}
        </Text>
      )}
      <FieldError className="prn-field-error">{errorMessage}</FieldError>
      <Popover className="prn-popover prn-cal-popover">
        <Dialog className="prn-cal-dialog">
          <RangeCalendar className="prn-calendar">
            <CalendarBody />
          </RangeCalendar>
        </Dialog>
      </Popover>
    </RACDateRangePicker>
  );
}
