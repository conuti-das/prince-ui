import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SegmentedControl, Segment, Tabs, TabBar, Tab, TabPanel } from "./navigation";

describe("navigation primitives", () => {
  it("SegmentedControl selects a segment (single selection)", async () => {
    const onSelectionChange = vi.fn();
    render(
      <SegmentedControl onSelectionChange={onSelectionChange}>
        <Segment id="1h">1h</Segment>
        <Segment id="24h">24h</Segment>
        <Segment id="7d">7 Tage</Segment>
      </SegmentedControl>,
    );
    await userEvent.click(screen.getByRole("radio", { name: "24h" }));
    expect(onSelectionChange).toHaveBeenCalled();
    const arg = onSelectionChange.mock.calls[0]![0] as Set<string>;
    expect(Array.from(arg)).toEqual(["24h"]);
  });

  it("Tabs switches the visible panel on tab click", async () => {
    render(
      <Tabs>
        <TabBar>
          <Tab id="data">Daten</Tab>
          <Tab id="logs">Logs</Tab>
        </TabBar>
        <TabPanel id="data">Transaktionsdaten</TabPanel>
        <TabPanel id="logs">System-Logs</TabPanel>
      </Tabs>,
    );
    // Erster Tab ist initial aktiv.
    expect(screen.getByText("Transaktionsdaten")).toBeInTheDocument();
    expect(screen.queryByText("System-Logs")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: "Logs" }));
    expect(screen.getByText("System-Logs")).toBeInTheDocument();
    expect(screen.queryByText("Transaktionsdaten")).not.toBeInTheDocument();
  });
  it("TabBar rollt waagrecht bei Überlauf, Reiter umbrechen nicht (CSS)", () => {
    const css = readFileSync(resolve(process.cwd(), "src/primitives/navigation.css"), "utf8");
    const liste = /\.prn-tablist\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(liste).toMatch(/overflow-x:\s*auto/);
    expect(liste).not.toMatch(/border-bottom/);
    const tab = /\.prn-tab\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(tab).toMatch(/white-space:\s*nowrap/);
    expect(tab).not.toMatch(/margin-bottom:\s*-1px/);
  });

  describe("TabBar overflow", () => {
    /** jsdom kennt keine Maße: Leiste 200 px breit, Inhalt 500 px; Reiter i liegt bei i·120 px und ist 110 px breit */
    function vermessen(liste: HTMLElement) {
      let links = 0;
      Object.defineProperty(liste, "clientWidth", { configurable: true, get: () => 200 });
      Object.defineProperty(liste, "scrollWidth", { configurable: true, get: () => 500 });
      Object.defineProperty(liste, "scrollLeft", { configurable: true, get: () => links, set: (v: number) => { links = v; } });
      liste.getBoundingClientRect = () => ({ left: 0, right: 200, width: 200, top: 0, bottom: 40, height: 40, x: 0, y: 0, toJSON: () => ({}) });
      screen.getAllByRole("tab").forEach((tab, i) => {
        tab.getBoundingClientRect = () => {
          const l = i * 120 - links;
          return { left: l, right: l + 110, width: 110, top: 0, bottom: 40, height: 40, x: l, y: 0, toJSON: () => ({}) };
        };
      });
    }
    const Leiste = () => (
      <Tabs>
        <TabBar aria-label="Gruppen">
          <Tab id="alle">Alle</Tab>
          <Tab id="entscheiden">Zu entscheiden</Tab>
          <Tab id="bearbeiten">Zu bearbeiten</Tab>
          <Tab id="einreichungen">Ihre Einreichungen</Tab>
        </TabBar>
      </Tabs>
    );

    it("marks the edge that hides tabs (data-overflow end, both, start)", () => {
      render(<Leiste />);
      const liste = screen.getByRole("tablist");
      vermessen(liste);
      fireEvent.scroll(liste);
      expect(liste).toHaveAttribute("data-overflow", "end");
      liste.scrollLeft = 120;
      fireEvent.scroll(liste);
      expect(liste).toHaveAttribute("data-overflow", "both");
      liste.scrollLeft = 300;
      fireEvent.scroll(liste);
      expect(liste).toHaveAttribute("data-overflow", "start");
    });

    it("scrolls the selected tab into view, also when it changes", async () => {
      render(<Leiste />);
      const liste = screen.getByRole("tablist");
      vermessen(liste);
      await userEvent.click(screen.getByRole("tab", { name: "Ihre Einreichungen" }));
      // Reiter 4 endet bei 470 px; 24 px Rand für den Verlauf → 470 + 24 − 200
      await waitFor(() => expect(liste.scrollLeft).toBe(294));
      await userEvent.click(screen.getByRole("tab", { name: "Alle" }));
      await waitFor(() => expect(liste.scrollLeft).toBe(0));
    });

    it("has the fade rules for each overflow state", () => {
      const css = readFileSync(resolve(process.cwd(), "src/primitives/navigation.css"), "utf8");
      for (const u of ["start", "end", "both"]) expect(css).toMatch(new RegExp(`\\.prn-tablist\\[data-overflow="${u}"\\]\\s*\\{[^}]*mask-image`));
    });
  });
});
