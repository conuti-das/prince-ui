// Reine Navigations-Ableitung — KEIN Vite-`import.meta.glob`, damit dieses Modul
// auch in Node-Kontexten (Playwright-Tests) ohne Vite-Transform importierbar ist.
export type NavGroup = { title: string; items: { path: string; title: string }[] };

const GROUP_LABEL: Record<string, string> = { components: "Components", foundations: "Foundations" };
// Feste Gruppen-Reihenfolge laut Design-Spec (§3): Overview · Foundations · Components.
const GROUP_ORDER = ["overview", "foundations", "components"];

export function buildNav(modules: Record<string, unknown>): NavGroup[] {
  const groups = new Map<string, NavGroup>();
  // Overview-Gruppe: Einstieg (Landingpage) immer zuerst.
  if (Object.keys(modules).some((f) => /\/content\/index\.mdx$/.test(f))) {
    groups.set("overview", { title: "Overview", items: [{ path: "/", title: "Einführung" }] });
  }
  for (const file of Object.keys(modules)) {
    const m = file.match(/\/content\/(components|foundations)\/(.+)\.mdx$/);
    if (!m) continue;
    const dir = m[1]!;
    const name = m[2]!;
    const path = `/${dir}/${name.toLowerCase()}`;
    const group = groups.get(dir) ?? { title: GROUP_LABEL[dir]!, items: [] };
    group.items.push({ path, title: name });
    groups.set(dir, group);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b))
    .map(([, g]) => ({ ...g, items: g.items.sort((a, b) => a.title.localeCompare(b.title)) }));
}
