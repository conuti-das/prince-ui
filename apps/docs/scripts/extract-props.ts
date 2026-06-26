import { withCustomConfig } from "react-docgen-typescript";
import { writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../..");

// node:fs/globSync gibt es erst ab Node 22; CI/Deploy laufen auf Node 20.
// readdirSync({ recursive }) (ab Node 20.1) + Endungs-Filter ist portabel.
function listFiles(dir: string, exts: string[]): string[] {
  let rels: string[];
  try {
    rels = readdirSync(dir, { recursive: true }) as unknown as string[];
  } catch {
    return [];
  }
  return rels.map((rel) => join(dir, rel)).filter((f) => exts.some((e) => f.endsWith(e)));
}

const parser = withCustomConfig(resolve(root, "tsconfig.base.json"), {
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
});

// Alle exportierten Komponenten der Pakete scannen.
const files = [
  ...listFiles(resolve(root, "packages/ui/src"), [".ts", ".tsx"]),
  ...["bpmn", "dmn", "forms", "bo4e"].flatMap((p) =>
    listFiles(resolve(root, `packages/${p}/src`), [".ts", ".tsx"]),
  ),
].filter((f) => !f.endsWith(".test.ts") && !f.endsWith(".test.tsx"));

const out: Record<string, { props: { name: string; type: string; required: boolean; defaultValue: string | null; description: string }[] }> = {};
for (const file of files) {
  for (const c of parser.parse(file)) {
    out[c.displayName] = {
      props: Object.values(c.props).map((p) => ({
        name: p.name,
        type: p.type.name,
        required: p.required,
        defaultValue: p.defaultValue?.value ?? null,
        description: p.description,
      })),
    };
  }
}

mkdirSync(resolve(here, "../public"), { recursive: true });
writeFileSync(resolve(here, "../public/props.json"), JSON.stringify(out, null, 2));
console.log(`extract-props: ${Object.keys(out).length} Komponenten → public/props.json`);
