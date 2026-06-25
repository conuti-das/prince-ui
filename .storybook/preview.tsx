import type { Preview, Decorator } from "@storybook/react";
import { I18nProvider } from "react-aria-components";
import "@conuti-das/prince-ui-tokens/tokens.css";
import "./prince-ui-all.css";
import theme from "./theme";

/** Theme-Umschalter in der Storybook-Toolbar (System, Prince Dark/Light, CU) + deutsche Locale,
 *  damit Datums-/Zeit-/Kalender-Komponenten TT.MM.JJJJ und deutsche Wochentage zeigen.
 *  Default = "system": folgt prefers-color-scheme (Prince Light bei OS-Light, sonst Prince Dark). */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme as string;
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
  document.body.style.background = "var(--prn-bg)";
  document.body.style.color = "var(--prn-label)";
  document.body.style.fontFamily = "var(--prn-font)";
  return (
    <I18nProvider locale="de-DE">
      <div style={{ padding: "12px 20px", boxSizing: "border-box" }}>
        <Story />
      </div>
    </I18nProvider>
  );
};

const preview: Preview = {
  // Autodocs global aktivieren → jede Komponenten-Gruppe bekommt eine
  // automatisch generierte „Docs"-Seite (inkl. der geerbten/re-exportierten Teile).
  tags: ["autodocs"],
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Prince-Theme",
      defaultValue: "system",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "system", title: "System (Auto)" },
          { value: "dark", title: "Prince Dark" },
          { value: "light", title: "Prince Light" },
          { value: "cu", title: "CU (Community)" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: "fullscreen",
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    docs: { theme },
    options: {
      storySort: { order: ["Foundations", "Components"], method: "alphabetical" },
    },
  },
};

export default preview;
