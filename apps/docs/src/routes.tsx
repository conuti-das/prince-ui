import type { RouteObject } from "react-router-dom";

type NavGroup = { title: string; items: { path: string; title: string }[] };
const GROUP_LABEL: Record<string, string> = { components: "Components", foundations: "Foundations" };

export function buildNav(modules: Record<string, unknown>): NavGroup[] {
  const groups = new Map<string, NavGroup>();
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
  return [...groups.values()].map((g) => ({ ...g, items: g.items.sort((a, b) => a.title.localeCompare(b.title)) }));
}

const eager = import.meta.glob("../content/**/*.mdx", { eager: true }) as Record<string, { default: React.ComponentType }>;
export const navTree = buildNav(eager);
export const routeObjects: RouteObject[] = Object.entries(eager).map(([file, mod]) => {
  const m = file.match(/\/content\/(.+)\.mdx$/)!;
  const rel = m[1]!;
  const slug = rel === "index" ? "/" : `/${rel.toLowerCase()}`;
  const Comp = mod.default;
  return { path: slug, element: <Comp /> };
});
