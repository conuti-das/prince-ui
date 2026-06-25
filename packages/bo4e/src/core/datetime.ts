const BERLIN = "Europe/Berlin";

export function isIsoDate(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v);
}

function parts(iso: string): Record<string, string> {
  const f = new Intl.DateTimeFormat("de-DE", {
    timeZone: BERLIN,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const p: Record<string, string> = {};
  for (const { type, value } of f.formatToParts(new Date(iso))) p[type] = value;
  return p;
}

export function formatDateDE(iso: string, opts: { withTime?: boolean } = {}): string {
  if (!isIsoDate(iso)) return iso;
  const p = parts(iso);
  const date = `${p.day}.${p.month}.${p.year}`;
  return opts.withTime ? `${date} ${p.hour}:${p.minute}` : date;
}

export function toUtcLabel(iso: string): string {
  if (!isIsoDate(iso)) return iso;
  return new Date(iso).toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function zonedLabelWithTz(iso: string): string {
  if (!isIsoDate(iso)) return iso;
  const tz =
    new Intl.DateTimeFormat("de-DE", { timeZone: BERLIN, timeZoneName: "short" })
      .formatToParts(new Date(iso))
      .find((x) => x.type === "timeZoneName")?.value ?? "";
  return `${formatDateDE(iso, { withTime: true })}${tz ? ` ${tz}` : ""}`;
}
