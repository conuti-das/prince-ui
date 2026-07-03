import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Timeline, type TimelineEvent, type TimelinePartner } from "./timeline";

const partners: TimelinePartner[] = [
  { id: "msb", name: "Stadtwerke Messservice", role: "MSB", code: "99001", color: "var(--prn-chart-4)" },
];

const events: TimelineEvent[] = [
  {
    id: "a",
    ts: "2026-06-30T08:13:00",
    title: "Automatische Validierung",
    status: "success",
    category: "system",
    actor: { name: "Import Bot", initials: "IB" },
    attrs: [{ label: "Regeln", value: "142 / 142 ok" }],
  },
  {
    id: "b",
    ts: "2026-06-30T09:05:00",
    title: "Nachricht an Marktpartner",
    status: "info",
    partnerId: "msb",
    dir: "out",
  },
  {
    id: "c",
    ts: "2026-07-01T08:02:00",
    endTs: "2026-07-01T08:05:00",
    title: "Re-Validierung",
    status: "error",
  },
];

describe("Timeline", () => {
  it("renders all event titles", () => {
    render(<Timeline events={events} />);
    expect(screen.getByText("Automatische Validierung")).toBeInTheDocument();
    expect(screen.getByText("Nachricht an Marktpartner")).toBeInTheDocument();
    expect(screen.getByText("Re-Validierung")).toBeInTheDocument();
  });

  it("groups by day with a header per calendar day", () => {
    render(<Timeline events={events} groupBy="day" />);
    expect(screen.getByText(/30\. Juni/)).toBeInTheDocument();
    expect(screen.getByText(/1\. Juli/)).toBeInTheDocument();
  });

  it("groups by partner and shows partner header (name, role, code)", () => {
    render(<Timeline events={events} partners={partners} groupBy="partner" />);
    expect(screen.getByText("Stadtwerke Messservice")).toBeInTheDocument();
    expect(screen.getByText("MSB")).toBeInTheDocument();
    expect(screen.getByText("99001")).toBeInTheDocument();
    // Events ohne bekannten Partner landen im Fallback
    expect(screen.getByText("Ohne Partner")).toBeInTheDocument();
  });

  it("toggles a row via its trigger (aria-expanded) and reveals attributes", async () => {
    const user = userEvent.setup();
    render(<Timeline events={events} />);
    const trigger = screen.getByRole("button", { name: /Automatische Validierung/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Regeln")).toBeInTheDocument();
    expect(screen.getByText("142 / 142 ok")).toBeInTheDocument();
  });

  it("respects controlled expandedIds", () => {
    render(<Timeline events={events} expandedIds={["a"]} />);
    const trigger = screen.getByRole("button", { name: /Automatische Validierung/ });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("calls onSelectEvent with the event id when a row is pressed", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Timeline events={events} onSelectEvent={onSelect} />);
    await user.click(screen.getByRole("button", { name: /Nachricht an Marktpartner/ }));
    expect(onSelect).toHaveBeenCalledWith("b");
  });

  it("shows a direction indicator with an accessible label", () => {
    render(<Timeline events={events} />);
    expect(screen.getByLabelText("ausgehend")).toBeInTheDocument();
  });

  it("shows a duration for range events when expanded", async () => {
    const user = userEvent.setup();
    render(<Timeline events={events} />);
    await user.click(screen.getByRole("button", { name: /Re-Validierung/ }));
    expect(screen.getByText(/3 Min/)).toBeInTheDocument();
  });

  it("renders an empty state when there are no events", () => {
    render(<Timeline events={[]} />);
    expect(screen.getByText("Keine Ereignisse")).toBeInTheDocument();
  });
});
