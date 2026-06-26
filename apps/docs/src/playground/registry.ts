import type { ComponentType } from "react";
import * as ui from "@conuti-das/prince-ui";

// Registry für Live-Render im Playground. Heavy-Pakete werden in deren Seiten
// per lazy-Import ergänzt (Phase 5), Core kommt direkt aus prince-ui.
export const registry: Record<string, ComponentType<Record<string, unknown>>> =
  ui as unknown as Record<string, ComponentType<Record<string, unknown>>>;

export function resolveComponent(name: string): ComponentType<Record<string, unknown>> {
  const C = registry[name];
  if (!C) throw new Error(`Playground: Komponente "${name}" nicht in der Registry`);
  return C;
}
