import type { ReactNode } from "react";
import {
  Calendar as RACCalendar,
  type CalendarProps as RACCalendarProps,
  RangeCalendar as RACRangeCalendar,
  type RangeCalendarProps as RACRangeCalendarProps,
  CalendarGrid,
  CalendarGridHeader,
  CalendarGridBody,
  CalendarHeaderCell,
  CalendarCell,
  Heading,
  Button as RACButton,
  Text,
  type DateValue,
} from "react-aria-components";
import { cx } from "../utils";
import "./forms.css";
import "./calendar.css";

/* ---------------- gemeinsamer Header (Monatslabel + Chevrons) ---------------- */

function CalendarHeader() {
  return (
    <header className="prn-calendar-header">
      <RACButton slot="previous" className="prn-calendar-nav" aria-label="Vorheriger Monat">
        <span aria-hidden>‹</span>
      </RACButton>
      <Heading className="prn-calendar-title" />
      <RACButton slot="next" className="prn-calendar-nav" aria-label="Nächster Monat">
        <span aria-hidden>›</span>
      </RACButton>
    </header>
  );
}

/* ---------------- gemeinsames Monatsgitter ---------------- */

function CalendarMonthGrid() {
  return (
    <CalendarGrid className="prn-calendar-grid">
      <CalendarGridHeader className="prn-calendar-grid-header">
        {(day) => <CalendarHeaderCell className="prn-calendar-weekday">{day}</CalendarHeaderCell>}
      </CalendarGridHeader>
      <CalendarGridBody className="prn-calendar-grid-body">
        {(date) => <CalendarCell date={date} className="prn-calendar-cell" />}
      </CalendarGridBody>
    </CalendarGrid>
  );
}

/* ---------------- Calendar ---------------- */

export interface CalendarProps<T extends DateValue> extends Omit<RACCalendarProps<T>, "className"> {
  /** Optionale Fehlermeldung unterhalb des Gitters. */
  errorMessage?: ReactNode;
  className?: string;
}

export function Calendar<T extends DateValue>({ errorMessage, className, ...props }: CalendarProps<T>) {
  return (
    <RACCalendar {...props} className={cx("prn-calendar", className)}>
      <CalendarHeader />
      <CalendarMonthGrid />
      {errorMessage && (
        <Text slot="errorMessage" className="prn-field-error">
          {errorMessage}
        </Text>
      )}
    </RACCalendar>
  );
}

/* ---------------- RangeCalendar ---------------- */

export interface RangeCalendarProps<T extends DateValue> extends Omit<RACRangeCalendarProps<T>, "className"> {
  /** Optionale Fehlermeldung unterhalb des Gitters. */
  errorMessage?: ReactNode;
  className?: string;
}

export function RangeCalendar<T extends DateValue>({ errorMessage, className, ...props }: RangeCalendarProps<T>) {
  return (
    <RACRangeCalendar {...props} className={cx("prn-calendar prn-calendar-range", className)}>
      <CalendarHeader />
      <CalendarMonthGrid />
      {errorMessage && (
        <Text slot="errorMessage" className="prn-field-error">
          {errorMessage}
        </Text>
      )}
    </RACRangeCalendar>
  );
}
