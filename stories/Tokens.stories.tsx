import type { Meta, StoryObj } from "@storybook/react";

/**
 * Lebende Doku der Design-Tokens — der „Showcase im Netz".
 * Liest direkt die CSS-Custom-Properties aus prince-ui-tokens.
 */
const meta: Meta = {
  title: "Foundations/Design Tokens",
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj;

const Swatch = ({ name }: { name: string }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <div
      style={{
        height: 56,
        borderRadius: "var(--prn-radius-md)",
        background: `var(${name})`,
        border: "1px solid var(--prn-separator)",
        boxShadow: "var(--prn-shadow)",
      }}
    />
    <code style={{ font: "var(--prn-text-caption)", color: "var(--prn-label-2)" }}>{name}</code>
  </div>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
      gap: 16,
      marginBottom: 32,
    }}
  >
    {children}
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h2 style={{ font: "var(--prn-text-title)", color: "var(--prn-label)", margin: "8px 0 16px" }}>
      {title}
    </h2>
    {children}
  </section>
);

export const Colors: Story = {
  render: () => (
    <div style={{ padding: 8 }}>
      <Section title="Akzent (Lime)">
        <Grid>
          {["--prn-accent", "--prn-accent-strong", "--prn-accent-hover", "--prn-accent-soft"].map(
            (n) => (
              <Swatch key={n} name={n} />
            )
          )}
        </Grid>
      </Section>
      <Section title="Flächen">
        <Grid>
          {["--prn-bg", "--prn-bg-elevated", "--prn-bg-head", "--prn-fill", "--prn-fill-strong"].map(
            (n) => (
              <Swatch key={n} name={n} />
            )
          )}
        </Grid>
      </Section>
      <Section title="Semantik">
        <Grid>
          {["--prn-green", "--prn-red", "--prn-orange", "--prn-yellow", "--prn-blue", "--prn-teal", "--prn-neutral"].map(
            (n) => (
              <Swatch key={n} name={n} />
            )
          )}
        </Grid>
      </Section>
      <Section title="Chart-Palette">
        <Grid>
          {["--prn-chart-1", "--prn-chart-2", "--prn-chart-3", "--prn-chart-4", "--prn-chart-5", "--prn-chart-6", "--prn-chart-7", "--prn-chart-8"].map(
            (n) => (
              <Swatch key={n} name={n} />
            )
          )}
        </Grid>
      </Section>
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div style={{ padding: 8, color: "var(--prn-label)" }}>
      {[
        ["--prn-text-large-title", "Large Title"],
        ["--prn-text-title", "Title"],
        ["--prn-text-title-3", "Title 3"],
        ["--prn-text-headline", "Headline"],
        ["--prn-text-body", "Body — Marktkommunikation in der Energiewirtschaft"],
        ["--prn-text-callout", "Callout"],
        ["--prn-text-subhead", "Subhead"],
        ["--prn-text-footnote", "Footnote"],
        ["--prn-text-caption", "Caption"],
      ].map(([token, label]) => (
        <div key={token} style={{ marginBottom: 12 }}>
          <div style={{ font: `var(${token})` }}>{label}</div>
          <code style={{ font: "var(--prn-text-caption)", color: "var(--prn-label-3)" }}>{token}</code>
        </div>
      ))}
    </div>
  ),
};

export const RadiusAndShadow: Story = {
  render: () => (
    <div style={{ padding: 8 }}>
      <Section title="Radien">
        <Grid>
          {["--prn-radius-sm", "--prn-radius-md", "--prn-radius", "--prn-radius-lg", "--prn-radius-xl"].map(
            (n) => (
              <div key={n} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{
                    height: 56,
                    borderRadius: `var(${n})`,
                    background: "var(--prn-bg-elevated)",
                    border: "var(--prn-card-border)",
                    boxShadow: "var(--prn-shadow)",
                  }}
                />
                <code style={{ font: "var(--prn-text-caption)", color: "var(--prn-label-2)" }}>{n}</code>
              </div>
            )
          )}
        </Grid>
      </Section>
    </div>
  ),
};
