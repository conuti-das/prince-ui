import { parseAbsolute, type ZonedDateTime } from "@internationalized/date";

const BERLIN = "Europe/Berlin";

/** ISO-UTC string -> ZonedDateTime in Europe/Berlin (for the date/time picker). */
export function isoToBerlin(iso: string): ZonedDateTime {
  return parseAbsolute(iso, BERLIN);
}

/** ZonedDateTime (any zone) -> normalized ISO-UTC string ("…Z", no millis). */
export function berlinToIso(z: ZonedDateTime): string {
  return z.toAbsoluteString().replace(/\.\d{3}(?=Z$)/, "");
}
