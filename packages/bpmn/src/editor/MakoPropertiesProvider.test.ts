import { describe, it, expect } from "vitest";
import { reorderGroups, MAIN_GROUPS, type PanelGroup } from "./MakoPropertiesProvider";

describe("reorderGroups", () => {
  it("stellt Haupt-Gruppen vor Erweitert und klappt Erweitert ein", () => {
    const groups: PanelGroup[] = [
      { id: "documentation", label: "Documentation" },
      { id: "CamundaPlatform__AsynchronousContinuations", label: "Async" },
      { id: "general", label: "General" },
      { id: "CamundaPlatform__Implementation", label: "Implementation" },
      { id: "CamundaPlatform__Input", label: "Input" },
    ];
    const out = reorderGroups(groups);
    const ids = out.map((g) => g.id);

    // general steht vor documentation (Haupt vor Erweitert)
    expect(ids.indexOf("general")).toBeLessThan(ids.indexOf("documentation"));
    // Implementation (Haupt) vor Async (Erweitert)
    expect(ids.indexOf("CamundaPlatform__Implementation")).toBeLessThan(
      ids.indexOf("CamundaPlatform__AsynchronousContinuations"),
    );

    // Erweitert-Gruppen sind eingeklappt
    const async = out.find((g) => g.id === "CamundaPlatform__AsynchronousContinuations");
    expect(async?.shouldOpen).toBe(false);

    // Haupt-Gruppen bleiben offen (kein shouldOpen=false erzwungen)
    const general = out.find((g) => g.id === "general");
    expect(general?.shouldOpen).not.toBe(false);

    // Keine Gruppe geht verloren
    expect(out).toHaveLength(groups.length);
  });

  it("hält die MAIN_GROUPS-Reihenfolge ein", () => {
    const shuffled: PanelGroup[] = [
      { id: "CamundaPlatform__Output" },
      { id: "CamundaPlatform__Input" },
      { id: "CamundaPlatform__Implementation" },
      { id: "general" },
    ];
    const ids = reorderGroups(shuffled).map((g) => g.id);
    expect(ids).toEqual(MAIN_GROUPS.slice());
  });

  it("schiebt unbekannte Gruppen in die Erweitert-Zone (eingeklappt)", () => {
    const groups: PanelGroup[] = [
      { id: "CamundaPlatform__SomethingNew" },
      { id: "general" },
    ];
    const out = reorderGroups(groups);
    expect(out[0]?.id).toBe("general");
    expect(out[1]?.id).toBe("CamundaPlatform__SomethingNew");
    expect(out[1]?.shouldOpen).toBe(false);
  });
});
