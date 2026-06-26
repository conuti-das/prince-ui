#!/usr/bin/env node
/**
 * Generate the Bo4eStructure map from the official BO4E JSON schemas.
 *
 * The viewer's field-dict (bo4e-fields.json) carries no type/$ref/items info, so
 * nested-component creation needs this side-map: field → { kind, ref }.
 * Classification by $ref directory:
 *   enum/  → scalar (enum value, edited inline)
 *   com/   → object/array component (creatable nested structure)
 *   bo/    → object/array component
 *
 * Usage:
 *   node scripts/gen-structure.mjs <schemas/v1 dir> > src/__fixtures__/bo4e-structure.json
 *
 * Keys are UPPERCASE of the schema name (Marktlokation → MARKTLOKATION) to match
 * the boTyp values the viewer uses.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");

/** Extract the referenced schema name + its directory from a $ref string. */
function refInfo(ref) {
  // e.g. "../enum/Energierichtung.schema.json"
  const m = /\/(bo|com|enum)\/([A-Za-z0-9]+)\.schema\.json$/.exec(ref);
  if (!m) return null;
  return { dir: m[1], name: m[2] };
}

/** Walk allOf/anyOf/oneOf/$ref to find the first concrete ref. */
function findRef(spec) {
  if (!spec || typeof spec !== "object") return null;
  if (typeof spec.$ref === "string") {
    const info = refInfo(spec.$ref);
    if (info) return info;
  }
  for (const key of ["allOf", "anyOf", "oneOf"]) {
    if (Array.isArray(spec[key])) {
      for (const sub of spec[key]) {
        const r = findRef(sub);
        if (r) return r;
      }
    }
  }
  return null;
}

function typeIncludes(spec, t) {
  return spec?.type === t || (Array.isArray(spec?.type) && spec.type.includes(t));
}

/** Derive { kind, ref } for a property spec. */
function classify(spec) {
  // array of refs → array component (ref = item target, if bo/com)
  if (typeIncludes(spec, "array") && spec.items) {
    const r = findRef(spec.items);
    if (r && r.dir !== "enum") return { kind: "array", ref: r.name.toUpperCase() };
    return { kind: "scalar" }; // array of scalars/enums → edited as scalar list
  }
  const r = findRef(spec);
  if (r && r.dir !== "enum") return { kind: "object", ref: r.name.toUpperCase() };
  return { kind: "scalar" };
}

const structure = {};
for (const subdir of ["bo", "com"]) {
  const dir = join(root, subdir);
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".schema.json")) continue;
    const name = file.replace(".schema.json", "").toUpperCase();
    const schema = JSON.parse(readFileSync(join(dir, file), "utf8"));
    const props = schema.properties ?? {};
    const fields = {};
    for (const [key, spec] of Object.entries(props)) {
      if (key === "boTyp") continue;
      const c = classify(spec);
      // Only structural (object/array) fields carry value — scalars are implicit.
      if (c.kind !== "scalar") fields[key] = c;
    }
    if (Object.keys(fields).length) structure[name] = fields;
  }
}

process.stdout.write(JSON.stringify(structure, null, 2) + "\n");
