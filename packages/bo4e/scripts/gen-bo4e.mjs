#!/usr/bin/env node
/**
 * Generate BO4E side-data from the official BO4E JSON schemas:
 *   - bo4e-structure.json        field → { kind, ref }   (gates nested create)
 *   - bo4e-fields-generated.json  per-type field docs     (sub-field popovers)
 *   - bo4e-enums-generated.json   enum → { values }        (enum sub-field Selects)
 *
 * These are MERGED UNDER the hand-curated fixtures at load time (curated wins),
 * so created components (e.g. a new ZEITRAUM) resolve their sub-fields' labels,
 * descriptions, examples and enum dropdowns instead of falling back to humanize.
 *
 * Classification by $ref directory: enum/ → scalar, com//bo/ → object/array.
 *
 * Usage:
 *   node scripts/gen-bo4e.mjs <schemas/v1 dir> [outDir1] [outDir2 ...]
 * Writes the three files into each outDir (defaults to this package's __fixtures__).
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(process.argv[2] ?? ".");
const outDirs = process.argv.slice(3);
if (outDirs.length === 0) outDirs.push(resolve(here, "../src/__fixtures__"));

function humanize(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function refInfo(ref) {
  const m = /\/(bo|com|enum)\/([A-Za-z0-9]+)\.schema\.json$/.exec(ref);
  return m ? { dir: m[1], name: m[2] } : null;
}

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

function classify(spec) {
  if (typeIncludes(spec, "array") && spec.items) {
    const r = findRef(spec.items);
    if (r && r.dir !== "enum") return { kind: "array", ref: r.name.toUpperCase() };
    return { kind: "scalar" };
  }
  const r = findRef(spec);
  if (r && r.dir !== "enum") return { kind: "object", ref: r.name.toUpperCase() };
  return { kind: "scalar" };
}

/** Field doc entry from a property spec (enumRef / description / example / pattern). */
function fieldEntry(key, spec) {
  const entry = {};
  const inner = typeIncludes(spec, "array") && spec.items ? spec.items : spec;
  const ref = findRef(inner);
  if (ref && ref.dir === "enum") entry.enumRef = ref.name.toUpperCase();
  const desc = spec.description ?? inner.description;
  if (desc && desc.toLowerCase() !== key.toLowerCase()) entry.description = desc;
  let ex;
  if (Array.isArray(spec.examples) && spec.examples.length) ex = spec.examples[0];
  else if (spec.example != null) ex = spec.example;
  else if (inner.example != null) ex = inner.example;
  if (ex != null && typeof ex !== "object" && typeof ex !== "boolean") entry.example = String(ex);
  const pat = spec.pattern ?? inner.pattern;
  if (pat) entry.pattern = pat;
  return entry;
}

const structure = {};
const fields = {};
for (const subdir of ["bo", "com"]) {
  const dir = join(root, subdir);
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".schema.json")) continue;
    const name = file.replace(".schema.json", "").toUpperCase();
    const schema = JSON.parse(readFileSync(join(dir, file), "utf8"));
    const props = schema.properties ?? {};
    const sFields = {};
    const dFields = {};
    for (const [key, spec] of Object.entries(props)) {
      if (key === "boTyp") continue;
      const c = classify(spec);
      if (c.kind !== "scalar") sFields[key] = c;
      // Always include the key so the full field set is known for ghost fields;
      // the entry carries whatever doc bits exist (enumRef/description/example).
      dFields[key] = fieldEntry(key, spec);
    }
    if (Object.keys(sFields).length) structure[name] = sFields;
    if (Object.keys(dFields).length) fields[name] = dFields;
  }
}

const enums = {};
const enumDir = join(root, "enum");
for (const file of readdirSync(enumDir)) {
  if (!file.endsWith(".schema.json")) continue;
  const name = file.replace(".schema.json", "").toUpperCase();
  const schema = JSON.parse(readFileSync(join(enumDir, file), "utf8"));
  const values = Array.isArray(schema.enum) ? schema.enum : [];
  if (!values.length) continue;
  const entry = { values: values.map((v) => ({ value: String(v) })) };
  if (schema.description && schema.description !== schema.title) entry.description = schema.description;
  enums[name] = entry;
}

const outputs = {
  "bo4e-structure.json": structure,
  "bo4e-fields-generated.json": fields,
  "bo4e-enums-generated.json": enums,
};
for (const outDir of outDirs) {
  for (const [file, data] of Object.entries(outputs)) {
    writeFileSync(join(outDir, file), JSON.stringify(data, null, 2) + "\n");
  }
}
const counts = `structure:${Object.keys(structure).length} fields:${Object.keys(fields).length} enums:${Object.keys(enums).length}`;
console.error(`gen-bo4e: ${counts} → ${outDirs.join(", ")}`);
