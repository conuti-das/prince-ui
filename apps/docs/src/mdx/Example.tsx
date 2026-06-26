import { useState, useRef } from "react";
import { LiveProvider, LivePreview, LiveEditor, LiveError } from "react-live";
import {
  CalendarDate, CalendarDateTime, Time,
  parseDate, parseTime, parseDateTime, parseAbsolute,
  today, getLocalTimeZone,
} from "@internationalized/date";
import * as ui from "@conuti-das/prince-ui";

// react-live wertet den Beispiel-Code zur Laufzeit aus; alle darin referenzierten
// Symbole müssen im Scope liegen. Date/Color-Beispiele brauchen die
// @internationalized/date-Konstruktoren und parseColor; prince-ui wird zuletzt
// gespreizt, damit gleichnamige Komponenten gewinnen.
const scope = {
  useState, useRef,
  CalendarDate, CalendarDateTime, Time,
  parseDate, parseTime, parseDateTime, parseAbsolute,
  today, getLocalTimeZone,
  ...ui,
};

export function Example({ code }: { code: string }) {
  return (
    <LiveProvider code={code.trim()} scope={scope} noInline={false}>
      <div className="docs-example">
        <div className="docs-example-preview"><LivePreview /></div>
        <LiveEditor className="docs-example-code" />
        <LiveError className="docs-example-error" />
      </div>
    </LiveProvider>
  );
}
