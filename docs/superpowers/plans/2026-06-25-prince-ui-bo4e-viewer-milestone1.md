# prince-ui-bo4e Viewer (Milestone 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein neues Paket `prince-ui-bo4e`, das ein BO4E-cDoc datengetrieben als sachbearbeiter-optimierte „Smart-View" rendert (read-only), mit Schema-Popover, Code→Name-Auflösung, Gültigkeits-Ampeln, Datenqualitäts-Hinweisen und „+ Alle Details"-Vollsicht, organisiert in Richtungs-/Stammdaten-Tabs.

**Architecture:** Drei Schichten — (0) reine TypeScript-Logik (Schema-Resolver, Datum, Gültigkeit, Anomalie-Scan), (1) React-„Smart-View"-Bausteine + `SmartObjectCard`, (2) `SydocView` auf prince-ui `ObjectPage`/`iconTabBar`. Reines CSS mit `--prn-*`-Tokens, React Aria über prince-ui-Primitives. Resolver (BDEW-Code→Name etc.) werden injiziert.

**Tech Stack:** React 18, TypeScript, tsup (ESM), vitest + jsdom + @testing-library/react, prince-ui (Popover/Disclosure/Icon/ObjectPage), prince-ui-tokens, Intl (Europe/Berlin).

**Spec:** `docs/superpowers/specs/2026-06-25-prince-ui-bo4e-viewer-design.md` · **Fixture:** `docs/superpowers/fixtures/cdoc-example.json` · **Schema:** `finops-bo4e/.../shared/bo4e/schemas/{bo4e-fields,bo4e-enums,bo4e-bos}.json`

---

## File Structure

```
packages/bo4e/
  package.json                      # prince-ui-bo4e, mirror von packages/dmn
  tsup.config.ts
  tsconfig.json
  vitest.config.ts
  vitest.setup.ts
  src/
    index.ts                        # öffentliche Exports
    types.ts                        # CDoc, DirectionDoc, Stammdaten, Bo4eObject, FieldDoc, Resolvers
    schema/
      load-schema.ts                # loadBo4eSchema, resolveField, getBoOrder, getFieldOrder
      load-schema.test.ts
    core/
      datetime.ts                   # formatDateDE, toUtcLabel, zonedLabelWithTz
      datetime.test.ts
      validity.ts                   # validityStatus
      validity.test.ts
      anomalies.ts                  # scanAnomalies
      anomalies.test.ts
      resolvers.ts                  # Resolvers-Interface + defaultResolvers
      humanize.ts                   # humanize(key)
    view/
      SchemaPopover.tsx             # Popover-Inhalt aus FieldDoc (+ Datums-UTC, Enum, Code→Name)
      SchemaField.tsx               # klickbares Feld -> SchemaPopover
      EnumIcon.tsx                  # Enum-Wert -> Icon (+ Popover)
      EnumBadge.tsx                 # Enum-Wert -> getöntes Badge
      ValidityRange.tsx             # Zeitraum + Ampel
      CodeResolved.tsx              # Codenr mono + aufgelöster Name
      AddressBlock.tsx              # Adressblock
      ContactLine.tsx               # Name-Merge + Kontakt-Icons
      MarktpartnerRow.tsx           # Rollen-Zeile
      IdentityHeader.tsx            # Kopfzeile
      FullDetail.tsx                # 2-Spalten-Label/Wert-Vollsicht
      SmartObjectCard.tsx           # Smart-Body + "+ Alle Details"
      SmartObjectView.tsx           # wählt Smart-Renderer je boTyp, sonst generisch
      renderers/                    # per-boTyp Smart-Bodies
        marktlokation.tsx
        vertrag.tsx
        statusbericht.tsx
        geschaeftspartner.tsx
        generic.tsx                 # Fallback (wichtige Felder + Gruppen)
      bo4e.css                      # alle View-Styles, --prn-* Tokens
    SydocView.tsx                   # Richtungs-Umschalter + ObjectPage/iconTabBar
    __fixtures__/
      cdoc-example.json             # Kopie der Doc-Fixture
      bo4e-fields.json              # Kopie aus finops-bo4e
      bo4e-enums.json
      bo4e-bos.json
  stories/
    SydocView.stories.tsx
    Building-Blocks.stories.tsx
```

Prince-ui-Erweiterung:
```
packages/ui/src/icons/icons.tsx     # neue Icon-Namen ergänzen (Task 14)
```

---

## Task 1: Paket-Scaffold

**Files:**
- Create: `packages/bo4e/package.json`, `packages/bo4e/tsup.config.ts`, `packages/bo4e/tsconfig.json`, `packages/bo4e/vitest.config.ts`, `packages/bo4e/vitest.setup.ts`, `packages/bo4e/src/index.ts`

- [ ] **Step 1: package.json** (mirror von `packages/dmn/package.json`, ohne dmn-js)

```json
{
  "name": "prince-ui-bo4e",
  "version": "0.1.0",
  "description": "Smart-Viewer/-Editor für BO4E-cDoc (Marktkommunikation) auf prince-ui.",
  "license": "MIT",
  "private": false,
  "type": "module",
  "sideEffects": ["*.css"],
  "files": ["dist"],
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./styles.css": "./dist/index.css",
    "./package.json": "./package.json"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": { "prince-ui-tokens": "workspace:*" },
  "peerDependencies": {
    "prince-ui": "workspace:*",
    "react": ">=18 <20",
    "react-dom": ">=18 <20"
  },
  "devDependencies": {
    "prince-ui": "workspace:*",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "jsdom": "^25.0.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tsup": "^8.3.0",
    "typescript": "^5.6.3",
    "vitest": "^2.1.5"
  },
  "publishConfig": { "registry": "https://registry.npmjs.org" },
  "repository": { "type": "git", "url": "git+https://github.com/conuti-das/prince-ui.git", "directory": "packages/bo4e" }
}
```

- [ ] **Step 2: tsup.config.ts**

```ts
import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  loader: { ".json": "json" },
  external: ["react", "react-dom", "prince-ui", "prince-ui-tokens"],
});
```

- [ ] **Step 3: tsconfig.json**

```json
{ "extends": "../../tsconfig.base.json", "compilerOptions": { "rootDir": "src", "outDir": "dist", "resolveJsonModule": true }, "include": ["src"] }
```

- [ ] **Step 4: vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"], globals: true },
});
```

- [ ] **Step 5: vitest.setup.ts**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: src/index.ts** (Platzhalter, wird je Task erweitert)

```ts
export {};
```

- [ ] **Step 7: Install & verify** — Run: `pnpm install` (Root). Then `pnpm --filter prince-ui-bo4e typecheck`. Expected: kein Fehler.

- [ ] **Step 8: Commit**

```bash
git add packages/bo4e && git commit -m "feat(bo4e): scaffold prince-ui-bo4e package"
```

---

## Task 2: Fixtures kopieren

**Files:**
- Create: `packages/bo4e/src/__fixtures__/{cdoc-example,bo4e-fields,bo4e-enums,bo4e-bos}.json`

- [ ] **Step 1: Fixtures kopieren**

```bash
mkdir -p packages/bo4e/src/__fixtures__
cp docs/superpowers/fixtures/cdoc-example.json packages/bo4e/src/__fixtures__/cdoc-example.json
cp ../finops-bo4e/frontend/src/modules/shared/bo4e/schemas/bo4e-fields.json packages/bo4e/src/__fixtures__/bo4e-fields.json
cp ../finops-bo4e/frontend/src/modules/shared/bo4e/schemas/bo4e-enums.json packages/bo4e/src/__fixtures__/bo4e-enums.json
cp ../finops-bo4e/frontend/src/modules/shared/bo4e/schemas/bo4e-bos.json packages/bo4e/src/__fixtures__/bo4e-bos.json
```

- [ ] **Step 2: Verify** — Run: `ls packages/bo4e/src/__fixtures__`. Expected: 4 JSON-Dateien.

- [ ] **Step 3: Commit**

```bash
git add packages/bo4e/src/__fixtures__ && git commit -m "test(bo4e): add cDoc + BO4E schema fixtures"
```

---

## Task 3: Typen

**Files:**
- Create: `packages/bo4e/src/types.ts`

- [ ] **Step 1: types.ts**

```ts
export type Bo4eObject = { boTyp?: string } & Record<string, unknown>;
export type Stammdaten = Record<string, Bo4eObject[]>;

export interface DirectionDoc {
  stammdaten: Stammdaten;
  transaktionsdaten?: Bo4eObject;
  zusatzdaten?: Bo4eObject;
}
export interface CDoc {
  id: string;
  businessKey: string;
  content: Partial<Record<string, DirectionDoc>>;
}

export interface EnumDoc { description?: string; values: string[] }
export interface FieldDoc {
  translation?: string;
  description?: string;
  example?: string;
  pattern?: string;
  enumRef?: string;
  enum?: EnumDoc;
  isRef: boolean;
  isCom: boolean;
}

export interface MarktpartnerInfo { name: string; rolle?: string }
export interface Bo4eResolvers {
  marktpartner?: (codenr: string, codetyp?: string) => MarktpartnerInfo | undefined;
  enumLabel?: (enumName: string, value: string) => string | undefined;
  obis?: (obis: string) => string | undefined;
  pruefId?: (pi: string) => string | undefined;
}
```

- [ ] **Step 2: export aus index.ts** — `packages/bo4e/src/index.ts`:

```ts
export * from "./types";
```

- [ ] **Step 3: Verify** — `pnpm --filter prince-ui-bo4e typecheck`. Expected: pass.

- [ ] **Step 4: Commit** — `git add packages/bo4e/src && git commit -m "feat(bo4e): cDoc + resolver types"`

---

## Task 4: Datums-Utilities (TDD)

**Files:**
- Create: `packages/bo4e/src/core/datetime.ts`, `packages/bo4e/src/core/datetime.test.ts`

- [ ] **Step 1: Failing test** — `datetime.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { formatDateDE, toUtcLabel, zonedLabelWithTz, isIsoDate } from "./datetime";

describe("datetime (Europe/Berlin)", () => {
  it("formats summer timestamp as MESZ (UTC+2)", () => {
    expect(formatDateDE("2026-05-06T09:46:00Z", { withTime: true })).toBe("06.05.2026 11:46");
  });
  it("shifts day/year across midnight boundary (winter, UTC+1)", () => {
    expect(formatDateDE("2022-12-31T23:00:00Z", { withTime: true })).toBe("01.01.2023 00:00");
  });
  it("date-only omits time", () => {
    expect(formatDateDE("2026-07-09T22:00:00Z", { withTime: false })).toBe("10.07.2026");
  });
  it("toUtcLabel returns the original Z string normalized", () => {
    expect(toUtcLabel("2026-05-06T09:46:00Z")).toBe("2026-05-06T09:46:00Z");
  });
  it("zonedLabelWithTz appends MESZ/MEZ", () => {
    expect(zonedLabelWithTz("2026-05-06T09:46:00Z")).toMatch(/11:46.*MESZ/);
    expect(zonedLabelWithTz("2022-12-31T23:00:00Z")).toMatch(/MEZ/);
  });
  it("isIsoDate detects ISO timestamps", () => {
    expect(isIsoDate("2026-05-06T09:46:00Z")).toBe(true);
    expect(isIsoDate("E03")).toBe(false);
  });
});
```

- [ ] **Step 2: Run, expect fail** — Run: `pnpm --filter prince-ui-bo4e test datetime`. Expected: FAIL (module not found).

- [ ] **Step 3: Implement** — `datetime.ts`

```ts
const BERLIN = "Europe/Berlin";

export function isIsoDate(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v);
}

function parts(iso: string) {
  const d = new Date(iso);
  const f = new Intl.DateTimeFormat("de-DE", {
    timeZone: BERLIN, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const p: Record<string, string> = {};
  for (const { type, value } of f.formatToParts(d)) p[type] = value;
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
  const tz = new Intl.DateTimeFormat("de-DE", { timeZone: BERLIN, timeZoneName: "short" })
    .formatToParts(new Date(iso)).find((x) => x.type === "timeZoneName")?.value ?? "";
  return `${formatDateDE(iso, { withTime: true })} ${tz}`;
}
```

> Hinweis: `Intl` liefert für Europe/Berlin den Kurznamen „MEZ"/„MESZ" bei `de-DE`. Falls die CI-Node-ICU-Daten stattdessen „GMT+2" liefern, Test auf `/11:46/` reduzieren und tz-Suffix separat tolerant prüfen.

- [ ] **Step 4: Run, expect pass** — Run: `pnpm --filter prince-ui-bo4e test datetime`. Expected: PASS.

- [ ] **Step 5: Commit** — `git add packages/bo4e/src/core && git commit -m "feat(bo4e): Berlin date formatting + UTC label"`

---

## Task 5: Gültigkeits-Engine (TDD)

**Files:**
- Create: `packages/bo4e/src/core/validity.ts`, `validity.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { validityStatus } from "./validity";

const now = new Date("2026-06-25T12:00:00Z");
describe("validityStatus", () => {
  it("abgelaufen when end is in the past", () => {
    expect(validityStatus({ enddatum: "2025-12-31T23:00:00Z" }, now)).toBe("abgelaufen");
  });
  it("laeuftBald when end within 30 days", () => {
    expect(validityStatus({ enddatum: "2026-07-01T04:00:00Z" }, now)).toBe("laeuftBald");
  });
  it("aktiv when end far in future", () => {
    expect(validityStatus({ enddatum: "2026-12-31T23:00:00Z" }, now)).toBe("aktiv");
  });
  it("zukuenftig when start is in the future", () => {
    expect(validityStatus({ startdatum: "2027-01-01T00:00:00Z" }, now)).toBe("zukuenftig");
  });
  it("aktiv with no dates", () => {
    expect(validityStatus({}, now)).toBe("aktiv");
  });
});
```

- [ ] **Step 2: Run, expect fail** — `pnpm --filter prince-ui-bo4e test validity`. Expected: FAIL.

- [ ] **Step 3: Implement** — `validity.ts`

```ts
export type ValidityState = "zukuenftig" | "aktiv" | "laeuftBald" | "abgelaufen";

export function validityStatus(
  range: { startdatum?: string | null; enddatum?: string | null },
  now: Date = new Date(),
): ValidityState {
  const t = now.getTime();
  const start = range.startdatum ? new Date(range.startdatum).getTime() : null;
  const end = range.enddatum ? new Date(range.enddatum).getTime() : null;
  if (start != null && start > t) return "zukuenftig";
  if (end != null) {
    if (end < t) return "abgelaufen";
    if (end < t + 30 * 86_400_000) return "laeuftBald";
  }
  return "aktiv";
}
```

- [ ] **Step 4: Run, expect pass** — `pnpm --filter prince-ui-bo4e test validity`. Expected: PASS.

- [ ] **Step 5: Commit** — `git add packages/bo4e/src/core/validity* && git commit -m "feat(bo4e): validity status engine"`

---

## Task 6: Auffälligkeiten-Scanner (TDD)

**Files:**
- Create: `packages/bo4e/src/core/anomalies.ts`, `anomalies.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { scanAnomalies } from "./anomalies";

const now = new Date("2026-06-25T12:00:00Z");
describe("scanAnomalies", () => {
  it("flags #...# placeholders", () => {
    const a = scanAnomalies({ lokationsId: "#parameter1#" }, { now });
    expect(a.some((x) => x.rule === "placeholder" && x.path === "lokationsId")).toBe(true);
  });
  it("flags suspicious chars in strings", () => {
    const a = scanAnomalies({ name2: "Fisch>" }, { now });
    expect(a.some((x) => x.rule === "suspiciousChar")).toBe(true);
  });
  it("flags 00000000 and 1950 defaults", () => {
    const a = scanAnomalies({ kuendigungstermin: "00000000", startdatum: "1950-05-03T13:19:00Z" }, { now });
    expect(a.some((x) => x.rule === "defaultValue")).toBe(true);
    expect(a.some((x) => x.rule === "implausibleDate")).toBe(true);
  });
  it("flags expired gueltigBis", () => {
    const a = scanAnomalies({ gueltigBis: "2025-10-14T07:52:00Z" }, { now });
    expect(a.some((x) => x.rule === "expired")).toBe(true);
  });
});
```

- [ ] **Step 2: Run, expect fail** — `pnpm --filter prince-ui-bo4e test anomalies`. Expected: FAIL.

- [ ] **Step 3: Implement** — `anomalies.ts`

```ts
import { isIsoDate } from "./datetime";

export interface Anomaly {
  severity: "warn" | "error";
  path: string;
  value: unknown;
  rule: "placeholder" | "suspiciousChar" | "defaultValue" | "implausibleDate" | "expired";
  message: string;
}

const END_KEYS = /gueltigBis$|enddatum$|vertragsende$/i;

export function scanAnomalies(node: unknown, opts: { now?: Date } = {}): Anomaly[] {
  const now = (opts.now ?? new Date()).getTime();
  const out: Anomaly[] = [];
  const walk = (v: unknown, path: string, key: string) => {
    if (v == null) return;
    if (typeof v === "string") {
      if (/#.+#/.test(v)) out.push({ severity: "warn", path, value: v, rule: "placeholder", message: `Platzhalter nicht ersetzt: ${v}` });
      if (/[<>]/.test(v)) out.push({ severity: "warn", path, value: v, rule: "suspiciousChar", message: `Sonderzeichen im Wert: ${v}` });
      if (v === "00000000") out.push({ severity: "warn", path, value: v, rule: "defaultValue", message: `Leerer Default-Wert (${key})` });
      if (isIsoDate(v) && new Date(v).getUTCFullYear() <= 1950) out.push({ severity: "warn", path, value: v, rule: "implausibleDate", message: `Unplausibles Datum: ${v}` });
      if (isIsoDate(v) && END_KEYS.test(key) && new Date(v).getTime() < now) out.push({ severity: "warn", path, value: v, rule: "expired", message: `Abgelaufen: ${key}` });
      return;
    }
    if (Array.isArray(v)) { v.forEach((it, i) => walk(it, `${path}[${i}]`, key)); return; }
    if (typeof v === "object") for (const k of Object.keys(v as object)) walk((v as Record<string, unknown>)[k], path ? `${path}.${k}` : k, k);
  };
  walk(node, "", "");
  return out;
}
```

- [ ] **Step 4: Run, expect pass** — `pnpm --filter prince-ui-bo4e test anomalies`. Expected: PASS.

- [ ] **Step 5: Commit** — `git add packages/bo4e/src/core/anomalies* && git commit -m "feat(bo4e): data-quality anomaly scanner"`

---

## Task 7: humanize + Resolvers

**Files:**
- Create: `packages/bo4e/src/core/humanize.ts`, `packages/bo4e/src/core/resolvers.ts`

- [ ] **Step 1: humanize.ts** (Label-Map + Fallback-Humanizer)

```ts
const LAB: Record<string, string> = {
  marktlokationsId: "Marktlokations-ID", messlokationsId: "Messlokations-ID", boTyp: "BO-Typ",
  versionStruktur: "Versionsstruktur", eMailAdresse: "E-Mail-Adresse", netzbetreiberCodeNr: "Netzbetreiber-Codenr.",
  rollencodenummer: "Rollencodenummer", rollencodetyp: "Rollencodetyp", pruefidentifikator: "Prüfidentifikator",
  zugehoerigeMesslokationen: "Zugehörige Messlokationen", messtechnischeEinordnung: "Messtechnische Einordnung",
  partneradresse: "Partneradresse", lokationsadresse: "Lokationsadresse", marktrollen: "Marktrollen",
  zaehlwerke: "Zählwerke", verbrauchsmenge: "Verbrauchsmenge", geschaeftspartnerrolle: "Geschäftspartnerrolle",
  messstellenbetreiberEigenschaft: "MSB-Eigenschaft", transaktionsReferenznummer: "Transaktions-Referenznr.",
  datenaustauschreferenz: "Datenaustauschreferenz", ediTyp: "EDI-Typ", ediVersion: "EDI-Version",
  ediEmpfangsDatum: "EDI-Empfangsdatum", marktpartnerRolle: "Marktpartner-Rolle", contrlReferenz: "CONTRL-Referenz",
};
export function humanize(key: string): string {
  if (LAB[key]) return LAB[key];
  const s = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
```

- [ ] **Step 2: resolvers.ts** (Default = Fallback)

```ts
import type { Bo4eResolvers } from "../types";
export const defaultResolvers: Bo4eResolvers = {
  marktpartner: () => undefined,
  enumLabel: () => undefined,
  obis: () => undefined,
  pruefId: () => undefined,
};
export function withDefaults(r?: Bo4eResolvers): Required<Bo4eResolvers> {
  return {
    marktpartner: r?.marktpartner ?? (() => undefined),
    enumLabel: r?.enumLabel ?? (() => undefined),
    obis: r?.obis ?? (() => undefined),
    pruefId: r?.pruefId ?? (() => undefined),
  };
}
```

- [ ] **Step 3: Verify** — `pnpm --filter prince-ui-bo4e typecheck`. Expected: pass.
- [ ] **Step 4: Commit** — `git add packages/bo4e/src/core && git commit -m "feat(bo4e): humanize + injectable resolvers"`

---

## Task 8: Schema-Loader (TDD)

**Files:**
- Create: `packages/bo4e/src/schema/load-schema.ts`, `load-schema.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { loadBo4eSchema, resolveField } from "./load-schema";
import fields from "../__fixtures__/bo4e-fields.json";
import enums from "../__fixtures__/bo4e-enums.json";
import bos from "../__fixtures__/bo4e-bos.json";

const schema = loadBo4eSchema({ fields, enums, bos });
describe("resolveField", () => {
  it("resolves description + translation", () => {
    const d = resolveField(schema, "MARKTLOKATION", "marktlokationsId");
    expect(d.translation).toBe("Marktlokations-ID");
    expect(d.description).toMatch(/Identifikationsnummer/);
  });
  it("expands enumRef into enum values", () => {
    const d = resolveField(schema, "MARKTLOKATION", "energierichtung");
    expect(d.enumRef).toBe("ENERGIERICHTUNG");
    expect(d.enum?.values).toContain("AUSSP");
  });
  it("returns a humanized fallback for unknown fields", () => {
    const d = resolveField(schema, "MARKTLOKATION", "voelligUnbekannt");
    expect(d.translation).toBe("Voellig Unbekannt");
    expect(d.description).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run, expect fail** — `pnpm --filter prince-ui-bo4e test load-schema`. Expected: FAIL.

- [ ] **Step 3: Implement** — `load-schema.ts`

```ts
import type { FieldDoc, EnumDoc } from "../types";
import { humanize } from "../core/humanize";

interface RawField { translation?: string; description?: string; example?: string; pattern?: string; enumRef?: string }
interface RawEnum { description?: string; values: { value: string }[] }
export interface Bo4eSchema {
  fields: Record<string, Record<string, RawField>>;
  enums: Record<string, RawEnum>;
  bos: Record<string, { description?: string; properties: string[] }>;
}

export function loadBo4eSchema(src: { fields: unknown; enums: unknown; bos: unknown }): Bo4eSchema {
  return { fields: src.fields as Bo4eSchema["fields"], enums: src.enums as Bo4eSchema["enums"], bos: src.bos as Bo4eSchema["bos"] };
}

export function resolveField(schema: Bo4eSchema, boTyp: string, key: string): FieldDoc {
  const raw = schema.fields[boTyp]?.[key];
  let enumDoc: EnumDoc | undefined;
  if (raw?.enumRef && schema.enums[raw.enumRef]) {
    const e = schema.enums[raw.enumRef];
    enumDoc = { description: e.description, values: e.values.map((v) => v.value) };
  }
  return {
    translation: raw?.translation ?? humanize(key),
    description: raw?.description,
    example: raw?.example,
    pattern: raw?.pattern,
    enumRef: raw?.enumRef,
    enum: enumDoc,
    isRef: /Id$|Nr$|nummer$|referenz/i.test(key),
    isCom: false,
  };
}

export function getBoOrder(schema: Bo4eSchema): string[] { return Object.keys(schema.bos); }
export function getFieldOrder(schema: Bo4eSchema, boTyp: string): string[] {
  return schema.bos[boTyp]?.properties ?? Object.keys(schema.fields[boTyp] ?? {});
}
```

- [ ] **Step 4: Run, expect pass** — `pnpm --filter prince-ui-bo4e test load-schema`. Expected: PASS.
- [ ] **Step 5: export core+schema aus index.ts** — ergänze in `src/index.ts`:

```ts
export * from "./types";
export * from "./core/datetime";
export * from "./core/validity";
export * from "./core/anomalies";
export * from "./core/humanize";
export * from "./core/resolvers";
export * from "./schema/load-schema";
```

- [ ] **Step 6: Commit** — `git add packages/bo4e/src && git commit -m "feat(bo4e): schema loader + field resolver"`

---

## Task 9: Icons in prince-ui ergänzen

**Files:**
- Modify: `packages/ui/src/icons/icons.tsx`

- [ ] **Step 1:** `icons.tsx` öffnen, das bestehende Icon-Map-Muster (Name → SVG-Pfad) prüfen und folgende Namen ergänzen, sofern nicht vorhanden: `phone`, `clock`, `lock`, `lock-open`, `gauge`, `link`, `arrow-right`, `arrow-down-right`, `arrow-up-right`, `droplet`, `file-text`, `file-code`, `map-pin`, `alert-triangle`, `trending-up`, `bolt`, `flame`, `building`, `mail`, `user`. SVG-Pfade im lucide/Tabler-Stil (24-Grid, `stroke="currentColor"` falls das Set strokebasiert ist — am vorhandenen Stil orientieren).

- [ ] **Step 2: Verify** — `pnpm --filter prince-ui typecheck`. Expected: pass; `IconName`-Union enthält die neuen Namen.
- [ ] **Step 3: Commit** — `git add packages/ui/src/icons/icons.tsx && git commit -m "feat(ui): add icons for bo4e smart views"`

> Falls das prince-ui-Icon-System keine einfache Name→Pfad-Map ist (z. B. eigene Komponenten), stattdessen die neuen Icons im selben Muster wie die vorhandenen anlegen. Diese Task vor den View-Tasks abschließen, da `EnumIcon` darauf baut.

---

## Task 10: Basis-Bausteine ohne Schema (ValidityRange, AddressBlock, CodeResolved, IdentityHeader)

**Files:**
- Create: `packages/bo4e/src/view/bo4e.css`, `ValidityRange.tsx`, `AddressBlock.tsx`, `CodeResolved.tsx`, `IdentityHeader.tsx`, `view/ValidityRange.test.tsx`

- [ ] **Step 1: bo4e.css** — Grundklassen (Auszug; alle Farben über `--prn-*`). Vollständige Klassen für die in diesem und den folgenden Tasks genutzten Komponenten:

```css
/* prince-ui-bo4e — Smart-View. Tokens: prince-ui-tokens (--prn-*) */
.prn-bo-card { background: var(--prn-bg-elevated); border: 1px solid var(--prn-border); border-radius: var(--prn-radius-lg); box-shadow: var(--prn-shadow); padding: 15px 17px; }
.prn-bo-vrange { display: inline-flex; align-items: center; gap: 5px; font: var(--prn-text-footnote); white-space: nowrap; }
.prn-bo-vrange .dot { width: 7px; height: 7px; border-radius: 50%; }
.prn-bo-vrange[data-state="aktiv"] { color: var(--prn-label-2); } .prn-bo-vrange[data-state="aktiv"] .dot { background: var(--prn-accent); }
.prn-bo-vrange[data-state="laeuftBald"] { color: var(--prn-orange); } .prn-bo-vrange[data-state="laeuftBald"] .dot { background: var(--prn-orange); }
.prn-bo-vrange[data-state="abgelaufen"] { color: var(--prn-label-3); } .prn-bo-vrange[data-state="abgelaufen"] .dot { background: var(--prn-label-3); }
.prn-bo-vrange[data-state="zukuenftig"] { color: var(--prn-blue); } .prn-bo-vrange[data-state="zukuenftig"] .dot { background: var(--prn-blue); }
.prn-bo-addr { display: flex; gap: 9px; align-items: flex-start; font: var(--prn-text-callout); line-height: 1.5; }
.prn-bo-addr .l2 { color: var(--prn-label-2); } .prn-bo-addr .l3 { color: var(--prn-label-3); font: var(--prn-text-footnote); }
.prn-bo-code { font-family: var(--prn-font-mono); }
.prn-bo-code .nm { font-family: var(--prn-font); font-weight: 500; }
.prn-bo-idh { display: flex; align-items: center; gap: 12px; margin-bottom: 11px; }
.prn-bo-idh .ico { width: 38px; height: 38px; border-radius: var(--prn-radius-md); background: var(--prn-accent-soft); color: var(--prn-accent-strong); display: flex; align-items: center; justify-content: center; }
.prn-bo-idh .ttl { font: var(--prn-text-title-3); }
.prn-bo-idh .sub { font: var(--prn-text-footnote); color: var(--prn-label-2); }
.prn-bo-idh .pill { margin-left: auto; background: var(--prn-fill); color: var(--prn-label-2); border-radius: var(--prn-radius-sm); padding: 3px 9px; font: var(--prn-text-caption); }
```

- [ ] **Step 2: ValidityRange.tsx**

```tsx
import { validityStatus } from "../core/validity";
import { formatDateDE } from "../core/datetime";

export interface ValidityRangeProps { start?: string | null; end?: string | null; now?: Date }
export function ValidityRange({ start, end, now }: ValidityRangeProps) {
  const state = validityStatus({ startdatum: start ?? undefined, enddatum: end ?? undefined }, now);
  const label = state === "abgelaufen" ? "abgelaufen" : state === "laeuftBald" ? "läuft bald" : state === "zukuenftig" ? "künftig" : "";
  const text = [start ? formatDateDE(start) : "", end ? formatDateDE(end) : ""].filter(Boolean).join(" – ");
  return (
    <span className="prn-bo-vrange" data-state={state}>
      <span className="dot" /> {text}{label ? ` · ${label}` : ""}
    </span>
  );
}
```

- [ ] **Step 3: ValidityRange.test.tsx**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ValidityRange } from "./ValidityRange";

describe("ValidityRange", () => {
  it("renders Berlin dates and an expired hint", () => {
    render(<ValidityRange start="2022-12-31T23:00:00Z" end="2025-10-14T07:52:00Z" now={new Date("2026-06-25T12:00:00Z")} />);
    expect(screen.getByText(/01\.01\.2023/)).toBeInTheDocument();
    expect(screen.getByText(/abgelaufen/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: AddressBlock.tsx**

```tsx
import { Icon } from "prince-ui";
export interface Adresse { strasse?: string; hausnummer?: string; postleitzahl?: string; ort?: string; ortsteil?: string; landescode?: string }
export function AddressBlock({ adresse }: { adresse: Adresse }) {
  const a = adresse;
  return (
    <div className="prn-bo-addr">
      <Icon name="map-pin" aria-hidden />
      <div>
        <div>{[a.strasse, a.hausnummer].filter(Boolean).join(" ")}</div>
        <div className="l2">{[a.postleitzahl, a.ort].filter(Boolean).join(" ")}{a.ortsteil ? ` · ${a.ortsteil}` : ""}</div>
        {a.landescode ? <div className="l3">{a.landescode}</div> : null}
      </div>
    </div>
  );
}
```

> `Icon`-Import/-Props ggf. an die echte prince-ui-Signatur anpassen (Name-Prop vs. Komponente). Falls `Icon` anders heißt, hier und in allen folgenden Bausteinen konsistent anpassen.

- [ ] **Step 5: CodeResolved.tsx**

```tsx
import type { Bo4eResolvers } from "../types";
export function CodeResolved({ code, codetyp, resolvers }: { code: string; codetyp?: string; resolvers?: Bo4eResolvers }) {
  const info = resolvers?.marktpartner?.(code, codetyp);
  return (
    <span className="prn-bo-code">
      {info ? <span className="nm">{info.name}</span> : <span>{code}</span>}
      {info ? <span style={{ color: "var(--prn-label-3)", marginLeft: 6, fontSize: "0.8em" }}>{code}</span> : null}
    </span>
  );
}
```

- [ ] **Step 6: IdentityHeader.tsx**

```tsx
import type { ReactNode } from "react";
export function IdentityHeader({ icon, title, subtitle, trailing, onIconClick }: {
  icon?: ReactNode; title: ReactNode; subtitle?: ReactNode; trailing?: ReactNode; onIconClick?: () => void;
}) {
  return (
    <div className="prn-bo-idh">
      {icon ? <button type="button" className="ico" onClick={onIconClick} aria-label="Info">{icon}</button> : null}
      <div><div className="ttl">{title}</div>{subtitle ? <div className="sub">{subtitle}</div> : null}</div>
      {trailing ? <div className="pill">{trailing}</div> : null}
    </div>
  );
}
```

- [ ] **Step 7: Run tests** — `pnpm --filter prince-ui-bo4e test ValidityRange`. Expected: PASS.
- [ ] **Step 8: Commit** — `git add packages/bo4e/src/view && git commit -m "feat(bo4e): base building blocks (validity/address/code/header)"`

---

## Task 11: Schema-Bausteine (SchemaPopover, SchemaField, EnumIcon, EnumBadge)

**Files:**
- Create: `view/SchemaPopover.tsx`, `SchemaField.tsx`, `EnumIcon.tsx`, `EnumBadge.tsx`, `view/SchemaField.test.tsx`
- Modify: `view/bo4e.css`

- [ ] **Step 1: bo4e.css ergänzen**

```css
.prn-bo-badge { display: inline-flex; align-items: center; gap: 5px; border-radius: var(--prn-radius-sm); padding: 3px 9px; font: var(--prn-text-footnote); font-weight: 500; cursor: pointer; }
.prn-bo-badge[data-tone="neutral"] { background: var(--prn-fill); color: var(--prn-label-2); }
.prn-bo-badge[data-tone="positive"] { background: var(--prn-accent-soft); color: var(--prn-accent-strong); }
.prn-bo-badge[data-tone="info"] { background: var(--prn-tint-info); color: var(--prn-blue); }
.prn-bo-badge[data-tone="critical"] { background: var(--prn-tint-critical); color: var(--prn-orange); }
.prn-bo-badge[data-tone="negative"] { background: var(--prn-tint-negative); color: var(--prn-red); }
.prn-bo-pop h4 { margin: 0 0 2px; font: var(--prn-text-headline); }
.prn-bo-pop .key { font-family: var(--prn-font-mono); font-size: 11px; color: var(--prn-label-3); margin-bottom: 9px; }
.prn-bo-pop .desc { font: var(--prn-text-footnote); color: var(--prn-label-2); margin-bottom: 10px; }
.prn-bo-pop .row { display: flex; justify-content: space-between; gap: 10px; font: var(--prn-text-caption); color: var(--prn-label-2); }
.prn-bo-pop .enums { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
.prn-bo-pop .ev { font-family: var(--prn-font-mono); font-size: 11px; padding: 2px 7px; border-radius: var(--prn-radius-xs); background: var(--prn-fill); color: var(--prn-label-2); }
.prn-bo-pop .ev[data-on="true"] { background: var(--prn-accent); color: var(--prn-on-accent); }
```

- [ ] **Step 2: SchemaPopover.tsx** (Inhalt; nutzt prince-ui `Popover` als Container im SchemaField)

```tsx
import type { FieldDoc } from "../types";
import { isIsoDate, zonedLabelWithTz, toUtcLabel } from "../core/datetime";

export function SchemaPopoverBody({ fieldKey, doc, value }: { fieldKey: string; doc: FieldDoc; value: unknown }) {
  const isDate = isIsoDate(value);
  return (
    <div className="prn-bo-pop">
      <h4>{doc.translation}</h4>
      <div className="key">{fieldKey}{doc.enumRef ? ` · enum ${doc.enumRef}` : ""}</div>
      {doc.description ? <div className="desc">{doc.description}</div>
        : <div className="desc" style={{ fontStyle: "italic" }}>Keine Schema-Beschreibung hinterlegt.</div>}
      {isDate ? (
        <>
          <div className="row"><span>Angezeigt (Berlin)</span><span>{zonedLabelWithTz(value as string)}</span></div>
          <div className="row"><span>Übermittelt (UTC)</span><span style={{ fontFamily: "var(--prn-font-mono)" }}>{toUtcLabel(value as string)}</span></div>
        </>
      ) : (
        <>
          {doc.pattern ? <div className="row"><span>Pattern</span><span style={{ fontFamily: "var(--prn-font-mono)" }}>{doc.pattern}</span></div> : null}
          {doc.example ? <div className="row"><span>Beispiel</span><span style={{ fontFamily: "var(--prn-font-mono)" }}>{doc.example}</span></div> : null}
        </>
      )}
      {doc.enum ? (
        <div className="enums">{doc.enum.values.map((v) => <span key={v} className="ev" data-on={v === value}>{v}</span>)}</div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 3: SchemaField.tsx** (klickbares Label/Wert → Popover; nutzt prince-ui `Popover`/`DialogTrigger`-Muster)

```tsx
import type { ReactNode } from "react";
import { Popover } from "prince-ui";
import { DialogTrigger, Button, Dialog } from "react-aria-components";
import type { Bo4eSchema } from "../schema/load-schema";
import { resolveField } from "../schema/load-schema";
import { SchemaPopoverBody } from "./SchemaPopover";

export function SchemaField({ schema, boTyp, fieldKey, value, children }: {
  schema: Bo4eSchema; boTyp: string; fieldKey: string; value: unknown; children: ReactNode;
}) {
  const doc = resolveField(schema, boTyp, fieldKey);
  return (
    <DialogTrigger>
      <Button className="prn-bo-field" style={{ all: "unset", cursor: "pointer" }}>{children}</Button>
      <Popover><Dialog><SchemaPopoverBody fieldKey={fieldKey} doc={doc} value={value} /></Dialog></Popover>
    </DialogTrigger>
  );
}
```

> Prince-ui `Popover` umschließt React-Aria `Dialog`; falls prince-ui ein eigenes `Dialog`/`DialogTrigger` re-exportiert, dieses verwenden. Trigger ist ein unsichtbarer Button um den Wert.

- [ ] **Step 4: EnumIcon.tsx**

```tsx
import { Icon } from "prince-ui";
const MAP: Record<string, Record<string, string>> = {
  SPARTE: { STROM: "bolt", GAS: "flame", WASSER: "droplet", ABWASSER: "droplet" },
  ENERGIERICHTUNG: { AUSSP: "arrow-down-right", EINSP: "arrow-up-right" },
};
export function EnumIcon({ enumName, value }: { enumName: string; value: string }) {
  const name = MAP[enumName]?.[value] ?? "circle";
  return <Icon name={name as never} aria-hidden />;
}
```

- [ ] **Step 5: EnumBadge.tsx**

```tsx
import type { ReactNode } from "react";
export type Tone = "neutral" | "positive" | "info" | "critical" | "negative";
export function EnumBadge({ tone = "neutral", icon, children, onClick }: { tone?: Tone; icon?: ReactNode; children: ReactNode; onClick?: () => void }) {
  return <span className="prn-bo-badge" data-tone={tone} role={onClick ? "button" : undefined} onClick={onClick}>{icon}{children}</span>;
}
```

- [ ] **Step 6: SchemaField.test.tsx**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { loadBo4eSchema } from "../schema/load-schema";
import { SchemaField } from "./SchemaField";
import fields from "../__fixtures__/bo4e-fields.json";
import enums from "../__fixtures__/bo4e-enums.json";
import bos from "../__fixtures__/bo4e-bos.json";

const schema = loadBo4eSchema({ fields, enums, bos });
describe("SchemaField", () => {
  it("opens a popover with description and enum values", async () => {
    render(<SchemaField schema={schema} boTyp="MARKTLOKATION" fieldKey="energierichtung" value="AUSSP"><span>AUSSP</span></SchemaField>);
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByText(/eingespeist|ausgespeist|entnommen/i)).toBeInTheDocument();
    expect(screen.getByText("EINSP")).toBeInTheDocument();
  });
  it("shows UTC + Berlin for date fields", async () => {
    render(<SchemaField schema={schema} boTyp="VERTRAG" fieldKey="vertragsende" value="2026-05-06T09:46:00Z"><span>x</span></SchemaField>);
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByText(/Übermittelt \(UTC\)/)).toBeInTheDocument();
    expect(screen.getByText(/2026-05-06T09:46:00Z/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run** — `pnpm --filter prince-ui-bo4e test SchemaField`. Expected: PASS (ggf. Popover-Render in jsdom über `findBy*` abwarten).
- [ ] **Step 8: Commit** — `git add packages/bo4e/src/view && git commit -m "feat(bo4e): schema popover + enum icon/badge"`

---

## Task 12: ContactLine + MarktpartnerRow

**Files:**
- Create: `view/ContactLine.tsx`, `view/MarktpartnerRow.tsx`, `view/MarktpartnerRow.test.tsx`
- Modify: `view/bo4e.css`

- [ ] **Step 1: bo4e.css ergänzen**

```css
.prn-bo-contact { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.prn-bo-contact .av { width: 38px; height: 38px; border-radius: 50%; background: var(--prn-tint-info); color: var(--prn-blue); display: flex; align-items: center; justify-content: center; font-weight: 600; }
.prn-bo-contact .cn { font: var(--prn-text-headline); }
.prn-bo-contact .cways { margin-left: auto; display: flex; gap: 7px; }
.prn-bo-contact .cway { width: 30px; height: 30px; border-radius: var(--prn-radius-sm); border: 1px solid var(--prn-border); display: flex; align-items: center; justify-content: center; color: var(--prn-blue); }
.prn-bo-contact .cway[data-off="true"] { color: var(--prn-label-3); opacity: .4; }
.prn-bo-mpr { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid var(--prn-separator); }
.prn-bo-mpr:last-child { border-bottom: none; } .prn-bo-mpr[data-dim="true"] { opacity: .5; }
.prn-bo-mpr .rtag { font: var(--prn-text-caption); font-weight: 600; border-radius: var(--prn-radius-xs); padding: 2px 7px; background: var(--prn-tint-info); color: var(--prn-blue); min-width: 42px; text-align: center; }
.prn-bo-mpr .mid { min-width: 0; flex: 1; } .prn-bo-mpr .mnm { font: var(--prn-text-callout); font-weight: 500; }
.prn-bo-mpr .mcd { font-family: var(--prn-font-mono); font-size: 11px; color: var(--prn-label-3); }
.prn-bo-mpr .meig { font: var(--prn-text-caption); color: var(--prn-blue); }
```

- [ ] **Step 2: ContactLine.tsx**

```tsx
import { Icon } from "prince-ui";
export interface ContactPerson { anrede?: string; name1?: string; name2?: string; name3?: string; eMailAdresse?: string; kontaktweg?: string[]; geschaeftspartnerrolle?: string[] }
export function ContactLine({ person }: { person: ContactPerson }) {
  const name = [person.anrede, person.name1, person.name2, person.name3].filter(Boolean).join(" ");
  const init = `${person.name1?.[0] ?? ""}${person.name2?.[0] ?? ""}`.toUpperCase();
  const kw = person.kontaktweg ?? [];
  return (
    <div className="prn-bo-contact">
      <div className="av">{init}</div>
      <div>
        <div className="cn">{name}</div>
        <div style={{ font: "var(--prn-text-footnote)", color: "var(--prn-label-2)" }}>
          {(person.geschaeftspartnerrolle ?? []).join(", ")}{person.eMailAdresse ? ` · ${person.eMailAdresse}` : ""}
        </div>
      </div>
      <div className="cways">
        <a className="cway" data-off={!kw.includes("E_MAIL")} href={person.eMailAdresse ? `mailto:${person.eMailAdresse}` : undefined} aria-label="E-Mail"><Icon name="mail" aria-hidden /></a>
        <span className="cway" data-off={!kw.includes("TELEFONAT")} aria-label="Telefon"><Icon name="phone" aria-hidden /></span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: MarktpartnerRow.tsx**

```tsx
import type { Bo4eObject, Bo4eResolvers } from "../types";
import { CodeResolved } from "./CodeResolved";
import { ValidityRange } from "./ValidityRange";
import { validityStatus } from "../core/validity";

export function MarktpartnerRow({ row, resolvers, now }: { row: Bo4eObject; resolvers?: Bo4eResolvers; now?: Date }) {
  const gz = (row.gueltigkeitszeitraum ?? {}) as { startdatum?: string; enddatum?: string };
  const dim = validityStatus({ startdatum: gz.startdatum, enddatum: gz.enddatum }, now) === "abgelaufen";
  return (
    <div className="prn-bo-mpr" data-dim={dim}>
      <span className="rtag">{String(row.marktrolle ?? "—")}</span>
      <div className="mid">
        <div className="mnm"><CodeResolved code={String(row.rollencodenummer ?? "")} codetyp={String(row.rollencodetyp ?? "")} resolvers={resolvers} /></div>
        {row.messstellenbetreiberEigenschaft ? <div className="meig">grundzuständig</div> : null}
      </div>
      {gz.startdatum || gz.enddatum ? <ValidityRange start={gz.startdatum} end={gz.enddatum} now={now} /> : null}
    </div>
  );
}
```

- [ ] **Step 4: MarktpartnerRow.test.tsx**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarktpartnerRow } from "./MarktpartnerRow";

describe("MarktpartnerRow", () => {
  it("resolves code to name via injected resolver", () => {
    render(<MarktpartnerRow
      row={{ marktrolle: "MSB", rollencodenummer: "9906464000001", gueltigkeitszeitraum: { enddatum: "2026-07-01T04:00:00Z" } }}
      resolvers={{ marktpartner: (c) => (c === "9906464000001" ? { name: "Westnetz" } : undefined) }}
      now={new Date("2026-06-25T12:00:00Z")} />);
    expect(screen.getByText("Westnetz")).toBeInTheDocument();
    expect(screen.getByText("MSB")).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run** — `pnpm --filter prince-ui-bo4e test MarktpartnerRow`. Expected: PASS.
- [ ] **Step 6: Commit** — `git add packages/bo4e/src/view && git commit -m "feat(bo4e): contact line + marktpartner row"`

---

## Task 13: FullDetail (2-Spalten-Vollsicht) + SmartObjectCard

**Files:**
- Create: `view/FullDetail.tsx`, `view/SmartObjectCard.tsx`
- Modify: `view/bo4e.css`

- [ ] **Step 1: bo4e.css ergänzen**

```css
.prn-bo-kvgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 1px 28px; margin-top: 11px; border-top: 1px solid var(--prn-separator); padding-top: 11px; }
.prn-bo-kv { display: grid; grid-template-columns: minmax(110px, 44%) 1fr; gap: 10px; padding: 4px 0; font: var(--prn-text-footnote); }
.prn-bo-kv .k { text-align: right; color: var(--prn-label-2); }
.prn-bo-kv .v { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.prn-bo-kv .v[data-null="true"] { color: var(--prn-label-3); font-weight: 400; }
.prn-bo-moreb { background: none; border: none; color: var(--prn-accent-strong); font: var(--prn-text-footnote); font-weight: 500; cursor: pointer; display: inline-flex; gap: 6px; align-items: center; padding: 10px 0 0; border-top: 1px solid var(--prn-separator); margin-top: 11px; width: 100%; }
.prn-bo-grp { margin-top: 13px; }
.prn-bo-grph { font: var(--prn-text-caption); text-transform: uppercase; letter-spacing: .04em; color: var(--prn-label-3); margin: 0 0 7px; }
```

- [ ] **Step 2: FullDetail.tsx** (alle Skalar-Felder als Wertepaare; nutzt SchemaField + Berlin-Datum)

```tsx
import type { Bo4eObject } from "../types";
import type { Bo4eSchema } from "../schema/load-schema";
import { SchemaField } from "./SchemaField";
import { humanize } from "../core/humanize";
import { isIsoDate, formatDateDE } from "../core/datetime";

function display(v: unknown): { text: string; isNull: boolean } {
  if (v == null) return { text: "—", isNull: true };
  if (Array.isArray(v)) return { text: v.join(", "), isNull: false };
  if (isIsoDate(v)) return { text: formatDateDE(v as string, { withTime: true }), isNull: false };
  if (typeof v === "boolean") return { text: v ? "Ja" : "Nein", isNull: false };
  return { text: String(v), isNull: false };
}
export function FullDetail({ schema, boTyp, obj }: { schema: Bo4eSchema; boTyp: string; obj: Bo4eObject }) {
  const keys = Object.keys(obj).filter((k) => obj[k] == null || typeof obj[k] !== "object" || Array.isArray(obj[k]));
  return (
    <div className="prn-bo-kvgrid">
      {keys.map((k) => {
        const d = display(obj[k]);
        return (
          <div className="prn-bo-kv" key={k}>
            <span className="k"><SchemaField schema={schema} boTyp={boTyp} fieldKey={k} value={obj[k]}><span>{humanize(k)}</span></SchemaField></span>
            <span className="v" data-null={d.isNull} title={d.text}>{d.text}</span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: SmartObjectCard.tsx**

```tsx
import { useState, type ReactNode } from "react";
import type { Bo4eObject } from "../types";
import type { Bo4eSchema } from "../schema/load-schema";
import { FullDetail } from "./FullDetail";

export function SmartObjectCard({ schema, boTyp, obj, header, children }: {
  schema: Bo4eSchema; boTyp: string; obj: Bo4eObject; header?: ReactNode; children: ReactNode;
}) {
  const [full, setFull] = useState(false);
  return (
    <div className="prn-bo-card">
      {header}
      {children}
      {full ? <FullDetail schema={schema} boTyp={boTyp} obj={obj} />
        : <button type="button" className="prn-bo-moreb" onClick={() => setFull(true)}>+ Alle Details</button>}
    </div>
  );
}
```

- [ ] **Step 4: Verify** — `pnpm --filter prince-ui-bo4e typecheck`. Expected: pass.
- [ ] **Step 5: Commit** — `git add packages/bo4e/src/view && git commit -m "feat(bo4e): full-detail view + SmartObjectCard"`

---

## Task 14: Smart-Renderer (generic + Marktlokation) + SmartObjectView

**Files:**
- Create: `view/renderers/generic.tsx`, `view/renderers/marktlokation.tsx`, `view/SmartObjectView.tsx`, `view/SmartObjectView.test.tsx`

- [ ] **Step 1: generic.tsx** (Fallback: wichtige Skalar-Felder als Badges/Zeilen)

```tsx
import type { Bo4eObject } from "../../types";
import type { Bo4eSchema } from "../../schema/load-schema";
import { getFieldOrder } from "../../schema/load-schema";
import { SchemaField } from "../SchemaField";
import { humanize } from "../../core/humanize";

export function GenericBody({ schema, boTyp, obj }: { schema: Bo4eSchema; boTyp: string; obj: Bo4eObject }) {
  const order = getFieldOrder(schema, boTyp).filter((k) => k in obj && (obj[k] == null || typeof obj[k] !== "object" || Array.isArray(obj[k])));
  const keys = order.slice(0, 6);
  return (
    <div className="prn-bo-grp">
      {keys.map((k) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
          <SchemaField schema={schema} boTyp={boTyp} fieldKey={k} value={obj[k]}><span style={{ color: "var(--prn-label-2)" }}>{humanize(k)}</span></SchemaField>
          <span style={{ fontWeight: 500 }}>{obj[k] == null ? "—" : Array.isArray(obj[k]) ? (obj[k] as unknown[]).join(", ") : String(obj[k])}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: marktlokation.tsx** (Hero-Smart-Body)

```tsx
import type { Bo4eObject, Bo4eResolvers } from "../../types";
import type { Bo4eSchema } from "../../schema/load-schema";
import { IdentityHeader } from "../IdentityHeader";
import { EnumIcon } from "../EnumIcon";
import { EnumBadge } from "../EnumBadge";
import { ContactLine } from "../ContactLine";
import { AddressBlock } from "../AddressBlock";
import { MarktpartnerRow } from "../MarktpartnerRow";
import { validityStatus } from "../../core/validity";

export function MarktlokationHeader({ obj }: { obj: Bo4eObject }) {
  return <IdentityHeader icon={<EnumIcon enumName="SPARTE" value={String(obj.sparte)} />} title={`MaLo ${obj.marktlokationsId}`} subtitle="Marktlokation" trailing={(obj.marktlokationsTyp as { typ?: string }[] | undefined)?.[0]?.typ ? "Standard" : undefined} />;
}
export function MarktlokationBody({ schema, obj, resolvers, now }: { schema: Bo4eSchema; obj: Bo4eObject; resolvers?: Bo4eResolvers; now?: Date }) {
  const rollen = (obj.marktrollen as Bo4eObject[] | undefined) ?? [];
  const sorted = [...rollen].sort((a, b) => Number(validityStatus({ enddatum: (a.gueltigkeitszeitraum as { enddatum?: string })?.enddatum }, now) === "abgelaufen") - Number(validityStatus({ enddatum: (b.gueltigkeitszeitraum as { enddatum?: string })?.enddatum }, now) === "abgelaufen"));
  const endkunde = obj.endkunde as { partneradresse?: Record<string, unknown> } | undefined;
  return (
    <>
      <div className="prn-bo-grp" style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
        {obj.energierichtung ? <EnumBadge icon={<EnumIcon enumName="ENERGIERICHTUNG" value={String(obj.energierichtung)} />}>{obj.energierichtung === "AUSSP" ? "Verbrauch" : "Erzeugung"}</EnumBadge> : null}
        {obj.bilanzierungsmethode ? <EnumBadge>{String(obj.bilanzierungsmethode)}</EnumBadge> : null}
        {obj.netzebene ? <EnumBadge>{String(obj.netzebene)}</EnumBadge> : null}
        {obj.sperrstatus ? <EnumBadge tone={obj.sperrstatus === "ENTSPERRT" ? "positive" : "negative"}>{String(obj.sperrstatus).toLowerCase()}</EnumBadge> : null}
      </div>
      {endkunde ? <div className="prn-bo-grp"><div className="prn-bo-grph">Endkunde</div><ContactLine person={obj.endkunde as never} />{endkunde.partneradresse ? <AddressBlock adresse={endkunde.partneradresse as never} /> : null}</div> : null}
      {sorted.length ? <div className="prn-bo-grp"><div className="prn-bo-grph">Marktrollen · {sorted.length}</div>{sorted.map((r, i) => <MarktpartnerRow key={i} row={r} resolvers={resolvers} now={now} />)}</div> : null}
    </>
  );
}
```

- [ ] **Step 3: SmartObjectView.tsx** (Renderer-Auswahl je boTyp)

```tsx
import type { Bo4eObject, Bo4eResolvers } from "../types";
import type { Bo4eSchema } from "../schema/load-schema";
import { SmartObjectCard } from "./SmartObjectCard";
import { GenericBody } from "./renderers/generic";
import { MarktlokationHeader, MarktlokationBody } from "./renderers/marktlokation";

export function SmartObjectView({ schema, obj, resolvers, now }: { schema: Bo4eSchema; obj: Bo4eObject; resolvers?: Bo4eResolvers; now?: Date }) {
  const boTyp = obj.boTyp ?? "UNKNOWN";
  if (boTyp === "MARKTLOKATION") {
    return <SmartObjectCard schema={schema} boTyp={boTyp} obj={obj} header={<MarktlokationHeader obj={obj} />}><MarktlokationBody schema={schema} obj={obj} resolvers={resolvers} now={now} /></SmartObjectCard>;
  }
  return <SmartObjectCard schema={schema} boTyp={boTyp} obj={obj}><GenericBody schema={schema} boTyp={boTyp} obj={obj} /></SmartObjectCard>;
}
```

- [ ] **Step 4: SmartObjectView.test.tsx**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { loadBo4eSchema } from "../schema/load-schema";
import { SmartObjectView } from "./SmartObjectView";
import cdoc from "../__fixtures__/cdoc-example.json";
import fields from "../__fixtures__/bo4e-fields.json";
import enums from "../__fixtures__/bo4e-enums.json";
import bos from "../__fixtures__/bo4e-bos.json";

const schema = loadBo4eSchema({ fields, enums, bos });
const malo = (cdoc as any).content.OUTBOUND.stammdaten.MARKTLOKATION[0];
describe("SmartObjectView (Marktlokation)", () => {
  it("renders identity + marktrollen and expands to full detail", async () => {
    render(<SmartObjectView schema={schema} obj={malo} now={new Date("2026-06-25T12:00:00Z")} />);
    expect(screen.getByText(/MaLo 10037104444/)).toBeInTheDocument();
    expect(screen.getByText(/Marktrollen ·/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Alle Details/ }));
    expect(screen.getByText(/Bilanzierungsgebiet|bilanzierungsgebiet/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run** — `pnpm --filter prince-ui-bo4e test SmartObjectView`. Expected: PASS.
- [ ] **Step 6: Commit** — `git add packages/bo4e/src/view && git commit -m "feat(bo4e): smart object view (generic + marktlokation)"`

---

## Task 15: SydocView + Auffälligkeiten-Leiste

**Files:**
- Create: `src/SydocView.tsx`, `src/SydocView.test.tsx`
- Modify: `src/index.ts`, `view/bo4e.css`

- [ ] **Step 1: bo4e.css ergänzen**

```css
.prn-bo-app { display: flex; flex-direction: column; gap: 12px; }
.prn-bo-tabs { display: flex; gap: 6px; overflow-x: auto; }
.prn-bo-tab { padding: 6px 12px; border-radius: var(--prn-radius-pill); font: var(--prn-text-footnote); white-space: nowrap; cursor: pointer; color: var(--prn-label-2); background: var(--prn-fill); border: none; }
.prn-bo-tab[aria-selected="true"] { background: var(--prn-accent); color: var(--prn-on-accent); }
.prn-bo-warn { background: var(--prn-warn-soft); border: 1px solid var(--prn-orange); border-radius: var(--prn-radius); padding: 10px 13px; }
.prn-bo-warn summary { font: var(--prn-text-footnote); font-weight: 500; color: var(--prn-orange); cursor: pointer; }
.prn-bo-warn ul { margin: 9px 0 0; padding-left: 18px; } .prn-bo-warn li { font: var(--prn-text-caption); margin: 4px 0; }
```

- [ ] **Step 2: SydocView.tsx** (Richtungs-Umschalter + Gruppen-Tabs + Auffälligkeiten; bewusst eigener Tab-Mechanismus statt ObjectPage, um Milestone schlank zu halten — ObjectPage-Integration ist Slice 6)

```tsx
import { useMemo, useState } from "react";
import type { CDoc, Bo4eObject, Bo4eResolvers } from "./types";
import type { Bo4eSchema } from "./schema/load-schema";
import { scanAnomalies } from "./core/anomalies";
import { humanize } from "./core/humanize";
import { SmartObjectView } from "./view/SmartObjectView";
import "./view/bo4e.css";

export interface SydocViewProps { doc: CDoc; schema: Bo4eSchema; resolvers?: Bo4eResolvers; now?: Date }

export function SydocView({ doc, schema, resolvers, now }: SydocViewProps) {
  const directions = Object.keys(doc.content);
  const [dir, setDir] = useState(directions.includes("OUTBOUND") ? "OUTBOUND" : directions[0]);
  const dd = doc.content[dir]!;
  const groups = Object.keys(dd.stammdaten);
  const tabs = [...groups, "__TRANS__", "__ZUSATZ__"].filter((t) => t === "__TRANS__" ? dd.transaktionsdaten : t === "__ZUSATZ__" ? dd.zusatzdaten : true);
  const [tab, setTab] = useState(tabs[0]);
  const anomalies = useMemo(() => scanAnomalies(dd, { now }), [dd, now]);

  const renderTab = (t: string) => {
    if (t === "__TRANS__") return <SmartObjectView schema={schema} obj={dd.transaktionsdaten as Bo4eObject} resolvers={resolvers} now={now} />;
    if (t === "__ZUSATZ__") return <SmartObjectView schema={schema} obj={dd.zusatzdaten as Bo4eObject} resolvers={resolvers} now={now} />;
    return (dd.stammdaten[t] ?? []).map((obj, i) => <SmartObjectView key={i} schema={schema} obj={obj} resolvers={resolvers} now={now} />);
  };
  const tabLabel = (t: string) => t === "__TRANS__" ? "Transaktionsdaten" : t === "__ZUSATZ__" ? "Zusatzdaten" : humanize(t);
  const active = tabs.includes(tab) ? tab : tabs[0];

  return (
    <div className="prn-bo-app">
      {directions.length > 1 ? (
        <div className="prn-bo-tabs" role="tablist" aria-label="Richtung">
          {directions.map((d) => <button key={d} className="prn-bo-tab" role="tab" aria-selected={d === dir} onClick={() => { setDir(d); }}>{d}</button>)}
        </div>
      ) : null}
      {anomalies.length ? (
        <details className="prn-bo-warn">
          <summary>{anomalies.length} Auffälligkeiten erkannt</summary>
          <ul>{anomalies.map((a, i) => <li key={i}>{a.message} <code style={{ color: "var(--prn-label-3)" }}>— {a.path}</code></li>)}</ul>
        </details>
      ) : null}
      <div className="prn-bo-tabs" role="tablist" aria-label="Objekte">
        {tabs.map((t) => <button key={t} className="prn-bo-tab" role="tab" aria-selected={t === active} onClick={() => setTab(t)}>{tabLabel(t)}{dd.stammdaten[t] ? ` (${dd.stammdaten[t].length})` : ""}</button>)}
      </div>
      <div>{renderTab(active)}</div>
    </div>
  );
}
```

- [ ] **Step 3: SydocView.test.tsx**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { loadBo4eSchema } from "./schema/load-schema";
import { SydocView } from "./SydocView";
import cdoc from "./__fixtures__/cdoc-example.json";
import fields from "./__fixtures__/bo4e-fields.json";
import enums from "./__fixtures__/bo4e-enums.json";
import bos from "./__fixtures__/bo4e-bos.json";

const schema = loadBo4eSchema({ fields, enums, bos });
describe("SydocView", () => {
  it("shows group tabs (label != boTyp) and anomalies", () => {
    render(<SydocView doc={cdoc as any} schema={schema} now={new Date("2026-06-25T12:00:00Z")} />);
    expect(screen.getByRole("tab", { name: /Marktlokation/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Energieliefervertrag/ })).toBeInTheDocument();
    expect(screen.getByText(/Auffälligkeiten erkannt/)).toBeInTheDocument();
  });
  it("switches to the Energieliefervertrag tab", async () => {
    render(<SydocView doc={cdoc as any} schema={schema} now={new Date("2026-06-25T12:00:00Z")} />);
    await userEvent.click(screen.getByRole("tab", { name: /Energieliefervertrag/ }));
    expect(screen.getByText(/ENERGIELIEFERVERTRAG|Energieliefervertrag/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: index.ts final** — ergänze:

```ts
export * from "./view/SmartObjectView";
export * from "./view/SmartObjectCard";
export { SydocView } from "./SydocView";
export type { SydocViewProps } from "./SydocView";
```

- [ ] **Step 5: Run** — `pnpm --filter prince-ui-bo4e test SydocView`. Expected: PASS.
- [ ] **Step 6: Commit** — `git add packages/bo4e/src && git commit -m "feat(bo4e): SydocView with direction/group tabs + anomaly bar"`

---

## Task 16: Storybook-Stories

**Files:**
- Create: `packages/bo4e/stories/SydocView.stories.tsx`
- Verify: ob `.storybook/main.ts` `packages/bo4e/stories` bereits über sein Glob erfasst (sonst Glob ergänzen).

- [ ] **Step 1: Story**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { SydocView, loadBo4eSchema } from "prince-ui-bo4e";
import cdoc from "../src/__fixtures__/cdoc-example.json";
import fields from "../src/__fixtures__/bo4e-fields.json";
import enums from "../src/__fixtures__/bo4e-enums.json";
import bos from "../src/__fixtures__/bo4e-bos.json";

const schema = loadBo4eSchema({ fields, enums, bos });
const meta = { title: "BO4E/SydocView", component: SydocView, tags: ["autodocs"], parameters: { layout: "padded" } } satisfies Meta<typeof SydocView>;
export default meta;
type Story = StoryObj<typeof meta>;

const resolvers = { marktpartner: (c: string) => ({ "9906464000001": { name: "Westnetz Messung GmbH" }, "9900683000008": { name: "Netze BW GmbH" }, "9904000000005": { name: "E.ON Energie Dialog" } }[c]) };
export const OutboundMarktlokation: Story = { args: { doc: cdoc as never, schema, resolvers, now: new Date("2026-06-25T12:00:00Z") } };
```

- [ ] **Step 2: Storybook-Glob prüfen** — In `.storybook/main.ts` sicherstellen, dass `stories`-Glob `../packages/*/stories/**/*.stories.@(tsx|ts)` (oder Äquivalent) `packages/bo4e/stories` einschließt; falls nicht, ergänzen.

- [ ] **Step 3: Verify** — Run: `pnpm storybook` (kurz starten) und prüfen, dass „BO4E/SydocView" lädt, Marktlokation rendert, „+ Alle Details" funktioniert, Auffälligkeiten-Leiste erscheint, Theme-Toolbar Light/Dark/CU greift.
- [ ] **Step 4: Commit** — `git add packages/bo4e/stories .storybook && git commit -m "docs(bo4e): SydocView storybook story"`

---

## Task 17: Build-Verifikation + Changeset (Deploy-Vorbereitung)

**Files:**
- Create: `.changeset/<name>.md`

- [ ] **Step 1: Voller Paket-Check** — Run: `pnpm --filter prince-ui-bo4e test` (alle grün), `pnpm --filter prince-ui-bo4e typecheck`, `pnpm --filter prince-ui-bo4e build`. Expected: `dist/` enthält `index.js`, `index.d.ts`, `index.css`.
- [ ] **Step 2: Changeset anlegen** — `.changeset/prince-ui-bo4e-init.md`:

```md
---
"prince-ui-bo4e": minor
---

Neues Paket prince-ui-bo4e: Smart-Viewer für BO4E-cDoc (Milestone 1 — Schema-Core, Smart-View-Bausteine, SydocView mit Richtungs-/Gruppen-Tabs, Auffälligkeiten-Leiste, Berlin-Datumsanzeige mit UTC-Popover).
```

- [ ] **Step 3: Root-Build & Typecheck** — Run: `pnpm build && pnpm typecheck`. Expected: alle Pakete bauen (inkl. neues prince-ui-bo4e).
- [ ] **Step 4: Commit** — `git add .changeset && git commit -m "chore(bo4e): changeset for initial prince-ui-bo4e release"`

> **Deploy:** „release" läuft im Repo über `pnpm release` (changeset publish) bzw. Re-Vendoring per npm-tgz in finops/studio (siehe Memory „Prozess-Add-on-Pakete"). Nach grünem Root-Build mit dem Nutzer abstimmen, ob `changeset version` + publish oder Vendoring der Tarball gewünscht ist.

---

## Self-Review

**Spec-Coverage:** Schema-Core (Task 8) ✓; Resolver-Interface + Defaults (Task 7) ✓; Datum Berlin/UTC (Task 4, SchemaPopover Task 11) ✓; Gültigkeits-Engine (Task 5) ✓; Auffälligkeiten-Scanner (Task 6, Leiste Task 15) ✓; Bausteine IdentityHeader/EnumIcon/EnumBadge/ValidityRange/CodeResolved/AddressBlock/ContactLine/MarktpartnerRow/SchemaField/SmartObjectCard (Tasks 10–13) ✓; FullDetail „+ Alle Details" (Task 13) ✓; Smart-Renderer + boTyp-Auswahl (Task 14) ✓; SydocView Richtung/Gruppe≠boTyp/Tabs (Task 15) ✓; Icons (Task 9) ✓; Storybook (Task 16) ✓; Tests je Logik-Unit + Smoke (durchgängig) ✓; Build/Changeset/Deploy-Vorbereitung (Task 17) ✓.

**Bewusst nachgelagert (laut Spec, nicht Milestone 1):** Edit-Mode, Raw/JSON-Diagramm, Beziehungsgraph, ObjectPage/`iconTabBar`-Integration (Task 15 nutzt einen schlanken eigenen Tab-Mechanismus; Migration auf ObjectPage ist Slice 6), echte Resolver-Datenquellen, Cross-Object-Checks.

**Platzhalter-Scan:** keine TBD/TODO; alle Code-Schritte enthalten vollständigen Code.

**Typ-Konsistenz:** `Bo4eSchema`/`resolveField`/`FieldDoc`/`Bo4eResolvers`/`validityStatus`/`scanAnomalies` durchgängig identisch benannt und verwendet. `Icon`-Import-Signatur ist die einzige bewusst markierte Anpassstelle (Task 10/Step 4-Hinweis) — vor Task 11 verifizieren.
