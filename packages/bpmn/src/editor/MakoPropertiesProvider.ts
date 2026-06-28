/**
 * MaKo-Property-Panel-Anpassung.
 *
 * Ordnet die von den Standard-Providern (Bpmn + CamundaPlatform) gelieferten
 * Property-Gruppen in zwei Zonen:
 *   - Haupt-Zone (oben, offen): die fachlich wichtigen Gruppen.
 *   - Erweitert-Zone (unten, eingeklappt): alles Übrige.
 *
 * Es werden KEINE Gruppen entfernt → Round-Trip bleibt verlustfrei
 * (öffnen → speichern erzeugt kein Diff durch fehlende Gruppen).
 *
 * Group-IDs entstammen bpmn-js-properties-panel (Camunda Platform 7).
 */

export interface PanelGroup {
  id: string;
  label?: string;
  shouldOpen?: boolean;
  [k: string]: unknown;
}

/** Haupt-Zone (offen), in dieser Reihenfolge. Alles andere → Erweitert. */
export const MAIN_GROUPS = [
  "general", // Name, ID
  "CamundaPlatform__Implementation", // ServiceTask: Type=external / Topic
  "CamundaPlatform__Input", // Input-Mapping
  "CamundaPlatform__Output", // Output-Mapping
];

/** Bevorzugte Reihenfolge innerhalb der Erweitert-Zone (Rest folgt unsortiert). */
const ADVANCED_ORDER = [
  "CamundaPlatform__ExternalTask",
  "CamundaPlatform__AsynchronousContinuations",
  "CamundaPlatform__ExtensionProperties",
  "documentation",
];

function rank(id: string, order: string[]): number {
  const i = order.indexOf(id);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}

/**
 * Sortiert Gruppen in Haupt- vor Erweitert-Zone und klappt die Erweitert-Zone
 * per `shouldOpen = false` ein. Reine Umordnung, keine Entfernung.
 */
export function reorderGroups(groups: PanelGroup[]): PanelGroup[] {
  const main = groups.filter((g) => MAIN_GROUPS.includes(g.id));
  const advanced = groups.filter((g) => !MAIN_GROUPS.includes(g.id));
  main.sort((a, b) => rank(a.id, MAIN_GROUPS) - rank(b.id, MAIN_GROUPS));
  advanced.sort((a, b) => rank(a.id, ADVANCED_ORDER) - rank(b.id, ADVANCED_ORDER));
  // Haupt-Zone offen (wichtige Felder sofort sichtbar), Erweitert eingeklappt.
  for (const g of main) g.shouldOpen = true;
  for (const g of advanced) g.shouldOpen = false;
  return [...main, ...advanced];
}

interface PropertiesPanel {
  registerProvider(priority: number, provider: unknown): void;
}

// Niedrige Priorität → läuft NACH den Standard-Providern (Middleware über das
// finale Gruppen-Set). bio-properties-panel ruft Provider absteigend nach
// Priorität; ein kleiner Wert kommt zuletzt dran.
const LOW_PRIORITY = 100;

export default function MakoPropertiesProvider(
  this: { getGroups: (element: unknown) => (groups: PanelGroup[]) => PanelGroup[] },
  propertiesPanel: PropertiesPanel,
): void {
  this.getGroups = function () {
    return function (groups: PanelGroup[]) {
      return reorderGroups(groups);
    };
  };
  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

(MakoPropertiesProvider as unknown as { $inject: string[] }).$inject = [
  "propertiesPanel",
];
