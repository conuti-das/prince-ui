import type { RouteObject } from "react-router-dom";
import { buildNav } from "./nav";

export { buildNav } from "./nav";
export type { NavGroup } from "./nav";

const eager = import.meta.glob("../content/**/*.mdx", { eager: true }) as Record<string, { default: React.ComponentType }>;
export const navTree = buildNav(eager);
export const routeObjects: RouteObject[] = Object.entries(eager).map(([file, mod]) => {
  const m = file.match(/\/content\/(.+)\.mdx$/)!;
  const rel = m[1]!;
  const slug = rel === "index" ? "/" : `/${rel.toLowerCase()}`;
  const Comp = mod.default;
  return { path: slug, element: <Comp /> };
});
