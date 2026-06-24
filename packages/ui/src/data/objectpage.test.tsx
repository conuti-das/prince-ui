import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import {
  ObjectPage,
  ObjectPageSection,
  ObjectPageSubSection,
  type ObjectPageHandle,
} from "./objectpage";

/* ---- IntersectionObserver-Mock (jsdom kennt ihn nicht) ---- */
let lastIO: { trigger: (entries: Partial<IntersectionObserverEntry>[]) => void } | null = null;

beforeAll(() => {
  class IOStub {
    cb: IntersectionObserverCallback;
    constructor(cb: IntersectionObserverCallback) {
      this.cb = cb;
      lastIO = {
        trigger: (entries) => this.cb(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver),
      };
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  // @ts-expect-error jsdom global
  globalThis.IntersectionObserver = IOStub;
  // scrollIntoView fehlt in jsdom
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});
});

beforeEach(() => {
  lastIO = null;
});

describe("ObjectPage — Legacy-API (Rückwärtskompat.)", () => {
  it("renders title, subtitle and a status badge", () => {
    render(
      <ObjectPage
        title="TX-10042"
        subtitle="UTILMD · Anmeldung Netznutzung"
        status={{ label: "Fehler", tone: "negative" }}
      />,
    );
    expect(screen.getByRole("heading", { name: "TX-10042", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("UTILMD · Anmeldung Netznutzung")).toBeInTheDocument();
    expect(screen.getByText("Fehler")).toBeInTheDocument();
  });

  it("renders KPI row, actions and section fields via legacy `sections` array", () => {
    render(
      <ObjectPage
        title="TX-10042"
        actions={<button type="button">Erneut senden</button>}
        kpis={[
          { label: "Verarbeitungszeit", value: "1,8 s" },
          { label: "Versuche", value: "3", tone: "critical" },
        ]}
        sections={[
          {
            title: "Stammdaten",
            fields: [
              { label: "Marktpartner", value: "9900123000007" },
              { label: "Sparte", value: "Strom" },
            ],
          },
          {
            title: "Verarbeitung",
            fields: [{ label: "Dauer (ms)", value: "1834", numeric: true }],
          },
        ]}
      >
        <div>Detail-Slot</div>
      </ObjectPage>,
    );

    expect(screen.getByText("Verarbeitungszeit")).toBeInTheDocument();
    expect(screen.getByText("1,8 s")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Erneut senden" })).toBeInTheDocument();
    // Legacy-Sektionstitel werden als heading (role) gerendert
    expect(screen.getByRole("heading", { name: "Stammdaten" })).toBeInTheDocument();
    expect(screen.getByText("Marktpartner")).toBeInTheDocument();
    expect(screen.getByText("9900123000007")).toBeInTheDocument();
    expect(screen.getByText("1834")).toBeInTheDocument();
    expect(screen.getByText("Detail-Slot")).toBeInTheDocument();
  });

  it("renders an anchor-bar tab for each legacy section (>1)", () => {
    render(
      <ObjectPage
        title="X"
        sections={[
          { title: "A", fields: [{ label: "l", value: "v" }] },
          { title: "B", fields: [{ label: "l", value: "v" }] },
        ]}
      />,
    );
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "A" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "B" })).toBeInTheDocument();
  });
});

describe("ObjectPage — A1 Komposition & Navigation", () => {
  const Sample = (props: Partial<React.ComponentProps<typeof ObjectPage>>) => (
    <ObjectPage title="Auftrag" {...props}>
      <ObjectPageSection id="general" titleText="Allgemein">
        <ObjectPageSubSection id="general-info" titleText="Infos">
          <div>Allgemein-Inhalt</div>
        </ObjectPageSubSection>
      </ObjectPageSection>
      <ObjectPageSection id="payment" titleText="Zahlung">
        <div>Zahlung-Inhalt</div>
      </ObjectPageSection>
    </ObjectPage>
  );

  it("renders composed sections and subsections with correct roles", () => {
    render(<Sample />);
    expect(screen.getByRole("region", { name: "Allgemein" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Infos" })).toBeInTheDocument();
    expect(screen.getByText("Allgemein-Inhalt")).toBeInTheDocument();
    expect(screen.getByText("Zahlung-Inhalt")).toBeInTheDocument();
  });

  it("renders an anchor-bar tablist with a tab per section", () => {
    render(<Sample />);
    const tablist = screen.getByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
  });

  it("renders every anchor tab with its visible text label (Overlap-/Clip-Regression)", () => {
    // Regression: bei großem (expandiertem) Header + fester Höhe wurde die
    // Anchor-Bar als Flex-Item auf ~0px zusammengedrückt; nur der grüne
    // Aktiv-Indikator war sichtbar, die Tab-Labels nicht. Wir sichern ab,
    // dass jeder Tab seinen sichtbaren Text-Label trägt (auch bei expandiertem
    // Header mit headerArea + KPIs), nicht nur einen Aktiv-Indikator.
    render(
      <ObjectPage
        title="Auftrag"
        headerArea={<div>Großer Header-Inhalt</div>}
        kpis={[{ label: "Umsatz", value: "1M" }]}
      >
        <ObjectPageSection id="general" titleText="Allgemein">
          <div>Allgemein-Inhalt</div>
        </ObjectPageSection>
        <ObjectPageSection id="payment" titleText="Zahlung">
          <div>Zahlung-Inhalt</div>
        </ObjectPageSection>
      </ObjectPage>,
    );
    const tablist = screen.getByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");
    // Jeder Tab trägt seinen Klartext-Label (sonst wäre nur der Indikator da).
    expect(tabs.map((t) => t.textContent)).toEqual(["Allgemein", "Zahlung"]);
    // Tabs sind per zugänglichem Namen auffindbar → Label-Text vorhanden.
    expect(screen.getByRole("tab", { name: "Allgemein" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Zahlung" })).toBeInTheDocument();
  });

  it("hides the anchor-bar for a single section", () => {
    render(
      <ObjectPage title="Solo">
        <ObjectPageSection id="only" titleText="Einzig">
          <div>X</div>
        </ObjectPageSection>
      </ObjectPage>,
    );
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("clicking a tab selects the section and scrolls to it", async () => {
    const user = userEvent.setup();
    const scrollSpy = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});
    const onChange = vi.fn();
    render(<Sample onSelectedSectionChange={onChange} />);

    await user.click(screen.getByRole("tab", { name: "Zahlung" }));

    expect(onChange).toHaveBeenCalledWith({ selectedSectionIndex: 1, selectedSectionId: "payment" });
    expect(screen.getByRole("tab", { name: "Zahlung" })).toHaveAttribute("aria-selected", "true");
    expect(scrollSpy).toHaveBeenCalled();
    scrollSpy.mockRestore();
  });

  it("respects controlled selectedSectionId", () => {
    render(<Sample selectedSectionId="payment" />);
    expect(screen.getByRole("tab", { name: "Zahlung" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Allgemein" })).toHaveAttribute("aria-selected", "false");
  });

  it("does not change internal selection when onBeforeNavigate cancels", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Sample
        onBeforeNavigate={(d) => d.preventDefault()}
        onSelectedSectionChange={onChange}
      />,
    );
    await user.click(screen.getByRole("tab", { name: "Zahlung" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("tab", { name: "Allgemein" })).toHaveAttribute("aria-selected", "true");
  });

  it("supports arrow-key navigation across tabs", async () => {
    const user = userEvent.setup();
    render(<Sample />);
    const first = screen.getByRole("tab", { name: "Allgemein" });
    first.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Zahlung" })).toHaveAttribute("aria-selected", "true");
  });

  it("scroll-spy highlights the most visible section via IntersectionObserver", () => {
    render(<Sample />);
    expect(lastIO).not.toBeNull();
    const paymentEl = document.querySelector('[data-section-anchor="payment"]') as HTMLElement;
    act(() => {
      lastIO!.trigger([
        { isIntersecting: true, intersectionRatio: 0.9, target: paymentEl } as Partial<IntersectionObserverEntry>,
      ]);
    });
    expect(screen.getByRole("tab", { name: "Zahlung" })).toHaveAttribute("aria-selected", "true");
  });

  it("iconTabBar mode only renders the active section", () => {
    render(<Sample mode="iconTabBar" />);
    expect(screen.getByText("Allgemein-Inhalt")).toBeInTheDocument();
    expect(screen.queryByText("Zahlung-Inhalt")).not.toBeInTheDocument();
  });
});

describe("ObjectPage — A2 Snapping / Header-Area", () => {
  const WithHeader = ({
    forwardedRef,
    ...props
  }: Partial<React.ComponentProps<typeof ObjectPage>> & { forwardedRef?: React.Ref<ObjectPageHandle> }) => (
    <ObjectPage ref={forwardedRef} title="Kunde" headerArea={<div>Header-Detail</div>} {...props}>
      <ObjectPageSection id="s" titleText="S">
        <div>x</div>
      </ObjectPageSection>
    </ObjectPage>
  );

  it("renders headerArea content when expanded", () => {
    render(<WithHeader />);
    expect(screen.getByText("Header-Detail")).toBeInTheDocument();
  });

  it("toggleHeaderArea via imperative ref snaps the header", () => {
    const ref = createRef<ObjectPageHandle>();
    const onToggle = vi.fn();
    render(<WithHeader forwardedRef={ref} onToggleHeaderArea={onToggle} />);
    expect(screen.getByText("Header-Detail")).toBeInTheDocument();

    act(() => ref.current!.toggleHeaderArea(true));
    expect(screen.queryByText("Header-Detail")).not.toBeInTheDocument();
    expect(onToggle).toHaveBeenCalledWith(false); // visible = false when snapped
  });

  it("clicking the title toggles header (unless preserveHeaderStateOnClick)", async () => {
    const user = userEvent.setup();
    render(<WithHeader />);
    await user.click(screen.getByRole("heading", { name: "Kunde", level: 1 }));
    expect(screen.queryByText("Header-Detail")).not.toBeInTheDocument();
  });

  it("preserveHeaderStateOnClick keeps the header on title click", async () => {
    const user = userEvent.setup();
    render(<WithHeader preserveHeaderStateOnClick />);
    await user.click(screen.getByRole("heading", { name: "Kunde", level: 1 }));
    expect(screen.getByText("Header-Detail")).toBeInTheDocument();
  });

  it("renders a pin button and fires onPinButtonToggle", async () => {
    const user = userEvent.setup();
    const onPin = vi.fn();
    render(<WithHeader onPinButtonToggle={onPin} />);
    const pin = screen.getByRole("button", { name: /anheften/i });
    await user.click(pin);
    expect(onPin).toHaveBeenCalledWith(true);
  });

  it("hidePinButton removes the pin button", () => {
    render(<WithHeader hidePinButton />);
    expect(screen.queryByRole("button", { name: /anheften|lösen/i })).not.toBeInTheDocument();
  });
});

describe("ObjectPage — A3 Title-Bereich", () => {
  it("renders breadcrumbs, navigationBar and KPIs", () => {
    render(
      <ObjectPage
        title="T"
        breadcrumbs={<nav>Pfad</nav>}
        navigationBar={<button type="button">Weiter</button>}
        kpis={[{ label: "Umsatz", value: "1M" }]}
      />,
    );
    expect(screen.getByText("Pfad")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Weiter" })).toBeInTheDocument();
    expect(screen.getByText("Umsatz")).toBeInTheDocument();
  });

  it("shows snappedHeader text once snapped via ref", () => {
    const ref = createRef<ObjectPageHandle>();
    render(
      <ObjectPage
        ref={ref}
        title="Expanded-Titel"
        snappedHeader="Snapped-Titel"
        headerArea={<div>h</div>}
      >
        <ObjectPageSection id="s" titleText="S">
          <div>x</div>
        </ObjectPageSection>
      </ObjectPage>,
    );
    expect(screen.getByRole("heading", { name: "Expanded-Titel", level: 1 })).toBeInTheDocument();
    act(() => ref.current!.toggleHeaderArea(true));
    expect(screen.getByRole("heading", { name: "Snapped-Titel", level: 1 })).toBeInTheDocument();
  });
});

describe("ObjectPage — A4 Medien / Footer / Placeholder", () => {
  it("renders an image from a URL string with circle shape", () => {
    const { container } = render(
      <ObjectPage title="T" image="https://x/y.png" imageShapeCircle>
        <ObjectPageSection id="s" titleText="S">
          <div>x</div>
        </ObjectPageSection>
      </ObjectPage>,
    );
    const img = container.querySelector(".prn-op-image-img") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://x/y.png");
    expect(container.querySelector(".prn-op-image")).toHaveAttribute("data-circle", "");
  });

  it("renders a footerArea", () => {
    render(
      <ObjectPage title="T" footerArea={<button type="button">Speichern</button>}>
        <ObjectPageSection id="s" titleText="S">
          <div>x</div>
        </ObjectPageSection>
      </ObjectPage>,
    );
    expect(screen.getByRole("button", { name: "Speichern" })).toBeInTheDocument();
  });

  it("renders placeholder instead of section content", () => {
    render(
      <ObjectPage title="T" placeholder={<div>Nicht ladbar</div>}>
        <ObjectPageSection id="s" titleText="S">
          <div>Eigentlicher-Inhalt</div>
        </ObjectPageSection>
      </ObjectPage>,
    );
    expect(screen.getByText("Nicht ladbar")).toBeInTheDocument();
    expect(screen.queryByText("Eigentlicher-Inhalt")).not.toBeInTheDocument();
  });
});

describe("ObjectPage — A5/A6 Section-Detailprops & A11y", () => {
  it("titleTextLevel maps to the correct aria-level", () => {
    render(
      <ObjectPage title="T">
        <ObjectPageSection id="s" titleText="Stufe2" titleTextLevel="H2">
          <div>x</div>
        </ObjectPageSection>
        <ObjectPageSection id="s2" titleText="Stufe5" titleTextLevel="H5">
          <div>y</div>
        </ObjectPageSection>
      </ObjectPage>,
    );
    expect(screen.getByRole("heading", { name: "Stufe2", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Stufe5", level: 5 })).toBeInTheDocument();
  });

  it("hideTitleText hides the visible section heading but keeps region label", () => {
    render(
      <ObjectPage title="T">
        <ObjectPageSection id="s" titleText="Versteckt" hideTitleText>
          <div>x</div>
        </ObjectPageSection>
        <ObjectPageSection id="s2" titleText="Sichtbar">
          <div>y</div>
        </ObjectPageSection>
      </ObjectPage>,
    );
    expect(screen.queryByRole("heading", { name: "Versteckt" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Versteckt" })).toBeInTheDocument();
  });

  it("renders SubSection actions", () => {
    render(
      <ObjectPage title="T">
        <ObjectPageSection id="s" titleText="S">
          <ObjectPageSubSection id="ss" titleText="Sub" actions={<button type="button">Edit</button>}>
            <div>x</div>
          </ObjectPageSubSection>
        </ObjectPageSection>
      </ObjectPage>,
    );
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("applies accessibilityAttributes to anchor-bar and forwards className/style", () => {
    const { container } = render(
      <ObjectPage
        title="T"
        className="custom-op"
        style={{ maxWidth: 800 }}
        accessibilityAttributes={{ objectPageAnchorBar: { "aria-label": "Bereiche" } }}
      >
        <ObjectPageSection id="a" titleText="A">
          <div>x</div>
        </ObjectPageSection>
        <ObjectPageSection id="b" titleText="B">
          <div>y</div>
        </ObjectPageSection>
      </ObjectPage>,
    );
    expect(screen.getByRole("tablist", { name: "Bereiche" })).toBeInTheDocument();
    const root = container.querySelector(".prn-objectpage") as HTMLElement;
    expect(root).toHaveClass("custom-op");
    expect(root.style.maxWidth).toBe("800px");
  });
});
