import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
});