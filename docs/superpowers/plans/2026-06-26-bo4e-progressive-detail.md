# BO4E Progressive-Detail-Umschalter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the per-card detail toggle in the BO4E viewer with two global axes — a 3-level density `SegmentedControl` (Fachlich/Gefüllt/Alle Felder) and an orthogonal `Bearbeiten` switch — backed by a recursive, schema-aware renderer that shows nested objects and object-arrays.

**Architecture:** New pure-core helpers (`isDeepEmpty`, `setIn`, `seedArrayIds`) drive a recursive `NestedValue` dispatcher (deep-empty-first → scalar → container). `CDocView` lifts `density` + `editMode` state and renders the controls. Ghost fields come from the documented field-dict, never `bos.properties`. Nested creation is gated on an optional `Bo4eStructure` map.

**Tech Stack:** React 18 + TypeScript, `@conuti-das/prince-ui` (SegmentedControl, Segment, Switch, Disclosure, DisclosureGroup, Select), Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-06-26-bo4e-progressive-detail-design.md`

**Run tests from package root** `packages/bo4e`: `pnpm vitest run <file>` (or `pnpm --filter @conuti-das/prince-ui-bo4e test`).

---

## File Structure

- Create `packages/bo4e/src/core/empty.ts` — `isDeepEmpty(value)`.
- Create `packages/bo4e/src/core/path.ts` — `setIn`, `deleteIn`, path types.
- Create `packages/bo4e/src/core/array-ids.ts` — WeakMap id seeding over the full tree, folded with deep-emptiness memo.
- Create `packages/bo4e/src/view/NestedValue.tsx` — recursive dispatcher.
- Create `packages/bo4e/src/view/useGhostFields.ts` — ghost/candidate scalar fields from the field-dict.
- Modify `packages/bo4e/src/schema/load-schema.ts` — optional `structure`, `resolveFieldStructure`.
- Modify `packages/bo4e/src/types.ts` — `Bo4eStructure`, `Density`.
- Modify `packages/bo4e/src/view/FullDetail.tsx` — delegate body to `NestedValue`, use `useGhostFields`, density/editable props.
- Modify `packages/bo4e/src/view/SmartObjectCard.tsx` — driven by `density`/`editable`, local collapse override.
- Modify `packages/bo4e/src/view/SmartObjectView.tsx` — thread `density`/`editable`.
- Modify `packages/bo4e/src/view/renderers/marktlokation.tsx` — thread `density`/`editable`, use `NestedValue` for rest.
- Modify `packages/bo4e/src/view/renderers/generic.tsx` — use `NestedValue` (drop hard `isScalarish` filter).
- Modify `packages/bo4e/src/CDocView.tsx` — lifted state + controls.
- Modify `packages/bo4e/src/view/bo4e.css` — nested block + segmented styles.
- Modify `packages/bo4e/src/index.ts` — export new public symbols.

---

## Task 1: `isDeepEmpty` core predicate

**Files:**
- Create: `packages/bo4e/src/core/empty.ts`
- Test: `packages/bo4e/src/core/empty.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// packages/bo4e/src/core/empty.test.ts
import { describe, it, expect } from "vitest";
import { isDeepEmpty } from "./empty";

describe("isDeepEmpty", () => {
  it("treats null/undefined/empty containers as empty", () => {
    expect(isDeepEmpty(null)).toBe(true);
    expect(isDeepEmpty(undefined)).toBe(true);
    expect(isDeepEmpty([])).toBe(true);
    expect(isDeepEmpty({})).toBe(true);
    expect(isDeepEmpty({ a: null, b: { c: null } })).toBe(true);
    expect(isDeepEmpty([{ x: null }, null])).toBe(true);
  });

  it("does NOT treat false/0/empty-string as empty (falsy trap)", () => {
    expect(isDeepEmpty(false)).toBe(false);
    expect(isDeepEmpty(0)).toBe(false);
    expect(isDeepEmpty("")).toBe(false);
    expect(isDeepEmpty({ unterbrechbar: false })).toBe(false);
    expect(isDeepEmpty({ kosten: 0 })).toBe(false);
  });

  it("treats filled scalars and deep-filled trees as non-empty", () => {
    expect(isDeepEmpty("KL")).toBe(false);
    expect(isDeepEmpty(["KL"])).toBe(false);
    expect(isDeepEmpty({ a: { b: { c: "x" } } })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/core/empty.test.ts`
Expected: FAIL — `isDeepEmpty is not a function` / module not found.

- [ ] **Step 3: Write minimal implementation**

```ts
// packages/bo4e/src/core/empty.ts
/**
 * True when a value carries no information: null/undefined, empty array/object,
 * or a tree containing only such. `false`, `0`, `""` are FILLED — never extend
 * this to falsy.
 */
export function isDeepEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value !== "object") return false; // false, 0, "" land here → filled
  if (Array.isArray(value)) return value.every(isDeepEmpty);
  return Object.values(value as Record<string, unknown>).every(isDeepEmpty);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/core/empty.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/bo4e/src/core/empty.ts packages/bo4e/src/core/empty.test.ts
git commit -m "feat(bo4e): isDeepEmpty predicate (falsy-safe)"
```

---

## Task 2: immutable `setIn` / `deleteIn` path helpers

**Files:**
- Create: `packages/bo4e/src/core/path.ts`
- Test: `packages/bo4e/src/core/path.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// packages/bo4e/src/core/path.test.ts
import { describe, it, expect } from "vitest";
import { setIn, deleteIn } from "./path";

describe("setIn", () => {
  it("sets a nested object key immutably", () => {
    const o = { a: { b: 1 } };
    const r = setIn(o, ["a", "b"], 2);
    expect(r).toEqual({ a: { b: 2 } });
    expect(o).toEqual({ a: { b: 1 } }); // original untouched
  });
  it("sets a nested array index immutably", () => {
    const o = { xs: [{ v: 1 }, { v: 2 }] };
    const r = setIn(o, ["xs", 1, "v"], 9);
    expect(r).toEqual({ xs: [{ v: 1 }, { v: 9 }] });
  });
  it("creates intermediate objects when missing", () => {
    expect(setIn({}, ["a", "b"], 5)).toEqual({ a: { b: 5 } });
  });
});

describe("deleteIn", () => {
  it("removes a nested object key immutably", () => {
    const o = { a: { b: 1, c: 2 } };
    expect(deleteIn(o, ["a", "b"])).toEqual({ a: { c: 2 } });
    expect(o).toEqual({ a: { b: 1, c: 2 } });
  });
  it("removes an array index immutably", () => {
    const o = { xs: [{ v: 1 }, { v: 2 }, { v: 3 }] };
    expect(deleteIn(o, ["xs", 1])).toEqual({ xs: [{ v: 1 }, { v: 3 }] });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/core/path.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```ts
// packages/bo4e/src/core/path.ts
export type PathSeg = string | number;
export type Path = PathSeg[];

function clone(node: unknown): any {
  return Array.isArray(node) ? [...node] : { ...(node as object) };
}

export function setIn<T>(root: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...rest] = path;
  const base: any = root == null ? (typeof head === "number" ? [] : {}) : clone(root);
  base[head] = setIn(base[head], rest, value);
  return base;
}

export function deleteIn<T>(root: T, path: Path): T {
  if (path.length === 0) return root;
  const [head, ...rest] = path;
  if (root == null) return root;
  const base: any = clone(root);
  if (rest.length === 0) {
    if (Array.isArray(base) && typeof head === "number") base.splice(head, 1);
    else delete base[head];
  } else {
    base[head] = deleteIn(base[head], rest);
  }
  return base;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/core/path.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/bo4e/src/core/path.ts packages/bo4e/src/core/path.test.ts
git commit -m "feat(bo4e): immutable setIn/deleteIn path helpers"
```

---

## Task 3: stable array-item ids + deep-empty memo (single load-time walk)

**Files:**
- Create: `packages/bo4e/src/core/array-ids.ts`
- Test: `packages/bo4e/src/core/array-ids.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// packages/bo4e/src/core/array-ids.test.ts
import { describe, it, expect } from "vitest";
import { itemId, seedTree } from "./array-ids";

describe("array ids", () => {
  it("assigns a stable id per object once, surviving identity", () => {
    const item = { v: 1 };
    const tree = { xs: [item] };
    seedTree(tree);
    const id1 = itemId(item);
    seedTree(tree); // re-seed must not change existing ids
    expect(itemId(item)).toBe(id1);
    expect(typeof id1).toBe("string");
  });

  it("distinct objects get distinct ids", () => {
    const a = { v: 1 };
    const b = { v: 1 };
    seedTree({ xs: [a, b] });
    expect(itemId(a)).not.toBe(itemId(b));
  });

  it("seeds the full tree regardless of depth", () => {
    const deep = { v: 9 };
    seedTree({ a: [{ b: [deep] }] });
    expect(itemId(deep)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/core/array-ids.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```ts
// packages/bo4e/src/core/array-ids.ts
const ids = new WeakMap<object, string>();
let counter = 0;

/** Stable id for an object node (assigned by seedTree). */
export function itemId(obj: object): string {
  let id = ids.get(obj);
  if (id == null) {
    id = `it${counter++}`;
    ids.set(obj, id);
  }
  return id;
}

/**
 * Walk the FULL tree once and assign a stable id to every object node, before
 * any density-dependent pruning. Idempotent — existing ids are kept.
 */
export function seedTree(node: unknown): void {
  if (node == null || typeof node !== "object") return;
  if (!Array.isArray(node)) itemId(node);
  const children = Array.isArray(node) ? node : Object.values(node as Record<string, unknown>);
  for (const c of children) seedTree(c);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/core/array-ids.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/bo4e/src/core/array-ids.ts packages/bo4e/src/core/array-ids.test.ts
git commit -m "feat(bo4e): stable array-item ids via load-time tree seed"
```

---

## Task 4: `Bo4eStructure` type + `resolveFieldStructure`

**Files:**
- Modify: `packages/bo4e/src/types.ts`
- Modify: `packages/bo4e/src/schema/load-schema.ts`
- Test: `packages/bo4e/src/schema/load-schema.test.ts` (extend)

- [ ] **Step 1: Write the failing test** (append to existing file)

```ts
// packages/bo4e/src/schema/load-schema.test.ts — add
import { resolveFieldStructure } from "./load-schema";

it("resolveFieldStructure returns undefined without a structure map", () => {
  const schema = loadBo4eSchema({ fields, enums, bos });
  expect(resolveFieldStructure(schema, "MARKTLOKATION", "adresse")).toBeUndefined();
});

it("resolveFieldStructure reads the optional structure map", () => {
  const schema = loadBo4eSchema({
    fields, enums, bos,
    structure: { MARKTLOKATION: { adresse: { kind: "object", ref: "ADRESSE" } } },
  });
  expect(resolveFieldStructure(schema, "MARKTLOKATION", "adresse")).toEqual({
    kind: "object", ref: "ADRESSE",
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/schema/load-schema.test.ts`
Expected: FAIL — `resolveFieldStructure` not exported; `structure` not accepted.

- [ ] **Step 3: Write minimal implementation**

In `types.ts` add:

```ts
export type Density = "fachlich" | "gefuellt" | "alle";

export interface Bo4eFieldStructure {
  kind: "scalar" | "object" | "array";
  ref?: string; // target boTyp for object/array
}
export type Bo4eStructure = Record<string, Record<string, Bo4eFieldStructure>>;
```

In `load-schema.ts` change the `Bo4eSchema` interface and loader, and add the resolver:

```ts
import type { FieldDoc, EnumDoc, Bo4eStructure, Bo4eFieldStructure } from "../types";
// ...
export interface Bo4eSchema {
  fields: Record<string, Record<string, RawField>>;
  enums: Record<string, RawEnum>;
  bos: Record<string, RawBo>;
  structure?: Bo4eStructure;
}

export function loadBo4eSchema(
  src: { fields: unknown; enums: unknown; bos: unknown; structure?: Bo4eStructure },
): Bo4eSchema {
  return {
    fields: src.fields as Bo4eSchema["fields"],
    enums: src.enums as Bo4eSchema["enums"],
    bos: src.bos as Bo4eSchema["bos"],
    structure: src.structure,
  };
}

export function resolveFieldStructure(
  schema: Bo4eSchema, boTyp: string, key: string,
): Bo4eFieldStructure | undefined {
  return schema.structure?.[boTyp]?.[key];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/schema/load-schema.test.ts`
Expected: PASS (existing + 2 new).

- [ ] **Step 5: Commit**

```bash
git add packages/bo4e/src/types.ts packages/bo4e/src/schema/load-schema.ts packages/bo4e/src/schema/load-schema.test.ts
git commit -m "feat(bo4e): optional Bo4eStructure map + resolveFieldStructure"
```

---

## Task 5: `useGhostFields` — documented scalar ghosts only

**Files:**
- Create: `packages/bo4e/src/view/useGhostFields.ts`
- Test: `packages/bo4e/src/view/useGhostFields.test.ts`

Rationale (spec): ghost source is the field-dict (`schema.fields[boTyp]`), ordered `properties ∩ dict` then remaining dict keys, never raw `properties` — `bos.properties` is stale (verified: 5/11 MALO properties absent from the field-dict). Ghosts are scalar-only and unfilled.

- [ ] **Step 1: Write the failing test**

```ts
// packages/bo4e/src/view/useGhostFields.test.ts
import { describe, it, expect } from "vitest";
import { computeGhostFields } from "./useGhostFields";
import type { Bo4eSchema } from "../schema/load-schema";

const schema = {
  fields: { MALO: { a: { translation: "A" }, b: { translation: "B" }, c: { translation: "C" } } },
  enums: {},
  bos: { MALO: { properties: ["b", "zzz_not_in_dict", "a"] } },
} as unknown as Bo4eSchema;

describe("computeGhostFields", () => {
  it("returns unfilled dict keys, ordered by properties∩dict then rest", () => {
    expect(computeGhostFields(schema, "MALO", { a: "x" })).toEqual(["b", "c"]);
  });
  it("never offers a property that is not in the field-dict", () => {
    expect(computeGhostFields(schema, "MALO", {})).not.toContain("zzz_not_in_dict");
    expect(computeGhostFields(schema, "MALO", {})).toEqual(["b", "a", "c"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/view/useGhostFields.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```ts
// packages/bo4e/src/view/useGhostFields.ts
import type { Bo4eObject } from "../types";
import type { Bo4eSchema } from "../schema/load-schema";

/** Unfilled, documented scalar field keys for a BO, ordered properties∩dict then rest. */
export function computeGhostFields(schema: Bo4eSchema, boTyp: string, obj: Bo4eObject): string[] {
  const dict = schema.fields[boTyp] ?? {};
  const dictKeys = Object.keys(dict);
  const props = schema.bos[boTyp]?.properties ?? [];
  const ordered = [
    ...props.filter((k) => k in dict),
    ...dictKeys.filter((k) => !props.includes(k)),
  ];
  const isFilled = (k: string) => k in obj && obj[k] != null && obj[k] !== "";
  return ordered.filter((k) => !isFilled(k));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/view/useGhostFields.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/bo4e/src/view/useGhostFields.ts packages/bo4e/src/view/useGhostFields.test.ts
git commit -m "feat(bo4e): computeGhostFields from documented field-dict"
```

---

## Task 6: `NestedValue` recursive dispatcher (read-only first)

**Files:**
- Create: `packages/bo4e/src/view/NestedValue.tsx`
- Test: `packages/bo4e/src/view/NestedValue.test.tsx`

Dispatch order (spec): `isDeepEmpty` → (prune at "gefuellt" / ghost at "alle") ; else `isScalarish` → scalar ; else container (object = full-width Disclosure block, object-array = DisclosureGroup of sub-cards). `boTyp` context switches into typed sub-objects. `MAX_DEPTH = 5` counts object/array nesting; beyond → "weitere Ebenen" affordance.

- [ ] **Step 1: Write the failing test**

```tsx
// packages/bo4e/src/view/NestedValue.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NestedValue } from "./NestedValue";
import { loadBo4eSchema } from "../schema/load-schema";
import fields from "../__fixtures__/bo4e-fields.json";
import enums from "../__fixtures__/bo4e-enums.json";
import bos from "../__fixtures__/bo4e-bos.json";

const schema = loadBo4eSchema({ fields, enums, bos });
const base = { schema, boTyp: "MARKTLOKATION", editable: false as const, path: [] as (string | number)[], depth: 0 };

describe("NestedValue", () => {
  it("renders a scalar value", () => {
    render(<NestedValue {...base} fieldKey="sparte" value="STROM" density="gefuellt" />);
    expect(screen.getByText("STROM")).toBeInTheDocument();
  });

  it("prunes deep-empty values at density gefuellt", () => {
    const { container } = render(
      <NestedValue {...base} fieldKey="leer" value={{ a: null }} density="gefuellt" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows deep-empty as ghost at density alle", () => {
    render(<NestedValue {...base} fieldKey="leer" value={null} density="alle" />);
    expect(screen.getByText(/leer/i)).toBeInTheDocument();
  });

  it("renders a nested object as a disclosure block (not in the .v cell)", () => {
    render(
      <NestedValue {...base} fieldKey="partneradresse" value={{ ort: "Köln", plz: "50667" }} density="gefuellt" />,
    );
    expect(screen.getByText("Köln")).toBeInTheDocument();
    expect(screen.getByText("50667")).toBeInTheDocument();
  });

  it("renders an object-array as repeated sub-cards", () => {
    render(
      <NestedValue {...base} fieldKey="marktlokationsTyp"
        value={[{ typ: "A" }, { typ: "B" }]} density="gefuellt" />,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/view/NestedValue.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```tsx
// packages/bo4e/src/view/NestedValue.tsx
import { Disclosure, DisclosureGroup } from "@conuti-das/prince-ui";
import type { Bo4eObject, Density } from "../types";
import type { Bo4eSchema } from "../schema/load-schema";
import { SchemaField } from "./SchemaField";
import { humanize } from "../core/humanize";
import { isScalarish, displayValue } from "./value-format";
import { isDeepEmpty } from "../core/empty";
import { itemId } from "../core/array-ids";
import type { Path } from "../core/path";

export const MAX_DEPTH = 5; // object/array nesting levels, not key-hops

export interface NestedValueProps {
  schema: Bo4eSchema;
  boTyp: string;
  fieldKey: string;
  value: unknown;
  density: Density;
  editable: boolean;
  path: Path;
  depth: number;
}

function label(schema: Bo4eSchema, boTyp: string, key: string, value: unknown) {
  return (
    <SchemaField schema={schema} boTyp={boTyp} fieldKey={key} value={value}>
      <span>{humanize(key)}</span>
    </SchemaField>
  );
}

export function NestedValue(props: NestedValueProps) {
  const { schema, boTyp, fieldKey, value, density, depth } = props;

  // 1. deep-empty first
  if (isDeepEmpty(value)) {
    if (density === "gefuellt") return null; // prune
    // density === "alle": ghost row
    return (
      <div className="prn-bo-kv" key={fieldKey}>
        <span className="k">{label(schema, boTyp, fieldKey, value)}</span>
        <span className="v" data-null="true">—</span>
      </div>
    );
  }

  // 2. scalar
  if (isScalarish(value)) {
    const d = displayValue(value);
    return (
      <div className="prn-bo-kv" key={fieldKey}>
        <span className="k">{label(schema, boTyp, fieldKey, value)}</span>
        <span className="v" data-null={d.isNull} title={d.text}>{d.text}</span>
      </div>
    );
  }

  // depth guard for containers
  if (depth >= MAX_DEPTH) {
    return (
      <div className="prn-bo-nestedmore">
        {label(schema, boTyp, fieldKey, value)} <span>… weitere Ebenen</span>
      </div>
    );
  }

  // 3a. object-array
  if (Array.isArray(value)) {
    const childBoTyp = (value[0] as Bo4eObject)?.boTyp ?? boTyp;
    return (
      <div className="prn-bo-nested">
        <div className="prn-bo-grph">{humanize(fieldKey)} · {value.length}</div>
        <DisclosureGroup>
          {(value as Bo4eObject[]).map((item, i) => (
            <Disclosure key={itemId(item) ?? i} title={`${humanize(fieldKey)} ${i + 1}`}>
              <NestedObject
                schema={schema} boTyp={item?.boTyp ?? childBoTyp} obj={item}
                density={density} editable={props.editable}
                path={[...props.path, fieldKey, i]} depth={depth + 1}
              />
            </Disclosure>
          ))}
        </DisclosureGroup>
      </div>
    );
  }

  // 3b. nested object — boTyp context switch if the sub-object is typed
  const obj = value as Bo4eObject;
  const childBoTyp = obj.boTyp ?? boTyp;
  return (
    <div className="prn-bo-nested">
      <Disclosure title={humanize(fieldKey)} defaultExpanded>
        <NestedObject
          schema={schema} boTyp={childBoTyp} obj={obj}
          density={density} editable={props.editable}
          path={[...props.path, fieldKey]} depth={depth + 1}
        />
      </Disclosure>
    </div>
  );
}

function NestedObject(props: {
  schema: Bo4eSchema; boTyp: string; obj: Bo4eObject;
  density: Density; editable: boolean; path: Path; depth: number;
}) {
  const { obj } = props;
  return (
    <div className="prn-bo-kvgrid">
      {Object.keys(obj).filter((k) => k !== "boTyp").map((k) => (
        <NestedValue
          key={k} schema={props.schema} boTyp={props.boTyp} fieldKey={k} value={obj[k]}
          density={props.density} editable={props.editable}
          path={[...props.path, k]} depth={props.depth}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/view/NestedValue.test.tsx`
Expected: PASS (5 tests). If a Disclosure collapses children by default and hides text, set `defaultExpanded` on the object-array `Disclosure` too, or query with `screen.getByText(..., { hidden: true })`.

- [ ] **Step 5: Commit**

```bash
git add packages/bo4e/src/view/NestedValue.tsx packages/bo4e/src/view/NestedValue.test.tsx
git commit -m "feat(bo4e): recursive NestedValue dispatcher (read-only)"
```

---

## Task 7: depth + deep-filled fixture test (the must-render guarantee)

**Files:**
- Test: `packages/bo4e/src/view/NestedValue.test.tsx` (extend)

- [ ] **Step 1: Write the failing test**

```tsx
// add to NestedValue.test.tsx
it("renders the deepest filled branch (~4 levels) at gefuellt", () => {
  // datenDerBeteiligtenMarktrolle[] → zaehlwerke[] → verwendungszwecke[] → zweck[]
  const value = [
    { zaehlwerke: [{ verwendungszwecke: [{ zweck: ["MESSUNG"] }] }] },
  ];
  render(
    <NestedValue {...base} fieldKey="datenDerBeteiligtenMarktrolle" value={value}
      density="gefuellt" depth={0} />,
  );
  // MAX_DEPTH=5 must not truncate a 4-deep branch
  expect(screen.queryByText(/weitere Ebenen/)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails or passes**

Run: `pnpm vitest run src/view/NestedValue.test.tsx -t "deepest filled"`
Expected: PASS if Disclosures render eagerly; if children are lazy/collapsed, the "weitere Ebenen" guard still must not appear — assert on its absence (the test does). If it FAILS because nested Disclosures are collapsed, add `defaultExpanded` to nested object Disclosures so deep content mounts.

- [ ] **Step 3: Adjust implementation if needed**

If lazy Disclosures hide deep content, ensure object Disclosures use `defaultExpanded` (already set in Task 6 for objects; mirror for arrays if the test needs the deep nodes mounted).

- [ ] **Step 4: Re-run**

Run: `pnpm vitest run src/view/NestedValue.test.tsx`
Expected: PASS (all).

- [ ] **Step 5: Commit**

```bash
git add packages/bo4e/src/view/NestedValue.test.tsx packages/bo4e/src/view/NestedValue.tsx
git commit -m "test(bo4e): deepest filled branch renders within MAX_DEPTH"
```

---

## Task 8: rewire `generic.tsx` body through `NestedValue`

**Files:**
- Modify: `packages/bo4e/src/view/renderers/generic.tsx`
- Test: `packages/bo4e/src/view/renderers/generic.test.tsx` (create)

- [ ] **Step 1: Write the failing test**

```tsx
// packages/bo4e/src/view/renderers/generic.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GenericBody } from "./generic";
import { loadBo4eSchema } from "../../schema/load-schema";
import fields from "../../__fixtures__/bo4e-fields.json";
import enums from "../../__fixtures__/bo4e-enums.json";
import bos from "../../__fixtures__/bo4e-bos.json";

const schema = loadBo4eSchema({ fields, enums, bos });

describe("GenericBody density", () => {
  it("fachlich shows compact scalars only", () => {
    render(<GenericBody schema={schema} boTyp="VERTRAG" obj={{ boTyp: "VERTRAG", sparte: "STROM" }} density="fachlich" />);
    expect(screen.getByText("STROM")).toBeInTheDocument();
  });
  it("gefuellt surfaces a nested object that fachlich hid", () => {
    render(
      <GenericBody schema={schema} boTyp="GESCHAEFTSPARTNER"
        obj={{ boTyp: "GESCHAEFTSPARTNER", partneradresse: { ort: "Köln" } }} density="gefuellt" />,
    );
    expect(screen.getByText("Köln")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/view/renderers/generic.test.tsx`
Expected: FAIL — `GenericBody` has no `density` prop; nested object not rendered.

- [ ] **Step 3: Write minimal implementation**

```tsx
// packages/bo4e/src/view/renderers/generic.tsx
import type { Bo4eObject, Density } from "../../types";
import type { Bo4eSchema } from "../../schema/load-schema";
import { getFieldOrder } from "../../schema/load-schema";
import { NestedValue } from "../NestedValue";
import { isScalarish } from "../value-format";

export function GenericBody({
  schema, boTyp, obj, density = "fachlich",
}: { schema: Bo4eSchema; boTyp: string; obj: Bo4eObject; density?: Density }) {
  if (density === "fachlich") {
    // compact: first ~6 scalar fields, schema-ordered (unchanged behaviour)
    const ordered = getFieldOrder(schema, boTyp).filter((k) => k in obj && isScalarish(obj[k]));
    const extra = Object.keys(obj).filter((k) => isScalarish(obj[k]) && !ordered.includes(k));
    const keys = [...ordered, ...extra].slice(0, 6);
    return (
      <div className="prn-bo-kvgrid">
        {keys.map((k) => (
          <NestedValue key={k} schema={schema} boTyp={boTyp} fieldKey={k} value={obj[k]}
            density="gefuellt" editable={false} path={[k]} depth={0} />
        ))}
      </div>
    );
  }
  // gefuellt / alle: full recursive body
  const keys = Object.keys(obj).filter((k) => k !== "boTyp");
  return (
    <div className="prn-bo-kvgrid">
      {keys.map((k) => (
        <NestedValue key={k} schema={schema} boTyp={boTyp} fieldKey={k} value={obj[k]}
          density={density} editable={false} path={[k]} depth={0} />
      ))}
    </div>
  );
}
```

Note: the previous `prn-bo-grp`/`prn-bo-line` compact layout is replaced by the `prn-bo-kvgrid` rows that `NestedValue` emits; CSS task (12) keeps it tidy.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/view/renderers/generic.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/bo4e/src/view/renderers/generic.tsx packages/bo4e/src/view/renderers/generic.test.tsx
git commit -m "refactor(bo4e): GenericBody renders via NestedValue with density"
```

---

## Task 9: `SmartObjectCard` + `SmartObjectView` driven by density/editable

**Files:**
- Modify: `packages/bo4e/src/view/SmartObjectCard.tsx`
- Modify: `packages/bo4e/src/view/SmartObjectView.tsx`
- Test: `packages/bo4e/src/view/SmartObjectView.test.tsx` (update existing)

- [ ] **Step 1: Update the failing test**

Replace the existing per-card "+ Alle Details"/"Bearbeiten" assertions with density-driven ones:

```tsx
// packages/bo4e/src/view/SmartObjectView.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SmartObjectView } from "./SmartObjectView";
import { loadBo4eSchema } from "../schema/load-schema";
import fields from "../__fixtures__/bo4e-fields.json";
import enums from "../__fixtures__/bo4e-enums.json";
import bos from "../__fixtures__/bo4e-bos.json";

const schema = loadBo4eSchema({ fields, enums, bos });
const obj = { boTyp: "VERTRAG", sparte: "STROM", vertragsnummer: "V-1", beschreibung: "Detail" };

describe("SmartObjectView density", () => {
  it("fachlich shows the compact card", () => {
    render(<SmartObjectView schema={schema} obj={obj} density="fachlich" editable={false} />);
    expect(screen.getByText("STROM")).toBeInTheDocument();
  });
  it("gefuellt shows full body fields", () => {
    render(<SmartObjectView schema={schema} obj={obj} density="gefuellt" editable={false} />);
    expect(screen.getByText("V-1")).toBeInTheDocument();
    expect(screen.getByText("Detail")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/view/SmartObjectView.test.tsx`
Expected: FAIL — props `density`/`editable` not accepted.

- [ ] **Step 3: Write minimal implementation**

`SmartObjectCard.tsx`:

```tsx
import { useState, type ReactNode } from "react";
import type { Bo4eObject, Density } from "../types";
import type { Bo4eSchema } from "../schema/load-schema";
import { FullDetail } from "./FullDetail";

export interface SmartObjectCardProps {
  schema: Bo4eSchema;
  boTyp: string;
  obj: Bo4eObject;
  density: Density;
  editable: boolean;
  header?: ReactNode;
  children: ReactNode; // compact body (fachlich)
}

export function SmartObjectCard({ schema, boTyp, obj, density, editable, header, children }: SmartObjectCardProps) {
  // local override: collapse a single card below the global level
  const [collapsed, setCollapsed] = useState(false);
  const showDetail = density !== "fachlich" && !collapsed;

  return (
    <div className="prn-bo-card">
      {header}
      {children}
      {density !== "fachlich" ? (
        <>
          <div className="prn-bo-detailbar">
            <button type="button" className="prn-bo-editbtn" aria-pressed={!collapsed}
              onClick={() => setCollapsed((c) => !c)}>
              {collapsed ? "Aufklappen" : "Einklappen"}
            </button>
          </div>
          {showDetail ? (
            <FullDetail schema={schema} boTyp={boTyp} obj={obj} density={density} editable={editable} />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
```

`SmartObjectView.tsx`:

```tsx
import type { Bo4eObject, Bo4eResolvers, Density } from "../types";
import type { Bo4eSchema } from "../schema/load-schema";
import { SmartObjectCard } from "./SmartObjectCard";
import { GenericBody } from "./renderers/generic";
import { MarktlokationHeader, MarktlokationBody } from "./renderers/marktlokation";
import "./bo4e.css";

export interface SmartObjectViewProps {
  schema: Bo4eSchema;
  obj: Bo4eObject;
  density: Density;
  editable: boolean;
  resolvers?: Bo4eResolvers;
  now?: Date;
}

export function SmartObjectView({ schema, obj, density, editable, resolvers, now }: SmartObjectViewProps) {
  const boTyp = obj.boTyp ?? "UNKNOWN";
  if (boTyp === "MARKTLOKATION") {
    return (
      <SmartObjectCard schema={schema} boTyp={boTyp} obj={obj} density={density} editable={editable}
        header={<MarktlokationHeader schema={schema} obj={obj} />}>
        <MarktlokationBody schema={schema} obj={obj} resolvers={resolvers} now={now} />
      </SmartObjectCard>
    );
  }
  return (
    <SmartObjectCard schema={schema} boTyp={boTyp} obj={obj} density={density} editable={editable}>
      <GenericBody schema={schema} boTyp={boTyp} obj={obj} density="fachlich" />
    </SmartObjectCard>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/view/SmartObjectView.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/bo4e/src/view/SmartObjectCard.tsx packages/bo4e/src/view/SmartObjectView.tsx packages/bo4e/src/view/SmartObjectView.test.tsx
git commit -m "refactor(bo4e): cards driven by global density/editable"
```

---

## Task 10: `FullDetail` — delegate body to NestedValue, ghosts at "alle", edit + delete

**Files:**
- Modify: `packages/bo4e/src/view/FullDetail.tsx`
- Test: `packages/bo4e/src/view/FullDetail.test.tsx` (update)

- [ ] **Step 1: Write/Update the failing test**

```tsx
// packages/bo4e/src/view/FullDetail.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FullDetail } from "./FullDetail";
import { loadBo4eSchema } from "../schema/load-schema";
import fields from "../__fixtures__/bo4e-fields.json";
import enums from "../__fixtures__/bo4e-enums.json";
import bos from "../__fixtures__/bo4e-bos.json";

const schema = loadBo4eSchema({ fields, enums, bos });

describe("FullDetail density", () => {
  it("gefuellt shows filled fields, no empty ghosts", () => {
    render(<FullDetail schema={schema} boTyp="MARKTLOKATION"
      obj={{ boTyp: "MARKTLOKATION", marktlokationsId: "55555555555" }} density="gefuellt" editable={false} />);
    expect(screen.getByText("55555555555")).toBeInTheDocument();
  });
  it("alle adds documented empty scalar ghosts", () => {
    render(<FullDetail schema={schema} boTyp="MARKTLOKATION"
      obj={{ boTyp: "MARKTLOKATION", marktlokationsId: "55555555555" }} density="alle" editable={false} />);
    // 'sparte' is a documented field absent from the object → ghost row
    expect(screen.getByText("Sparte")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/view/FullDetail.test.tsx`
Expected: FAIL — `density` prop unsupported; ghosts absent.

- [ ] **Step 3: Write minimal implementation**

```tsx
// packages/bo4e/src/view/FullDetail.tsx
import { useState } from "react";
import type { Bo4eObject, Density } from "../types";
import type { Bo4eSchema } from "../schema/load-schema";
import { resolveField } from "../schema/load-schema";
import { NestedValue } from "./NestedValue";
import { EditableValue } from "./EditableValue";
import { SchemaField } from "./SchemaField";
import { humanize } from "../core/humanize";
import { computeGhostFields } from "./useGhostFields";
import { setIn, deleteIn } from "../core/path";
import { isScalarish } from "./value-format";

export interface FullDetailProps {
  schema: Bo4eSchema;
  boTyp: string;
  obj: Bo4eObject;
  density: Density;
  editable: boolean;
}

export function FullDetail({ schema, boTyp, obj, density, editable }: FullDetailProps) {
  const [draft, setDraft] = useState<Bo4eObject>(obj);
  const source = editable ? draft : obj;
  const keys = Object.keys(source).filter((k) => k !== "boTyp");
  const ghosts = density === "alle" ? computeGhostFields(schema, boTyp, source) : [];

  if (!editable) {
    return (
      <div className="prn-bo-kvgrid">
        {keys.map((k) => (
          <NestedValue key={k} schema={schema} boTyp={boTyp} fieldKey={k} value={obj[k]}
            density={density} editable={false} path={[k]} depth={0} />
        ))}
        {ghosts.map((k) => (
          <div className="prn-bo-kv" key={`ghost-${k}`}>
            <span className="k">
              <SchemaField schema={schema} boTyp={boTyp} fieldKey={k} value={null}>
                <span>{humanize(k)}</span>
              </SchemaField>
            </span>
            <span className="v" data-null="true">—</span>
          </div>
        ))}
      </div>
    );
  }

  const set = (k: string, v: unknown) => setDraft((d) => setIn(d, [k], v));
  const del = (k: string) => setDraft((d) => deleteIn(d, [k]));

  return (
    <div className="prn-bo-kvgrid">
      {keys.map((k) => (
        <div className="prn-bo-kv" key={k}>
          <span className="k">
            <SchemaField schema={schema} boTyp={boTyp} fieldKey={k} value={draft[k]}>
              <span>{humanize(k)}</span>
            </SchemaField>
          </span>
          <span className="v">
            {isScalarish(draft[k]) ? (
              <EditableValue doc={resolveField(schema, boTyp, k)} value={draft[k]} onChange={(v) => set(k, v)} />
            ) : (
              <NestedValue schema={schema} boTyp={boTyp} fieldKey={k} value={draft[k]}
                density={density} editable path={[k]} depth={0} />
            )}
            <button type="button" className="prn-bo-delbtn" aria-label={`${humanize(k)} entfernen`}
              onClick={() => del(k)}>×</button>
          </span>
        </div>
      ))}
      {ghosts.map((k) => (
        <div className="prn-bo-kv" key={`ghost-${k}`}>
          <span className="k">
            <SchemaField schema={schema} boTyp={boTyp} fieldKey={k} value={null}>
              <span>{humanize(k)}</span>
            </SchemaField>
          </span>
          <span className="v">
            <button type="button" className="prn-bo-addbtn" onClick={() => set(k, "")}>+ anlegen</button>
          </span>
        </div>
      ))}
    </div>
  );
}
```

Note: nested editing (object/array sub-fields via `NestedValue editable`) and structure-gated component creation land in Task 11. This task keeps top-level scalar edit/delete + ghost-add working.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/view/FullDetail.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/bo4e/src/view/FullDetail.tsx packages/bo4e/src/view/FullDetail.test.tsx
git commit -m "refactor(bo4e): FullDetail density body + ghosts + scalar edit/delete"
```

---

## Task 11: structure-gated nested create (array item / component)

**Files:**
- Modify: `packages/bo4e/src/view/NestedValue.tsx`
- Test: `packages/bo4e/src/view/NestedValue.test.tsx` (extend)

- [ ] **Step 1: Write the failing test**

```tsx
// add to NestedValue.test.tsx
import { resolveFieldStructure } from "../schema/load-schema"; // ensure imported once

it("no create button for an empty array without a structure map", () => {
  render(<NestedValue {...base} fieldKey="zaehlwerke" value={[]} density="alle" editable />);
  expect(screen.queryByText(/Eintrag hinzufügen/)).not.toBeInTheDocument();
});

it("offers add for an empty array when structure map provides it", () => {
  const s = loadBo4eSchema({ fields, enums, bos,
    structure: { MARKTLOKATION: { zaehlwerke: { kind: "array", ref: "ZAEHLWERK" } } } });
  render(<NestedValue {...base} schema={s} fieldKey="zaehlwerke" value={[]} density="alle" editable />);
  expect(screen.getByText(/Eintrag hinzufügen/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/view/NestedValue.test.tsx -t "structure"`
Expected: FAIL — no add affordance / not gated.

- [ ] **Step 3: Write minimal implementation**

In `NestedValue.tsx`, extend the deep-empty branch for `density === "alle" && editable`: when the field has `resolveFieldStructure(...).kind === "array"`, render a "+ Eintrag hinzufügen" button; when `kind === "object"`, render "+ Komponente anlegen". Without a structure entry, render only the ghost row (no button). Add an `onChange?: (path: Path, value: unknown) => void` prop threaded from `FullDetail`'s draft `setIn`, so the button appends an empty `{}` / array entry. (Add `resolveFieldStructure` import.) Keep read-only/`!editable` behaviour unchanged.

```tsx
// sketch inside the isDeepEmpty branch:
// import { resolveFieldStructure } from "../schema/load-schema";
if (density === "alle" && props.editable && props.onChange) {
  const st = resolveFieldStructure(schema, boTyp, fieldKey);
  if (st?.kind === "array") {
    return (
      <div className="prn-bo-kv" key={fieldKey}>
        <span className="k">{label(schema, boTyp, fieldKey, value)}</span>
        <span className="v">
          <button type="button" className="prn-bo-addbtn"
            onClick={() => props.onChange!([...props.path], [{ boTyp: st.ref }])}>
            + Eintrag hinzufügen
          </button>
        </span>
      </div>
    );
  }
  if (st?.kind === "object") {
    return (
      <div className="prn-bo-kv" key={fieldKey}>
        <span className="k">{label(schema, boTyp, fieldKey, value)}</span>
        <span className="v">
          <button type="button" className="prn-bo-addbtn"
            onClick={() => props.onChange!([...props.path], { boTyp: st.ref })}>
            + Komponente anlegen
          </button>
        </span>
      </div>
    );
  }
  // no structure → fall through to plain ghost row (no button)
}
```

Add `onChange?: (path: Path, value: unknown) => void;` to `NestedValueProps` and thread it from `FullDetail` (root `onChange = (p, v) => setDraft((d) => setIn(d, p, v))`), passing `onChange` down through `NestedObject` and recursive `NestedValue` calls.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/view/NestedValue.test.tsx`
Expected: PASS (all).

- [ ] **Step 5: Commit**

```bash
git add packages/bo4e/src/view/NestedValue.tsx packages/bo4e/src/view/NestedValue.test.tsx
git commit -m "feat(bo4e): structure-gated nested create (array item / component)"
```

---

## Task 12: `MarktlokationBody` threads density; CSS for nested blocks

**Files:**
- Modify: `packages/bo4e/src/view/renderers/marktlokation.tsx`
- Modify: `packages/bo4e/src/view/bo4e.css`

- [ ] **Step 1: Write the failing test**

```tsx
// packages/bo4e/src/view/renderers/marktlokation.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarktlokationBody } from "./marktlokation";
import { loadBo4eSchema } from "../../schema/load-schema";
import fields from "../../__fixtures__/bo4e-fields.json";
import enums from "../../__fixtures__/bo4e-enums.json";
import bos from "../../__fixtures__/bo4e-bos.json";

const schema = loadBo4eSchema({ fields, enums, bos });

it("fachlich keeps the curated badges/endkunde view", () => {
  render(<MarktlokationBody schema={schema} density="fachlich" editable={false}
    obj={{ boTyp: "MARKTLOKATION", energierichtung: "AUSSP" }} />);
  expect(screen.getByText("Verbrauch")).toBeInTheDocument();
});

it("gefuellt additionally renders remaining nested fields", () => {
  render(<MarktlokationBody schema={schema} density="gefuellt" editable={false}
    obj={{ boTyp: "MARKTLOKATION", energierichtung: "AUSSP", marktlokationsTyp: [{ typ: "STANDARD_MARKTLOKATION" }] }} />);
  expect(screen.getByText("STANDARD_MARKTLOKATION")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/view/renderers/marktlokation.test.tsx`
Expected: FAIL — `density`/`editable` props unsupported.

- [ ] **Step 3: Write minimal implementation**

Add `density: Density; editable: boolean;` to `MarktlokationBody`'s props. Keep the curated badges/endkunde/marktrollen block exactly as today (it is the constant "fachlich" header content across all levels). When `density !== "fachlich"`, append a recursive section for every remaining key not already shown by the curated view:

```tsx
// at the end of the MarktlokationBody return, before </>:
{density !== "fachlich" ? (
  <div className="prn-bo-grp">
    {Object.keys(obj)
      .filter((k) => !["boTyp", "energierichtung", "bilanzierungsmethode", "netzebene",
        "sperrstatus", "endkunde", "marktrollen", "sparte", "marktlokationsId"].includes(k))
      .map((k) => (
        <NestedValue key={k} schema={schema} boTyp="MARKTLOKATION" fieldKey={k} value={obj[k]}
          density={density} editable={editable} path={[k]} depth={0} />
      ))}
  </div>
) : null}
```

Import `NestedValue` and `Density`. (This keeps the bespoke MALO header curated and adds the generic recursive tail for higher densities.)

CSS — append to `bo4e.css`:

```css
/* nested object/array blocks: full-width, escape the .v nowrap/ellipsis cell */
.prn-bo-nested { grid-column: 1 / -1; margin: 6px 0 2px; }
.prn-bo-nested .prn-bo-kvgrid { margin-top: 6px; padding-top: 6px; }
.prn-bo-nestedmore { grid-column: 1 / -1; color: var(--prn-label-3); font: var(--prn-text-footnote); padding: 4px 0; }
.prn-bo-addbtn, .prn-bo-delbtn { background: none; border: none; color: var(--prn-accent-strong); cursor: pointer; font: var(--prn-text-footnote); padding: 0 2px; }
.prn-bo-delbtn { color: var(--prn-label-3); margin-left: 6px; }
.prn-bo-editbtn { background: none; border: none; color: var(--prn-accent-strong); font: var(--prn-text-footnote); cursor: pointer; }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/view/renderers/marktlokation.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/bo4e/src/view/renderers/marktlokation.tsx packages/bo4e/src/view/renderers/marktlokation.test.tsx packages/bo4e/src/view/bo4e.css
git commit -m "feat(bo4e): MALO body threads density; nested-block CSS"
```

---

## Task 13: `CDocView` — lifted state, SegmentedControl + Bearbeiten switch, id seeding

**Files:**
- Modify: `packages/bo4e/src/CDocView.tsx`
- Test: `packages/bo4e/src/CDocView.test.tsx` (update)

- [ ] **Step 1: Write/Update the failing test**

```tsx
// packages/bo4e/src/CDocView.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CDocView } from "./CDocView";
import { loadBo4eSchema } from "./schema/load-schema";
import fields from "./__fixtures__/bo4e-fields.json";
import enums from "./__fixtures__/bo4e-enums.json";
import bos from "./__fixtures__/bo4e-bos.json";

const schema = loadBo4eSchema({ fields, enums, bos });
const doc = [{ boTyp: "VERTRAG", sparte: "STROM", beschreibung: "Detail" }];

describe("CDocView density controls", () => {
  it("defaults to fachlich and renders a density control", () => {
    render(<CDocView doc={doc} schema={schema} />);
    expect(screen.getByRole("button", { name: "Fachlich" })).toBeInTheDocument();
  });
  it("Bearbeiten switch is disabled at fachlich", () => {
    render(<CDocView doc={doc} schema={schema} />);
    expect(screen.getByRole("switch", { name: /Bearbeiten/ })).toBeDisabled();
  });
  it("switching to Gefüllt reveals hidden fields and enables Bearbeiten", async () => {
    render(<CDocView doc={doc} schema={schema} />);
    await userEvent.click(screen.getByRole("button", { name: "Gefüllt" }));
    expect(screen.getByText("Detail")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /Bearbeiten/ })).toBeEnabled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/CDocView.test.tsx`
Expected: FAIL — no density control / switch.

- [ ] **Step 3: Write minimal implementation**

Add lifted state and controls to `CDocView`. Key changes:

```tsx
import { useMemo, useState } from "react";
import { SegmentedControl, Segment, Switch } from "@conuti-das/prince-ui";
import type { Bo4eResolvers, Density } from "./types";
// ...existing imports...
import { seedTree } from "./core/array-ids";

const DENSITIES: { id: Density; label: string }[] = [
  { id: "fachlich", label: "Fachlich" },
  { id: "gefuellt", label: "Gefüllt" },
  { id: "alle", label: "Alle Felder" },
];

export interface CDocViewProps {
  doc: CDocInput;
  schema: Bo4eSchema;
  resolvers?: Bo4eResolvers;
  now?: Date;
  defaultDensity?: Density;
}

export function CDocView({ doc, schema, resolvers, now, defaultDensity = "fachlich" }: CDocViewProps) {
  const cdoc = normalizeToCDoc(doc);
  useMemo(() => seedTree(cdoc), [cdoc]); // one full-tree id seed before any pruning
  const directions = Object.keys(cdoc.content);
  const [dir, setDir] = useState<string>(() => (directions.includes("OUTBOUND") ? "OUTBOUND" : (directions[0] ?? "")));
  const [tab, setTab] = useState<string | null>(null);
  const [density, setDensity] = useState<Density>(defaultDensity);
  const [editMode, setEditMode] = useState(false);
  // ...existing dd/anomalies/tabs/active logic unchanged...
```

Render the controls above the object tabs:

```tsx
<div className="prn-bo-controls">
  <SegmentedControl
    aria-label="Detailgrad"
    selectedKeys={new Set([density])}
    onSelectionChange={(keys) => {
      const next = [...(keys as Set<string>)][0] as Density;
      if (next) setDensity(next);
    }}
  >
    {DENSITIES.map((d) => <Segment key={d.id} id={d.id}>{d.label}</Segment>)}
  </SegmentedControl>
  <Switch
    isSelected={editMode}
    isDisabled={density === "fachlich"}
    onChange={setEditMode}
  >
    Bearbeiten
  </Switch>
</div>
```

Thread into the card render:

```tsx
return list.map((obj, i) => (
  <SmartObjectView key={i} schema={schema} obj={obj}
    density={density} editable={editMode && density !== "fachlich"}
    resolvers={resolvers} now={now} />
));
```

Reset on direction/tab switch — in the direction `onClick` and tab `onClick`, after `setTab(null)` also reset edit:

```tsx
onClick={() => { setDir(d); setTab(null); setEditMode(false); }}
// and the object-tab buttons:
onClick={() => { setTab(t); setEditMode(false); }}
```

Note: `editMode` is masked (forced inactive via `density === "fachlich"` in the `editable` prop) rather than reset when dropping to Fachlich — its value persists, so bouncing back to Gefüllt restores it. Only direction/tab switches reset it.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/CDocView.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/bo4e/src/CDocView.tsx packages/bo4e/src/CDocView.test.tsx
git commit -m "feat(bo4e): global density SegmentedControl + Bearbeiten switch"
```

---

## Task 14: exports, CSS for controls, full suite green

**Files:**
- Modify: `packages/bo4e/src/index.ts`
- Modify: `packages/bo4e/src/view/bo4e.css`

- [ ] **Step 1: Add exports + control CSS**

In `index.ts` add:

```ts
export * from "./view/NestedValue";
export * from "./view/useGhostFields";
export * from "./core/empty";
export * from "./core/path";
export * from "./core/array-ids";
```

In `bo4e.css` append:

```css
.prn-bo-controls { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }
```

- [ ] **Step 2: Run the full package suite**

Run: `pnpm --filter @conuti-das/prince-ui-bo4e test`
Expected: PASS — all bo4e tests green (new + migrated).

- [ ] **Step 3: Typecheck + build**

Run: `pnpm --filter @conuti-das/prince-ui-bo4e build` (or `pnpm -w typecheck` if defined)
Expected: no TS errors.

- [ ] **Step 4: Commit**

```bash
git add packages/bo4e/src/index.ts packages/bo4e/src/view/bo4e.css
git commit -m "chore(bo4e): export progressive-detail API + control styles"
```

---

## Task 15: docs demo + browser verification

**Files:**
- Modify: `apps/docs/src/heavy/Bo4eCDocViewDemo.tsx` (only if a `defaultDensity` showcase is wanted — `CDocView` already works unchanged)

- [ ] **Step 1: Run the docs app**

Run: `pnpm --filter @conuti-das/prince-ui-docs dev` (background), open the printed local URL.

- [ ] **Step 2: Navigate to the BO4E cDoc view page** (heavy editor `bo4e`).

- [ ] **Step 3: Verify by interaction (browser MCP / screenshot)**
  - Default = **Fachlich** compact cards.
  - Click **Gefüllt** → nested objects (`partneradresse`) and object-arrays (`marktrollen`, `marktlokationsTyp`) appear; no wall of "—".
  - Click **Alle Felder** → documented empty scalar ghosts appear.
  - Toggle **Bearbeiten** (enabled only ≥ Gefüllt) → scalars become inputs; ghost "+ anlegen"; array/component create only where a structure map exists.
  - Switch direction/object tab → edit resets.

- [ ] **Step 4: Capture screenshots** of each density level for the record.

- [ ] **Step 5: Commit any demo tweak**

```bash
git add apps/docs/src/heavy/Bo4eCDocViewDemo.tsx
git commit -m "docs(bo4e): showcase progressive-detail densities"
```

---

## Self-Review Notes

- **Spec coverage:** density axis (Tasks 9,10,13), edit axis (Tasks 10,11,13), NestedValue dispatch incl. deep-empty-first/prune/ghost (Task 6), MAX_DEPTH=5 + deepest-filled guarantee (Task 7), ghost from field-dict (Task 5), structure-gated create + dropped free-form (Task 11), single path-keyed draft + setIn/deleteIn (Tasks 2,10,11), stable array ids seeded once over full tree (Tasks 3,13), boTyp context switch (Task 6), MALO custom renderer threading (Task 12), reset only on tab/direction (Task 13), falsy trap (Task 1).
- **Type consistency:** `Density = "fachlich"|"gefuellt"|"alle"`, `editable: boolean`, `NestedValueProps`, `computeGhostFields`, `resolveFieldStructure`, `setIn/deleteIn`, `itemId/seedTree` used consistently across tasks.
- **Known follow-up (not in scope):** lazy-render of collapsed Disclosure children for perf is left to React-Aria's default panel mounting; revisit if the OUTBOUND MALO feels heavy.
